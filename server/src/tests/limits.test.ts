import { describe, it, expect, beforeAll, afterAll } from "vitest"
import request from "supertest"
import jwt from "jsonwebtoken"
import crypto from "crypto"
import type express from "express"
import { startMemoryServer, stopMemoryServer, seedTestData, createRealApp, signUp } from "./setup"

let app: express.Express

beforeAll(async () => {
  await startMemoryServer()
  await seedTestData()
})

afterAll(async () => {
  await stopMemoryServer()
})

const randomId = (): string => crypto.randomBytes(12).toString("hex")

describe("rate limit keys", () => {
  it("a fresh forged token per request doesn't get a fresh allowance", async () => {
    app = await createRealApp()
    let limited = false
    for (let i = 0; i < 320 && !limited; i++) {
      const forged = jwt.sign({ _id: randomId(), role: "student", v: 0 }, "not-the-server-secret-but-long-enough")
      const res = await request(app).get("/api/countries").set("Authorization", `Bearer ${forged}`)
      limited = res.status === 429
    }
    expect(limited).toBe(true)
  })

  it("a validly signed token for a user that doesn't exist counts as anonymous", async () => {
    app = await createRealApp()
    const ghost = jwt.sign({ _id: randomId(), role: "student", v: 0 }, process.env["JWT_SECRET"]!)
    let status = 0
    for (let i = 0; i < 301; i++) status = (await request(app).get("/api/countries").set("Authorization", `Bearer ${ghost}`)).status
    expect(status).toBe(429)
  })

  it("a real signed-in user gets their own, larger allowance", async () => {
    app = await createRealApp()
    const s = await signUp(app, "student", "limits-real@test.local")
    let status = 0
    for (let i = 0; i < 310; i++) status = (await request(app).get("/api/countries").set("Authorization", `Bearer ${s.token}`)).status
    expect(status).toBe(200)
  })
})

describe("dedicated limiters", () => {
  it("forgot-password: 3 emails per address an hour", async () => {
    app = await createRealApp()
    const send = () => request(app).post("/api/auth/forgot-password").send({ email: "victim@test.local" })
    for (let i = 0; i < 3; i++) expect((await send()).status).toBe(200)
    expect((await send()).status).toBe(429)
  })

  it("forgot-password: 5 requests per IP an hour across addresses", async () => {
    app = await createRealApp()
    for (let i = 0; i < 5; i++) expect((await request(app).post("/api/auth/forgot-password").send({ email: `n${i}@test.local` })).status).toBe(200)
    expect((await request(app).post("/api/auth/forgot-password").send({ email: "n9@test.local" })).status).toBe(429)
  })

  it("reset-password: guessing tokens is cut off", async () => {
    app = await createRealApp()
    let status = 0
    for (let i = 0; i < 11; i++) status = (await request(app).post("/api/auth/reset-password").send({ token: randomId(), password: "Whatever-123" })).status
    expect(status).toBe(429)
  })

  it("/auth/google is limited", async () => {
    app = await createRealApp()
    let status = 0
    for (let i = 0; i < 21; i++) status = (await request(app).post("/api/auth/google").send({ credential: "x" })).status
    expect(status).toBe(429)
  })

  it("team invite links are limited", async () => {
    app = await createRealApp()
    let status = 0
    for (let i = 0; i < 21; i++) status = (await request(app).get(`/api/auth/invite/${randomId()}`)).status
    expect(status).toBe(429)
  })

  it("public recommendation pages are limited", async () => {
    app = await createRealApp()
    let status = 0
    for (let i = 0; i < 31; i++) status = (await request(app).get(`/api/recommendations/public/${randomId()}`)).status
    expect(status).toBe(429)
  })

  it("sending recommendation requests is limited per user", async () => {
    app = await createRealApp()
    const s = await signUp(app, "student", "limits-rec@test.local")
    let status = 0
    for (let i = 0; i < 21; i++) status = (await request(app).post("/api/recommendations").set("Authorization", `Bearer ${s.token}`).send({})).status
    expect(status).toBe(429)
  })
})
