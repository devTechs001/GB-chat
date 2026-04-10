// scripts/seed-admin.js
// Seed Admin User for Development

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

// Import User model
import User from '../models/User.js';

// Admin user credentials
const adminUser = {
  fullName: 'Dev Admin',
  email: 'devtechs842@gmail.com',
  password: 'password123',
  isVerified: true,
  status: 'online',
  about: 'Development Administrator',
  role: 'admin'
};

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || process.env.MONGODB_URL || 'mongodb://localhost:27017/gbchat';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Seed admin user
const seedAdmin = async () => {
  console.log('\n👤 Seeding admin user...');
  
  try {
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: adminUser.email });
    
    if (existingAdmin) {
      console.log(`   ⚠️  Admin user ${adminUser.email} already exists`);
      console.log(`   📝 Admin ID: ${existingAdmin._id}`);
      return existingAdmin;
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(adminUser.password, 12);
    
    // Create admin user
    const user = await User.create({
      ...adminUser,
      password: hashedPassword
    });
    
    console.log(`   ✅ Created admin user: ${user.fullName}`);
    console.log(`   📧 Email: ${user.email}`);
    console.log(`   🔑 Password: ${adminUser.password}`);
    console.log(`   🆔 Admin ID: ${user._id}`);
    
    return user;
  } catch (error) {
    console.error('   ❌ Error creating admin user:', error.message);
    throw error;
  }
};

// Main function
const main = async () => {
  console.log('\n🚀 ===================================');
  console.log('   GBChat Admin User Seeder');
  console.log('=====================================\n');
  
  await connectDB();
  await seedAdmin();
  
  console.log('\n✅ ===================================');
  console.log('   Admin user seeded successfully!');
  console.log('=====================================\n');
  
  await mongoose.connection.close();
  process.exit(0);
};

main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
