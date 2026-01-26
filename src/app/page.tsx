'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function HomePage() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section style={{
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                minHeight: '90vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Background Pattern */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: 0.1,
                    backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                    backgroundSize: '30px 30px'
                }} />

                <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '2rem' }}>
                    {/* Farm Icon */}
                    <div className="fade-in" style={{
                        fontSize: '5rem',
                        marginBottom: '1.5rem',
                        animation: isVisible ? 'fadeIn 0.8s ease-out' : 'none'
                    }}>
                        🌾🚜💧
                    </div>

                    {/* Main Headline */}
                    <h1 className="fade-in" style={{
                        color: '#ffffff',
                        fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                        fontWeight: 900,
                        marginBottom: '1rem',
                        textShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
                        animationDelay: '0.2s'
                    }}>
                        Smart Irrigation, Healthier Crops, More Yield
                    </h1>

                    {/* Subtext */}
                    <p className="fade-in" style={{
                        color: 'rgba(255, 255, 255, 0.9)',
                        fontSize: 'clamp(1.1rem, 2vw, 1.4rem)',
                        marginBottom: '2.5rem',
                        maxWidth: '700px',
                        margin: '0 auto 2.5rem',
                        lineHeight: 1.6,
                        textShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
                        animationDelay: '0.4s'
                    }}>
                        AI-powered monitoring for soil, water, and crop health. Save water, reduce costs, and increase your harvest.
                    </p>

                    {/* CTA Buttons */}
                    <div className="fade-in" style={{
                        display: 'flex',
                        gap: '1rem',
                        justifyContent: 'center',
                        flexWrap: 'wrap',
                        animationDelay: '0.6s'
                    }}>
                        <Link href="/dashboard" style={{
                            backgroundColor: '#16a34a',
                            color: '#ffffff',
                            fontSize: '1.1rem',
                            fontWeight: 600,
                            padding: '1rem 2.5rem',
                            borderRadius: 'var(--radius-lg)',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
                            transition: 'all 0.3s ease'
                        }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#15803d'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#16a34a'}>
                            🎛️ Go to Dashboard
                        </Link>

                        <Link href="/calculator" style={{
                            backgroundColor: '#ffffff',
                            color: '#16a34a',
                            fontSize: '1.1rem',
                            fontWeight: 600,
                            padding: '1rem 2.5rem',
                            borderRadius: 'var(--radius-lg)',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            border: '2px solid #16a34a',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1)',
                            transition: 'all 0.3s ease'
                        }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dcfce7'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}>
                            💧 Check Water Need
                        </Link>
                    </div>
                </div>
            </section>

            {/* Live Farm Status Preview */}
            <section style={{ padding: '4rem 0', backgroundColor: 'var(--color-background)' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                            Monitor Your Farm in Real-Time
                        </h2>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem' }}>
                            Everything you need to know about your farm at a glance
                        </p>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                        gap: '1.5rem'
                    }}>
                        {[
                            { icon: '💧', label: 'Soil Moisture', value: '42%', status: 'Optimal', color: '#10B981' },
                            { icon: '🌾', label: 'Crop Health', value: '88/100', status: 'Good Condition', color: '#10B981' },
                            { icon: '🚿', label: 'Next Irrigation', value: '6 hours', status: 'AI Scheduled', color: '#FBBF24' },
                            { icon: '🌤️', label: 'Weather', value: '28°C', status: 'Sunny', color: '#3B82F6' }
                        ].map((stat, i) => (
                            <div key={i} className="card" style={{
                                textAlign: 'center',
                                padding: '2rem 1.5rem',
                                borderTop: `4px solid ${stat.color}`,
                                transition: 'all 0.3s ease'
                            }}>
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{stat.icon}</div>
                                <div style={{
                                    fontSize: '2rem',
                                    fontWeight: 800,
                                    color: stat.color,
                                    marginBottom: '0.5rem'
                                }}>
                                    {stat.value}
                                </div>
                                <div style={{ fontWeight: 600, fontSize: '1.05rem', marginBottom: '0.25rem' }}>
                                    {stat.label}
                                </div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                                    {stat.status}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section style={{ padding: '4rem 0', background: 'var(--gradient-subtle)' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                            Why Farmers Choose GreenGuard AI
                        </h2>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem' }}>
                            Practical benefits that increase your farm productivity
                        </p>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '2rem'
                    }}>
                        {[
                            {
                                icon: '💡',
                                title: 'Save Water Automatically',
                                description: 'AI detects exact water needs and irrigates only when required. Save up to 40% water.'
                            },
                            {
                                icon: '🔔',
                                title: 'Get Irrigation Alerts',
                                description: 'Receive SMS and email alerts when your crops need water or face threats.'
                            },
                            {
                                icon: '📈',
                                title: 'Increase Yield with Data',
                                description: 'Make informed decisions based on real-time soil, weather, and crop health data.'
                            }
                        ].map((benefit, i) => (
                            <div key={i} className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                                <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>{benefit.icon}</div>
                                <h3 style={{
                                    color: 'var(--color-primary)',
                                    marginBottom: '1rem',
                                    fontSize: '1.3rem'
                                }}>
                                    {benefit.title}
                                </h3>
                                <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
                                    {benefit.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section style={{ padding: '4rem 0', backgroundColor: 'var(--color-background)' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                            How It Works
                        </h2>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem' }}>
                            Three simple steps to smarter farming
                        </p>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                        gap: '2rem',
                        maxWidth: '900px',
                        margin: '0 auto'
                    }}>
                        {[
                            {
                                step: '1',
                                icon: '📡',
                                title: 'Sensors Monitor Farm',
                                description: 'IoT sensors continuously track soil moisture, temperature, and humidity'
                            },
                            {
                                step: '2',
                                icon: '🤖',
                                title: 'AI Analyzes Data',
                                description: 'Machine learning predicts optimal irrigation timing and water requirements'
                            },
                            {
                                step: '3',
                                icon: '🚿',
                                title: 'Smart Irrigation',
                                description: 'Automated scheduling or instant alerts guide your irrigation decisions'
                            }
                        ].map((step, i) => (
                            <div key={i} style={{ textAlign: 'center', position: 'relative' }}>
                                <div style={{
                                    width: '60px',
                                    height: '60px',
                                    borderRadius: '50%',
                                    background: 'var(--gradient-primary)',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.5rem',
                                    fontWeight: 700,
                                    margin: '0 auto 1rem',
                                    boxShadow: 'var(--shadow-lg)'
                                }}>
                                    {step.step}
                                </div>
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{step.icon}</div>
                                <h3 style={{
                                    fontSize: '1.2rem',
                                    fontWeight: 600,
                                    marginBottom: '0.75rem',
                                    color: 'var(--color-text-primary)'
                                }}>
                                    {step.title}
                                </h3>
                                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                                    {step.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section style={{
                padding: '5rem 0',
                background: 'var(--gradient-primary)',
                textAlign: 'center'
            }}>
                <div className="container">
                    <h2 style={{ color: 'white', fontSize: '2.5rem', marginBottom: '1rem', fontWeight: 700 }}>
                        Ready to Improve Your Farm Efficiency?
                    </h2>
                    <p style={{
                        color: '#D1FAE5',
                        fontSize: '1.2rem',
                        marginBottom: '2rem',
                        maxWidth: '600px',
                        margin: '0 auto 2rem'
                    }}>
                        Join thousands of farmers using AI to save water and increase yields
                    </p>
                    <Link href="/dashboard" className="btn-primary" style={{
                        backgroundColor: 'white',
                        color: 'var(--color-primary)',
                        fontSize: '1.2rem',
                        padding: '1.25rem 3rem',
                        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.2)'
                    }}>
                        Start Monitoring Now →
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer style={{
                padding: '3rem 0',
                backgroundColor: 'var(--color-surface)',
                borderTop: '1px solid var(--color-primary-light)'
            }}>
                <div className="container">
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                        gap: '2rem',
                        marginBottom: '2rem'
                    }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                <span style={{ fontSize: '2rem' }}>🌿</span>
                                <h3 style={{
                                    margin: 0,
                                    fontSize: '1.3rem',
                                    background: 'var(--gradient-primary)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text'
                                }}>
                                    GreenGuard AI
                                </h3>
                            </div>
                            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                                Smart Irrigation & Crop Wellness System
                            </p>
                        </div>

                        <div>
                            <h4 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Quick Links</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <Link href="/dashboard" style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                                    Dashboard
                                </Link>
                                <Link href="/calculator" style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                                    Water Calculator
                                </Link>
                                <Link href="/weather" style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                                    Weather
                                </Link>
                            </div>
                        </div>

                        <div>
                            <h4 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Contact</h4>
                            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                                📍 Maharashtra, India<br />
                                📧 support@greenguard.ai<br />
                                📱 +91 XXXX-XXXXXX
                            </p>
                        </div>
                    </div>

                    <div style={{
                        textAlign: 'center',
                        paddingTop: '2rem',
                        borderTop: '1px solid rgba(16, 185, 129, 0.1)',
                        color: 'var(--color-text-muted)',
                        fontSize: '0.9rem'
                    }}>
                        <p style={{ margin: 0 }}>
                            © 2026 GreenGuard AI. Nurturing fields with intelligence. 🌾
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
