import type { WeatherAdvisorServicePort } from "../ports/weather-advisor.port.js";
import type { WeatherServicePort } from "../ports/weather-service.port.js";
import type { ForecastPeriod } from "../types/forecast.js";

const PRECIPITATION_KEYWORDS = [
  "rain",
  "shower",
  "storm",
  "thunder",
  "snow",
  "sleet",
  "drizzle",
  "freezing",
];

function parseWindMph(windSpeed: string): number {
  const match = windSpeed.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

function hasPrecipitation(period: ForecastPeriod): boolean {
  const lower = period.shortForecast.toLowerCase();
  return PRECIPITATION_KEYWORDS.some((k) => lower.includes(k));
}

export class WeatherAdvisorService implements WeatherAdvisorServicePort {
  constructor(private readonly weatherService: WeatherServicePort) {}

  async getAdvice(
    latitude: number,
    longitude: number,
  ): Promise<string> {
    const forecast = await this.weatherService.getForecastData(
      latitude,
      longitude,
    );

    if (!forecast.periods.length) {
      return "No forecast data available to generate advice";
    }

    const periods = forecast.periods;
    const current = periods[0];

    let maxTemp = -Infinity;
    let minTemp = Infinity;
    let maxWind = 0;
    let precipitation = false;

    for (const period of periods) {
      maxTemp = Math.max(maxTemp, period.temperature);
      minTemp = Math.min(minTemp, period.temperature);
      maxWind = Math.max(maxWind, parseWindMph(period.windSpeed));
      if (hasPrecipitation(period)) {
        precipitation = true;
      }
    }

    const unit = current.temperatureUnit;
    const advice: string[] = [
      `Weather advice for ${latitude}, ${longitude}:`,
      `Now: ${current.temperature}°${unit}, ${current.shortForecast.toLowerCase()}`,
      "---",
    ];

    if (maxTemp >= 105) {
      advice.push(
        `Extreme heat (up to ${maxTemp}°${unit}): high risk of heat stroke. Avoid outdoor activity, stay hydrated and in shade.`,
      );
    } else if (maxTemp >= 90) {
      advice.push(
        `Very hot (up to ${maxTemp}°${unit}): drink plenty of water, limit strenuous exercise and use sun protection.`,
      );
    } else if (minTemp <= 32) {
      advice.push(
        `Freezing conditions (down to ${minTemp}°${unit}): protect pipes and plants, watch for icy surfaces.`,
      );
    } else if (maxTemp <= 60) {
      advice.push(
        `Cool (down to ${minTemp}°${unit} / up to ${maxTemp}°${unit}): bring warm layers.`,
      );
    } else {
      advice.push(
        `Temperatures are comfortable (${minTemp}°${unit} to ${maxTemp}°${unit}).`,
      );
    }

    if (precipitation) {
      advice.push(
        "Precipitation is expected at some point: carry rain gear and drive with caution.",
      );
    } else {
      advice.push("Dry conditions expected throughout the period.");
    }

    if (maxWind >= 30) {
      advice.push(
        `Strong winds (up to ${maxWind} mph): secure loose objects and take extra care on the road.`,
      );
    }

    return advice.join("\n");
  }
}