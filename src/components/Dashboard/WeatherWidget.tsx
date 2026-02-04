'use client';

import { useEffect, useState } from 'react';
import { WeatherForecast } from '@/types';
import { useLocation } from '@/contexts/LocationContext';

export default function WeatherWidget() {
    const { state, district, weatherCache, setWeatherCache } = useLocation();

    const [forecast, setForecast] = useState<WeatherForecast[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [currentTemp, setCurrentTemp] = useState(28);
    const [description, setDescription] = useState('Clear sky');
    const [humidity, setHumidity] = useState(60);

    useEffect(() => {
        const locationKey = `${state}-${district}`;

        // Check if we have cached data for this location
        if (weatherCache?.locationKey === locationKey && weatherCache.data) {
            // Use cached data
            const data = weatherCache.data;
            if (data.forecast && data.forecast.length > 0) {
                const today = data.forecast[0];
                setCurrentTemp(today.tempMax);
                setDescription(today.description);
                setHumidity(today.humidity);
                setForecast(data.forecast.slice(0, 7));
            }
            setLoading(false);
            return;
        }

        // No cache or location changed - fetch new data
        if (district) {
            fetchWeather();
        }
    }, [state, district, weatherCache]);

    const fetchWeather = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`/api/weather?district=${encodeURIComponent(district)}`);
            if (!response.ok) {
                throw new Error('Failed to fetch weather data');
            }

            const data = await response.json();

            // Extract current weather from today's forecast (first day)
            if (data.forecast && data.forecast.length > 0) {
                const today = data.forecast[0];

                // Use today's max temperature for current display
                setCurrentTemp(today.tempMax);

                // Set description based on today's conditions
                setDescription(today.description);

                // Use today's actual humidity
                setHumidity(today.humidity);

                // Set full forecast
                setForecast(data.forecast.slice(0, 7));
            }

            // Cache the weather data with location key
            const locationKey = `${state}-${district}`;
            setWeatherCache({
                locationKey,
                data
            });
        } catch (error) {
            console.error('Weather fetch error:', error);
            setError('Weather data unavailable');
        } finally {
            setLoading(false);
        }
    };

    const getWeatherIcon = (desc: string) => {
        const description = desc.toLowerCase();
        if (description.includes('clear')) return '☀️';
        if (description.includes('cloud')) return '☁️';
        if (description.includes('rain')) return '🌧️';
        if (description.includes('storm')) return '⛈️';
        return '🌤️';
    };

    return (
        <div className="card-glass">
            <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, marginBottom: '0.25rem', fontSize: '1.1rem' }}>Weather Conditions</h3>
                <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.7 }}>
                    📍 {district && state ? `${district}, ${state}` : 'Select location in header'} • AI-enhanced forecast
                </p>
            </div>

            {error ? (
                <div style={{
                    padding: '2rem',
                    textAlign: 'center',
                    background: 'rgba(239, 68, 68, 0.1)',
                    borderRadius: '12px',
                    color: '#DC2626'
                }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚠️</div>
                    <div>{error}</div>
                </div>
            ) : (
                <>
                    {/* Current Weather */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '1.5rem',
                        background: 'var(--gradient-subtle)',
                        borderRadius: '12px',
                        marginBottom: '1rem'
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
                                {loading ? '...' : `${Math.round(currentTemp)}°C`}
                            </div>
                            <div style={{ marginTop: '0.5rem', fontSize: '1rem', color: 'var(--color-text-secondary)' }}>
                                {loading ? 'Loading...' : description}
                            </div>
                            <div style={{ marginTop: '0.25rem', fontSize: '0.875rem', opacity: 0.7 }}>
                                💧 Humidity: {loading ? '...' : `${humidity}%`}
                            </div>
                        </div>
                        <div style={{ fontSize: '5rem' }}>
                            {loading ? '⏳' : getWeatherIcon(description)}
                        </div>
                    </div>

                    {/* AI Weather Insights */}
                    <div style={{
                        marginBottom: '1.5rem',
                        padding: '0.75rem',
                        background: 'rgba(251, 191, 36, 0.1)',
                        borderLeft: '4px solid #FBBF24',
                        borderRadius: '4px',
                        fontSize: '0.85rem'
                    }}>
                        <strong>💡 Insight:</strong> {loading ? 'Loading insights...' : (
                            forecast.length > 0 && forecast.some(d => d.precipitation > 5)
                                ? 'Rain expected this week. Adjust irrigation schedule accordingly.'
                                : 'No significant rainfall forecasted. Maintain regular irrigation.'
                        )}
                    </div>

                    {/* 7-Day Forecast */}
                    <div>
                        <h4 style={{ fontSize: '0.9rem', marginBottom: '1rem', opacity: 0.8 }}>
                            7-Day Forecast
                        </h4>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(7, 1fr)',
                            gap: '0.5rem'
                        }}>
                            {loading ? (
                                Array(7).fill(0).map((_, i) => (
                                    <div key={i} className="skeleton" style={{ height: '100px' }} />
                                ))
                            ) : forecast.length > 0 ? (
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
                            ) : (
                                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', opacity: 0.5 }}>
                                    No forecast data available
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
