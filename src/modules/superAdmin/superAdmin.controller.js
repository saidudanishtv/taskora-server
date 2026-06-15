import { asyncHandler } from "../../utils/asyncHandler.js";
import { superAdminService } from "./superAdmin.service.js";

export const getSuperAdminOverview = asyncHandler(async (req, res) => {
  const overview = await superAdminService.getOverview();
  res.json(overview);
});

export const getSuperAdminUsers = asyncHandler(async (req, res) => {
  const users = await superAdminService.listUsers();
  res.json(users);
});

export const getSuperAdminWorkspaces = asyncHandler(async (req, res) => {
  const workspaces = await superAdminService.listWorkspaces();
  res.json(workspaces);
});

export const toggleUserActive = asyncHandler(async (req, res) => {
  const user = await superAdminService.toggleUserActive(
    req.validated.params.id,
  );
  res.json(user);
});
export const toggleWorkspaceActive = asyncHandler(async (req, res) => {
  const workspace = await superAdminService.toggleWorkspaceActive(
    req.validated.params.id,
  );

  res.json(workspace);
});
export const deleteWorkspace = asyncHandler(async (req, res) => {
  await superAdminService.deleteWorkspace(req.validated.params.id);

  res.status(204).send();
});
