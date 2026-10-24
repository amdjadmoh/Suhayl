import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest"
import { startMemoryServer, stopMemoryServer } from "./setup"
import { jwtSecretProblem } from "../services/tokens"

const saved = { ...process.env }

beforeAll(async () => {
  await startMemoryServer()
})

afterEach(() => {
  for (const key of ["ADMIN_EMAIL", "ADMIN_PASSWORD", "ALLOW_BOOTSTRAP_ADMIN", "NODE_ENV", "JWT_SECRET"]) {
    if (saved[key] === undefined) delete process.env[key]
    else process.env[key] = saved[key]
  }
})

afterAll(async () => {
  await stopMemoryServer()
})

describe("JWT secret", () => {
  it("rejects missing, short and placeholder secrets", () => {
    expect(jwtSecretProblem(undefined)).toMatch(/not set/)
    expect(jwtSecretProblem("short")).toMatch(/32 bytes/)
    expect(jwtSecretProblem("change_me_to_a_random_secret_please_ok")).toMatch(/placeholder/)
    expect(jwtSecretProblem("a".repeat(40))).toMatch(/random/)
    expect(jwtSecretProblem("0f3a9c27d4e81b6a5f02c9e7d13b84a6ffee0011")).toBeNull()
  })

  it("stops the server from starting in development without a secret", async () => {
    const { checkConfig } = await import("../config.js")
    process.env["NODE_ENV"] = "development"
    delete process.env["JWT_SECRET"]
    expect(() => checkConfig()).toThrow(/can't start/)
    process.env["JWT_SECRET"] = "change_me_to_a_random_secret"
    expect(() => checkConfig()).toThrow(/JWT_SECRET/)
  })

  it("never signs a token with a fallback secret", async () => {
    const { signSession } = await import("../services/tokens.js")
    delete process.env["JWT_SECRET"]
    expect(() => signSession({ _id: "x", role: "admin" })).toThrow(/JWT_SECRET/)
  })

  it("does not put the secret in its error message", async () => {
    const { checkConfig } = await import("../config.js")
    process.env["NODE_ENV"] = "production"
    process.env["JWT_SECRET"] = "short-secret-value"
    try {
      checkConfig()
    } catch (err) {
      expect(String(err)).not.toContain("short-secret-value")
    }
  })
})

describe("bootstrapAdmin", () => {
  it("creates nothing without ADMIN_EMAIL and ADMIN_PASSWORD, and never admin123", async () => {
    const { bootstrapAdmin } = await import("../seed.js")
    const { User } = await import("../models/User.js")
    delete process.env["ADMIN_EMAIL"]
    delete process.env["ADMIN_PASSWORD"]
    expect(await bootstrapAdmin()).toBe("skipped")
    expect(await User.countDocuments({ role: "admin" })).toBe(0)
  })

  it("refuses a weak password", async () => {
    const { bootstrapAdmin } = await import("../seed.js")
    const { User } = await import("../models/User.js")
    process.env["ADMIN_EMAIL"] = "boss@test.local"
    for (const weak of ["admin123", "short1!A", "alllowercaseletters", "Password1234!"]) {
      process.env["ADMIN_PASSWORD"] = weak
      expect(await bootstrapAdmin()).toBe("skipped")
    }
    expect(await User.countDocuments({ role: "admin" })).toBe(0)
  })

  it("in production, needs ALLOW_BOOTSTRAP_ADMIN=true", async () => {
    const { bootstrapAdmin } = await import("../seed.js")
    process.env["NODE_ENV"] = "production"
    process.env["ADMIN_EMAIL"] = "boss@test.local"
    process.env["ADMIN_PASSWORD"] = "Str0ng-Admin-Pass"
    expect(await bootstrapAdmin()).toBe("skipped")
    process.env["ALLOW_BOOTSTRAP_ADMIN"] = "true"
    expect(await bootstrapAdmin()).toBe("created")
  })

  it("stores a hash, not the password, and only creates once", async () => {
    const { bootstrapAdmin } = await import("../seed.js")
    const { User } = await import("../models/User.js")
    process.env["ADMIN_EMAIL"] = "boss@test.local"
    process.env["ADMIN_PASSWORD"] = "Str0ng-Admin-Pass"
    expect(await bootstrapAdmin()).toBe("exists")
    const admin = await User.findOne({ email: "boss@test.local" }).select("+passwordHash")
    expect(admin!.passwordHash).not.toContain("Str0ng-Admin-Pass")
    expect(admin!.passwordHash).toMatch(/^\$2[aby]\$/)
  })
})
