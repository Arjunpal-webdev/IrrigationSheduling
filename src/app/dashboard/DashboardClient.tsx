'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Sidebar from '@/components/Dashboard/Sidebar';
import DashboardHeader from '@/components/Dashboard/DashboardHeader';
import SoilMoistureWidget from '@/components/Dashboard/SoilMoistureWidget';
import WeatherWidget from '@/components/Dashboard/WeatherWidget';
import IrrigationSchedule from '@/components/Dashboard/IrrigationSchedule';
import AlertsPanel from '@/components/Dashboard/AlertsPanel';
import AIInsightsPanel from '@/components/Dashboard/AIInsightsPanel';
import { useFarm } from '@/contexts/FarmContext';
import { useLocation } from '@/contexts/LocationContext';
import styles from './dashboard.module.css';

// Heavy components loaded dynamically
const MoistureChart = dynamic(() => import('@/components/Charts/MoistureChart'), {
    ssr: false,
    loading: () => <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading chart...</div>
});

const KrishiSahayak = dynamic(() => import('@/components/Chat/KrishiSahayak'), {
    ssr: false,
    loading: () => <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading assistant...</div>
});

// ── Types for farm-scoped data ──
interface FarmAgroData {
    ndvi: number | null;
    weather: {
        temp: number;
        humidity: number;
        description: string;
        wind_speed: number;
        pressure: number;
        clouds: number;
        rain?: number;
    } | null;
    soilMoisture: number | null;
    droughtRisk: number | null;
}

