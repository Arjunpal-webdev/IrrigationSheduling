export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { WeatherService } from '@/lib/weather/weatherService';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const location = searchParams.get('location');

        // If location is provided, use the new Open-Meteo API
        if (location) {
            const weatherData = await WeatherService.getWeatherByLocation(location);
            return NextResponse.json(weatherData);
        }

        // Legacy support: if lat/lon are provided, use them directly
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

        // Check if it's a geocoding error
        if (error instanceof Error && error.message.includes('not found')) {
            return NextResponse.json(
                { error: error.message },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to fetch weather data' },
            { status: 500 }
        );
    }
}
