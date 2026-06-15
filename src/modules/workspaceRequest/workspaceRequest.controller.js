import {
  createWorkspaceRequest,
  getAllWorkspaceRequests,
  approveWorkspaceRequest,
  rejectWorkspaceRequest,
} from "./workspaceRequest.service.js";

export const createWorkspaceRequestController = async (req, res) => {
  try {
    const request = await createWorkspaceRequest({
      user: req.user.id,
      workspaceName: req.body.workspaceName,
      message: req.body.message,
    });

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({
      message: error.message || "Failed to create request",
    });
  }
};

export const getAllWorkspaceRequestsController = async (req, res) => {
  try {
    const requests = await getAllWorkspaceRequests();

    res.json(requests);
  } catch (error) {
    res.status(500).json({
      message: error.message || "Failed to fetch requests",
    });
  }
};

export const approveWorkspaceRequestController = async (req, res) => {
  try {
    const workspace = await approveWorkspaceRequest(req.params.id);

    res.json({
      message: "Workspace request approved successfully",
      workspace,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Failed to approve request",
    });
  }
};

export const rejectWorkspaceRequestController = async (req, res) => {
  try {
    const request = await rejectWorkspaceRequest(req.params.id);

    res.json({
      message: "Workspace request rejected successfully",
      request,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Failed to reject request",
    });
  }
};
