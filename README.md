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

To run multiple copies side by side, use the stack scripts:

```bash
npm run dev:1 # backend 2001
npm run dev:2 # backend 2003
npm run dev:3 # backend 2005
npm run dev:4 # backend 2007
npm run dev:5 # backend 2009
```

## Environment

- `BACKEND_PORT`: backend API port, defaults to `2001`.

## Shape

- `apps/backend`: NestJS API with DTO-documented OpenAPI output.
- Root `package.json`: npm workspaces monorepo scripts for build, dev, test, and OpenAPI generation.
