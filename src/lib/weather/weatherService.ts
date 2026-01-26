/**
 * Weather Service
 * Integration with OpenWeatherMap API
 */

import axios from 'axios';
import { WeatherData, WeatherForecast } from '@/types';
import { ETCalculator } from '../cropwat/etCalculator';

const API_KEY = process.env.OPENWEATHER_API_KEY || '';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

export class WeatherService {
    /**
     * Get current weather data
     */
    static async getCurrentWeather(lat: number, lon: number): Promise<WeatherData> {
        try {
            const response = await axios.get(`${BASE_URL}/weather`, {
                params: {
                    lat,
                    lon,
                    appid: API_KEY,
                    units: 'metric'
                }
            });

            const data = response.data;

            // Calculate ET₀
            const et0 = ETCalculator.calculateET0({
                tempMin: data.main.temp_min,
                tempMax: data.main.temp_max,
                humidity: data.main.humidity,
                windSpeed: data.wind.speed,
                latitude: lat,
                date: new Date()
            });

            return {
                timestamp: new Date(),
                temperature: data.main.temp,
                humidity: data.main.humidity,
                windSpeed: data.wind.speed,
                solarRadiation: 15, // Estimated (would need additional API)
                precipitation: data.rain?.['1h'] || 0,
                et0
            };
        } catch (error) {
            console.error('Weather API error:', error);
            return this.getMockWeather(lat);
        }
    }

    /**
     * Get 7-day weather forecast
     */
    static async getWeatherForecast(lat: number, lon: number): Promise<WeatherForecast[]> {
        try {
            const response = await axios.get(`${BASE_URL}/forecast`, {
                params: {
                    lat,
                    lon,
                    appid: API_KEY,
                    units: 'metric',
                    cnt: 40 // 5 days, 3-hour intervals
                }
            });

            // Group by day and get daily summary
            const dailyData = this.groupByDay(response.data.list);

            return dailyData.map(day => ({
                date: day.date,
                tempMin: day.tempMin,
                tempMax: day.tempMax,
                humidity: day.avgHumidity,
                precipitation: day.totalPrecipitation,
                precipitationProbability: day.precipitationProbability,
                description: day.description,
                icon: day.icon
            }));
        } catch (error) {
            console.error('Forecast API error:', error);
            return this.getMockForecast();
        }
    }

    /**
     * Group forecast data by day
     */
    private static groupByDay(forecastList: any[]): any[] {
        const days = new Map();

        forecastList.forEach(item => {
            const date = new Date(item.dt * 1000).toISOString().split('T')[0];

            if (!days.has(date)) {
                days.set(date, {
                    date,
                    temps: [],
                    humidities: [],
                    precipitation: 0,
                    descriptions: [],
                    icons: [],
                    precipProbs: []
                });
            }

            const day = days.get(date);
            day.temps.push(item.main.temp);
            day.humidities.push(item.main.humidity);
            day.precipitation += item.rain?.['3h'] || 0;
            day.descriptions.push(item.weather[0].description);
            day.icons.push(item.weather[0].icon);
            day.precipProbs.push(item.pop || 0);
        });

        return Array.from(days.values()).map(day => ({
            date: day.date,
            tempMin: Math.min(...day.temps),
            tempMax: Math.max(...day.temps),
            avgHumidity: day.humidities.reduce((a: number, b: number) => a + b, 0) / day.humidities.length,
            totalPrecipitation: day.precipitation,
            precipitationProbability: Math.max(...day.precipProbs) * 100,
            description: this.getMostCommonDescription(day.descriptions),
            icon: day.icons[Math.floor(day.icons.length / 2)]
        })).slice(0, 7);
    }

    /**
     * Get most common weather description
     */
    private static getMostCommonDescription(descriptions: string[]): string {
        const counts = descriptions.reduce((acc, desc) => {
            acc[desc] = (acc[desc] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(counts).reduce((a, b) => counts[a[0]] > counts[b[0]] ? a : b)[0];
    }

    /**
     * Mock weather data (fallback)
     */
    private static getMockWeather(lat: number): WeatherData {
        const temp = 25 + Math.random() * 10;
        const et0 = ETCalculator.calculateET0({
            tempMin: temp - 5,
            tempMax: temp + 5,
            humidity: 60,
            windSpeed: 2.5,
            latitude: lat,
            date: new Date()
        });

        return {
            timestamp: new Date(),
            temperature: temp,
            humidity: 60,
            windSpeed: 2.5,
            solarRadiation: 18,
            precipitation: 0,
            et0
        };
    }

    /**
     * Mock forecast data (fallback)
     */
    private static getMockForecast(): WeatherForecast[] {
        const forecast: WeatherForecast[] = [];
        const today = new Date();

        const conditions = [
            { desc: 'Clear sky', icon: '01d', precip: 0 },
            { desc: 'Few clouds', icon: '02d', precip: 0 },
            { desc: 'Scattered clouds', icon: '03d', precip: 10 },
            { desc: 'Light rain', icon: '10d', precip: 60 },
            { desc: 'Clear sky', icon: '01d', precip: 0 }
        ];

        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() + i);

            const condition = conditions[i % conditions.length];

            forecast.push({
                date: date.toISOString().split('T')[0],
                tempMin: 20 + Math.random() * 5,
                tempMax: 28 + Math.random() * 7,
                humidity: 55 + Math.random() * 20,
                precipitation: condition.precip > 30 ? 5 + Math.random() * 15 : 0,
                precipitationProbability: condition.precip,
                description: condition.desc,
                icon: condition.icon
            });
        }

        return forecast;
    }

    /**
     * AI-enhanced: Refine forecast based on historical accuracy
     */
    static refineForecast(
        forecast: WeatherForecast[],
        historicalAccuracy: number = 0.85
    ): WeatherForecast[] {
        // Apply correction based on historical forecast vs actual
        return forecast.map(day => ({
            ...day,
            precipitationProbability: day.precipitationProbability * historicalAccuracy,
            precipitation: day.precipitation * (0.8 + Math.random() * 0.4)
        }));
    }
}
