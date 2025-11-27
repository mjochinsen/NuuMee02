# NuuMee02 - Claude Context

## Identity

AI video generation SaaS (nuumee.ai)
Tech stack: Next.js + FastAPI + Firebase + Firestore + Stripe + GCS

**Repo:** https://github.com/mjochinsen/NuuMee02
**Branch:** master
**GCP Project:** wanapi-prod
**Firebase Hosting Site:** nuumee-66a48

---

## Session Start Protocol

```
1. Read TASK_TRACKER.md - determine current phase/task
2. Read CURRENT STATE section inside tracker
3. Identify the next task (In Progress or Not Started)
4. Execute ONLY that task
5. Update TASK_TRACKER.md - mark as Complete
6. Continue until the phase is finished
```

**Never start a new task without checking TASK_TRACKER.md first.**

---

## Critical Files

| File | Purpose |
|------|---------|
| [docs/TASK_TRACKER.md](../docs/TASK_TRACKER.md) | **ALWAYS READ FIRST** - Current state |
| [CREDENTIALS_INVENTORY.md](../CREDENTIALS_INVENTORY.md) | API keys, env vars |
| [docs/NUUMEE_MASTER_PLAN.md](../docs/NUUMEE_MASTER_PLAN.md) | Phase-by-phase roadmap |
| [docs/ORCHESTRATOR_INSTRUCTIONS.md](../docs/ORCHESTRATOR_INSTRUCTIONS.md) | Agent workflows |
| [docs/firestore-schema.md](../docs/firestore-schema.md) | Database reference |
| [docs/PRICING_STRATEGY.md](../docs/PRICING_STRATEGY.md) | Credits and packages |
| [LESSONS_LEARNED.md](../LESSONS_LEARNED.md) | Avoid past bugs |

---

## FIBY - Agent Master

**FIBY** is the meta-agent that manages all 40 agents. Use FIBY when you need to:

| Action | Command |
|--------|---------|
| Create new agent | `/ask-fiby create agent for {purpose}` |
| Audit agent | `/ask-fiby audit {agent-name}` |
| Get guidance | `/ask-fiby which agent for {task}` |
| Improve agent | `/ask-fiby improve {agent-name}` |

**Documentation:** [docs/FIBY_AGENT_MASTER.md](../docs/FIBY_AGENT_MASTER.md)

**Communication Protocol:**
```
KODY -> .claude/requests/ -> FIBY -> .claude/responses/ -> KODY
```

---

## Agent Routing

| Task | Agent |
|------|-------|
| FastAPI endpoints | `api-builder` |
| Next.js components | `frontend-dev` |
| Full deployment | `deployment-orchestrator` |
| Deployment testing | `deployment-validator` |
| SEO | `seo-meta-tags` |
| Accessibility | `accessibility-auditor` |
| Performance | `performance-optimizer` |
| Final polish | `polish-orchestrator` |
| **Agent help** | `/ask-fiby` |

---

## Tech Stack

- **Frontend:** Next.js 14, TypeScript, Tailwind, shadcn/ui
  - Location: `/frontend`

- **Backend:** FastAPI (Python 3.11), Cloud Run
  - Location: `/backend`

- **Worker:** Python Cloud Run service for WaveSpeed processing
  - Location: `/worker`

- **Database:** Firestore (project: wanapi-prod)

- **Auth:** Firebase Auth (client SDK only)

- **Payments:** Stripe

- **Storage:** Google Cloud Storage

- **AI:** WaveSpeed.ai

---

## Anti-Patterns (NEVER DO)

### Auth Bug (caused infinite login loops)

```typescript
// WRONG - 403 means "forbidden", not "unauthenticated"
if (response.status === 403) auth.signOut();

// RIGHT - Only logout on 401
if (response.status === 401) auth.signOut();
```

### Other Critical Mistakes

- Backend handling passwords (use Firebase ID tokens only)
- Frontend built before backend endpoints exist
- Over-engineering (target total code < 5,000 lines)
- Deleting .claude/ or .vscode/
- Skipping phases

---

## Code Standards

- TypeScript strict mode
- Tailwind only (no CSS files)
- Components < 200 lines
- Functions < 30 lines
- Flat folder structure
- UI must match FromFigmaMake/

---

## Claude Rules

### Access Rules

- Load ONLY the files relevant to the current task
- Do NOT read the entire repo unless explicitly asked
- Do NOT modify .claude/agents unless instructed
- Do NOT invent new folder structures

### Output Rules

- Minimal code
- No unnecessary abstractions
- One feature -> test -> commit -> next feature

---

## Commands

| Command | Use When |
|---------|----------|
| `/ask-fiby` | Need agent help, creation, or audits |
| `/check-todos` | Track task progress |
| `/create-prompt` | Need optimized prompts |
| `/whats-next` | Session handoff |

---

## Task State Icons

```
[_] Not Started
[>] In Progress
[x] Complete
[!] Blocked (include reason)
```

---

## Deploy Commands

```bash
# Backend to Cloud Run
gcloud run deploy nuumee-api --source backend/ --region us-central1 --project wanapi-prod

# Frontend to Firebase Hosting
cd frontend && pnpm build && cd .. && firebase deploy --only hosting

# Worker (no public access)
gcloud run deploy nuumee-worker --source worker/ --region us-central1 --project wanapi-prod --no-allow-unauthenticated
```

---

## When Stuck

1. Check TASK_TRACKER.md for dependencies
2. Check CREDENTIALS_INVENTORY.md for secrets
3. Check LESSONS_LEARNED.md for known issues
4. Time-box to 30 minutes
5. Ask the user for clarification

---

## Project State

- Phase 0: Not started (111 total tasks across 10 phases)
- Infrastructure: Deployed (wanapi-prod, Cloud Run, Stripe ready)
- Design assets: `FromFigmaMake/`
- Target: ~5,000 lines of code
