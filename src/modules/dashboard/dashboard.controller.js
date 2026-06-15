import { asyncHandler } from "../../utils/asyncHandler.js";
import { dashboardService } from "./dashboard.service.js";

export const getDashboardStats = asyncHandler(async (req, res) => {
  const stats = await dashboardService.getDashboardStats({
    workspaceId: req.validated.params.workspaceId,
    userId: req.user.id,
  });

  res.json(stats);
});
