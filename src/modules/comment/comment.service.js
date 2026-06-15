import { Comment } from "./comment.model.js";
import { Task } from "../task/task.model.js";
import { Project } from "../project/project.model.js";

const create = async (user, body) => {
  const { taskId, body: message } = body;

  const task = await Task.findById(taskId);

  if (!task) {
    throw new Error("Task not found");
  }

  const project = await Project.findById(task.project);

  const projectMember = project.members.find(
    (memberId) => memberId.toString() === user.id.toString(),
  );

  if (!projectMember) {
    throw new Error("Access denied");
  }

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

  if (!task) {
    throw new Error("Task not found");
  }

  const project = await Project.findById(task.project);

  const projectMember = project.members.find(
    (memberId) => memberId.toString() === user.id.toString(),
  );

  if (!projectMember) {
    throw new Error("Access denied");
  }

  return Comment.find({ task: taskId })
    .populate("author", "name email")
    .sort({ createdAt: 1 });
};
const update = async (user, commentId, body) => {
  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new Error("Comment not found");
  }

  if (comment.author.toString() !== user.id.toString()) {
    throw new Error("You can only edit your own comment");
  }

  comment.body = body.body;

  await comment.save();

  return comment.populate("author", "name email");
};

const remove = async (user, commentId) => {
  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new Error("Comment not found");
  }

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
