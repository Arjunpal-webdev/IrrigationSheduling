'use client';

import Sidebar from '@/components/Dashboard/Sidebar';
import DashboardHeader from '@/components/Dashboard/DashboardHeader';
import MoistureChart from '@/components/Charts/MoistureChart';
import styles from '../dashboard/dashboard.module.css';

export default function AnalyticsPage() {
    return (
        <div className={styles.dashboardLayout}>
            <Sidebar />
            <div className={styles.mainContent}>
                <DashboardHeader userName="Farmer" />
                <main className={styles.contentArea}>
                    <div className={styles.pageHeader}>
                        <div>
                            <h2 className={styles.pageTitle}>📈 Analytics & Insights</h2>
                            <p className={styles.pageSubtitle}>
                                Data-driven insights for optimal farm management
                            </p>
                        </div>
                        <button className="btn-secondary">📥 Export Data</button>
                    </div>

                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                        <MoistureChart />

                        <div className="card">
                            <h3 style={{ marginBottom: '1rem' }}>Performance Metrics</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                                {[
                                    { label: 'Water Efficiency', value: '94%', trend: '↑ 5%' },
                                    { label: 'Yield Prediction', value: '4.2 T/ha', trend: '↑ 12%' },
                                    { label: 'Cost Savings', value: '₹12,450', trend: '↑ 8%' },
                                ].map((metric, i) => (
                                    <div key={i} style={{
                                        padding: '1rem',
                                        background: 'var(--color-surface-elevated)',
                                        borderRadius: 'var(--radius-md)',
                                        borderLeft: '3px solid var(--color-primary)'
                                    }}>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                                            {metric.label}
                                        </div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0.5rem 0', color: 'var(--color-primary)' }}>
                                            {metric.value}
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: '#10B981' }}>
                                            {metric.trend} vs last month
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
