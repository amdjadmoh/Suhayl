import type { Request, Response } from "express"
import { Program } from "../models/Program"
import { University } from "../models/University"
import { Application } from "../models/Application"

export async function getAll(req: Request, res: Response): Promise<void> {
  const filter: Record<string, unknown> = {}

  const universityId = req.query["universityId"]
  if (typeof universityId === "string" && universityId.length > 0) filter["universityId"] = universityId

  const degreeLevel = req.query["degreeLevel"]
  if (typeof degreeLevel === "string") filter["degreeLevel"] = degreeLevel

  // Combine search + field into an $and if both present
  const search = req.query["search"]
  const field = req.query["field"]
  const nameConditions: Record<string, unknown>[] = []
  if (typeof search === "string" && search.length > 0) {
    nameConditions.push({ name: { $regex: search, $options: "i" } })
  }
  if (typeof field === "string" && field.length > 0) {
    nameConditions.push({ name: { $regex: field, $options: "i" } })
  }
  if (nameConditions.length === 1) {
    Object.assign(filter, nameConditions[0])
  } else if (nameConditions.length > 1) {
    filter["$and"] = nameConditions
  }

  // Country filter – resolve country name to universities whose country matches
  const country = req.query["country"]
  if (typeof country === "string" && country.length > 0) {
    const matchingUnis = await University.find({ country: { $regex: country, $options: "i" } }).select("_id")
    const uniIds = matchingUnis.map((u) => u._id)
    if (uniIds.length > 0) {
      filter["universityId"] = { $in: uniIds }
    } else {
      res.json({ programs: [], total: 0 })
      return
    }
  }

  const [programs, total] = await Promise.all([
    Program.find(filter)
      .populate("universityId", "name country city ranking")
      .sort({ name: 1 }),
    Program.countDocuments(filter),
  ])
  res.json({ programs, total })
}

export async function getById(req: Request, res: Response): Promise<void> {
  const program = await Program.findById(req.params["id"]).populate(
    "universityId",
    "name country city ranking websiteUrl notes"
  )
  if (!program) {
    res.status(404).json({ message: "Program not found" })
    return
  }
  res.json(program)
}

export async function getByUniversity(req: Request, res: Response): Promise<void> {
  const uniId = req.params["universityId"]
  if (!uniId) {
    res.status(400).json({ message: "Missing universityId" })
    return
  }
  const programs = await Program.find({ universityId: uniId })
    .populate("universityId", "name country city ranking")
    .sort({ name: 1 })
  res.json(programs)
}

export async function create(req: Request, res: Response): Promise<void> {
  const body = req.body as Record<string, unknown>
  const name = body["name"]
  const universityId = body["universityId"]
  const degreeLevel = body["degreeLevel"]
  const tuitionFee = body["tuitionFee"]

  if (!name || !universityId || !degreeLevel || tuitionFee == null) {
    res
      .status(400)
      .json({
        message:
          "Missing required fields: name, universityId, degreeLevel, tuitionFee",
      })
    return
  }

  // Verify university exists
  const university = await University.findById(universityId as string)
  if (!university) {
    res.status(404).json({ message: "University not found" })
    return
  }

  const program = await Program.create(req.body)
  res.status(201).json(program)
}

export async function update(req: Request, res: Response): Promise<void> {
  const program = await Program.findByIdAndUpdate(req.params["id"], req.body, {
    new: true,
    runValidators: true,
  })
  if (!program) {
    res.status(404).json({ message: "Program not found" })
    return
  }
  res.json(program)
}

export async function remove(req: Request, res: Response): Promise<void> {
  const program = await Program.findById(req.params["id"])
  if (!program) {
    res.status(404).json({ message: "Program not found" })
    return
  }
  // Check for linked applications
  const appCount = await Application.countDocuments({ programId: program._id })
  if (appCount > 0) {
    res
      .status(400)
      .json({
        message: `Cannot delete program with ${appCount} linked applications. Remove them first.`,
      })
    return
  }
  await Program.findByIdAndDelete(req.params["id"])
  res.json({ message: "Program deleted" })
}
