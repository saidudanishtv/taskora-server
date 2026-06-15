import crypto from "crypto";
import { WorkspaceInvite } from "./workspaceInvite.model.js";
import { Workspace } from "../workspace/workspace.model.js";
import { User } from "../auth/auth.model.js";
import { env } from "../../config/env.js";

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
      inviteLink: `${env.clientUrl}/accept-invite/${existingInvite.token}`,
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
    inviteLink: `${env.clientUrl}/accept-invite/${token}`,
  };
};

const acceptInvite = async ({ token, userId }) => {
  // Atomically claim the invite — only one concurrent request can win this update.
  // Any race (e.g. React StrictMode double-invocation) loses here instead of
  // pushing the user to workspace.members twice.
  const invite = await WorkspaceInvite.findOneAndUpdate(
    { token, accepted: false, expiresAt: { $gt: new Date() } },
    { $set: { accepted: true } },
    { new: true },
  );

  if (!invite) {
    throw new Error("Invalid or expired invite");
  }

  const [user, workspace] = await Promise.all([
    User.findById(userId),
    Workspace.findById(invite.workspace),
  ]);

  if (!user) throw new Error("User not found");
  if (!workspace) throw new Error("Workspace not found");
  if (!workspace.isActive) throw new Error("This workspace has been suspended");

  const userEmail = user.email.toLowerCase().trim();
  const inviteEmail = invite.email.toLowerCase().trim();

  if (userEmail !== inviteEmail) {
    // Roll back the accepted flag so the invite can be used with the correct account
    await WorkspaceInvite.findByIdAndUpdate(invite._id, { $set: { accepted: false } });
    throw new Error("This invite is for a different email");
  }

  const alreadyMember = workspace.members.some(
    (member) => member.user.toString() === userId.toString(),
  );

  if (!alreadyMember) {
    workspace.members.push({ user: userId, role: invite.role });
    await workspace.save();
    await User.findByIdAndUpdate(userId, { status: "active" });
  }

  return workspace;
};

const previewInvite = async ({ token }) => {
  const invite = await WorkspaceInvite.findOne({ token, accepted: false })
    .populate("workspace", "name")
    .populate("invitedBy", "name");

  if (!invite) throw new Error("Invalid or expired invite");
  if (invite.expiresAt < new Date()) throw new Error("Invite expired");

  return {
    email: invite.email,
    role: invite.role,
    workspaceName: invite.workspace?.name || "a workspace",
    invitedBy: invite.invitedBy?.name || "Someone",
  };
};

export const workspaceInviteService = {
  createInvite,
  acceptInvite,
  previewInvite,
};
