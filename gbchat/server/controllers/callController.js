// controllers/callController.js
import Call from '../models/Call.js';
import Chat from '../models/Chat.js';
import asyncHandler from 'express-async-handler';

// @desc    Get call history
// @route   GET /api/calls/history
// @access  Private
export const getCallHistory = asyncHandler(async (req, res) => {
  const calls = await Call.find({
    $or: [
      { caller: req.user._id },
      { 'participants.user': req.user._id },
    ],
  })
    .populate('caller', 'fullName avatar phone')
    .populate('participants.user', 'fullName avatar phone')
    .populate('chat', 'type groupInfo.name')
    .sort({ createdAt: -1 })
    .limit(50);

  res.json({
    success: true,
    data: calls,
  });
});

// @desc    Initiate a call
// @route   POST /api/calls/initiate
// @access  Private
export const initiateCall = asyncHandler(async (req, res) => {
  const { participantId, chatId, type = 'audio', isGroup = false } = req.body;

  if (!participantId && !isGroup) {
    return res.status(400).json({
      success: false,
      message: 'Participant ID is required for individual calls',
    });
  }

  const call = await Call.create({
    caller: req.user._id,
    participants: isGroup
      ? []
      : [
          {
            user: participantId,
            status: 'ringing',
          },
        ],
    type,
    isGroup,
    chat: chatId,
    status: 'initiated',
  });

  // Emit socket event to participant
  const io = req.app.get('io');
  if (!isGroup) {
    io.to(participantId.toString()).emit('incomingCall', {
      call: call.populate('caller', 'fullName avatar'),
    });
  }

  res.status(201).json({
    success: true,
    message: 'Call initiated',
    data: call,
  });
});

// @desc    Accept a call
// @route   POST /api/calls/:callId/accept
// @access  Private
export const acceptCall = asyncHandler(async (req, res) => {
  const { callId } = req.params;

  const call = await Call.findById(callId);
  if (!call) {
    return res.status(404).json({
      success: false,
      message: 'Call not found',
    });
  }

  call.status = 'ongoing';
  call.startedAt = new Date();

  // Update participant status
  const participant = call.participants.find(
    (p) => p.user.toString() === req.user._id.toString()
  );
  if (participant) {
    participant.status = 'accepted';
    participant.joinedAt = new Date();
  }

  await call.save();

  // Emit socket event
  const io = req.app.get('io');
  io.to(call.caller.toString()).emit('callAccepted', {
    callId,
    acceptedBy: req.user._id,
  });

  res.json({
    success: true,
    message: 'Call accepted',
    data: call,
  });
});

// @desc    Reject a call
// @route   POST /api/calls/:callId/reject
// @access  Private
export const rejectCall = asyncHandler(async (req, res) => {
  const { callId } = req.params;
  const { reason } = req.body; // 'busy', 'declined'

  const call = await Call.findById(callId);
  if (!call) {
    return res.status(404).json({
      success: false,
      message: 'Call not found',
    });
  }

  call.status = reason === 'busy' ? 'ended' : 'declined';
  call.endedAt = new Date();

  const participant = call.participants.find(
    (p) => p.user.toString() === req.user._id.toString()
  );
  if (participant) {
    participant.status = reason === 'busy' ? 'busy' : 'declined';
  }

  await call.save();

  // Emit socket event
  const io = req.app.get('io');
  io.to(call.caller.toString()).emit('callRejected', {
    callId,
    rejectedBy: req.user._id,
    reason,
  });

  res.json({
    success: true,
    message: 'Call rejected',
    data: call,
  });
});

// @desc    End a call
// @route   POST /api/calls/:callId/end
// @access  Private
export const endCall = asyncHandler(async (req, res) => {
  const { callId } = req.params;
  const { duration } = req.body;

  const call = await Call.findById(callId);
  if (!call) {
    return res.status(404).json({
      success: false,
      message: 'Call not found',
    });
  }

  call.status = 'ended';
  call.endedAt = new Date();
  call.duration = duration || Math.floor((call.endedAt - call.startedAt) / 1000);

  // Update participant status
  const participant = call.participants.find(
    (p) => p.user.toString() === req.user._id.toString()
  );
  if (participant) {
    participant.leftAt = new Date();
    participant.status = 'accepted';
  }

  await call.save();

  // Emit socket event
  const io = req.app.get('io');
  const recipientId = call.caller.toString() === req.user._id.toString()
    ? call.participants[0]?.user
    : call.caller;
  
  io.to(recipientId.toString()).emit('callEnded', {
    callId,
    duration: call.duration,
  });

  res.json({
    success: true,
    message: 'Call ended',
    data: call,
  });
});

