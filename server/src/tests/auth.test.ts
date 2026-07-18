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

beforeAll(async () => {
  await startMemoryServer()
  await seedTestData()
  app = await createTestApp()
})

afterAll(async () => {
  await stopMemoryServer()
})

describe("POST /api/auth/register", () => {
  it("registers a new user and returns token + user without passwordHash", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        email: "newuser@test.com",
        password: "password123",
        name: "New User",
        role: "student",
      })

    expect(res.status).toBe(201)
    expect(res.body.token).toBeDefined()
    expect(typeof res.body.token).toBe("string")
    expect(res.body.user).toBeDefined()
    expect(res.body.user.email).toBe("newuser@test.com")
    expect(res.body.user.name).toBe("New User")
    expect(res.body.user.role).toBe("student")
    // passwordHash must NOT be in the response
    expect(res.body.user.passwordHash).toBeUndefined()
  })

  it("rejects a bad email with 400 (Zod validation)", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        email: "not-an-email",
        password: "password123",
        name: "Bad Email",
        role: "student",
      })

    expect(res.status).toBe(400)
    expect(res.body.message).toBe("Validation failed")
  })

  it("rejects an unknown field with 400 (Zod strict)", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        email: "valid@test.com",
        password: "password123",
        name: "Strict Test",
        role: "student",
        unknownField: "should fail",
      })

    expect(res.status).toBe(400)
    expect(res.body.message).toBe("Validation failed")
  })

  it("rejects a duplicate email with 409", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        email: "test@example.com",
        password: "password123",
        name: "Duplicate",
        role: "student",
      })

    expect(res.status).toBe(409)
    expect(res.body.message).toBe("Email already registered")
  })
})

describe("POST /api/auth/login", () => {
  it("logs in with correct credentials and returns token without passwordHash", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "test@example.com", password: "password123" })

    expect(res.status).toBe(200)
    expect(res.body.token).toBeDefined()
    expect(typeof res.body.token).toBe("string")
    expect(res.body.user).toBeDefined()
    expect(res.body.user.email).toBe("test@example.com")
    expect(res.body.user.passwordHash).toBeUndefined()
  })

  it("returns 401 with wrong password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "test@example.com", password: "wrongpassword" })

    expect(res.status).toBe(401)
  })

  it("returns 401 for non-existent user", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "nobody@test.com", password: "password123" })

    expect(res.status).toBe(401)
  })
})

describe("GET /api/auth/me", () => {
  it("returns the authenticated user without passwordHash", async () => {
    // First login to get a token
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "test@example.com", password: "password123" })

    const token = loginRes.body.token as string

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.user).toBeDefined()
    expect(res.body.user.email).toBe("test@example.com")
    expect(res.body.user.name).toBe("Test User")
    expect(res.body.user.passwordHash).toBeUndefined()
  })

  it("returns 401 without a token", async () => {
    const res = await request(app).get("/api/auth/me")
    expect(res.status).toBe(401)
  })

  it("returns 401 with an invalid token", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer invalid-token")

    expect(res.status).toBe(401)
  })
})
