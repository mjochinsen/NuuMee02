# Feature Development Context Prime

You are building a new feature for NuuMee. This prime loads the task tracker and development workflow.

## First: Check TASK_TRACKER.md

**ALWAYS read `docs/TASK_TRACKER.md` before starting.**

Find:
1. Current phase
2. Current task (first with status: Not Started or In Progress)
3. Dependencies (is anything blocking?)
4. Expected output

## Development Workflow

```
1. Read TASK_TRACKER.md -> Find next task
2. Read relevant files -> Understand context
3. Implement -> Minimal code
4. Test -> Verify it works
5. Update TASK_TRACKER.md -> Mark complete
6. Commit -> Clear message
7. Repeat
```

## Task State Icons

```
[_] Not Started
[>] In Progress
[x] Complete
[!] Blocked (include reason)
```

## Phase Overview

| Phase | Goal |
|-------|------|
| 0 | Foundation - folder structure, stubs |
| 1 | Auth - signup, login, session |
| 2 | Payments - Stripe, credits |
| 3 | Uploads - GCS signed URLs |
| 4 | Jobs - create job, deduct credits |
| 5 | Worker - WaveSpeed processing |
| 6 | Downloads - signed URLs for output |
| 7 | Subscriptions - monthly tiers |
| 8 | Referral - affiliate program |
| 9 | Polish - SEO, a11y, performance |

## Code Targets

| Component | Max Lines |
|-----------|-----------|
| Total codebase | ~5,000 |
| Single component | < 200 |
| Single function | < 30 |

## Before Building Frontend

```bash
# Always verify backend API first
curl https://[API_URL]/openapi.json
```

**Rule:** Backend OpenAPI spec is the source of truth. Frontend MUST match.

## Commit Pattern

After completing a task:
```bash
git add -A
git commit -m "Phase X.Y: [What was done]"
git push origin master
```

## Key Files

| File | Purpose |
|------|---------|
| docs/TASK_TRACKER.md | Current state, next task |
| docs/NUUMEE_MASTER_PLAN.md | Full phase details |
| docs/ORCHESTRATOR_INSTRUCTIONS.md | Agent workflows |
| CREDENTIALS_INVENTORY.md | API keys when needed |
| FromFigmaMake/ | UI designs to match |

## Agent Delegation

For complex tasks, use agents:

| Task Type | Agent |
|-----------|-------|
| FastAPI work | `api-builder` |
| React components | `frontend-dev` |
| Deployment | `deployment-orchestrator` |
| Testing deployment | `deployment-validator` |

## After Each Phase

1. All tasks marked [x] Complete
2. All completion criteria checked
3. Manual tests pass
4. Committed with phase message
5. Ready for next phase
