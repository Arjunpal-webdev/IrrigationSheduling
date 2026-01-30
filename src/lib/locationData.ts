/**
 * Location Database - Indian States and Districts
 * Provides coordinates for weather API integration
 */

export interface District {
    name: string;
    latitude: number;
    longitude: number;
}

export interface StateData {
    name: string;
    districts: District[];
}

/**
 * Comprehensive State and District Database for India
 * Coordinates are approximate district headquarters
 */
export const INDIA_STATES_DISTRICTS: Record<string, District[]> = {
    "Uttar Pradesh": [
        { name: "Lucknow", latitude: 26.8467, longitude: 80.9462 },
        { name: "Kanpur", latitude: 26.4499, longitude: 80.3319 },
        { name: "Ghaziabad", latitude: 28.6692, longitude: 77.4538 },
        { name: "Agra", latitude: 27.1767, longitude: 78.0081 },
        { name: "Varanasi", latitude: 25.3176, longitude: 82.9739 },
        { name: "Meerut", latitude: 28.9845, longitude: 77.7064 },
        { name: "Allahabad", latitude: 25.4358, longitude: 81.8463 },
        { name: "Bareilly", latitude: 28.3670, longitude: 79.4304 },
        { name: "Aligarh", latitude: 27.8974, longitude: 78.0880 },
        { name: "Moradabad", latitude: 28.8389, longitude: 78.7378 }
    ],
    "Maharashtra": [
        { name: "Mumbai", latitude: 19.0760, longitude: 72.8777 },
        { name: "Pune", latitude: 18.5204, longitude: 73.8567 },
        { name: "Nagpur", latitude: 21.1458, longitude: 79.0882 },
        { name: "Nashik", latitude: 19.9975, longitude: 73.7898 },
        { name: "Aurangabad", latitude: 19.8762, longitude: 75.3433 },
        { name: "Solapur", latitude: 17.6599, longitude: 75.9064 },
        { name: "Kolhapur", latitude: 16.7050, longitude: 74.2433 },
        { name: "Amravati", latitude: 20.9374, longitude: 77.7796 },
        { name: "Thane", latitude: 19.2183, longitude: 72.9781 },
        { name: "Sangli", latitude: 16.8524, longitude: 74.5815 }
    ],
    "Punjab": [
        { name: "Ludhiana", latitude: 30.9010, longitude: 75.8573 },
        { name: "Amritsar", latitude: 31.6340, longitude: 74.8723 },
        { name: "Jalandhar", latitude: 31.3260, longitude: 75.5762 },
        { name: "Patiala", latitude: 30.3398, longitude: 76.3869 },
        { name: "Bathinda", latitude: 30.2110, longitude: 74.9455 },
        { name: "Mohali", latitude: 30.7046, longitude: 76.7179 },
        { name: "Hoshiarpur", latitude: 31.5332, longitude: 75.9119 },
        { name: "Gurdaspur", latitude: 32.0409, longitude: 75.4050 }
    ],
    "Haryana": [
        { name: "Faridabad", latitude: 28.4089, longitude: 77.3178 },
        { name: "Gurgaon", latitude: 28.4595, longitude: 77.0266 },
        { name: "Hisar", latitude: 29.1492, longitude: 75.7217 },
        { name: "Rohtak", latitude: 28.8955, longitude: 76.6066 },
        { name: "Panipat", latitude: 29.3909, longitude: 76.9635 },
        { name: "Karnal", latitude: 29.6857, longitude: 76.9905 },
        { name: "Sonipat", latitude: 28.9931, longitude: 77.0151 },
        { name: "Ambala", latitude: 30.3782, longitude: 76.7767 }
    ],
    "Rajasthan": [
        { name: "Jaipur", latitude: 26.9124, longitude: 75.7873 },
        { name: "Jodhpur", latitude: 26.2389, longitude: 73.0243 },
        { name: "Kota", latitude: 25.2138, longitude: 75.8648 },
        { name: "Udaipur", latitude: 24.5854, longitude: 73.7125 },
        { name: "Ajmer", latitude: 26.4499, longitude: 74.6399 },
        { name: "Bikaner", latitude: 28.0229, longitude: 73.3119 },
        { name: "Alwar", latitude: 27.5530, longitude: 76.6346 },
        { name: "Bharatpur", latitude: 27.2152, longitude: 77.4890 }
    ],
    "Gujarat": [
        { name: "Ahmedabad", latitude: 23.0225, longitude: 72.5714 },
        { name: "Surat", latitude: 21.1702, longitude: 72.8311 },
        { name: "Vadodara", latitude: 22.3072, longitude: 73.1812 },
        { name: "Rajkot", latitude: 22.3039, longitude: 70.8022 },
        { name: "Bhavnagar", latitude: 21.7645, longitude: 72.1519 },
        { name: "Jamnagar", latitude: 22.4707, longitude: 70.0577 },
        { name: "Gandhinagar", latitude: 23.2156, longitude: 72.6369 },
        { name: "Anand", latitude: 22.5645, longitude: 72.9289 }
    ],
    "Karnataka": [
        { name: "Bangalore", latitude: 12.9716, longitude: 77.5946 },
        { name: "Mysore", latitude: 12.2958, longitude: 76.6394 },
        { name: "Hubli", latitude: 15.3647, longitude: 75.1240 },
        { name: "Mangalore", latitude: 12.9141, longitude: 74.8560 },
        { name: "Belgaum", latitude: 15.8497, longitude: 74.4977 },
        { name: "Gulbarga", latitude: 17.3297, longitude: 76.8343 },
        { name: "Bellary", latitude: 15.1394, longitude: 76.9214 },
        { name: "Shimoga", latitude: 13.9299, longitude: 75.5681 }
    ],
    "Tamil Nadu": [
        { name: "Chennai", latitude: 13.0827, longitude: 80.2707 },
        { name: "Coimbatore", latitude: 11.0168, longitude: 76.9558 },
        { name: "Madurai", latitude: 9.9252, longitude: 78.1198 },
        { name: "Tiruchirappalli", latitude: 10.7905, longitude: 78.7047 },
        { name: "Salem", latitude: 11.6643, longitude: 78.1460 },
        { name: "Tirunelveli", latitude: 8.7139, longitude: 77.7567 },
        { name: "Erode", latitude: 11.3410, longitude: 77.7172 },
        { name: "Vellore", latitude: 12.9165, longitude: 79.1325 }
    ],
    "Andhra Pradesh": [
        { name: "Visakhapatnam", latitude: 17.6868, longitude: 83.2185 },
        { name: "Vijayawada", latitude: 16.5062, longitude: 80.6480 },
        { name: "Guntur", latitude: 16.3067, longitude: 80.4365 },
        { name: "Nellore", latitude: 14.4426, longitude: 79.9865 },
        { name: "Kurnool", latitude: 15.8281, longitude: 78.0373 },
        { name: "Tirupati", latitude: 13.6288, longitude: 79.4192 },
        { name: "Kakinada", latitude: 16.9891, longitude: 82.2475 }
    ],
    "West Bengal": [
        { name: "Kolkata", latitude: 22.5726, longitude: 88.3639 },
        { name: "Howrah", latitude: 22.5958, longitude: 88.2636 },
        { name: "Durgapur", latitude: 23.5204, longitude: 87.3119 },
        { name: "Asansol", latitude: 23.6739, longitude: 86.9524 },
        { name: "Siliguri", latitude: 26.7271, longitude: 88.3953 },
        { name: "Malda", latitude: 25.0096, longitude: 88.1405 },
        { name: "Bardhaman", latitude: 23.2324, longitude: 87.8615 }
    ],
    "Madhya Pradesh": [
        { name: "Indore", latitude: 22.7196, longitude: 75.8577 },
        { name: "Bhopal", latitude: 23.2599, longitude: 77.4126 },
        { name: "Jabalpur", latitude: 23.1815, longitude: 79.9864 },
        { name: "Gwalior", latitude: 26.2183, longitude: 78.1828 },
        { name: "Ujjain", latitude: 23.1765, longitude: 75.7885 },
        { name: "Sagar", latitude: 23.8388, longitude: 78.7378 },
        { name: "Ratlam", latitude: 23.3315, longitude: 75.0367 }
    ]
};

