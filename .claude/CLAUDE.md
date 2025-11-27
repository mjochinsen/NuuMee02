# NuuMee02  Claude Context

## Identity
AI video generation SaaS (nuumee.ai). Firebase + Next.js + FastAPI + Stripe.

**Repo:** https://github.com/mjochinsen/NuuMee02 | **Branch:** master

---

## Session Start Protocol

```
1. Read TASK_TRACKER.md ’ Get current phase/task
2. Check CURRENT STATE section ’ Know where you are
3. Find next  task ’ Execute it
4. Update TASK_TRACKER.md ’ Mark 
5. Repeat until phase complete
```

---

## Critical Files

| File | Read When |
|------|-----------|
| [TASK_TRACKER.md](../TASK_TRACKER.md) | **ALWAYS FIRST** - Current state |
| [CREDENTIALS_INVENTORY.md](../CREDENTIALS_INVENTORY.md) | Any API/config work |
| [NUUMEE_MASTER_PLAN.md](../NUUMEE_MASTER_PLAN.md) | Need phase details |
| [ORCHESTRATOR_INSTRUCTIONS.md](../ORCHESTRATOR_INSTRUCTIONS.md) | Workflow reference |
| [docs/PRICING_STRATEGY.md](../docs/PRICING_STRATEGY.md) | Credits/payments |
| [docs/firestore-schema.md](../docs/firestore-schema.md) | Database work |
| [LESSONS_LEARNED.md](../LESSONS_LEARNED.md) | Before implementing |

---

## Agent Routing

| Task Type | Agent | Notes |
|-----------|-------|-------|
| FastAPI endpoints | `api-builder` | Has patterns, error handling |
| React/Next.js | `frontend-dev` | Component patterns, hooks |
| Deployment | `deployment-orchestrator` | Coordinates full deploy |
| Validation | `deployment-validator` | Test checklist |
| SEO | `seo-meta-tags` | Meta, JSON-LD, sitemap |
| Accessibility | `accessibility-auditor` | WCAG 2.1 AA |
| Performance | `performance-optimizer` | Bundle, lazy loading |
| Polish (all) | `polish-orchestrator` | Runs all QA agents |

---

## Tech Stack

- **Frontend:** Next.js 14, TypeScript, Tailwind, shadcn/ui
- **Backend:** FastAPI (Python 3.11), Cloud Run
- **Database:** Firestore (wanapi-prod)
- **Auth:** Firebase Auth (client SDK only)
- **Payments:** Stripe
- **Storage:** GCS
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
- Backend receiving passwords (use Firebase ID tokens only)
- Building frontend before verifying backend OpenAPI spec
- Over-engineering (target ~5K lines total, not 35K)
- Deleting .claude or .vscode folders
- Skipping phases

---

## Code Standards

- TypeScript strict mode
- Tailwind only (no CSS files)
- Components < 200 lines
- Functions < 30 lines
- Flat structure (no deep nesting)
- UI from `FromFigmaMake/` designs

---

## Commands

| Command | Use When |
|---------|----------|
| `/check-todos` | Track progress |
| `/create-prompt` | Need optimized prompts |
| `/whats-next` | Session handoff |

---

## Token Optimization

**DO:**
- Read TASK_TRACKER.md first (small file, full context)
- Only read files relevant to current task
- Use agents for complex tasks
- Update tracker after each task
- Use `/clear` between unrelated tasks

**DON'T:**
- Read entire codebase at start
- Re-read unchanged files
- Keep large files in context
- Skip tracker updates

---

## Task State Flow

```
 Not Started ’ = In Progress ’  Complete
                              ˜ L Blocked (note reason)
```

---

## Deploy Commands

```bash
# Backend to Cloud Run
gcloud run deploy nuumee-api --source backend/ --region us-central1 --project wanapi-prod

# Frontend to Firebase
cd frontend && pnpm build && cd .. && firebase deploy --only hosting

# Worker (no public access)
gcloud run deploy nuumee-worker --source worker/ --region us-central1 --project wanapi-prod --no-allow-unauthenticated
```

---

## When Stuck

1. Check TASK_TRACKER.md for dependencies
2. Check CREDENTIALS_INVENTORY.md for secrets
3. Check LESSONS_LEARNED.md for known issues
4. Time-box to 30 min, then ask user

---

## Project State

- Phase 0: Not started (111 total tasks across 10 phases)
- Infrastructure: Deployed (wanapi-prod, Cloud Run, Stripe ready)
- Design assets: `FromFigmaMake/`
- Target: ~5,000 lines of code
