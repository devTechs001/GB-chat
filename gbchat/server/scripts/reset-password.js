// scripts/reset-password.js
// Reset user password

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

// Import User model
import User from '../models/User.js';

// User email and new password
const email = 'devtechs842@gmail.com';
const newPassword = 'pass123';

// Connect to MongoDB
const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gbchat';
        await mongoose.connect(mongoURI);
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        process.exit(1);
    }
};

// Reset password
const resetPassword = async () => {
    console.log('\n🔑 Resetting password...\n');

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    console.log('Generated hash:', hashedPassword);

    // Update password directly without triggering pre-save hook
    const result = await User.updateOne(
        { email },
        { password: hashedPassword }
    );

    if (result.modifiedCount === 0) {
        console.log(`❌ Failed to update password for ${email}`);
        await mongoose.connection.close();
        process.exit(1);
    }

    // Verify the update
    const verifyHash = await User.findOne({ email }).select('+password');
    const match = await bcrypt.compare(newPassword, verifyHash.password);
    console.log('Verification:', match ? '✅ Password matches' : '❌ Password does not match');

    console.log('\n✅ Password reset successfully!\n');
    console.log('┌─────────────────────────────────────────┐');
    console.log('│   Login Credentials                     │');
    console.log('├─────────────────────────────────────────┤');
    console.log(`│   Email:    ${email}`);
    console.log(`│   Password: ${newPassword}`);
    console.log('└─────────────────────────────────────────┘\n');

    await mongoose.connection.close();
    process.exit(0);
};

// Main
connectDB().then(resetPassword).catch(error => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
});
