import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  createComment,
  listComments,
  updateComment,
  deleteComment,
} from "./comment.controller.js";

const router = Router();

const createCommentSchema = z.object({
  body: z.object({
    taskId: z.string().min(1),
    body: z.string().min(1).max(2000),
  }),
});

const listCommentSchema = z.object({
  query: z.object({
    taskId: z.string().min(1),
  }),
});
const updateCommentSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    body: z.string().min(1).max(2000),
  }),
});

const paramsSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

router.use(requireAuth);
router.post("/", validate(createCommentSchema), createComment);
router.get("/", validate(listCommentSchema), listComments);
router.put("/:id", validate(updateCommentSchema), updateComment);
router.delete("/:id", validate(paramsSchema), deleteComment);
export default router;
