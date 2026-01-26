'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './IrrigationCalculator.module.css';

// Crop data with factors and irrigation tips
interface CropData {
    factor: number;
    tips: string;
}

const cropData: Record<string, CropData> = {
    wheat: {
        factor: 500,
        tips: `
            <strong>Best Irrigation Methods:</strong>
            <ul>
                <li><strong>Furrow Irrigation:</strong> Traditional and cost-effective for wheat fields. Water flows between rows.</li>
                <li><strong>Sprinkler Irrigation:</strong> Ideal for large areas, provides uniform water distribution.</li>
                <li><strong>Drip Irrigation:</strong> Water-efficient but less common; suitable for research farms.</li>
            </ul>
            <strong>Pro Tips:</strong>
            <ul>
                <li>Irrigate during critical growth stages: crown root initiation, tillering, flowering, and grain filling.</li>
                <li>Avoid over-irrigation to prevent waterlogging and root diseases.</li>
                <li>Monitor soil moisture regularly for optimal results.</li>
            </ul>
        `
    },
    maize: {
        factor: 600,
        tips: `
            <strong>Best Irrigation Methods:</strong>
            <ul>
                <li><strong>Drip Irrigation:</strong> Most efficient for maize, reduces water waste and improves yield.</li>
                <li><strong>Sprinkler Irrigation:</strong> Good alternative for uniform coverage across large fields.</li>
                <li><strong>Furrow Irrigation:</strong> Suitable for traditional farming but less water-efficient.</li>
            </ul>
            <strong>Pro Tips:</strong>
            <ul>
                <li>Critical water requirement periods: vegetative growth (V6-V8 stage) and reproductive phase (tasseling to grain filling).</li>
                <li>Ensure consistent moisture during silking for maximum kernel development.</li>
                <li>Mulching helps retain soil moisture in drip systems.</li>
            </ul>
        `
    },
    rice: {
        factor: 700,
        tips: `
            <strong>Best Irrigation Methods:</strong>
            <ul>
                <li><strong>Continuous Flooding:</strong> Traditional method for lowland rice, maintains standing water throughout growth.</li>
                <li><strong>Alternate Wetting and Drying (AWD):</strong> Water-saving technique that reduces water use by 15-30%.</li>
                <li><strong>Sprinkler/Drip:</strong> Used for upland rice varieties in water-scarce regions.</li>
            </ul>
            <strong>Pro Tips:</strong>
            <ul>
                <li>Maintain 5-10 cm standing water during vegetative and reproductive stages.</li>
                <li>AWD can save water without compromising yield if managed properly.</li>
                <li>Drain fields 2-3 weeks before harvest for easier harvesting.</li>
            </ul>
        `
    },
    potato: {
        factor: 550,
        tips: `
            <strong>Best Irrigation Methods:</strong>
            <ul>
                <li><strong>Drip Irrigation:</strong> Highly recommended for potatoes, reduces tuber diseases and optimizes water use.</li>
                <li><strong>Sprinkler Irrigation:</strong> Effective for uniform moisture distribution.</li>
                <li><strong>Furrow Irrigation:</strong> Can be used but may lead to uneven moisture and disease issues.</li>
            </ul>
            <strong>Pro Tips:</strong>
            <ul>
                <li>Maintain consistent soil moisture—fluctuations cause growth cracks and irregular tuber shapes.</li>
                <li>Critical irrigation periods: tuber initiation and bulking stages.</li>
                <li>Reduce irrigation 2 weeks before harvest to improve skin set and storage quality.</li>
            </ul>
        `
    },
    tomato: {
        factor: 580,
        tips: `
            <strong>Best Irrigation Methods:</strong>
            <ul>
                <li><strong>Drip Irrigation:</strong> Best choice for tomatoes, minimizes foliar diseases and optimizes water delivery.</li>
                <li><strong>Mulched Drip:</strong> Combines drip with plastic mulch for superior moisture retention and weed control.</li>
                <li><strong>Sprinkler (with caution):</strong> Can promote fungal diseases if leaves stay wet.</li>
            </ul>
            <strong>Pro Tips:</strong>
            <ul>
                <li>Keep soil consistently moist but not waterlogged to prevent blossom-end rot and fruit cracking.</li>
                <li>Irrigate early morning to minimize disease pressure.</li>
                <li>Reduce irrigation slightly during fruit ripening to enhance flavor concentration.</li>
            </ul>
        `
    },
    cotton: {
        factor: 620,
        tips: `
            <strong>Best Irrigation Methods:</strong>
            <ul>
                <li><strong>Drip Irrigation:</strong> Increasingly popular for cotton, saves water and improves fiber quality.</li>
                <li><strong>Furrow Irrigation:</strong> Traditional and widely used for cotton in many regions.</li>
                <li><strong>Center Pivot Sprinkler:</strong> Effective for large-scale cotton farming.</li>
            </ul>
            <strong>Pro Tips:</strong>
            <ul>
                <li>Critical irrigation stages: squaring, flowering, and boll development.</li>
                <li>Stop irrigation 2-3 weeks before harvest to improve fiber quality and facilitate defoliation.</li>
                <li>Monitor soil moisture using sensors for precision irrigation timing.</li>
            </ul>
        `
    }
};

