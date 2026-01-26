// Core Data Types

export interface CropData {
    id: string;
    name: string;
    type: string;
    kcInit: number;
    kcMid: number;
    kcEnd: number;
    rootDepth: number; // cm
    criticalDepletionFraction: number;
    growthStages: GrowthStage[];
}

export interface GrowthStage {
    name: string;
    durationDays: number;
    kc: number;
}

export interface WeatherData {
    timestamp: Date;
    temperature: number; // Celsius
    humidity: number; // %
    windSpeed: number; // m/s
    solarRadiation: number; // MJ/m²/day
    precipitation: number; // mm
    et0: number; // mm/day
}

export interface WeatherForecast {
    date: string;
    tempMin: number;
    tempMax: number;
    humidity: number;
    precipitation: number;
    precipitationProbability: number;
    description: string;
    icon: string;
}

export interface SoilMoisture {
    timestamp: Date;
    value: number; // %
    depth: number; // cm
    isAnomaly?: boolean;
    anomalySeverity?: number;
}

export interface IrrigationEvent {
    id: string;
    scheduledTime: Date;
    amount: number; // mm
    status: 'scheduled' | 'completed' | 'cancelled';
    method: string;
    aiRecommended: boolean;
    confidenceScore?: number;
}

export interface WaterBalance {
    date: Date;
    soilMoisture: number;
    etc: number; // Crop evapotranspiration
    precipitation: number;
    irrigation: number;
    drainage: number;
    currentStress: number; // 0-100
    daysToWiltingPoint: number;
}

export interface Alert {
    id: string;
    timestamp: Date;
    type: 'water_stress' | 'irrigation_due' | 'weather_warning' | 'anomaly' | 'sensor_malfunction';
    severity: 'low' | 'medium' | 'high' | 'critical';
    severityScore: number;
    title: string;
    message: string;
    actionRequired: boolean;
    read: boolean;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    context?: FarmContext;
}

export interface FarmContext {
    cropType: string;
    growthStage: string;
    currentSoilMoisture: number;
    nextIrrigation?: Date;
    recentAlerts: Alert[];
    weatherConditions: string;
}

export interface AIModelPrediction {
    predictionType: 'kc' | 'irrigation_schedule' | 'anomaly';
    value: number | boolean;
    confidence: number;
    explanation: string;
    timestamp: Date;
}

export interface FarmProfile {
    id: string;
    name: string;
    location: {
        latitude: number;
        longitude: number;
        address: string;
    };
    area: number; // hectares
    soilType: string;
    currentCrop: CropData;
    plantingDate: Date;
    irrigationSystem: string;
    sensors: Sensor[];
}

export interface Sensor {
    id: string;
    type: 'soil_moisture' | 'temperature' | 'humidity';
    location: string;
    status: 'active' | 'inactive' | 'malfunction';
    lastReading?: number;
    lastUpdateTime?: Date;
}

export interface DashboardStats {
    totalWaterUsed: number; // liters
    waterSaved: number; // liters vs traditional
    currentSoilMoisture: number;
    nextIrrigationIn: number; // hours
    cropHealthScore: number; // 0-100
    activeAlerts: number;
}
