# Codex Symphony Demo

A local Trello-style control plane for demonstrating the Symphony orchestration pattern with Codex.

The demo has two modes:

- `mock` mode, the default, simulates Codex runs so the board is reliable for demos.
- `codex` mode launches `codex app-server` over stdio and streams real thread, turn, item, and log events into the board.

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

The backend listens on `http://localhost:3001` and persists data in `data/symphony-demo.sqlite`.

To run multiple copies side by side, use the stack scripts:

```bash
npm run dev:1 # UI 2000, backend 2001, data/database-1.sqlite
npm run dev:2 # UI 2002, backend 2003, data/database-2.sqlite
npm run dev:3 # UI 2004, backend 2005, data/database-3.sqlite
npm run dev:4 # UI 2006, backend 2007, data/database-4.sqlite
npm run dev:5 # UI 2008, backend 2009, data/database-5.sqlite
```

## Real Codex Mode

Use the per-task mode selector in the UI, or set the default backend mode:

```bash
CODEX_DEMO_AGENT_MODE=codex npm run dev
```

Optional environment variables:

- `CODEX_DEMO_AGENT_MODE`: `mock` or `codex`, defaults to `mock`.
- `CODEX_DEMO_MODEL`: model passed to `thread/start`, defaults to `gpt-5.4`.
- `CODEX_DEMO_WORKSPACE_ROOT`: workspace root, defaults to `data/workspaces`.
- `UI_PORT`: Vite development server port, defaults to `5173`.
- `BACKEND_PORT`: backend API port, defaults to `3001`.
- `DATABASE_PATH`: SQLite path resolved from the repo root, defaults to `data/symphony-demo.sqlite`.
- `CODEX_DEMO_MAX_CONCURRENT`: max active runs, defaults to `2`.
- `CODEX_APP_SERVER_COMMAND`: executable, defaults to `codex`.
- `CODEX_APP_SERVER_ARGS`: JSON array of args, defaults to `["app-server"]`.

## Shape

- `apps/backend`: NestJS API, SQLite persistence, orchestration queue, SSE event stream, Codex app-server client.
- `apps/ui`: React/Vite board with task creation, drag-to-move columns, run controls, and live run logs.

The implementation maps the Symphony spec into a visual demo:

- task board as the issue tracker/control plane
- one workspace per task
- single orchestrator authority for dispatch, cancellation, and run state
- persisted tasks, runs, and logs
- status surface driven by backend events
