# Dataset Chart Generation — Apache ECharts Visualizer

A modern, high-performance web application showcasing interactive data visualization with **Apache ECharts** and **`echarts-for-react`**. The application enables users to upload CSV or Excel (`.xlsx`) datasets and instantly generate interactive, responsive, and customizable charts.

Built with a stateless **Fastify 5** backend and a **React 19 + Tailwind CSS v4** frontend, optimized with **pnpm workspaces** and production-grade **Docker** containerization.

<img width="1901" height="927" alt="image" src="https://github.com/user-attachments/assets/c1c4162c-ae61-45df-9b5a-3fbcb38f90a0" />
<img width="1901" height="927" alt="image" src="https://github.com/user-attachments/assets/251a8f95-9fe1-454f-aa6e-abe4dd347d3a" />


---

## Features

- **Interactive ECharts Visualization**: Powered by `echarts-for-react` and Apache ECharts 5 with rich toolbox capabilities (PNG export with 2x resolution, restore, data zoom, axis tooltips).
- **Multi-Format Dataset Support**: Native parsing for comma-separated values (`.csv`) and Excel spreadsheets (`.xlsx`).
- **Smart Column Type Inference**: Automatically detects column types (`number`, `string`, `boolean`, `date`, `mixed`) with formatted indicator badges.
- **Dynamic Field Resolution**:
  - Automatically maps appropriate category and numeric columns to X and Y axes.
  - Fully customizable: select any detected column for the X or Y axis.
- **Multiple Visualization Types**:
  - **Bar Chart**: Ideal for discrete category comparisons.
  - **Line Chart**: Suited for trends, time series, and sequential data.
  - **Pie Chart**: Visualizes proportion distributions.
  - **Scatter Plot**: Explores numerical correlations across two continuous variables.
- **1-Click Sample Datasets**: Includes pre-built sample datasets (Monthly Sales, Market Share, Height vs. Weight) for instant exploration.
- **Stateless Architecture**: No database or Redis dependencies; fast in-memory parsing and chart option synthesis.
- **Large Dataset Protection**: Gracefully handles large files up to 5 MB and automatically truncates to the first 5,000 rows with user notifications.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite 6, Tailwind CSS v4, Lucide React, `echarts-for-react`, Apache ECharts 5 |
| **Backend** | Node.js 22, Fastify 5, `@fastify/multipart`, `@fastify/cors`, `@fastify/sensible`, `csv-parse`, `exceljs`, Zod |
| **Package Manager** | `pnpm` (Workspace Monorepo) |
| **Testing** | Node.js Test Runner (`node:test`), `supertest` |
| **Containers** | Multi-stage Dockerfiles (`node:22-slim`, `nginx:alpine`), Docker Compose Watch |

---

## Clean Architecture & Project Structure

```
dataset-chart-generation/
├── backend/
│   ├── src/
│   │   ├── commons/
│   │   │   ├── interfaces/dataset/      # Domain models (DatasetField, ParsedDataset, etc.)
│   │   │   └── schemas/                 # Zod validation schemas (chartConfig, request)
│   │   ├── config/                      # Environment variables validation
│   │   ├── controllers/                 # Fastify HTTP request handlers
│   │   ├── routes/                      # Route registration (/chart, /api/chart)
│   │   ├── services/dataset/            # Core business logic:
│   │   │   ├── index.ts                 # DatasetService orchestrator
│   │   │   ├── parseFile.ts             # Format detector & dispatcher
│   │   │   ├── inferFields.ts           # Automatic column type inference
│   │   │   ├── buildChartOption.ts      # ECharts option synthesis
│   │   │   └── parsers/                 # Format-specific parsers (CSV, XLSX)
│   │   ├── utils/                       # Validation helpers
│   │   ├── app.ts                       # Fastify application factory
│   │   └── server.ts                    # Server entrypoint and graceful shutdown
│   ├── test/                            # Comprehensive integration test suite
│   ├── Dockerfile.dev                   # Development container with tsx watch
│   └── Dockerfile.prod                  # 4-stage hardened production build
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── chart/                   # Chart preview, dropzone, selectors, samples
│   │   │   └── layout/                  # Navigation bar and header
│   │   ├── services/                    # API client for chart generation
│   │   ├── types/                       # TypeScript interfaces
│   │   ├── utils/                       # Formatters and label helpers
│   │   ├── App.tsx                      # Main single-page application
│   │   └── main.tsx                     # React root mount
│   ├── nginx.conf                       # Reverse proxy and static cache configuration
│   ├── Dockerfile.dev                   # Development container with Vite HMR
│   └── Dockerfile.prod                  # Multi-stage build + Nginx Alpine runtime
├── docker-compose.yml                   # Development stack with Compose Watch
├── docker-compose.prod.yml              # Production stack with healthchecks
├── pnpm-workspace.yaml                  # pnpm workspace configuration
└── package.json                         # Root monorepo scripts
```

