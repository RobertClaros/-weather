import { McpServer } from "@modelcontextprotocol/server";
import { z } from "zod";
import type { WeatherServicePort } from "../../../domain/ports/weather-service.port.js";

export function registerMcpTools(
  server: McpServer,
  service: WeatherServicePort,
): void {
  server.registerTool(
    "get_alerts",
    {
      description: "Get weather alerts for a state",
      inputSchema: z.object({
        state: z
          .string()
          .length(2)
          .describe("Two-letter state code (e.g. CA, NY)"),
      }),
    },
    async ({ state }) => {
      const text = await service.fetchAlerts(state);
      return { content: [{ type: "text" as const, text }] };
    },
  );

  server.registerTool(
    "get_forecast",
    {
      description: "Get weather forecast for a location",
      inputSchema: z.object({
        latitude: z
          .number()
          .min(-90)
          .max(90)
          .describe("Latitude of the location"),
        longitude: z
          .number()
          .min(-180)
          .max(180)
          .describe("Longitude of the location"),
      }),
    },
    async ({ latitude, longitude }) => {
      const text = await service.fetchForecast(latitude, longitude);
      return { content: [{ type: "text" as const, text }] };
    },
  );
}
