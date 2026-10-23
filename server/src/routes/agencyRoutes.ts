import { Router } from "express"
import {
  getMyStudents,
  getUniversities,
  getApplications,
  exportApplicationsCsv,
  importStudents,
  upload,
} from "../controllers/agencyController"
import { authenticate, authorize } from "../middleware/auth"
import { validate } from "../middleware/validate"
import { inviteMemberSchema } from "../validators/authValidator"
import { inviteMember, listTeam, removeMember, renewInvite } from "../controllers/teamController"

export const agencyRouter = Router()

agencyRouter.get(
  "/applications/export.csv",
  authenticate,
  authorize("agency", "admin"),
  exportApplicationsCsv,
)

agencyRouter.use(authenticate)
agencyRouter.use(authorize("agency"))

agencyRouter.post("/students/import", upload.single("file"), importStudents)
agencyRouter.get("/students", getMyStudents)
agencyRouter.get("/universities", getUniversities)
agencyRouter.get("/applications", getApplications)
agencyRouter.get("/team", listTeam)
agencyRouter.post("/team", validate(inviteMemberSchema, "body"), inviteMember)
agencyRouter.post("/team/:id/invite", renewInvite)
agencyRouter.delete("/team/:id", removeMember)
