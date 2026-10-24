import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest"
import request from "supertest"
import type express from "express"
import { startMemoryServer, stopMemoryServer, seedTestData, createRealApp, signUp } from "./setup"
import { neutralizeFormula, applicationsToCsv } from "../services/csv"
import { escapeRegex, containsText } from "../services/query"
import { scrubEvent } from "../services/sentry"

let app: express.Express
let student: { token: string; id: string }
let agency: { token: string; id: string }
const auth = (t: string): [string, string] => ["Authorization", `Bearer ${t}`]
const saved = { ...process.env }

beforeAll(async () => {
  await startMemoryServer()
  await seedTestData()
  app = await createRealApp()
  student = await signUp(app, "student", "hard-student@test.local")
  agency = await signUp(app, "agency", "hard-agency@test.local")
})

afterEach(() => {
  for (const key of ["SMTP_USER", "SMTP_PASS", "SMTP_PORT", "SMTP_SECURE", "SMTP_REQUIRE_TLS", "NODE_ENV"]) {
    if (saved[key] === undefined) delete process.env[key]
    else process.env[key] = saved[key]
  }
})

afterAll(async () => {
  await stopMemoryServer()
})

describe("user text is never a regex", () => {
  it("escapes every metacharacter", () => {
    expect(escapeRegex("a.b*c(d)[e]{f}+?^$|\\")).toBe("a\\.b\\*c\\(d\\)\\[e\\]\\{f\\}\\+\\?\\^\\$\\|\\\\")
    expect(containsText("(a+)+$")!.test("x(a+)+$y")).toBe(true)
    expect(containsText("x".repeat(500))!.source.length).toBe(100)
    expect(containsText("   ")).toBeNull()
  })

  it("malformed patterns are searched literally instead of failing", async () => {
    for (const url of ["/api/programs?field=(", "/api/programs?country=[", "/api/programs?city=*", "/api/programs/matches?countries=(,["]) {
      const res = await request(app).get(url).set(...auth(student.token))
      expect(res.status, url).toBe(200)
    }
    const apps = await request(app).get("/api/applications?search=(").set(...auth(student.token))
    expect(apps.status).toBe(200)
  })

  it("a catastrophic-backtracking pattern returns at once", async () => {
    const started = Date.now()
    const res = await request(app).get(`/api/programs?field=${encodeURIComponent("(a+)+$")}`)
    expect(res.status).toBe(200)
    expect(Date.now() - started).toBeLessThan(2000)
  })

  it("overlong search text is refused", async () => {
    expect((await request(app).get(`/api/programs?search=${"a".repeat(101)}`)).status).toBe(400)
    expect((await request(app).get(`/api/applications?search=${"a".repeat(101)}`).set(...auth(student.token))).status).toBe(400)
  })

  it("lists honour a limit", async () => {
    const res = await request(app).get("/api/programs?limit=1")
    expect(res.status).toBe(200)
    expect(res.body.programs.length).toBeLessThanOrEqual(1)
    const huge = await request(app).get("/api/programs?limit=100000")
    expect(huge.body.programs.length).toBeLessThanOrEqual(500)
  })
})

describe("agency imports and bulk actions", () => {
  it("refuses more than 1000 students in one import", async () => {
    const students = Array.from({ length: 1001 }, (_, i) => ({ name: `S${i}`, email: `s${i}@import.test` }))
    const res = await request(app).post("/api/agency/students/import").set(...auth(agency.token)).send({ students })
    expect(res.status).toBe(413)
  })

  it("refuses a CSV file over 1 MB", async () => {
    const csv = "name,email\n" + "x".repeat(1024 * 1024 + 10)
    const res = await request(app).post("/api/agency/students/import").set(...auth(agency.token)).attach("file", Buffer.from(csv), { filename: "big.csv", contentType: "text/csv" })
    expect(res.status).toBe(413)
  })

  it("caps bulk id arrays and checks they are ids", async () => {
    const ids = Array.from({ length: 501 }, () => "0".repeat(24))
    expect((await request(app).post("/api/students/bulk/assign").set(...auth(agency.token)).send({ studentIds: ids, counsellorId: null })).status).toBe(400)
    expect((await request(app).post("/api/students/bulk/assign").set(...auth(agency.token)).send({ studentIds: [{ $gt: "" }], counsellorId: null })).status).toBe(400)
    expect((await request(app).post("/api/students/bulk/documents").set(...auth(agency.token)).send({ studentIds: ["not-an-id"], title: "Passport" })).status).toBe(400)
  })
})

