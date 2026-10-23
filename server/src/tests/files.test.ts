import { describe, it, expect, vi, beforeEach, afterAll } from "vitest"
import { Readable } from "stream"

// The storage layer picks its driver when it loads, so configure it first
vi.hoisted(() => {
  process.env["STORAGE_DRIVER"] = "s3"
  process.env["S3_BUCKET"] = "suhayl-test"
  process.env["S3_PREFIX"] = "docs/"
})

// A stand-in S3 client that records what the storage layer asks it to do
const sent: { name: string; input: Record<string, unknown> }[] = []
vi.mock("@aws-sdk/client-s3", () => {
  class Command {
    constructor(public input: Record<string, unknown>) {}
  }
  class PutObjectCommand extends Command {}
  class GetObjectCommand extends Command {}
  class DeleteObjectCommand extends Command {}
  class S3Client {
    async send(cmd: Command): Promise<unknown> {
      sent.push({ name: cmd.constructor.name, input: cmd.input })
      if (cmd instanceof GetObjectCommand) {
        if (String(cmd.input["Key"]).includes("gone")) throw new Error("NoSuchKey")
        return { Body: Readable.from([Buffer.from("%PDF-1.4")]), ContentLength: 8 }
      }
      return {}
    }
  }
  return { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand }
})

import * as files from "../services/files"

describe("S3 storage driver", () => {
  beforeEach(() => {
    sent.length = 0
  })
  afterAll(() => {
    // Tests share one process; don't leave S3 switched on for the next file
    delete process.env["STORAGE_DRIVER"]
    delete process.env["S3_BUCKET"]
    delete process.env["S3_PREFIX"]
  })

  it("puts, fetches and deletes objects under the prefix", async () => {
    const name = await files.storeFile(Buffer.from("%PDF-1.4"), "application/pdf")
    expect(name).toMatch(/^[a-f0-9]{32}\.pdf$/)
    expect(sent[0]).toMatchObject({ name: "PutObjectCommand", input: { Bucket: "suhayl-test", Key: `docs/${name}`, ContentType: "application/pdf" } })

    const headers: Record<string, string> = {}
    const res = {
      setHeader: (k: string, v: string) => (headers[k.toLowerCase()] = v),
      attachment: (n: string) => (headers["content-disposition"] = `attachment; filename="${n}"`),
      write: () => true,
      end: () => undefined,
      on: () => res,
      once: () => res,
      emit: () => true,
      removeListener: () => res,
    }
    await files.sendStoredFile(res as never, { storedName: name, originalName: "bac.pdf", mimeType: "application/pdf" })
    expect(sent[1]).toMatchObject({ name: "GetObjectCommand", input: { Key: `docs/${name}` } })
    expect(headers["content-type"]).toBe("application/pdf")
    expect(headers["content-disposition"]).toContain("bac.pdf")

    await files.removeFile("../../escape.pdf")
    expect(sent[2]).toMatchObject({ name: "DeleteObjectCommand", input: { Key: "docs/escape.pdf" } })
  })

  it("answers 404 when the object is gone", async () => {
    let status = 0
    let body: unknown
    const res = { status: (s: number) => ((status = s), res), json: (b: unknown) => (body = b) }
    await files.sendStoredFile(res as never, { storedName: "gone.pdf", originalName: "x.pdf", mimeType: "application/pdf" })
    expect(status).toBe(404)
    expect(body).toMatchObject({ message: expect.stringContaining("missing") })
  })
})
