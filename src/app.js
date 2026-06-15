import cors from "cors";
import express from "express";
import morgan from "morgan";
import { env } from "./config/env.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import authRoutes from "./modules/auth/auth.route.js";
import workspaceRoutes from "./modules/workspace/workspace.route.js";
import projectRoutes from "./modules/project/project.route.js";
import taskRoutes from "./modules/task/task.route.js";
import commentRoutes from "./modules/comment/comment.route.js";
import dashboardRoutes from "./modules/dashboard/dashboard.route.js";
import workspaceInviteRoutes from "./modules/workspaceInvite/workspaceInvite.route.js";
import superAdminRoutes from "./modules/superAdmin/superAdmin.route.js";
import analyticsRoutes from "./modules/analytics/analytics.route.js";
import workspaceRequestRoutes from "./modules/workspaceRequest/workspaceRequest.route.js";
const app = express();

app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});
app.use("/super-admin", superAdminRoutes);
app.use("/auth", authRoutes);
app.use("/workspace", workspaceRoutes);
app.use("/projects", projectRoutes);
app.use("/tasks", taskRoutes);
app.use("/comments", commentRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/workspace-invites", workspaceInviteRoutes);
app.use("/analytics", analyticsRoutes);
app.use("/workspace-requests", workspaceRequestRoutes);
app.use(errorHandler);

export default app;
