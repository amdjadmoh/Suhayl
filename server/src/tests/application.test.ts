import { describe, it, expect, beforeAll, afterAll } from "vitest"
import request from "supertest"
import type express from "express"
import {
  startMemoryServer,
  stopMemoryServer,
  seedTestData,
  createTestApp,
} from "./setup"

let app: express.Application
let token: string
let programId: string

beforeAll(async () => {
  await startMemoryServer()
  const seed = await seedTestData()
  app = await createTestApp()

  // Login as the seeded student user
  const loginRes = await request(app)
    .post("/api/auth/login")
    .send({ email: "test@example.com", password: "password123" })
  token = loginRes.body.token as string
  programId = String(seed["program"]["_id"])
})

afterAll(async () => {
  await stopMemoryServer()
})

describe("POST /api/applications", () => {
  it("returns 401 without a token", async () => {
    const res = await request(app)
      .post("/api/applications")
      .send({
        programId,
        studentName: "Test Student",
        studentEmail: "student@test.com",
      })
    expect(res.status).toBe(401)
  })

  it("returns 201 with a valid token", async () => {
    const res = await request(app)
      .post("/api/applications")
      .set("Authorization", `Bearer ${token}`)
      .send({
        programId,
        studentName: "Test Student",
        studentEmail: "student@test.com",
      })

    expect(res.status).toBe(201)
    expect(res.body).toBeDefined()
    expect(res.body.studentName).toBe("Test Student")
    expect(res.body.studentEmail).toBe("student@test.com")
    // Should have auto-populated applicationProgress
    expect(res.body.applicationProgress).toBeDefined()
  })

  it("returns 400 with an unknown field (Zod strict)", async () => {
    const res = await request(app)
      .post("/api/applications")
      .set("Authorization", `Bearer ${token}`)
      .send({
        programId,
        studentName: "Test Student",
        studentEmail: "student@test.com",
        unknownField: "should be rejected",
      })
    expect(res.status).toBe(400)
    expect(res.body.message).toBe("Validation failed")
  })

  it("returns 404 when programId does not exist", async () => {
    const fakeId = "000000000000000000000000"
    const res = await request(app)
      .post("/api/applications")
      .set("Authorization", `Bearer ${token}`)
      .send({
        programId: fakeId,
        studentName: "Ghost",
        studentEmail: "ghost@test.com",
      })
    expect(res.status).toBe(404)
    expect(res.body.message).toBe("Program not found")
  })
})

describe("GET /api/applications", () => {
  it("returns 401 without a token (the leak fix from item 1)", async () => {
    const res = await request(app).get("/api/applications")
    expect(res.status).toBe(401)
  })

  it("returns the authenticated user's applications", async () => {
    // We already created one application above — fetch it
    const res = await request(app)
      .get("/api/applications")
      .set("Authorization", `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.applications).toBeDefined()
    expect(Array.isArray(res.body.applications)).toBe(true)
    expect(res.body.total).toBeGreaterThanOrEqual(1)
    // Verify the returned application belongs to this user
    const app1 = res.body.applications[0] as Record<string, unknown>
    expect(app1["studentName"]).toBe("Test Student")
  })
})
