import { createServer } from "node:http";
import { createMcpHandler } from "@modelcontextprotocol/server";
import { toNodeHandler } from "@modelcontextprotocol/node";
import { createMcpServer } from "./composed.js";

const PORT = Number(process.env.PORT ?? 4000);

const mcpHandler = createMcpHandler(
  () => createMcpServer(),
  {
    legacy: "stateless",
    onerror: (error) => {
      console.error("[weather-mcp-http] error:", error);
    },
  },
);

const nodeHandler = toNodeHandler(mcpHandler, {
  onerror: (error) => {
    console.error("[weather-mcp-http] adapter error:", error);
  },
});

const server = createServer((req, res) => {
  if (req.method === "GET" && req.url === "/healthz") {
    res.writeHead(200, { "content-type": "text/plain" });
    res.end("ok");
    return;
  }

  const chunks: Buffer[] = [];
  req.on("data", (chunk: Buffer) => chunks.push(chunk));
  req.on("error", (error) => {
    console.error("[weather-mcp-http] request error:", error);
    if (!res.destroyed) {
      res.writeHead(500, { "content-type": "application/json" });
      res.end(JSON.stringify({ error: "Internal Server Error" }));
    }
  });
  req.on("end", () => {
    const raw = Buffer.concat(chunks).toString("utf8");
    console.error(
      `[http] ${new Date().toISOString()} ${req.method ?? "-"} ${req.url ?? "-"}` +
        (raw ? ` ${raw}` : ""),
    );
    let parsed: unknown;
    if (raw) {
      try {
        parsed = JSON.parse(raw);
      } catch {
        parsed = undefined;
      }
    }
    nodeHandler(req, res, parsed).catch((error) => {
      console.error("[weather-mcp-http] unhandled error:", error);
      if (!res.destroyed) {
        res.writeHead(500, { "content-type": "application/json" });
        res.end(JSON.stringify({ error: "Internal Server Error" }));
      }
    });
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.error(`Weather MCP Server listening on http://0.0.0.0:${PORT}/mcp`);
});

function shutdown(signal: string) {
  console.error(`[weather-mcp-http] ${signal} received, closing server`);
  server.close(() => process.exit(0));
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));