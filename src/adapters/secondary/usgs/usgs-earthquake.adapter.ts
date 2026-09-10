import type { EarthquakeDataPort } from "../../../domain/ports/earthquake-data.port.js";
import type { EarthquakeQuery } from "../../../domain/ports/earthquake-data.port.js";
import type { Earthquake } from "../../../domain/types/earthquake.js";

const USGS_API_BASE = "https://earthquake.usgs.gov/fdsnws/event/1/query";
const USER_AGENT = "weather-app/1.0";
const USGS_LIMIT = 100;

interface USGSFeature {
  properties: {
    place?: string | null;
    mag?: number | null;
    time?: number | null;
    alert?: string | null;
  };
}

interface USGSResponse {
  features?: USGSFeature[];
}

function toIsoOffsetDays(daysBack: number): string {
  const start = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);
  return start.toISOString();
}

export class USGSEarthquakeAdapter implements EarthquakeDataPort {
  async queryRecent(query: EarthquakeQuery): Promise<Earthquake[]> {
    const url = this.buildUrl(query);
    const data = await this.fetchData(url);

    if (!data) {
      return [];
    }

    return (data.features || []).map((f) => ({
      place: f.properties.place ?? "Unknown location",
      magnitude: Number.isFinite(f.properties.mag)
        ? (f.properties.mag as number)
        : 0,
      time: Number.isFinite(f.properties.time)
        ? (f.properties.time as number)
        : Date.now(),
      alert: f.properties.alert ?? null,
    }));
  }

  private buildUrl(query: EarthquakeQuery): string {
    const params = new URLSearchParams({
      format: "geojson",
      starttime: toIsoOffsetDays(query.daysBack),
      minmagnitude: String(query.minMagnitude),
      orderby: "time",
      limit: String(USGS_LIMIT),
    });

    if (query.latitude !== undefined && query.longitude !== undefined) {
      params.set("latitude", String(query.latitude));
      params.set("longitude", String(query.longitude));
      params.set(
        "maxradiuskm",
        String(query.maxRadiusKm ?? 500),
      );
    }

    return `${USGS_API_BASE}?${params.toString()}`;
  }

  private async fetchData(url: string): Promise<USGSResponse | null> {
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": USER_AGENT,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return (await response.json()) as USGSResponse;
    } catch (error) {
      console.error("Error making USGS request:", error);
      return null;
    }
  }
}