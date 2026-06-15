import crypto from "crypto";
import { Workspace } from "./workspace.model.js";
import { Project } from "../project/project.model.js";
import { Task } from "../task/task.model.js";
import { Comment } from "../comment/comment.model.js";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "../../utils/errors.js";

const createWorkspace = async ({ name, userId }) => {
  const ownsOne = await Workspace.exists({
    members: { $elemMatch: { user: userId, role: "owner" } },
  });

  if (!ownsOne) {
    throw new ForbiddenError("Only workspace owners can create new workspaces");
  }

  const inviteCode = crypto.randomBytes(3).toString("hex").toUpperCase();

  const workspace = await Workspace.create({
    name,
    inviteCode,
    owner: userId,
    members: [{ user: userId, role: "owner" }],
  });

  return workspace;
};

const getMyWorkspaces = async (userId) => {
  return Workspace.find({ "members.user": userId })
    .populate("owner", "name email")
    .populate("members.user", "name email");
};

const joinWorkspace = async ({ inviteCode, userId }) => {
  const workspace = await Workspace.findOne({
    inviteCode: inviteCode.trim().toUpperCase(),
  });

  if (!workspace) {
    throw new NotFoundError("Invalid invite code");
  }

  const alreadyMember = workspace.members.some(
    (member) => member.user.toString() === userId.toString(),
  );

  if (alreadyMember) {
    throw new BadRequestError("You are already a member of this workspace");
  }

  workspace.members.push({
    user: userId,
    role: "viewer",
  });

  await workspace.save();

  return workspace;
};

const deleteWorkspace = async ({ workspaceId, userId }) => {
  const workspace = await Workspace.findById(workspaceId);

  if (!workspace) {
    throw new NotFoundError("Workspace not found");
  }

  if (workspace.owner.toString() !== userId.toString()) {
    throw new ForbiddenError("Only workspace owner can delete workspace");
  }

  await Comment.deleteMany({ workspace: workspaceId });
  await Task.deleteMany({ workspace: workspaceId });
  await Project.deleteMany({ workspace: workspaceId });
  await workspace.deleteOne();

  return true;
};

const getWorkspaceMembers = async ({ workspaceId, userId }) => {
  const workspace = await Workspace.findById(workspaceId)
    .populate("members.user", "name email")
    .populate("owner", "name email");

  if (!workspace) {
    throw new NotFoundError("Workspace not found");
  }

  const requester = workspace.members.find(
    (member) => member.user._id.toString() === userId.toString(),
  );

  if (!requester) {
    throw new ForbiddenError("Access denied");
  }

  return workspace.members;
};

const updateMemberRole = async ({
  workspaceId,
  targetUserId,
  role,
  userId,
}) => {
  const workspace = await Workspace.findById(workspaceId);

  if (!workspace) {
    throw new NotFoundError("Workspace not found");
  }

  const requester = workspace.members.find(
    (member) => member.user.toString() === userId.toString(),
  );

  if (!requester || requester.role !== "owner") {
    throw new ForbiddenError("Only workspace owner can update member roles");
  }

  if (workspace.owner.toString() === targetUserId.toString()) {
    throw new BadRequestError("Workspace owner role cannot be changed");
  }

  if (role === "owner") {
    throw new BadRequestError("Owner role cannot be assigned");
  }

  const targetMember = workspace.members.find(
    (member) => member.user.toString() === targetUserId.toString(),
  );

  if (!targetMember) {
    throw new NotFoundError("Member not found");
  }

  targetMember.role = role;

  await workspace.save();

  return workspace.populate("members.user", "name email");
};

const removeMember = async ({ workspaceId, targetUserId, userId }) => {
  const workspace = await Workspace.findById(workspaceId);

  if (!workspace) {
    throw new NotFoundError("Workspace not found");
  }

  const requester = workspace.members.find(
    (member) => member.user.toString() === userId.toString(),
  );

  const targetMember = workspace.members.find(
    (member) => member.user.toString() === targetUserId.toString(),
  );

  if (!requester) {
    throw new ForbiddenError("Access denied");
  }

  if (!targetMember) {
    throw new NotFoundError("Member not found");
  }

  if (workspace.owner.toString() === targetUserId.toString()) {
    throw new BadRequestError("Workspace owner cannot be removed");
  }

  const requesterIsOwner = requester.role === "owner";
  const requesterIsAdmin = requester.role === "admin";

  if (!requesterIsOwner && !requesterIsAdmin) {
    throw new ForbiddenError("Only owner or admin can remove members");
  }

  if (requesterIsAdmin && targetMember.role === "admin") {
    throw new ForbiddenError("Admins cannot remove other admins");
  }

  workspace.members = workspace.members.filter(
    (member) => member.user.toString() !== targetUserId.toString(),
  );

  await workspace.save();

  await Project.updateMany(
    { workspace: workspaceId },
    { $pull: { members: targetUserId } },
  );

  await Task.updateMany(
    { workspace: workspaceId, assignedTo: targetUserId },
    { $unset: { assignedTo: "" } },
  );

  return true;
};

export const workspaceService = {
  createWorkspace,
  getMyWorkspaces,
  joinWorkspace,
  deleteWorkspace,
  getWorkspaceMembers,
  updateMemberRole,
  removeMember,
};
