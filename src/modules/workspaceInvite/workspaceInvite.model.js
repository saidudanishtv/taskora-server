import mongoose from "mongoose";

const workspaceInviteSchema = new mongoose.Schema(
  {
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    role: {
      type: String,
      enum: ["admin", "member", "viewer"],
      required: true,
    },

    token: {
      type: String,
      required: true,
      unique: true,
    },

    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    accepted: {
      type: Boolean,
      default: false,
    },

    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true },
);

export const WorkspaceInvite = mongoose.model(
  "WorkspaceInvite",
  workspaceInviteSchema,
);
