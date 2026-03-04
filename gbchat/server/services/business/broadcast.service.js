// services/business/broadcast.service.js
const Message = require('../../models/Message');
const Chat = require('../../models/Chat');
const User = require('../../models/User');

class BroadcastService {
    constructor() {
        this.queue = [];
        this.processing = false;
    }

    // Send broadcast to multiple contacts
    async sendBroadcast(senderId, recipients, messageData) {
        const results = {
            total: recipients.length,
            sent: 0,
            failed: 0,
            details: []
        };

        for (const recipientId of recipients) {
            try {
                const result = await this.sendBroadcastMessage(senderId, recipientId, messageData);
                results.sent++;
                results.details.push({ recipientId, success: true, ...result });
            } catch (error) {
                results.failed++;
                results.details.push({ recipientId, success: false, error: error.message });
            }
        }

        return results;
    }

    // Send single broadcast message
    async sendBroadcastMessage(senderId, recipientId, messageData) {
        // Check if recipient has blocked sender
        const chat = await Chat.findOne({
            participants: { $all: [senderId, recipientId] }
        });

        if (chat && chat.blockedBy && chat.blockedBy.toString() === recipientId.toString()) {
            throw new Error('Message blocked by recipient');
        }

        // Create message
        const message = await Message.create({
            chatId: chat?._id,
            senderId,
            recipientId,
            type: messageData.type || 'text',
            content: messageData.content,
            metadata: messageData.metadata,
            isBroadcast: true
        });

        // Emit socket event
        if (global.io) {
            global.io.to(recipientId.toString()).emit('message:new', {
                message: message,
                chatId: chat?._id
            });
        }

        return { messageId: message._id, timestamp: message.createdAt };
    }

    // Schedule broadcast
    async scheduleBroadcast(senderId, recipients, messageData, scheduledTime) {
        const broadcastJob = {
            id: `broadcast_${Date.now()}`,
            senderId,
            recipients,
            messageData,
            scheduledTime: new Date(scheduledTime),
            status: 'pending',
            createdAt: new Date()
        };

        this.queue.push(broadcastJob);
        
        // Sort queue by scheduled time
        this.queue.sort((a, b) => a.scheduledTime - b.scheduledTime);

        // Process queue
        this.processQueue();

        return broadcastJob;
    }

    // Process broadcast queue
    async processQueue() {
        if (this.processing) return;
        this.processing = true;

        while (this.queue.length > 0) {
            const now = new Date();
            const job = this.queue[0];

            if (job.scheduledTime <= now) {
                this.queue.shift();
                
                try {
                    await this.sendBroadcast(job.senderId, job.recipients, job.messageData);
                    job.status = 'completed';
                } catch (error) {
                    job.status = 'failed';
                    job.error = error.message;
                }
            } else {
                break;
            }
        }

        this.processing = false;

        // Schedule next check
        if (this.queue.length > 0) {
            setTimeout(() => this.processQueue(), 60000); // Check every minute
        }
    }

    // Get broadcast analytics
    async getBroadcastAnalytics(senderId, broadcastId) {
        const messages = await Message.find({
            senderId,
            isBroadcast: true,
            _id: broadcastId
        });

        const analytics = {
            totalSent: messages.length,
            delivered: messages.filter(m => m.status === 'delivered').length,
            read: messages.filter(m => m.status === 'read').length,
            failed: messages.filter(m => m.status === 'failed').length,
            engagement: {
                replies: 0,
                clicks: 0
            }
        };

        // Count replies
        const replyCount = await Message.countDocuments({
            recipientId: senderId,
            inReplyTo: { $in: messages.map(m => m._id) }
        });

        analytics.engagement.replies = replyCount;

        return analytics;
    }

    // Create message template
    async createTemplate(senderId, templateData) {
        const template = {
            id: `template_${Date.now()}`,
            senderId,
            name: templateData.name,
            content: templateData.content,
            variables: templateData.variables || [],
            category: templateData.category || 'marketing',
            status: 'pending_approval',
            createdAt: new Date()
        };

        // Save to database (implement Template model)
        // await Template.create(template);

        return template;
    }

    // Send template message
    async sendTemplateMessage(senderId, recipientId, templateId, variables) {
        // Get template
        // const template = await Template.findById(templateId);
        
        // Replace variables
        let content = template.content;
        Object.entries(variables).forEach(([key, value]) => {
            content = content.replace(`{{${key}}}`, value);
        });

        return this.sendBroadcastMessage(senderId, recipientId, { content });
    }
}

module.exports = new BroadcastService();
