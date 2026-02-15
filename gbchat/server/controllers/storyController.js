// server/controllers/storyController.js
import Story from "../models/Story.js";
import User from "../models/User.js";
import cloudinary from "../config/cloudinary.js";

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