describe("CSV export", () => {
  it("neutralizes cells that a spreadsheet would run as a formula", () => {
    for (const bad of ["=HYPERLINK(\"http://x\")", "+1+1", "-2+3", "@SUM(A1)", "\tx", "\rx"]) expect(neutralizeFormula(bad)).toBe(`'${bad}`)
    expect(neutralizeFormula("Amina")).toBe("Amina")
  })

  it("applies to every column of the export", () => {
    const csv = applicationsToCsv([{ _id: "1", studentName: "=cmd|' /C calc'!A0", studentEmail: "a@b.c", notes: "@evil", applicationStatus: "Applied" }])
    expect(csv).toContain("'=cmd")
    expect(csv).toContain("'@evil")
    expect(csv).not.toMatch(/,=cmd/)
  })
})

describe("SMTP", () => {
  it("port 587 must upgrade to TLS", async () => {
    const { smtpOptions } = await import("../services/email.js")
    Object.assign(process.env, { SMTP_USER: "u", SMTP_PASS: "p", SMTP_PORT: "587", NODE_ENV: "production" })
    delete process.env["SMTP_SECURE"]
    const o = smtpOptions()!
    expect(o.secure).toBe(false)
    expect(o.requireTLS).toBe(true)
    expect(o.tls.minVersion).toBe("TLSv1.2")
    expect(o.tls.rejectUnauthorized).toBe(true)
  })

  it("port 465 is TLS from the start", async () => {
    const { smtpOptions } = await import("../services/email.js")
    Object.assign(process.env, { SMTP_USER: "u", SMTP_PASS: "p", SMTP_PORT: "465" })
    expect(smtpOptions()!.secure).toBe(true)
  })

  it("plain SMTP is only possible in development", async () => {
    const { smtpOptions } = await import("../services/email.js")
    Object.assign(process.env, { SMTP_USER: "u", SMTP_PASS: "p", SMTP_PORT: "587", SMTP_REQUIRE_TLS: "false", NODE_ENV: "production" })
    expect(smtpOptions()!.requireTLS).toBe(true)
    process.env["NODE_ENV"] = "development"
    expect(smtpOptions()!.requireTLS).toBe(false)
  })
})

describe("logs and error reports", () => {
  it("the Mongo connection string is logged without credentials", async () => {
    const { describeMongoUri } = await import("../config.js")
    expect(describeMongoUri("mongodb+srv://admin:S3cret@cluster0.abc.mongodb.net/suhayl?retryWrites=true")).toBe("mongodb+srv://cluster0.abc.mongodb.net/suhayl")
    expect(describeMongoUri("not a uri")).not.toContain("not a uri")
  })

  it("Sentry events lose bodies, cookies, auth headers and tokens", () => {
    const event = scrubEvent({
      request: {
        url: "https://app.test/api/portal/abcdefghijklmnopqrstuvwx/documents/1?token=secret",
        data: { password: "hunter2" },
        cookies: { sid: "x" },
        query_string: "token=secret",
        headers: { authorization: "Bearer abc", cookie: "sid=x", "user-agent": "ua" },
      },
      user: { id: "u1", email: "a@b.c", ip_address: "1.2.3.4" },
      extra: { nested: { apiKey: "k", fine: 1 } },
    })
    expect(event.request!.data).toBeUndefined()
    expect(event.request!.cookies).toBeUndefined()
    expect(event.request!.query_string).toBeUndefined()
    expect(event.request!.headers).toEqual({ "user-agent": "ua" })
    expect(event.request!.url).toBe("https://app.test/api/portal/[token]/documents/1")
    expect(event.user).toEqual({ id: "u1" })
    expect(event.extra).toEqual({ nested: { apiKey: "[scrubbed]", fine: 1 } })
  })
})
