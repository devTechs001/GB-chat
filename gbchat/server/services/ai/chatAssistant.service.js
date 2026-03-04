// services/ai/chatAssistant.service.js
const { GoogleGenerativeAI } = require('@google/generative-ai');

class ChatAssistantService {
    constructor() {
        this.apiKey = process.env.GOOGLE_CLOUD_API_KEY;
        if (this.apiKey) {
            this.genAI = new GoogleGenerativeAI(this.apiKey);
            this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
        }
    }

    // Generate smart reply suggestions
    async generateSmartReplies(message, context = []) {
        if (!this.model) {
            return this.getDefaultReplies();
        }

        try {
            const prompt = `Generate 3 short, casual reply suggestions for this message: "${message}"
            Context: ${context.slice(-5).join(' | ')}
            Keep each reply under 10 words. Return as JSON array.`;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            
            // Parse JSON from response
            const matches = text.match(/\[.*\]/s);
            if (matches) {
                return JSON.parse(matches[0]);
            }
            
            return this.getDefaultReplies();
        } catch (error) {
            console.error('Error generating smart replies:', error);
            return this.getDefaultReplies();
        }
    }

    // Translate message
    async translateMessage(text, targetLanguage = 'en', sourceLanguage = 'auto') {
        if (!this.model) {
            return { translatedText: text, detectedLanguage: 'unknown' };
        }

        try {
            const prompt = `Translate the following text to ${targetLanguage}: "${text}"
            Return JSON with: { translatedText, detectedLanguage }`;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            
            const matches = text.match(/\{.*\}/s);
            if (matches) {
                return JSON.parse(matches[0]);
            }
            
            return { translatedText: text, detectedLanguage: sourceLanguage };
        } catch (error) {
            console.error('Error translating:', error);
            return { translatedText: text, detectedLanguage: 'unknown' };
        }
    }

    // Analyze sentiment
    async analyzeSentiment(text) {
        if (!this.model) {
            return { score: 0, magnitude: 0, label: 'neutral' };
        }

        try {
            const prompt = `Analyze sentiment of: "${text}"
            Return JSON with: { score: -1 to 1, magnitude: 0 to 1, label: 'positive' | 'negative' | 'neutral' }`;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            
            const matches = text.match(/\{.*\}/s);
            if (matches) {
                return JSON.parse(matches[0]);
            }
            
            return { score: 0, magnitude: 0, label: 'neutral' };
        } catch (error) {
            console.error('Error analyzing sentiment:', error);
            return { score: 0, magnitude: 0, label: 'neutral' };
        }
    }

    // Detect spam
    async detectSpam(text, senderHistory = {}) {
        const spamIndicators = [
            /winner/i, /congratulations/i, /click here/i, /free money/i,
            /urgent/i, /act now/i, /limited time/i, /claim your/i
        ];

        let spamScore = 0;
        spamIndicators.forEach(indicator => {
            if (indicator.test(text)) spamScore++;
        });

        // Check sender history
        if (senderHistory.reportedCount > 3) spamScore += 2;
        if (senderHistory.messageCount < 5 && text.length > 200) spamScore += 1;

        return {
            isSpam: spamScore >= 3,
            confidence: Math.min(spamScore / 5, 1),
            reasons: this.getSpamReasons(text)
        };
    }

    // Summarize conversation
    async summarizeConversation(messages) {
        if (!this.model || messages.length < 5) {
            return null;
        }

        try {
            const conversationText = messages.map(m => `${m.sender}: ${m.text}`).join('\n');
            const prompt = `Summarize this conversation in 2-3 sentences:
            ${conversationText}`;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error('Error summarizing:', error);
            return null;
        }
    }

    // Auto-compose message
    async composeMessage(intent, context = {}) {
        if (!this.model) {
            return null;
        }

        try {
            const prompt = `Compose a ${intent} message. Context: ${JSON.stringify(context)}
            Keep it friendly and professional. Max 50 words.`;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error('Error composing message:', error);
            return null;
        }
    }

    // Helper methods
    getDefaultReplies() {
        return ['Okay', 'Sure', 'Thanks', 'Got it', 'Will do'];
    }

    getSpamReasons(text) {
        const reasons = [];
        if (/winner|congratulations/i.test(text)) reasons.push('Prize/lottery language');
        if (/click here|urgent/i.test(text)) reasons.push('Urgency tactics');
        if (/free money|claim/i.test(text)) reasons.push('Financial诱惑');
        if (text.includes('http') && text.length < 50) reasons.push('Short message with link');
        return reasons;
    }
}

module.exports = new ChatAssistantService();
