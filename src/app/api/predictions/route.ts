import { NextRequest, NextResponse } from 'next/server';
import { WaterBalanceCalculator } from '@/lib/cropwat/waterBalance';
import { AnomalyDetector } from '@/lib/ai/anomalyDetection';
import { SoilMoisture } from '@/types';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const days = parseInt(searchParams.get('days') || '7');

        // Current conditions
        const currentMoisture = 42;
        const fieldCapacity = 70;
        const wiltingPoint = 20;
        const rootDepth = 150;
        const dailyETc = 5.2;

        // Mock forecasted rain for next 7 days
        const forecastedRain = [0, 0, 3, 0, 0, 8, 0];
        const plannedIrrigation = [0, 0, 30, 0, 0, 0, 0]; // Irrigation on day 3

        // Simulate future water balance
        const futureBalance = WaterBalanceCalculator.simulateFuture(
            {
                currentSoilMoisture: currentMoisture,
                fieldCapacity,
                wiltingPoint,
                rootDepth,
                etc: dailyETc,
                precipitation: 0,
                irrigation: 0
            },
            days,
            forecastedRain,
            plannedIrrigation
        );

        // Generate mock historical moisture data
        const historicalMoisture: SoilMoisture[] = [];
        for (let i = 30; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            historicalMoisture.push({
                timestamp: date,
                value: 40 + Math.sin(i / 5) * 15 + (Math.random() - 0.5) * 5,
                depth: 30
            });
        }

        // Detect anomalies
        const anomalies = AnomalyDetector.detectBatchAnomalies(
            historicalMoisture,
            { min: 20, max: 70 }
        );

        // Optimal irrigation times (AI recommendation)
        const optimalTimes = futureBalance
            .map((day, index) => {
                if (day.soilMoisture < 40 && day.currentStress > 20) {
                    const time = new Date();
                    time.setDate(time.getDate() + index);
                    time.setHours(6, 0, 0, 0); // Early morning
                    return {
                        date: time,
                        confidence: 0.85 - (day.currentStress / 200),
                        reason: `Soil moisture predicted at ${day.soilMoisture.toFixed(1)}%`
                    };
                }
                return null;
            })
            .filter(Boolean);

        return NextResponse.json({
            soilMoisturePrediction: futureBalance.map(b => ({
                date: b.date,
                predicted: b.soilMoisture,
                stress: b.currentStress
            })),
            optimalIrrigationTimes: optimalTimes,
            anomalies: anomalies.map(a => ({
                timestamp: a.timestamp,
                value: a.value,
                severity: a.anomalySeverity
            })),
            historical: historicalMoisture.slice(-14).map(h => ({
                date: h.timestamp,
                value: h.value
            }))
        });
    } catch (error) {
        console.error('Predictions API error:', error);
        return NextResponse.json(
            { error: 'Failed to generate predictions' },
            { status: 500 }
        );
    }
}
