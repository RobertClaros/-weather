import type { Alert } from "../types/alert.js";
import type { Forecast } from "../types/forecast.js";

export interface WeatherDataPort {
  getAlerts(stateCode: string): Promise<Alert[]>;
  getForecast(latitude: number, longitude: number): Promise<Forecast>;
}
