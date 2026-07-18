import { Router } from "express"
import { authenticate } from "../middleware/auth"
import { getNotifications, markRead, markAllRead } from "../controllers/notificationController"

const notificationRouter = Router()
notificationRouter.get("/", authenticate, getNotifications)
notificationRouter.put("/:id/read", authenticate, markRead)
notificationRouter.put("/read-all", authenticate, markAllRead)

export default notificationRouter
