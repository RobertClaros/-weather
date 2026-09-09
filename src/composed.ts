import { McpServer } from "@modelcontextprotocol/server";
import { WeatherService } from "./domain/service/weather.service.js";
import { NWSDataAdapter } from "./adapters/secondary/nws/nws-data.adapter.js";
import { WeatherAdvisorService } from "./domain/service/weather-advisor.service.js";
import { IssService } from "./domain/service/iss.service.js";
import { OpenNotifyIssAdapter } from "./adapters/secondary/iss/open-notify-iss.adapter.js";
import { registerMcpTools } from "./adapters/primary/mcp/mcp-weather.adapter.js";
import { registerMcpIssTools } from "./adapters/primary/mcp/mcp-iss.adapter.js";
import type { WeatherDataPort } from "./domain/ports/weather-data.port.js";
import type { WeatherServicePort } from "./domain/ports/weather-service.port.js";
import type { WeatherAdvisorServicePort } from "./domain/ports/weather-advisor.port.js";
import type { IssDataPort } from "./domain/ports/iss-data.port.js";
import type { IssServicePort } from "./domain/ports/iss-service.port.js";

export function createWeatherService(
  dataPort: WeatherDataPort = new NWSDataAdapter(),
): WeatherServicePort {
  return new WeatherService(dataPort);
}

export function createWeatherAdvisorService(
  weather: WeatherServicePort = createWeatherService(),
): WeatherAdvisorServicePort {
  return new WeatherAdvisorService(weather);
}

export function createIssService(
  dataPort: IssDataPort = new OpenNotifyIssAdapter(),
): IssServicePort {
  return new IssService(dataPort);
}

export function createMcpServer(
  weather: WeatherServicePort = createWeatherService(),
  iss: IssServicePort = createIssService(),
  advisor: WeatherAdvisorServicePort = createWeatherAdvisorService(weather),
): McpServer {
  const server = new McpServer({ name: "weather", version: "1.0.0" });
  registerMcpTools(server, weather, advisor);
  registerMcpIssTools(server, iss);
  return server;
}

export function createMcpWeatherServer(
  service: WeatherServicePort = createWeatherService(),
): McpServer {
  return createMcpServer(service);
}