export interface ForecastPeriod {
  name: string;
  temperature: number;
  temperatureUnit: string;
  windSpeed: string;
  windDirection: string;
  shortForecast: string;
}

export interface Forecast {
  latitude: number;
  longitude: number;
  periods: ForecastPeriod[];
}
