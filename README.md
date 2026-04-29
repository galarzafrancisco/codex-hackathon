# Codex Symphony Demo

Starter npm-workspaces monorepo for the Codex Symphony demo.

## Run

```bash
npm install
npm run dev
```

The backend listens on `http://localhost:2001` by default. Override it with `BACKEND_PORT`:

```bash
BACKEND_PORT=2001 npm run dev
```

Health check:

```text
http://localhost:2001/api/v1/health
```

OpenAPI docs:

```text
http://localhost:2001/api/v1/docs
```

Generate the OpenAPI JSON spec:

```bash
npm run openapi
```

The generated spec is written to `apps/backend/openapi.json`.

Generate the frontend API client from the backend OpenAPI spec:

```bash
npm run generate:api
```

This writes the backend spec to `apps/backend/openapi.json`, copies it to
`apps/ui/openapi.json`, and runs `openapi-sdkgen ./openapi.json ./generated`
inside `apps/ui`.

To run multiple copies side by side, use the stack scripts:

```bash
npm run dev:1 # UI 2000, backend 2001, data/database-1.sqlite
npm run dev:2 # UI 2002, backend 2003, data/database-2.sqlite
npm run dev:3 # UI 2004, backend 2005, data/database-3.sqlite
npm run dev:4 # UI 2006, backend 2007, data/database-4.sqlite
npm run dev:5 # UI 2008, backend 2009, data/database-5.sqlite
```

## Environment

- `BACKEND_PORT`: backend API port, defaults to `2001`.

## Shape

- `apps/backend`: NestJS API, SQLite persistence, orchestration queue, SSE event stream, Codex app-server client.
- `apps/ui`: React/Vite board with task creation, drag-to-move columns, run controls, and live run logs.
- Root `package.json`: npm workspaces monorepo scripts for build, dev, test, and OpenAPI generation.

The implementation maps the Symphony spec into a visual demo:

- task board as the issue tracker/control plane
- one workspace per task
- single orchestrator authority for dispatch, cancellation, and run state
- persisted tasks, runs, and logs
- status surface driven by backend events
