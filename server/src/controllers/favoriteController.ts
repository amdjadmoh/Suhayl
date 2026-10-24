import type { Request, Response } from "express"
import { Favorite } from "../models/Favorite"
import { findVisibleProgram, findVisibleUniversity } from "../services/visibility"
import { Country } from "../models/Country"
import { City } from "../models/City"

export async function getFavorites(req: Request, res: Response): Promise<void> {
  const favorites = await Favorite.find({ userId: req.user!._id })
  res.json(favorites)
}

export async function addFavorite(req: Request, res: Response): Promise<void> {
  const { type, itemId } = req.body as { type: string; itemId: string }
  const visible =
    type === "program" ? await findVisibleProgram(req.user, itemId)
    : type === "university" ? await findVisibleUniversity(req.user, itemId)
    : type === "country" ? await Country.exists({ _id: itemId })
    : await City.exists({ _id: itemId })
  if (!visible) {
    res.status(404).json({ message: "Not found" })
    return
  }
  try {
    const fav = await Favorite.create({ userId: req.user!._id, type: type as any, itemId: itemId as any })
    res.status(201).json(fav)
  } catch (err: any) {
    if (err.code === 11000) {
      res.status(409).json({ message: "Already favorited" })
    } else {
      res.status(500).json({ message: "Failed to add favorite" })
    }
  }
}

export async function removeFavorite(req: Request, res: Response): Promise<void> {
  const type = req.params["type"] as string
  const itemId = req.params["itemId"] as string
  await Favorite.findOneAndDelete({ userId: req.user!._id, type: type as any, itemId: itemId as any })
  res.json({ message: "Removed" })
}
