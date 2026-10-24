import { describe, it, expect, beforeAll, afterAll } from "vitest"
import request from "supertest"
import type express from "express"
import { startMemoryServer, stopMemoryServer, seedTestData, createRealApp, signUp, type TestSeed } from "./setup"

let app: express.Express
let seed: TestSeed
let owner: { token: string; id: string }
let stranger: { token: string; id: string }
let agency: { token: string; id: string }
let privateUniId: string
let privateProgramId: string
let privateOnOfficialId: string
const auth = (t: string): [string, string] => ["Authorization", `Bearer ${t}`]

beforeAll(async () => {
  await startMemoryServer()
  seed = await seedTestData()
  app = await createRealApp()
  owner = await signUp(app, "student", "vis-owner@test.local")
  stranger = await signUp(app, "student", "vis-stranger@test.local")
  agency = await signUp(app, "agency", "vis-agency@test.local")
  const { University } = await import("../models/University.js")
  const { Program } = await import("../models/Program.js")
  const uni = await University.create({ name: "Secret Uni", country: "Test Country", city: "Test City", isOfficial: false, createdBy: owner.id })
  privateUniId = String(uni._id)
  privateProgramId = String((await Program.create({ name: "Secret Program", universityId: uni._id, degreeLevel: "Master", tuitionFee: 1234, isOfficial: false, createdBy: owner.id, notes: "private notes" }))._id)
  privateOnOfficialId = String((await Program.create({ name: "Hidden Track", universityId: seed["university"]._id, degreeLevel: "Master", tuitionFee: 1, isOfficial: false, createdBy: owner.id }))._id)
})

afterAll(async () => {
  await stopMemoryServer()
})

describe("programs by university", () => {
  it("anonymous callers don't see private programs on an official university", async () => {
    const res = await request(app).get(`/api/programs/by-university/${seed["university"]._id}`)
    expect(res.status).toBe(200)
    const names = res.body.map((p: { name: string }) => p.name)
    expect(names).toContain("Computer Science")
    expect(names).not.toContain("Hidden Track")
  })

  it("another account doesn't see them either, the owner does", async () => {
    const asStranger = await request(app).get(`/api/programs/by-university/${seed["university"]._id}`).set(...auth(stranger.token))
    expect(asStranger.body.map((p: { name: string }) => p.name)).not.toContain("Hidden Track")
    const asOwner = await request(app).get(`/api/programs/by-university/${seed["university"]._id}`).set(...auth(owner.token))
    expect(asOwner.body.map((p: { name: string }) => p.name)).toContain("Hidden Track")
  })

  it("a private university's programs are a 404 for everyone else", async () => {
    expect((await request(app).get(`/api/programs/by-university/${privateUniId}`)).status).toBe(404)
    expect((await request(app).get(`/api/programs/by-university/${privateUniId}`).set(...auth(stranger.token))).status).toBe(404)
    expect((await request(app).get(`/api/programs/by-university/${privateUniId}`).set(...auth(owner.token))).status).toBe(200)
  })

  it("a private program by id is a 404, not a 403", async () => {
    expect((await request(app).get(`/api/programs/${privateProgramId}`).set(...auth(stranger.token))).status).toBe(404)
    expect((await request(app).get(`/api/universities/${privateUniId}`).set(...auth(stranger.token))).status).toBe(404)
  })
})

describe("other catalogue endpoints", () => {
  it("budget refuses a private program", async () => {
    expect((await request(app).get(`/api/budget?programId=${privateProgramId}`)).status).toBe(404)
    expect((await request(app).get(`/api/budget?programId=${privateProgramId}`).set(...auth(stranger.token))).status).toBe(404)
  })

  it("country and city pages hide private universities", async () => {
    const { Country } = await import("../models/Country.js")
    const { City } = await import("../models/City.js")
    const country = await Country.findOne({ name: "Test Country" })
    const city = await City.findOne({ name: "Test City" })
    for (const url of [`/api/countries/${country!._id}/universities`, `/api/cities/${city!._id}/universities`]) {
      const anon = await request(app).get(url)
      expect(anon.status).toBe(200)
      expect(anon.body.universities.map((u: { name: string }) => u.name)).not.toContain("Secret Uni")
      const mine = await request(app).get(url).set(...auth(owner.token))
      expect(mine.body.universities.map((u: { name: string }) => u.name)).toContain("Secret Uni")
    }
  })

  it("the agency university list hides other accounts' private universities", async () => {
    const res = await request(app).get("/api/agency/universities").set(...auth(agency.token))
    expect(res.status).toBe(200)
    expect(res.body.map((u: { name: string }) => u.name)).not.toContain("Secret Uni")
  })

  it("reviews and favorites can't target a private record", async () => {
    expect((await request(app).get(`/api/reviews?targetType=program&targetId=${privateProgramId}`)).status).toBe(404)
    expect((await request(app).post("/api/reviews").set(...auth(stranger.token)).send({ targetType: "program", targetId: privateProgramId, rating: 5, comment: "Great program" })).status).toBe(404)
    expect((await request(app).post("/api/favorites").set(...auth(stranger.token)).send({ type: "program", itemId: privateProgramId })).status).toBe(404)
    expect((await request(app).post("/api/favorites").set(...auth(stranger.token)).send({ type: "university", itemId: privateUniId })).status).toBe(404)
    expect((await request(app).post("/api/favorites").set(...auth(owner.token)).send({ type: "program", itemId: privateProgramId })).status).toBe(201)
  })
})

describe("applications and private programs", () => {
  it("can't start an application on another account's private program", async () => {
    const res = await request(app).post("/api/applications").set(...auth(stranger.token)).send({ programId: privateProgramId, studentName: "S", studentEmail: "s@test.local" })
    expect(res.status).toBe(404)
  })

  it("can't move an application onto another account's private program", async () => {
    const created = await request(app).post("/api/applications").set(...auth(stranger.token)).send({ programId: String(seed["program"]._id), studentName: "S", studentEmail: "s@test.local" })
    expect(created.status).toBe(201)
    const moved = await request(app).put(`/api/applications/${created.body._id}`).set(...auth(stranger.token)).send({ programId: privateProgramId })
    expect(moved.status).toBe(404)
  })

  it("the owner can apply to their own private program", async () => {
    const res = await request(app).post("/api/applications").set(...auth(owner.token)).send({ programId: privateProgramId, studentName: "O", studentEmail: "o@test.local" })
    expect(res.status).toBe(201)
  })

  it("an application on a program the caller can't see shows its name only", async () => {
    const { Application } = await import("../models/Application.js")
    const legacy = await Application.create({ programId: privateProgramId, studentName: "S", studentEmail: "s@test.local", createdBy: stranger.id })
    const res = await request(app).get(`/api/applications/${legacy._id}`).set(...auth(stranger.token))
    expect(res.status).toBe(200)
    expect(res.body.programId).toEqual({ _id: privateProgramId, name: "Secret Program", hidden: true })
    expect(JSON.stringify(res.body)).not.toContain("private notes")
  })
})
