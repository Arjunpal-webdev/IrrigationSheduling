import { NextRequest, NextResponse } from 'next/server';
import KrishiSahayakChatbot from '@/lib/ai/chatbot';
import { FarmContext } from '@/types';

export async function POST(request: NextRequest) {
    try {
        const { message, context } = await request.json();

        if (!message) {
            return NextResponse.json(
                { error: 'Message is required' },
                { status: 400 }
            );
        }

        // Default context if not provided
        const farmContext: FarmContext = context || {
            cropType: 'wheat',
            growthStage: 'Development',
            currentSoilMoisture: 45,
            weatherConditions: 'Clear sky',
            recentAlerts: []
        };

        const chatbot = new KrishiSahayakChatbot();
        const response = await chatbot.generateResponse(message, farmContext);

        return NextResponse.json({
            response,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Chat API error:', error);
        return NextResponse.json(
            { error: 'Failed to process chat request' },
            { status: 500 }
        );
    }
}
