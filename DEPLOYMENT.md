# Weather MCP Server - Docker Deployment Guide

## 🚀 Estrategia de Despliegue

MCP server federado (tools: `get_alerts`, `get_forecast`, `get_weather_advice`, `get_iss_position`)
con transporte **híbrido**, desplegado siguiendo el flujo de `audio-pro-app`:

- **stdio** → agentes locales (opencode/Claude) invocan el contenedor de forma efímera
- **HTTP (Streamable MCP)** → agentes remotos consumen vía `https://mcp.venus-tek.com/mcp`

### Prerequisites

- Docker Engine en la máquina Lenovo
- Cuenta Docker Hub (`robertclaros`)
- Repositorio con acceso a GitHub

## 🏗 Build & Push de la Imagen

**Vía GitHub Actions (recomendado):**

El workflow `.github/workflows/deploy.yml` hace build y push automático en cada push a `main`
(con path-filter sobre `src`, `Dockerfile`, `package.json`):

1. Genera tag `v1.3.<run_number>`
2. Publica en Docker Hub:
   - `robertclaros/weather-mcp:latest`
   - `robertclaros/weather-mcp:v1.3.<run_number>`
   - `robertclaros/weather-mcp:<sha>`
3. Notifica el webhook n8n (`agent.robertclaros.com/webhook/venus-deploy`)

Requiere secrets en GitHub: `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN`.

**Manual:**

```bash
docker build -t robertclaros/weather-mcp:latest .
docker push robertclaros/weather-mcp:latest
```

## 🚢 Arranque en Producción (HTTP remoto)

```bash
docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f
```

Healthcheck cada 30s contra `/healthz` (reinicio automático tras 3 fallos).

## 🏠 Arranque Local / Dev (HTTP)

El puerto 4000 queda reservado para producción, por eso el compose dev expone
otro puerto del host (default `4001`) configurable con `WEATHER_PORT`.

```bash
docker compose -f docker-compose.dev.yml up -d                 # 127.0.0.1:4001
WEATHER_PORT=4999 docker compose -f docker-compose.dev.yml up -d   # puerto custom
docker compose -f docker-compose.dev.yml ps
docker compose -f docker-compose.dev.yml logs -f
```

Cliente MCP se conecta a `http://127.0.0.1:<WEATHER_PORT>/mcp`.

### Nginx (exposición pública)

En `deployment/nginx/venus-tek.conf` del servidor, añadir el host `mcp.venus-tek.com`:

```nginx
if ($host = "mcp.venus-tek.com") {
    proxy_pass http://localhost:4000;
}
```

Los contenedores ya incluyen SSE (`Upgrade`/`Connection`) y headers `X-Forwarded-*`.
Un cliente MCP se conecta a `https://mcp.venus-tek.com/` (o a `/mcp` si se configura un path).

## 🔌 Consumo Local (stdio)

Los agentes locales consumen la misma imagen vía stdio (sin puerto):

```json
{
  "mcpServers": {
    "weather": {
      "command": "docker",
      "args": ["run", "-i", "--rm", "robertclaros/weather-mcp:latest", "node", "build/server.js"]
    }
  }
}
```

O instalado como paquete:

```bash
npm install -g weather   # bin: weather (stdio) / weather-http (HTTP)
```

## 🔍 Verificación

```bash
# Healthcheck del contenedor
curl -f http://localhost:4000/healthz

# Smoke test MCP (initialize + tools/list)
curl -X POST http://localhost:4000/ \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-03-26","capabilities":{},"clientInfo":{"name":"smoke","version":"0.0.1"}}}'
```

## 🔒 Seguridad

- **Usuario no-root** (`node`) dentro del contenedor
- **Imagen minimizada**: runner solo con runtime deps (`npm ci --omit=dev`)
- **Healthchecks** para reinicio automático
- **Rotación de logs** (`max-size: 10m`)
- Considerar `allowedOrigins`/auth Bearer para el endpoint público en el futuro

## 🛠 Troubleshooting

1. `docker compose -f docker-compose.dev.yml logs weather-mcp`
2. `docker compose -f docker-compose.dev.yml restart weather-mcp`
3. Override local para probar: `docker compose -f docker-compose.dev.yml up --build weather-mcp`
4. Limpieza: `docker compose -f docker-compose.dev.yml down`