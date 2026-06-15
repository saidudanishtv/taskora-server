import { User } from "../auth/auth.model.js";
import { Workspace } from "../workspace/workspace.model.js";
import { Project } from "../project/project.model.js";
import { Task } from "../task/task.model.js";
import { Comment } from "../comment/comment.model.js";
const getOverview = async () => {
  const totalUsers = await User.countDocuments();

  const totalWorkspaces = await Workspace.countDocuments();

  const totalProjects = await Project.countDocuments();

  const totalTasks = await Task.countDocuments();

  const activeWorkspaces = await Workspace.countDocuments({
    isActive: true,
  });

  const suspendedWorkspaces = await Workspace.countDocuments({
    isActive: false,
  });

  return {
    totalUsers,
    totalWorkspaces,
    totalProjects,
    totalTasks,
    activeWorkspaces,
    suspendedWorkspaces,
  };
};

const listUsers = async () => {
  return User.find().select("-password").sort({ createdAt: -1 });
};

const listWorkspaces = async () => {
  return Workspace.find()
    .populate("owner", "name email")
    .populate("members.user", "name email")
    .sort({ createdAt: -1 });
};

const toggleUserActive = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  user.isActive = !user.isActive;
  await user.save();

  return user;
};
const toggleWorkspaceActive = async (workspaceId) => {
  const workspace = await Workspace.findById(workspaceId);

  if (!workspace) {
    throw new Error("Workspace not found");
  }

  workspace.isActive = !workspace.isActive;
  await workspace.save();

  return workspace;
};
const deleteWorkspace = async (workspaceId) => {
  const workspace = await Workspace.findById(workspaceId);

  if (!workspace) {
    throw new Error("Workspace not found");
  }

  await Comment.deleteMany({
    workspace: workspaceId,
  });

  await Task.deleteMany({
    workspace: workspaceId,
  });

  await Project.deleteMany({
    workspace: workspaceId,
  });

  await Workspace.findByIdAndDelete(workspaceId);

  return true;
};

export const superAdminService = {
  getOverview,
  listUsers,
  listWorkspaces,
  toggleUserActive,
  toggleWorkspaceActive,
  deleteWorkspace,
};
