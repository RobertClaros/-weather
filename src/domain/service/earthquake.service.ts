import type { EarthquakeServicePort } from "../ports/earthquake-service.port.js";
import type { EarthquakeDataPort } from "../ports/earthquake-data.port.js";
import type { Earthquake } from "../types/earthquake.js";

const MAX_RESULTS_TO_FORMAT = 20;

function isValidRange(value: number, name: string): boolean {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${name} must be a non-negative number`);
  }
  return true;
}

function toAlertLabel(alert: string | null): string {
  if (!alert) return "No alert specified";
  return alert;
}

function formatEarthquake(quake: Earthquake): string {
  return [
    `Location: ${quake.place}`,
    `Magnitude: ${quake.magnitude.toFixed(1)}`,
    `Time: ${new Date(quake.time).toUTCString()}`,
    `Alert level: ${toAlertLabel(quake.alert)}`,
    "---",
  ].join("\n");
}

export class EarthquakeService implements EarthquakeServicePort {
  constructor(private readonly dataPort: EarthquakeDataPort) {}

  async fetchRecentEarthquakes(query: {
    minMagnitude: number;
    daysBack: number;
    latitude?: number;
    longitude?: number;
    maxRadiusKm?: number;
  }): Promise<string> {
    isValidRange(query.minMagnitude, "minMagnitude");
    isValidRange(query.daysBack, "daysBack");
    if (query.maxRadiusKm !== undefined) {
      isValidRange(query.maxRadiusKm, "maxRadiusKm");
    }

    const hasLatitude = query.latitude !== undefined;
    const hasLongitude = query.longitude !== undefined;
    if (hasLatitude !== hasLongitude) {
      throw new Error("latitude and longitude must be provided together");
    }

    const earthquakes = await this.dataPort.queryRecent({
      minMagnitude: query.minMagnitude,
      daysBack: query.daysBack,
      latitude: query.latitude,
      longitude: query.longitude,
      maxRadiusKm: query.maxRadiusKm,
    });

    if (earthquakes.length === 0) {
      return "No earthquakes found matching the criteria";
    }

    const recent = earthquakes.slice(0, MAX_RESULTS_TO_FORMAT);
    const lines = recent.map(formatEarthquake);
    if (earthquakes.length > recent.length) {
      lines.push(
        `... and ${earthquakes.length - recent.length} more`,
      );
    }

    return [
      `Earthquakes (min ${query.minMagnitude.toFixed(1)}, last ${query.daysBack} day(s)):`,
      ...lines,
    ].join("\n");
  }
}