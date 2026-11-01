// server/routes/groupRoutes.js
import express from "express";
import {
  getGroups,
  createGroup,
  getGroup,
  deleteGroup,
  updateGroup,
  addMembers,
  removeMember,
  leaveGroup,
  makeAdmin,
  removeAdmin,
  setGroupMute,
  setGroupFlag,
  bulkInvite,
  exportGroups,
  updateGroupSettings,
  // Polls
  createPoll,
  getPolls,
  voteOnPoll,
  endPoll,
  // Events
  createEvent,
  getEvents,
  rsvpEvent,
  deleteEvent,
  // Announcements
  createAnnouncement,
  getAnnouncements,
  pinAnnouncement,
  deleteAnnouncement,
  importGroups,
  getGroupPreferences,
  updateGroupPreferences,
} from "../controllers/groupController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

// Group CRUD
router.get("/", getGroups);
router.post("/", createGroup);
router.post("/export", exportGroups);
router.post("/import", importGroups);
router.get("/preferences", getGroupPreferences);
router.put("/preferences", updateGroupPreferences);
router.post("/bulk-invite", bulkInvite);
router.get("/:id", getGroup);
router.put("/:id", updateGroup);
router.patch("/:id", updateGroup);
router.delete("/:id", deleteGroup);
router.patch("/:id/archive", setGroupFlag);
router.patch("/:id/star", setGroupFlag);
router.patch("/:id/mute", setGroupFlag);
router.post("/:id/mute", setGroupMute);
router.post("/:id/unmute", setGroupMute);
router.post("/:id/members", addMembers);
router.delete("/:id/members/:memberId", removeMember);
router.post("/:id/leave", leaveGroup);
router.put("/:id/members/:memberId/admin", makeAdmin);
router.delete("/:id/members/:memberId/admin", removeAdmin);
router.put("/:id/settings", updateGroupSettings);

// Polls
router.post("/:id/polls", createPoll);
router.get("/:id/polls", getPolls);
router.post("/:id/polls/:pollId/vote", voteOnPoll);
router.post("/:id/polls/:pollId/end", endPoll);

// Events
router.post("/:id/events", createEvent);
router.get("/:id/events", getEvents);
router.post("/:id/events/:eventId/rsvp", rsvpEvent);
router.delete("/:id/events/:eventId", deleteEvent);

// Announcements
router.post("/:id/announcements", createAnnouncement);
router.get("/:id/announcements", getAnnouncements);
router.post("/:id/announcements/:announcementId/pin", pinAnnouncement);
router.delete("/:id/announcements/:announcementId", deleteAnnouncement);

export default router;