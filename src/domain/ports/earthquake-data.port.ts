import type { Earthquake } from "../types/earthquake.js";

export interface EarthquakeQuery {
  minMagnitude: number;
  daysBack: number;
  latitude?: number;
  longitude?: number;
  maxRadiusKm?: number;
}

export interface EarthquakeDataPort {
  queryRecent(query: EarthquakeQuery): Promise<Earthquake[]>;
}