import dns from "dns";
import mongoose from "mongoose";
import { env } from "../src/config/env.js";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const Workspace = mongoose.model(
  "Workspace",
  new mongoose.Schema(
    {
      name: String,
      members: [
        new mongoose.Schema(
          {
            user: mongoose.Schema.Types.ObjectId,
            role: String,
          },
          { _id: false },
        ),
      ],
    },
    { strict: false },
  ),
);

async function run() {
  await mongoose.connect(env.mongodbUri);
  console.log("Connected to MongoDB\n");

  const workspaces = await Workspace.find({});
  let totalFixed = 0;

  for (const ws of workspaces) {
    const seen = new Set();
    const deduped = [];
    let removedCount = 0;

    for (const member of ws.members) {
      const id = member.user.toString();
      if (seen.has(id)) {
        removedCount++;
        console.log(`  [${ws.name}] Removing duplicate user ${id}`);
      } else {
        seen.add(id);
        deduped.push(member);
      }
    }

    if (removedCount > 0) {
      ws.members = deduped;
      await ws.save();
      totalFixed++;
      console.log(`  => Fixed workspace "${ws.name}" — removed ${removedCount} duplicate(s)\n`);
    }
  }

  if (totalFixed === 0) {
    console.log("No duplicates found.");
  } else {
    console.log(`Done. Fixed ${totalFixed} workspace(s).`);
  }

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
