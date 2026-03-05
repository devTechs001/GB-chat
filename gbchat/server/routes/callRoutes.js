// server/routes/callRoutes.js
import express from "express";
import { protect } from "../middleware/auth.js";
import {
  getCallHistory,
  initiateCall,
  acceptCall,
  rejectCall,
  endCall,
  addParticipantToCall,
  getCallDetails,
  getActiveCalls,
  cancelCall,
  getCallStats,
} from "../controllers/callController.js";

const router = express.Router();
router.use(protect);

// Get call history
router.get("/history", getCallHistory);

// Get active calls
router.get("/active", getActiveCalls);

// Get call statistics
router.get("/stats", getCallStats);

// Get call details
router.get("/:callId", getCallDetails);

// Initiate a call
router.post("/initiate", initiateCall);

// Call actions
router.post("/:callId/accept", acceptCall);
router.post("/:callId/reject", rejectCall);
router.post("/:callId/end", endCall);
router.post("/:callId/cancel", cancelCall);
router.post("/:callId/add-participant", addParticipantToCall);

export default router;