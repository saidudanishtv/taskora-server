import app from "./app.js";
import { connectDatabase } from "./config/db.js";
import { env } from "./config/env.js";
import { setIO } from "./socket/socket.js";
import { createServer } from "http";
import { Server } from "socket.io";

export let io;

const startServer = async () => {
  await connectDatabase();

  const httpServer = createServer(app);

  io = new Server(httpServer, {
    cors: {
      origin: env.clientUrl,
      credentials: true,
    },
  });
  setIO(io);

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join_workspace", (workspaceId) => {
      socket.join(`workspace_${workspaceId}`);

      console.log(`${socket.id} joined workspace_${workspaceId}`);
    });

    socket.on("leave_workspace", (workspaceId) => {
      socket.leave(`workspace_${workspaceId}`);

      console.log(`${socket.id} left workspace_${workspaceId}`);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  httpServer.listen(env.port, () => {
    console.log(`API server running on port ${env.port}`);
  });
};

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
