'use client';

import { motion } from 'framer-motion';

interface SoilMoistureWidgetProps {
    currentMoisture: number;
    fieldCapacity: number;
    wiltingPoint: number;
    trend?: 'up' | 'down' | 'stable';
}

export default function SoilMoistureWidget({
    currentMoisture,
    fieldCapacity = 70,
    wiltingPoint = 20,
    trend = 'stable'
}: SoilMoistureWidgetProps) {
    const getTrendEmoji = () => {
        if (trend === 'up') return '📈';
        if (trend === 'down') return '📉';
        return '➡️';
    };

    const getStatusColor = () => {
        if (currentMoisture < 30) return '#EF4444';
        if (currentMoisture < 40) return '#F97316';
        if (currentMoisture > 65) return '#3B82F6';
        return '#10B981';
    };

    const getStatusText = () => {
        if (currentMoisture < 30) return 'Critical';
        if (currentMoisture < 40) return 'Low';
        if (currentMoisture > 65) return 'High';
        return 'Optimal';
    };

    const percentage = ((currentMoisture - wiltingPoint) / (fieldCapacity - wiltingPoint)) * 100;
    const clampedPercentage = Math.max(0, Math.min(100, percentage));

    return (
        <div className="card-glass">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
                <div>
                    <h3 style={{ margin: 0, marginBottom: '0.25rem', fontSize: '1.1rem' }}>Soil Moisture</h3>
                    <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.7 }}>Real-time monitoring</p>
                </div>
                <div className="badge badge-success" style={{ fontSize: '0.75rem' }}>
                    Live
                </div>
            </div>

            {/* Main Display */}
            <div style={{ textAlign: 'center', margin: '2rem 0' }}>
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    style={{
                        fontSize: '4rem',
                        fontWeight: 800,
                        background: 'var(--gradient-primary)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        lineHeight: 1
                    }}
                >
                    {currentMoisture.toFixed(1)}%
                </motion.div>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    marginTop: '0.5rem'
                }}>
                    <span style={{ fontSize: '1.5rem' }}>{getTrendEmoji()}</span>
                    <span style={{
                        color: getStatusColor(),
                        fontWeight: 600,
                        fontSize: '1.1rem'
                    }}>
                        {getStatusText()}
                    </span>
                </div>
            </div>

            {/* Visual Progress Bar */}
            <div style={{
                position: 'relative',
                height: '80px',
                background: '#E5E7EB',
                borderRadius: '12px',
                overflow: 'hidden',
                marginBottom: '1rem'
            }}>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${clampedPercentage}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    style={{
                        height: '100%',
                        background: 'var(--gradient-primary)',
                        borderRadius: '12px',
                        position: 'relative'
                    }}
                >
                    {/* Water Droplet Animation */}
                    <div style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        fontSize: '2rem',
                        animation: 'pulse 2s infinite'
                    }}>
                        💧
                    </div>
                </motion.div>

                {/* Range Markers */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    pointerEvents: 'none'
                }}>
                    <span style={{ position: 'absolute', left: '5px', color: '#EF4444' }}>
                        {wiltingPoint}%
                    </span>
                    <span style={{ position: 'absolute', right: '5px', color: '#047857' }}>
                        {fieldCapacity}%
                    </span>
                </div>
            </div>

            {/* Status Indicators */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '0.75rem',
                fontSize: '0.875rem'
            }}>
                <div style={{
                    padding: '0.5rem',
                    background: 'rgba(239, 68, 68, 0.1)',
                    borderRadius: '8px',
                    textAlign: 'center'
                }}>
                    <div style={{ color: '#EF4444', fontWeight: 600 }}>≤{wiltingPoint}%</div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Wilting</div>
                </div>
                <div style={{
                    padding: '0.5rem',
                    background: 'rgba(16, 185, 129, 0.1)',
                    borderRadius: '8px',
                    textAlign: 'center'
                }}>
                    <div style={{ color: '#10B981', fontWeight: 600 }}>30-65%</div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Optimal</div>
                </div>
                <div style={{
                    padding: '0.5rem',
                    background: 'rgba(59, 130, 246, 0.1)',
                    borderRadius: '8px',
                    textAlign: 'center'
                }}>
                    <div style={{ color: '#3B82F6', fontWeight: 600 }}>{fieldCapacity}%</div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Field Cap.</div>
                </div>
            </div>
        </div>
    );
}
