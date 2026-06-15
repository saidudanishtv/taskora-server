import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireActiveUser } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  acceptWorkspaceInvite,
  createWorkspaceInvite,
  previewWorkspaceInvite,
} from "./workspaceInvite.controller.js";

const router = Router();

const createInviteSchema = z.object({
  body: z.object({
    workspaceId: z.string().min(1),
    email: z.string().email(),
    role: z.enum(["admin", "member", "viewer"]),
  }),
});

const acceptInviteSchema = z.object({
  params: z.object({
    token: z.string().min(1),
  }),
});

// Public — no auth required, used to show invite context before login/signup
router.get("/preview/:token", previewWorkspaceInvite);

router.use(requireAuth);

// Creating an invite requires an active account; accepting does not (pending users can accept)
router.post("/", requireActiveUser, validate(createInviteSchema), createWorkspaceInvite);
router.post(
  "/accept/:token",
  validate(acceptInviteSchema),
  acceptWorkspaceInvite,
);

export default router;