export default function IrrigationCalculator() {
    const [crop, setCrop] = useState<string>('');
    const [area, setArea] = useState<string>('');
    const [temperature, setTemperature] = useState<string>('');
    const [showResults, setShowResults] = useState<boolean>(false);
    const [waterRequirement, setWaterRequirement] = useState<number>(0);
    const [irrigationInterval, setIrrigationInterval] = useState<number>(0);
    const [currentTips, setCurrentTips] = useState<string>('');

    useEffect(() => {
        console.log('Calculator Loaded');
    }, []);

    // Update tips when crop selection changes
    useEffect(() => {
        if (crop && cropData[crop]) {
            setCurrentTips(cropData[crop].tips);
        } else {
            setCurrentTips('<p style="color: var(--color-text-muted);">Select a crop to see irrigation tips.</p>');
        }
    }, [crop]);

    const handleCalculate = (e: React.FormEvent) => {
        e.preventDefault();

        // Validate inputs
        if (!crop || !area || !temperature) {
            alert('Please fill in all fields');
            return;
        }

        const areaNum = parseFloat(area);
        const tempNum = parseFloat(temperature);

        if (areaNum <= 0) {
            alert('Area must be greater than 0');
            return;
        }

        if (tempNum < -10 || tempNum > 50) {
            alert('Temperature should be between -10°C and 50°C');
            return;
        }

        // Get crop factor
        const cropFactor = cropData[crop].factor;

        // Calculate daily water requirement (liters/day)
        const dailyWaterReq = areaNum * tempNum * cropFactor;

        // Calculate irrigation interval (days)
        const interval = Math.round(1000 / (tempNum * 0.1 + 1));

        // Update state with results
        setWaterRequirement(dailyWaterReq);
        setIrrigationInterval(interval);
        setShowResults(true);

        // Scroll to results smoothly
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
                <h1>Irrigation Scheduler & Water Requirement Calculator</h1>
                <p className={styles.subtitle}>Optimize your crop irrigation with data-driven insights</p>
            </header>

            <div className={styles.calculatorCard}>
                <form onSubmit={handleCalculate} className={styles.calculatorForm}>
                    <div className={styles.formGroup}>
                        <label htmlFor="cropSelect" className={styles.formLabel}>
                            <span className={styles.labelIcon}>🌾</span>
                            Select Crop
                        </label>
                        <select
                            id="cropSelect"
                            className={styles.formInput}
                            value={crop}
                            onChange={(e) => setCrop(e.target.value)}
                            required
                        >
                            <option value="">Choose a crop...</option>
                            <option value="wheat">Wheat</option>
                            <option value="maize">Maize</option>
                            <option value="rice">Rice</option>
                            <option value="potato">Potato</option>
                            <option value="tomato">Tomato</option>
                            <option value="cotton">Cotton</option>
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="areaInput" className={styles.formLabel}>
                            <span className={styles.labelIcon}>📐</span>
                            Cultivated Area (Hectares)
                        </label>
                        <input
                            type="number"
                            id="areaInput"
                            className={styles.formInput}
                            placeholder="Enter area in hectares"
                            min="0.1"
                            step="0.1"
                            value={area}
                            onChange={(e) => setArea(e.target.value)}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="temperatureInput" className={styles.formLabel}>
                            <span className={styles.labelIcon}>🌡️</span>
                            Mean Daily Temperature (°C)
                        </label>
                        <input
                            type="number"
                            id="temperatureInput"
                            className={styles.formInput}
                            placeholder="Enter temperature in celsius"
                            min="-10"
                            max="50"
                            step="0.1"
                            value={temperature}
                            onChange={(e) => setTemperature(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" id="calculateBtn" className={styles.calculateBtn}>
                        <span className={styles.btnIcon}>⚡</span>
                        Calculate Water Need
                    </button>
                </form>
            </div>

            {showResults && (
                <div id="resultsSection" className={styles.resultsSection}>
                    <div className={styles.resultsHeader}>
                        <h2>📊 Calculation Results</h2>
                    </div>

                    <div className={styles.resultsGrid}>
                        <div className={styles.resultCard}>
                            <div className={styles.resultIcon}>💧</div>
                            <div className={styles.resultContent}>
                                <p className={styles.resultLabel}>Daily Water Requirement</p>
                                <p className={styles.resultValue}>
                                    {waterRequirement.toLocaleString('en-US', { maximumFractionDigits: 0 })} L/day
                                </p>
                            </div>
                        </div>

                        <div className={styles.resultCard}>
                            <div className={styles.resultIcon}>📅</div>
                            <div className={styles.resultContent}>
                                <p className={styles.resultLabel}>Recommended Irrigation Interval</p>
                                <p className={styles.resultValue}>
                                    {irrigationInterval} {irrigationInterval === 1 ? 'day' : 'days'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className={styles.tipsSection}>
                        <h3 className={styles.tipsHeader}>💡 Irrigation Method Tips</h3>
                        <div
                            className={styles.tipsContent}
                            dangerouslySetInnerHTML={{ __html: currentTips }}
                        />
                    </div>
                </div>
            )}

            <footer className={styles.footer}>
                <p>🌱 Sustainable farming through smart irrigation</p>
            </footer>
        </div>
    );
}
