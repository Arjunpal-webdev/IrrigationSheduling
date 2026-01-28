'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Dashboard/Sidebar';
import DashboardHeader from '@/components/Dashboard/DashboardHeader';
import SoilMoistureWidget from '@/components/Dashboard/SoilMoistureWidget';
import WeatherWidget from '@/components/Dashboard/WeatherWidget';
import IrrigationSchedule from '@/components/Dashboard/IrrigationSchedule';
import AlertsPanel from '@/components/Dashboard/AlertsPanel';
import MoistureChart from '@/components/Charts/MoistureChart';
import KrishiSahayak from '@/components/Chat/KrishiSahayak';
import styles from './dashboard.module.css';

export default function DashboardClient() {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className={styles.dashboardLayout}>
            {/* Sidebar Navigation */}
            <Sidebar />

            {/* Main Content Area */}
            <div className={styles.mainContent}>
                {/* Top Header */}
                <DashboardHeader userName="Farmer" />

                {/* Dashboard Content */}
                <main className={styles.contentArea}>
                    {/* Page Header */}
                    <div className={styles.pageHeader}>
                        <div>
                            <h2 className={styles.pageTitle}>Farm Dashboard</h2>
                            <p className={styles.pageSubtitle}>
                                📍 Maharashtra, India • {currentTime.toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })} • {currentTime.toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                        </div>
                        <div className={styles.headerActions}>
                            <button className="btn-secondary">
                                📥 Export Report
                            </button>
                            <button className="btn-primary">
                                + Add Field
                            </button>
                        </div>
                    </div>

                    {/* Quick Stats Cards */}
                    <div className={styles.statsGrid}>
                        {[
                            { icon: '💧', label: 'Soil Moisture', value: '42%', status: 'Optimal', color: '#10B981' },
                            { icon: '🌾', label: 'Crop Health', value: '88/100', status: 'Good', color: '#10B981' },
                            { icon: '💡', label: 'Water Saved', value: '2,450L', status: 'This week', color: '#3B82F6' },
                            { icon: '🚿', label: 'Next Irrigation', value: '6hrs', status: 'AI Scheduled', color: '#FBBF24' }
                        ].map((stat, i) => (
                            <div key={i} className={styles.statCard} style={{ '--accent-color': stat.color } as any}>
                                <div className={styles.statIcon}>{stat.icon}</div>
                                <div className={styles.statValue}>{stat.value}</div>
                                <div className={styles.statLabel}>{stat.label}</div>
                                <div className={styles.statStatus}>{stat.status}</div>
                            </div>
                        ))}
                    </div>

                    {/* Main Dashboard Grid */}
                    <div className={styles.dashboardGrid}>
                        {/* Soil Moisture Widget */}
                        <div className={styles.gridItem} style={{ gridColumn: 'span 4' }}>
                            <SoilMoistureWidget
                                currentMoisture={42}
                                fieldCapacity={70}
                                wiltingPoint={20}
                                trend="down"
                            />
                        </div>

                        {/* Weather Widget */}
                        <div className={styles.gridItem} style={{ gridColumn: 'span 8' }}>
                            <WeatherWidget />
                        </div>

                        {/* Moisture Chart - Full Width */}
                        <div className={styles.gridItem} style={{ gridColumn: 'span 12' }}>
                            <MoistureChart />
                        </div>

                        {/* Irrigation Schedule */}
                        <div className={styles.gridItem} style={{ gridColumn: 'span 6' }}>
                            <IrrigationSchedule />
                        </div>

                        {/* Alerts Panel */}
                        <div className={styles.gridItem} style={{ gridColumn: 'span 6' }}>
                            <AlertsPanel />
                        </div>
                    </div>

                    {/* Crop Information Card */}
                    <div className={`card ${styles.cropInfo}`}>
                        <div className={styles.cardHeader}>
                            <div>
                                <h3 className={styles.cardTitle}>Current Crop Information</h3>
                                <p className={styles.cardSubtitle}>AI-optimized parameters for your crop</p>
                            </div>
                            <button className="btn-secondary">
                                Change Crop
                            </button>
                        </div>

                        <div className={styles.cropGrid}>
                            {[
                                { label: 'Crop Type', value: '🌾 Wheat', color: '#10B981' },
                                { label: 'Growth Stage', value: 'Development (45 days)', color: '#FBBF24' },
                                { label: 'Field Area', value: '2.5 hectares', color: '#3B82F6' },
                                { label: 'Planting Date', value: 'Dec 12, 2025', color: '#8B5CF6' },
                                { label: 'Expected Harvest', value: 'Apr 15, 2026', color: '#EC4899' },
                                { label: 'Crop Coefficient (Kc)', value: '0.85 (AI)', color: '#10B981' }
                            ].map((info, i) => (
                                <div key={i} className={styles.cropItem} style={{ '--border-color': info.color } as any}>
                                    <div className={styles.cropLabel}>{info.label}</div>
                                    <div className={styles.cropValue} style={{ color: info.color }}>
                                        {info.value}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className={styles.footer}>
                        <p>🌿 Powered by GreenGuard AI • Last Updated: {currentTime.toLocaleTimeString()}</p>
                        <p>Need help? Chat with Krishi Sahayak (bottom right corner)</p>
                    </div>
                </main>
            </div>

            {/* Floating Chatbot */}
            <KrishiSahayak />
        </div>
    );
}
