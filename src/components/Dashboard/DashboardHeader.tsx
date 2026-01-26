'use client';

import styles from './DashboardHeader.module.css';

interface DashboardHeaderProps {
    userName?: string;
}

export default function DashboardHeader({ userName = 'Farmer' }: DashboardHeaderProps) {
    return (
        <header className={styles.header}>
            <div className={styles.headerContent}>
                <div className={styles.headerLeft}>
                    <button className={styles.menuBtn} title="Toggle menu">
                        ☰
                    </button>
                </div>

                <div className={styles.headerRight}>
                    <button className={styles.iconBtn} title="Notifications">
                        <span className={styles.icon}>🔔</span>
                        <span className={styles.badge}>3</span>
                    </button>

                    <button className={styles.iconBtn} title="Messages">
                        <span className={styles.icon}>💬</span>
                        <span className={styles.badge}>2</span>
                    </button>

                    <button className={styles.iconBtn} title="Toggle dark mode">
                        <span className={styles.icon}>🌙</span>
                    </button>

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
