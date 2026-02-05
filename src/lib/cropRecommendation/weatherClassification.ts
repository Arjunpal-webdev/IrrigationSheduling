/**
 * Weather classification utility for Crop Recommendation System
 * Fetches weather data and classifies temperature and rainfall zones
 */

import { TempZone, RainZone } from './cropSuitability';

export interface WeatherData {
    temperature: number; // °C
    rainfall: number; // mm (monthly average)
    humidity: number; // %
}

export interface ClimateClassification {
    tempZone: TempZone;
    rainZone: RainZone;
    temperature: number;
    rainfall: number;
}

/**
 * Classify temperature into zone
 */
export function classifyTemperature(temp: number): TempZone {
    if (temp < 15) return 'cold';
    if (temp >= 15 && temp < 25) return 'mild';
    if (temp >= 25 && temp < 35) return 'warm';
    return 'hot'; // >= 35
}

/**
 * Classify rainfall into zone
 */
export function classifyRainfall(rain: number): RainZone {
    if (rain < 25) return 'dry';
    if (rain >= 25 && rain < 75) return 'moderate';
    return 'wet'; // >= 75
}

/**
 * Fetch weather data and classify climate
 * Reuses the existing weather API from the water calculator
 */
export async function fetchAndClassifyClimate(
    lat: number,
    lon: number
): Promise<ClimateClassification | null> {
    try {
        const response = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);

        if (!response.ok) {
            console.error('Weather API failed:', response.status);
            return null;
        }

        const data = await response.json();

        // Extract relevant data
        const temperature = data.current?.temperature ?? data.temperature ?? 25;
        const rainfall = data.daily?.rain_sum?.[0] ?? data.rainfall ?? 50;

        return {
            tempZone: classifyTemperature(temperature),
            rainZone: classifyRainfall(rainfall),
            temperature,
            rainfall
        };
    } catch (error) {
        console.error('Failed to fetch weather data:', error);
        return null;
    }
}
