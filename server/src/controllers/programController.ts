import type { Request, Response } from "express"
import { Program } from "../models/Program"
import { University } from "../models/University"
import { Application } from "../models/Application"

export async function getAll(req: Request, res: Response): Promise<void> {
  const filter: Record<string, unknown> = {}
  const query = req.query as Record<string, unknown>

  const universityId = query["universityId"]
  if (typeof universityId === "string" && universityId.length > 0) filter["universityId"] = universityId

  const degreeLevel = query["degreeLevel"]
  if (typeof degreeLevel === "string") filter["degreeLevel"] = degreeLevel

  // Search via $text index for fast ranked results
  const search = query["search"]
  const hasTextSearch = typeof search === "string" && search.length > 0
  if (hasTextSearch) {
    filter["$text"] = { $search: search }
  }

  // Field filter — $regex fallback for name
  const field = query["field"]
  if (typeof field === "string" && field.length > 0) {
    const nameConditions: Record<string, unknown>[] = [{ name: { $regex: field, $options: "i" } }]
    if (hasTextSearch) {
      // Combine with $text via $and
      if (!filter["$and"]) {
        filter["$and"] = nameConditions
      } else {
        ;(filter["$and"] as Record<string, unknown>[]).push(...nameConditions)
      }
    } else {
      Object.assign(filter, nameConditions[0]!)
    }
  }

  // Country filter – resolve country name to universities whose country matches
  const country = query["country"]
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
  const minTuition = query["minTuition"]
  const maxTuition = query["maxTuition"]
  if (typeof minTuition === "number" || typeof maxTuition === "number") {
    const tuitionFilter: Record<string, unknown> = {}
    if (typeof minTuition === "number" && minTuition > 0) tuitionFilter["$gte"] = minTuition
    if (typeof maxTuition === "number" && maxTuition > 0) tuitionFilter["$lte"] = maxTuition
    if (Object.keys(tuitionFilter).length > 0) filter["tuitionFee"] = tuitionFilter
  }

  // GPA requirement filter (inside testRequirements)
  const minGpa = query["minGpa"]
  if (typeof minGpa === "number" && minGpa > 0) {
    filter["$or"] = [
      { testRequirements: { $elemMatch: { name: { $regex: /^gpa$/i }, minimumScore: { $lte: minGpa } } } },
      { testRequirements: { $exists: false } },
      { testRequirements: { $size: 0 } },
    ]
  }

  // IELTS requirement filter (inside testRequirements)
  const maxIelts = query["maxIelts"]
  if (typeof maxIelts === "number" && maxIelts > 0) {
    const ieltsFilter = [
      { testRequirements: { $elemMatch: { name: { $regex: /^ielts$/i }, minimumScore: { $lte: maxIelts } } } },
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
  if (query["scholarshipOnly"] === "true") {
    filter["scholarshipAvailable"] = true
  }

  // City filter
  const city = query["city"]
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
  const customOnly = query["customOnly"]
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

  const programs = await Program.find(
    filter,
    hasTextSearch ? ({ score: { $meta: "textScore" } } as Record<string, unknown>) : undefined
  )
    .populate("universityId", "name country city ranking")
    .sort(
      hasTextSearch
        ? ({ score: { $meta: "textScore" } } as unknown as Record<string, 1 | -1>)
        : ({ name: 1 } as Record<string, 1 | -1>)
    )

  const total = await Program.countDocuments(filter)

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

  // Compute match score (0-100) and admit chance for each program
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

    // ── Admit chance calculation ──────────────────────────────────────
    const DEFAULT_MIN_GPA = 3.0
    const DEFAULT_MIN_IELTS = 6.5

    const minGpa = gpaReq?.minimumScore ?? DEFAULT_MIN_GPA
    const minIelts = ieltsReq?.minimumScore ?? DEFAULT_MIN_IELTS

    const gpaOk = prefGpa <= 0 || prefGpa >= minGpa
    const ieltsOk = prefIelts <= 0 || prefIelts >= minIelts
    const gpaSafe = prefGpa <= 0 || prefGpa >= minGpa + 0.5
    const ieltsSafe = prefIelts <= 0 || prefIelts >= minIelts + 1.0

    let admitChance: "reach" | "target" | "safe"
    if ((gpaSafe && ieltsSafe) || (prefGpa <= 0 && ieltsSafe) || (gpaSafe && prefIelts <= 0)) {
      admitChance = "safe"
    } else if ((gpaOk && ieltsOk) || (prefGpa <= 0 && ieltsOk) || (gpaOk && prefIelts <= 0)) {
      admitChance = "target"
    } else {
      admitChance = "reach"
    }

    // Admit score (0-100): how likely the user is to get admitted
    let admitScore = 50
    if (prefGpa > 0 && minGpa > 0) {
      const gpaGap = prefGpa - minGpa
      admitScore += Math.min(25, Math.max(-25, Math.round(gpaGap * 25)))
    } else {
      admitScore += 10 // no GPA data = neutral positive
    }
    if (prefIelts > 0 && minIelts > 0) {
      const ieltsGap = prefIelts - minIelts
      admitScore += Math.min(25, Math.max(-25, Math.round(ieltsGap * 10)))
    } else {
      admitScore += 10 // no IELTS data = neutral positive
    }
    admitScore = Math.min(100, Math.max(0, Math.round(admitScore)))

    return {
      ...p.toObject(),
      matchScore: Math.min(100, Math.round(Math.max(0, score))),
      admitChance,
      admitScore,
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
  const body = req.body as {
    name: string
    universityId: string
    degreeLevel: string
    tuitionFee: number
  }
  const { name, universityId, degreeLevel, tuitionFee } = body

  // Verify university exists
  const university = await University.findById(universityId)
  if (!university) {
    res.status(404).json({ message: "University not found" })
    return
  }

  // Build payload from parsed body — never pass req.body directly
  const payload: Record<string, unknown> = {
    ...req.body,
    createdBy: req.user?._id,
    isOfficial: false, // user-created starts as unofficial
    verificationStatus: "manual", // user-added is manually verified
  }

  const program = await Program.create(payload)
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

  // req.body is pre-validated by validate(updateProgramSchema, "body")
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
