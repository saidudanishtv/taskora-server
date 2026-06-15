import crypto from "crypto";
import { WorkspaceInvite } from "./workspaceInvite.model.js";
import { Workspace } from "../workspace/workspace.model.js";
import { User } from "../auth/auth.model.js";

const createInvite = async ({ workspaceId, email, role, userId }) => {
  const normalizedEmail = email.toLowerCase().trim();

  const workspace = await Workspace.findById(workspaceId);

  if (!workspace) {
    throw new Error("Workspace not found");
  }
  if (!workspace.isActive) {
    throw new Error("This workspace has been suspended");
  }
  const requester = workspace.members.find(
    (member) => member.user.toString() === userId.toString(),
  );

  if (!requester) {
    throw new Error("Access denied");
  }

  const isOwner = requester.role === "owner";
  const isAdmin = requester.role === "admin";

  if (!isOwner && !isAdmin) {
    throw new Error("You cannot invite members");
  }

  if (isAdmin && role === "admin") {
    throw new Error("Admins cannot invite admins");
  }

  const existingUser = await User.findOne({
    email: normalizedEmail,
  });

  if (existingUser) {
    const alreadyMember = workspace.members.some(
      (member) => member.user.toString() === existingUser._id.toString(),
    );

    if (alreadyMember) {
      throw new Error("User already in workspace");
    }
  }

  const existingInvite = await WorkspaceInvite.findOne({
    workspace: workspaceId,
    email: normalizedEmail,
    accepted: false,
    expiresAt: { $gt: new Date() },
  });

  if (existingInvite) {
    return {
      invite: existingInvite,
      inviteLink: `http://localhost:5173/accept-invite/${existingInvite.token}`,
    };
  }

  const token = crypto.randomBytes(24).toString("hex");

  const invite = await WorkspaceInvite.create({
    workspace: workspaceId,
    email: normalizedEmail,
    role,
    token,
    invitedBy: userId,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
  });

  return {
    invite,
    inviteLink: `http://localhost:5173/accept-invite/${token}`,
  };
};

const acceptInvite = async ({ token, userId }) => {
  const invite = await WorkspaceInvite.findOne({
    token,
    accepted: false,
  });

  if (!invite) {
    throw new Error("Invalid invite");
  }

  if (invite.expiresAt < new Date()) {
    throw new Error("Invite expired");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  const userEmail = user.email.toLowerCase().trim();
  const inviteEmail = invite.email.toLowerCase().trim();

  if (userEmail !== inviteEmail) {
    throw new Error("This invite is for a different email");
  }

  const workspace = await Workspace.findById(invite.workspace);

  if (!workspace) {
    throw new Error("Workspace not found");
  }
  if (!workspace.isActive) {
    throw new Error("This workspace has been suspended");
  }
  const alreadyMember = workspace.members.some(
    (member) => member.user.toString() === userId.toString(),
  );

  if (alreadyMember) {
    invite.accepted = true;
    await invite.save();

    return workspace;
  }

  workspace.members.push({
    user: userId,
    role: invite.role,
  });

  await workspace.save();

  invite.accepted = true;
  await invite.save();

  return workspace;
};

export const workspaceInviteService = {
  createInvite,
  acceptInvite,
};
