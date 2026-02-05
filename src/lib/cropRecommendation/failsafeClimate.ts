/**
 * Failsafe Agro-Climate Database for India
 * Provides regional climate data when weather API is unavailable
 */

import { TempZone, RainZone } from './cropSuitability';
import { CropSeason } from './soilDatabase';

export interface RegionalClimate {
    region: string;
    tempZone: TempZone;
    rainZone: RainZone;
    seasonalTemp: {
        kharif: TempZone;
        rabi: TempZone;
        zaid: TempZone;
    };
    avgTemperature: number;
    avgRainfall: number;
}

/**
 * Regional agro-climate profiles for major Indian agricultural zones
 */
const REGIONAL_CLIMATE_DATA: Record<string, RegionalClimate> = {
    'north': {
        region: 'North India',
        tempZone: 'warm',
        rainZone: 'moderate',
        seasonalTemp: {
            kharif: 'warm',
            rabi: 'mild',
            zaid: 'hot'
        },
        avgTemperature: 25,
        avgRainfall: 50
    },
    'east': {
        region: 'East India',
        tempZone: 'warm',
        rainZone: 'wet',
        seasonalTemp: {
            kharif: 'warm',
            rabi: 'mild',
            zaid: 'warm'
        },
        avgTemperature: 27,
        avgRainfall: 85
    },
    'west': {
        region: 'West India',
        tempZone: 'hot',
        rainZone: 'dry',
        seasonalTemp: {
            kharif: 'hot',
            rabi: 'warm',
            zaid: 'hot'
        },
        avgTemperature: 32,
        avgRainfall: 35
    },
    'south': {
        region: 'South India',
        tempZone: 'warm',
        rainZone: 'moderate',
        seasonalTemp: {
            kharif: 'warm',
            rabi: 'warm',
            zaid: 'hot'
        },
        avgTemperature: 28,
        avgRainfall: 55
    },
    'central': {
        region: 'Central India',
        tempZone: 'warm',
        rainZone: 'moderate',
        seasonalTemp: {
            kharif: 'warm',
            rabi: 'mild',
            zaid: 'hot'
        },
        avgTemperature: 26,
        avgRainfall: 50
    }
};

/**
 * State to region mapping
 */
const STATE_REGION_MAP: Record<string, string> = {
    // North India
    'Punjab': 'north',
    'Haryana': 'north',
    'Himachal Pradesh': 'north',
    'Uttarakhand': 'north',
    'Uttar Pradesh': 'north',
    'Jammu and Kashmir': 'north',
    'Ladakh': 'north',
    'Delhi': 'north',
    'Chandigarh': 'north',

    // East India
    'Bihar': 'east',
    'Jharkhand': 'east',
    'West Bengal': 'east',
    'Odisha': 'east',
    'Assam': 'east',
    'Meghalaya': 'east',
    'Tripura': 'east',
    'Manipur': 'east',
    'Nagaland': 'east',
    'Mizoram': 'east',
    'Arunachal Pradesh': 'east',
    'Sikkim': 'east',

    // West India
    'Rajasthan': 'west',
    'Gujarat': 'west',
    'Maharashtra': 'west',
    'Goa': 'west',
    'Daman and Diu': 'west',
    'Dadra and Nagar Haveli': 'west',

    // South India
    'Tamil Nadu': 'south',
    'Karnataka': 'south',
    'Telangana': 'south',
    'Andhra Pradesh': 'south',
    'Kerala': 'south',
    'Puducherry': 'south',
    'Lakshadweep': 'south',

    // Central India
    'Madhya Pradesh': 'central',
    'Chhattisgarh': 'central'
};

/**
 * Get failsafe climate data for a state based on regional profiles
 */
export function getFailsafeClimateData(state: string, season: CropSeason = 'kharif'): {
    tempZone: TempZone;
    rainZone: RainZone;
    temperature: number;
    rainfall: number;
} {
    // Find region for state
    const region = STATE_REGION_MAP[state] || 'central'; // Default to central
    const climateProfile = REGIONAL_CLIMATE_DATA[region];

    // Get seasonal temperature zone
    const tempZone = climateProfile.seasonalTemp[season];

    console.log(`ℹ️ Using failsafe agro-climate data for ${state} (${climateProfile.region}) - Season: ${season}`);

    return {
        tempZone,
        rainZone: climateProfile.rainZone,
        temperature: climateProfile.avgTemperature,
        rainfall: climateProfile.avgRainfall
    };
}
