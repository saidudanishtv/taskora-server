import { Comment } from "./comment.model.js";
import { Task } from "../task/task.model.js";
import { Workspace } from "../workspace/workspace.model.js";

const assertWorkspaceMember = async (userId, workspaceId) => {
  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) throw new Error("Workspace not found");

  const isMember = workspace.members.some(
    (m) => m.user.toString() === userId.toString(),
  );
  if (!isMember) throw new Error("Access denied");
};

const create = async (user, body) => {
  const { taskId, body: message } = body;

  const task = await Task.findById(taskId);
  if (!task) throw new Error("Task not found");

  await assertWorkspaceMember(user.id, task.workspace);

  const comment = await Comment.create({
    body: message,
    workspace: task.workspace,
    project: task.project,
    task: task._id,
    author: user.id,
  });

  return comment.populate("author", "name email");
};

const list = async (user, query) => {
  const { taskId } = query;

  const task = await Task.findById(taskId);
  if (!task) throw new Error("Task not found");

  await assertWorkspaceMember(user.id, task.workspace);

  return Comment.find({ task: taskId })
    .populate("author", "name email")
    .sort({ createdAt: 1 });
};

const update = async (user, commentId, body) => {
  const comment = await Comment.findById(commentId);
  if (!comment) throw new Error("Comment not found");

  if (comment.author.toString() !== user.id.toString()) {
    throw new Error("You can only edit your own comment");
  }

  comment.body = body.body;
  await comment.save();

  return comment.populate("author", "name email");
};

const remove = async (user, commentId) => {
  const comment = await Comment.findById(commentId);
  if (!comment) throw new Error("Comment not found");

  if (comment.author.toString() !== user.id.toString()) {
    throw new Error("You can only delete your own comment");
  }

  await comment.deleteOne();
  return true;
};

export const commentService = {
  create,
  list,
  update,
  remove,
};
