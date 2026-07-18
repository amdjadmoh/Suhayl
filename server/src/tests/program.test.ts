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

describe("GET /api/programs", () => {
  it("returns a paginated list of programs", async () => {
    const res = await request(app).get("/api/programs")
    expect(res.status).toBe(200)
    expect(res.body.programs).toBeDefined()
    expect(Array.isArray(res.body.programs)).toBe(true)
    expect(res.body.total).toBeDefined()
    expect(typeof res.body.total).toBe("number")
  })

  it("filters programs by search query", async () => {
    const res = await request(app)
      .get("/api/programs")
      .query({ search: "Computer" })
    expect(res.status).toBe(200)
    expect(res.body.programs.length).toBeGreaterThanOrEqual(1)
    expect(res.body.programs[0].name).toMatch(/computer/i)
  })

  it("returns empty results when search matches nothing", async () => {
    const res = await request(app)
      .get("/api/programs")
      .query({ search: "zzzzdoesnotexistzzzz" })
    expect(res.status).toBe(200)
    expect(res.body.programs).toHaveLength(0)
    expect(res.body.total).toBe(0)
  })
})

describe("GET /api/programs/matches", () => {
  it("returns scored matches when preferences are provided", async () => {
    const res = await request(app)
      .get("/api/programs/matches")
      .query({ budget: 20000, gpa: 3.5, ielts: 7.0 })
    expect(res.status).toBe(200)
    expect(res.body.matches).toBeDefined()
    expect(Array.isArray(res.body.matches)).toBe(true)
    // The seeded program should match
    expect(res.body.total).toBeGreaterThanOrEqual(1)

    const match = res.body.matches[0] as Record<string, unknown>
    expect(match["matchScore"]).toBeDefined()
    expect(typeof match["matchScore"]).toBe("number")
    // Should be a reasonable match score (0-100)
    expect(match["matchScore"]).toBeGreaterThanOrEqual(0)
    expect(match["matchScore"]).toBeLessThanOrEqual(100)
  })

  it("returns results even without explicit preferences (visibility filter applies)", async () => {
    // The visibility filter (isOfficial: true) counts as a filter condition,
    // so the endpoint returns official programs instead of 400.
    const res = await request(app).get("/api/programs/matches")
    expect(res.status).toBe(200)
    expect(res.body.matches).toBeDefined()
    expect(res.body.total).toBeGreaterThanOrEqual(0)
  })

  it("filters by country preference", async () => {
    const res = await request(app)
      .get("/api/programs/matches")
      .query({ budget: 20000, countries: "Test Country" })
    expect(res.status).toBe(200)
    expect(res.body.matches.length).toBeGreaterThanOrEqual(1)
  })
})
