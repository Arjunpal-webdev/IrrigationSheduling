/**
 * ET₀ (Reference Evapotranspiration) Calculator
 * Using simplified Penman-Monteith equation
 */

export interface ETInputs {
    tempMin: number; // °C
    tempMax: number; // °C
    humidity: number; // %
    windSpeed: number; // m/s
    solarRadiation?: number; // MJ/m²/day
    latitude?: number; // degrees
    date?: Date;
}

export class ETCalculator {
    /**
     * Calculate ET₀ using simplified Hargreaves-Samani method
     * (More practical for areas with limited weather data)
     */
    static calculateET0(inputs: ETInputs): number {
        const { tempMin, tempMax, humidity, windSpeed, latitude = 20, date = new Date() } = inputs;

        // Average temperature
        const tempMean = (tempMin + tempMax) / 2;

        // Temperature range
        const tempRange = tempMax - tempMin;

        // Day of year
        const dayOfYear = this.getDayOfYear(date);

        // Solar radiation (Ra) - extraterrestrial radiation
        const ra = this.calculateRa(latitude, dayOfYear);

        // Hargreaves-Samani equation
        // ET₀ = 0.0023 × Ra × (Tmean + 17.8) × √(Tmax - Tmin)
        const et0 = 0.0023 * ra * (tempMean + 17.8) * Math.sqrt(tempRange);

        // Adjust for humidity (empirical correction)
        const humidityFactor = 1 - ((humidity - 50) / 200);

        // Adjust for wind speed (empirical correction)
        const windFactor = 1 + (windSpeed / 10);

        return Math.max(0, et0 * humidityFactor * windFactor);
    }

    /**
     * Calculate extraterrestrial radiation (Ra)
     */
    private static calculateRa(latitude: number, dayOfYear: number): number {
        const latRad = (latitude * Math.PI) / 180;

        // Solar declination
        const delta = 0.409 * Math.sin((2 * Math.PI * dayOfYear / 365) - 1.39);

        // Sunset hour angle
        const ws = Math.acos(-Math.tan(latRad) * Math.tan(delta));

        // Inverse relative distance Earth-Sun
        const dr = 1 + 0.033 * Math.cos(2 * Math.PI * dayOfYear / 365);

        // Solar constant
        const Gsc = 0.0820; // MJ/m²/min

        // Ra calculation
        const ra = (24 * 60 / Math.PI) * Gsc * dr * (
            ws * Math.sin(latRad) * Math.sin(delta) +
            Math.cos(latRad) * Math.cos(delta) * Math.sin(ws)
        );

        return ra;
    }

    /**
     * Get day of year (1-365)
     */
    private static getDayOfYear(date: Date): number {
        const start = new Date(date.getFullYear(), 0, 0);
        const diff = date.getTime() - start.getTime();
        const oneDay = 1000 * 60 * 60 * 24;
        return Math.floor(diff / oneDay);
    }

    /**
     * Calculate ET₀ for multiple days
     */
    static calculateET0Series(inputs: ETInputs[]): number[] {
        return inputs.map(input => this.calculateET0(input));
    }

    /**
     * Get average ET₀ for a period
     */
    static getAverageET0(et0Values: number[]): number {
        if (et0Values.length === 0) return 0;
        return et0Values.reduce((sum, val) => sum + val, 0) / et0Values.length;
    }
}
