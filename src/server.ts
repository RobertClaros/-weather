import { StdioServerTransport } from "@modelcontextprotocol/server/stdio";
import { createMcpWeatherServer } from "./composed.js";

async function main() {
  const server = createMcpWeatherServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Weather MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
