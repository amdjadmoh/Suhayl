import { describe, it, expect, beforeAll, afterAll } from "vitest"
import request from "supertest"
import jwt from "jsonwebtoken"
import type express from "express"
import { startMemoryServer, stopMemoryServer, seedTestData, createRealApp, signUp, type TestSeed } from "./setup"

let app: express.Express
let seed: TestSeed
let student: { token: string; id: string }
let otherStudent: { token: string; id: string }
let agency: { token: string; id: string }

beforeAll(async () => {
  await startMemoryServer()
  seed = await seedTestData()
  app = await createRealApp()
  student = await signUp(app, "student", "stats-student@test.local")
  otherStudent = await signUp(app, "student", "stats-other@test.local")
  agency = await signUp(app, "agency", "stats-agency@test.local")

  const { Application } = await import("../models/Application.js")
  const soon = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
  const base = { programId: seed["program"]._id, applicationDeadline: soon, notes: "private note", studentEmail: "x@test.local" }
  await Application.create([
    { ...base, studentName: "Mine", createdBy: student.id },
    { ...base, studentName: "Mine 2", createdBy: student.id },
    { ...base, studentName: "Theirs", createdBy: otherStudent.id },
    { ...base, studentName: "Agency A", createdBy: agency.id, agencyId: agency.id },
    { ...base, studentName: "Agency B", createdBy: agency.id, agencyId: agency.id },
    { ...base, studentName: "Agency C", createdBy: agency.id, agencyId: agency.id },
  ])
})

afterAll(async () => {
  await stopMemoryServer()
})

describe("GET /api/stats", () => {
  it("rejects anonymous callers", async () => {
    const res = await request(app).get("/api/stats")
    expect(res.status).toBe(401)
    expect(res.body.totalApplications).toBeUndefined()
  })

  it("rejects a token signed with another secret", async () => {
    const forged = jwt.sign({ _id: student.id, role: "admin", v: 0 }, "attacker-chosen-secret-that-is-long-enough")
    const res = await request(app).get("/api/stats").set("Authorization", `Bearer ${forged}`)
    expect(res.status).toBe(401)
  })

  it("counts only a student's own applications", async () => {
    const res = await request(app).get("/api/stats").set("Authorization", `Bearer ${student.token}`)
    expect(res.status).toBe(200)
    expect(res.body.totalApplications).toBe(2)
    expect(res.body.recentlyAdded).toHaveLength(2)
    expect(res.body.byStatus.reduce((n: number, s: { count: number }) => n + s.count, 0)).toBe(2)
  })

  it("counts only an agency's applications", async () => {
    const res = await request(app).get("/api/stats").set("Authorization", `Bearer ${agency.token}`)
    expect(res.status).toBe(200)
    expect(res.body.totalApplications).toBe(3)
    expect(res.body.byCountry).toEqual([{ country: "Test Country", count: 3 }])
  })

  it("returns summaries, never whole application records", async () => {
    const res = await request(app).get("/api/stats").set("Authorization", `Bearer ${student.token}`)
    const allowed = ["_id", "applicationStatus", "applicationDeadline", "createdAt", "programName", "universityName", "country"]
    for (const item of [...res.body.recentlyAdded, ...res.body.upcomingDeadlines]) {
      for (const key of Object.keys(item)) expect(allowed).toContain(key)
      expect(item.notes).toBeUndefined()
      expect(item.studentEmail).toBeUndefined()
      expect(item.studentName).toBeUndefined()
    }
    expect(res.body.recentlyAdded[0].programName).toBe("Computer Science")
  })

  it("caps the lists", async () => {
    const res = await request(app).get("/api/stats?limit=1000").set("Authorization", `Bearer ${agency.token}`)
    expect(res.status).toBe(200)
    expect(res.body.recentlyAdded.length).toBeLessThanOrEqual(20)
    const one = await request(app).get("/api/stats?limit=1").set("Authorization", `Bearer ${agency.token}`)
    expect(one.body.recentlyAdded).toHaveLength(1)
    expect(one.body.upcomingDeadlines).toHaveLength(1)
  })

  it("rejects the token of a deleted account", async () => {
    const gone = await signUp(app, "student", "stats-gone@test.local")
    const del = await request(app).delete("/api/auth/me").set("Authorization", `Bearer ${gone.token}`).send({ password: "Passw0rd-long" })
    expect(del.status).toBe(200)
    const res = await request(app).get("/api/stats").set("Authorization", `Bearer ${gone.token}`)
    expect(res.status).toBe(401)
  })
})
