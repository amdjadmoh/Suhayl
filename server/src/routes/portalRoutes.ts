import { Router } from "express"
import rateLimit from "express-rate-limit"
import { documentUpload } from "../services/files"
import { rateLimitStore } from "../services/rateLimitStore"
import { download, getPortal, upload } from "../controllers/portalController"

export const portalRouter = Router()

// Public links: keep guessing and upload floods slow
portalRouter.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 120,
    ...rateLimitStore("portal"),
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many requests, please try again later." },
  }),
)

portalRouter.get("/:token", getPortal)
portalRouter.post("/:token/documents/:docId", documentUpload.single("file"), upload)
portalRouter.get("/:token/documents/:docId/file", download)
