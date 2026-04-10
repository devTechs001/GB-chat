// utils/initAdmin.js
// Initialize Admin User on Server Startup

import User from '../models/User.js';
import bcrypt from 'bcryptjs';

const ADMIN_EMAIL = 'devtechs842@gmail.com';
const ADMIN_PASSWORD = 'password123';

export const initializeAdmin = async () => {
  try {
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists:', ADMIN_EMAIL);
      return existingAdmin;
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);
    
    // Create admin user
    const admin = await User.create({
      fullName: 'Dev Admin',
      email: ADMIN_EMAIL,
      password: hashedPassword,
      isVerified: true,
      status: 'online',
      about: 'Development Administrator',
      role: 'admin'
    });
    
    console.log('✅ Admin user created successfully');
    console.log(`   📧 Email: ${ADMIN_EMAIL}`);
    console.log(`   🔑 Password: ${ADMIN_PASSWORD}`);
    console.log(`   🆔 Admin ID: ${admin._id}`);
    
    return admin;
  } catch (error) {
    console.error('❌ Error initializing admin user:', error.message);
    // Don't throw error to allow server to start even if admin creation fails
    return null;
  }
};
