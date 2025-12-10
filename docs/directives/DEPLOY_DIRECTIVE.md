# Deploy Directive

> **For:** CLAUDY to implement as `/deploy` command
> **Created:** 2025-12-10

---

## Purpose

Single command to deploy NuuMee backend and/or frontend to production.

## Usage Variants

```
/deploy           # Deploy both backend + frontend
/deploy backend   # Deploy only backend API
/deploy frontend  # Deploy only frontend
/deploy --skip-build  # Skip frontend build (use existing /out)
```

---

## Backend Deployment

**Service:** nuumee-api (Cloud Run)
**Region:** us-central1
**Project:** wanapi-prod

```bash
cd /home/user/NuuMee02/backend && \
gcloud run deploy nuumee-api \
  --source=. \
  --project=wanapi-prod \
  --region=us-central1 \
  --allow-unauthenticated \
  --memory=512Mi \
  --timeout=60 \
  --set-env-vars="GOOGLE_CLOUD_PROJECT=wanapi-prod" 2>&1
```

**Verification:**
```bash
curl -s https://nuumee-api-450296399943.us-central1.run.app/health
# Expected: {"status":"healthy","service":"nuumee-api"}
```

---

## Frontend Deployment

**Hosting:** Firebase Hosting
**Project:** wanapi-prod
**Domain:** nuumee.ai

### Step 1: Build (unless --skip-build)
```bash
cd /home/user/NuuMee02/frontend && NODE_ENV=production pnpm build 2>&1 | tail -30
```

### Step 2: Deploy
```bash
cd /home/user/NuuMee02 && firebase deploy --only hosting --project=wanapi-prod 2>&1
```

**Verification:**
```bash
curl -sL -o /dev/null -w "%{http_code}" https://nuumee.ai/
# Expected: 200
```

---

## Output Format

After deployment, report:

```
## Deployment Complete

**Backend:** nuumee-api-XXXXX-XXX ✅
- URL: https://nuumee-api-450296399943.us-central1.run.app
- Health: ✅ healthy

**Frontend:** wanapi-prod.web.app ✅
- URL: https://nuumee.ai
- Status: ✅ 200 OK
```

---

## Error Handling

| Error | Solution |
|-------|----------|
| `firebase login required` | Run `firebase login --reauth` |
| `gcloud auth required` | Run `gcloud auth login` |
| `Build failed` | Check TypeScript errors with `pnpm tsc` |
| `Deploy timeout` | Increase timeout or check Cloud Run logs |

---

## Prerequisites Check

Before deploying, verify:
1. `firebase login:list` shows active session
2. `gcloud auth list` shows active account
3. No TypeScript errors: `cd frontend && pnpm tsc --noEmit`
