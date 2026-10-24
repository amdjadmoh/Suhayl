import { Router } from "express"
import { documentUpload } from "../services/files"
import { download, getPortal, requireOpenDocument, requirePortalLink, upload } from "../controllers/portalController"

export const portalRouter = Router()

// Rate limited in app.ts (portalLimiter): keeps guessing and upload floods slow.
// The link (and, for uploads, the document) is checked before multer reads the body,
// so an invalid or expired link can't make the server parse a large upload.
portalRouter.get("/:token", requirePortalLink, getPortal)
portalRouter.post("/:token/documents/:docId", requirePortalLink, requireOpenDocument, documentUpload.single("file"), upload)
portalRouter.get("/:token/documents/:docId/file", requirePortalLink, download)
