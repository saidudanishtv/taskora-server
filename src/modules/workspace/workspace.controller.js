import { asyncHandler } from "../../utils/asyncHandler.js";
import { workspaceService } from "./workspace.service.js";

export const createWorkspace = asyncHandler(async (req, res) => {
  const workspace = await workspaceService.createWorkspace({
    name: req.validated.body.name,
    userId: req.user.id,
  });

  res.status(201).json(workspace);
});

export const getMyWorkspaces = asyncHandler(async (req, res) => {
  const workspaces = await workspaceService.getMyWorkspaces(req.user.id);

  res.json(workspaces);
});

export const joinWorkspace = asyncHandler(async (req, res) => {
  const workspace = await workspaceService.joinWorkspace({
    inviteCode: req.validated.body.inviteCode,
    userId: req.user.id,
  });

  res.json(workspace);
});
export const deleteWorkspace = asyncHandler(async (req, res) => {
  await workspaceService.deleteWorkspace({
    workspaceId: req.validated.params.id,
    userId: req.user.id,
  });

  res.status(204).send();
});
export const getWorkspaceMembers = asyncHandler(async (req, res) => {
  const members = await workspaceService.getWorkspaceMembers({
    workspaceId: req.validated.params.id,
    userId: req.user.id,
  });

  res.json(members);
});

export const updateMemberRole = asyncHandler(async (req, res) => {
  const workspace = await workspaceService.updateMemberRole({
    workspaceId: req.validated.params.id,
    targetUserId: req.validated.params.userId,
    role: req.validated.body.role,
    userId: req.user.id,
  });

  res.json(workspace);
});

export const removeMember = asyncHandler(async (req, res) => {
  await workspaceService.removeMember({
    workspaceId: req.validated.params.id,
    targetUserId: req.validated.params.userId,
    userId: req.user.id,
  });

  res.status(204).send();
});
