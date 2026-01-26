import { NextRequest, NextResponse } from 'next/server';
import { KcPredictor } from '@/lib/cropwat/kcPredictor';
import { WaterBalanceCalculator } from '@/lib/cropwat/waterBalance';
import { ETCalculator } from '@/lib/cropwat/etCalculator';

export async function GET(request: NextRequest) {
    try {
        // Mock current farm data (in production, fetch from database)
        const cropType = 'wheat';
        const daysSincePlanting = 45; // Development stage

        // Simulate current weather/soil conditions
        const et0 = 5.2;
        const soilMoisture = 42;

        // Get AI-enhanced Kc prediction
        const kcPrediction = KcPredictor.predictKc({
            cropType,
            daysSincePlanting,
            et0,
            recentTemperature: 28,
            recentHumidity: 60,
            soilMoisture,
            historicalYield: 4500
        });

        // Calculate irrigation requirement
        const cropData = KcPredictor.getCropData(cropType);
        const irrigationAmount = WaterBalanceCalculator.calculateIrrigationRequirement(
            soilMoisture,
            cropData?.criticalDepletionFraction ? (cropData.criticalDepletionFraction * 100) : 60,
            cropData?.rootDepth || 150
        );

        // Calculate next irrigation time (simplified)
        const nextIrrigation = new Date();
        if (soilMoisture < 40) {
            nextIrrigation.setHours(nextIrrigation.getHours() + 6); // Within 6 hours
        } else {
            nextIrrigation.setDate(nextIrrigation.getDate() + 2); // In 2 days
        }

        // Mock schedule
        const schedule = [
            {
                id: '1',
                scheduledTime: nextIrrigation,
                amount: irrigationAmount,
                status: 'scheduled' as const,
                method: 'Drip Irrigation',
                aiRecommended: true,
                confidenceScore: kcPrediction.confidence
            }
        ];

        return NextResponse.json({
            schedule,
            recommendation: {
                ...kcPrediction,
                irrigationAmount,
                nextIrrigation
            },
            cropData
        });
    } catch (error) {
        console.error('Irrigation API error:', error);
        return NextResponse.json(
            { error: 'Failed to calculate irrigation schedule' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const { cropType, daysSincePlanting, soilMoisture } = await request.json();

        // Update irrigation parameters
        // In production, save to database

        return NextResponse.json({
            success: true,
            message: 'Irrigation parameters updated'
        });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to update irrigation parameters' },
            { status: 500 }
        );
    }
}
