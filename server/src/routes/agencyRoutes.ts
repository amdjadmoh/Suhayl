import { Router } from "express"
import {
  getMyStudents,
  getUniversities,
  getApplications,
  exportApplicationsCsv,
} from "../controllers/agencyController"
import { authenticate, authorize } from "../middleware/auth"

export const agencyRouter = Router()

agencyRouter.get(
  "/applications/export.csv",
  authenticate,
  authorize("agency", "admin"),
  exportApplicationsCsv,
)

agencyRouter.use(authenticate)
agencyRouter.use(authorize("agency"))

agencyRouter.get("/students", getMyStudents)
agencyRouter.get("/universities", getUniversities)
agencyRouter.get("/applications", getApplications)
