import { Router } from "express";
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  toggleTaskCompletion,
  deleteTask,
  clearCompletedTasks,
} from "../controllers/tasks.controller";
import {
  validateBody,
  validateQuery,
  validateParams,
} from "../middleware/validate";
import {
  createTaskSchema,
  updateTaskSchema,
  taskQuerySchema,
  taskIdParamSchema,
} from "../schemas/task.schema";
import { requireAuth } from "../middleware/auth";

const router = Router();

// enforce authentication for all database task operations
router.use(requireAuth);

router.get("/", validateQuery(taskQuerySchema), getTasks);
router.post("/", validateBody(createTaskSchema), createTask);
router.delete("/completed", clearCompletedTasks);
router.get("/:id", validateParams(taskIdParamSchema), getTaskById);
router.patch("/:id", validateParams(taskIdParamSchema), validateBody(updateTaskSchema), updateTask);
router.patch("/:id/toggle", validateParams(taskIdParamSchema), toggleTaskCompletion);
router.delete("/:id", validateParams(taskIdParamSchema), deleteTask);

export default router;
