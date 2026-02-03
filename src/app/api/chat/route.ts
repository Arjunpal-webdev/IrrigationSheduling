import { NextRequest, NextResponse } from 'next/server';
import KrishiSahayakChatbot, { GeminiMessage } from '@/lib/ai/chatbot';
import { FarmContext } from '@/types';

// In-memory conversation storage (per session)
// Key: sessionId, Value: conversation history
const conversationStore = new Map<string, GeminiMessage[]>();

// Clean up old sessions after 1 hour
const SESSION_EXPIRY = 60 * 60 * 1000; // 1 hour
const sessionTimestamps = new Map<string, number>();

export async function POST(request: NextRequest) {
    console.log('\n🌐 [API] /api/chat request received');
    try {
        const { message, context, sessionId, reset } = await request.json();
        console.log('📦 [API] Request body:');
        console.log('   - message:', message ? message.substring(0, 50) + '...' : 'none');
        console.log('   - sessionId:', sessionId);
        console.log('   - reset:', reset);
        console.log('   - context:', context ? 'present' : 'none');

        if (!sessionId) {
            console.error('❌ [API] Missing sessionId');
            return NextResponse.json(
                { error: 'Session ID is required' },
                { status: 400 }
            );
        }

        // Handle reset (clear conversation history)
        if (reset) {
            console.log('🔄 [API] Resetting conversation for session:', sessionId);
            conversationStore.delete(sessionId);
            sessionTimestamps.delete(sessionId);
            return NextResponse.json({
                message: 'Conversation reset successfully',
                sessionId
            });
        }

        if (!message) {
            console.error('❌ [API] Missing message');
            return NextResponse.json(
                { error: 'Message is required' },
                { status: 400 }
            );
        }

        // Clean up expired sessions
        const now = Date.now();
        for (const [sid, timestamp] of sessionTimestamps.entries()) {
            if (now - timestamp > SESSION_EXPIRY) {
                conversationStore.delete(sid);
                sessionTimestamps.delete(sid);
            }
        }

        // Get or initialize conversation history
        let chatHistory = conversationStore.get(sessionId) || [];
        console.log('💾 [API] Retrieved history for session:', sessionId);
        console.log('   History length:', chatHistory.length);

        // Default context if not provided
        const farmContext: FarmContext = context || {
            cropType: 'wheat',
            growthStage: 'Development',
            currentSoilMoisture: 45,
            weatherConditions: 'Clear sky',
            recentAlerts: []
        };

        console.log('🤖 [API] Creating chatbot instance...');
        const chatbot = new KrishiSahayakChatbot();

        console.log('🚀 ===== USING GEMINI API =====');
        console.log('📤 [API] Calling generateResponse...');
        console.log('   Incoming message:', message.substring(0, 100));

        const { response, updatedHistory } = await chatbot.generateResponse(
            message,
            farmContext,
            chatHistory
        );

        console.log('✅ [API] Response received from chatbot');
        console.log('   Response length:', response.length);
        console.log('   Response preview:', response.substring(0, 150) + '...');
        console.log('   Updated history length:', updatedHistory.length);
        console.log('🎯 ===== RESPONSE SOURCE: GEMINI AI (NOT RULE-BASED) =====');

        // Store updated history
        conversationStore.set(sessionId, updatedHistory);
        sessionTimestamps.set(sessionId, now);
        console.log('💾 [API] Stored updated history');

        console.log('📨 [API] Sending response to frontend\n');
        return NextResponse.json({
            response,
            sessionId,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ [API] Chat API error:', error);
        if (error instanceof Error) {
            console.error('   Error message:', error.message);
            console.error('   Error stack:', error.stack);

            // More specific error messages
            if (error.message.includes('not authorized') || error.message.includes('403')) {
                console.error('   ⚠️  GEMINI API KEY AUTHORIZATION ERROR!');
                console.error('   Please check: https://makersuite.google.com/app/apikey');
                return NextResponse.json(
                    { error: '🔑 API key error. Please verify your Gemini API key is valid and has access to the gemini-pro model. Check https://makersuite.google.com/app/apikey' },
                    { status: 403 }
                );
            }

            if (error.message.includes('API Key')) {
                console.error('   ⚠️  GEMINI_API_KEY not configured properly!');
                return NextResponse.json(
                    { error: 'AI service configuration error. Please contact support.' },
                    { status: 500 }
                );
            }

            if (error.message.includes('fetch') || error.message.includes('network')) {
                console.error('   ⚠️  Network error connecting to Gemini API');
                return NextResponse.json(
                    { error: 'Network error. Please check your connection and try again.' },
                    { status: 503 }
                );
            }
        }

        return NextResponse.json(
            { error: 'Krishi Sevak is temporarily unavailable. Our AI assistant will be back shortly. Please try again in a moment.' },
            { status: 500 }
        );
    }
}
