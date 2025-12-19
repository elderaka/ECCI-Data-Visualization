/**
 * Data loading utilities
 * 
 * NOTE: This module is now deprecated for data loading.
 * - Region dialogs now use PostGIS API: http://localhost:3001/api/area-data/{small_area}
 * - Heatmap now uses PostGIS vector tiles: http://localhost:3001/tiles/small_areas/{z}/{x}/{y}.pbf
 * - Only utility functions (getTemperatureColor, formatValue) are still used
 * - CSV loading functions (loadLevel1Data, getAreaData) are kept for reference but unused
 */

export interface Level1Data {
  small_area: string;
  air_quality: number;
  congestion: number;
  dampness: number;
  diet_change: number;
  excess_cold: number;
  excess_heat: number;
  hassle_costs: number;
  noise: number;
  physical_activity: number;
  road_repairs: number;
  road_safety: number;
  sum: number;
}

let cachedData: Map<string, Level1Data> | null = null;

/**
 * Load Level_1.csv data and cache it
 */
export async function loadLevel1Data(): Promise<Map<string, Level1Data>> {
  if (cachedData) {
    return cachedData;
  }

  try {
    const response = await fetch('/data/Level_1.csv');
    const text = await response.text();
    
    const lines = text.trim().split('\n');
    // Skip header line
    const data = new Map<string, Level1Data>();
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      
      const record: Level1Data = {
        small_area: values[0],
        air_quality: parseFloat(values[1]),
        congestion: parseFloat(values[2]),
        dampness: parseFloat(values[3]),
        diet_change: parseFloat(values[4]),
        excess_cold: parseFloat(values[5]),
        excess_heat: parseFloat(values[6]),
        hassle_costs: parseFloat(values[7]),
        noise: parseFloat(values[8]),
        physical_activity: parseFloat(values[9]),
        road_repairs: parseFloat(values[10]),
        road_safety: parseFloat(values[11]),
        sum: parseFloat(values[12]),
      };
      
      data.set(record.small_area, record);
    }
    
    cachedData = data;
    console.log(`Loaded ${data.size} records from Level_1.csv`);
    return data;
  } catch (error) {
    console.error('Failed to load Level_1.csv:', error);
    return new Map();
  }
}

/**
 * Get data for a specific small area
 */
export async function getAreaData(smallArea: string): Promise<Level1Data | null> {
  const data = await loadLevel1Data();
  return data.get(smallArea) || null;
}

/**
 * Get color based on temperature value (excess_heat)
 * Returns a gradient from blue (cold/negative) to red (hot/positive)
 */
export function getTemperatureColor(value: number): string {
  // Normalize value to 0-1 range (adjust these thresholds based on your data)
  // Looking at the data, excess_heat values are very small (scientific notation)
  // Let's use a different scale
  
  if (value < 0) {
    return '#60a5fa'; // Blue for negative/cold
  } else if (value < 0.000001) {
    return '#93c5fd'; // Light blue for very small
  } else if (value < 0.000005) {
    return '#fbbf24'; // Yellow for medium
  } else if (value < 0.00001) {
    return '#fb923c'; // Orange for high
  } else {
    return '#ef4444'; // Red for very high
  }
}

/**
 * Get color based on any numeric value with semantic meaning
 * Positive = good (green), Negative = bad (red)
 */
export function getValueColor(value: number): string {
  if (value > 1) {
    return '#10b981'; // Strong green
  } else if (value > 0.1) {
    return '#34d399'; // Light green
  } else if (value > 0) {
    return '#6ee7b7'; // Very light green
  } else if (value > -0.1) {
    return '#fca5a5'; // Light red
  } else if (value > -1) {
    return '#f87171'; // Medium red
  } else {
    return '#ef4444'; // Strong red
  }
}

/**
 * Format a number for display (with sign)
 */
export function formatValue(value: number): string {
  if (Math.abs(value) < 0.001) {
    return value.toExponential(2);
  }
  const sign = value >= 0 ? '+' : '';
  return sign + value.toFixed(3);
}
