# Automation Candidates

> **For:** CLAUDY (commands) and FIBY (agents/hooks)
> **Created:** 2025-12-10

Operations frequently performed that should be automated.

---

## HIGH PRIORITY - Commands for CLAUDY

### 1. `/deploy` (see DEPLOY_DIRECTIVE.md)
Deploy backend and/or frontend to production.

### 2. `/typecheck`
Run TypeScript type checking across all packages.

```bash
# Frontend
cd /home/user/NuuMee02/frontend && pnpm tsc --noEmit 2>&1

# Backend (Python - mypy if configured)
cd /home/user/NuuMee02/backend && python -m py_compile app/main.py 2>&1
```

**Output:** Error count, first 10 errors, "all clear" if none.

### 3. `/test-api [endpoint]`
Quick API endpoint verification.

```bash
# Health
curl -s https://nuumee-api-450296399943.us-central1.run.app/health

# Pricing
curl -s "https://nuumee-api-450296399943.us-central1.run.app/api/v1/jobs/cost?job_type=animate&resolution=480p"

# All endpoints
curl -s https://nuumee-api-450296399943.us-central1.run.app/openapi.json | jq '.paths | keys'
```

### 4. `/commit [message]`
Enhanced commit with auto-generated message if none provided.

1. `git status --short`
2. `git diff --stat`
3. Generate message from changes
4. `git add .`
5. `git commit -m "..."`
6. Optionally `git push`

### 5. `/logs [service]`
View recent Cloud Run logs.

```bash
# API logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=nuumee-api" \
  --project=wanapi-prod --limit=20 --format="table(timestamp,textPayload)"

# Worker logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=nuumee-worker" \
  --project=wanapi-prod --limit=20 --format="table(timestamp,textPayload)"
```

### 6. `/stripe-check`
Quick Stripe status check.

- List recent subscriptions
- Check for failed payments
- Show MRR summary

---

## MEDIUM PRIORITY - Hooks for FIBY

### 1. Auto-deploy on git push (PostToolUse hook)
After `git push`, optionally trigger deployment.

### 2. Type-check before commit (PreToolUse hook)
Block `git commit` if TypeScript errors exist.

### 3. Auto-update TASK_TRACKER on deployment
After successful deploy, update tracker with deployment info.

### 4. Memory capture on error resolution
When a bug is fixed, auto-prompt to `/remember bug: ...`.

---

## LOW PRIORITY - Nice to Have

### `/migrate [script]`
Run backend migration scripts.

```bash
cd /home/user/NuuMee02/backend && python scripts/[script].py
```

### `/db-stats`
Quick Firestore collection counts.

### `/cost-check`
GCP billing summary for current month.

---

## Implementation Notes

**For Commands (CLAUDY):**
- Create in `.claude/commands/`
- Use YAML frontmatter for arguments
- Keep bash inline, no external scripts

**For Hooks (FIBY):**
- Create in `.claude/hooks/`
- Use prompt-based hooks for decisions
- Keep lightweight (< 5 second execution)

**For Agents (FIBY):**
- Only if task is complex/multi-step
- Prefer commands for simple automation
