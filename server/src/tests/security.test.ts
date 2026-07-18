import { describe, it, expect, beforeAll, afterAll } from "vitest"
import request from "supertest"
import type express from "express"
import {
  startMemoryServer,
  stopMemoryServer,
  createTestApp,
} from "./setup"

let app: express.Application

beforeAll(async () => {
  await startMemoryServer()
  app = await createTestApp()
})

afterAll(async () => {
  await stopMemoryServer()
})

describe("Helmet security headers", () => {
  it("sets X-Content-Type-Options: nosniff", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "x@test.com", password: "x" })
    expect(res.headers["x-content-type-options"]).toBe("nosniff")
  })

  it("sets X-DNS-Prefetch-Control: off", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "x@test.com", password: "x" })
    expect(res.headers["x-dns-prefetch-control"]).toBe("off")
  })

  it("sets X-Frame-Options: SAMEORIGIN", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "x@test.com", password: "x" })
    expect(res.headers["x-frame-options"]).toBe("SAMEORIGIN")
  })
})

describe("CORS", () => {
  it("rejects requests from http://evil.com", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .set("Origin", "http://evil.com")
      .send({ email: "x@test.com", password: "x" })
    // evil.com is not in the allowed origins, so the CORS header
    // should NOT be set
    expect(res.headers["access-control-allow-origin"]).toBeUndefined()
  })

  it("allows requests from http://localhost:5173", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .set("Origin", "http://localhost:5173")
      .send({ email: "x@test.com", password: "x" })
    // The cors middleware echoes back the matching origin
    expect(res.headers["access-control-allow-origin"]).toBe(
      "http://localhost:5173"
    )
  })
})

describe("Rate limiting", () => {
  it("returns 429 after 10 failed login attempts within 15 minutes", async () => {
    // Fresh app so the rate-limiter state is clean
    const rateLimitApp = await createTestApp()

    for (let i = 0; i < 11; i++) {
      const res = await request(rateLimitApp)
        .post("/api/auth/login")
        .send({ email: "ratelimit@test.com", password: "wrongpassword" })

      if (i < 10) {
        // First 10 attempts: 401 (invalid credentials)
        expect(res.status).toBe(401)
      } else {
        // 11th attempt: 429 (rate limited)
        expect(res.status).toBe(429)
        expect(res.body.message).toBe(
          "Too many requests, please try again later."
        )
      }
    }
  })
})
