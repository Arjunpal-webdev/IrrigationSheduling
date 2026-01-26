'use client';

import Sidebar from '@/components/Dashboard/Sidebar';
import DashboardHeader from '@/components/Dashboard/DashboardHeader';
import styles from '../dashboard/dashboard.module.css';

export default function CropsPage() {
    return (
        <div className={styles.dashboardLayout}>
            <Sidebar />
            <div className={styles.mainContent}>
                <DashboardHeader userName="Farmer" />
                <main className={styles.contentArea}>
                    <div className={styles.pageHeader}>
                        <div>
                            <h2 className={styles.pageTitle}>🌾 Crop Management</h2>
                            <p className={styles.pageSubtitle}>
                                Manage your crops with AI-optimized parameters
                            </p>
                        </div>
                        <button className="btn-primary">+ Add New Crop</button>
                    </div>

                    <div className="card">
                        <h3 style={{ marginBottom: '1rem' }}>Current Crop Information</h3>

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
                </main>
            </div>
        </div>
    );
}
