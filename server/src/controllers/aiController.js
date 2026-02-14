const prisma = require('../services/prismaClient');
const { predictDisease, chatWithBot, analyzeSymptoms } = require('../services/groqService');
const { validationResult } = require('express-validator');

/**
 * Predict disease from symptoms
 * POST /api/ai/predict-disease
 */
const predictDiseaseController = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { symptoms } = req.body;
        const patientId = req.user.userId;

        // Verify user is a patient
        const user = await prisma.user.findUnique({ where: { id: patientId } });
        if (user.role !== 'PATIENT') {
            return res.status(403).json({ error: 'Only patients can use AI features' });
        }

        // Call Grok AI
        const prediction = await predictDisease(symptoms);

        // Save to symptom log
        const symptomLog = await prisma.symptomLog.create({
            data: {
                patientId,
                symptoms,
                predictedDisease: prediction.predictedDisease,
                recommendedSpecialty: prediction.recommendedSpecialty,
                aiResponse: prediction,
            },
        });

        res.json({
            message: 'Disease prediction generated',
            prediction,
            logId: symptomLog.id,
            disclaimer:
                '⚠️ This is an AI-generated prediction and NOT a medical diagnosis. Please consult a licensed healthcare professional for proper diagnosis and treatment.',
        });
    } catch (error) {
        console.error('Predict disease error:', error);
        res.status(500).json({ error: error.message || 'Server error' });
    }
};

/**
 * Chat with AI bot
 * POST /api/ai/chat
 */
const chat = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { message, sessionId } = req.body;
        const patientId = req.user.userId;

        // Verify user is a patient
        const user = await prisma.user.findUnique({
            where: { id: patientId },
            include: { patientProfile: true },
        });
        if (user.role !== 'PATIENT') {
            return res.status(403).json({ error: 'Only patients can use AI chat' });
        }

        let chatSession;
        let conversationHistory = [];

        // If sessionId provided, load existing session
        if (sessionId) {
            chatSession = await prisma.chatSession.findFirst({
                where: {
                    id: sessionId,
                    patientId,
                },
            });

            if (chatSession) {
                conversationHistory = chatSession.messages || [];
            }
        }

        // Add user message to history
        const userMessage = {
            role: 'user',
            content: message,
            timestamp: new Date().toISOString(),
        };
        conversationHistory.push(userMessage);

        // Prepare patient context
        const patientContext = {
            age: user.patientProfile?.dateOfBirth
                ? new Date().getFullYear() - new Date(user.patientProfile.dateOfBirth).getFullYear()
                : undefined,
            bloodGroup: user.patientProfile?.bloodGroup,
        };

        // Call Grok AI
        const aiResponse = await chatWithBot(conversationHistory, patientContext);

        // Add AI response to history
        const assistantMessage = {
            role: 'assistant',
            content: aiResponse,
            timestamp: new Date().toISOString(),
        };
        conversationHistory.push(assistantMessage);

        // Save or update chat session
        if (chatSession) {
            chatSession = await prisma.chatSession.update({
                where: { id: chatSession.id },
                data: {
                    messages: conversationHistory,
                },
            });
        } else {
            chatSession = await prisma.chatSession.create({
                data: {
                    patientId,
                    messages: conversationHistory,
                },
            });
        }

        res.json({
            message: aiResponse,
            sessionId: chatSession.id,
            disclaimer:
                'This AI assistant provides general health information only and cannot replace professional medical advice.',
        });
    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ error: error.message || 'Server error' });
    }
};

/**
 * Analyze symptoms (free text)
 * POST /api/ai/analyze
 */
const analyze = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { text } = req.body;
        const patientId = req.user.userId;

        // Verify user is a patient
        const user = await prisma.user.findUnique({ where: { id: patientId } });
        if (user.role !== 'PATIENT') {
            return res.status(403).json({ error: 'Only patients can use AI features' });
        }

        // Call Grok AI
        const analysis = await analyzeSymptoms(text);

        res.json({
            analysis,
            disclaimer:
                '⚠️ This is an AI-generated analysis. Always consult a healthcare professional for medical advice.',
        });
    } catch (error) {
        console.error('Analyze symptoms error:', error);
        res.status(500).json({ error: error.message || 'Server error' });
    }
};

/**
 * Get symptom log history
 * GET /api/ai/history
 */
const getHistory = async (req, res) => {
    try {
        const patientId = req.user.userId;

        const symptomLogs = await prisma.symptomLog.findMany({
            where: { patientId },
            orderBy: {
                createdAt: 'desc',
            },
            take: 50, // Limit to last 50 entries
        });

        res.json({ history: symptomLogs });
    } catch (error) {
        console.error('Get history error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

/**
 * Get chat session by ID
 * GET /api/ai/chat/:sessionId
 */
const getChatSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const patientId = req.user.userId;

        const chatSession = await prisma.chatSession.findFirst({
            where: {
                id: sessionId,
                patientId,
            },
        });

        if (!chatSession) {
            return res.status(404).json({ error: 'Chat session not found' });
        }

        res.json({ chatSession });
    } catch (error) {
        console.error('Get chat session error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    predictDiseaseController,
    chat,
    analyze,
    getHistory,
    getChatSession,
};
