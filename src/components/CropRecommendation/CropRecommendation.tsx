'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../IrrigationCalculator/IrrigationCalculator.module.css';
import {
    SOIL_PROPERTY_DEFAULTS,
    getSoilProperties,
    getWaterClass,
    WaterSource,
    CropSeason,
    Topology
} from '@/lib/cropRecommendation/soilDatabase';
import {
    getCropRecommendations,
    RecommendationInput,
    type CropRecommendation
} from '@/lib/cropRecommendation/recommendationEngine';
import { fetchAndClassifyClimate, type ClimateClassification } from '@/lib/cropRecommendation/weatherClassification';
import { getFailsafeClimateData } from '@/lib/cropRecommendation/failsafeClimate';
import {
    getAvailableStates,
    getDistrictsByState
} from '@/lib/locationData';


export default function CropRecommendation() {
    // Location
    const [state, setState] = useState<string>('');
    const [district, setDistrict] = useState<string>('');

    // Soil type and properties
    const [soilType, setSoilType] = useState<string>('');
    const [pH, setPH] = useState<string>('');
    const [organicCarbon, setOrganicCarbon] = useState<string>('');
    const [nitrogen, setNitrogen] = useState<string>('');
    const [phosphorus, setPhosphorus] = useState<string>('');
    const [potassium, setPotassium] = useState<string>('');
    const [ec, setEC] = useState<string>('');

    // Other inputs
    const [waterSource, setWaterSource] = useState<string>('');
    const [season, setSeason] = useState<string>('');
    const [topology, setTopology] = useState<string>('');

    // Weather / Climate
    const [climate, setClimate] = useState<ClimateClassification | null>(null);
    const [loadingWeather, setLoadingWeather] = useState<boolean>(false);

    // Results
    const [showResults, setShowResults] = useState<boolean>(false);
    const [recommendations, setRecommendations] = useState<CropRecommendation[]>([]);

    const availableStates = getAvailableStates();
    const districtsList = state ? getDistrictsByState(state) : [];

    // Auto-fill soil properties when soil type is selected
    useEffect(() => {
        if (soilType) {
            const props = getSoilProperties(soilType);
            if (props) {
                setPH(props.pH.toString());
                setOrganicCarbon(props.organicCarbon.toString());
                setNitrogen(props.nitrogen.toString());
                setPhosphorus(props.phosphorus.toString());
                setPotassium(props.potassium.toString());
                setEC(props.ec.toString());
            }
        }
    }, [soilType]);

    // Fetch weather data when district is selected
    useEffect(() => {
        if (state && district) {
            const fetchWeather = async () => {
                setLoadingWeather(true);
                try {
                    const districtData = getDistrictsByState(state).find(d => d.name === district);
                    if (districtData) {
                        const climateData = await fetchAndClassifyClimate(districtData.latitude, districtData.longitude);

                        // If weather API failed, use failsafe agro-climate data
                        if (!climateData) {
                            const fallbackData = getFailsafeClimateData(state, season as CropSeason || 'kharif');
                            setClimate(fallbackData);
                        } else {
                            setClimate(climateData);
                        }
                    }
                } catch (error) {
                    console.error('Failed to fetch weather:', error);
                    // Use failsafe on error
                    const fallbackData = getFailsafeClimateData(state, season as CropSeason || 'kharif');
                    setClimate(fallbackData);
                } finally {
                    setLoadingWeather(false);
                }
            };
            fetchWeather();
        }
    }, [state, district, season]);

    const handleAnalyze = (e: React.FormEvent) => {
        e.preventDefault();

        // Validate inputs
        if (!state || !district || !soilType || !waterSource || !season || !topology) {
            alert('Please fill in all required fields');
            return;
        }

        if (!pH || !organicCarbon || !nitrogen || !phosphorus || !potassium || !ec) {
            alert('Please ensure all soil properties are filled');
            return;
        }

        // Prepare input
        const input: RecommendationInput = {
            pH: parseFloat(pH),
            organicCarbon: parseFloat(organicCarbon),
            nitrogen: parseFloat(nitrogen),
            phosphorus: parseFloat(phosphorus),
            potassium: parseFloat(potassium),
            ec: parseFloat(ec),
            waterClass: getWaterClass(waterSource as WaterSource),
            season: season as CropSeason,
            topology: topology as Topology,
            state: state,
            climate: climate ?? undefined
        };

        // Get recommendations
        const results = getCropRecommendations(input);
        setRecommendations(results);
        setShowResults(true);

        // Scroll to results
        setTimeout(() => {
            document.getElementById('resultsSection')?.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            });
        }, 100);
    };

    const highlySuitable = recommendations.filter(r => r.category === 'highly-suitable');
    const moderatelySuitable = recommendations.filter(r => r.category === 'moderately-suitable');
    const notRecommended = recommendations.filter(r => r.category === 'not-recommended');

    return (
        <div className={styles.calculatorContainer}>
            <Link href="/dashboard" className={styles.backButton}>
                ← Back to Dashboard
            </Link>

            <header className={styles.header}>
                <div className={styles.headerIcon}>🌾</div>
                <h1>Crop Recommendation System</h1>
                <p className={styles.subtitle}>
                    AI-powered crop selection based on soil analysis and environmental conditions
                </p>
            </header>

            <div className={styles.calculatorCard}>
                <form onSubmit={handleAnalyze} className={styles.calculatorForm}>
                    {/* LOCATION SECTION */}
                    <div className={styles.sectionHeader}>
                        <h3>📍 Location Information</h3>
                    </div>

                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label htmlFor="stateSelect" className={styles.formLabel}>
                                <span className={styles.labelIcon}>🗺️</span>
                                State *
                            </label>
                            <select
                                id="stateSelect"
                                className={styles.formInput}
                                value={state}
                                onChange={(e) => {
                                    setState(e.target.value);
                                    setDistrict('');
                                }}
                                required
                            >
                                <option value="">Select State...</option>
                                {availableStates.map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="districtSelect" className={styles.formLabel}>
                                <span className={styles.labelIcon}>📍</span>
                                District *
                            </label>
                            <select
                                id="districtSelect"
                                className={styles.formInput}
                                value={district}
                                onChange={(e) => setDistrict(e.target.value)}
                                disabled={!state}
                                required
                            >
                                <option value="">Select District...</option>
                                {districtsList.map(d => (
                                    <option key={d.name} value={d.name}>{d.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* SOIL SECTION */}
                    <div className={styles.sectionHeader} style={{ marginTop: '2rem' }}>
                        <h3>🏜️ Soil Properties</h3>
                        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
                            Select soil type to auto-fill properties (editable)
                        </p>
                    </div>

                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label htmlFor="soilTypeSelect" className={styles.formLabel}>
                                <span className={styles.labelIcon}>🌍</span>
                                Soil Type *
                            </label>
                            <select
                                id="soilTypeSelect"
                                className={styles.formInput}
                                value={soilType}
                                onChange={(e) => setSoilType(e.target.value)}
                                required
                            >
                                <option value="">Select Soil Type...</option>
                                <option value="sandy">Sandy</option>
                                <option value="loamy">Loamy</option>
                                <option value="clay">Clay</option>
                                <option value="silty">Silty</option>
                            </select>
                        </div>
                    </div>

                    {soilType && (
                        <div style={{
                            padding: '1.25rem',
                            backgroundColor: 'var(--color-surface-elevated)',
                            borderRadius: 'var(--radius-md)',
                            marginTop: '1rem'
                        }}>
                            <h4 style={{ margin: 0, marginBottom: '1rem', fontSize: '0.95rem' }}>
                                Soil Parameters (Editable)
                            </h4>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="phInput" className={styles.formLabel}>
                                        pH Level
                                    </label>
                                    <input
                                        type="number"
                                        id="phInput"
                                        className={styles.formInput}
                                        step="0.1"
                                        min="0"
                                        max="14"
                                        value={pH}
                                        onChange={(e) => setPH(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label htmlFor="ocInput" className={styles.formLabel}>
                                        Organic Carbon (%)
                                    </label>
                                    <input
                                        type="number"
                                        id="ocInput"
                                        className={styles.formInput}
                                        step="0.1"
                                        min="0"
                                        value={organicCarbon}
                                        onChange={(e) => setOrganicCarbon(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label htmlFor="nInput" className={styles.formLabel}>
                                        Nitrogen (kg/ha)
                                    </label>
                                    <input
                                        type="number"
                                        id="nInput"
                                        className={styles.formInput}
                                        step="1"
                                        min="0"
                                        value={nitrogen}
                                        onChange={(e) => setNitrogen(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="pInput" className={styles.formLabel}>
                                        Phosphorus (kg/ha)
                                    </label>
                                    <input
                                        type="number"
                                        id="pInput"
                                        className={styles.formInput}
                                        step="1"
                                        min="0"
                                        value={phosphorus}
                                        onChange={(e) => setPhosphorus(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label htmlFor="kInput" className={styles.formLabel}>
                                        Potassium (kg/ha)
                                    </label>
                                    <input
                                        type="number"
                                        id="kInput"
                                        className={styles.formInput}
                                        step="1"
                                        min="0"
                                        value={potassium}
                                        onChange={(e) => setPotassium(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label htmlFor="ecInput" className={styles.formLabel}>
                                        EC (dS/m)
                                    </label>
                                    <input
                                        type="number"
                                        id="ecInput"
                                        className={styles.formInput}
                                        step="0.1"
                                        min="0"
                                        value={ec}
                                        onChange={(e) => setEC(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* OTHER FACTORS */}
                    <div className={styles.sectionHeader} style={{ marginTop: '2rem' }}>
                        <h3>🌤️ Environmental Conditions</h3>
                    </div>

                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label htmlFor="waterSourceSelect" className={styles.formLabel}>
                                <span className={styles.labelIcon}>💧</span>
                                Water Source *
                            </label>
                            <select
                                id="waterSourceSelect"
                                className={styles.formInput}
                                value={waterSource}
                                onChange={(e) => setWaterSource(e.target.value)}
                                required
                            >
                                <option value="">Select Water Source...</option>
                                <option value="canal">Canal</option>
                                <option value="tubewell">Tubewell/Borewell</option>
                                <option value="openwell">Openwell</option>
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="seasonSelect" className={styles.formLabel}>
                                <span className={styles.labelIcon}>📅</span>
                                Crop Season *
                            </label>
                            <select
                                id="seasonSelect"
                                className={styles.formInput}
                                value={season}
                                onChange={(e) => setSeason(e.target.value)}
                                required
                            >
                                <option value="">Select Season...</option>
                                <option value="kharif">Kharif (Rainy Season)</option>
                                <option value="rabi">Rabi (Winter Season)</option>
                                <option value="zaid">Zaid (Summer Season)</option>
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="topologySelect" className={styles.formLabel}>
                                <span className={styles.labelIcon}>⛰️</span>
                                Land Topology *
                            </label>
                            <select
                                id="topologySelect"
                                className={styles.formInput}
                                value={topology}
                                onChange={(e) => setTopology(e.target.value)}
                                required
                            >
                                <option value="">Select Topology...</option>
                                <option value="flat">Flat (Water retention)</option>
                                <option value="sloppy">Sloppy (Fast drainage)</option>
                            </select>
                        </div>
                    </div>

                    <button type="submit" className={styles.calculateBtn}>
                        <span className={styles.btnIcon}>🔍</span>
                        Analyze &amp; Get Recommendations
                    </button>
                </form>
            </div>

            {/* RESULTS SECTION */}
            {showResults && (
                <div id="resultsSection" className={styles.resultsSection}>
                    <div className={styles.resultsHeader}>
                        <h2>📊 Crop Recommendations</h2>
                        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
                            Based on soil analysis, water availability, and environmental conditions
                        </p>
                    </div>

                    {/* Highly Suitable */}
                    {highlySuitable.length > 0 && (
                        <div style={{ marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>
                                🌾 Highly Recommended Crops ({highlySuitable.length})
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1rem' }}>
                                {highlySuitable.map((rec) => (
                                    <div
                                        key={rec.crop.name}
                                        style={{
                                            padding: '1.5rem',
                                            background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
                                            border: '2px solid var(--color-primary)',
                                            borderRadius: 'var(--radius-lg)'
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                                            <h4 style={{ margin: 0, fontSize: '1.25rem' }}>{rec.crop.displayName}</h4>
                                            <div style={{
                                                padding: '0.25rem 0.75rem',
                                                backgroundColor: 'var(--color-primary)',
                                                color: 'white',
                                                borderRadius: '20px',
                                                fontSize: '0.75rem',
                                                fontWeight: 600
                                            }}>
                                                {rec.suitabilityScore.toFixed(0)}%
                                            </div>
                                        </div>
                                        <div style={{ fontSize: '0.875rem', color: '#065F46' }}>
                                            <p style={{ margin: '0.5rem 0', fontWeight: 600 }}>✅ Why Recommended:</p>
                                            <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                                                {rec.reasons.slice(0, 3).map((reason, idx) => (
                                                    <li key={idx}>{reason}</li>
                                                ))}
                                            </ul>
                                            {rec.climateSuitability && (
                                                <div style={{
                                                    marginTop: '0.75rem',
                                                    padding: '0.5rem',
                                                    backgroundColor: rec.climateSuitability === 'good' ? '#D1FAE5' : rec.climateSuitability === 'moderate' ? '#FEF3C7' : '#fee2e2',
                                                    borderRadius: '6px',
                                                    fontSize: '0.8rem',
                                                    fontWeight: 600,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem'
                                                }}>
                                                    {rec.climateSuitability === 'good' && '🌤️ Climate: Excellent'}
                                                    {rec.climateSuitability === 'moderate' && '☁️ Climate: Moderate'}
                                                    {rec.climateSuitability === 'poor' && '⛈️ Climate: Poor'}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Moderately Suitable */}
                    {moderatelySuitable.length > 0 && (
                        <div style={{ marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#D97706' }}>
                                🌱 Moderately Suitable Crops ({moderatelySuitable.length})
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1rem' }}>
                                {moderatelySuitable.map((rec) => (
                                    <div
                                        key={rec.crop.name}
                                        style={{
                                            padding: '1.5rem',
                                            background: '#FFFBEB',
                                            border: '1px solid #FDE68A',
                                            borderRadius: 'var(--radius-lg)'
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                                            <h4 style={{ margin: 0, fontSize: '1.25rem' }}>{rec.crop.displayName}</h4>
                                            <div style={{
                                                padding: '0.25rem 0.75rem',
                                                backgroundColor: '#D97706',
                                                color: 'white',
                                                borderRadius: '20px',
                                                fontSize: '0.75rem',
                                                fontWeight: 600
                                            }}>
                                                {rec.suitabilityScore.toFixed(0)}%
                                            </div>
                                        </div>
                                        <div style={{ fontSize: '0.875rem', color: '#92400E' }}>
                                            {rec.issues.length > 0 && (
                                                <>
                                                    <p style={{ margin: '0.5rem 0', fontWeight: 600 }}>⚠️ Considerations:</p>
                                                    <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                                                        {rec.issues.slice(0, 2).map((issue, idx) => (
                                                            <li key={idx}>{issue}</li>
                                                        ))}
                                                    </ul>
                                                </>
                                            )}
                                            {rec.climateSuitability && (
                                                <div style={{
                                                    marginTop: '0.75rem',
                                                    padding: '0.5rem',
                                                    backgroundColor: rec.climateSuitability === 'good' ? '#D1FAE5' : rec.climateSuitability === 'moderate' ? '#FEF3C7' : '#fee2e2',
                                                    borderRadius: '6px',
                                                    fontSize: '0.8rem',
                                                    fontWeight: 600,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem'
                                                }}>
                                                    {rec.climateSuitability === 'good' && '🌤️ Climate: Excellent'}
                                                    {rec.climateSuitability === 'moderate' && '☁️ Climate: Moderate'}
                                                    {rec.climateSuitability === 'poor' && '⛈️ Climate: Poor'}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Not Recommended */}
                    {notRecommended.length > 0 && (
                        <div>
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#DC2626' }}>
                                ❌ Not Recommended ({notRecommended.length})
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1rem' }}>
                                {notRecommended.map((rec) => (
                                    <div
                                        key={rec.crop.name}
                                        style={{
                                            padding: '1.5rem',
                                            background: '#FEF2F2',
                                            border: '1px solid #FECACA',
                                            borderRadius: 'var(--radius-lg)',
                                            opacity: 0.8
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                                            <h4 style={{ margin: 0, fontSize: '1.25rem' }}>{rec.crop.displayName}</h4>
                                            <div style={{
                                                padding: '0.25rem 0.75rem',
                                                backgroundColor: '#DC2626',
                                                color: 'white',
                                                borderRadius: '20px',
                                                fontSize: '0.75rem',
                                                fontWeight: 600
                                            }}>
                                                {rec.suitabilityScore.toFixed(0)}%
                                            </div>
                                        </div>
                                        <div style={{ fontSize: '0.875rem', color: '#991B1B' }}>
                                            <p style={{ margin: '0.5rem 0', fontWeight: 600 }}>❌ Why Not Suitable:</p>
                                            <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                                                {rec.issues.slice(0, 3).map((issue, idx) => (
                                                    <li key={idx}>{issue}</li>
                                                ))}
                                            </ul>
                                            {rec.climateSuitability && (
                                                <div style={{
                                                    marginTop: '0.75rem',
                                                    padding: '0.5rem',
                                                    backgroundColor: rec.climateSuitability === 'good' ? '#D1FAE5' : rec.climateSuitability === 'moderate' ? '#FEF3C7' : '#fee2e2',
                                                    borderRadius: '6px',
                                                    fontSize: '0.8rem',
                                                    fontWeight: 600,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem'
                                                }}>
                                                    {rec.climateSuitability === 'good' && '🌤️ Climate: Excellent'}
                                                    {rec.climateSuitability === 'moderate' && '☁️ Climate: Moderate'}
                                                    {rec.climateSuitability === 'poor' && '⛈️ Climate: Poor'}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            <footer className={styles.footer}>
                <p>🌱 Science-based crop recommendations for sustainable farming</p>
            </footer>
        </div>
    );
}
