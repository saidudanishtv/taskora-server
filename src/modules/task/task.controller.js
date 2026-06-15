import { asyncHandler } from "../../utils/asyncHandler.js";
import { taskService } from "./task.service.js";
import { getIO } from "../../socket/socket.js";
export const createTask = asyncHandler(async (req, res) => {
  const task = await taskService.create(req.user, req.validated.body);

  const io = getIO();

  io.to(`workspace_${task.workspace}`).emit("task_created", task);

  res.status(201).json(task);
});

export const listTasks = asyncHandler(async (req, res) => {
  const tasks = await taskService.list(req.user, req.validated.query);
  res.json(tasks);
});

export const updateTask = asyncHandler(async (req, res) => {
  const task = await taskService.update(
    req.user,
    req.validated.params.id,
    req.validated.body,
  );

  const io = getIO();

  io.to(`workspace_${task.workspace}`).emit("task_updated", task);

  res.json(task);
});
export const deleteTask = asyncHandler(async (req, res) => {
  const result = await taskService.remove(req.user, req.validated.params.id);

  const io = getIO();

  io.to(`workspace_${result.workspaceId}`).emit("task_deleted", result.taskId);

  res.status(204).send();
});
