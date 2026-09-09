export type { Alert } from "./domain/types/alert.js";
export type { Forecast, ForecastPeriod } from "./domain/types/forecast.js";
export type { WeatherDataPort } from "./domain/ports/weather-data.port.js";
export type { WeatherServicePort } from "./domain/ports/weather-service.port.js";
export { WeatherService } from "./domain/service/weather.service.js";
export { NWSDataAdapter } from "./adapters/secondary/nws/nws-data.adapter.js";
export { registerMcpTools } from "./adapters/primary/mcp/mcp-weather.adapter.js";
export { createWeatherService, createMcpWeatherServer } from "./composed.js";
