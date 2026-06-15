import { asyncHandler } from "../../utils/asyncHandler.js";
import { workspaceInviteService } from "./workspaceInvite.service.js";

export const createWorkspaceInvite = asyncHandler(async (req, res) => {
  const result = await workspaceInviteService.createInvite({
    workspaceId: req.validated.body.workspaceId,
    email: req.validated.body.email,
    role: req.validated.body.role,
    userId: req.user.id,
  });

  res.status(201).json(result);
});

export const acceptWorkspaceInvite = asyncHandler(async (req, res) => {
  const workspace = await workspaceInviteService.acceptInvite({
    token: req.validated.params.token,
    userId: req.user.id,
  });

  res.json(workspace);
});
