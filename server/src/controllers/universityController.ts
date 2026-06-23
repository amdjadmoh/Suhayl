import type { Request, Response } from "express"
import { University } from "../models/University"
import type { SortOrder } from "mongoose"

type SortableField = "tuition" | "deadline" | "ranking" | "name"

const SORT_FIELD_MAP: Record<SortableField, string> = {
  tuition: "tuitionFee",
  deadline: "applicationDeadline",
  ranking: "ranking",
  name: "name",
}

function buildFilter(query: Request["query"]): Record<string, unknown> {
  const filter: Record<string, unknown> = {}

  const country = query["country"]
  if (typeof country === "string" && country.length > 0) {
    filter["country"] = country
  }

  const status = query["status"]
  if (typeof status === "string" && status.length > 0) {
    filter["applicationStatus"] = status
  }

  const degreeLevel = query["degreeLevel"]
  if (typeof degreeLevel === "string" && degreeLevel.length > 0) {
    filter["degreeLevel"] = degreeLevel
  }

  const search = query["search"]
  if (typeof search === "string" && search.length > 0) {
    filter["name"] = { $regex: search, $options: "i" }
  }

  return filter
}

function buildSort(query: Request["query"]): Record<string, SortOrder> {
  const sortByRaw = query["sortBy"]
  const sortBy: SortableField =
    typeof sortByRaw === "string" && sortByRaw in SORT_FIELD_MAP
      ? (sortByRaw as SortableField)
      : "name"

  const sortOrderRaw = query["sortOrder"]
  const direction: SortOrder =
    typeof sortOrderRaw === "string" && sortOrderRaw === "desc" ? -1 : 1

  const field = SORT_FIELD_MAP[sortBy]
  return field === undefined ? {} : { [field]: direction }
}

export async function getAll(req: Request, res: Response): Promise<void> {
  const filter = buildFilter(req.query)
  const sort = buildSort(req.query)
  const [universities, total] = await Promise.all([
    University.find(filter).sort(sort),
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
  const program = body["program"]
  const degreeLevel = body["degreeLevel"]
  const tuitionFee = body["tuitionFee"]

  if (!name || !country || !city || !program || !degreeLevel || tuitionFee == null) {
    res.status(400).json({
      message:
        "Missing required fields: name, country, city, program, degreeLevel, tuitionFee",
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
  const university = await University.findByIdAndDelete(req.params["id"])
  if (!university) {
    res.status(404).json({ message: "University not found" })
    return
  }
  res.json({ message: "University deleted" })
}

export async function getCountries(_req: Request, res: Response): Promise<void> {
  const countries = await University.distinct("country")
  res.json(countries)
}
