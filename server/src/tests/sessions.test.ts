import { describe, it, expect, beforeAll, afterAll } from "vitest"
import request from "supertest"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import type express from "express"
import { startMemoryServer, stopMemoryServer, seedTestData, createRealApp, signUp } from "./setup"

let app: express.Express
let adminToken: string
const PASSWORD = "Passw0rd-long"
const auth = (t: string): [string, string] => ["Authorization", `Bearer ${t}`]

beforeAll(async () => {
  await startMemoryServer()
  await seedTestData()
  app = await createRealApp()
  const { User } = await import("../models/User.js")
  await User.create({ email: "admin@sessions.test", passwordHash: await bcrypt.hash(PASSWORD, 10), name: "Admin", role: "admin" })
  adminToken = (await request(app).post("/api/auth/login").send({ email: "admin@sessions.test", password: PASSWORD })).body.token
})

afterAll(async () => {
  await stopMemoryServer()
})

describe("forged and stale tokens", () => {
  it("rejects an admin token signed with a guessed secret", async () => {
    const { User } = await import("../models/User.js")
    const admin = await User.findOne({ email: "admin@sessions.test" })
    for (const secret of ["", "change_me_to_a_random_secret", "secret", "test-secret-for-vitest-only"]) {
      const forged = jwt.sign({ _id: String(admin!._id), role: "admin", v: 0 }, secret || "x")
      expect((await request(app).get("/api/admin/users").set(...auth(forged))).status).toBe(401)
    }
  })

  it("rejects a correctly signed token whose role no longer matches the account", async () => {
    const s = await signUp(app, "student", "role-claim@sessions.test")
    const claimsAdmin = jwt.sign({ _id: s.id, role: "admin", v: 0 }, process.env["JWT_SECRET"]!)
    expect((await request(app).get("/api/admin/users").set(...auth(claimsAdmin))).status).toBe(401)
  })

  it("rejects a token issued before versions existed", async () => {
    const s = await signUp(app, "student", "no-version@sessions.test")
    const legacy = jwt.sign({ _id: s.id, role: "student" }, process.env["JWT_SECRET"]!)
    expect((await request(app).get("/api/auth/me").set(...auth(legacy))).status).toBe(401)
  })

  it("rejects the token of a user an admin deleted", async () => {
    const s = await signUp(app, "student", "deleted-by-admin@sessions.test")
    expect((await request(app).delete(`/api/admin/users/${s.id}`).set(...auth(adminToken))).status).toBe(200)
    expect((await request(app).get("/api/auth/me").set(...auth(s.token))).status).toBe(401)
  })

  it("rejects the token of a deleted admin", async () => {
    const { User } = await import("../models/User.js")
    await User.create({ email: "admin2@sessions.test", passwordHash: await bcrypt.hash(PASSWORD, 10), name: "Admin 2", role: "admin" })
    const login = await request(app).post("/api/auth/login").send({ email: "admin2@sessions.test", password: PASSWORD })
    expect((await request(app).delete(`/api/admin/users/${login.body.user._id}`).set(...auth(adminToken))).status).toBe(200)
    expect((await request(app).get("/api/admin/users").set(...auth(login.body.token))).status).toBe(401)
  })
})

describe("revocation", () => {
  it("a password change ends other sessions and returns a working token", async () => {
    const s = await signUp(app, "student", "change-pw@sessions.test")
    const res = await request(app).put("/api/auth/password").set(...auth(s.token)).send({ currentPassword: PASSWORD, newPassword: "An0ther-passw0rd" })
    expect(res.status).toBe(200)
    expect((await request(app).get("/api/auth/me").set(...auth(s.token))).status).toBe(401)
    expect((await request(app).get("/api/auth/me").set(...auth(res.body.token))).status).toBe(200)
  })

  it("a password reset ends every session, and the reset link works once", async () => {
    const s = await signUp(app, "student", "reset-pw@sessions.test")
    const { PasswordResetToken } = await import("../models/PasswordResetToken.js")
    const { hashToken } = await import("../services/tokens.js")
    const raw = crypto.randomBytes(32).toString("hex")
    await PasswordResetToken.create({ userId: s.id as never, token: hashToken(raw), expiresAt: new Date(Date.now() + 60_000) })
    const reset = await request(app).post("/api/auth/reset-password").send({ token: raw, password: "Reset-passw0rd" })
    expect(reset.status).toBe(200)
    expect((await request(app).get("/api/auth/me").set(...auth(s.token))).status).toBe(401)
    expect((await request(app).post("/api/auth/reset-password").send({ token: raw, password: "Again-passw0rd" })).status).toBe(400)
  })

  it("stores reset tokens hashed, so the stored value is not a working link", async () => {
    await signUp(app, "student", "hashed-reset@sessions.test")
    expect((await request(app).post("/api/auth/forgot-password").send({ email: "hashed-reset@sessions.test" })).status).toBe(200)
    const { PasswordResetToken } = await import("../models/PasswordResetToken.js")
    const { User } = await import("../models/User.js")
    const user = await User.findOne({ email: "hashed-reset@sessions.test" })
    const stored = await PasswordResetToken.findOne({ userId: user!._id as never })
    expect(stored!.token).toMatch(/^[0-9a-f]{64}$/)
    expect((await request(app).post("/api/auth/reset-password").send({ token: stored!.token, password: "Stolen-passw0rd" })).status).toBe(400)
  })

  it("a role change by an admin ends the person's sessions", async () => {
    const s = await signUp(app, "student", "role-change@sessions.test")
    expect((await request(app).put(`/api/admin/users/${s.id}`).set(...auth(adminToken)).send({ role: "agency" })).status).toBe(200)
    expect((await request(app).get("/api/auth/me").set(...auth(s.token))).status).toBe(401)
  })

  it("a counsellor removed from the team loses access straight away", async () => {
    const owner = await signUp(app, "agency", "owner@sessions.test")
    const invite = await request(app).post("/api/agency/team").set(...auth(owner.token)).send({ name: "Karima", email: "karima@sessions.test" })
    expect(invite.status).toBe(201)
    const joined = await request(app).post(`/api/auth/invite/${invite.body.inviteToken}`).send({ name: "Karima", password: PASSWORD })
    expect(joined.status).toBe(200)
    expect((await request(app).get("/api/students").set(...auth(joined.body.token))).status).toBe(200)
    expect((await request(app).delete(`/api/agency/team/${invite.body._id}`).set(...auth(owner.token))).status).toBe(200)
    expect((await request(app).get("/api/students").set(...auth(joined.body.token))).status).toBe(401)
  })

  it("optionalAuth drops a revoked token and treats the caller as anonymous", async () => {
    const s = await signUp(app, "student", "optional@sessions.test")
    const priv = await request(app).post("/api/programs").set(...auth(s.token)).send({ name: "Private Program", universityId: String((await (await import("../models/University.js")).University.findOne())!._id), degreeLevel: "Master", tuitionFee: 0 })
    expect(priv.status).toBe(201)
    const changed = await request(app).put("/api/auth/password").set(...auth(s.token)).send({ currentPassword: PASSWORD, newPassword: "An0ther-passw0rd" })
    const asRevoked = await request(app).get("/api/programs").set(...auth(s.token))
    expect(asRevoked.status).toBe(200)
    expect(JSON.stringify(asRevoked.body)).not.toContain("Private Program")
    const asCurrent = await request(app).get("/api/programs").set(...auth(changed.body.token))
    expect(JSON.stringify(asCurrent.body)).toContain("Private Program")
  })
})
