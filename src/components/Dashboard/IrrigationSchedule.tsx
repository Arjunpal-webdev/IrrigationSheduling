'use client';

import { useEffect, useState } from 'react';
import { IrrigationEvent } from '@/types';

export default function IrrigationSchedule() {
    const [schedule, setSchedule] = useState<IrrigationEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSchedule();
    }, []);

    const fetchSchedule = async () => {
        try {
            const response = await fetch('/api/irrigation');
            const data = await response.json();
            setSchedule(data.schedule);
        } catch (error) {
            console.error('Schedule fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const getTimeUntil = (date: Date) => {
        const now = new Date();
        const target = new Date(date);
        const diff = target.getTime() - now.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);

        if (days > 0) return `in ${days} day${days > 1 ? 's' : ''}`;
        if (hours > 0) return `in ${hours} hour${hours > 1 ? 's' : ''}`;
        return 'Soon';
    };

    return (
        <div className="card-glass">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
                <div>
                    <h3 style={{ margin: 0, marginBottom: '0.25rem', fontSize: '1.1rem' }}>Irrigation Schedule</h3>
                    <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.7 }}>AI-optimized watering</p>
                </div>
                <button className="btn-primary" style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem'
                }}>
                    + Add Manual
                </button>
            </div>

            {loading ? (
                <div className="skeleton" style={{ height: '200px' }} />
            ) : schedule.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', opacity: 0.6 }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
                    <p>No irrigation scheduled</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {schedule.map((event, index) => (
                        <div
                            key={event.id}
                            style={{
                                padding: '1.25rem',
                                background: index === 0 ? 'var(--gradient-subtle)' : 'var(--color-surface-elevated)',
                                borderRadius: '12px',
                                border: index === 0 ? '2px solid var(--color-primary)' : 'none',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            {/* AI Badge */}
                            {event.aiRecommended && (
                                <div style={{
                                    position: 'absolute',
                                    top: '10px',
                                    right: '10px',
                                    background: 'var(--gradient-primary)',
                                    color: 'white',
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '20px',
                                    fontSize: '0.7rem',
                                    fontWeight: 600
                                }}>
                                    🤖 AI Recommended
                                </div>
                            )}

                            <div style={{ display: 'flex', alignItems: 'start', gap: '1rem' }}>
                                {/* Icon */}
                                <div style={{
                                    fontSize: '2.5rem',
                                    background: 'rgba(16, 185, 129, 0.15)',
                                    width: '60px',
                                    height: '60px',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    💧
                                </div>

                                {/* Details */}
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                        <h4 style={{ margin: 0, fontSize: '1.1rem' }}>
                                            {event.method}
                                        </h4>
                                        <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                                            {event.status}
                                        </span>
                                    </div>

                                    <div style={{ fontSize: '0.875rem', opacity: 0.8, marginBottom: '0.75rem' }}>
                                        <div>📅 {new Date(event.scheduledTime).toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            month: 'short',
                                            day: 'numeric'
                                        })}</div>
                                        <div>⏰ {new Date(event.scheduledTime).toLocaleTimeString('en-US', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}</div>
                                    </div>

                                    <div style={{
                                        display: 'flex',
                                        gap: '1.5rem',
                                        fontSize: '0.875rem'
                                    }}>
                                        <div>
                                            <span style={{ opacity: 0.7 }}>Amount:</span>{' '}
                                            <strong style={{ color: 'var(--color-primary)' }}>{event.amount}mm</strong>
                                        </div>
                                        <div>
                                            <span style={{ opacity: 0.7 }}>Time Until:</span>{' '}
                                            <strong>{getTimeUntil(event.scheduledTime)}</strong>
                                        </div>
                                        {event.confidenceScore && (
                                            <div>
                                                <span style={{ opacity: 0.7 }}>Confidence:</span>{' '}
                                                <strong style={{ color: event.confidenceScore > 0.8 ? '#10B981' : '#FBBF24' }}>
                                                    {(event.confidenceScore * 100).toFixed(0)}%
                                                </strong>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Progress Bar (for upcoming) */}
                            {index === 0 && (
                                <div style={{ marginTop: '1rem' }}>
                                    <div style={{
                                        height: '6px',
                                        background: '#E5E7EB',
                                        borderRadius: '3px',
                                        overflow: 'hidden'
                                    }}>
                                        <div className="pulse" style={{
                                            height: '100%',
                                            width: '60%',
                                            background: 'var(--gradient-primary)',
                                            borderRadius: '3px'
                                        }} />
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Quick Stats */}
            <div style={{
                marginTop: '1.5rem',
                padding: '1rem',
                background: 'rgba(16, 185, 129, 0.05)',
                borderRadius: '8px',
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '1rem',
                fontSize: '0.875rem'
            }}>
                <div>
                    <div style={{ opacity: 0.7 }}>Water Saved (vs. traditional)</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                        34%
                    </div>
                </div>
                <div>
                    <div style={{ opacity: 0.7 }}>Efficiency Score</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                        92/100
                    </div>
                </div>
            </div>
        </div>
    );
}
