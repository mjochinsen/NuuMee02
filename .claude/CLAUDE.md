# NuuMee02 - Claude Context

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

## Prime Commands (Load Context On-Demand)

| Command | Use When |
|---------|----------|
| `/prime-frontend` | Working on Next.js, components, UI |
| `/prime-backend` | Working on FastAPI, Firestore, auth |
| `/prime-bug` | Debugging, fixing issues |
| `/prime-feature` | Building new features, following TASK_TRACKER |

See [PRIME_SYSTEM.md](../docs/agents/orchestration/systems/PRIME_SYSTEM.md) for details.

---

## Systems (Hooks, Memory, Agents)

**Memory:** `/remember {category}: {content} [tags: x,y]` | `/recall {query}` | `/recall --stats`
Categories: insight, pattern, decision, bug, preference

**Audit:** `/audit` (full) | `/audit quick` (security + TODOs)

See [INFRASTRUCTURE_REFERENCE.md](../docs/agents/orchestration/systems/INFRASTRUCTURE_REFERENCE.md) for full details.

---

## Agent Routing

| Task | Agent |
|------|-------|
| FastAPI endpoints | `api-builder` |
| Next.js components | `frontend-dev` |
| Deployment | `deployment-orchestrator` |
| Agent help | `/ask-fiby` |

### Sub-Agent Contract (MANDATORY)

Sub-agents cannot persist file writes. When delegating code generation:

**Your prompt MUST include:**
> DO NOT write files. Return: 1) exact file path, 2) complete code in fenced block.

**On response:** Validate content, use Write/Edit yourself, log action.

---

## Safety Rules (NEVER DO)

```typescript
// Auth bug - NEVER logout on 403
if (response.status === 403) auth.signOut(); // WRONG
if (response.status === 401) auth.signOut(); // RIGHT
```

- Backend NEVER handles passwords (Firebase ID tokens only)
- NEVER delete .claude/ or .vscode/
- NEVER skip phases
- NEVER over-engineer (target < 5,000 lines)

---

## Code Standards

- TypeScript strict mode
- Tailwind only (no CSS files)
- Components < 200 lines
- Functions < 30 lines
- UI must match FromFigmaMake/

---

## Quick Reference

| File | Purpose |
|------|---------|
| docs/TASK_TRACKER.md | Current phase/task state |
| CREDENTIALS_INVENTORY.md | API keys, env vars |
| LESSONS_LEARNED.md | Past mistakes to avoid |

---

## When Stuck

1. Check TASK_TRACKER.md
2. Check CREDENTIALS_INVENTORY.md
3. Check LESSONS_LEARNED.md
4. Time-box 30 min, then ask user
