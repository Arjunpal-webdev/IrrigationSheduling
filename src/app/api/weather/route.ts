export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { WeatherService } from '@/lib/weather/weatherService';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const lat = parseFloat(searchParams.get('lat') || process.env.DEFAULT_LATITUDE || '20.5937');
        const lon = parseFloat(searchParams.get('lon') || process.env.DEFAULT_LONGITUDE || '78.9629');

        const [currentWeather, forecast] = await Promise.all([
            WeatherService.getCurrentWeather(lat, lon),
            WeatherService.getWeatherForecast(lat, lon)
        ]);

        const refinedForecast = WeatherService.refineForecast(forecast);

        return NextResponse.json({
            current: currentWeather,
            forecast: refinedForecast,
            location: { lat, lon }
        });
    } catch (error) {
        console.error('Weather API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch weather data' },
            { status: 500 }
        );
    }
}
