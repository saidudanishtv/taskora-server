import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { requireSuperAdmin } from "../../middlewares/superAdmin.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  getSuperAdminOverview,
  getSuperAdminUsers,
  getSuperAdminWorkspaces,
  toggleUserActive,
  toggleWorkspaceActive,
  deleteWorkspace,
} from "./superAdmin.controller.js";

const router = Router();

const paramsSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

router.use(requireAuth);
router.use(requireSuperAdmin);

router.get("/overview", getSuperAdminOverview);
router.get("/users", getSuperAdminUsers);
router.get("/workspaces", getSuperAdminWorkspaces);
router.patch(
  "/users/:id/toggle-active",
  validate(paramsSchema),
  toggleUserActive,
);
router.patch(
  "/workspaces/:id/toggle-active",
  validate(paramsSchema),
  toggleWorkspaceActive,
);
router.delete("/workspaces/:id", validate(paramsSchema), deleteWorkspace);

export default router;
