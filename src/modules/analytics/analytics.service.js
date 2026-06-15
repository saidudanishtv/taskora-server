import { Project } from "../project/project.model.js";
import { Task } from "../task/task.model.js";
import { Workspace } from "../workspace/workspace.model.js";

const getWorkspaceAnalytics = async ({ workspaceId, userId }) => {
  const workspace = await Workspace.findById(workspaceId);

  if (!workspace) {
    throw new Error("Workspace not found");
  }

  if (!workspace.isActive) {
    throw new Error("This workspace has been suspended");
  }

  const member = workspace.members.find(
    (item) => item.user.toString() === userId.toString(),
  );

  if (!member) {
    throw new Error("Access denied");
  }

  const totalProjects = await Project.countDocuments({
    workspace: workspaceId,
  });

  const totalTasks = await Task.countDocuments({
    workspace: workspaceId,
  });

  const completedTasks = await Task.countDocuments({
    workspace: workspaceId,
    status: "done",
  });

  const todoTasks = await Task.countDocuments({
    workspace: workspaceId,
    status: "todo",
  });

  const inProgressTasks = await Task.countDocuments({
    workspace: workspaceId,
    status: "in-progress",
  });

  const overdueTasks = await Task.countDocuments({
    workspace: workspaceId,
    status: { $ne: "done" },
    dueDate: { $lt: new Date() },
  });

  const completionRate = totalTasks
    ? Math.round((completedTasks / totalTasks) * 100)
    : 0;

  const lowPriority = await Task.countDocuments({
    workspace: workspaceId,
    priority: "low",
  });

  const mediumPriority = await Task.countDocuments({
    workspace: workspaceId,
    priority: "medium",
  });

  const highPriority = await Task.countDocuments({
    workspace: workspaceId,
    priority: "high",
  });

  const urgentPriority = await Task.countDocuments({
    workspace: workspaceId,
    priority: "urgent",
  });

  return {
    totalProjects,
    totalTasks,
    completedTasks,
    overdueTasks,
    completionRate,
    tasksByStatus: {
      todo: todoTasks,
      inProgress: inProgressTasks,
      done: completedTasks,
    },
    tasksByPriority: {
      low: lowPriority,
      medium: mediumPriority,
      high: highPriority,
      urgent: urgentPriority,
    },
  };
};

export const analyticsService = {
  getWorkspaceAnalytics,
};
