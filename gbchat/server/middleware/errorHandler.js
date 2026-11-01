// server/middleware/errorHandler.js
export const errorHandler = (err, req, res, next) => {
  // The id is echoed to the client, so a user report maps to one log line.
  console.error(`Error${req.id ? ` [${req.id}]` : ""}:`, err);

  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({
      success: false,
      code: "VALIDATION_ERROR",
      message: messages.join(", "),
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
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

  const status = err.statusCode || 500;
  res.setHeader("x-request-id", req.id || "");
  res.status(status).json({
    success: false,
    code: err.code && typeof err.code === "string" ? err.code : status >= 500 ? "INTERNAL_ERROR" : "REQUEST_FAILED",
    message: err.message || "Internal Server Error",
  });
};