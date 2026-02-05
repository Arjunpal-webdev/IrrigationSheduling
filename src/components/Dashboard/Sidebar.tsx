'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Sidebar.module.css';

export default function Sidebar() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        console.log('Next navigation active');
    }, [pathname]);

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: '📊', href: '/dashboard' },
        { id: 'weather', label: 'Weather', icon: '🌤️', href: '/weather' },
        { id: 'alerts', label: 'Alerts', icon: '🔔', href: '/alerts' },
        { id: 'crops', label: 'Crop Management', icon: '🌾', href: '/crops' },
        { id: 'analytics', label: 'Analytics', icon: '📈', href: '/analytics' },
        { id: 'calculator', label: 'Water Calculator', icon: '💧', href: '/calculator' },
        { id: 'crop-recommendation', label: 'Crop Recommendation', icon: '🌱', href: '/crop-recommendation' },
        { id: 'settings', label: 'Settings', icon: '⚙️', href: '/settings' },
    ];

    const isActive = (href: string) => {
        if (href === '/dashboard') {
            return pathname === '/dashboard';
        }
        return pathname.startsWith(href);
    };

    return (
        <>
            <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}>
                <div className={styles.sidebarHeader}>
                    <Link href="/" className={styles.logoLink}>
                        <span className={styles.logoIcon}>🌿</span>
                        {!isCollapsed && (
                            <div className={styles.logoText}>
                                <h1>GreenGuard AI</h1>
                                <p>Smart Irrigation System</p>
                            </div>
                        )}
                    </Link>
                </div>

                <nav className={styles.sidebarNav}>
                    {menuItems.map((item) => (
                        <Link
                            key={item.id}
                            href={item.href}
                            className={`${styles.navItem} ${isActive(item.href) ? styles.active : ''}`}
                        >
                            <span className={styles.navIcon}>{item.icon}</span>
                            {!isCollapsed && <span className={styles.navLabel}>{item.label}</span>}
                        </Link>
                    ))}
                </nav>

                <button
                    className={styles.collapseBtn}
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    {isCollapsed ? '→' : '←'}
                </button>
            </aside>

            {/* Mobile overlay */}
            <div className={styles.sidebarOverlay} onClick={() => setIsCollapsed(true)} />
        </>
    );
}
