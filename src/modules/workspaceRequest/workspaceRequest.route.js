import express from "express";

import {
  createWorkspaceRequestController,
  getAllWorkspaceRequestsController,
  approveWorkspaceRequestController,
  rejectWorkspaceRequestController,
} from "./workspaceRequest.controller.js";
import { requireSuperAdmin } from "../../middlewares/superAdmin.middleware.js";
import {
  requireAuth,
  requireActiveUser,
} from "../../middlewares/auth.middleware.js";

const router = express.Router();

// Allow pending users to create workspace requests
router.post("/", requireAuth, createWorkspaceRequestController);

// Other endpoints require active user or super admin
router.get(
  "/",
  requireAuth,
  requireActiveUser,
  requireSuperAdmin,
  getAllWorkspaceRequestsController,
);

router.patch(
  "/:id/approve",
  requireAuth,
  requireActiveUser,
  requireSuperAdmin,
  approveWorkspaceRequestController,
);

router.patch(
  "/:id/reject",
  requireAuth,
  requireActiveUser,
  requireSuperAdmin,
  rejectWorkspaceRequestController,
);

export default router;