/**
 * Get all available states
 */
export function getAvailableStates(): string[] {
    return Object.keys(INDIA_STATES_DISTRICTS).sort();
}

/**
 * Get districts for a specific state
 */
export function getDistrictsByState(state: string): District[] {
    return INDIA_STATES_DISTRICTS[state] || [];
}

/**
 * Get coordinates for a specific district
 */
export function getDistrictCoordinates(state: string, district: string): { latitude: number; longitude: number } | null {
    const districts = INDIA_STATES_DISTRICTS[state];
    if (!districts) return null;

    const districtData = districts.find(d => d.name === district);
    if (!districtData) return null;

    return {
        latitude: districtData.latitude,
        longitude: districtData.longitude
    };
}

/**
 * Find nearest district to given coordinates (helper function)
 */
export function findNearestDistrict(latitude: number, longitude: number): { state: string; district: string } | null {
    let minDistance = Infinity;
    let nearest: { state: string; district: string } | null = null;

    for (const [state, districts] of Object.entries(INDIA_STATES_DISTRICTS)) {
        for (const district of districts) {
            const distance = Math.sqrt(
                Math.pow(district.latitude - latitude, 2) +
                Math.pow(district.longitude - longitude, 2)
            );

            if (distance < minDistance) {
                minDistance = distance;
                nearest = { state, district: district.name };
            }
        }
    }

    return nearest;
}
