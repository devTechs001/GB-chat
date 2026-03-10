// server/routes/groupRoutes.js
import express from "express";
import {
  createGroup,
  updateGroup,
  addMembers,
  removeMember,
  leaveGroup,
  makeAdmin,
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
} from "../controllers/groupController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

// Group CRUD
router.post("/", createGroup);
router.put("/:id", updateGroup);
router.post("/:id/members", addMembers);
router.delete("/:id/members/:memberId", removeMember);
router.post("/:id/leave", leaveGroup);
router.put("/:id/members/:memberId/admin", makeAdmin);
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