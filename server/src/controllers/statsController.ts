import type { Request, Response } from "express"
import "../middleware/auth"
import { University } from "../models/University"
import { Program } from "../models/Program"
import { Application } from "../models/Application"
import { Country } from "../models/Country"
import { City } from "../models/City"
import { Types } from "mongoose"

const POPULATE_PROGRAM_UNI = {
  path: "programId",
  populate: { path: "universityId", select: "name country city" },
}

/** Build a filter object that scopes application records to the current user. */
function applicationScope(req: Request): Record<string, unknown> {
  const filter: Record<string, unknown> = {}
  if (req.user?.role === "agency") {
    filter["agencyId"] = new Types.ObjectId(req.user._id)
  } else if (req.user?.role === "student") {
    filter["createdBy"] = req.user._id
  }
  return filter
}

export async function getStats(req: Request, res: Response): Promise<void> {
  const scope = applicationScope(req)

  const [
    totalUniversities,
    totalPrograms,
    totalApplications,
    countriesCount,
    citiesCount,
    byStatus,
    avgTuitionResult,
    scholarshipCount,
    recentlyAdded,
  ] = await Promise.all([
    University.countDocuments(),
    Program.countDocuments(),
    Application.countDocuments(scope),
    Country.countDocuments(),
    City.countDocuments(),
    Application.aggregate([
      { $match: scope },
      { $group: { _id: "$applicationStatus", count: { $sum: 1 } } },
      { $project: { status: "$_id", count: 1, _id: 0 } },
      { $sort: { count: -1 } },
    ]),
    Program.aggregate([
      { $group: { _id: null as unknown, avg: { $avg: "$tuitionFee" } } },
      { $project: { _id: 0, avg: 1 } },
    ]).then((r) => (r[0] ? r[0].avg : 0)),
    Program.countDocuments({ scholarshipAvailable: true }),
    Application.find(scope)
      .populate(POPULATE_PROGRAM_UNI)
      .sort({ createdAt: -1 })
      .limit(5),
  ])

  // byCountry: aggregate applications -> program -> university -> country
  const apps = await Application.find(scope)
    .populate({
      path: "programId",
      populate: { path: "universityId", select: "country" },
    })
    .lean()
  const countryMap: Record<string, number> = {}
  for (const app of apps) {
    const prog = app.programId as unknown as {
      universityId?: { country?: string }
    }
    const uni = prog?.universityId
    if (uni?.country) {
      countryMap[uni.country] = (countryMap[uni.country] || 0) + 1
    }
  }
  const byCountry = Object.entries(countryMap)
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count)

  // upcomingDeadlines: applications with deadline in next 90 days
  const upcomingDeadlines = await Application.find({
    ...scope,
    applicationDeadline: {
      $gte: new Date(),
      $lte: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    },
  })
    .populate(POPULATE_PROGRAM_UNI)
    .sort({ applicationDeadline: 1 })
    .select("applicationDeadline applicationStatus")

  res.json({
    totalUniversities,
    totalPrograms,
    totalApplications,
    countriesCount,
    citiesCount,
    byStatus,
    byCountry,
    avgTuition: Math.round((avgTuitionResult as number) * 100) / 100,
    scholarshipCount,
    upcomingDeadlines,
    recentlyAdded,
  })
}
