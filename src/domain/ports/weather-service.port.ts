export interface WeatherServicePort {
  fetchAlerts(stateCode: string): Promise<string>;
  fetchForecast(latitude: number, longitude: number): Promise<string>;
}
