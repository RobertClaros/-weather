import type { EarthquakeQuery } from "./earthquake-data.port.js";

export interface EarthquakeServicePort {
  fetchRecentEarthquakes(query: EarthquakeQuery): Promise<string>;
}