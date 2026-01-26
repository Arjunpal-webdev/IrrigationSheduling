'use client';

import { useEffect, useState } from 'react';
import { WeatherForecast } from '@/types';

interface WeatherWidgetProps {
    currentTemp?: number;
    description?: string;
    humidity?: number;
}

export default function WeatherWidget({
    currentTemp = 28,
    description = 'Clear sky',
    humidity = 60
}: WeatherWidgetProps) {
    const [forecast, setForecast] = useState<WeatherForecast[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWeather();
    }, []);

    const fetchWeather = async () => {
        try {
            const response = await fetch('/api/weather');
            const data = await response.json();
            setForecast(data.forecast.slice(0, 5));
        } catch (error) {
            console.error('Weather fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const getWeatherIcon = (description: string) => {
        const desc = description.toLowerCase();
        if (desc.includes('clear')) return '☀️';
        if (desc.includes('cloud')) return '☁️';
        if (desc.includes('rain')) return '🌧️';
        if (desc.includes('storm')) return '⛈️';
        return '🌤️';
    };

    return (
        <div className="card-glass">
            <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, marginBottom: '0.25rem', fontSize: '1.1rem' }}>Weather Conditions</h3>
                <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.7 }}>AI-enhanced forecast</p>
            </div>

            {/* Current Weather */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1.5rem',
                background: 'var(--gradient-subtle)',
                borderRadius: '12px',
                marginBottom: '1.5rem'
            }}>
                <div>
                    <div style={{
                        fontSize: '3.5rem',
                        fontWeight: 800,
                        background: 'var(--gradient-primary)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        lineHeight: 1
                    }}>
                        {currentTemp}°C
                    </div>
                    <div style={{ marginTop: '0.5rem', fontSize: '1rem', color: 'var(--color-text-secondary)' }}>
                        {description}
                    </div>
                    <div style={{ marginTop: '0.25rem', fontSize: '0.875rem', opacity: 0.7 }}>
                        💧 Humidity: {humidity}%
                    </div>
                </div>
                <div style={{ fontSize: '5rem' }}>
                    {getWeatherIcon(description)}
                </div>
            </div>

            {/* 5-Day Forecast */}
            <div>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '1rem', opacity: 0.8 }}>
                    5-Day Forecast
                </h4>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5, 1fr)',
                    gap: '0.5rem'
                }}>
                    {loading ? (
                        Array(5).fill(0).map((_, i) => (
                            <div key={i} className="skeleton" style={{ height: '100px' }} />
                        ))
                    ) : (
                        forecast.map((day, index) => (
                            <div
                                key={index}
                                style={{
                                    padding: '0.75rem',
                                    background: index === 0 ? 'rgba(16, 185, 129, 0.1)' : 'var(--color-surface-elevated)',
                                    borderRadius: '8px',
                                    textAlign: 'center',
                                    border: index === 0 ? '2px solid var(--color-primary)' : 'none',
                                    transition: 'transform 0.2s ease',
                                    cursor: 'pointer'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <div style={{ fontSize: '0.7rem', opacity: 0.7, marginBottom: '0.25rem' }}>
                                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                                </div>
                                <div style={{ fontSize: '1.5rem', margin: '0.25rem 0' }}>
                                    {getWeatherIcon(day.description)}
                                </div>
                                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                                    {Math.round(day.tempMax)}°
                                </div>
                                <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>
                                    {Math.round(day.tempMin)}°
                                </div>
                                {day.precipitation > 0 && (
                                    <div style={{ fontSize: '0.65rem', color: '#3B82F6', marginTop: '0.25rem' }}>
                                        💧 {Math.round(day.precipitation)}mm
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Weather Insights */}
            <div style={{
                marginTop: '1rem',
                padding: '0.75rem',
                background: 'rgba(251, 191, 36, 0.1)',
                borderLeft: '4px solid #FBBF24',
                borderRadius: '4px',
                fontSize: '0.85rem'
            }}>
                <strong>💡 Insight:</strong> {forecast.length > 0 && forecast.some(d => d.precipitation > 5)
                    ? 'Rain expected this week. Adjust irrigation schedule accordingly.'
                    : 'No significant rainfall forecasted. Maintain regular irrigation.'}
            </div>
        </div>
    );
}