---

## Getting Started

### Prerequisites

- **Node.js** `>= 22`
- **pnpm** `>= 10` (or Docker)

### Installation

```bash
# Clone repository
git clone <repo-url>
cd dataset-chart-generation

# Install dependencies across all workspace packages
pnpm install
```

### Running Locally

```bash
# Run both backend and frontend concurrently
pnpm dev

# Or run separately:
pnpm dev:backend   # Fastify runs on http://localhost:3000
pnpm dev:frontend  # Vite runs on http://localhost:5173
```

### Running Tests

```bash
pnpm test
```

### Production Build

```bash
pnpm build
```

---

## Docker Workflows

The Docker setup is inspired by the containerization best practices demonstrated in `docker-showcase`.

### 1. Development Mode (with Docker Compose Watch)

Enables sub-second file synchronization and hot-reloading without container restarts:

```bash
docker compose up --watch
```

- **Backend**: Changes in `backend/src` synchronize instantly into `/app/backend/src`, with `tsx watch --include 'src/**/*'` providing atomic file-change reloading.
- **Frontend**: Changes in `frontend/src` or `frontend/index.html` stream directly into Vite for instant HMR.
- Dependency updates to `package.json` trigger automatic container rebuilds.

### 2. Production Mode (Hardened & Multi-Stage)

Builds lean, security-hardened images:

```bash
# Build production images
docker compose -f docker-compose.prod.yml build

# Start production stack
docker compose -f docker-compose.prod.yml up -d
```

- **Backend**:
  - Multi-stage build (`base` -> `install` -> `prerelease` -> `release`).
  - Production pruning via `pnpm prune --prod`.
  - Runs under the unprivileged `USER node` account.
  - Healthcheck monitoring `/health`.
- **Frontend**:
  - Node.js build stage compiles static bundles.
  - Runtime uses ultra-lightweight `nginx:alpine` (~25MB transfer size).
  - Gzip compression enabled for all static assets.
  - Reverse proxies `/api/` and `/chart/` directly to backend container.

---

## API Reference

### Health Check

`GET /health`

**Response (`200 OK`)**:
```json
{
  "status": "ok",
  "service": "dataset-chart-generation-backend",
  "timestamp": "2026-09-28T02:00:00.000Z"
}
```

### Generate Chart from Dataset

`POST /api/chart/generate-from-dataset`

**Content-Type**: `multipart/form-data`

| Form Field | Type | Required | Description |
|---|---|---|---|
| `file` | Binary | Yes | CSV or XLSX file (max 5 MB) |
| `chartType` | String | No | One of `'bar'`, `'line'`, `'pie'`, `'scatter'` (default: `'bar'`) |
| `xField` | String | No | Field name to bind to the X axis / category |
| `yField` | String | No | Field name to bind to the Y axis / value |

**Response (`200 OK`)**:
```json
{
  "chartData": {
    "option": {
      "tooltip": { "trigger": "axis" },
      "legend": { "show": false },
      "xAxis": {
        "type": "category",
        "data": ["Jan", "Feb", "Mar"],
        "name": "Month"
      },
      "yAxis": {
        "type": "value",
        "name": "Sales"
      },
      "series": [
        {
          "type": "bar",
          "name": "Sales",
          "data": [100, 200, 300]
        }
      ]
    }
  },
  "fields": [
    { "name": "Month", "type": "string" },
    { "name": "Sales", "type": "number" }
  ],
  "selectedType": "bar",
  "selectedXField": "Month",
  "selectedYField": "Sales",
  "truncated": false,
  "datasetInfo": {
    "fileName": "sales.csv",
    "mimeType": "text/csv",
    "fileSize": 48
  }
}
```

---

## License

MIT
