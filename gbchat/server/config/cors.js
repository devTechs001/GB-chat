// server/config/cors.js

// Parse CLIENT_URL env var (can be comma-separated)
const envOrigins = process.env.CLIENT_URL 
  ? process.env.CLIENT_URL.split(',').map(url => url.trim()).filter(Boolean)
  : [];

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://devtechs001.github.io",
  "https://devtechs001.github.io/GB-chat",
  "https://gbchat.netlify.app",
  ...envOrigins
];

export const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list or matches GitHub Pages pattern
    if (allowedOrigins.indexOf(origin) !== -1 || origin.includes('devtechs001.github.io')) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-request-id", "X-Requested-With"],
};