const axios = require('axios');

const GROK_API_KEY = process.env.GROK_API_KEY;
const GROK_API_URL = process.env.GROK_API_URL || 'https://api.x.ai/v1';

// System prompts for different AI features
const DISEASE_PREDICTION_PROMPT = `You are a medical AI assistant trained to predict potential diseases from symptoms. 
When given a list of symptoms, respond ONLY with valid JSON in this exact format:
{
  "predictedDisease": "Disease Name",
  "confidence": 65,
  "recommendedSpecialty": "Specialty Name (e.g., Cardiology, Neurology)",
  "symptoms_matched": ["symptom1", "symptom2"],
  "advice": "Brief 2-3 sentence health advice for the patient. Always emphasize consulting a real doctor.",
  "urgency": "low"
}

IMPORTANT RULES:
- Confidence should be in the range 40-75% (never higher)
- Use "low", "medium", or "high" for urgency
- Advice must include "Please consult a healthcare professional"
- Do not include any text outside the JSON object
- Never say "You have [disease]", always say "Possible condition" or "May indicate"`;

const CHATBOT_PROMPT = `You are a compassionate and knowledgeable medical assistant chatbot for a healthcare platform. 
Your role is to:
1. Help patients understand their symptoms in plain language
2. Suggest appropriate medical specialties when needed
3. Provide general wellness and preventive health advice
4. Remind users that you cannot replace a real doctor's diagnosis
5. Be empathetic, clear, and concise in all responses

CRITICAL SAFETY RULES:
- NEVER say "You have [disease X]" - always say "possible condition" or "may indicate"
- NEVER provide treatment advice or prescribe medications
- NEVER suggest specific medications
- ALWAYS include disclaimers recommending professional medical consultation
- Limit confidence statements to ranges like "This could suggest..."
- For serious symptoms, ALWAYS recommend immediate medical attention

Keep responses under 150 words unless explaining complex health topics.`;

const SYMPTOM_ANALYSIS_PROMPT = `Analyze the following free-text description of symptoms from a patient.
Extract key symptoms, identify the likely affected body system, and suggest a medical specialty to consult.
Respond ONLY in valid JSON format:
{
  "extractedSymptoms": ["symptom1", "symptom2", "symptom3"],
  "bodySystem": "Body system name (e.g., Respiratory, Cardiovascular)",
  "suggestedSpecialty": "Medical specialty",
  "summary": "2-3 sentence summary with disclaimer to consult a doctor"
}

Remember: Never provide definitive diagnoses. Always recommend professional consultation.`;

/**
 * Make a request to Grok API
 * @param {Array} messages - Array of {role, content} objects
 * @param {number} temperature - Creativity level (0-1)
 * @param {number} maxTokens - Max response tokens
 * @returns {Promise<string>} - AI response content
 */
async function callGrokAPI(messages, temperature = 0.7, maxTokens = 1000) {
    if (!GROK_API_KEY) {
        throw new Error('GROK_API_KEY is not configured');
    }

    try {
        const response = await axios.post(
            `${GROK_API_URL}`,
            {
                model: 'grok-2-latest',
                messages,
                temperature,
                max_tokens: maxTokens,
            },
            {
                headers: {
                    'Authorization': `Bearer ${GROK_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                timeout: 30000, // 30 second timeout
            }
        );

        return response.data.choices[0].message.content;
    } catch (error) {
        console.error('Grok API Error:', error.response?.data || error.message);
        throw new Error('Failed to get AI response. Please try again later.');
    }
}

/**
 * Predict disease from symptoms
 * @param {Array<string>} symptoms - List of symptoms
 * @returns {Promise<Object>} - Disease prediction with confidence, specialty, advice
 */
async function predictDisease(symptoms) {
    const messages = [
        {
            role: 'system',
            content: DISEASE_PREDICTION_PROMPT,
        },
        {
            role: 'user',
            content: `Symptoms: ${symptoms.join(', ')}. Provide disease prediction in JSON format as instructed.`,
        },
    ];

    const response = await callGrokAPI(messages, 0.5, 800);

    try {
        // Extract JSON from response (in case there's extra text)
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Invalid JSON response from AI');
        }

        const prediction = JSON.parse(jsonMatch[0]);

        // Ensure confidence is capped at realistic levels (40-75%)
        if (prediction.confidence > 75) {
            prediction.confidence = Math.min(prediction.confidence, 75);
        }
        if (prediction.confidence < 40) {
            prediction.confidence = 40;
        }

        // Add mandatory disclaimer
        if (!prediction.advice.toLowerCase().includes('consult') && !prediction.advice.toLowerCase().includes('doctor')) {
            prediction.advice += ' Please consult a healthcare professional for proper diagnosis.';
        }

        return prediction;
    } catch (error) {
        console.error('Error parsing AI response:', error);
        throw new Error('Failed to parse AI prediction');
    }
}

/**
 * Chat with medical AI bot
 * @param {Array} conversationHistory - Array of {role, content} messages
 * @param {Object} patientContext - Optional patient context (age, conditions, etc.)
 * @returns {Promise<string>} - AI response
 */
async function chatWithBot(conversationHistory, patientContext = {}) {
    const messages = [
        {
            role: 'system',
            content: CHATBOT_PROMPT,
        },
    ];

    // Add patient context if provided
    if (patientContext && Object.keys(patientContext).length > 0) {
        const contextStr = Object.entries(patientContext)
            .map(([key, val]) => `${key}: ${val}`)
            .join(', ');
        messages.push({
            role: 'system',
            content: `Patient context: ${contextStr}`,
        });
    }

    // Add conversation history
    messages.push(...conversationHistory);

    const response = await callGrokAPI(messages, 0.7, 500);

    return response;
}

/**
 * Analyze symptoms from free text
 * @param {string} symptomText - Free-form symptom description
 * @returns {Promise<Object>} - Extracted symptoms, body system, specialty, summary
 */
async function analyzeSymptoms(symptomText) {
    const messages = [
        {
            role: 'system',
            content: SYMPTOM_ANALYSIS_PROMPT,
        },
        {
            role: 'user',
            content: `Patient describes: "${symptomText}". Analyze and respond in JSON format.`,
        },
    ];

    const response = await callGrokAPI(messages, 0.5, 600);

    try {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Invalid JSON response from AI');
        }

        return JSON.parse(jsonMatch[0]);
    } catch (error) {
        console.error('Error parsing symptom analysis:', error);
        throw new Error('Failed to analyze symptoms');
    }
}

module.exports = {
    predictDisease,
    chatWithBot,
    analyzeSymptoms,
};
