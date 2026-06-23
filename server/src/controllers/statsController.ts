import type { Request, Response } from "express"
import { University } from "../models/University"

export async function getStats(_req: Request, res: Response): Promise<void> {
  const [
    totalUniversities,
    countriesCount,
    byCountry,
    byStatus,
    avgTuitionResult,
    upcomingDeadlines,
    scholarshipCount,
    recentlyAdded,
  ] = await Promise.all([
    University.countDocuments(),

    University.distinct("country").then((c) => c.length),

    University.aggregate([
      { $group: { _id: "$country", count: { $sum: 1 } } },
      { $project: { country: "$_id", count: 1, _id: 0 } },
      { $sort: { count: -1 } },
    ]),

    University.aggregate([
      { $group: { _id: "$applicationStatus", count: { $sum: 1 } } },
      { $project: { status: "$_id", count: 1, _id: 0 } },
      { $sort: { count: -1 } },
    ]),

    University.aggregate([
      {
        $group: {
          _id: null as unknown,
          avg: { $avg: "$tuitionFee" },
        },
      },
      { $project: { _id: 0, avg: 1 } },
    ]).then((r) => (r[0] ? r[0].avg : 0)),

    University.find({
      applicationDeadline: {
        $gte: new Date(),
        $lte: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      },
    })
      .sort({ applicationDeadline: 1 })
      .select("name country city applicationDeadline applicationStatus"),

    University.countDocuments({ scholarshipAvailable: true }),

    University.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name country city applicationStatus createdAt"),
  ])

  res.json({
    totalUniversities,
    countriesCount,
    byCountry,
    byStatus,
    avgTuition: Math.round((avgTuitionResult as number) * 100) / 100,
    upcomingDeadlines,
    scholarshipCount,
    recentlyAdded,
  })
}
