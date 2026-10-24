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
import { inviteMember, listTeam, removeMember, renewInvite, resetMemberPassword } from "../controllers/teamController"
import { agencyActivity } from "../controllers/documentController"

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
agencyRouter.get("/activity", agencyActivity)
agencyRouter.post("/team", validate(inviteMemberSchema, "body"), inviteMember)
agencyRouter.post("/team/:id/invite", renewInvite)
agencyRouter.post("/team/:id/password-reset", resetMemberPassword)
agencyRouter.delete("/team/:id", removeMember)
