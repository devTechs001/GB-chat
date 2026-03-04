// scripts/seed-demo-data.js
// Seed Demo Accounts, Contacts, and Sample Chats

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

// Import models
import User from '../models/User.js';
import Contact from '../models/Contact.model.js';
import Message from '../models/Message.js';
import Chat from '../models/Chat.js';

// Demo users with lastSeen
const demoUsers = [
    {
        fullName: 'John Doe',
        username: 'john_demo',
        email: 'john@demo.com',
        phone: '+1234567890',
        password: 'demo123',
        role: 'user',
        avatar: 'https://i.pravatar.cc/150?img=1',
        about: 'Hey there! I am using GBChat',
        status: 'online',
        lastSeen: new Date(Date.now() - 300000), // 5 minutes ago
        isDemo: true
    },
    {
        fullName: 'Alice Smith',
        username: 'alice_demo',
        email: 'alice@demo.com',
        phone: '+1234567891',
        password: 'demo123',
        role: 'user',
        avatar: 'https://i.pravatar.cc/150?img=5',
        about: 'Available',
        status: 'online',
        lastSeen: new Date(Date.now() - 7200000), // 2 hours ago
        isDemo: true
    },
    {
        fullName: 'Bob Wilson',
        username: 'bob_demo',
        email: 'bob@demo.com',
        phone: '+1234567892',
        password: 'demo123',
        role: 'user',
        avatar: 'https://i.pravatar.cc/150?img=3',
        about: 'Busy',
        status: 'busy',
        lastSeen: new Date(Date.now() - 86400000), // 1 day ago
        isDemo: true
    },
    {
        fullName: 'Carol Johnson',
        username: 'carol_demo',
        email: 'carol@demo.com',
        phone: '+1234567893',
        password: 'demo123',
        role: 'user',
        avatar: 'https://i.pravatar.cc/150?img=9',
        about: 'At work',
        status: 'away',
        lastSeen: new Date(Date.now() - 172800000), // 2 days ago
        isDemo: true
    },
    {
        fullName: 'Tech Support',
        username: 'support_demo',
        email: 'support@demo.com',
        phone: '+1234567899',
        password: 'demo123',
        role: 'user',
        avatar: 'https://i.pravatar.cc/150?img=8',
        about: 'We are here to help!',
        status: 'online',
        lastSeen: new Date(Date.now() - 60000), // 1 minute ago
        isDemo: true,
        businessProfile: {
            businessName: 'GBChat Support',
            category: 'technology',
            description: 'Official GBChat technical support',
            verified: true
        }
    }
];

// Sample contacts for each user
const sampleContacts = [
    { name: 'Mom', phoneNumber: '+1111111111', email: 'mom@example.com', labels: ['family'], isFavorite: true },
    { name: 'Dad', phoneNumber: '+1111111112', email: 'dad@example.com', labels: ['family'], isFavorite: true },
    { name: 'Sister', phoneNumber: '+1111111113', labels: ['family'] },
    { name: 'Best Friend', phoneNumber: '+1111111114', labels: ['friends'], isFavorite: true },
    { name: 'Boss', phoneNumber: '+1111111115', labels: ['work'] },
    { name: 'Colleague', phoneNumber: '+1111111116', labels: ['work'] },
    { name: 'Doctor', phoneNumber: '+1111111117', labels: ['other'] },
    { name: 'Pizza Place', phoneNumber: '+1111111118', labels: ['other'] },
    { name: 'Gym', phoneNumber: '+1111111119', labels: ['other'] },
    { name: 'Bank', phoneNumber: '+1111111120', labels: ['business'] }
];

// Sample messages with status variations
const sampleMessages = [
    { type: 'text', content: 'Hey! How are you?', status: 'read' },
    { type: 'text', content: 'I am doing great, thanks!', status: 'read' },
    { type: 'text', content: 'Did you see the latest update?', status: 'delivered' },
    { type: 'text', content: 'Yes! The new features are amazing!', status: 'delivered' },
    { type: 'text', content: 'Especially the AI assistant', status: 'sent' },
    { type: 'text', content: 'When are we meeting?', status: 'read' },
    { type: 'text', content: 'Let me check my calendar', status: 'read' },
    { type: 'text', content: 'How about tomorrow at 3 PM?', status: 'delivered' },
    { type: 'text', content: 'Perfect! See you then', status: 'sent' },
    { type: 'text', content: '👍', status: 'read' }
];

// Connect to MongoDB
const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gbchat-enterprise';
        await mongoose.connect(mongoURI);
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        process.exit(1);
    }
};

