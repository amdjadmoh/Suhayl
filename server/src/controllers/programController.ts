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

  // Tuition range filter
  const minTuition = req.query["minTuition"]
  const maxTuition = req.query["maxTuition"]
  if (typeof minTuition === "string" || typeof maxTuition === "string") {
    const tuitionFilter: Record<string, unknown> = {}
    if (typeof minTuition === "string" && minTuition.length > 0) tuitionFilter["$gte"] = Number(minTuition)
    if (typeof maxTuition === "string" && maxTuition.length > 0) tuitionFilter["$lte"] = Number(maxTuition)
    if (Object.keys(tuitionFilter).length > 0) filter["tuitionFee"] = tuitionFilter
  }

  // GPA requirement filter (inside testRequirements)
  const minGpa = req.query["minGpa"]
  if (typeof minGpa === "string" && minGpa.length > 0) {
    filter["$or"] = [
      { testRequirements: { $elemMatch: { name: { $regex: /^gpa$/i }, minimumScore: { $lte: Number(minGpa) } } } },
      { testRequirements: { $exists: false } },
      { testRequirements: { $size: 0 } },
    ]
  }

  // IELTS requirement filter (inside testRequirements)
  const maxIelts = req.query["maxIelts"]
  if (typeof maxIelts === "string" && maxIelts.length > 0) {
    const ieltsFilter = [
      { testRequirements: { $elemMatch: { name: { $regex: /^ielts$/i }, minimumScore: { $lte: Number(maxIelts) } } } },
      { testRequirements: { $exists: false } },
      { testRequirements: { $size: 0 } },
    ]
    if (filter["$or"]) {
      filter["$and"] = [{ $or: filter["$or"] }, { $or: ieltsFilter }]
      delete filter["$or"]
    } else {
      filter["$or"] = ieltsFilter
    }
  }

  // Scholarship only
  if (req.query["scholarshipOnly"] === "true") {
    filter["scholarshipAvailable"] = true
  }

  // City filter
  const city = req.query["city"]
  if (typeof city === "string" && city.length > 0) {
    const matchingUnis = await University.find({ city: { $regex: city, $options: "i" } }).select("_id")
    const uniIds = matchingUnis.map((u) => u._id)
    if (uniIds.length > 0) {
      if (Array.isArray(filter["universityId"])) {
        filter["universityId"] = { $in: uniIds }
      } else if (filter["universityId"] && typeof filter["universityId"] === "object" && "$in" in (filter["universityId"] as Record<string, unknown>)) {
        const existingIds = (filter["universityId"] as Record<string, unknown>)["$in"] as unknown[]
        const intersection = existingIds.filter((id) => uniIds.some((uid) => String(uid) === String(id)))
        if (intersection.length > 0) {
          ;(filter["universityId"] as Record<string, unknown>)["$in"] = intersection
        } else {
          res.json({ programs: [], total: 0 })
          return
        }
      } else {
        filter["universityId"] = { $in: uniIds }
      }
    } else {
      res.json({ programs: [], total: 0 })
      return
    }
  }

  // Visibility: show official OR created by current user OR admin sees all
  const customOnly = req.query["customOnly"]
  if (customOnly === "true" && req.user) {
    filter["isOfficial"] = false
    if (req.user.role !== "admin") filter["createdBy"] = req.user._id
  } else if (req.user?.role !== "admin") {
    const visFilter: Record<string, unknown>[] = [{ isOfficial: true }]
    if (req.user) visFilter.push({ createdBy: req.user._id })
    if (filter["$or"]) {
      filter["$and"] = [{ $or: visFilter }, { $or: filter["$or"] }]
      delete filter["$or"]
    } else {
      filter["$or"] = visFilter
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

export async function getMatches(req: Request, res: Response): Promise<void> {
  // Read user preferences from body or query (body preferred for POST, but use query for GET convenience)
  const { budget, gpa, ielts, countries: prefsCountries } = req.body || req.query

  const prefBudget = Number(budget)
  const prefGpa = Number(gpa)
  const prefIelts = Number(ielts)

  // Build filter - only include programs the student qualifies for
  const filter: Record<string, unknown> = {}

  if (prefBudget > 0) {
    filter["tuitionFee"] = { $lte: prefBudget }
  }
  if (prefGpa > 0) {
    filter["$or"] = [
      { testRequirements: { $elemMatch: { name: { $regex: /^gpa$/i }, minimumScore: { $lte: prefGpa } } } },
      { testRequirements: { $exists: false } },
      { testRequirements: { $size: 0 } },
    ]
  }
  if (prefIelts > 0) {
    filter["$or"] = [
      { testRequirements: { $elemMatch: { name: { $regex: /^ielts$/i }, minimumScore: { $lte: prefIelts } } } },
      { testRequirements: { $exists: false } },
      { testRequirements: { $size: 0 } },
    ]
  }

  // If countries specified, resolve to university IDs
  if (typeof prefsCountries === "string" && prefsCountries.length > 0) {
    const countryList = prefsCountries.split(",").map((s: string) => s.trim())
    const matchingUnis = await University.find({ country: { $in: countryList.map((c: string) => new RegExp(c, "i")) } }).select("_id")
    const uniIds = matchingUnis.map((u: any) => u._id)
    if (uniIds.length > 0) {
      filter["universityId"] = { $in: uniIds }
    } else {
      res.json({ matches: [], total: 0 })
      return
    }
  }

  // Visibility: show official OR created by current user OR admin sees all
  if (req.user?.role !== "admin") {
    const visFilter: Record<string, unknown>[] = [{ isOfficial: true }]
    if (req.user) visFilter.push({ createdBy: req.user._id })
    if (filter["$or"]) {
      filter["$and"] = [{ $or: visFilter }, { $or: filter["$or"] }]
      delete filter["$or"]
    } else {
      filter["$or"] = visFilter
    }
  }

  if (Object.keys(filter).length === 0) {
    res.status(400).json({ message: "Provide at least one preference: budget, gpa, ielts, or countries" })
    return
  }

  const programs = await Program.find(filter)
    .populate("universityId", "name country city ranking")
    .sort({ name: 1 })
    .limit(20)

  // Compute match score (0-100) for each program
  const matches = programs.map((p: any) => {
    let score = 50 // base
    const uni = p.universityId

    // Budget fit: lower tuition = higher score
    if (prefBudget > 0 && p.tuitionFee > 0) {
      score += Math.max(0, 25 - (p.tuitionFee / prefBudget) * 25)
    }
    // GPA fit: lower requirement = higher score
    const gpaReq = p.testRequirements?.find((t: { name: string }) => /^gpa$/i.test(t.name))
    if (prefGpa > 0 && gpaReq?.minimumScore > 0) {
      score += Math.min(15, ((prefGpa - gpaReq.minimumScore) / 1) * 5)
    }
    // IELTS fit
    const ieltsReq = p.testRequirements?.find((t: { name: string }) => /^ielts$/i.test(t.name))
    if (prefIelts > 0 && ieltsReq?.minimumScore > 0) {
      score += Math.min(5, ((prefIelts - ieltsReq.minimumScore) / 1) * 2)
    }
    // Scholarship bonus
    if (p.scholarshipAvailable) score += 10
    // Higher ranking bonus
    if (uni?.ranking && uni.ranking <= 100) score += 5

    return {
      ...p.toObject(),
      matchScore: Math.min(100, Math.round(Math.max(0, score))),
    }
  })

  matches.sort((a, b) => b.matchScore - a.matchScore)
  res.json({ matches, total: matches.length })
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
  // Non-admin users can only see official or their own
  if (req.user?.role !== "admin" && !program.isOfficial && program.createdBy?.toString() !== req.user?._id) {
    res.status(403).json({ message: "Forbidden" })
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

  req.body.createdBy = req.user?._id
  req.body.isOfficial = false // user-created starts as unofficial
  req.body.verificationStatus = "manual" // user-added is manually verified
  const program = await Program.create(req.body)
  res.status(201).json(program)
}

export async function update(req: Request, res: Response): Promise<void> {
  const existing = await Program.findById(req.params["id"])
  if (!existing) {
    res.status(404).json({ message: "Program not found" })
    return
  }

  // Admin can edit any program. Non-admin can only edit custom programs
  // they themselves created — they cannot edit official (admin-curated)
  // programs even if they happen to be the recorded creator.
  const isAdmin = req.user?.role === "admin"
  const isCreator = existing.createdBy?.toString() === req.user?._id
  if (!isAdmin && (!isCreator || existing.isOfficial)) {
    res.status(403).json({
      message: "You can only edit custom programs you created",
    })
    return
  }

  const program = await Program.findByIdAndUpdate(req.params["id"], req.body, {
    new: true,
    runValidators: true,
  })
  res.json(program)
}

export async function toggleOfficial(req: Request, res: Response): Promise<void> {
  const program = await Program.findById(req.params["id"])
  if (!program) { res.status(404).json({ message: "Not found" }); return }
  program.isOfficial = !program.isOfficial
  await program.save()
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
