// server/models/StoryHighlight.js
import mongoose from "mongoose";

/**
 * A named collection of the caller's own stories that never expires
 * ("highlights"). Stories referenced here are exempt from the normal 24h
 * cleanup because the highlight keeps a snapshot of the media.
 */
const storyHighlightSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Highlight name is required"],
      trim: true,
      maxlength: 40,
    },
    // Cosmetic metadata chosen in the client (icon key + tailwind gradient)
    icon: { type: String, default: "memories" },
    color: { type: String, default: "from-purple-500 to-pink-500" },
    categoryId: { type: String, default: "memories" },
    coverImage: { type: String, default: "" },
    stories: [
      {
        story: { type: mongoose.Schema.Types.ObjectId, ref: "Story" },
        url: String,
        thumbnail: String,
        type: { type: String, default: "image" },
        caption: String,
        addedAt: { type: Date, default: Date.now },
      },
    ],
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

storyHighlightSchema.index({ user: 1, order: 1 });

export default mongoose.model("StoryHighlight", storyHighlightSchema);
