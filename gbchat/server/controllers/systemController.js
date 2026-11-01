// server/controllers/systemController.js
import os from 'os';
import mongoose from 'mongoose';
import asyncHandler from 'express-async-handler';
import { redisStatus } from '../config/redis.js';
import { metricsAsPrometheus, metricsSnapshot, resetMetrics } from '../middleware/observability.js';
import { rateLimitInfo } from '../middleware/rateLimiter.js';
import { grpcStatus, grpcGetPresence, grpcNotify } from '../grpc/client.js';
import { NODE_ID } from '../grpc/server.js';
import { recordClientError, clientErrorSnapshot, resetClientErrors } from '../services/errorDigest.js';

const STARTED_AT = new Date();

const dbState = () => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  return states[mongoose.connection.readyState] || 'unknown';
};

// @desc    Liveness probe (cheap, no dependencies)
export const liveness = (req, res) => {
  res.json({ status: 'ok', node: NODE_ID, timestamp: new Date().toISOString() });
};

// @desc    Readiness probe (checks Mongo, Redis, gRPC)
export const readiness = asyncHandler(async (req, res) => {
  const database = dbState();
  const redis = redisStatus();
  const grpc = await grpcStatus();

  const redisOk = !redis.configured || redis.connected;
  const ready = database === 'connected' && redisOk;

  res.status(ready ? 200 : 503).json({
    status: ready ? 'ready' : 'degraded',
    checks: {
      database,
      redis: redis.configured ? (redis.connected ? 'connected' : 'disconnected') : 'disabled',
      grpc: grpc.enabled ? (grpc.healthy ? 'healthy' : 'unreachable') : 'disabled',
    },
    node: NODE_ID,
  });
});

// @desc    Node / cluster information
export const systemInfo = asyncHandler(async (req, res) => {
  const grpc = await grpcStatus();
  const redis = redisStatus();
  const io = req.app.get('io');

  res.json({
    success: true,
    node: {
      id: NODE_ID,
      pid: process.pid,
      hostname: os.hostname(),
      platform: `${os.type()} ${os.release()}`,
      cpus: os.cpus().length,
      loadAverage: os.loadavg().map((value) => Number(value.toFixed(2))),
      memory: {
        totalMb: Math.round(os.totalmem() / 1024 / 1024),
        freeMb: Math.round(os.freemem() / 1024 / 1024),
        rssMb: Math.round(process.memoryUsage().rss / 1024 / 1024),
      },
      uptimeSeconds: Math.floor((Date.now() - STARTED_AT.getTime()) / 1000),
      nodeVersion: process.version,
    },
    scaling: {
      mode: redis.configured ? 'multi-node (Redis adapter)' : 'single-node',
      redis,
      socketConnections: io?.engine?.clientsCount || 0,
      clusterEnabled: process.env.CLUSTER === 'true' || process.env.NODE_UNIQUE_ID !== undefined,
      workers: Number(process.env.WEB_CONCURRENCY) || 1,
    },
    rateLimits: rateLimitInfo(),
    grpc,
  });
});

// @desc    Presence lookup through the internal gRPC API
export const presenceLookup = asyncHandler(async (req, res) => {
  const presence = await grpcGetPresence(req.params.userId);
  if (!presence) {
    return res.status(503).json({ success: false, message: 'Internal presence service unavailable' });
  }
  res.json({ success: true, presence });
});

// @desc    Send an in-app notification through gRPC (fan-out across nodes)
export const internalNotify = asyncHandler(async (req, res) => {
  const { userIds = [], title, body, type = 'system', data = {} } = req.body;
  if (!title) return res.status(400).json({ success: false, message: 'title is required' });

  const ack = await grpcNotify({ userIds, title, body, type, data });
  if (!ack) {
    return res.status(503).json({ success: false, message: 'Notification fan-out unavailable' });
  }
  res.json({ success: true, ack });
});

/* ------------------------------------------------------------------ */
/* Observability                                                       */
/* ------------------------------------------------------------------ */

// @desc    Per-route latency + error metrics for this process
// @route   GET /api/system/metrics
// @access  Private (operators). `?format=prom` returns Prometheus text.
export const systemMetrics = asyncHandler(async (req, res) => {
  if ((req.query.format || '') === 'prom') {
    res.setHeader('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
    return res.send(metricsAsPrometheus());
  }

  res.json({ success: true, ...metricsSnapshot() });
});

// @desc    Clear the in-process counters (useful after a deploy / test run)
// @route   POST /api/system/metrics/reset
// @access  Private
export const resetSystemMetrics = asyncHandler(async (req, res) => {
  resetMetrics();
  res.json({ success: true, message: 'Metrics reset' });
});


/* ------------------------------------------------------------------ */
/* Browser error reporting                                             */
/* ------------------------------------------------------------------ */

// @desc    Accept a crash report from the web client
// @route   POST /api/system/client-error
// @access  Public (anonymous — a crash on the login screen still matters)
export const reportClientError = asyncHandler(async (req, res) => {
  const body = req.body || {};

  // Cheap validation: a real report has a message. Anything else is noise.
  if (!body.message && !body.stack) {
    return res.status(400).json({ success: false, message: 'message or stack is required' });
  }

  const report = recordClientError({
    ...body,
    userAgent: body.userAgent || req.headers['user-agent'],
    requestId: body.requestId || req.id,
  });

  console.warn(
    `[client-error] ${report.kind} ${report.route || '-'} :: ${report.message} id=${req.id}`
  );

  res.status(202).json({ success: true, id: report.id });
});

// @desc    Recent browser crashes, newest first, plus grouped counts
// @route   GET /api/system/client-errors
// @access  Private
export const getClientErrors = asyncHandler(async (req, res) => {
  res.json({ success: true, ...clientErrorSnapshot({ limit: req.query.limit }) });
});

// @desc    Clear the browser-crash buffer
// @route   DELETE /api/system/client-errors
// @access  Private
export const clearClientErrors = asyncHandler(async (req, res) => {
  resetClientErrors();
  res.json({ success: true, message: 'Client error buffer cleared' });
});
