// server/config/db.js
import mongoose from "mongoose";

export const connectDB = async () => {
  const isDev = process.env.NODE_ENV === 'development';

  // Try MONGODB_URI first (Render uses this), then fall back to MONGODB_URL
  const uri = process.env.MONGODB_URI || process.env.MONGODB_URL;
  const fallbackUri = process.env.MONGODB_FALLBACK_URI;
  const localUri = 'mongodb://localhost:27017/gbchat';

  if (!uri && !fallbackUri && isDev) {
    console.warn('⚠️ No MongoDB connection strings found. Falling back to local MongoDB...');
  }

  const connectWithRetry = async (connectionString, label) => {
    try {
      const maskedUri = connectionString.replace(/\/\/([^:]+):([^@]+)@/, '// $1:****@');
      console.log(`📡 Attempting to connect to ${label}: ${maskedUri}`);
      const conn = await mongoose.connect(connectionString, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 15000, // Reduced for faster failover to fallback
        socketTimeoutMS: 45000,
        family: 4
      });
      console.log(`✅ ${label} connected: ${conn.connection.host}`);
      return true;
    } catch (error) {
      console.error(`❌ ${label} connection error:`, error.message);
      return false;
    }
  };

  try {
    // 1. Try Primary URI
    if (uri) {
      const success = await connectWithRetry(uri, 'Primary MongoDB');
      if (success) return;
    }

    // 2. Try Fallback URI
    if (fallbackUri) {
      const success = await connectWithRetry(fallbackUri, 'Fallback MongoDB');
      if (success) return;
    }

    // 3. Fallback to local MongoDB in development
    if (isDev) {
      console.warn('⚠️ Both primary and fallback Atlas connections failed. Falling back to local MongoDB...');
      const conn = await mongoose.connect(localUri, {
        maxPoolSize: 10,
      });
      console.log(`✅ Local MongoDB connected: ${conn.connection.host}`);
    } else {
      console.error("❌ No valid MongoDB connection strings succeeded in production");
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Fatal MongoDB error:", error.message);
    process.exit(1);
  }
};