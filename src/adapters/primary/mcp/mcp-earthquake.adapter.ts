import { McpServer } from "@modelcontextprotocol/server";
import { z } from "zod";
import type { EarthquakeServicePort } from "../../../domain/ports/earthquake-service.port.js";

export function registerMcpEarthquakeTools(
  server: McpServer,
  service: EarthquakeServicePort,
): void {
  server.registerTool(
    "get_earthquakes",
    {
      description:
        "Get recent earthquakes from the USGS with place, magnitude, formatted time and alert level",
      inputSchema: z.object({
        minMagnitude: z
          .number()
          .nonnegative()
          .describe("Minimum magnitude to include (default 4.0)")
          .default(4.0),
        daysBack: z
          .number()
          .nonnegative()
          .describe("Number of days to look back (default 1)")
          .default(1),
        latitude: z
          .number()
          .min(-90)
          .max(90)
          .describe("Latitude for a location-based search")
          .optional(),
        longitude: z
          .number()
          .min(-180)
          .max(180)
          .describe("Longitude for a location-based search")
          .optional(),
        maxRadiusKm: z
          .number()
          .nonnegative()
          .describe("Search radius in kilometers (default 500)")
          .default(500),
      }),
    },
    async ({
      minMagnitude,
      daysBack,
      latitude,
      longitude,
      maxRadiusKm,
    }: {
      minMagnitude: number;
      daysBack: number;
      latitude?: number;
      longitude?: number;
      maxRadiusKm: number;
    }) => {
      const text = await service.fetchRecentEarthquakes({
        minMagnitude,
        daysBack,
        latitude,
        longitude,
        maxRadiusKm,
      });
      return { content: [{ type: "text" as const, text }] };
    },
  );
}