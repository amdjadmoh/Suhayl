import { Router } from "express"
import { authenticate, authorize } from "../middleware/auth"
import { validate } from "../middleware/validate"
import {
  createStudentSchema,
  updateStudentSchema,
  createTaskSchema,
  updateTaskSchema,
  createPaymentSchema,
  bulkDocumentSchema,
  bulkAssignSchema,
} from "../validators/studentValidator"
import { bulkAssign } from "../controllers/teamController"
import { addPayment, addTask, bulkRequestDocument, removePayment, removeTask, updateTask } from "../controllers/studentWorkController"
import { getAll, getById, create, update, remove } from "../controllers/studentController"
import { createDocumentRequestSchema } from "../validators/documentValidator"
import { createRequest, disablePortal, enablePortal, listForStudent } from "../controllers/documentController"

export const studentRouter = Router()

studentRouter.use(authenticate, authorize("agency"))

// Before "/:id" so "bulk" isn't read as a student id
studentRouter.post("/bulk/documents", validate(bulkDocumentSchema, "body"), bulkRequestDocument)
studentRouter.post("/bulk/assign", validate(bulkAssignSchema, "body"), bulkAssign)
studentRouter.get("/", getAll)
studentRouter.get("/:id", getById)
studentRouter.post("/", validate(createStudentSchema, "body"), create)
studentRouter.put("/:id", validate(updateStudentSchema, "body"), update)
studentRouter.delete("/:id", remove)
studentRouter.get("/:id/documents", listForStudent)
studentRouter.post("/:id/documents", validate(createDocumentRequestSchema, "body"), createRequest)
studentRouter.post("/:id/portal", enablePortal)
studentRouter.delete("/:id/portal", disablePortal)
studentRouter.post("/:id/tasks", validate(createTaskSchema, "body"), addTask)
studentRouter.put("/:id/tasks/:taskId", validate(updateTaskSchema, "body"), updateTask)
studentRouter.delete("/:id/tasks/:taskId", removeTask)
studentRouter.post("/:id/payments", validate(createPaymentSchema, "body"), addPayment)
studentRouter.delete("/:id/payments/:paymentId", removePayment)
