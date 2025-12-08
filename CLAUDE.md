# NuuMee02 - Claude Context

## Golden Rule

Don't guess — check the repo. Don't assume — read the file. Don't over-engineer — follow the task. Don't skip steps — follow TASK_TRACKER.

---

## Core Rules (ENFORCED)

**Minimal Loading:** Load as little as possible. Use `/prime-*` commands for domain context. Never load entire repo trees unless explicitly requested.

**Safe Editing:** Before modifying any file: 1) Read the file, 2) Explain intent, 3) Ask confirmation if destructive, 4) Write minimally, 5) Log the operation.

**Never Modify Without Permission:**

- `.claude/` (agents, hooks, primes, memory)
- `.vscode/`
- `CLAUDE.md`
- `.mcp.json` (MCP server credentials)
- Credentials files

---

## Three Pillars

**KODY** — Orchestrator & Application Engineer

KODY is NOT a solo agent. KODY delegates, coordinates, and writes code after delegation responses.

**Before starting any task:**

1. Classify: frontend / backend / bug / feature / deployment
2. Load the correct `/prime-*` command
3. If task affects >2 files, DELEGATE to the correct agent
4. Sub-agents return code only. KODY writes all files.

**Delegation Checklist:**

- Multi-file task? → Delegate
- UI/component work? → `frontend-dev`
- API endpoint? → `api-builder`
- Need codebase research? → `explorer` agent
- Deployment? → `deployment-orchestrator`

**CLAUDY** — Claude Code Environment Optimizer

- Owns: CLAUDE.md, prime commands, context reduction, session optimization

**FIBY** — Framework Infrastructure Builder

- Owns: Agents, hooks, memory system, auditor, orchestration docs
- Only FIBY may create/modify agents

---

## Identity

AI video generation SaaS (nuumee.ai)
Tech stack: Next.js + FastAPI + Firebase + Firestore + Stripe + GCS

**Repo:** https://github.com/mjochinsen/NuuMee02
**Branch:** master
**GCP Project:** wanapi-prod
**Domain:** nuumee.ai

---

## Structure

```
frontend/    Next.js 14, TypeScript, Tailwind, shadcn/ui
backend/     FastAPI (Python 3.11), Cloud Run
worker/      Video processing, WaveSpeed.ai
docs/        Specs, schemas, plans
```

---

## MCP Servers (External Tool Integrations)

6 MCP servers provide direct tool access. **Prefer MCP tools over CLI commands.**

| Server | Purpose | Key Tools |
|--------|---------|-----------|
| `github` | PR/issue management, code search | `list_pull_requests`, `create_issue`, `search_code` |
| `stripe` | Subscriptions, payments, customers | `list_subscriptions`, `list_customers`, `create_payment_link` |
| `playwright` | E2E testing, browser automation | `playwright_navigate`, `playwright_screenshot`, `playwright_click` |
| `apidog` | API documentation, OpenAPI specs | `read_project_oas`, `refresh_project_oas` |
| `gcp` | Cloud Run logs, billing, resources | `get-logs`, `get-billing-info`, `list-sql-instances` |
| `figma` | Design extraction | (via figma-extractor agent) |

**Tool Naming:** `mcp__{server}__{tool}` (e.g., `mcp__stripe__list_subscriptions`)

**MCP vs CLI Preference:**

| Task | Use MCP | NOT CLI |
|------|---------|---------|
| List PRs, create issues | `mcp__github__*` | `gh pr list` |
| Query subscriptions | `mcp__stripe__*` | Stripe dashboard |
| Check Cloud Run logs | `mcp__gcp__get-logs` | `gcloud logs read` |
| Browser testing | `mcp__playwright__*` | Manual testing |
| Read API specs | `mcp__apidog__*` | Apidog website |

**Config:** `.mcp.json` (credentials - do not commit to public repos)

**MCP Server Notes:**

| Server | Status | Notes |
|--------|--------|-------|
| `gcp` | ⚠️ Partial | `run-gcp-code` broken (ESM error). Use `get-logs`, `get-billing-info`, `list-*` instead |
| `apidog` | ✅ Working | Tool names include project suffix (e.g., `read_project_oas_pg3h8i`) |
| Others | ✅ Working | Full functionality |

---

## Prime Commands (Load Context On-Demand)

| Command           | Use When                                      |
| ----------------- | --------------------------------------------- |
| `/prime-frontend` | Working on Next.js, components, UI            |
| `/prime-backend`  | Working on FastAPI, Firestore, auth           |
| `/prime-bug`      | Debugging, fixing issues                      |
| `/prime-feature`  | Building new features, following TASK_TRACKER |

**Prime Routing:** Use primes to load domain context. Never analyze or modify code BEFORE priming. Never prime unnecessarily.

