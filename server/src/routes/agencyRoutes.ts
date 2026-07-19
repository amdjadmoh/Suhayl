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
