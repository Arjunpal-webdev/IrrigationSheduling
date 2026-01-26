/**
 * Krishi Sahayak - AI Chatbot using Google Gemini
 * Context-aware agricultural assistant
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { ChatMessage, FarmContext } from '@/types';

export class KrishiSahayakChatbot {
    private genAI: GoogleGenerativeAI | null = null;
    private model: any = null;

    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (apiKey) {
            this.genAI = new GoogleGenerativeAI(apiKey);
            this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
        }
    }

    /**
     * Generate response with farm context
     */
    async generateResponse(
        userMessage: string,
        context: FarmContext,
        chatHistory: ChatMessage[] = []
    ): Promise<string> {
        // Build context-aware prompt
        const systemPrompt = this.buildSystemPrompt(context);
        const fullPrompt = `${systemPrompt}\n\nUser Question: ${userMessage}`;

        try {
            if (this.model) {
                // Use Gemini API
                const result = await this.model.generateContent(fullPrompt);
                const response = await result.response;
                return response.text();
            } else {
                // Fallback: Rule-based responses
                return this.getFallbackResponse(userMessage, context);
            }
        } catch (error) {
            console.error('Gemini API error:', error);
            return this.getFallbackResponse(userMessage, context);
        }
    }

    /**
     * Build context-aware system prompt
     */
    private buildSystemPrompt(context: FarmContext): string {
        return `You are Krishi Sahayak (कृषि सहायक), an intelligent agricultural assistant for GreenGuard AI.
You specialize in irrigation management, crop health, and sustainable farming practices.

CURRENT FARM CONTEXT:
- Crop: ${context.cropType}
- Growth Stage: ${context.growthStage}
- Soil Moisture: ${context.currentSoilMoisture.toFixed(1)}%
- Next Irrigation: ${context.nextIrrigation ? new Date(context.nextIrrigation).toLocaleString() : 'Not scheduled'}
- Weather: ${context.weatherConditions}
- Recent Alerts: ${context.recentAlerts.length > 0 ? context.recentAlerts.map(a => a.title).join(', ') : 'None'}

INSTRUCTIONS:
1. Provide practical, actionable advice for farmers
2. Reference the current farm context in your responses
3. Be concise and use simple language
4. If discussing crop diseases, provide symptoms, causes, and remedies
5. Promote water conservation and sustainable practices
6. Support both English and Hindi (when user writes in Hindi, respond in Hindi)
7. Use specific numbers from the context when relevant

Answer the following question:`;
    }

    /**
     * Fallback rule-based responses when API is unavailable
     */
    private getFallbackResponse(userMessage: string, context: FarmContext): string {
        const msg = userMessage.toLowerCase();

        // Irrigation questions
        if (msg.includes('irrigat') || msg.includes('water')) {
            if (context.currentSoilMoisture < 30) {
                return `Based on your current soil moisture of ${context.currentSoilMoisture.toFixed(1)}%, your ${context.cropType} needs irrigation soon. Your ${context.growthStage} stage requires adequate water. ${context.nextIrrigation ? `Next irrigation is scheduled for ${new Date(context.nextIrrigation).toLocaleDateString()}.` : 'I recommend scheduling irrigation within 24 hours.'}`;
            } else {
                return `Your soil moisture is at a healthy ${context.currentSoilMoisture.toFixed(1)}%. No immediate irrigation needed for your ${context.cropType} in ${context.growthStage} stage.`;
            }
        }

        // Crop health
        if (msg.includes('health') || msg.includes('growing')) {
            return `Your ${context.cropType} is currently in the ${context.growthStage} stage. Based on soil moisture levels at ${context.currentSoilMoisture.toFixed(1)}%, the crop appears ${context.currentSoilMoisture > 40 ? 'healthy' : 'stressed'}. Ensure proper nutrition and monitor for pests during this critical phase.`;
        }

        // Yellow leaves / diseases
        if (msg.includes('yellow') || msg.includes('disease')) {
            return `Yellowing leaves can indicate:\n\n1. **Nitrogen Deficiency**: Apply nitrogen-rich fertilizer\n2. **Overwatering**: Your current moisture is ${context.currentSoilMoisture.toFixed(1)}% - reduce irrigation if too high\n3. **Pest Infestation**: Check for aphids or mites\n4. **Root Diseases**: Improve drainage if soil is waterlogged\n\nRecommendation: Inspect leaves closely and adjust watering based on soil moisture readings.`;
        }

        // Weather related
        if (msg.includes('weather') || msg.includes('rain')) {
            return `Current weather conditions: ${context.weatherConditions}. I'm monitoring forecast data to optimize your irrigation schedule. GreenGuard AI will automatically adjust watering plans if rain is predicted.`;
        }

        // General farming advice
        if (msg.includes('advice') || msg.includes('tips')) {
            return `For ${context.cropType} in ${context.growthStage} stage:\n\n✅ Maintain soil moisture between 40-70%\n✅ Monitor for pests and diseases regularly\n✅ Apply appropriate fertilizers based on growth stage\n✅ Use drip irrigation for water efficiency\n✅ Check weather forecasts before irrigation\n\nYour current moisture (${context.currentSoilMoisture.toFixed(1)}%) is ${context.currentSoilMoisture >= 40 && context.currentSoilMoisture <= 70 ? 'optimal' : 'outside optimal range'}.`;
        }

        // Hindi greeting
        if (msg.includes('namaste') || msg.includes('namaskar')) {
            return `🙏 नमस्ते! मैं कृषि सहायक हूं। मैं आपकी ${context.cropType} फसल की देखभाल में मदद करूंगा। कृपया अपना सवाल पूछें।`;
        }

        // Default response
        return `I'm Krishi Sahayak, your AI farming assistant! 🌾\n\nI can help with:\n- Irrigation scheduling and water management\n- Crop health and disease diagnosis\n- Growth stage requirements\n- Weather-based recommendations\n- Sustainable farming practices\n\nYour ${context.cropType} (${context.growthStage} stage) has ${context.currentSoilMoisture.toFixed(1)}% soil moisture. How can I assist you today?`;
    }

    /**
     * Diagnose crop disease based on symptoms
     */
    async diagnoseCropDisease(symptoms: string, cropType: string): Promise<string> {
        const prompt = `As an agricultural expert, diagnose potential crop disease for ${cropType} with these symptoms: ${symptoms}.
    
Provide:
1. Most likely disease/problem
2. Symptoms to confirm diagnosis
3. Treatment/remedy
4. Prevention measures

Keep response practical and concise.`;

        try {
            if (this.model) {
                const result = await this.model.generateContent(prompt);
                const response = await result.response;
                return response.text();
            }
        } catch (error) {
            console.error('Disease diagnosis error:', error);
        }

        // Fallback
        return `Based on the symptoms for ${cropType}, I recommend:\n\n1. Inspect leaves for fungal spots or pest damage\n2. Check soil drainage and moisture levels\n3. Consult local agricultural extension office\n4. Consider applying organic neem oil as preventive measure`;
    }

    /**
     * Get best practices for crop
     */
    getBestPractices(cropType: string, growthStage: string): string {
        const practices: Record<string, Record<string, string[]>> = {
            wheat: {
                Initial: [
                    'Ensure uniform seed spacing',
                    'Apply pre-emergent herbicides',
                    'Light irrigation to support germination'
                ],
                Development: [
                    'Apply nitrogen fertilizer',
                    'Monitor for aphids and army worms',
                    'Irrigate when soil moisture drops to 50%'
                ],
                'Mid-Season': [
                    'Apply second nitrogen dose',
                    'Monitor for rust diseases',
                    'Maintain consistent soil moisture'
                ],
                'Late Season': [
                    'Reduce irrigation frequency',
                    'Watch for grain filling',
                    'Prepare for harvest'
                ]
            }
        };

        const cropPractices = practices[cropType.toLowerCase()];
        if (!cropPractices) return 'General crop care: Monitor regularly and maintain optimal conditions.';

        const stagePractices = cropPractices[growthStage] || Object.values(cropPractices)[0];
        return stagePractices.join('\n• ');
    }
}

export default KrishiSahayakChatbot;
