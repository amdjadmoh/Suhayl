import type { Request, Response } from "express"
import { University } from "../models/University"
import { Program } from "../models/Program"

function buildFilter(query: Request["query"]): Record<string, unknown> {
  const filter: Record<string, unknown> = {}

  const country = query["country"]
  if (typeof country === "string" && country.length > 0) {
    filter["country"] = country
  }

  const search = query["search"]
  if (typeof search === "string" && search.length > 0) {
    filter["name"] = { $regex: search, $options: "i" }
  }

  return filter
}

export async function getAll(req: Request, res: Response): Promise<void> {
  const filter = buildFilter(req.query)

  const [universities, total] = await Promise.all([
    University.find(filter).sort({ name: 1 }),
    University.countDocuments(filter),
  ])
  res.json({ universities, total })
}

export async function getById(req: Request, res: Response): Promise<void> {
  const university = await University.findById(req.params["id"])
  if (!university) {
    res.status(404).json({ message: "University not found" })
    return
  }
  res.json(university)
}

export async function create(req: Request, res: Response): Promise<void> {
  const body = req.body as Record<string, unknown>
  const name = body["name"]
  const country = body["country"]
  const city = body["city"]

  if (!name || !country || !city) {
    res.status(400).json({
      message: "Missing required fields: name, country, city",
    })
    return
  }

  const university = await University.create(req.body)
  res.status(201).json(university)
}

export async function update(req: Request, res: Response): Promise<void> {
  const university = await University.findByIdAndUpdate(
    req.params["id"],
    req.body,
    { new: true, runValidators: true }
  )
  if (!university) {
    res.status(404).json({ message: "University not found" })
    return
  }
  res.json(university)
}

export async function remove(req: Request, res: Response): Promise<void> {
  const existing = await University.findById(req.params["id"])
  if (!existing) {
    res.status(404).json({ message: "University not found" })
    return
  }

  // Prevent deletion if programs exist for this university
  const progCount = await Program.countDocuments({ universityId: existing._id })
  if (progCount > 0) {
    res.status(400).json({
      message: `Cannot delete university: ${progCount} program(s) reference it. Remove programs first.`,
    })
    return
  }

  await University.findByIdAndDelete(req.params["id"])
  res.json({ message: "University deleted" })
}

export async function getCountries(_req: Request, res: Response): Promise<void> {
  const countries = await University.distinct("country")
  res.json(countries)
}
