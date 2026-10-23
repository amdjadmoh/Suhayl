import { describe, it, expect, beforeAll, afterAll } from "vitest"
import type { Options } from "express-rate-limit"
import { startMemoryServer, stopMemoryServer } from "./setup"
import { MongoRateLimitStore } from "../services/rateLimitStore"

beforeAll(async () => {
  await startMemoryServer()
})

afterAll(async () => {
  await stopMemoryServer()
})

const withWindow = (windowMs: number): Options => ({ windowMs }) as Options

describe("MongoRateLimitStore", () => {
  it("counts hits per key and namespace", async () => {
    const a = new MongoRateLimitStore("a")
    const b = new MongoRateLimitStore("b")
    a.init(withWindow(60_000))
    b.init(withWindow(60_000))
    expect((await a.increment("1.2.3.4")).totalHits).toBe(1)
    expect((await a.increment("1.2.3.4")).totalHits).toBe(2)
    expect((await b.increment("1.2.3.4")).totalHits).toBe(1)
    await a.decrement("1.2.3.4")
    expect((await a.increment("1.2.3.4")).totalHits).toBe(2)
    await a.resetKey("1.2.3.4")
    expect((await a.increment("1.2.3.4")).totalHits).toBe(1)
  })

  it("starts a new window once the old one ends", async () => {
    const s = new MongoRateLimitStore("short")
    s.init(withWindow(50))
    await s.increment("k")
    await s.increment("k")
    await new Promise((r) => setTimeout(r, 80))
    const next = await s.increment("k")
    expect(next.totalHits).toBe(1)
    expect(next.resetTime!.getTime()).toBeGreaterThan(Date.now())
  })
})
