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

  // Visibility: show official OR created by current user OR admin sees all
  const customOnly = req.query["customOnly"]
  if (customOnly === "true" && req.user) {
    filter["isOfficial"] = false
    if (req.user.role !== "admin") filter["createdBy"] = req.user._id
  } else if (req.user?.role !== "admin") {
    filter["$or"] = [
      { isOfficial: true },
      ...(req.user ? [{ createdBy: req.user._id }] : []),
    ]
  }

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
  // Non-admin users can only see official or their own
  if (req.user?.role !== "admin" && !university.isOfficial && university.createdBy?.toString() !== req.user?._id) {
    res.status(403).json({ message: "Forbidden" })
    return
  }
  res.json(university)
}

export async function create(req: Request, res: Response): Promise<void> {
  // req.body is pre-validated by validate(createUniversitySchema, "body")
  // Build payload from parsed body — never pass req.body directly
  const payload: Record<string, unknown> = {
    ...req.body,
    createdBy: req.user?._id,
    isOfficial: false, // user-created starts as unofficial
  }
  const university = await University.create(payload)
  res.status(201).json(university)
}

export async function update(req: Request, res: Response): Promise<void> {
  const existing = await University.findById(req.params["id"])
  if (!existing) {
    res.status(404).json({ message: "University not found" })
    return
  }

  // Admin can edit any university. Non-admin can only edit custom universities
  // they themselves created — they cannot edit official (admin-curated)
  // universities even if they happen to be the recorded creator.
  const isAdmin = req.user?.role === "admin"
  const isCreator = existing.createdBy?.toString() === req.user?._id
  if (!isAdmin && (!isCreator || existing.isOfficial)) {
    res.status(403).json({
      message: "You can only edit custom universities you created",
    })
    return
  }

  // req.body is pre-validated by validate(updateUniversitySchema, "body")
  const university = await University.findByIdAndUpdate(
    req.params["id"],
    req.body,
    { new: true, runValidators: true }
  )
  res.json(university)
}

export async function toggleOfficial(req: Request, res: Response): Promise<void> {
  const university = await University.findById(req.params["id"])
  if (!university) { res.status(404).json({ message: "Not found" }); return }
  ;(university as any).isOfficial = !(university as any).isOfficial
  await university.save()
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

export async function updateRankings(req: Request, res: Response): Promise<void> {
  const existing = await University.findById(req.params["id"])
  if (!existing) {
    res.status(404).json({ message: "University not found" })
    return
  }

  // req.body is pre-validated by validate(updateRankingsSchema, "body")
  const university = await University.findByIdAndUpdate(
    req.params["id"],
    req.body,
    { new: true, runValidators: true }
  )
  res.json(university)
}

export async function getCountries(_req: Request, res: Response): Promise<void> {
  const countries = await University.distinct("country")
  res.json(countries)
}
