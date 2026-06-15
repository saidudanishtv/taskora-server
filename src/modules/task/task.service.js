import { Task } from "./task.model.js";
import { Project } from "../project/project.model.js";
import { Workspace } from "../workspace/workspace.model.js";

const canCreateTask = (role) => {
  return ["owner", "admin", "member"].includes(role);
};

const canViewTask = (role) => {
  return ["owner", "admin", "member", "viewer"].includes(role);
};

const canDeleteTask = (role) => {
  return ["owner", "admin"].includes(role);
};

const getWorkspaceMember = (workspace, userId) => {
  return workspace.members.find(
    (member) => member.user.toString() === userId.toString(),
  );
};

const create = async (user, body) => {
  const {
    title,
    description,
    status = "todo",
    priority = "medium",
    assignedTo,
    dueDate,
    projectId,
  } = body;

  const project = await Project.findById(projectId);

  if (!project) {
    throw new Error("Project not found");
  }

  const workspace = await Workspace.findById(project.workspace);

  if (!workspace) {
    throw new Error("Workspace not found");
  }
  if (!workspace.isActive) {
    throw new Error("This workspace has been suspended");
  }
  const workspaceMember = getWorkspaceMember(workspace, user.id);

  if (!workspaceMember) {
    throw new Error("Access denied");
  }

  if (!canCreateTask(workspaceMember.role)) {
    throw new Error("Viewers cannot create tasks");
  }

  const projectMember = project.members.find(
    (memberId) => memberId.toString() === user.id.toString(),
  );

  if (!projectMember && !["owner", "admin"].includes(workspaceMember.role)) {
    throw new Error("You are not part of this project");
  }

  const task = await Task.create({
    title,
    description,
    status,
    priority,
    assignedTo,
    dueDate,
    workspace: workspace._id,
    project: project._id,
    createdBy: user.id,
  });

  return task.populate("assignedTo", "name email");
};

const list = async (user, query) => {
  const { projectId } = query;

  const project = await Project.findById(projectId);

  if (!project) {
    throw new Error("Project not found");
  }

  const workspace = await Workspace.findById(project.workspace);

  if (!workspace) {
    throw new Error("Workspace not found");
  }
  if (!workspace.isActive) {
    throw new Error("This workspace has been suspended");
  }
  const workspaceMember = getWorkspaceMember(workspace, user.id);

  if (!workspaceMember) {
    throw new Error("Access denied");
  }

  if (!canViewTask(workspaceMember.role)) {
    throw new Error("You do not have permission to view tasks");
  }

  const projectMember = project.members.find(
    (memberId) => memberId.toString() === user.id.toString(),
  );

  if (!projectMember && !["owner", "admin"].includes(workspaceMember.role)) {
    throw new Error("Access denied");
  }

  return Task.find({ project: projectId })
    .populate("assignedTo", "name email")
    .populate("createdBy", "name email");
};

const update = async (user, taskId, body) => {
  const task = await Task.findById(taskId).populate("project");

  if (!task) {
    throw new Error("Task not found");
  }

  const workspace = await Workspace.findById(task.workspace);

  if (!workspace) {
    throw new Error("Workspace not found");
  }
  if (!workspace.isActive) {
    throw new Error("This workspace has been suspended");
  }
  const workspaceMember = getWorkspaceMember(workspace, user.id);

  if (!workspaceMember) {
    throw new Error("Access denied");
  }

  if (workspaceMember.role === "viewer") {
    throw new Error("Viewers cannot update tasks");
  }

  const projectMember = task.project.members.find(
    (memberId) => memberId.toString() === user.id.toString(),
  );

  if (!projectMember && !["owner", "admin"].includes(workspaceMember.role)) {
    throw new Error("Access denied");
  }

  if (workspaceMember.role === "member") {
    delete body.assignedTo;
    delete body.priority;
  }

  Object.assign(task, body);

  await task.save();

  return task
    .populate("assignedTo", "name email")
    .then((populatedTask) => populatedTask.populate("createdBy", "name email"));
};

const remove = async (user, taskId) => {
  const task = await Task.findById(taskId);

  if (!task) {
    throw new Error("Task not found");
  }

  const workspace = await Workspace.findById(task.workspace);

  if (!workspace) {
    throw new Error("Workspace not found");
  }
  if (!workspace.isActive) {
    throw new Error("This workspace has been suspended");
  }
  const workspaceMember = getWorkspaceMember(workspace, user.id);

  if (!workspaceMember) {
    throw new Error("Access denied");
  }

  if (!canDeleteTask(workspaceMember.role)) {
    throw new Error("Only owner or admin can delete tasks");
  }
  const workspaceId = task.workspace;
  await task.deleteOne();

  return {
    taskId,
    workspaceId,
  };
};

export const taskService = {
  create,
  list,
  update,
  remove,
};
