import { Types } from "mongoose"
import { Application } from "../models/Application"
import { Recommendation } from "../models/Recommendation"
import { Student } from "../models/Student"
import { Review } from "../models/Review"
import { Favorite } from "../models/Favorite"
import { SavedSearch } from "../models/SavedSearch"
import { Notification } from "../models/Notification"
import { PasswordResetToken } from "../models/PasswordResetToken"
import { Program } from "../models/Program"
import { University } from "../models/University"
import { DocumentRequest } from "../models/DocumentRequest"
import { removeFile } from "./files"
import { User } from "../models/User"
import { Activity } from "../models/Activity"

/** Deletes document requests and the files sent for them. */
export async function deleteDocuments(filter: Record<string, unknown>): Promise<void> {
  const docs = await DocumentRequest.find(filter).select("file")
  await Promise.all(docs.map((d) => removeFile(d.file?.storedName)))
  await DocumentRequest.deleteMany(filter)
}

/** Deletes the applications matching `filter` together with their recommendation letters. */
export async function deleteApplications(filter: Record<string, unknown>): Promise<number> {
  const apps = await Application.find(filter).select("_id")
  if (apps.length === 0) return 0
  const ids = apps.map((a) => a._id)
  await Recommendation.deleteMany({ applicationId: { $in: ids } })
  await Application.deleteMany({ _id: { $in: ids } })
  return ids.length
}

/**
 * Removes everything that belongs to a user, so nothing is left pointing at an
 * account that no longer exists. Official catalogue entries they created stay.
 */
export async function deleteUserData(userId: string): Promise<void> {
  const id = new Types.ObjectId(userId)
  const members = await User.find({ agencyOwnerId: id }).select("_id")
  if (members.length) {
    await Notification.deleteMany({ userId: { $in: members.map((m) => m._id) } })
    await User.deleteMany({ agencyOwnerId: id })
  }
  await Student.updateMany({ counsellorId: id }, { $unset: { counsellorId: "" } })
  await deleteApplications({ $or: [{ createdBy: id }, { agencyId: id }] })
  await deleteDocuments({ agencyId: id })
  await Promise.all([
    Student.deleteMany({ agencyId: id }),
    Activity.deleteMany({ agencyId: id }),
    Review.deleteMany({ userId: id }),
    Favorite.deleteMany({ userId: id }),
    SavedSearch.deleteMany({ userId: id }),
    Notification.deleteMany({ userId: id }),
    PasswordResetToken.deleteMany({ userId: id as any }),
    Program.deleteMany({ createdBy: id, isOfficial: { $ne: true } }),
    University.deleteMany({ createdBy: id, isOfficial: { $ne: true } }),
  ])
}

/**
 * Moves an application's "letters received" count by `delta`. Students can also
 * count letters that arrived outside the app, so this adjusts rather than recounts.
 */
export async function countLetter(applicationId: Types.ObjectId | string, delta: 1 | -1): Promise<void> {
  await Application.updateOne(
    { _id: applicationId, ...(delta < 0 ? { "applicationProgress.recommendationsReceived": { $gt: 0 } } : {}) },
    { $inc: { "applicationProgress.recommendationsReceived": delta } },
  )
}
