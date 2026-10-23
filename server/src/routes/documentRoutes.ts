import { Router } from "express"
import { authenticate, authorize } from "../middleware/auth"
import { validate } from "../middleware/validate"
import { reviewDocumentSchema } from "../validators/documentValidator"
import { download, listForAgency, remove, review } from "../controllers/documentController"

export const documentRouter = Router()

documentRouter.use(authenticate, authorize("agency"))

documentRouter.get("/", listForAgency)
documentRouter.put("/:id", validate(reviewDocumentSchema, "body"), review)
documentRouter.delete("/:id", remove)
documentRouter.get("/:id/file", download)
