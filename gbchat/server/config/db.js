// server/config/db.js
import mongoose from "mongoose";

export const connectDB = async () => {
  const isDev = process.env.NODE_ENV === 'development';

  // Try MONGODB_URI first (Render uses this), then fall back to MONGODB_URL
  const uri = process.env.MONGODB_URI || process.env.MONGODB_URL;
  const localUri = 'mongodb://localhost:27017/gbchat';

  if (!uri && isDev) {
    console.warn('⚠️ No MONGODB_URI or MONGODB_URL found. Falling back to local MongoDB...');
  }

  try {
    if (uri) {
      console.log('📡 Attempting to connect to MongoDB...');
      const conn = await mongoose.connect(uri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 30000, // Increased timeout for Atlas
        socketTimeoutMS: 45000,
        family: 4 // Force IPv4 to avoid potential DNS issues in some environments
      });
      console.log(`✅ MongoDB connected: ${conn.connection.host}`);
      return;
    }

    // Fallback to local MongoDB in development
    if (isDev) {
      console.warn('⚠️ MongoDB Atlas not configured. Falling back to local MongoDB...');
      const conn = await mongoose.connect(localUri, {
        maxPoolSize: 10,
      });
      console.log(`✅ Local MongoDB connected: ${conn.connection.host}`);
    } else {
      console.error("❌ MongoDB connection string not provided in production");
      process.exit(1);
    }
  } catch (error) {
    if (isDev && !uri) {
      console.warn('⚠️ MongoDB connection failed. Error:', error.message);
      try {
        const conn = await mongoose.connect(localUri, {
          maxPoolSize: 10,
        });
        console.log(`✅ Local MongoDB connected: ${conn.connection.host}`);
      } catch (localError) {
        console.error("❌ Both Atlas and Local MongoDB connections failed:", localError.message);
        process.exit(1);
      }
    } else {
      console.error("❌ MongoDB connection error:", error.message);
      process.exit(1);
    }
  }
};