import { asyncHandler } from "../../utils/asyncHandler.js";
import { projectService } from "./project.service.js";

export const createProject = asyncHandler(async (req, res) => {
  const project = await projectService.create(req.user, req.validated.body);
  res.status(201).json(project);
});

export const listProjects = asyncHandler(async (req, res) => {
  const projects = await projectService.list(req.user, req.validated.query);
  res.json(projects);
});

export const deleteProject = asyncHandler(async (req, res) => {
  await projectService.remove(req.user, req.validated.params.id);
  res.status(204).send();
});
