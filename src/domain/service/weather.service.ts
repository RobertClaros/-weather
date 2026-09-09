import type { WeatherServicePort } from "../ports/weather-service.port.js";
import type { WeatherDataPort } from "../ports/weather-data.port.js";
import type { Alert } from "../types/alert.js";
import type { ForecastPeriod } from "../types/forecast.js";

function formatAlert(alert: Alert): string {
  return [
    `Event: ${alert.event}`,
    `Area: ${alert.areaDesc}`,
    `Severity: ${alert.severity}`,
    `Status: ${alert.status}`,
    `Headline: ${alert.headline}`,
    "---",
  ].join("\n");
}

function formatPeriod(period: ForecastPeriod): string {
  return [
    `${period.name}:`,
    `Temperature: ${period.temperature}°${period.temperatureUnit}`,
    `Wind: ${period.windSpeed} ${period.windDirection}`,
    `${period.shortForecast}`,
    "---",
  ].join("\n");
}

export class WeatherService implements WeatherServicePort {
  constructor(private readonly dataPort: WeatherDataPort) {}

  async fetchAlerts(stateCode: string): Promise<string> {
    const code = stateCode.toUpperCase();
    const alerts = await this.dataPort.getAlerts(code);

    if (!alerts.length) {
      return `No active alerts for ${code}`;
    }

    const formatted = alerts.map(formatAlert);
    return `Active alerts for ${code}:\n\n${formatted.join("\n")}`;
  }

  async fetchForecast(
    latitude: number,
    longitude: number,
  ): Promise<string> {
    const forecast = await this.dataPort.getForecast(latitude, longitude);

    if (!forecast.periods.length) {
      return "No forecast periods available";
    }

    const formatted = forecast.periods.map(formatPeriod);
    return `Forecast for ${latitude}, ${longitude}:\n\n${formatted.join("\n")}`;
  }
}
