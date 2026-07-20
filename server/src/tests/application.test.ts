import { describe, it, expect, beforeAll, afterAll } from "vitest"
import request from "supertest"
import type express from "express"
import { Notification } from "../models/Notification"
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

describe("Visa decision → enroll flow (PUT /api/applications/:id)", () => {
  let appId: string

  it("creates an application to drive the flow", async () => {
    const res = await request(app)
      .post("/api/applications")
      .set("Authorization", `Bearer ${token}`)
      .send({
        programId,
        studentName: "Visa Flow",
        studentEmail: "visa.flow@test.com",
      })
    expect(res.status).toBe(201)
    appId = String(res.body._id)
  })

  it("accepts a visa approval and moves to Enrolled with a notification", async () => {
    // Mark accepted + visa applied/approved
    const acceptRes = await request(app)
      .put(`/api/applications/${appId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        applicationStatus: "Accepted",
        applicationProgress: { visaApplied: true, visaApproved: true },
      })
    expect(acceptRes.status).toBe(200)
    expect(acceptRes.body.applicationProgress.visaApproved).toBe(true)

    // Enroll
    const enrollRes = await request(app)
      .put(`/api/applications/${appId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ applicationStatus: "Enrolled" })
    expect(enrollRes.status).toBe(200)
    expect(enrollRes.body.applicationStatus).toBe("Enrolled")

    // A status-change notification was created for the owner
    const notif = await Notification.findOne({
      link: `/applications/${appId}`,
      type: "status_change",
      title: "Application status: Enrolled",
    })
    expect(notif).not.toBeNull()
  })

  it("clears the visa decision when visaApproved is set to null", async () => {
    const res = await request(app)
      .put(`/api/applications/${appId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        applicationProgress: { visaApplied: true, visaApproved: null },
      })
    expect(res.status).toBe(200)
    expect(res.body.applicationProgress.visaApplied).toBe(true)
    // null (or unset) means the decision is pending again
    expect(res.body.applicationProgress.visaApproved ?? null).toBeNull()
  })

  it("rejects a non-boolean visaApproved value", async () => {
    const res = await request(app)
      .put(`/api/applications/${appId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        applicationProgress: { visaApproved: "yes" },
      })
    expect(res.status).toBe(400)
    expect(res.body.message).toBe("Validation failed")
  })
})

