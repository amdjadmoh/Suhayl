import { describe, it, expect, beforeAll, afterAll, vi } from "vitest"
import request from "supertest"
import bcrypt from "bcryptjs"
import type express from "express"
import { startMemoryServer, stopMemoryServer, seedTestData, createRealApp, signUp } from "./setup"

// Google is faked: the "credential" is the JSON payload Google would have vouched for
vi.hoisted(() => {
  process.env["GOOGLE_CLIENT_ID"] = "test-client.apps.googleusercontent.com"
})
vi.mock("google-auth-library", () => ({
  OAuth2Client: class {
    async verifyIdToken({ idToken }: { idToken: string }) {
      const payload = JSON.parse(idToken) as Record<string, unknown>
      return { getPayload: () => payload }
    }
  },
}))

let app: express.Express
const PASSWORD = "Passw0rd-long"
const auth = (t: string): [string, string] => ["Authorization", `Bearer ${t}`]
const google = (payload: Record<string, unknown>) => request(app).post("/api/auth/google").send({ credential: JSON.stringify(payload) })

beforeAll(async () => {
  await startMemoryServer()
  await seedTestData()
  app = await createRealApp()
})

afterAll(async () => {
  await stopMemoryServer()
})

describe("Google sign-in", () => {
  it("refuses an address Google hasn't verified", async () => {
    expect((await google({ sub: "g-1", email: "new@test.local", name: "New", email_verified: false })).status).toBe(401)
    expect((await google({ sub: "g-1", email: "new@test.local", name: "New" })).status).toBe(401)
  })

  it("refuses an incomplete payload", async () => {
    expect((await google({ email: "new@test.local", email_verified: true })).status).toBe(401)
    expect((await google({ sub: "g-2", email_verified: true })).status).toBe(401)
  })

  it("creates a student for a new verified address", async () => {
    const res = await google({ sub: "g-3", email: "fresh@test.local", name: "Fresh", email_verified: true })
    expect(res.status).toBe(200)
    expect(res.body.user.role).toBe("student")
  })

  it("never takes over an existing password account", async () => {
    const victim = await signUp(app, "agency", "victim@test.local")
    const res = await google({ sub: "attacker-sub", email: "victim@test.local", name: "Attacker", email_verified: true })
    expect(res.status).toBe(409)
    expect(res.body.token).toBeUndefined()
    const { User } = await import("../models/User.js")
    expect((await User.findById(victim.id).select("+googleId"))!.googleId).toBeUndefined()
  })

  it("an invited counsellor can join with Google, which spends the invite", async () => {
    const owner = await signUp(app, "agency", "g-owner@test.local")
    const invite = await request(app).post("/api/agency/team").set(...auth(owner.token)).send({ name: "Sami", email: "sami@test.local" })
    expect(invite.status).toBe(201)
    const res = await google({ sub: "g-sami", email: "sami@test.local", name: "Sami", email_verified: true })
    expect(res.status).toBe(200)
    expect(res.body.user.role).toBe("agency")
    expect((await request(app).get(`/api/auth/invite/${invite.body.inviteToken}`)).status).toBe(404)
  })
})

describe("team invites", () => {
  let owner: { token: string; id: string }
  beforeAll(async () => {
    owner = await signUp(app, "agency", "inv-owner@test.local")
  })

  it("an invite expires", async () => {
    const invite = await request(app).post("/api/agency/team").set(...auth(owner.token)).send({ name: "Lina", email: "lina@test.local" })
    const { User } = await import("../models/User.js")
    await User.updateOne({ _id: invite.body._id }, { $set: { inviteExpiresAt: new Date(Date.now() - 1000) } })
    expect((await request(app).get(`/api/auth/invite/${invite.body.inviteToken}`)).status).toBe(410)
    expect((await request(app).post(`/api/auth/invite/${invite.body.inviteToken}`).send({ name: "Lina", password: PASSWORD })).status).toBe(410)
  })

  it("accepting clears the invite, so the link works once", async () => {
    const invite = await request(app).post("/api/agency/team").set(...auth(owner.token)).send({ name: "Yanis", email: "yanis@test.local" })
    expect((await request(app).post(`/api/auth/invite/${invite.body.inviteToken}`).send({ name: "Yanis", password: PASSWORD })).status).toBe(200)
    expect((await request(app).post(`/api/auth/invite/${invite.body.inviteToken}`).send({ name: "Evil", password: "Other-passw0rd" })).status).toBe(404)
    expect((await request(app).post("/api/auth/login").send({ email: "yanis@test.local", password: PASSWORD })).status).toBe(200)
  })

  it("renewing an invite can't reset the password of someone who joined", async () => {
    const invite = await request(app).post("/api/agency/team").set(...auth(owner.token)).send({ name: "Nour", email: "nour@test.local" })
    await request(app).post(`/api/auth/invite/${invite.body.inviteToken}`).send({ name: "Nour", password: PASSWORD })
    const renew = await request(app).post(`/api/agency/team/${invite.body._id}/invite`).set(...auth(owner.token))
    expect(renew.status).toBe(409)
    expect(renew.body.inviteToken).toBeUndefined()
  })

  it("a joined counsellor gets a real reset link instead, which ends their sessions", async () => {
    const invite = await request(app).post("/api/agency/team").set(...auth(owner.token)).send({ name: "Rania", email: "rania@test.local" })
    const joined = await request(app).post(`/api/auth/invite/${invite.body.inviteToken}`).send({ name: "Rania", password: PASSWORD })
    const reset = await request(app).post(`/api/agency/team/${invite.body._id}/password-reset`).set(...auth(owner.token))
    expect(reset.status).toBe(200)
    const token = new URL(reset.body.resetUrl).searchParams.get("token")!
    expect((await request(app).post("/api/auth/reset-password").send({ token, password: "Fresh-passw0rd" })).status).toBe(200)
    expect((await request(app).get("/api/auth/me").set(...auth(joined.body.token))).status).toBe(401)
    expect((await request(app).post("/api/auth/login").send({ email: "rania@test.local", password: "Fresh-passw0rd" })).status).toBe(200)
  })

  it("a password reset spends a pending invite", async () => {
    const invite = await request(app).post("/api/agency/team").set(...auth(owner.token)).send({ name: "Adam", email: "adam@test.local" })
    const { PasswordResetToken } = await import("../models/PasswordResetToken.js")
    const { hashToken } = await import("../services/tokens.js")
    const { User } = await import("../models/User.js")
    // A pending counsellor with a password set out of band (e.g. by an admin) resetting it
    await User.updateOne({ _id: invite.body._id }, { $set: { passwordHash: await bcrypt.hash(PASSWORD, 10) } })
    await PasswordResetToken.create({ userId: invite.body._id as never, token: hashToken("r".repeat(40)), expiresAt: new Date(Date.now() + 60_000) })
    expect((await request(app).post("/api/auth/reset-password").send({ token: "r".repeat(40), password: "Fresh-passw0rd" })).status).toBe(200)
    expect((await User.findById(invite.body._id).select("+inviteToken"))!.inviteToken).toBeUndefined()
  })
})
