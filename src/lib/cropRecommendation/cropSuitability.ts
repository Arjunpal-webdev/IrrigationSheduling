/**
 * Crop Suitability Rules Database
 * Based on soil properties, water requirements, and climate conditions
 */

import { WaterClass, CropSeason, Topology } from './soilDatabase';

export interface CropRequirements {
    name: string;
    displayName: string;
    // Soil requirements
    pHRange: [number, number];
    minNitrogen: number; // kg/ha
    minPhosphorus: number; // kg/ha
    minPotassium: number; // kg/ha
    maxEC: number; // dS/m
    minOrganicCarbon: number; // %
    // Water & climate
    waterRequirement: WaterClass[];
    suitableSeasons: CropSeason[];
    preferredTopology: Topology[];
    // Climate zones
    climateZones: ('cold' | 'normal' | 'hot')[];
}

export const CROP_SUITABILITY_DATABASE: CropRequirements[] = [
    {
        name: 'rice',
        displayName: 'Rice',
        pHRange: [5.5, 7.0],
        minNitrogen: 150,
        minPhosphorus: 20,
        minPotassium: 100,
        maxEC: 1.0,
        minOrganicCarbon: 0.5,
        waterRequirement: ['high'],
        suitableSeasons: ['kharif'],
        preferredTopology: ['flat'],
        climateZones: ['normal', 'hot']
    },
    {
        name: 'wheat',
        displayName: 'Wheat',
        pHRange: [6.0, 7.5],
        minNitrogen: 120,
        minPhosphorus: 18,
        minPotassium: 80,
        maxEC: 1.2,
        minOrganicCarbon: 0.4,
        waterRequirement: ['medium-high', 'medium'],
        suitableSeasons: ['rabi'],
        preferredTopology: ['flat', 'sloppy'],
        climateZones: ['cold', 'normal']
    },
    {
        name: 'maize',
        displayName: 'Maize',
        pHRange: [5.5, 7.5],
        minNitrogen: 140,
        minPhosphorus: 22,
        minPotassium: 90,
        maxEC: 1.1,
        minOrganicCarbon: 0.6,
        waterRequirement: ['medium-high', 'medium'],
        suitableSeasons: ['kharif', 'rabi'],
        preferredTopology: ['flat'],
        climateZones: ['normal', 'hot']
    },
    {
        name: 'cotton',
        displayName: 'Cotton',
        pHRange: [6.0, 8.0],
        minNitrogen: 100,
        minPhosphorus: 15,
        minPotassium: 70,
        maxEC: 1.5,
        minOrganicCarbon: 0.4,
        waterRequirement: ['medium-high'],
        suitableSeasons: ['kharif'],
        preferredTopology: ['flat', 'sloppy'],
        climateZones: ['hot']
    },
    {
        name: 'sugarcane',
        displayName: 'Sugarcane',
        pHRange: [6.5, 7.5],
        minNitrogen: 200,
        minPhosphorus: 25,
        minPotassium: 150,
        maxEC: 1.0,
        minOrganicCarbon: 0.8,
        waterRequirement: ['high'],
        suitableSeasons: ['kharif', 'zaid'],
        preferredTopology: ['flat'],
        climateZones: ['normal', 'hot']
    },
    {
        name: 'potato',
        displayName: 'Potato',
        pHRange: [5.5, 6.5],
        minNitrogen: 150,
        minPhosphorus: 20,
        minPotassium: 120,
        maxEC: 0.8,
        minOrganicCarbon: 0.7,
        waterRequirement: ['medium-high', 'medium'],
        suitableSeasons: ['rabi'],
        preferredTopology: ['flat', 'sloppy'],
        climateZones: ['cold', 'normal']
    },
    {
        name: 'tomato',
        displayName: 'Tomato',
        pHRange: [6.0, 7.0],
        minNitrogen: 120,
        minPhosphorus: 18,
        minPotassium: 100,
        maxEC: 1.0,
        minOrganicCarbon: 0.6,
        waterRequirement: ['medium-high'],
        suitableSeasons: ['rabi', 'zaid'],
        preferredTopology: ['flat'],
        climateZones: ['normal', 'hot']
    },
    {
        name: 'onion',
        displayName: 'Onion',
        pHRange: [6.0, 7.5],
        minNitrogen: 100,
        minPhosphorus: 15,
        minPotassium: 80,
        maxEC: 1.2,
        minOrganicCarbon: 0.5,
        waterRequirement: ['medium'],
        suitableSeasons: ['rabi', 'kharif'],
        preferredTopology: ['flat'],
        climateZones: ['normal']
    },
    {
        name: 'soybean',
        displayName: 'Soybean',
        pHRange: [6.0, 7.0],
        minNitrogen: 40,
        minPhosphorus: 20,
        minPotassium: 60,
        maxEC: 1.0,
        minOrganicCarbon: 0.5,
        waterRequirement: ['medium'],
        suitableSeasons: ['kharif'],
        preferredTopology: ['flat', 'sloppy'],
        climateZones: ['normal', 'hot']
    },
    {
        name: 'groundnut',
        displayName: 'Groundnut',
        pHRange: [6.0, 6.5],
        minNitrogen: 60,
        minPhosphorus: 18,
        minPotassium: 70,
        maxEC: 0.9,
        minOrganicCarbon: 0.4,
        waterRequirement: ['medium'],
        suitableSeasons: ['kharif', 'zaid'],
        preferredTopology: ['flat', 'sloppy'],
        climateZones: ['normal', 'hot']
    }
];

/**
 * Determine climate zone based on location and season
 * Simplified logic - can be enhanced with actual climate data
 */
export function getClimateZone(state: string, season: CropSeason): 'cold' | 'normal' | 'hot' {
    const coldStates = ['Jammu and Kashmir', 'Himachal Pradesh', 'Uttarakhand'];
    const hotStates = ['Rajasthan', 'Gujarat', 'Tamil Nadu', 'Andhra Pradesh', 'Telangana'];

    if (season === 'rabi' && coldStates.some(s => state.includes(s))) {
        return 'cold';
    }

    if (season === 'zaid' || hotStates.some(s => state.includes(s))) {
        return 'hot';
    }

    return 'normal';
}