export default function DashboardClient() {
    const { farms, selectedFarm, selectFarm, loading: farmsLoading } = useFarm();
    const [currentTime, setCurrentTime] = useState(new Date());

    // Farm-scoped real data
    const [farmData, setFarmData] = useState<FarmAgroData>({
        ndvi: null,
        weather: null,
        soilMoisture: null,
        droughtRisk: null,
    });
    const [farmInsights, setFarmInsights] = useState<any[]>([]);
    const [dataLoading, setDataLoading] = useState(false);

    // Simulation data (still uses location for weather sim)
    const [simulationData, setSimulationData] = useState<any>(null);
    const [stressAnalysis, setStressAnalysis] = useState<any>(null);
    const [irrigationRec, setIrrigationRec] = useState<any>(null);

    // Clock
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // ── Fetch farm-scoped data when selectedFarm changes ──
    const fetchFarmData = useCallback(async (farmId: string) => {
        setDataLoading(true);
        try {
            const [weatherRes, ndviRes, soilRes] = await Promise.allSettled([
                fetch(`/api/agro?farmId=${farmId}&type=weather`),
                fetch(`/api/agro?farmId=${farmId}&type=ndvi`),
                fetch(`/api/agro?farmId=${farmId}&type=soil`),
            ]);

            const weather = weatherRes.status === 'fulfilled' && weatherRes.value.ok
                ? (await weatherRes.value.json()).data : null;
            const ndviData = ndviRes.status === 'fulfilled' && ndviRes.value.ok
                ? (await ndviRes.value.json()).data : null;
            const soilData = soilRes.status === 'fulfilled' && soilRes.value.ok
                ? (await soilRes.value.json()).data : null;

            // Normalize weather shape: AgroMonitoring returns nested objects
            // (e.g. clouds: { all: 25 }, main: { temp, humidity, pressure })
            // but our interface expects flat values.
            let normalizedWeather: FarmAgroData['weather'] = null;
            if (weather) {
                normalizedWeather = {
                    temp: (weather.main?.temp ?? weather.temp ?? 273.15) - 273.15,
                    humidity: weather.main?.humidity ?? weather.humidity ?? 0,
                    description: weather.weather?.[0]?.description ?? weather.description ?? '',
                    wind_speed: weather.wind?.speed ?? weather.wind_speed ?? 0,
                    pressure: weather.main?.pressure ?? weather.pressure ?? 0,
                    clouds: typeof weather.clouds === 'object' ? weather.clouds.all : (weather.clouds ?? 0),
                    rain: weather.rain?.['1h'] ?? weather.rain?.['3h'] ?? weather.rain ?? 0,
                };
            }

            setFarmData({
                weather: normalizedWeather,
                ndvi: Array.isArray(ndviData) && ndviData.length > 0
                    ? (ndviData[ndviData.length - 1]?.data?.mean ?? null)
                    : (ndviData?.data?.mean ?? ndviData?.mean ?? null),
                soilMoisture: soilData?.moisture ?? soilData?.soilMoisture ?? null,
                droughtRisk: soilData?.droughtRisk ?? null,
            });
        } catch (err) {
            console.error('Error fetching farm data:', err);
        } finally {
            setDataLoading(false);
        }
    }, []);

    const fetchFarmInsights = useCallback(async (farmId: string) => {
        try {
            const res = await fetch(`/api/insights/generate?farmId=${farmId}`);
            if (res.ok) {
                const data = await res.json();
                setFarmInsights(data.insights || []);
            }
        } catch (err) {
            console.error('Error fetching insights:', err);
        }
    }, []);

    useEffect(() => {
        if (selectedFarm?.id) {
            fetchFarmData(selectedFarm.id);
            fetchFarmInsights(selectedFarm.id);
        }
    }, [selectedFarm?.id, fetchFarmData, fetchFarmInsights]);

    // ── Simulation data (uses location, independent of farm) ──
    const { lat, lon } = useLocation();
    useEffect(() => {
        if (lat && lon) {
            fetchSimulationData();
        }
    }, [lat, lon]);

    const fetchSimulationData = async () => {
        try {
            const response = await fetch(
                `/api/simulation?lat=${lat}&lon=${lon}&crop=wheat&currentMoisture=${farmData.soilMoisture || 42}&stage=development&soilType=loamy`
            );
            if (response.ok) {
                const data = await response.json();
                setSimulationData(data);
                setStressAnalysis(data.stressAnalysis);
                setIrrigationRec(data.irrigationRecommendation);
            }
        } catch (error) {
            console.error('Simulation fetch failed:', error);
        }
    };

    // ── Helpers ──
    const getStressColor = (status?: string) => {
        if (!status) return '#10B981';
        if (status === 'optimal') return '#10B981';
        if (status === 'mild_stress') return '#FBBF24';
        if (status === 'moderate_stress') return '#F97316';
        return '#EF4444';
    };

    const getUrgencyColor = (urgency?: string) => {
        if (!urgency || urgency === 'none') return '#10B981';
        if (urgency === 'low') return '#FBBF24';
        if (urgency === 'medium') return '#F97316';
        return '#EF4444';
    };

    const getNdviLabel = (ndvi: number | null) => {
        if (ndvi === null) return { value: '—', status: 'No data', color: '#9CA3AF' };
        if (ndvi >= 0.6) return { value: ndvi.toFixed(2), status: 'Excellent', color: '#10B981' };
        if (ndvi >= 0.4) return { value: ndvi.toFixed(2), status: 'Good', color: '#3B82F6' };
        if (ndvi >= 0.2) return { value: ndvi.toFixed(2), status: 'Fair', color: '#FBBF24' };
        return { value: ndvi.toFixed(2), status: 'Poor', color: '#EF4444' };
    };

    const handleExportReport = () => {
        const report = {
            generatedAt: new Date().toISOString(),
            farm: selectedFarm ? { name: selectedFarm.name, location: selectedFarm.location, id: selectedFarm.id } : null,
            data: farmData,
            insights: farmInsights,
        };
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `farm-report-${selectedFarm?.name || 'unknown'}-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleGenerateInsights = async () => {
        if (!selectedFarm?.id) return;
        try {
            const res = await fetch('/api/insights/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ farmId: selectedFarm.id }),
            });
            if (res.ok) {
                await fetchFarmInsights(selectedFarm.id);
            }
        } catch (err) {
            console.error('Error generating insights:', err);
        }
    };

    // ── Derived stat values ──
    const ndviInfo = getNdviLabel(farmData.ndvi);
    const soilMoistureVal = farmData.soilMoisture ?? simulationData?.predicted?.[0]?.moisture ?? null;
    const weatherTemp = farmData.weather?.temp ?? null;
    const weatherDesc = farmData.weather?.description ?? null;

    return (
        <div className={styles.dashboardLayout}>
            <Sidebar />

            <div className={styles.mainContent}>
                <DashboardHeader userName="Farmer" notifications={[]} />

                <main className={styles.contentArea}>
                    {/* ── Page Header with Farm Switcher ── */}
                    <div className={styles.pageHeader}>
                        <div>
                            <h2 className={styles.pageTitle}>
                                {selectedFarm ? `🌾 ${selectedFarm.name}` : 'Farm Dashboard'}
                            </h2>
                            <p className={styles.pageSubtitle}>
                                {selectedFarm
                                    ? `📍 ${selectedFarm.location} • ${currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`
                                    : 'Select a farm to get started'
                                }
                            </p>
                        </div>
                        <div className={styles.headerActions}>
                            {/* Farm Switcher */}
                            {farms.length > 1 && (
                                <div className={styles.farmSwitcher}>
                                    <label className={styles.farmSwitcherLabel}>Switch Farm:</label>
                                    <select
                                        className={styles.farmSelect}
                                        value={selectedFarm?.id || ''}
                                        onChange={(e) => selectFarm(e.target.value)}
                                    >
                                        {farms.map((farm) => (
                                            <option key={farm.id} value={farm.id}>
                                                {farm.name} — {farm.location}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            {selectedFarm && (
                                <button className="btn-secondary" onClick={handleExportReport}>
                                    📥 Export Report
                                </button>
                            )}
                            <Link href="/farms" className="btn-primary" style={{ textDecoration: 'none' }}>
                                {farms.length > 0 ? '🌾 Manage Farms' : '+ Add Farm'}
                            </Link>
                        </div>
                    </div>

                    {/* ── No Farm State ── */}
                    {!farmsLoading && farms.length === 0 && (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyIcon}>🌱</div>
                            <h3>Welcome to GreenGuard AI</h3>
                            <p>Add your first farm to unlock real-time NDVI tracking, weather monitoring, AI insights, and smart irrigation recommendations.</p>
                            <Link href="/farms" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block', padding: '0.75rem 2rem', fontSize: '1rem' }}>
                                + Add Your First Farm
                            </Link>
                        </div>
                    )}

                    {/* ── Loading State ── */}
                    {farmsLoading && (
                        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--color-text-muted)' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
                            <p>Loading your farms...</p>
                        </div>
                    )}

                    {/* ── Farm-Scoped Dashboard ── */}
                    {selectedFarm && (
                        <>
                            {/* Data loading indicator */}
                            {dataLoading && (
                                <div style={{
                                    background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
                                    borderRadius: '12px',
                                    padding: '0.75rem 1.25rem',
                                    marginBottom: '1rem',
                                    fontSize: '0.875rem',
                                    color: '#1E40AF',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                }}>
                                    ⏳ Fetching live data for <strong>{selectedFarm.name}</strong>...
                                </div>
                            )}

                            {/* Quick Stats Cards — REAL DATA */}
                            <div className={styles.statsGrid}>
                                {[
                                    {
                                        icon: '🌡️',
                                        label: 'Weather',
                                        value: weatherTemp !== null ? `${Math.round(weatherTemp)}°C` : '—',
                                        status: weatherDesc || 'No data',
                                        color: '#3B82F6'
                                    },
                                    {
                                        icon: '🛰️',
                                        label: 'NDVI (Crop Health)',
                                        value: ndviInfo.value,
                                        status: ndviInfo.status,
                                        color: ndviInfo.color
                                    },
                                    {
                                        icon: '💧',
                                        label: 'Soil Moisture',
                                        value: soilMoistureVal !== null ? `${typeof soilMoistureVal === 'number' ? soilMoistureVal.toFixed(1) : soilMoistureVal}%` : '—',
                                        status: stressAnalysis?.status?.replace('_', ' ') || (soilMoistureVal !== null ? 'Live' : 'No data'),
                                        color: getStressColor(stressAnalysis?.status)
                                    },
                                    {
                                        icon: '🚿',
                                        label: 'Next Irrigation',
                                        value: irrigationRec?.isNeeded
                                            ? irrigationRec.daysUntilStress === 0 ? 'Today' : `${irrigationRec.daysUntilStress}d`
                                            : 'Not needed',
                                        status: irrigationRec?.urgency || 'Scheduled',
                                        color: getUrgencyColor(irrigationRec?.urgency)
                                    }
                                ].map((stat, i) => (
                                    <div key={i} className={styles.statCard} style={{ '--accent-color': stat.color } as any}>
                                        <div className={styles.statIcon}>{stat.icon}</div>
                                        <div className={styles.statValue}>{stat.value}</div>
                                        <div className={styles.statLabel}>{stat.label}</div>
                                        <div className={styles.statStatus}>{stat.status}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Farm Info Banner */}
                            <div style={{
                                background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
                                borderRadius: '16px',
                                padding: '1.25rem 1.5rem',
                                marginBottom: '1.5rem',
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                                gap: '1rem',
                            }}>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 500 }}>Farm Name</div>
                                    <div style={{ fontWeight: 700, color: '#1a2e1a', fontSize: '1.05rem' }}>{selectedFarm.name}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 500 }}>Location</div>
                                    <div style={{ fontWeight: 700, color: '#1a2e1a', fontSize: '1.05rem' }}>{selectedFarm.location}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 500 }}>Area</div>
                                    <div style={{ fontWeight: 700, color: '#1a2e1a', fontSize: '1.05rem' }}>{selectedFarm.areaHa ? `${selectedFarm.areaHa} ha` : 'Not set'}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 500 }}>Satellite Tracking</div>
                                    <div style={{ fontWeight: 700, color: selectedFarm.polygonId ? '#10B981' : '#F59E0B', fontSize: '1.05rem' }}>
                                        {selectedFarm.polygonId ? '✅ Active' : '⚠️ No polygon'}
                                    </div>
                                </div>
                            </div>

                            {/* Weather Detail (only if real data) */}
                            {farmData.weather && (
                                <div style={{
                                    background: 'var(--color-surface)',
                                    borderRadius: '16px',
                                    padding: '1.5rem',
                                    marginBottom: '1.5rem',
                                    boxShadow: 'var(--shadow-md)',
                                }}>
                                    <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: 'var(--color-text-primary)' }}>
                                        🌤️ Live Weather — {selectedFarm.name}
                                    </h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
                                        <div><span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>Temperature</span><br /><strong>{Math.round(farmData.weather.temp)}°C</strong></div>
                                        <div><span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>Humidity</span><br /><strong>{farmData.weather.humidity}%</strong></div>
                                        <div><span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>Wind</span><br /><strong>{farmData.weather.wind_speed} m/s</strong></div>
                                        <div><span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>Pressure</span><br /><strong>{farmData.weather.pressure} hPa</strong></div>
                                        <div><span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>Clouds</span><br /><strong>{farmData.weather.clouds}%</strong></div>
                                        <div><span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>Condition</span><br /><strong style={{ textTransform: 'capitalize' }}>{farmData.weather.description}</strong></div>
                                    </div>
                                </div>
                            )}

                            {/* Main Dashboard Grid */}
                            <div className={styles.dashboardGrid}>
                                <div className={styles.gridItem} style={{ gridColumn: 'span 4' }}>
                                    <SoilMoistureWidget
                                        currentMoisture={soilMoistureVal || 42}
                                        fieldCapacity={simulationData?.fieldParameters?.fieldCapacity || 70}
                                        wiltingPoint={simulationData?.fieldParameters?.wiltingPoint || 20}
                                        trend={simulationData?.predicted?.length >= 2
                                            ? (simulationData.predicted[1].moisture > simulationData.predicted[0].moisture + 1 ? 'up' : simulationData.predicted[1].moisture < simulationData.predicted[0].moisture - 1 ? 'down' : 'stable')
                                            : 'stable'}
                                        predictions={simulationData?.predicted}
                                        stressAnalysis={stressAnalysis}
                                    />
                                </div>

                                <div className={styles.gridItem} style={{ gridColumn: 'span 8' }}>
                                    <WeatherWidget />
                                </div>

                                <div className={styles.gridItem} style={{ gridColumn: 'span 12' }}>
                                    <MoistureChart />
                                </div>

                                <div className={styles.gridItem} style={{ gridColumn: 'span 6' }}>
                                    <IrrigationSchedule />
                                </div>

                                <div className={styles.gridItem} style={{ gridColumn: 'span 6' }}>
                                    <AlertsPanel />
                                </div>
                            </div>

                            {/* AI Insights Panel */}
                            <AIInsightsPanel />

                            {/* Crop Stress Indicator */}
                            {stressAnalysis && (
                                <div className="card" style={{
                                    padding: '1rem',
                                    background: getStressColor(stressAnalysis.status),
                                    color: 'white',
                                    marginBottom: '1rem',
                                    borderRadius: '12px'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ fontSize: '2rem' }}>
                                            {stressAnalysis.status === 'optimal' ? '✅' : '⚠️'}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.25rem' }}>
                                                Crop Water Stress: {stressAnalysis.status.replace('_', ' ').toUpperCase()}
                                            </div>
                                            <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                                                {stressAnalysis.description}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Footer */}
                            <div className={styles.footer}>
                                <p>🌿 Powered by GreenGuard AI • Data for: {selectedFarm.name} • {currentTime.toLocaleTimeString()}</p>
                                <p>Need help? Chat with Krishi Sahayak (bottom right corner)</p>
                            </div>
                        </>
                    )}
                </main>
            </div>

            {/* Floating Chatbot — gets selectedFarm context */}
            <KrishiSahayak />
        </div>
    );
}
