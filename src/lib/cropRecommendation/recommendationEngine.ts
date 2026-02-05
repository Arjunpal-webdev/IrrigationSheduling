/**
 * Crop Recommendation Engine
 * Rule-based matching system for crop suitability
 */

import { CROP_SUITABILITY_DATABASE, CropRequirements, getClimateZone, TempZone, RainZone } from './cropSuitability';
import { WaterClass, CropSeason, Topology } from './soilDatabase';
import { ClimateClassification } from './weatherClassification';

export interface RecommendationInput {
    // Soil properties
    pH: number;
    organicCarbon: number;
    nitrogen: number;
    phosphorus: number;
    potassium: number;
    ec: number;
    // Other factors
    waterClass: WaterClass;
    season: CropSeason;
    topology: Topology;
    state: string;
    // Weather data (optional)
    climate?: ClimateClassification;
}

export interface CropRecommendation {
    crop: CropRequirements;
    suitabilityScore: number; // 0-100
    category: 'highly-suitable' | 'moderately-suitable' | 'not-recommended';
    reasons: string[];
    issues: string[];
    climateSuitability?: 'good' | 'moderate' | 'poor';
}

/**
 * Calculate suitability score for a crop based on input conditions
 */
function calculateSuitability(crop: CropRequirements, input: RecommendationInput): {
    score: number;
    reasons: string[];
    issues: string[];
    climateSuitability?: 'good' | 'moderate' | 'poor';
} {
    let score = 100;
    const reasons: string[] = [];
    const issues: string[] = [];

    const climateZone = getClimateZone(input.state, input.season);

    // Check pH range
    if (input.pH < crop.pHRange[0] || input.pH > crop.pHRange[1]) {
        score -= 25;
        issues.push(`pH ${input.pH} outside optimal range ${crop.pHRange[0]}-${crop.pHRange[1]}`);
    } else {
        reasons.push(`Ideal pH range (${crop.pHRange[0]}-${crop.pHRange[1]})`);
    }

    // Check nitrogen
    if (input.nitrogen < crop.minNitrogen) {
        const deficit = ((crop.minNitrogen - input.nitrogen) / crop.minNitrogen) * 100;
        score -= Math.min(deficit, 20);
        issues.push(`Low nitrogen: ${input.nitrogen} kg/ha (needs ${crop.minNitrogen}+)`);
    } else {
        reasons.push('Adequate nitrogen levels');
    }

    // Check phosphorus
    if (input.phosphorus < crop.minPhosphorus) {
        const deficit = ((crop.minPhosphorus - input.phosphorus) / crop.minPhosphorus) * 100;
        score -= Math.min(deficit, 15);
        issues.push(`Low phosphorus: ${input.phosphorus} kg/ha (needs ${crop.minPhosphorus}+)`);
    } else {
        reasons.push('Adequate phosphorus levels');
    }

    // Check potassium
    if (input.potassium < crop.minPotassium) {
        const deficit = ((crop.minPotassium - input.potassium) / crop.minPotassium) * 100;
        score -= Math.min(deficit, 15);
        issues.push(`Low potassium: ${input.potassium} kg/ha (needs ${crop.minPotassium}+)`);
    } else {
        reasons.push('Adequate potassium levels');
    }

    // Check EC (salinity)
    if (input.ec > crop.maxEC) {
        score -= 20;
        issues.push(`High salinity: ${input.ec} dS/m (max ${crop.maxEC})`);
    } else {
        reasons.push('Acceptable salinity levels');
    }

    // Check organic carbon
    if (input.organicCarbon < crop.minOrganicCarbon) {
        score -= 10;
        issues.push(`Low organic matter: ${input.organicCarbon}% (needs ${crop.minOrganicCarbon}%+)`);
    } else {
        reasons.push('Good organic matter content');
    }

    // Check water availability
    if (!crop.waterRequirement.includes(input.waterClass)) {
        score -= 20;
        issues.push(`Water availability mismatch (needs ${crop.waterRequirement.join(' or ')})`);
    } else {
        reasons.push(`Suitable water availability (${input.waterClass})`);
    }

    // Check season
    if (!crop.suitableSeasons.includes(input.season)) {
        score -= 25;
        issues.push(`Wrong season (suitable: ${crop.suitableSeasons.join(', ')})`);
    } else {
        reasons.push(`Correct season (${input.season})`);
    }

    // Check topology
    if (!crop.preferredTopology.includes(input.topology)) {
        score -= 10;
        issues.push(`Topology not ideal (prefers ${crop.preferredTopology.join(' or ')})`);
    } else {
        reasons.push(`Suitable topology (${input.topology})`);
    }

    // Check climate zone (legacy fallback)
    if (!crop.climateZones.includes(climateZone)) {
        score -= 15;
        issues.push(`Climate zone mismatch (needs ${crop.climateZones.join(' or ')} climate)`);
    } else {
        reasons.push(`Compatible climate zone (${climateZone})`);
    }

    // Check weather-based climate (if available) - 25% weight
    let climateSuitability: 'good' | 'moderate' | 'poor' | undefined;
    if (input.climate) {
        const { tempZone, rainZone } = input.climate;

        // Temperature match
        const tempMatch = crop.preferredTempZone.includes(tempZone);

        // Rainfall match
        const rainMatch = crop.preferredRainZone.includes(rainZone);

        if (tempMatch && rainMatch) {
            // Perfect climate match
            climateSuitability = 'good';
            reasons.push(`Excellent climate (${tempZone}, ${rainZone} rainfall)`);
        } else if (tempMatch || rainMatch) {
            // Partial match
            climateSuitability = 'moderate';
            score -= 10;
            if (!tempMatch) {
                issues.push(`Temperature not ideal (${tempZone}, prefers ${crop.preferredTempZone.join('/')})`);
            }
            if (!rainMatch) {
                issues.push(`Rainfall not ideal (${rainZone}, prefers ${crop.preferredRainZone.join('/')})`);
            }
        } else {
            // No match
            climateSuitability = 'poor';
            score -= 25;
            issues.push(`Climate unsuitable (${tempZone} temp, ${rainZone} rainfall)`);
        }
    }

    return {
        score: Math.max(0, Math.min(100, score)),
        reasons,
        issues,
        climateSuitability
    };
}

/**
 * Get crop recommendations based on input conditions
 */
export function getCropRecommendations(input: RecommendationInput): CropRecommendation[] {
    const recommendations: CropRecommendation[] = [];

    for (const crop of CROP_SUITABILITY_DATABASE) {
        const { score, reasons, issues, climateSuitability } = calculateSuitability(crop, input);

        let category: 'highly-suitable' | 'moderately-suitable' | 'not-recommended';
        if (score >= 70) {
            category = 'highly-suitable';
        } else if (score >= 50) {
            category = 'moderately-suitable';
        } else {
            category = 'not-recommended';
        }

        recommendations.push({
            crop,
            suitabilityScore: score,
            category,
            reasons,
            issues,
            climateSuitability
        });
    }

    // Sort by suitability score (highest first)
    recommendations.sort((a, b) => b.suitabilityScore - a.suitabilityScore);

    return recommendations;
}
