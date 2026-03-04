// scripts/create-user.js
// Create a single user account

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

// Import User model
import User from '../models/User.js';

// User details
const userData = {
    fullName: 'DevTech',
    email: 'devtechs842@gmail.com',
    password: 'pass123',
    status: 'Hey there! I am using GBChat',
    isDemo: false
};

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

// Create user
const createUser = async () => {
    console.log('\n👥 Creating user...\n');

    // Check if user exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
        console.log(`⚠️  User ${userData.email} already exists!`);
        await mongoose.connection.close();
        process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 12);

    // Create user
    const user = await User.create({
        ...userData,
        password: hashedPassword
    });

    console.log('✅ User created successfully!\n');
    console.log('┌─────────────────────────────────────────┐');
    console.log('│   Login Credentials                     │');
    console.log('├─────────────────────────────────────────┤');
    console.log(`│   Email:    ${userData.email}`);
    console.log(`│   Password: ${userData.password}`);
    console.log('└─────────────────────────────────────────┘\n');

    await mongoose.connection.close();
    process.exit(0);
};

// Main
connectDB().then(createUser).catch(error => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
});
