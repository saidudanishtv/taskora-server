import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  acceptWorkspaceInvite,
  createWorkspaceInvite,
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

router.use(requireAuth);

router.post("/", validate(createInviteSchema), createWorkspaceInvite);
router.post(
  "/accept/:token",
  validate(acceptInviteSchema),
  acceptWorkspaceInvite,
);

export default router;
