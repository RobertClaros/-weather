import { McpServer } from "@modelcontextprotocol/server";
import type { IssServicePort } from "../../../domain/ports/iss-service.port.js";

export function registerMcpIssTools(
  server: McpServer,
  service: IssServicePort,
): void {
  server.registerTool(
    "get_iss_position",
    {
      description: "Get the current position of the International Space Station",
    },
    async () => {
      const text = await service.fetchCurrentPosition();
      return { content: [{ type: "text" as const, text }] };
    },
  );
}