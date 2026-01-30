'use client';

import styles from './DashboardHeader.module.css';
import { useState, useRef, useEffect } from 'react';

interface DashboardHeaderProps {
    userName?: string;
    onLocationChange?: (lat: number, lon: number, city: string) => void;
    notifications?: Array<{ id: number; message: string; type: string; time: string }>;
}

const CITIES = [
    { name: 'Mumbai', lat: 19.0760, lon: 72.8777 },
    { name: 'Delhi', lat: 28.7041, lon: 77.1025 },
    { name: 'Bangalore', lat: 12.9716, lon: 77.5946 },
    { name: 'Pune', lat: 18.5204, lon: 73.8567 },
    { name: 'Hyderabad', lat: 17.3850, lon: 78.4867 },
    { name: 'Nashik', lat: 19.9975, lon: 73.7898 },
    { name: 'Nagpur', lat: 21.1458, lon: 79.0882 },
    { name: 'Ahmednagar', lat: 19.0948, lon: 74.7480 }
];

export default function DashboardHeader({ userName = 'Farmer', onLocationChange, notifications = [] }: DashboardHeaderProps) {
    const [selectedCity, setSelectedCity] = useState('Pune');
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationRef = useRef<HTMLDivElement>(null);

    const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const cityName = e.target.value;
        setSelectedCity(cityName);
        const city = CITIES.find(c => c.name === cityName);
        if (city && onLocationChange) {
            onLocationChange(city.lat, city.lon, city.name);
        }
    };

    const toggleNotifications = () => {
        setShowNotifications(prev => !prev);
    };

    // Click outside handler to close dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        };

        if (showNotifications) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showNotifications]);

    const getNotificationColor = (type: string) => {
        switch (type) {
            case 'warning': return '#FBBF24';
            case 'success': return '#10B981';
            case 'info': return '#3B82F6';
            default: return '#6B7280';
        }
    };

    return (
        <header className={styles.header}>
            <div className={styles.headerContent}>
                <div className={styles.headerLeft}>
                    <button className={styles.menuBtn} title="Toggle menu">
                        ☰
                    </button>
                    <div style={{ marginLeft: '1rem' }}>
                        <label style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginRight: '0.5rem' }}>
                            📍 Location:
                        </label>
                        <select
                            value={selectedCity}
                            onChange={handleCityChange}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '8px',
                                border: '2px solid var(--color-primary-light)',
                                background: 'white',
                                color: 'var(--color-text-primary)',
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}
                        >
                            {CITIES.map(city => (
                                <option key={city.name} value={city.name}>
                                    {city.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className={styles.headerRight}>
                    <div style={{ position: 'relative' }} ref={notificationRef}>
                        <button className={styles.iconBtn} title="Notifications" onClick={toggleNotifications}>
                            <span className={styles.icon}>🔔</span>
                            {notifications.length > 0 && (
                                <span className={styles.badge}>{notifications.length}</span>
                            )}
                        </button>

                        {/* Notifications Dropdown */}
                        {showNotifications && (
                            <div style={{
                                position: 'absolute',
                                right: 0,
                                top: 'calc(100% + 0.5rem)',
                                width: '320px',
                                maxHeight: '400px',
                                overflowY: 'auto',
                                background: 'white',
                                borderRadius: '12px',
                                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
                                padding: '1rem',
                                zIndex: 1000
                            }}>
                                <h4 style={{
                                    margin: '0 0 1rem 0',
                                    fontSize: '1rem',
                                    color: 'var(--color-text-primary)',
                                    fontWeight: 600
                                }}>
                                    Notifications
                                </h4>
                                {notifications.length === 0 ? (
                                    <p style={{
                                        textAlign: 'center',
                                        color: 'var(--color-text-muted)',
                                        fontSize: '0.875rem',
                                        padding: '2rem 0'
                                    }}>
                                        No new alerts
                                    </p>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        {notifications.map(n => (
                                            <div key={n.id} style={{
                                                padding: '0.75rem',
                                                borderRadius: '8px',
                                                background: 'var(--color-surface-elevated)',
                                                borderLeft: `4px solid ${getNotificationColor(n.type)}`
                                            }}>
                                                <p style={{
                                                    margin: '0 0 0.25rem 0',
                                                    fontSize: '0.875rem',
                                                    color: 'var(--color-text-primary)',
                                                    lineHeight: 1.5
                                                }}>
                                                    {n.message}
                                                </p>
                                                <span style={{
                                                    fontSize: '0.75rem',
                                                    color: 'var(--color-text-muted)'
                                                }}>
                                                    {n.time}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className={styles.userProfile}>
                        <div className={styles.avatar}>
                            {userName.charAt(0).toUpperCase()}
                        </div>
                        <span className={styles.userName}>{userName}</span>
                    </div>
                </div>
            </div>
        </header>
    );
}
