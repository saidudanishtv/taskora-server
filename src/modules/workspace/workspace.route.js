import { Router } from "express";
import { z } from "zod";
import {
  requireAuth,
  requireActiveUser,
} from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  createWorkspace,
  getMyWorkspaces,
  joinWorkspace,
  deleteWorkspace,
  getWorkspaceMembers,
  updateMemberRole,
  removeMember,
} from "./workspace.controller.js";

const router = Router();

const createWorkspaceSchema = z.object({
  body: z.object({
    name: z.string().min(2),
  }),
});

const joinWorkspaceSchema = z.object({
  body: z.object({
    inviteCode: z.string().min(1),
  }),
});
const paramsSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});
const memberParamsSchema = z.object({
  params: z.object({
    id: z.string().min(1),
    userId: z.string().min(1),
  }),
});

const updateRoleSchema = z.object({
  params: z.object({
    id: z.string().min(1),
    userId: z.string().min(1),
  }),
  body: z.object({
    role: z.enum(["admin", "member"]),
  }),
});
router.use(requireAuth);
router.use(requireActiveUser);

router.post("/", validate(createWorkspaceSchema), createWorkspace);
router.get("/", getMyWorkspaces);
router.post("/join", validate(joinWorkspaceSchema), joinWorkspace);
router.get("/:id/members", validate(paramsSchema), getWorkspaceMembers);
router.patch(
  "/:id/members/:userId/role",
  validate(updateRoleSchema),
  updateMemberRole,
);
router.delete(
  "/:id/members/:userId",
  validate(memberParamsSchema),
  removeMember,
);
router.delete("/:id", validate(paramsSchema), deleteWorkspace);

export default router;
