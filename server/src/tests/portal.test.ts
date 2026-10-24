import { describe, it, expect, beforeAll, afterAll } from "vitest"
import request from "supertest"
import os from "os"
import path from "path"
import fs from "fs"
import http from "http"
import type { AddressInfo } from "net"
import type express from "express"
import { startMemoryServer, stopMemoryServer, seedTestData, createRealApp, signUp } from "./setup"

// Uploads in this file go to a throwaway folder
const uploadDir = fs.mkdtempSync(path.join(os.tmpdir(), "suhayl-portal-"))
process.env["UPLOAD_DIR"] = uploadDir
process.env["STORAGE_DRIVER"] = "local"

let app: express.Express
let agency: { token: string; id: string }
let studentId: string
let portalToken: string
let docId: string
const auth = (t: string): [string, string] => ["Authorization", `Bearer ${t}`]
const PDF = Buffer.from("%PDF-1.4 test file")
const big = (mb: number): Buffer => Buffer.alloc(mb * 1024 * 1024, 0x41)

/**
 * Streams a large multipart upload and reports the status as soon as the server
 * answers. A server that rejects early stops reading and may reset the connection
 * mid-upload; that counts as the early answer it is, not as a failure.
 */
function postLarge(url: string, mb: number): Promise<{ status: number; bytesSent: number }> {
  return new Promise((resolve, reject) => {
    const server = app.listen(0, () => {
      const { port } = server.address() as AddressInfo
      const boundary = "----suhayl-test"
      const head = Buffer.from(`--${boundary}
Content-Disposition: form-data; name="file"; filename="big.pdf"
Content-Type: application/pdf

%PDF`)
      const tail = Buffer.from(`
--${boundary}--
`)
      const total = head.length + mb * 1024 * 1024 + tail.length
      let bytesSent = 0
      let status = 0
      const req = http.request({ port, path: url, method: "POST", headers: { "Content-Type": `multipart/form-data; boundary=${boundary}`, "Content-Length": total } })
      const done = (): void => { server.close(); status ? resolve({ status, bytesSent }) : reject(new Error("no response")) }
      req.on("response", (res) => { status = res.statusCode ?? 0; res.resume(); res.on("end", done) })
      req.on("error", () => (status ? undefined : done()))
      const chunk = Buffer.alloc(64 * 1024, 0x41)
      req.write(head)
      bytesSent += head.length
      const pump = (): void => {
        while (!status && bytesSent < total - tail.length) {
          bytesSent += chunk.length
          if (!req.write(chunk)) return void req.once("drain", pump)
        }
        if (!status) req.end(tail)
      }
      pump()
    })
  })
}

beforeAll(async () => {
  await startMemoryServer()
  await seedTestData()
  app = await createRealApp()
  agency = await signUp(app, "agency", "portal-agency@test.local")
  studentId = (await request(app).post("/api/students").set(...auth(agency.token)).send({ name: "Ines", email: "ines@test.local" })).body._id
  docId = (await request(app).post(`/api/students/${studentId}/documents`).set(...auth(agency.token)).send({ title: "Passport" })).body._id
  portalToken = (await request(app).post(`/api/students/${studentId}/portal`).set(...auth(agency.token))).body.portalToken
})

afterAll(async () => {
  await stopMemoryServer()
  fs.rmSync(uploadDir, { recursive: true, force: true })
})

describe("family link uploads", () => {
  it("a valid link takes a PDF and never returns the storage key", async () => {
    const res = await request(app).post(`/api/portal/${portalToken}/documents/${docId}`).attach("file", PDF, { filename: "passport.pdf", contentType: "application/pdf" })
    expect(res.status).toBe(200)
    expect(res.body.file.originalName).toBe("passport.pdf")
    expect(JSON.stringify(res.body)).not.toContain("storedName")
    const agencyView = await request(app).get(`/api/students/${studentId}/documents`).set(...auth(agency.token))
    expect(agencyView.status).toBe(200)
    expect(JSON.stringify(agencyView.body)).not.toContain("storedName")
  })

  it("an invalid link with a large body is refused before the body is parsed", async () => {
    // 12 MB is over the upload limit: a 413 would mean multer read it, a 404 means it never did
    const res = await postLarge(`/api/portal/${"x".repeat(32)}/documents/${docId}`, 50)
    expect(res.status).toBe(404)
    // The answer came long before the 50 MB were sent
    expect(res.bytesSent).toBeLessThan(25 * 1024 * 1024)
    expect(fs.readdirSync(uploadDir)).toHaveLength(1)
  })

  it("a document from another student is refused before the body is parsed", async () => {
    const res = await postLarge(`/api/portal/${portalToken}/documents/000000000000000000000000`, 50)
    expect(res.status).toBe(404)
  })

  it("an oversized file on a valid link is a 413, not a crash", async () => {
    const res = await request(app).post(`/api/portal/${portalToken}/documents/${docId}`).attach("file", big(11), { filename: "big.pdf", contentType: "application/pdf" })
    expect(res.status).toBe(413)
  })

  it("extra fields and files beyond the limits are refused", async () => {
    const many = request(app).post(`/api/portal/${portalToken}/documents/${docId}`)
    for (let i = 0; i < 8; i++) many.field(`f${i}`, "x")
    expect((await many.attach("file", PDF, { filename: "a.pdf", contentType: "application/pdf" })).status).toBe(400)
    const two = await request(app).post(`/api/portal/${portalToken}/documents/${docId}`)
      .attach("file", PDF, { filename: "a.pdf", contentType: "application/pdf" })
      .attach("file", PDF, { filename: "b.pdf", contentType: "application/pdf" })
    expect(two.status).toBe(400)
  })

  it("an expired link is a 410, uploads included", async () => {
    const { Student } = await import("../models/Student.js")
    await Student.updateOne({ _id: studentId }, { $set: { portalExpiresAt: new Date(Date.now() - 1000) } })
    expect((await request(app).get(`/api/portal/${portalToken}`)).status).toBe(410)
    const res = await postLarge(`/api/portal/${portalToken}/documents/${docId}`, 50)
    expect(res.status).toBe(410)
    expect((await request(app).get(`/api/portal/${portalToken}/documents/${docId}/file`)).status).toBe(410)
  })

  it("a link saved without an expiry runs out after PORTAL_LINK_DAYS", async () => {
    const { Student } = await import("../models/Student.js")
    await Student.updateOne({ _id: studentId }, { $unset: { portalExpiresAt: "" }, $set: { portalEnabledAt: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000) } })
    expect((await request(app).get(`/api/portal/${portalToken}`)).status).toBe(410)
    await Student.updateOne({ _id: studentId }, { $unset: { portalExpiresAt: "", portalEnabledAt: "" } })
    expect((await request(app).get(`/api/portal/${portalToken}`)).status).toBe(410)
  })
})
