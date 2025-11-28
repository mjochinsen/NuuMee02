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

### PRIME System Architecture

**Why primes exist:** This CLAUDE.md is a minimal kernel (~90 lines). Domain-specific context lives in prime commands to reduce token waste. Load only what you need.

**How to use:**
1. Session starts → kernel loads automatically (this file)
2. Task begins → run the relevant `/prime-*` command
3. Prime loads → domain context now in memory
4. Task changes domain → run a different prime

**Rules:**
- One prime per domain (don't stack frontend + backend)
- Primes are additive to kernel, not replacements
- If task spans domains, pick the primary one
- Re-run prime if context gets stale after long conversations

**Prime contents:**
- `/prime-frontend` → Next.js patterns, Tailwind, testing, FromFigmaMake refs
- `/prime-backend` → FastAPI patterns, Firestore, Firebase Admin, deploy
- `/prime-bug` → Debug workflow, known bugs, common pitfalls, time-boxing
- `/prime-feature` → TASK_TRACKER workflow, phases, code targets, agents

---

## Agent Routing

| Task | Agent |
|------|-------|
| FastAPI endpoints | `api-builder` |
| Next.js components | `frontend-dev` |
| Deployment | `deployment-orchestrator` |
| Agent help | `/ask-fiby` |

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
