// server/config/db.js
import mongoose from "mongoose";

export const connectDB = async () => {
  const isDev = process.env.NODE_ENV === 'development';
  const atlasUri = process.env.MONGODB_URL;
  const localUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/gbchat';

  try {
    console.log('📡 Attempting to connect to MongoDB Atlas...');
    const conn = await mongoose.connect(atlasUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s for failover
    });
    console.log(`✅ MongoDB Atlas connected: ${conn.connection.host}`);
  } catch (error) {
    if (isDev) {
      console.warn('⚠️ MongoDB Atlas connection failed. Falling back to local MongoDB Compass...');
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