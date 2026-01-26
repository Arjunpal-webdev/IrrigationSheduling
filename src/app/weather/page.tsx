'use client';

import Sidebar from '@/components/Dashboard/Sidebar';
import DashboardHeader from '@/components/Dashboard/DashboardHeader';
import WeatherWidget from '@/components/Dashboard/WeatherWidget';
import styles from '../dashboard/dashboard.module.css';

export default function WeatherPage() {
    return (
        <div className={styles.dashboardLayout}>
            <Sidebar />
            <div className={styles.mainContent}>
                <DashboardHeader userName="Farmer" />
                <main className={styles.contentArea}>
                    <div className={styles.pageHeader}>
                        <div>
                            <h2 className={styles.pageTitle}>🌤️ Weather Forecast</h2>
                            <p className={styles.pageSubtitle}>
                                Real-time weather data and AI-refined forecasts
                            </p>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                        <WeatherWidget />

                        <div className="card">
                            <h3 style={{ marginBottom: '1rem' }}>Extended Forecast</h3>
                            <p style={{ color: 'var(--color-text-muted)' }}>
                                7-day weather forecast with AI optimization coming soon...
                            </p>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
