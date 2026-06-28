import type { Request, Response } from "express"
import { City } from "../models/City"
import { University } from "../models/University"

export async function getAll(req: Request, res: Response): Promise<void> {
  const country = req.query["country"]
  if (typeof country === "string") {
    const cities = await City.find({ country } as any).sort({ name: 1 })
    res.json(cities)
    return
  }
  const cities = await City.find({}).sort({ name: 1 })
  res.json(cities)
}

export async function getById(req: Request, res: Response): Promise<void> {
  const city = await City.findById(req.params["id"])
  if (!city) {
    res.status(404).json({ message: "City not found" })
    return
  }
  res.json(city)
}

export async function getByCountry(
  req: Request,
  res: Response
): Promise<void> {
  const country = req.params["countryName"] as string
  const cities = await City.find({ country } as any).sort({ name: 1 })
  res.json(cities)
}

export async function getWithUniversities(
  req: Request,
  res: Response
): Promise<void> {
  const city = await City.findById(req.params["id"])
  if (!city) {
    res.status(404).json({ message: "City not found" })
    return
  }

  const universities = await University.find({
    city: city.name,
    country: city.country,
  }).sort({ name: 1 })

  res.json({ city, universities })
}

export async function create(req: Request, res: Response): Promise<void> {
  const body = req.body as Record<string, unknown>

  const name = body["name"]
  const country = body["country"]
  const averageRentSingle = body["averageRentSingle"]
  const averageRentShared = body["averageRentShared"]
  const monthlyLivingCost = body["monthlyLivingCost"]
  const qualityOfLifeScore = body["qualityOfLifeScore"]
  const safetyScore = body["safetyScore"]
  const publicTransportScore = body["publicTransportScore"]
  const studentFriendliness = body["studentFriendliness"]
  const englishFriendliness = body["englishFriendliness"]
  const language = body["language"]
  const climate = body["climate"]

  if (
    !name ||
    !country ||
    averageRentSingle == null ||
    averageRentShared == null ||
    monthlyLivingCost == null ||
    qualityOfLifeScore == null ||
    safetyScore == null ||
    publicTransportScore == null ||
    studentFriendliness == null ||
    englishFriendliness == null ||
    !language ||
    !climate
  ) {
    res.status(400).json({
      message:
        "Missing required fields: name, country, averageRentSingle, averageRentShared, monthlyLivingCost, qualityOfLifeScore, safetyScore, publicTransportScore, studentFriendliness, englishFriendliness, language, climate",
    })
    return
  }

  const city = await City.create(req.body)
  res.status(201).json(city)
}

export async function update(req: Request, res: Response): Promise<void> {
  const city = await City.findByIdAndUpdate(req.params["id"], req.body, {
    new: true,
    runValidators: true,
  })
  if (!city) {
    res.status(404).json({ message: "City not found" })
    return
  }
  res.json(city)
}

export async function remove(req: Request, res: Response): Promise<void> {
  const city = await City.findById(req.params["id"])
  if (!city) {
    res.status(404).json({ message: "City not found" })
    return
  }

  const uniCount = await University.countDocuments({
    city: city.name,
    country: city.country,
  })
  if (uniCount > 0) {
    res.status(400).json({
      message: `Cannot delete city with ${uniCount} linked universities. Remove them first.`,
    })
    return
  }

  await City.findByIdAndDelete(req.params["id"])
  res.json({ message: "City deleted" })
}
