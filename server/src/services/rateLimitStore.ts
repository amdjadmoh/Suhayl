import mongoose from "mongoose"
import type { Options, Store, ClientRateLimitInfo } from "express-rate-limit"

/*
 * Rate-limit counters kept in MongoDB instead of server memory, so limits hold
 * across restarts and across several servers. Expired counters are removed by a
 * TTL index. Used in production; development keeps the in-memory default.
 */

interface Counter {
  _id: string
  hits: number
  resetAt: Date
}

const schema = new mongoose.Schema<Counter>(
  {
    _id: { type: String, required: true },
    hits: { type: Number, required: true, default: 0 },
    resetAt: { type: Date, required: true },
  },
  { versionKey: false },
)
schema.index({ resetAt: 1 }, { expireAfterSeconds: 0 })

const Counters: mongoose.Model<Counter> =
  (mongoose.models["RateLimit"] as mongoose.Model<Counter> | undefined) ?? mongoose.model<Counter>("RateLimit", schema)

export class MongoRateLimitStore implements Store {
  private windowMs = 60_000
  // Each limiter gets its own namespace, so the auth and global counters don't collide
  constructor(private readonly namespace: string) {}

  init(options: Options): void {
    this.windowMs = options.windowMs
  }

  async increment(key: string): Promise<ClientRateLimitInfo> {
    const id = `${this.namespace}:${key}`
    const now = new Date()
    // Start a fresh window when the old one has run out
    await Counters.updateOne({ _id: id, resetAt: { $lte: now } }, { $set: { hits: 0, resetAt: new Date(now.getTime() + this.windowMs) } })
    const doc = await Counters.findOneAndUpdate(
      { _id: id },
      { $inc: { hits: 1 }, $setOnInsert: { resetAt: new Date(now.getTime() + this.windowMs) } },
      { upsert: true, returnDocument: "after" },
    ).lean<Counter>()
    return { totalHits: doc?.hits ?? 1, resetTime: doc?.resetAt ?? new Date(now.getTime() + this.windowMs) }
  }

  async decrement(key: string): Promise<void> {
    await Counters.updateOne({ _id: `${this.namespace}:${key}`, hits: { $gt: 0 } }, { $inc: { hits: -1 } })
  }

  async resetKey(key: string): Promise<void> {
    await Counters.deleteOne({ _id: `${this.namespace}:${key}` })
  }
}

/** The shared store in production (or when RATE_LIMIT_STORE=mongo); memory otherwise. */
export function rateLimitStore(prefix: string): { store: Store } | Record<string, never> {
  const useMongo = process.env["RATE_LIMIT_STORE"] === "mongo" || (process.env["NODE_ENV"] === "production" && process.env["RATE_LIMIT_STORE"] !== "memory")
  return useMongo ? { store: new MongoRateLimitStore(prefix) } : {}
}
