// server/services/gateway/serviceApp.js
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import compression from "compression";

/**
 * Build an Express app for ONE service.
 *
 * The routers are the same files the monolith mounts — a service is not a
 * rewrite, it is the same code with a narrower route table. That keeps the
 * migration honest: behaviour cannot drift because there is only one
 * implementation of each handler.
 *
 * Deliberately not included: morgan/rate limiting/metrics. Those belong to the
 * gateway (edge concerns). Services only need CORS (for direct health checks),
 * cookies (auth uses an httpOnly cookie as well as a bearer header) and JSON
 * parsing.
 */
export const createServiceApp = ({ routes = [], name = "service" } = {}) => {
  const app = express();
  app.set("trust proxy", true);

  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));
  app.use(cookieParser());
  app.use(compression());

  // Every service answers its own probes, so a container health check does not
  // depend on the gateway being up.
  app.get("/health", (req, res) => {
    res.json({
      status: "ok",
      service: name,
      pid: process.pid,
      uptime: Math.round(process.uptime()),
      routes: routes.length,
      timestamp: new Date().toISOString(),
    });
  });

  for (const router of routes) {
    app.use(router.mount, router.router);
  }

  // JSON 404 — a service never renders HTML.
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      code: "NOT_FOUND",
      message: `No route matches ${req.method} ${req.originalUrl} in the ${name} service`,
    });
  });

  // Local error surface (same envelope as the gateway).
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    const status = err.statusCode || err.status || 500;
    if (status >= 500) console.error(`[${name}] ${req.method} ${req.originalUrl}`, err);
    res.status(status).json({
      success: false,
      code: err.code && typeof err.code === "string" ? err.code : status >= 500 ? "INTERNAL_ERROR" : "REQUEST_FAILED",
      message: status >= 500 && process.env.NODE_ENV === "production" ? "Something went wrong on our side" : err.message,
    });
  });

  return app;
};

export default createServiceApp;
