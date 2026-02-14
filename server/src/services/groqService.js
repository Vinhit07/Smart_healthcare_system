const Groq = require('groq-sdk');

const GROQ_API_KEY = process.env.GROQ_API_KEY;

let groq;
if (GROQ_API_KEY) {
    groq = new Groq({ apiKey: GROQ_API_KEY });
}

// System prompts (reused for consistency)
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

// Helper to sanitize JSON from Markdown code blocks
function cleanJson(text) {
    return text.replace(/```json\n|\n```/g, '').trim();
}

/**
 * Predict disease from symptoms using Groq
 * @param {Array<string>} symptoms - List of symptoms
 * @returns {Promise<Object>} - Disease prediction with confidence, specialty, advice
 */
async function predictDisease(symptoms) {
    if (!groq) throw new Error('GROQ_API_KEY is not configured');

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: DISEASE_PREDICTION_PROMPT },
                { role: 'user', content: `Symptoms: ${symptoms.join(', ')}. Provide disease prediction in JSON format.` }
            ],
            model: 'llama-3.1-8b-instant', // Current Groq model
            temperature: 0.5,
            response_format: { type: 'json_object' }, // Enforce JSON
        });

        const content = completion.choices[0]?.message?.content || '{}';
        const prediction = JSON.parse(content);

        // Safety checks
        if (prediction.confidence > 75) prediction.confidence = 75;
        if (prediction.confidence < 40) prediction.confidence = 40;

        if (!prediction.advice?.toLowerCase().includes('consult')) {
            prediction.advice += ' Please consult a healthcare professional.';
        }

        return prediction;
    } catch (error) {
        console.error('Groq Prediction Error:', error);
        throw new Error('Failed to get AI response. Please try again later.');
    }
}

/**
 * Chat with medical AI bot using Groq
 * @param {Array} conversationHistory - Array of {role, content} behavior
 * @param {Object} patientContext - Optional context
 * @returns {Promise<string>} - AI response
 */
async function chatWithBot(conversationHistory, patientContext = {}) {
    if (!groq) throw new Error('GROQ_API_KEY is not configured');

    try {
        const messages = [{ role: 'system', content: CHATBOT_PROMPT }];

        if (Object.keys(patientContext).length > 0) {
            const contextStr = Object.entries(patientContext)
                .map(([k, v]) => `${k}: ${v}`).join(', ');
            messages.push({ role: 'system', content: `Patient context: ${contextStr}` });
        }

        // Map roles: 'assistant' -> 'assistant', 'user' -> 'user'
        // Groq/OpenAI compatible structure
        const sanitizedHistory = conversationHistory.map(({ role, content }) => ({ role, content }));
        messages.push(...sanitizedHistory);

        const completion = await groq.chat.completions.create({
            messages,
            model: 'llama-3.1-8b-instant',
            temperature: 0.7,
            max_tokens: 500,
        });

        return completion.choices[0]?.message?.content || "I apologize, I couldn't generate a response.";
    } catch (error) {
        console.error('Groq Chat Error:', error);
        throw new Error('Failed to get AI response.');
    }
}

/**
 * Analyze symptoms from free text using Groq
 */
async function analyzeSymptoms(symptomText) {
    if (!groq) throw new Error('GROQ_API_KEY is not configured');

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: SYMPTOM_ANALYSIS_PROMPT },
                { role: 'user', content: `Patient describes: "${symptomText}". Analyze and respond in JSON.` }
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.2, // Lower temp for extraction
            response_format: { type: 'json_object' },
        });

        return JSON.parse(completion.choices[0]?.message?.content || '{}');
    } catch (error) {
        console.error('Groq Analysis Error:', error);
        throw new Error('Failed to analyze symptoms');
    }
}

module.exports = { predictDisease, chatWithBot, analyzeSymptoms };
