import type { Request, Response } from "express"
import { Country } from "../models/Country"
import { University } from "../models/University"
import { City } from "../models/City"

export async function getAll(_req: Request, res: Response): Promise<void> {
  const countries = await Country.find().sort({ name: 1 })
  res.json(countries)
}

export async function getById(req: Request, res: Response): Promise<void> {
  const country = await Country.findById(req.params["id"])
  if (!country) {
    res.status(404).json({ message: "Country not found" })
    return
  }
  res.json(country)
}

export async function getWithUniversities(
  req: Request,
  res: Response
): Promise<void> {
  const country = await Country.findById(req.params["id"])
  if (!country) {
    res.status(404).json({ message: "Country not found" })
    return
  }

  const universities = await University.find({ country: country.name }).sort({
    name: 1,
  })

  const cities = await City.find({ country: country.name }).sort({ name: 1 })

  res.json({ country, universities, cities })
}

export async function create(req: Request, res: Response): Promise<void> {
  const body = req.body as Record<string, unknown>

  const name = body["name"]
  const visaRequirements = body["visaRequirements"]
  const visaAcceptanceRate = body["visaAcceptanceRate"]
  const visaBankAccountAmount = body["visaBankAccountAmount"]
  const visaBankAccountLocked = body["visaBankAccountLocked"]

  if (
    !name ||
    !visaRequirements ||
    visaAcceptanceRate == null ||
    visaBankAccountAmount == null ||
    visaBankAccountLocked == null
  ) {
    res.status(400).json({
      message:
        "Missing required fields: name, visaRequirements, visaAcceptanceRate, visaBankAccountAmount, visaBankAccountLocked",
    })
    return
  }

  const country = await Country.create(req.body)
  res.status(201).json(country)
}

export async function update(req: Request, res: Response): Promise<void> {
  const country = await Country.findByIdAndUpdate(req.params["id"], req.body, {
    new: true,
    runValidators: true,
  })
  if (!country) {
    res.status(404).json({ message: "Country not found" })
    return
  }
  res.json(country)
}

export async function remove(req: Request, res: Response): Promise<void> {
  const country = await Country.findById(req.params["id"])
  if (!country) {
    res.status(404).json({ message: "Country not found" })
    return
  }

  const uniCount = await University.countDocuments({ country: country.name })
  if (uniCount > 0) {
    res.status(400).json({
      message: `Cannot delete country with ${uniCount} linked universities. Remove them first.`,
    })
    return
  }

  const cityCount = await City.countDocuments({ country: country.name })
  if (cityCount > 0) {
    res.status(400).json({
      message: `Cannot delete country with ${cityCount} linked cities. Remove them first.`,
    })
    return
  }

  await Country.findByIdAndDelete(req.params["id"])
  res.json({ message: "Country deleted" })
}
