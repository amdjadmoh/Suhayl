import type { Request, Response } from "express"
import { Notification } from "../models/Notification"

export async function getNotifications(req: Request, res: Response): Promise<void> {
  const notifications = await Notification.find({ userId: req.user!._id })
    .sort({ createdAt: -1 })
    .limit(20)
  const unreadCount = await Notification.countDocuments({ userId: req.user!._id, read: false })
  res.json({ notifications, unreadCount })
}

export async function markRead(req: Request, res: Response): Promise<void> {
  const id = req.params["id"] as string
  await Notification.findOneAndUpdate(
    { _id: id as any, userId: req.user!._id as any },
    { read: true }
  )
  res.json({ message: "Marked as read" })
}

export async function markAllRead(req: Request, res: Response): Promise<void> {
  await Notification.updateMany(
    { userId: req.user!._id, read: false },
    { read: true }
  )
  res.json({ message: "All marked as read" })
}
