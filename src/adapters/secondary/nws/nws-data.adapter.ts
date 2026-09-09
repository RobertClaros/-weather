import type { WeatherDataPort } from "../../../domain/ports/weather-data.port.js";
import type { Alert } from "../../../domain/types/alert.js";
import type { Forecast, ForecastPeriod } from "../../../domain/types/forecast.js";

const NWS_API_BASE = "https://api.weather.gov";
const USER_AGENT = "weather-app/1.0";

interface NWSAlertFeature {
  properties: {
    event?: string;
    areaDesc?: string;
    severity?: string;
    status?: string;
    headline?: string;
  };
}

interface NWSAlertsResponse {
  features: NWSAlertFeature[];
}

interface NWSPointsResponse {
  properties: {
    forecast?: string;
  };
}

interface NWSForecastPeriod {
  name?: string;
  temperature?: number;
  temperatureUnit?: string;
  windSpeed?: string;
  windDirection?: string;
  shortForecast?: string;
}

interface NWSForecastResponse {
  properties: {
    periods: NWSForecastPeriod[];
  };
}

async function nwsRequest<T>(url: string): Promise<T | null> {
  const headers = {
    "User-Agent": USER_AGENT,
    Accept: "application/geo+json",
  };

  try {
    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return (await response.json()) as T;
  } catch (error) {
    console.error("Error making NWS request:", error);
    return null;
  }
}

export class NWSDataAdapter implements WeatherDataPort {
  async getAlerts(stateCode: string): Promise<Alert[]> {
    const url = `${NWS_API_BASE}/alerts?area=${stateCode}`;
    const data = await nwsRequest<NWSAlertsResponse>(url);

    if (!data) {
      return [];
    }

    return (data.features || []).map((f) => ({
      event: f.properties.event ?? "Unknown",
      areaDesc: f.properties.areaDesc ?? "Unknown",
      severity: f.properties.severity ?? "Unknown",
      status: f.properties.status ?? "Unknown",
      headline: f.properties.headline ?? "No headline",
    }));
  }

  async getForecast(
    latitude: number,
    longitude: number,
  ): Promise<Forecast> {
    const pointsUrl = `${NWS_API_BASE}/points/${latitude.toFixed(4)},${longitude.toFixed(4)}`;
    const pointsData = await nwsRequest<NWSPointsResponse>(pointsUrl);

    if (!pointsData?.properties?.forecast) {
      return { latitude, longitude, periods: [] };
    }

    const forecastData = await nwsRequest<NWSForecastResponse>(
      pointsData.properties.forecast,
    );

    if (!forecastData) {
      return { latitude, longitude, periods: [] };
    }

    const periods: ForecastPeriod[] = (
      forecastData.properties?.periods || []
    ).map((p) => ({
      name: p.name ?? "Unknown",
      temperature: p.temperature ?? 0,
      temperatureUnit: p.temperatureUnit ?? "F",
      windSpeed: p.windSpeed ?? "Unknown",
      windDirection: p.windDirection ?? "",
      shortForecast: p.shortForecast ?? "No forecast available",
    }));

    return { latitude, longitude, periods };
  }
}
