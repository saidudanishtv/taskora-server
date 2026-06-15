import { Task } from "../task/task.model.js";
import { Project } from "../project/project.model.js";
import { Workspace } from "../workspace/workspace.model.js";

const getDashboardStats = async ({ workspaceId, userId }) => {
  const workspace = await Workspace.findById(workspaceId);

  if (!workspace) {
    throw new Error("Workspace not found");
  }

  const isMember = workspace.members.some(
    (member) => member.user.toString() === userId.toString(),
  );

  if (!isMember) {
    throw new Error("Access denied");
  }

  const totalTasks = await Task.countDocuments({
    workspace: workspaceId,
  });

  const completedTasks = await Task.countDocuments({
    workspace: workspaceId,
    status: "done",
  });

  const overdueTasks = await Task.countDocuments({
    workspace: workspaceId,
    status: { $ne: "done" },
    dueDate: { $lt: new Date() },
  });

  const totalProjects = await Project.countDocuments({
    workspace: workspaceId,
  });

  const myTasks = await Task.find({
    workspace: workspaceId,
    assignedTo: userId,
    status: { $ne: "done" },
  })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("project", "name");

  const recentTasks = await Task.find({
    workspace: workspaceId,
  })
    .sort({ updatedAt: -1 })
    .limit(5)
    .populate("createdBy", "name email")
    .populate("project", "name");

  const completionRate = totalTasks
    ? Math.round((completedTasks / totalTasks) * 100)
    : 0;

  return {
    totalProjects,
    totalTasks,
    completedTasks,
    overdueTasks,
    completionRate,
    myTasks,
    recentActivity: recentTasks,
  };
};

export const dashboardService = {
  getDashboardStats,
};
