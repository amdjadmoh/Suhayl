import type { Request, Response } from "express"
import { SavedSearch } from "../models/SavedSearch"

export async function list(req: Request, res: Response): Promise<void> {
  const savedSearches = await SavedSearch.find({ userId: req.user!._id }).sort({
    createdAt: -1,
  })
  res.json(savedSearches)
}

export async function create(req: Request, res: Response): Promise<void> {
  const { name, entityType, filters } = req.body as {
    name: string
    entityType: string
    filters?: Record<string, unknown>
  }

  const savedSearch = await SavedSearch.create({
    userId: req.user!._id,
    name,
    entityType: entityType as "program" | "university",
    filters: filters ?? {},
  })

  res.status(201).json(savedSearch)
}

export async function remove(req: Request, res: Response): Promise<void> {
  const id = req.params["id"]
  if (!id) {
    res.status(400).json({ message: "Missing saved search ID" })
    return
  }

  const result = await SavedSearch.findOneAndDelete({
    _id: id,
    userId: req.user!._id,
  })

  if (!result) {
    res.status(404).json({ message: "Saved search not found" })
    return
  }

  res.json({ message: "Saved search deleted" })
}
