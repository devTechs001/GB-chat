// server/controllers/storyController.js
import Story from "../models/Story.js";
import User from "../models/User.js";
import cloudinary from "../config/cloudinary.js";
import Notification from "../models/Notification.js";
import StoryHighlight from "../models/StoryHighlight.js";

export const createStory = async (req, res, next) => {
  try {
    const { type, text, caption, backgroundColor, fontFamily, fontColor, privacy } = req.body;

    let mediaData = {};
    if (req.file) {
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      const dataURI = `data:${req.file.mimetype};base64,${b64}`;
      const result = await cloudinary.uploader.upload(dataURI, {
        resource_type: "auto",
        folder: "gbchat/stories",
      });
      mediaData = {
        url: result.secure_url,
        thumbnail: result.secure_url,
        duration: result.duration,
      };
    }

    const story = await Story.create({
      user: req.user._id,
      type: type || (req.file ? (req.file.mimetype.startsWith("video") ? "video" : "image") : "text"),
      content: {
        media: Object.keys(mediaData).length > 0 ? mediaData : undefined,
        text,
        backgroundColor,
        fontFamily,
        fontColor,
      },
      caption,
      privacy: privacy || "contacts",
    });

    const populated = await Story.findById(story._id).populate(
      "user",
      "fullName avatar"
    );

    // Notify contacts
    const io = req.app.get("io");
    const user = await User.findById(req.user._id);
    user.contacts.forEach((contactId) => {
      io.to(contactId.toString()).emit("newStory", {
        userId: req.user._id,
        story: populated,
      });
    });

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

export const getStories = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const contactIds = [...user.contacts, req.user._id];

    const stories = await Story.find({
      user: { $in: contactIds },
      isActive: true,
      expiresAt: { $gt: new Date() },
    })
      .populate("user", "fullName avatar")
      .sort({ createdAt: -1 });

    // Group by user
    const grouped = {};
    stories.forEach((story) => {
      const uid = story.user._id.toString();
      if (!grouped[uid]) {
        grouped[uid] = {
          user: story.user,
          stories: [],
          hasUnviewed: false,
        };
      }
      grouped[uid].stories.push(story);
      if (!story.viewers.some((v) => v.user.toString() === req.user._id.toString())) {
        grouped[uid].hasUnviewed = true;
      }
    });

    // Put current user's stories first
    const myId = req.user._id.toString();
    const result = [];
    if (grouped[myId]) {
      result.push(grouped[myId]);
      delete grouped[myId];
    }

    // Then unviewed, then viewed
    const others = Object.values(grouped);
    others.sort((a, b) => (b.hasUnviewed ? 1 : 0) - (a.hasUnviewed ? 1 : 0));
    result.push(...others);

    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const viewStory = async (req, res, next) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: "Story not found" });

    const alreadyViewed = story.viewers.some(
      (v) => v.user.toString() === req.user._id.toString()
    );

    if (!alreadyViewed) {
      story.viewers.push({ user: req.user._id });
      await story.save();

      // Notify story owner
      const io = req.app.get("io");
      await Notification.createFor({
        user: story.user,
        type: "story_view",
        title: "Someone viewed your story",
        body: `${req.user.fullName || "A contact"} viewed your story`,
        actor: req.user._id,
        storyId: story._id,
      });

      io.to(story.user.toString()).emit("storyViewed", {
        storyId: story._id,
        viewer: { _id: req.user._id, fullName: req.user.fullName, avatar: req.user.avatar },
      });
    }

    res.json({ message: "Story viewed" });
  } catch (error) {
    next(error);
  }
};

export const reactToStory = async (req, res, next) => {
  try {
    const { reaction } = req.body;
    const story = await Story.findById(req.params.id);

    const viewer = story.viewers.find(
      (v) => v.user.toString() === req.user._id.toString()
    );
    if (viewer) {
      viewer.reaction = reaction;
    } else {
      story.viewers.push({ user: req.user._id, reaction });
    }

    await story.save();

    if (story.user.toString() !== req.user._id.toString()) {
      await Notification.createFor({
        user: story.user,
        type: "story_reaction",
        title: "New story reaction",
        body: `${req.user.fullName || "A contact"} reacted ${reaction || ""} to your story`.trim(),
        actor: req.user._id,
        storyId: story._id,
        data: { reaction },
      });
    }

    const io = req.app.get("io");
    io.to(story.user.toString()).emit("storyReaction", {
      storyId: story._id,
      user: { _id: req.user._id, fullName: req.user.fullName },
      reaction,
    });

    res.json({ message: "Reaction added" });
  } catch (error) {
    next(error);
  }
};

export const replyToStory = async (req, res, next) => {
  try {
    const { text } = req.body;
    const story = await Story.findById(req.params.id);

    story.replies.push({ user: req.user._id, text });
    await story.save();

    await Notification.createFor({
      user: story.user,
      type: "story_reply",
      title: "New reply to your story",
      body: text?.slice(0, 140) || "",
      actor: req.user._id,
      storyId: story._id,
    });

    const io = req.app.get("io");
    io.to(story.user.toString()).emit("storyReply", {
      storyId: story._id,
      user: { _id: req.user._id, fullName: req.user.fullName, avatar: req.user.avatar },
      text,
    });

    res.json({ message: "Reply sent" });
  } catch (error) {
    next(error);
  }
};

export const deleteStory = async (req, res, next) => {
  try {
    const story = await Story.findById(req.params.id);
    if (story.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }
    story.isActive = false;
    await story.save();
    res.json({ message: "Story deleted" });
  } catch (error) {
    next(error);
  }
};

