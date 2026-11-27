// server/models/Reaction.js
import mongoose from "mongoose";

/**
 * Reactions.
 *
 * Messages currently keep their reactions in an embedded array
 * (`Message.reactions`), which is the right shape for the common case: one
 * message, a handful of emojis, read together with the message.
 *
 * This collection exists for the cases the embedded array cannot serve:
 *  - aggregate "top reactions" across a channel without scanning messages,
 *  - a unique index so one user cannot react twice with the same emoji
 *    (the embedded array relies on controller logic for that),
 *  - reactions on things that are not messages (channel posts, stories).
 *
 * It is additive: nothing writes here yet, and the embedded array keeps
 * working. Controllers that need the aggregate view can start populating it
 * without a migration.
 */
const reactionSchema = new mongoose.Schema(
  {
    // What was reacted to. `targetType` + `targetId` keeps this model usable
    // for messages, channel posts and story media alike.
    targetType: {
      type: String,
      enum: ["message", "channel_post", "story", "comment"],
      default: "message",
      required: true,
      index: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    emoji: { type: String, required: true, trim: true, maxlength: 32 },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Denormalised for feed queries that show who reacted without a populate.
    chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat", default: null },
  },
  { timestamps: true }
);

// One reaction per user/emoji/target — the database enforces it, so a double
// tap or a retried request cannot inflate a count.
reactionSchema.index({ targetType: 1, targetId: 1, user: 1, emoji: 1 }, { unique: true });

// Counting emojis for one target.
reactionSchema.index({ targetType: 1, targetId: 1, emoji: 1 });

/** Reaction counts for one target, most common first. */
reactionSchema.statics.summaryFor = async function summaryFor(targetType, targetId) {
  return this.aggregate([
    { $match: { targetType, targetId: new mongoose.Types.ObjectId(String(targetId)) } },
    { $group: { _id: "$emoji", count: { $sum: 1 }, users: { $push: "$user" } } },
    { $sort: { count: -1, _id: 1 } },
    { $project: { _id: 0, emoji: "$_id", count: 1, users: 1 } },
  ]);
};

/** Add a reaction, ignoring a duplicate (idempotent). */
reactionSchema.statics.add = async function add({ targetType = "message", targetId, user, emoji, chat = null }) {
  try {
    return await this.findOneAndUpdate(
      { targetType, targetId, user, emoji },
      { $setOnInsert: { targetType, targetId, user, emoji, chat } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  } catch (error) {
    // 11000 = duplicate from a concurrent upsert: the desired state already holds.
    if (error?.code === 11000) return null;
    throw error;
  }
};

/** Remove one user's reaction. Returns the deleted document or null. */
reactionSchema.statics.remove = async function remove({ targetType = "message", targetId, user, emoji }) {
  return this.findOneAndDelete({ targetType, targetId, user, emoji });
};

const Reaction = mongoose.models.Reaction || mongoose.model("Reaction", reactionSchema);

export default Reaction;
