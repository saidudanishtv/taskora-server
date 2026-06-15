import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireActiveUser } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { getDashboardStats } from "./dashboard.controller.js";

const router = Router();

const dashboardParamsSchema = z.object({
  params: z.object({
    workspaceId: z.string().min(1),
  }),
});

router.use(requireAuth, requireActiveUser);

router.get("/:workspaceId", validate(dashboardParamsSchema), getDashboardStats);

export default router;
