import { Project } from "./project.model.js";
import { Workspace } from "../workspace/workspace.model.js";
import { ForbiddenError, NotFoundError } from "../../utils/errors.js";

const canManageProjects = (role) => {
  return ["owner", "admin"].includes(role);
};

const canViewProjects = (role) => {
  return ["owner", "admin", "member", "viewer"].includes(role);
};

const create = async (user, body) => {
  const { name, description, workspaceId, memberIds = [] } = body;

  const workspace = await Workspace.findById(workspaceId);

  if (!workspace) {
    throw new NotFoundError("Workspace not found");
  }
  if (!workspace.isActive) {
    throw new ForbiddenError("This workspace has been suspended");
  }
  const workspaceMember = workspace.members.find(
    (member) => member.user.toString() === user.id.toString(),
  );

  if (!workspaceMember) {
    throw new ForbiddenError("Access denied");
  }

  if (!canManageProjects(workspaceMember.role)) {
    throw new ForbiddenError("Only owner or admin can create projects");
  }

  const validProjectMembers = memberIds.filter((memberId) =>
    workspace.members.some(
      (workspaceMember) =>
        workspaceMember.user.toString() === memberId.toString(),
    ),
  );

  if (!validProjectMembers.includes(user.id.toString())) {
    validProjectMembers.push(user.id);
  }

  const project = await Project.create({
    name,
    description,
    workspace: workspaceId,
    members: validProjectMembers,
    createdBy: user.id,
  });

  return project.populate("members", "name email");
};

const list = async (user, query) => {
  const { workspaceId } = query;

  const workspace = await Workspace.findById(workspaceId);

  if (!workspace) {
    throw new NotFoundError("Workspace not found");
  }
  if (!workspace.isActive) {
    throw new ForbiddenError("This workspace has been suspended");
  }
  const workspaceMember = workspace.members.find(
    (member) => member.user.toString() === user.id.toString(),
  );

  if (!workspaceMember) {
    throw new ForbiddenError("Access denied");
  }

  if (!canViewProjects(workspaceMember.role)) {
    throw new ForbiddenError("You do not have permission to view projects");
  }

  return Project.find({ workspace: workspaceId })
    .populate("members", "name email")
    .populate("createdBy", "name email");
};

const remove = async (user, projectId) => {
  const project = await Project.findById(projectId);

  if (!project) {
    throw new NotFoundError("Project not found");
  }

  const workspace = await Workspace.findById(project.workspace);

  if (!workspace) {
    throw new NotFoundError("Workspace not found");
  }
  if (!workspace.isActive) {
    throw new ForbiddenError("This workspace has been suspended");
  }
  const workspaceMember = workspace.members.find(
    (member) => member.user.toString() === user.id.toString(),
  );

  if (!workspaceMember) {
    throw new ForbiddenError("Access denied");
  }

  if (!canManageProjects(workspaceMember.role)) {
    throw new ForbiddenError("Only owner or admin can delete projects");
  }

  await project.deleteOne();

  return true;
};

export const projectService = {
  create,
  list,
  remove,
};
