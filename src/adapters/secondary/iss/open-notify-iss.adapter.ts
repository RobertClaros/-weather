import type { IssDataPort } from "../../../domain/ports/iss-data.port.js";
import type { IssPosition } from "../../../domain/types/iss.js";

const ISS_NOW_URL = "http://api.open-notify.org/iss-now.json";
const USER_AGENT = "weather-app/1.0";

interface OpenNotifyIssNowResponse {
  message?: string;
  timestamp?: number;
  iss_position?: {
    latitude?: string;
    longitude?: string;
  };
}

function parseCoordinate(value: string | undefined): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export class OpenNotifyIssAdapter implements IssDataPort {
  async getCurrentPosition(): Promise<IssPosition | null> {
    try {
      const response = await fetch(ISS_NOW_URL, {
        headers: {
          "User-Agent": USER_AGENT,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = (await response.json()) as OpenNotifyIssNowResponse;

      if (!data.iss_position || !data.timestamp) {
        return null;
      }

      return {
        latitude: parseCoordinate(data.iss_position.latitude),
        longitude: parseCoordinate(data.iss_position.longitude),
        timestamp: data.timestamp,
      };
    } catch (error) {
      console.error("Error making ISS request:", error);
      return null;
    }
  }
}