import type { Forecast } from "../types/forecast.js";

export interface WeatherServicePort {
  fetchAlerts(stateCode: string): Promise<string>;
  fetchForecast(latitude: number, longitude: number): Promise<string>;
  getForecastData(latitude: number, longitude: number): Promise<Forecast>;
}