- UI/component/page work → `/prime-frontend`
- API/endpoint/FastAPI work → `/prime-backend`
- Bug/debug/error/fix work → `/prime-bug`
- Feature/implement/task work → `/prime-feature`

See [PRIME_SYSTEM.md](../docs/agents/orchestration/systems/PRIME_SYSTEM.md) for details.

---

## Systems (Hooks, Memory, Agents)

**Memory:** `/remember {category}: {content} [tags: x,y]` | `/recall {query}` | `/recall --stats`
Categories: insight, pattern, decision, bug, preference

**Audit:** `/audit` (full) | `/audit quick` (security + TODOs)

See [INFRASTRUCTURE_REFERENCE.md](../docs/agents/orchestration/systems/INFRASTRUCTURE_REFERENCE.md) for:
- Sub-agent file write limitations
- Hooks system (auto-approve, blocked ops, logs)
- Agent inventory

**Orchestration Patterns:**
- [DELEGATION_CONTRACT.md](../docs/agents/orchestration/DELEGATION_CONTRACT.md) - 5-element contract
- [ORCHESTRATOR_PATTERN.md](../docs/agents/orchestration/ORCHESTRATOR_PATTERN.md) - Orchestrator-workers
- [CHECKPOINTING.md](../docs/agents/orchestration/CHECKPOINTING.md) - Recovery patterns

## Agent Routing

| Task               | Agent                     |
| ------------------ | ------------------------- |
| FastAPI endpoints  | `api-builder`             |
| Next.js components | `frontend-dev`            |
| Deployment         | `deployment-orchestrator` |
| Agent help         | `/ask-fiby`               |

**Multi-Agent Rules:**

- KODY SHOULD delegate multi-file tasks to specialized agents
- Only FIBY may create/modify agents
- Only CLAUDY may modify primes
- Sub-agents return code, KODY writes files

**Model Selection:**

- Use `opus` for: orchestration, architecture decisions, complex debugging, multi-file refactors, planning
- Use `sonnet` for: standard implementation, simple fixes, routine tasks
- Use `haiku` for: quick lookups, simple searches, validation checks

### Sub-Agent Invariant (ENFORCED)

Sub-agents are isolated. Their file writes NEVER persist.

Every sub-agent delegation MUST include the 5-element contract:
1. **OBJECTIVE** - specific goal
2. **OUTPUT FORMAT** - FILE: path + code block
3. **TOOLS** - allowed tools (never Write/Edit)
4. **SOURCES** - files to reference
5. **BOUNDARIES** - what NOT to do

See: [DELEGATION_CONTRACT.md](../docs/agents/orchestration/DELEGATION_CONTRACT.md)

**KODY must write all files.**

## Safety Rules (NEVER DO)

- Backend NEVER handles passwords (Firebase ID tokens only)
- NEVER delete .claude/ or .vscode/
- NEVER skip phases
- NEVER over-engineer (target < 5,000 lines)

## Code Standards

- TypeScript strict mode
- Tailwind only (no CSS files)
- Components < 200 lines
- Functions < 30 lines
- UI must match FromFigmaMake/

## Quick Reference

| File                     | Purpose                  |
| ------------------------ | ------------------------ |
| docs/TASK_TRACKER.md     | Current phase/task state |
| CREDENTIALS_INVENTORY.md | API keys, env vars       |
| LESSONS_LEARNED.md       | Past mistakes to avoid   |
| .mcp.json                | MCP server credentials   |

## Workflow Quick Reference

| Situation                  | Action                                  |
| -------------------------- | --------------------------------------- |
| Learned something useful   | `/remember insight: ...`                |
| Fixed tricky bug           | `/remember bug: cause was X, fix was Y` |
| Need context on topic      | `/recall {topic}`                       |
| Delegating to sub-agent    | Use 5-element contract from DELEGATION_CONTRACT.md |
| Task completed             | Checkpoint: TASK_TRACKER + `/remember`  |
| Before committing          | `/audit quick`                          |
| Starting domain work       | `/prime-frontend` or `/prime-backend`   |
| Session handoff            | `/whats-next`                           |
| Need agent help            | `/ask-fiby`                             |
| Deploy to production       | `/deploy-firebase`                      |
| Check PR status            | `mcp__github__list_pull_requests`       |
| Query subscriptions        | `mcp__stripe__list_subscriptions`       |
| Debug Cloud Run            | `mcp__gcp__get-logs`                    |
| Verify deployment          | `mcp__playwright__playwright_navigate`  |

---

## When Stuck

1. Check TASK_TRACKER.md
2. Check CREDENTIALS_INVENTORY.md
3. Check LESSONS_LEARNED.md
4. `/recall {problem domain}`
5. Time-box 30 min, then ask user
