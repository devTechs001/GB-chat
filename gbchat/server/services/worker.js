// server/services/worker.js
/**
 * Dedicated background worker.
 *
 *   npm run worker            # long-running maintenance loop
 *   node services/worker.js --once
 *
 * Kept separate from the API so replicas can stay stateless: run one worker
 * per deployment (or any number — every job is guarded by a Redis lock, so
 * extra workers are harmless).
 *
 * Jobs:
 *   • expire stories past `expiresAt`
 *   • publish channel posts whose scheduled time has arrived
 *   • prune read notifications older than 30 days
 *   • close stale "ringing" calls
 */
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const INTERVAL_MS = Number(process.env.WORKER_INTERVAL_MS || 60_000);
const RUN_ONCE = process.argv.includes("--once");

const log = (...args) => console.log(new Date().toISOString(), "[worker]", ...args);

const load = async () => {
  const [{ connectDB }, { acquireLock }, Story, Notification, Call, Channel, Message] =
    await Promise.all([
      import("../config/db.js"),
      import("../config/redis.js"),
      import("../models/Story.js"),
      import("../models/Notification.js"),
      import("../models/Call.js"),
      import("../models/Channel.js"),
      import("../models/Message.js"),
    ]);

  return {
    connectDB,
    acquireLock,
    Story: Story.default,
    Notification: Notification.default,
    Call: Call.default,
    Channel: Channel.default,
    Message: Message.default,
  };
};

const jobs = (models) => [
  {
    name: "expire-stories",
    run: async () => {
      const result = await models.Story.updateMany(
        { isActive: true, expiresAt: { $lte: new Date() } },
        { $set: { isActive: false } }
      );
      return result.modifiedCount || 0;
    },
  },
  {
    name: "publish-scheduled-channel-posts",
    run: async () => {
      const channels = await models.Channel.find({
        scheduledPosts: {
          $elemMatch: { status: "pending", scheduledFor: { $lte: new Date() } },
        },
      });

      let published = 0;
      for (const channel of channels) {
        for (const entry of channel.scheduledPosts) {
          if (entry.status !== "pending" || entry.scheduledFor > new Date()) continue;

          // Claim the entry atomically so two workers cannot double-publish.
          const claimed = await models.Channel.findOneAndUpdate(
            {
              _id: channel._id,
              "scheduledPosts._id": entry._id,
              "scheduledPosts.status": "pending",
            },
            {
              $set: {
                "scheduledPosts.$.status": "published",
                "scheduledPosts.$.publishedAt": new Date(),
              },
            }
          );
          if (!claimed) continue;

          const message = await models.Message.create({
            chat: channel._id,
            sender: entry.createdBy || channel.owner,
            type: entry.type || "text",
            content: {
              text: entry.text,
              media: entry.mediaUrl ? { url: entry.mediaUrl } : undefined,
            },
          });

          await models.Channel.updateOne(
            { _id: channel._id },
            { $push: { posts: message._id } }
          );
          published += 1;
        }
      }
      return published;
    },
  },
  {
    name: "prune-notifications",
    run: async () => {
      const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const result = await models.Notification.deleteMany({
        isRead: true,
        createdAt: { $lte: cutoff },
      });
      return result.deletedCount || 0;
    },
  },
  {
    name: "close-stale-calls",
    run: async () => {
      const cutoff = new Date(Date.now() - 5 * 60 * 1000);
      const result = await models.Call.updateMany(
        { status: { $in: ["ringing", "initiated"] }, createdAt: { $lte: cutoff } },
        { $set: { status: "missed", endedAt: new Date() } }
      );
      return result.modifiedCount || 0;
    },
  },
];

const runCycle = async (models) => {
  const startedAt = Date.now();

  for (const job of jobs(models)) {
    // One worker executes each job per cycle; the lock TTL is half the interval
    // so a crashed worker releases it automatically.
    const locked = await models.acquireLock(`worker:${job.name}`, Math.max(INTERVAL_MS / 2, 30_000));
    if (!locked) continue;

    try {
      const changed = await job.run();
      if (changed) log(`${job.name}: ${changed} record(s)`);
    } catch (error) {
      log(`${job.name} failed: ${error.message}`);
    }
  }

  log(`cycle finished in ${Date.now() - startedAt}ms`);
};

const main = async () => {
  const models = await load();

  const connected = await models.connectDB();
  if (!connected) {
    console.error("[worker] no MongoDB — exiting");
    process.exit(1);
  }

  log(`connected · interval ${INTERVAL_MS}ms${RUN_ONCE ? " · single run" : ""}`);

  await runCycle(models);

  if (RUN_ONCE) {
    await mongoose.connection.close();
    process.exit(0);
  }

  const timer = setInterval(() => runCycle(models).catch((error) => log(error.message)), INTERVAL_MS);

  const shutdown = async (signal) => {
    log(`${signal} received — stopping`);
    clearInterval(timer);
    try {
      const { closeRedis } = await import("../config/redis.js");
      await closeRedis();
    } catch {
      /* ignore */
    }
    await mongoose.connection.close().catch(() => {});
    process.exit(0);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
};

main().catch((error) => {
  console.error("[worker] fatal:", error);
  process.exit(1);
});
