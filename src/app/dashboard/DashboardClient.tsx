'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Sidebar from '@/components/Dashboard/Sidebar';
import DashboardHeader from '@/components/Dashboard/DashboardHeader';
import SoilMoistureWidget from '@/components/Dashboard/SoilMoistureWidget';
import WeatherWidget from '@/components/Dashboard/WeatherWidget';
import IrrigationSchedule from '@/components/Dashboard/IrrigationSchedule';
import AlertsPanel from '@/components/Dashboard/AlertsPanel';
import { useLocation } from '@/contexts/LocationContext';
import styles from './dashboard.module.css';

// Heavy components loaded dynamically to prevent UI freeze
const MoistureChart = dynamic(() => import('@/components/Charts/MoistureChart'), {
    ssr: false,
    loading: () => <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading chart...</div>
});

const KrishiSahayak = dynamic(() => import('@/components/Chat/KrishiSahayak'), {
    ssr: false,
    loading: () => <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading assistant...</div>
});

export default function DashboardClient() {
    const { state, district, lat, lon } = useLocation();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [showFieldModal, setShowFieldModal] = useState(false);
    const [fields, setFields] = useState<any[]>([]);
    const [notifications] = useState([
        { id: 1, message: 'Soil moisture below optimal level', type: 'warning', time: '10 mins ago' },
        { id: 2, message: 'Weather forecast: Rain expected in 2 days', type: 'info', time: '1 hour ago' },
        { id: 3, message: 'Irrigation scheduled for Field A', type: 'success', time: '2 hours ago' }
    ]);
    const [showCropSelector, setShowCropSelector] = useState(false);
    const [selectedCrop, setSelectedCrop] = useState({
        id: 1,
        name: 'Wheat',
        icon: '🌾',
        growthStage: 'Development (45 days)',
        area: '2.5 hectares',
        plantingDate: 'Dec 12, 2025',
        expectedHarvest: 'Apr 15, 2026',
        cropCoefficient: '0.85'
    });

    // Simulation data state
    const [simulationData, setSimulationData] = useState<any>(null);
    const [stressAnalysis, setStressAnalysis] = useState<any>(null);
    const [irrigationRec, setIrrigationRec] = useState<any>(null);

    const cropList = [
        { id: 1, name: 'Wheat', icon: '🌾', growthStage: 'Development (45 days)', area: '2.5 hectares', plantingDate: 'Dec 12, 2025', expectedHarvest: 'Apr 15, 2026', cropCoefficient: '0.85' },
        { id: 2, name: 'Rice', icon: '🌾', growthStage: 'Initial (20 days)', area: '3.0 hectares', plantingDate: 'Jan 5, 2026', expectedHarvest: 'May 10, 2026', cropCoefficient: '0.90' },
        { id: 3, name: 'Corn', icon: '🌽', growthStage: 'Mid Season (60 days)', area: '2.0 hectares', plantingDate: 'Nov 20, 2025', expectedHarvest: 'Mar 25, 2026', cropCoefficient: '0.95' },
        { id: 4, name: 'Cotton', icon: '🌿', growthStage: 'Late Season (90 days)', area: '4.0 hectares', plantingDate: 'Oct 15, 2025', expectedHarvest: 'Apr 1, 2026', cropCoefficient: '0.80' },
        { id: 5, name: 'Sugarcane', icon: '🎋', growthStage: 'Development (120 days)', area: '5.0 hectares', plantingDate: 'Sep 1, 2025', expectedHarvest: 'Jun 15, 2026', cropCoefficient: '1.00' }
    ];

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Fetch simulation data
    useEffect(() => {
        if (lat && lon) {
            fetchSimulationData();
        }
    }, [lat, lon, selectedCrop]);

    const fetchSimulationData = async () => {
        try {
            const cropName = selectedCrop.name.toLowerCase();
            const stage = 'development'; // Map from growth stage
            const response = await fetch(
                `/api/simulation?lat=${lat}&lon=${lon}&crop=${cropName}&currentMoisture=42&stage=${stage}&soilType=loamy`
            );

            if (response.ok) {
                const data = await response.json();
                setSimulationData(data);
                setStressAnalysis(data.stressAnalysis);
                setIrrigationRec(data.irrigationRecommendation);
            }
        } catch (error) {
            console.error('Simulation fetch failed, using fallback', error);
            // Keep existing hardcoded values as fallback
        }
    };

    // Helper functions for simulation data
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

    const getTrendFromPredictions = (predictions?: any[]) => {
        if (!predictions || predictions.length < 2) return 'stable';
        const current = predictions[0].moisture;
        const tomorrow = predictions[1].moisture;
        if (tomorrow > current + 1) return 'up' as const;
        if (tomorrow < current - 1) return 'down' as const;
        return 'stable' as const;
    };

    // Export Report Handler
    const handleExportReport = () => {
        const dashboardData = {
            generatedAt: new Date().toISOString(),
            location: { district, state },
            stats: {
                soilMoisture: { value: '42%', status: 'Optimal' },
                cropHealth: { value: '88/100', status: 'Good' },
                waterSaved: { value: '2,450L', period: 'This week' },
                nextIrrigation: { value: '6hrs', status: 'AI Scheduled' }
            },
            cropInfo: {
                type: 'Wheat',
                growthStage: 'Development (45 days)',
                fieldArea: '2.5 hectares',
                plantingDate: 'Dec 12, 2025',
                expectedHarvest: 'Apr 15, 2026',
                cropCoefficient: '0.85'
            },
            fields: fields
        };

        const data = JSON.stringify(dashboardData, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `farm-report-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // Add Field Handlers
    const handleAddField = () => {
        setShowFieldModal(true);
    };

    const handleSaveField = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const fieldData = {
            name: formData.get('name'),
            area: formData.get('area'),
            cropType: formData.get('cropType'),
            location: formData.get('location')
        };

        if (!fieldData.name || !fieldData.area) {
            alert('Please fill in all required fields');
            return;
        }

        try {
            const response = await fetch('/api/fields', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(fieldData)
            });

            if (response.ok) {
                const data = await response.json();
                setFields(prev => [...prev, data.field]);
                setShowFieldModal(false);
                alert('Field added successfully!');
            } else {
                alert('Failed to add field');
            }
        } catch (error) {
            console.error('Error adding field:', error);
            alert('Error adding field');
        }
    };

    // Crop Change Handlers
    const handleOpenCropSelector = () => {
        setShowCropSelector(true);
    };

    const handleCropChange = async (crop: any) => {
        setSelectedCrop(crop);
        setShowCropSelector(false);

        // In a real app, save to backend
        try {
            await fetch('/api/crops/set-current', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cropId: crop.id })
            });
        } catch (error) {
            console.error('Error updating crop:', error);
        }
    };

    return (
        <div className={styles.dashboardLayout}>
            {/* Sidebar Navigation */}
            <Sidebar />

            {/* Main Content Area */}
            <div className={styles.mainContent}>
                {/* Top Header */}
                <DashboardHeader userName="Farmer" notifications={notifications} />

                {/* Dashboard Content */}
                <main className={styles.contentArea}>
                    {/* Page Header */}
                    <div className={styles.pageHeader}>
                        <div>
                            <h2 className={styles.pageTitle}>Farm Dashboard</h2>
                            <p className={styles.pageSubtitle}>
                                📍 {district}, {state} • {currentTime.toLocaleDateString('en-US', {
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
                            <button className="btn-secondary" onClick={handleExportReport}>
                                📥 Export Report
                            </button>
                            <button className="btn-primary" onClick={handleAddField}>
                                + Add Field
                            </button>
                        </div>
                    </div>

                    {/* Quick Stats Cards */}
                    <div className={styles.statsGrid}>
                        {[
                            {
                                icon: '💧',
                                label: 'Soil Moisture',
                                value: simulationData?.predicted[0]?.moisture
                                    ? `${simulationData.predicted[0].moisture.toFixed(1)}%`
                                    : '42%',
                                status: stressAnalysis?.status?.replace('_', ' ') || 'Optimal',
                                color: getStressColor(stressAnalysis?.status)
                            },
                            {
                                icon: '🌾',
                                label: 'Crop Health',
                                value: stressAnalysis?.stressIndex
                                    ? `${Math.round(stressAnalysis.stressIndex * 100)}/100`
                                    : '88/100',
                                status: stressAnalysis?.status === 'optimal' ? 'Good' : 'Monitor',
                                color: getStressColor(stressAnalysis?.status)
                            },
                            {
                                icon: '💡',
                                label: 'Water Saved',
                                value: '2,450L',
                                status: 'This week',
                                color: '#3B82F6'
                            },
                            {
                                icon: '🚿',
                                label: 'Next Irrigation',
                                value: irrigationRec?.isNeeded
                                    ? irrigationRec.daysUntilStress === 0
                                        ? 'Today'
                                        : `${irrigationRec.daysUntilStress}d`
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

                    {/* Main Dashboard Grid */}
                    <div className={styles.dashboardGrid}>
                        {/* Soil Moisture Widget */}
                        <div className={styles.gridItem} style={{ gridColumn: 'span 4' }}>
                            <SoilMoistureWidget
                                currentMoisture={simulationData?.predicted[0]?.moisture || 42}
                                fieldCapacity={simulationData?.fieldParameters?.fieldCapacity || 70}
                                wiltingPoint={simulationData?.fieldParameters?.wiltingPoint || 20}
                                trend={getTrendFromPredictions(simulationData?.predicted)}
                                predictions={simulationData?.predicted}
                                stressAnalysis={stressAnalysis}
                            />
                        </div>

                        {/* Weather Widget - uses header location */}
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
                            <button className="btn-secondary" onClick={handleOpenCropSelector}>
                                Change Crop
                            </button>
                        </div>

                        <div className={styles.cropGrid}>
                            {[
                                { label: 'Crop Type', value: `${selectedCrop.icon} ${selectedCrop.name}`, color: '#10B981' },
                                { label: 'Growth Stage', value: selectedCrop.growthStage, color: '#FBBF24' },
                                { label: 'Field Area', value: selectedCrop.area, color: '#3B82F6' },
                                { label: 'Planting Date', value: selectedCrop.plantingDate, color: '#8B5CF6' },
                                { label: 'Expected Harvest', value: selectedCrop.expectedHarvest, color: '#EC4899' },
                                { label: 'Crop Coefficient (Kc)', value: `${selectedCrop.cropCoefficient} (AI)`, color: '#10B981' }
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
                                    {irrigationRec?.isNeeded && (
                                        <div style={{ fontSize: '0.875rem', marginTop: '0.5rem', opacity: 0.95 }}>
                                            💡 Irrigation scheduled only when predicted moisture crosses stress threshold.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Footer */}
                    <div className={styles.footer}>
                        <p>🌿 Powered by GreenGuard AI • Last Updated: {currentTime.toLocaleTimeString()}</p>
                        <p>Need help? Chat with Krishi Sahayak (bottom right corner)</p>
                    </div>
                </main>
            </div>

            {/* Floating Chatbot */}
            <KrishiSahayak />

            {/* Add Field Modal */}
            {showFieldModal && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '2rem',
                        width: '90%',
                        maxWidth: '500px',
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
                    }}>
                        <h3 style={{ marginBottom: '1.5rem', color: 'var(--color-primary)' }}>Add New Field</h3>
                        <form onSubmit={handleSaveField}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Field Name *</label>
                                <input type="text" name="name" required style={{ width: '100%' }} placeholder="e.g., North Field" />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Area (hectares) *</label>
                                <input type="number" name="area" required step="0.1" style={{ width: '100%' }} placeholder="e.g., 2.5" />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Crop Type</label>
                                <select name="cropType" style={{ width: '100%' }}>
                                    <option value="">Select crop type</option>
                                    <option value="Wheat">Wheat</option>
                                    <option value="Rice">Rice</option>
                                    <option value="Corn">Corn</option>
                                    <option value="Cotton">Cotton</option>
                                    <option value="Sugarcane">Sugarcane</option>
                                </select>
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Location</label>
                                <input type="text" name="location" style={{ width: '100%' }} placeholder="e.g., Sector B" />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <button type="button" className="btn-secondary" onClick={() => setShowFieldModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    Save Field
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Crop Selector Modal */}
            {showCropSelector && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '2rem',
                        width: '90%',
                        maxWidth: '600px',
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
                    }}>
                        <h3 style={{ marginBottom: '1.5rem', color: 'var(--color-primary)' }}>Select Crop</h3>
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {cropList.map(crop => (
                                <div
                                    key={crop.id}
                                    onClick={() => handleCropChange(crop)}
                                    style={{
                                        padding: '1rem',
                                        borderRadius: '12px',
                                        border: selectedCrop.id === crop.id ? '2px solid var(--color-primary)' : '2px solid #E5E7EB',
                                        background: selectedCrop.id === crop.id ? 'var(--gradient-subtle)' : 'white',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (selectedCrop.id !== crop.id) {
                                            e.currentTarget.style.background = '#F9FAFB';
                                            e.currentTarget.style.borderColor = 'var(--color-primary-light)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (selectedCrop.id !== crop.id) {
                                            e.currentTarget.style.background = 'white';
                                            e.currentTarget.style.borderColor = '#E5E7EB';
                                        }
                                    }}
                                >
                                    <span style={{ fontSize: '2.5rem' }}>{crop.icon}</span>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.25rem' }}>
                                            {crop.name}
                                        </div>
                                        <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                                            {crop.growthStage} • {crop.area}
                                        </div>
                                    </div>
                                    {selectedCrop.id === crop.id && (
                                        <span style={{ color: 'var(--color-primary)', fontSize: '1.5rem' }}>✓</span>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
                            <button className="btn-secondary" onClick={() => setShowCropSelector(false)}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