// Seed demo users
const seedDemoUsers = async () => {
    console.log('\n👥 Seeding demo users...');
    
    const users = [];
    for (const userData of demoUsers) {
        const existingUser = await User.findOne({ email: userData.email });
        if (existingUser) {
            console.log(`   ⚠️  User ${userData.email} already exists`);
            users.push(existingUser);
            continue;
        }
        
        const hashedPassword = await bcrypt.hash(userData.password, 12);
        const user = await User.create({
            ...userData,
            password: hashedPassword
        });

        console.log(`   ✅ Created user: ${user.fullName}`);
        users.push(user);
    }
    
    return users;
};

// Seed contacts for a user
const seedContacts = async (userId) => {
    console.log('\n📇 Seeding contacts...');
    
    const contacts = [];
    for (const contactData of sampleContacts) {
        const existingContact = await Contact.findOne({
            userId,
            phoneNumber: contactData.phone
        });
        
        if (existingContact) {
            contacts.push(existingContact);
            continue;
        }
        
        const contact = await Contact.create({
            userId,
            ...contactData,
            syncedFrom: 'manual'
        });
        
        contacts.push(contact);
    }
    
    console.log(`   ✅ Created ${contacts.length} contacts`);
    return contacts;
};

// Seed sample chats and messages
const seedChatsAndMessages = async (users) => {
    console.log('\n💬 Seeding chats and messages...');
    
    let chatsCreated = 0;
    let messagesCreated = 0;
    
    // Create chats between demo users
    for (let i = 0; i < users.length; i++) {
        for (let j = i + 1; j < users.length; j++) {
            const user1 = users[i];
            const user2 = users[j];
            
            // Check if chat exists
            let chat = await Chat.findOne({
                participants: { $all: [user1._id, user2._id] }
            });
            
            if (!chat) {
                chat = await Chat.create({
                    participants: [user1._id, user2._id],
                    isGroup: false,
                    name: null
                });
                chatsCreated++;
            }
            
            // Add sample messages with varied timestamps and statuses
            const messages = [];
            const messageCount = Math.floor(Math.random() * 5) + 3; // 3-8 messages

            for (let k = 0; k < messageCount; k++) {
                const sampleMsg = sampleMessages[k % sampleMessages.length];

                // Create timestamp with seconds - spread messages over time
                const hoursAgo = (messageCount - k) * 2;
                const minutesAgo = (messageCount - k) * 15;
                const secondsAgo = (messageCount - k) * 30;
                const msgTime = new Date(Date.now() - (hoursAgo * 3600000) - (minutesAgo * 60000) - (secondsAgo * 1000));

                messages.push({
                    chat: chat._id,
                    sender: k % 2 === 0 ? user1._id : user2._id,
                    type: sampleMsg.type,
                    content: { text: sampleMsg.content },
                    status: sampleMsg.status || 'sent',
                    deliveredAt: sampleMsg.status === 'read' || sampleMsg.status === 'delivered' ? msgTime : null,
                    readAt: sampleMsg.status === 'read' ? msgTime : null,
                    createdAt: msgTime,
                    updatedAt: msgTime
                });
            }

            if (messages.length > 0) {
                await Message.insertMany(messages);
                messagesCreated += messages.length;

                // Update chat last message
                chat.lastMessage = messages[messages.length - 1]._id;
                await chat.save();
            }
        }
    }
    
    console.log(`   ✅ Created ${chatsCreated} chats with ${messagesCreated} messages`);
};

// Main function
const main = async () => {
    console.log('\n🚀 ===================================');
    console.log('   GBChat Demo Data Seeder');
    console.log('=====================================\n');
    
    await connectDB();
    
    // Seed demo users
    const users = await seedDemoUsers();
    
    if (users.length > 0) {
        // Seed contacts for first user (main demo user)
        await seedContacts(users[0]._id);
        
        // Seed chats and messages between demo users
        await seedChatsAndMessages(users);
    }
    
    console.log('\n✅ ===================================');
    console.log('   Demo data seeded successfully!');
    console.log('=====================================\n');
    
    console.log('📝 Demo Credentials:');
    console.log('   ─────────────────────────────────────');
    demoUsers.forEach(user => {
        console.log(`   ${user.name}`);
        console.log(`      Email: ${user.email}`);
        console.log(`      Password: demo123`);
    });
    console.log('\n');
    
    await mongoose.connection.close();
    process.exit(0);
};

main().catch(error => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
});
