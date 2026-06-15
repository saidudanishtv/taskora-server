import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireActiveUser } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  createTask,
  deleteTask,
  listTasks,
  updateTask,
} from "./task.controller.js";

const router = Router();

const statusSchema = z.enum(["todo", "in-progress", "done"]);

const prioritySchema = z.enum(["low", "medium", "high", "urgent"]);

const createTaskSchema = z.object({
  body: z.object({
    projectId: z.string().min(1),

    title: z.string().min(2),

    description: z.string().optional(),

    status: statusSchema.optional(),

    priority: prioritySchema.optional(),

    assignedTo: z.string().optional(),

    dueDate: z.string().datetime().optional(),
  }),
});

const listTaskSchema = z.object({
  query: z.object({
    projectId: z.string().min(1),
  }),
});

const updateTaskSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),

  body: z.object({
    title: z.string().min(2).optional(),

    description: z.string().optional(),

    status: statusSchema.optional(),

    priority: prioritySchema.optional(),

    assignedTo: z.string().nullable().optional(),

    dueDate: z.string().datetime().nullable().optional(),
  }),
});

const paramsSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

router.use(requireAuth, requireActiveUser);

router.post("/", validate(createTaskSchema), createTask);

router.get("/", validate(listTaskSchema), listTasks);

router.put("/:id", validate(updateTaskSchema), updateTask);

router.delete("/:id", validate(paramsSchema), deleteTask);

export default router;
