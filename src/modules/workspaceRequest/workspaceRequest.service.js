import crypto from "crypto";
import { WorkspaceRequest } from "./workspaceRequest.model.js";
import { User } from "../auth/auth.model.js";
import { Workspace } from "../workspace/workspace.model.js";

const generateInviteCode = () => {
  return crypto.randomBytes(4).toString("hex");
};

export const createWorkspaceRequest = async (data) => {
  const existingRequest = await WorkspaceRequest.findOne({
    user: data.user,
    status: "pending",
  });

  if (existingRequest) {
    throw new Error("You already have a pending workspace request");
  }

  return WorkspaceRequest.create(data);
};

export const getAllWorkspaceRequests = async () => {
  return await WorkspaceRequest.find({ status: "pending" })
    .populate("user", "name email status platformRole")
    .sort({ createdAt: -1 });
};

export const approveWorkspaceRequest = async (requestId) => {
  const request = await WorkspaceRequest.findById(requestId);

  if (!request) {
    throw new Error("Request not found");
  }

  if (request.status !== "pending") {
    throw new Error("Request is already processed");
  }

  const workspace = await Workspace.create({
    name: request.workspaceName,
    inviteCode: generateInviteCode(),
    owner: request.user,
    members: [
      {
        user: request.user,
        role: "owner",
      },
    ],
  });

  request.status = "approved";
  await request.save();

  await User.findByIdAndUpdate(request.user, {
    status: "active",
  });

  return workspace;
};

export const rejectWorkspaceRequest = async (requestId) => {
  const request = await WorkspaceRequest.findById(requestId);

  if (!request) {
    throw new Error("Request not found");
  }

  if (request.status !== "pending") {
    throw new Error("Request is already processed");
  }

  request.status = "rejected";
  await request.save();

  await User.findByIdAndUpdate(request.user, {
    status: "pending",
  });

  return request;
};
