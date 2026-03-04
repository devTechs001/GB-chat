// scripts/seed-user-chats.js
// Seed demo chats for devtechs842@gmail.com user

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Import models
import User from '../models/User.js';
import Chat from '../models/Chat.js';
import Message from '../models/Message.js';

// Demo users to chat with
const demoChats = [
    {
        fullName: 'John Doe',
        email: 'john@demo.com',
        avatar: 'https://i.pravatar.cc/150?img=1',
        messages: [
            { text: 'Hey! How are you?', from: 'them' },
            { text: 'I am doing great, thanks!', from: 'me' },
            { text: 'Did you see the latest update?', from: 'them' },
        ]
    },
    {
        fullName: 'Alice Smith',
        email: 'alice@demo.com',
        avatar: 'https://i.pravatar.cc/150?img=5',
        messages: [
            { text: 'Hi there!', from: 'them' },
            { text: 'When are we meeting?', from: 'them' },
            { text: 'Let me check my calendar', from: 'me' },
            { text: 'How about tomorrow at 3 PM?', from: 'them' },
        ]
    },
    {
        fullName: 'Bob Wilson',
        email: 'bob@demo.com',
        avatar: 'https://i.pravatar.cc/150?img=3',
        messages: [
            { text: 'Check out this new feature!', from: 'them' },
            { text: 'Looks amazing!', from: 'me' },
        ]
    },
    {
        fullName: 'Carol Johnson',
        email: 'carol@demo.com',
        avatar: 'https://i.pravatar.cc/150?img=9',
        messages: [
            { text: 'Are you coming to the party?', from: 'them' },
        ]
    },
    {
        fullName: 'Tech Support',
        email: 'support@demo.com',
        avatar: 'https://i.pravatar.cc/150?img=8',
        messages: [
            { text: 'Welcome to GBChat! 🎉', from: 'them' },
            { text: 'We are here to help you get started.', from: 'them' },
            { text: 'Feel free to reach out if you have any questions.', from: 'them' },
        ]
    }
];

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

// Main function
const main = async () => {
    console.log('\n🚀 ===================================');
    console.log('   Seeding chats for devtechs842@gmail.com');
    console.log('=====================================\n');

    await connectDB();

    // Find the user
    const user = await User.findOne({ email: 'devtechs842@gmail.com' });
    if (!user) {
        console.log('❌ User devtechs842@gmail.com not found!');
        await mongoose.connection.close();
        process.exit(1);
    }

    console.log(`👤 Found user: ${user.fullName}`);

    let chatsCreated = 0;
    let messagesCreated = 0;

    // Create chats with demo users
    for (const demo of demoChats) {
        const demoUser = await User.findOne({ email: demo.email });
        if (!demoUser) {
            console.log(`⚠️  Demo user ${demo.email} not found, skipping...`);
            continue;
        }

        // Check if chat already exists
        let chat = await Chat.findOne({
            type: 'private',
            participants: { $all: [user._id, demoUser._id] }
        });

        if (chat) {
            console.log(`💬 Chat with ${demo.fullName} already exists`);
            continue;
        }

        // Create new chat
        chat = await Chat.create({
            type: 'private',
            participants: [
                { user: user._id },
                { user: demoUser._id }
            ]
        });

        // Create messages
        const messages = [];
        for (let i = 0; i < demo.messages.length; i++) {
            const msg = demo.messages[i];
            const isFromMe = msg.from === 'me';
            messages.push({
                chat: chat._id,
                sender: isFromMe ? user._id : demoUser._id,
                type: 'text',
                content: { text: msg.text },
                status: 'read',
                createdAt: new Date(Date.now() - (demo.messages.length - i) * 3600000)
            });
        }

        if (messages.length > 0) {
            const inserted = await Message.insertMany(messages);
            messagesCreated += inserted.length;

            // Update chat last message
            chat.lastMessage = inserted[inserted.length - 1]._id;
            await chat.save();
        }

        chatsCreated++;
        console.log(`✅ Created chat with ${demo.fullName} (${messages.length} messages)`);
    }

    console.log('\n✅ ===================================');
    console.log(`   Created ${chatsCreated} chats with ${messagesCreated} messages`);
    console.log('=====================================\n');

    await mongoose.connection.close();
    process.exit(0);
};

main().catch(error => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
});
