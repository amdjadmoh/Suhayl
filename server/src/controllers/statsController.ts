import type { Request, Response } from "express"
import { Types, type PipelineStage } from "mongoose"
import "../middleware/auth"
import { University } from "../models/University"
import { Program } from "../models/Program"
import { Application } from "../models/Application"
import { Country } from "../models/Country"
import { City } from "../models/City"
import { visibleFilter } from "../services/visibility"

/** Applications the caller may count: an agency's, a student's own, or all of them for an admin. */
function applicationScope(req: Request): Record<string, unknown> {
  const user = req.user!
  if (user.role === "admin") return {}
  if (user.role === "agency") return { agencyId: new Types.ObjectId(user.agencyId ?? user._id) }
  return { createdBy: new Types.ObjectId(user._id) }
}

// Catalogue figures are the same for everyone (official records only), so they are
// computed at most once a minute rather than on every dashboard load.
const CATALOGUE_TTL_MS = 60 * 1000
let catalogue: { at: number; value: Promise<CatalogueFigures> } | null = null

interface CatalogueFigures {
  officialUniversities: number
  officialPrograms: number
  countriesCount: number
  citiesCount: number
  avgTuition: number
  scholarshipCount: number
}

function catalogueFigures(): Promise<CatalogueFigures> {
  if (catalogue && Date.now() - catalogue.at < CATALOGUE_TTL_MS) return catalogue.value
  const official = visibleFilter(undefined)
  const value = Promise.all([
    University.countDocuments(official),
    Program.countDocuments(official),
    Country.estimatedDocumentCount(),
    City.estimatedDocumentCount(),
    Program.aggregate<{ avg: number }>([{ $match: official }, { $group: { _id: null, avg: { $avg: "$tuitionFee" } } }]),
    Program.countDocuments({ ...official, scholarshipAvailable: true }),
  ]).then(([officialUniversities, officialPrograms, countriesCount, citiesCount, avg, scholarshipCount]) => ({
    officialUniversities,
    officialPrograms,
    countriesCount,
    citiesCount,
    avgTuition: Math.round((avg[0]?.avg ?? 0) * 100) / 100,
    scholarshipCount,
  }))
  catalogue = { at: Date.now(), value }
  value.catch(() => (catalogue = null))
  return value
}

/** Test hook: forget the cached catalogue figures. */
export function resetStatsCache(): void {
  catalogue = null
}

/**
 * Program, university and country for each application, keeping only the fields a
 * dashboard needs: no notes, progress, student contact details or file names.
 */
const SUMMARY: PipelineStage[] = [
  { $lookup: { from: "programs", localField: "programId", foreignField: "_id", as: "program", pipeline: [{ $project: { name: 1, universityId: 1 } }] } },
  { $unwind: { path: "$program", preserveNullAndEmptyArrays: true } },
  { $lookup: { from: "universities", localField: "program.universityId", foreignField: "_id", as: "university", pipeline: [{ $project: { name: 1, country: 1 } }] } },
  { $unwind: { path: "$university", preserveNullAndEmptyArrays: true } },
  {
    $project: {
      _id: 1,
      applicationStatus: 1,
      applicationDeadline: 1,
      createdAt: 1,
      programName: "$program.name",
      universityName: "$university.name",
      country: "$university.country",
    },
  },
]

const MAX_LIST = 20

/** GET /api/stats — signed in only; application figures cover the caller's own applications. */
export async function getStats(req: Request, res: Response): Promise<void> {
  const scope = applicationScope(req)
  const requested = Number.parseInt(String(req.query["limit"] ?? ""), 10)
  const limit = Number.isFinite(requested) ? Math.min(Math.max(requested, 1), MAX_LIST) : 5
  const now = new Date()
  // Custom records the caller may see (an admin sees all of them)
  const custom = { $and: [visibleFilter(req.user), { isOfficial: false }] }

  const [figures, customUniversities, customPrograms, totalApplications, byStatus, byCountry, upcomingDeadlines, recentlyAdded] = await Promise.all([
    catalogueFigures(),
    University.countDocuments(custom),
    Program.countDocuments(custom),
    Application.countDocuments(scope),
    Application.aggregate<{ status: string; count: number }>([
      { $match: scope },
      { $group: { _id: "$applicationStatus", count: { $sum: 1 } } },
      { $project: { status: "$_id", count: 1, _id: 0 } },
      { $sort: { count: -1 } },
    ]),
    Application.aggregate<{ country: string; count: number }>([
      { $match: scope },
      { $group: { _id: "$programId", n: { $sum: 1 } } },
      { $lookup: { from: "programs", localField: "_id", foreignField: "_id", as: "p", pipeline: [{ $project: { universityId: 1 } }] } },
      { $unwind: "$p" },
      { $lookup: { from: "universities", localField: "p.universityId", foreignField: "_id", as: "u", pipeline: [{ $project: { country: 1 } }] } },
      { $unwind: "$u" },
      { $group: { _id: "$u.country", count: { $sum: "$n" } } },
      { $project: { country: "$_id", count: 1, _id: 0 } },
      { $sort: { count: -1 } },
      { $limit: 50 },
    ]),
    Application.aggregate([
      { $match: { ...scope, applicationDeadline: { $gte: now, $lte: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000) } } },
      { $sort: { applicationDeadline: 1 } },
      { $limit: limit },
      ...SUMMARY,
    ]),
    Application.aggregate([{ $match: scope }, { $sort: { createdAt: -1 } }, { $limit: limit }, ...SUMMARY]),
  ])

  res.json({
    totalUniversities: figures.officialUniversities + customUniversities,
    totalPrograms: figures.officialPrograms + customPrograms,
    totalApplications,
    countriesCount: figures.countriesCount,
    citiesCount: figures.citiesCount,
    byStatus,
    byCountry: byCountry.filter((c) => c.country),
    avgTuition: figures.avgTuition,
    scholarshipCount: figures.scholarshipCount,
    upcomingDeadlines,
    recentlyAdded,
  })
}
