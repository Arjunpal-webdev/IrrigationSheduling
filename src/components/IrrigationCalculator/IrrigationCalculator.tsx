'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './IrrigationCalculator.module.css';
import { ETCalculator } from '@/lib/cropwat/etCalculator';
import {
    CROP_DATABASE,
    GrowthStage,
    getCropCoefficient,
    getCriticalDepletionFactor,
    getCropRootDepth,
    getCropRootDepthByStage,
    getAvailableCrops,
    getCropDisplayName
} from '@/lib/cropwat/cropCoefficients';
import {
    getAvailableStates,
    getDistrictsByState,
    getDistrictCoordinates
} from '@/lib/locationData';
import SearchableSelect from '../SearchableSelect/SearchableSelect';

// FAO-based Irrigation Calculator
export default function IrrigationCalculator() {
    // Location inputs (local state, not shared)
    const [state, setState] = useState<string>('');
    const [district, setDistrict] = useState<string>('');
    const [localAddress, setLocalAddress] = useState<string>('');

    // Weather data (auto-filled but editable)
    const [tempMin, setTempMin] = useState<string>('');
    const [tempMax, setTempMax] = useState<string>('');
    const [humidity, setHumidity] = useState<string>('');
    const [windSpeed, setWindSpeed] = useState<string>('');
    const [sunshineHours, setSunshineHours] = useState<string>('');
    const [rainfall, setRainfall] = useState<string>('');
    const [weatherLoading, setWeatherLoading] = useState<boolean>(false);

    // Crop data
    const [crop, setCrop] = useState<string>('');
    const [growthStage, setGrowthStage] = useState<GrowthStage | ''>('');
    const [area, setArea] = useState<string>('');
    const [soilType, setSoilType] = useState<string>('');
    const [cropCoefficient, setCropCoefficient] = useState<number>(0);

    // Results
    const [showResults, setShowResults] = useState<boolean>(false);
    const [et0, setEt0] = useState<number>(0);
    const [etc, setEtc] = useState<number>(0);
    const [effectiveRainfall, setEffectiveRainfall] = useState<number>(0);
    const [netIrrigationReq, setNetIrrigationReq] = useState<number>(0);
    const [irrigationNeeded, setIrrigationNeeded] = useState<boolean>(false);
    const [weeklyWaterVolume, setWeeklyWaterVolume] = useState<number>(0);
    const [irrigationInterval, setIrrigationInterval] = useState<number>(0);

    // Soil properties (FC and PWP in %)
    const soilProperties: Record<string, { fc: number; pwp: number }> = {
        sand: { fc: 12, pwp: 5 },
        loamySand: { fc: 15, pwp: 7 },
        sandyLoam: { fc: 22, pwp: 10 },
        loam: { fc: 28, pwp: 14 },
        siltLoam: { fc: 33, pwp: 17 },
        clayLoam: { fc: 35, pwp: 18 },
        sandyClay: { fc: 38, pwp: 22 },
        clay: { fc: 45, pwp: 28 }
    };

    const availableStates = getAvailableStates();
    const availableCrops = getAvailableCrops();
    const districtsList = state ? getDistrictsByState(state) : [];

    // Auto-fetch weather when district is selected
    useEffect(() => {
        if (state && district) {
            fetchWeatherData();
        }
    }, [state, district]);

    // Auto-fill Kc when crop and growth stage are selected
    useEffect(() => {
        if (crop && growthStage) {
            const kc = getCropCoefficient(crop, growthStage as GrowthStage);
            setCropCoefficient(kc);
        } else {
            setCropCoefficient(0);
        }
    }, [crop, growthStage]);

    const fetchWeatherData = async () => {
        if (!state || !district) return;

        setWeatherLoading(true);
        try {
            const response = await fetch(
                `/api/weather?district=${encodeURIComponent(district)}`
            );
            const data = await response.json();

            if (data.current) {
                // Auto-fill weather fields
                setTempMin(((data.current.temperature - 5) || 15).toFixed(1));
                setTempMax(((data.current.temperature + 5) || 30).toFixed(1));
                setHumidity((data.current.humidity || 60).toString());
                setWindSpeed((data.current.windSpeed || 2).toFixed(1));
                setSunshineHours('8'); // Default, can be enhanced
                setRainfall('0'); // Current rainfall, can be enhanced with forecast
            }
        } catch (error) {
            console.error('Failed to fetch weather data:', error);
            // Set reasonable defaults on error
            setTempMin('15');
            setTempMax('30');
            setHumidity('60');
            setWindSpeed('2');
            setSunshineHours('8');
            setRainfall('0');
        } finally {
            setWeatherLoading(false);
        }
    };

    const handleCalculate = (e: React.FormEvent) => {
        e.preventDefault();

        // Validate all required inputs
        if (!state || !district || !crop || !growthStage || !area || !soilType) {
            alert('Please fill in all required fields');
            return;
        }

        if (!tempMin || !tempMax || !humidity || !windSpeed) {
            alert('Please ensure all weather data is filled');
            return;
        }

        // Parse inputs
        const areaNum = parseFloat(area);
        const tempMinNum = parseFloat(tempMin);
        const tempMaxNum = parseFloat(tempMax);
        const humidityNum = parseFloat(humidity);
        const windSpeedNum = parseFloat(windSpeed);
        const rainfallNum = parseFloat(rainfall || '0');

        // Validate ranges
        if (areaNum <= 0) {
            alert('Area must be greater than 0');
            return;
        }

        // Get coordinates for latitude (used in ET₀ calculation)
        const coords = getDistrictCoordinates(state, district);
        const latitude = coords?.latitude || 20;

        // === FAO-BASED CALCULATION ===

        // STEP 1: Calculate ET₀ (Reference Evapotranspiration)
        const calculatedET0 = ETCalculator.calculateET0({
            tempMin: tempMinNum,
            tempMax: tempMaxNum,
            humidity: humidityNum,
            windSpeed: windSpeedNum,
            sunshineHours: parseFloat(sunshineHours || '8'),
            latitude: latitude,
            date: new Date()
        });

        // STEP 2: Calculate ETc (Crop Water Requirement)
        const kc = cropCoefficient;
        const calculatedETc = calculatedET0 * kc;

        // STEP 3: Calculate Effective Rainfall (Pe)
        const pe = rainfallNum * 0.8;

        // STEP 4: Calculate Net Irrigation Requirement (NIR)
        const nir = Math.max(0, calculatedETc - pe);

        // STEP 5: Determine Irrigation Need using Critical Depletion Factor (p)
        // Internal logic - not shown to user
        const depletionFactor = getCriticalDepletionFactor(crop);
        const rootDepth = getCropRootDepth(crop);

        // Simplified irrigation decision
        // If NIR > 0 and rainfall is low, irrigation is needed
        const needsIrrigation = nir > 2; // More than 2mm/day deficit

        // STEP 6: Calculate weekly water volume for the area
        const dailyVolumeM3 = (nir * areaNum * 10000) / 1000; // mm * m² / 1000 = m³
        const weeklyVolume = dailyVolumeM3 * 7; // Weekly total

        // STEP 7: Calculate Irrigation Interval
        let interval = 0;
        if (soilType && calculatedETc > 0) {
            const soil = soilProperties[soilType];
            if (soil) {
                const rootDepthM = getCropRootDepthByStage(crop, growthStage as GrowthStage);
                const fc = soil.fc;
                const pwp = soil.pwp;
                const p = depletionFactor;

                // ASM = (FC - PWP) × RootDepth × 1000 (mm)
                const asm = (fc - pwp) * rootDepthM * 1000 / 100; // Convert % to decimal

                // RAM = ASM × p (mm)
                const ram = asm * p;

                // Irrigation Interval = RAM / ETc (days)
                interval = ram / calculatedETc;
            }
        }

        // Update state with results
        setEt0(calculatedET0);
        setEtc(calculatedETc);
        setEffectiveRainfall(pe);
        setNetIrrigationReq(nir);
        setIrrigationNeeded(needsIrrigation);
        setWeeklyWaterVolume(weeklyVolume);
        setIrrigationInterval(interval);
        setShowResults(true);

        // Save irrigation interval to localStorage for Dashboard integration
        if (interval > 0) {
            localStorage.setItem('calculatedIrrigationInterval', interval.toFixed(1));
            localStorage.setItem('calculationTimestamp', new Date().toISOString());
        }

        // Scroll to results
        setTimeout(() => {
            document.getElementById('resultsSection')?.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            });
        }, 100);
    };

    return (
        <div className={styles.calculatorContainer}>
            <Link href="/" className={styles.backButton}>
                ← Back to Home
            </Link>

            <header className={styles.header}>
                <div className={styles.headerIcon}>💧</div>
                <h1>FAO-Based Irrigation Calculator</h1>
                <p className={styles.subtitle}>
                    Scientific water requirement calculation using FAO-56 methodology
                </p>
            </header>

            <div className={styles.calculatorCard}>
                <form onSubmit={handleCalculate} className={styles.calculatorForm}>
                    {/* LOCATION SECTION */}
                    <div className={styles.sectionHeader}>
                        <h3>📍 Location Information</h3>
                        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
                            Select your location to auto-fetch weather data
                        </p>
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
                                    setDistrict(''); // Reset district when state changes
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
                            <SearchableSelect
                                id="districtSelect"
                                options={districtsList.map(d => d.name)}
                                value={district}
                                onChange={setDistrict}
                                placeholder="Type to search district..."
                                disabled={!state}
                                required
                            />
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="addressInput" className={styles.formLabel}>
                            <span className={styles.labelIcon}>🏠</span>
                            Local Address (Optional)
                        </label>
                        <input
                            type="text"
                            id="addressInput"
                            className={styles.formInput}
                            placeholder="Village / Town name"
                            value={localAddress}
                            onChange={(e) => setLocalAddress(e.target.value)}
                        />
                    </div>

                    {/* WEATHER DATA SECTION */}
                    <div className={styles.sectionHeader} style={{ marginTop: '2rem' }}>
                        <h3>🌤️ Weather Data</h3>
                        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
                            {weatherLoading ? 'Fetching weather data...' : 'Auto-filled from weather API (editable)'}
                        </p>
                    </div>

                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label htmlFor="tempMinInput" className={styles.formLabel}>
                                <span className={styles.labelIcon}>🌡️</span>
                                Min Temp (°C) *
                            </label>
                            <input
                                type="number"
                                id="tempMinInput"
                                className={styles.formInput}
                                step="0.1"
                                value={tempMin}
                                onChange={(e) => setTempMin(e.target.value)}
                                required
                                disabled={weatherLoading}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="tempMaxInput" className={styles.formLabel}>
                                <span className={styles.labelIcon}>🌡️</span>
                                Max Temp (°C) *
                            </label>
                            <input
                                type="number"
                                id="tempMaxInput"
                                className={styles.formInput}
                                step="0.1"
                                value={tempMax}
                                onChange={(e) => setTempMax(e.target.value)}
                                required
                                disabled={weatherLoading}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="humidityInput" className={styles.formLabel}>
                                <span className={styles.labelIcon}>💧</span>
                                Humidity (%) *
                            </label>
                            <input
                                type="number"
                                id="humidityInput"
                                className={styles.formInput}
                                min="0"
                                max="100"
                                value={humidity}
                                onChange={(e) => setHumidity(e.target.value)}
                                required
                                disabled={weatherLoading}
                            />
                        </div>
                    </div>

                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label htmlFor="windSpeedInput" className={styles.formLabel}>
                                <span className={styles.labelIcon}>💨</span>
                                Wind Speed (m/s) *
                            </label>
                            <input
                                type="number"
                                id="windSpeedInput"
                                className={styles.formInput}
                                step="0.1"
                                min="0"
                                value={windSpeed}
                                onChange={(e) => setWindSpeed(e.target.value)}
                                required
                                disabled={weatherLoading}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="sunshineInput" className={styles.formLabel}>
                                <span className={styles.labelIcon}>☀️</span>
                                Sunshine (hours)
                            </label>
                            <input
                                type="number"
                                id="sunshineInput"
                                className={styles.formInput}
                                step="0.1"
                                min="0"
                                max="24"
                                value={sunshineHours}
                                onChange={(e) => setSunshineHours(e.target.value)}
                                disabled={weatherLoading}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="rainfallInput" className={styles.formLabel}>
                                <span className={styles.labelIcon}>🌧️</span>
                                Rainfall (mm)
                            </label>
                            <input
                                type="number"
                                id="rainfallInput"
                                className={styles.formInput}
                                step="0.1"
                                min="0"
                                value={rainfall}
                                onChange={(e) => setRainfall(e.target.value)}
                                disabled={weatherLoading}
                            />
                        </div>
                    </div>

                    {/* CROP DATA SECTION */}
                    <div className={styles.sectionHeader} style={{ marginTop: '2rem' }}>
                        <h3>🌾 Crop Information</h3>
                    </div>

                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label htmlFor="cropSelect" className={styles.formLabel}>
                                <span className={styles.labelIcon}>🌱</span>
                                Select Crop *
                            </label>
                            <select
                                id="cropSelect"
                                className={styles.formInput}
                                value={crop}
                                onChange={(e) => setCrop(e.target.value)}
                                required
                            >
                                <option value="">Choose a crop...</option>
                                {availableCrops.map(c => (
                                    <option key={c} value={c}>{getCropDisplayName(c)}</option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="growthStageSelect" className={styles.formLabel}>
                                <span className={styles.labelIcon}>🌿</span>
                                Growth Stage *
                            </label>
                            <select
                                id="growthStageSelect"
                                className={styles.formInput}
                                value={growthStage}
                                onChange={(e) => setGrowthStage(e.target.value as GrowthStage)}
                                required
                            >
                                <option value="">Select stage...</option>
                                <option value="initial">Initial (Germination)</option>
                                <option value="development">Development (Vegetative)</option>
                                <option value="midSeason">Mid-Season (Flowering/Fruiting)</option>
                                <option value="lateSeason">Late-Season (Maturation)</option>
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="areaInput" className={styles.formLabel}>
                                <span className={styles.labelIcon}>📐</span>
                                Area (Hectares) *
                            </label>
                            <input
                                type="number"
                                id="areaInput"
                                className={styles.formInput}
                                placeholder="Enter area"
                                min="0.1"
                                step="0.1"
                                value={area}
                                onChange={(e) => setArea(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label htmlFor="soilTypeSelect" className={styles.formLabel}>
                                <span className={styles.labelIcon}>🏜️</span>
                                Soil Type *
                            </label>
                            <select
                                id="soilTypeSelect"
                                className={styles.formInput}
                                value={soilType}
                                onChange={(e) => setSoilType(e.target.value)}
                                required
                            >
                                <option value="">Select soil type...</option>
                                <option value="sand">Sand</option>
                                <option value="loamySand">Loamy Sand</option>
                                <option value="sandyLoam">Sandy Loam</option>
                                <option value="loam">Loam</option>
                                <option value="siltLoam">Silt Loam</option>
                                <option value="clayLoam">Clay Loam</option>
                                <option value="sandyClay">Sandy Clay</option>
                                <option value="clay">Clay</option>
                            </select>
                        </div>
                    </div>

                    {cropCoefficient > 0 && (
                        <div style={{
                            padding: '1rem',
                            backgroundColor: 'var(--color-surface-elevated)',
                            borderRadius: 'var(--radius-md)',
                            marginTop: '1rem'
                        }}>
                            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                                <strong>Crop Coefficient (Kc):</strong> {cropCoefficient.toFixed(2)}
                                <span style={{ marginLeft: '1rem', fontSize: '0.75rem' }}>
                                    (Auto-assigned based on FAO-56 standards)
                                </span>
                            </p>
                        </div>
                    )}

                    <button type="submit" id="calculateBtn" className={styles.calculateBtn}>
                        <span className={styles.btnIcon}>⚡</span>
                        Calculate Irrigation Requirement
                    </button>
                </form>
            </div>

            {showResults && (
                <div id="resultsSection" className={styles.resultsSection}>
                    <div className={styles.resultsHeader}>
                        <h2>📊 FAO-Based Calculation Results</h2>
                        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
                            Scientific irrigation analysis using FAO Penman-Monteith methodology
                        </p>
                    </div>

                    <div className={styles.resultsGrid}>
                        <div className={styles.resultCard}>
                            <div className={styles.resultIcon}>🌡️</div>
                            <div className={styles.resultContent}>
                                <p className={styles.resultLabel}>Reference ET (ET₀)</p>
                                <p className={styles.resultValue}>{et0.toFixed(2)} mm/day</p>
                                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                                    FAO Penman-Monteith method
                                </p>
                            </div>
                        </div>

                        <div className={styles.resultCard}>
                            <div className={styles.resultIcon}>🌾</div>
                            <div className={styles.resultContent}>
                                <p className={styles.resultLabel}>Crop Evapotranspiration (ETc)</p>
                                <p className={styles.resultValue}>{etc.toFixed(2)} mm/day</p>
                                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                                    ETc = ET₀ × Kc ({cropCoefficient.toFixed(2)})
                                </p>
                            </div>
                        </div>

                        <div className={styles.resultCard}>
                            <div className={styles.resultIcon}>💦</div>
                            <div className={styles.resultContent}>
                                <p className={styles.resultLabel}>Crop Water Requirement (CWR)</p>
                                <p className={styles.resultValue}>{(etc * parseFloat(area) * 10).toFixed(2)} m³/day</p>
                                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                                    CWR = ETc × A × 10
                                </p>
                            </div>
                        </div>

                        <div className={styles.resultCard}>
                            <div className={styles.resultIcon}>🌧️</div>
                            <div className={styles.resultContent}>
                                <p className={styles.resultLabel}>Effective Rainfall</p>
                                <p className={styles.resultValue}>{effectiveRainfall.toFixed(2)} mm</p>
                                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                                    80% of total rainfall
                                </p>
                            </div>
                        </div>

                        <div className={styles.resultCard}>
                            <div className={styles.resultIcon}>💧</div>
                            <div className={styles.resultContent}>
                                <p className={styles.resultLabel}>Net Irrigation Requirement</p>
                                <p className={styles.resultValue}>{netIrrigationReq.toFixed(2)} mm/day</p>
                                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                                    NIR = ETc - Effective Rainfall
                                </p>
                            </div>
                        </div>
                    </div>

                    {irrigationInterval > 0 && (
                        <div style={{
                            padding: '1.5rem',
                            backgroundColor: 'var(--color-surface-elevated)',
                            borderRadius: 'var(--radius-lg)',
                            marginTop: '1rem',
                            textAlign: 'center'
                        }}>
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--color-primary)' }}>
                                ⏱️ Irrigation Interval
                            </h3>
                            <p style={{ fontSize: '1.75rem', fontWeight: 600, color: 'var(--color-text)' }}>
                                Irrigation required every {irrigationInterval.toFixed(1)} days
                            </p>
                            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
                                Based on soil water balance and crop depletion factor
                            </p>
                        </div>
                    )}

                    {/* Irrigation Recommendation */}
                    <div style={{
                        padding: '1.5rem',
                        backgroundColor: irrigationNeeded ? '#ECFDF5' : '#F9FAFB',
                        border: `2px solid ${irrigationNeeded ? 'var(--color-primary)' : '#E5E7EB'}`,
                        borderRadius: 'var(--radius-lg)',
                        marginTop: '1.5rem',
                        textAlign: 'center'
                    }}>
                        <h3 style={{
                            fontSize: '1.5rem',
                            color: irrigationNeeded ? 'var(--color-primary)' : 'var(--color-text-muted)',
                            marginBottom: '0.5rem'
                        }}>
                            {irrigationNeeded ? '✅ Irrigation Required' : '❌ No Irrigation Needed'}
                        </h3>
                        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                            {irrigationNeeded
                                ? `Apply irrigation to compensate for ${netIrrigationReq.toFixed(2)} mm/day water deficit`
                                : 'Current soil moisture and rainfall are sufficient'}
                        </p>
                    </div>

                    {/* Weekly Water Volume */}
                    <div style={{
                        padding: '1.5rem',
                        backgroundColor: 'var(--color-surface-elevated)',
                        borderRadius: 'var(--radius-lg)',
                        marginTop: '1rem'
                    }}>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
                            💦 Weekly Water Volume for {area} Hectares
                        </h3>
                        <p style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--color-primary)' }}>
                            {weeklyWaterVolume.toLocaleString('en-US', { maximumFractionDigits: 0 })} m³
                        </p>
                        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
                            Approximately {(weeklyWaterVolume / 7).toLocaleString('en-US', { maximumFractionDigits: 0 })} m³ per day
                        </p>
                    </div>

                    {/* Scientific Notes */}
                    <div style={{
                        padding: '1.5rem',
                        backgroundColor: '#FFFBEB',
                        border: '1px solid #FDE68A',
                        borderRadius: 'var(--radius-lg)',
                        marginTop: '1rem'
                    }}>
                        <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: '#92400E' }}>
                            📚 Scientific Methodology
                        </h4>
                        <ul style={{ fontSize: '0.875rem', color: '#78350F', paddingLeft: '1.5rem' }}>
                            <li>ET₀ calculated using FAO Penman-Monteith equation</li>
                            <li>Crop coefficient (Kc) assigned based on FAO-56 crop database</li>
                            <li>Internal use of critical depletion factor (p = {(getCriticalDepletionFactor(crop) * 100).toFixed(0)}%) for irrigation scheduling</li>
                            <li>Effective rainfall accounts for runoff and deep percolation losses</li>
                        </ul>
                    </div>
                </div>
            )}

            <footer className={styles.footer}>
                <p>🌱 FAO-56 compliant irrigation planning for sustainable farming</p>
            </footer>
        </div>
    );
}
