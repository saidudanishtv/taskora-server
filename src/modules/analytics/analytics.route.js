import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { getWorkspaceAnalytics } from "./analytics.controller.js";

const router = Router();

const paramsSchema = z.object({
  params: z.object({
    workspaceId: z.string().min(1),
  }),
});

router.use(requireAuth);

router.get("/:workspaceId", validate(paramsSchema), getWorkspaceAnalytics);

export default router;
