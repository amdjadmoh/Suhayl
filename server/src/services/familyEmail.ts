import { User } from "../models/User"
import type { IStudentDocument } from "../models/Student"
import { isEmailEnabled, sendEmail } from "./email"
import { documentRequestEmail } from "./emailTemplates"
import { appUrl } from "../config"

/**
 * Emails a student's family that documents were requested, with their private
 * link. Only when email is set up and the family link is on (otherwise there's
 * nowhere for them to upload). Never throws.
 */
export async function notifyFamily(student: IStudentDocument, titles: string[], dueDate?: Date): Promise<boolean> {
  if (!isEmailEnabled() || !student.portalToken || titles.length === 0) return false
  try {
    const agency = await User.findById(student.agencyId).select("name")
    const mail = documentRequestEmail({
      studentName: student.name,
      agencyName: agency?.name ?? "Votre agence",
      titles,
      portalUrl: `${appUrl()}/portal/${student.portalToken}`,
      ...(dueDate ? { dueDate } : {}),
    })
    return (await sendEmail({ to: student.email, ...mail })).ok
  } catch {
    return false
  }
}
