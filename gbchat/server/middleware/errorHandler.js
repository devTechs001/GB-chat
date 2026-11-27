// server/middleware/errorHandler.js
/**
 * One error surface for the whole API.
 *
 * Every branch returns the same envelope — `{ success: false, code, message }` —
 * plus `x-request-id` so a user report maps to exactly one log line. The rule
 * that matters operationally: **a 5xx never echoes an internal error message**
 * (stack traces, driver text, query details). Those go to the log, keyed by the
 * request id; the client gets a generic message and the id to quote.
 */
const isProduction = () => process.env.NODE_ENV === "production";

const bodyParserMessages = {
  "entity.too.large": "The request payload is too large",
  "entity.parse.failed": "The request body is not valid JSON",
  "encoding.unsupported": "Unsupported content encoding",
  "request.aborted": "The request was aborted before it completed",
};

export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);

  const status =
    err.statusCode ||
    err.status ||
    (err.name === "ValidationError" ? 400 : err.name === "CastError" ? 400 : 500);

  const requestId = req.id;
  const log = `Error${requestId ? ` [${requestId}]` : ""}: ${status} ${req.method} ${req.originalUrl}`;

  // 5xx = a bug or an outage: log the stack. 4xx = the caller's mistake: one line.
  if (status >= 500) console.error(log, err);
  else console.warn(log, err.message);

  res.setHeader("x-request-id", requestId || "");

  if (err.name === "ValidationError" && err.errors) {
    const messages = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({
      success: false,
      code: "VALIDATION_ERROR",
      message: messages.join(", "),
    });
  }

  if (err.code === 11000) {
    const field = err.keyValue ? Object.keys(err.keyValue)[0] : "value";
    return res.status(400).json({
      success: false,
      code: "DUPLICATE_KEY",
      message: `${field} already exists`,
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      code: "INVALID_ID",
      message: "Invalid ID format",
    });
  }

  // express.json() / body-parser failures carry a `type` rather than a status.
  const parserMessage = bodyParserMessages[err.type];
  if (parserMessage) {
    return res.status(status >= 400 && status < 600 ? status : 400).json({
      success: false,
      code: err.type === "entity.too.large" ? "PAYLOAD_TOO_LARGE" : "INVALID_BODY",
      message: parserMessage,
    });
  }

  // Mongoose/Mongo connectivity: the database is down, not the caller's fault.
  // Answer 503 so load balancers and clients can retry, and say so plainly.
  if (
    err.name === "MongooseError" ||
    err.name === "MongoServerSelectionError" ||
    err.name === "MongoNetworkError" ||
    /buffering timed out|ECONNREFUSED .*27017|topology is closed/i.test(err.message || "")
  ) {
    return res.status(503).json({
      success: false,
      code: "DATABASE_UNAVAILABLE",
      message: "The database is unavailable. Please retry in a moment.",
    });
  }

  return res.status(status).json({
    success: false,
    code: err.code && typeof err.code === "string" ? err.code : status >= 500 ? "INTERNAL_ERROR" : "REQUEST_FAILED",
    // Never leak internals on a 5xx in production; keep it for local debugging.
    message:
      status >= 500 && isProduction()
        ? "Something went wrong on our side"
        : err.message || "Internal Server Error",
  });
};

export default errorHandler;