export const getMyStories = async (req, res, next) => {
  try {
    const stories = await Story.find({
      user: req.user._id,
      isActive: true,
      expiresAt: { $gt: new Date() },
    })
      .populate("viewers.user", "fullName avatar")
      .sort({ createdAt: -1 });

    res.json(stories);
  } catch (error) {
    next(error);
  }
};
/** GET /api/stories/:id — single story (populated) */
export const getStory = async (req, res, next) => {
  try {
    const story = await Story.findById(req.params.id)
      .populate("user", "fullName avatar")
      .populate("viewers.user", "fullName avatar")
      .populate("replies.user", "fullName avatar");

    if (!story) return res.status(404).json({ message: "Story not found" });

    res.json(story);
  } catch (error) {
    next(error);
  }
};

/** GET /api/stories/:id/viewers — only the owner can read the viewer list */
export const getStoryViewers = async (req, res, next) => {
  try {
    const story = await Story.findById(req.params.id).populate(
      "viewers.user",
      "fullName avatar"
    );

    if (!story) return res.status(404).json({ message: "Story not found" });

    if (story.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the story owner can see viewers" });
    }

    res.json(story.viewers || []);
  } catch (error) {
    next(error);
  }
};

/* ------------------------------------------------------------------ */
/* Highlights (permanent collections of stories)                       */
/* ------------------------------------------------------------------ */

// @desc    List highlights — the caller's own, plus anyone else's
// @route   GET /api/stories/highlights?userId=<id>
// @access  Private
export const getHighlights = async (req, res, next) => {
  try {
    const targetId = req.query.userId || req.user._id;
    const highlights = await StoryHighlight.find({ user: targetId })
      .sort({ order: 1, createdAt: 1 })
      .lean();

    res.json({
      success: true,
      highlights: highlights.map((highlight) => ({
        _id: highlight._id,
        title: highlight.title,
        icon: highlight.icon,
        color: highlight.color,
        categoryId: highlight.categoryId,
        coverImage: highlight.coverImage,
        storyCount: highlight.stories?.length || 0,
        stories: highlight.stories || [],
        createdAt: highlight.createdAt,
        isMine: String(highlight.user) === String(req.user._id),
      })),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a highlight
// @route   POST /api/stories/highlights
// @access  Private
export const createHighlight = async (req, res, next) => {
  try {
    const { title, icon, color, categoryId, coverImage, storyIds } = req.body;
    if (!title || !String(title).trim()) {
      return res.status(400).json({ message: "Highlight name is required" });
    }

    const count = await StoryHighlight.countDocuments({ user: req.user._id });

    let stories = [];
    if (Array.isArray(storyIds) && storyIds.length) {
      const owned = await Story.find({
        _id: { $in: storyIds },
        user: req.user._id,
      })
        .select("type content createdAt")
        .lean();

      stories = owned.map((story) => ({
        story: story._id,
        url: story.content?.media?.url || "",
        thumbnail: story.content?.media?.thumbnail || story.content?.media?.url || "",
        type: story.type,
        caption: story.content?.text || "",
      }));
    }

    const highlight = await StoryHighlight.create({
      user: req.user._id,
      title: String(title).trim().slice(0, 40),
      icon: icon || "memories",
      color: color || "from-purple-500 to-pink-500",
      categoryId: categoryId || "memories",
      coverImage: coverImage || stories[0]?.url || "",
      stories,
      order: count,
    });

    res.status(201).json({ success: true, highlight });
  } catch (error) {
    next(error);
  }
};

// @desc    Rename / restyle a highlight, or add stories to it
// @route   PATCH /api/stories/highlights/:id
// @access  Private (owner)
export const updateHighlight = async (req, res, next) => {
  try {
    const highlight = await StoryHighlight.findById(req.params.id);
    if (!highlight) return res.status(404).json({ message: "Highlight not found" });
    if (String(highlight.user) !== String(req.user._id)) {
      return res.status(403).json({ message: "You can only edit your own highlights" });
    }

    const { title, icon, color, categoryId, coverImage, addStoryIds } = req.body;
    if (title !== undefined) highlight.title = String(title).trim().slice(0, 40) || highlight.title;
    if (icon !== undefined) highlight.icon = icon;
    if (color !== undefined) highlight.color = color;
    if (categoryId !== undefined) highlight.categoryId = categoryId;
    if (coverImage !== undefined) highlight.coverImage = coverImage;

    if (Array.isArray(addStoryIds) && addStoryIds.length) {
      const owned = await Story.find({
        _id: { $in: addStoryIds },
        user: req.user._id,
      })
        .select("type content")
        .lean();

      owned.forEach((story) => {
        highlight.stories.push({
          story: story._id,
          url: story.content?.media?.url || "",
          thumbnail: story.content?.media?.thumbnail || story.content?.media?.url || "",
          type: story.type,
          caption: story.content?.text || "",
        });
      });

      if (!highlight.coverImage && owned[0]?.content?.media?.url) {
        highlight.coverImage = owned[0].content.media.url;
      }
    }

    await highlight.save();
    res.json({ success: true, highlight });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a highlight (stories themselves are untouched)
// @route   DELETE /api/stories/highlights/:id
// @access  Private (owner)
export const deleteHighlight = async (req, res, next) => {
  try {
    const highlight = await StoryHighlight.findById(req.params.id);
    if (!highlight) return res.status(404).json({ message: "Highlight not found" });
    if (String(highlight.user) !== String(req.user._id)) {
      return res.status(403).json({ message: "You can only delete your own highlights" });
    }

    await highlight.deleteOne();
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};
