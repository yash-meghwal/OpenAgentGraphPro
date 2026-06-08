# OpenAgentGraph Pro

**Supervise AI work step by step — with graphs that stay central, and language that stays human.**

OpenAgentGraph Pro is the human-friendly edition of [OpenAgentGraph](https://github.com/yash-meghwal/OpenAgentGraph). It adds guided first-run flows, plain-English labels in **Simple** mode, and agent collaboration — without removing the execution graph or operator power in **Advanced** mode.

> **Not the V1 repo.** Pro development must not push to `yash-meghwal/OpenAgentGraph`. This workspace uses a git guard (`npm run pro:git-guard`) and a separate GitHub home.

---

## Get started in 3 steps

### 1. Start the app

```powershell
cd <path-to-OpenAgentGraphPro>
npm ci
npm run dev
```

Open **http://localhost:5173** in your browser. The frontend talks to the backend on port `3001` through the built-in `/api` proxy.

![Home dashboard — screenshot placeholder](docs/images/pro-home.png)

### 2. Create your first project

1. Click **+ New Project** in the top bar.
2. Follow the short welcome wizard (three steps).
3. Describe what you want done in plain language.

![First project wizard — screenshot placeholder](docs/images/pro-wizard.png)

### 3. Run and read the graph

1. Open your project (**Active task**).
2. Set your **project folder** in the top bar if needed.
3. Click **Run** and watch steps appear on the graph.
4. Click any step to read what it means in the panel on the right.

Use **Simple** mode for the human story. Switch to **Advanced** when you need operator controls (filters, drift, bearer tokens, raw statuses).

![Active task graph with step legend — screenshot placeholder](docs/images/pro-active-task.png)

---

## Simple vs Advanced

| | Simple mode | Advanced mode |
|---|-------------|---------------|
| **Audience** | Supervisors, PMs, first-time users | Operators, developers |
| **Graphs** | Same execution graph | Same execution graph |
| **Labels** | Ready / Running / Done / Stuck | Raw statuses, branches, drift |
| **Auth** | **Sign in** | Session details, bearer token |
| **Home** | Needs you now, In progress, Stuck | Urgent runs, frontier, metrics |

Simple labels are **presentation only** — one canonical graph underneath.

---

## Optional: AI assistant setup

You can supervise projects without connecting an AI provider. To enable automated planning and execution:

1. Open **Home**.
2. Expand **Set up AI** (or **Change AI setup**).
3. Pick a provider (Ollama works locally without a cloud key).

---

## For AI assistants and operators

- **Agents:** read [`LLMS.md`](LLMS.md) first, then `docs/OPENAGENTGRAPH-FOR-LLMS.md`.
- **Handoff report:** `npm run handoff:write` writes `GRAPH_REPORT.md` in your workspace (no API key required).
- **Full operator reference:** environment variables, diagnostics, Docker, and deployment notes are in the sections below.

### Agent coordination (Pro)

External agents can read bounded context packs, report progress, and submit plan proposals. Operators accept proposals explicitly — agents do not take over the runner. See `PLAN-OPENAGENTGRAPH-PRO.md` and `skills/openagentgraph/SKILL.md`.

---

## Publish Pro to GitHub

This workspace blocks pushes to the V1 OpenAgentGraph remote. To publish Pro:

```powershell
npm run pro:git-guard
git remote add origin https://github.com/yash-meghwal/OpenAgentGraphPro.git
git push -u origin codex/v2-agent-collaboration:main
```

Replace the URL if your Pro repo lives elsewhere. Never push Pro UX commits to `yash-meghwal/OpenAgentGraph` on `main`.

---

## Environment (quick reference)

Copy `.env.example` to `.env` before first run. Common variables:

| Variable | Purpose |
|----------|---------|
| `PORT` | Backend port (default `3001`) |
| `DATA_DIR` | SQLite data directory |
| `OPENAGENTGRAPH_WORKSPACE_ROOT` | Default project folder for runs |
| `OPENAGENTGRAPH_AUTH_MODE` | `dev_header` (local) or `jwt` (production) |
| `OPENAGENTGRAPH_AI_PROVIDER` | Optional: `ollama`, `openai`, `gemini`, `anthropic` |

Leave `VITE_OPENAGENTGRAPH_API_BASE_URL` unset for local dev (uses `/api` proxy).

See `.env.example` for the full list.

### Diagnostics

- `GET /health` — process alive
- `GET /ready` — ready for core features (check after `npm run dev`)
- `GET /auth/session` — current session summary

---

## Verification

```powershell
npm run build
npm test
```

---

## License

GNU Affero General Public License v3.0 only. See [`LICENSE`](LICENSE).