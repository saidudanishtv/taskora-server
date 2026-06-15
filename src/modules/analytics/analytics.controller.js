import { asyncHandler } from "../../utils/asyncHandler.js";
import { analyticsService } from "./analytics.service.js";

export const getWorkspaceAnalytics = asyncHandler(async (req, res) => {
  const analytics = await analyticsService.getWorkspaceAnalytics({
    workspaceId: req.validated.params.workspaceId,
    userId: req.user.id,
  });

  res.json(analytics);
});