// @desc    Add participant to group call
// @route   POST /api/calls/:callId/add-participant
// @access  Private
export const addParticipantToCall = asyncHandler(async (req, res) => {
  const { callId } = req.params;
  const { participantId } = req.body;

  const call = await Call.findById(callId);
  if (!call) {
    return res.status(404).json({
      success: false,
      message: 'Call not found',
    });
  }

  if (!call.isGroup) {
    return res.status(400).json({
      success: false,
      message: 'Can only add participants to group calls',
    });
  }

  // Check if already a participant
  const exists = call.participants.find(
    (p) => p.user.toString() === participantId.toString()
  );
  if (exists) {
    return res.status(400).json({
      success: false,
      message: 'User is already a participant',
    });
  }

  call.participants.push({
    user: participantId,
    status: 'ringing',
  });

  await call.save();

  // Emit socket event to new participant
  const io = req.app.get('io');
  io.to(participantId.toString()).emit('addedToCall', {
    call: call.populate('caller', 'fullName avatar'),
  });

  res.json({
    success: true,
    message: 'Participant added to call',
    data: call,
  });
});

// @desc    Get call details
// @route   GET /api/calls/:callId
// @access  Private
export const getCallDetails = asyncHandler(async (req, res) => {
  const call = await Call.findById(req.params.callId)
    .populate('caller', 'fullName avatar phone')
    .populate('participants.user', 'fullName avatar phone')
    .populate('chat', 'type groupInfo.name participants.user');

  if (!call) {
    return res.status(404).json({
      success: false,
      message: 'Call not found',
    });
  }

  res.json({
    success: true,
    data: call,
  });
});

// @desc    Get active calls
// @route   GET /api/calls/active
// @access  Private
export const getActiveCalls = asyncHandler(async (req, res) => {
  const calls = await Call.find({
    status: 'ongoing',
    $or: [
      { caller: req.user._id },
      { 'participants.user': req.user._id },
    ],
  })
    .populate('caller', 'fullName avatar')
    .populate('participants.user', 'fullName avatar');

  res.json({
    success: true,
    data: calls,
  });
});

// @desc    Cancel a call
// @route   POST /api/calls/:callId/cancel
// @access  Private
export const cancelCall = asyncHandler(async (req, res) => {
  const { callId } = req.params;

  const call = await Call.findById(callId);
  if (!call) {
    return res.status(404).json({
      success: false,
      message: 'Call not found',
    });
  }

  if (call.caller.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Only caller can cancel the call',
    });
  }

  call.status = 'ended';
  call.endedAt = new Date();

  await call.save();

  // Emit socket event
  const io = req.app.get('io');
  call.participants.forEach((p) => {
    io.to(p.user.toString()).emit('callCancelled', {
      callId,
    });
  });

  res.json({
    success: true,
    message: 'Call cancelled',
    data: call,
  });
});

// @desc    Get call statistics
// @route   GET /api/calls/stats
// @access  Private
export const getCallStats = asyncHandler(async (req, res) => {
  const totalCalls = await Call.countDocuments({
    $or: [
      { caller: req.user._id },
      { 'participants.user': req.user._id },
    ],
  });

  const audioCalls = await Call.countDocuments({
    type: 'audio',
    $or: [
      { caller: req.user._id },
      { 'participants.user': req.user._id },
    ],
  });

  const videoCalls = await Call.countDocuments({
    type: 'video',
    $or: [
      { caller: req.user._id },
      { 'participants.user': req.user._id },
    ],
  });

  const missedCalls = await Call.countDocuments({
    status: 'missed',
    $or: [
      { caller: req.user._id },
      { 'participants.user': req.user._id },
    ],
  });

  res.json({
    success: true,
    data: {
      total: totalCalls,
      audio: audioCalls,
      video: videoCalls,
      missed: missedCalls,
    },
  });
});
