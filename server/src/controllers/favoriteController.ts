import type { Request, Response } from "express"
import { Favorite } from "../models/Favorite"

export async function getFavorites(req: Request, res: Response): Promise<void> {
  const favorites = await Favorite.find({ userId: req.user!._id })
  res.json(favorites)
}

export async function addFavorite(req: Request, res: Response): Promise<void> {
  const { type, itemId } = req.body
  if (!type || !itemId || !["country", "city", "university", "program"].includes(type)) {
    res.status(400).json({ message: "Invalid type or itemId" })
    return
  }
  try {
    const fav = await Favorite.create({ userId: req.user!._id, type, itemId })
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
