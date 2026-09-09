import { McpServer } from "@modelcontextprotocol/server";
import { WeatherService } from "./domain/service/weather.service.js";
import { NWSDataAdapter } from "./adapters/secondary/nws/nws-data.adapter.js";
import { registerMcpTools } from "./adapters/primary/mcp/mcp-weather.adapter.js";
import type { WeatherDataPort } from "./domain/ports/weather-data.port.js";
import type { WeatherServicePort } from "./domain/ports/weather-service.port.js";

export function createWeatherService(
  dataPort: WeatherDataPort = new NWSDataAdapter(),
): WeatherServicePort {
  return new WeatherService(dataPort);
}

export function createMcpWeatherServer(
  service: WeatherServicePort = createWeatherService(),
): McpServer {
  const server = new McpServer({ name: "weather", version: "1.0.0" });
  registerMcpTools(server, service);
  return server;
}
