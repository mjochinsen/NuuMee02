---
description: "target (optional: backend|frontend|--skip-build): Deploy NuuMee to production"
---

# Deploy NuuMee to Production

Deploy backend (Cloud Run), frontend (Firebase Hosting), or both.

## Arguments

- `backend` - Deploy only the FastAPI backend to Cloud Run
- `frontend` - Deploy only the Next.js frontend to Firebase Hosting
- `--skip-build` - Skip frontend build (use existing /out directory)
- *(no args)* - Deploy both backend and frontend

**User provided:** `$ARGUMENTS`

## Prerequisites Check

Before deploying, verify authentication:

```bash
# Check Firebase auth
firebase login:list 2>/dev/null | head -5

# Check gcloud auth
gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>/dev/null | head -1
```

If either is empty, inform user to run:
- `firebase login --reauth`
- `gcloud auth login`

## Deployment Logic

Parse the arguments and execute accordingly:

### If `backend` or no arguments (deploy both):

**Backend Deployment (Cloud Run):**
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

**Backend Verification:**
```bash
curl -s https://nuumee-api-450296399943.us-central1.run.app/health
```
Expected: `{"status":"healthy","service":"nuumee-api"}`

### If `frontend` or no arguments (deploy both):

**Frontend Build** (unless `--skip-build`):
```bash
cd /home/user/NuuMee02/frontend && NODE_ENV=production pnpm build 2>&1 | tail -30
```

If build fails, check TypeScript errors:
```bash
cd /home/user/NuuMee02/frontend && pnpm tsc --noEmit 2>&1
```

**Frontend Deploy:**
```bash
cd /home/user/NuuMee02 && firebase deploy --only hosting --project=wanapi-prod 2>&1
```

**Frontend Verification:**
```bash
curl -sL -o /dev/null -w "%{http_code}" https://nuumee.ai/
```
Expected: `200`

## Output Format

Report results in this format:

```
## Deployment Complete

**Backend:** [DEPLOYED/SKIPPED]
- URL: https://nuumee-api-450296399943.us-central1.run.app
- Health: [healthy/unhealthy]

**Frontend:** [DEPLOYED/SKIPPED]
- URL: https://nuumee.ai
- Status: [200 OK/error]

**Time:** [duration]
```

## Error Handling

| Error | Solution |
|-------|----------|
| `firebase login required` | Run `firebase login --reauth` |
| `gcloud auth required` | Run `gcloud auth login` |
| `Build failed` | Check TypeScript errors with `pnpm tsc` |
| `Deploy timeout` | Check Cloud Run logs in GCP Console |
| `Permission denied` | Verify project access in GCP IAM |

## Important Notes

- Backend deployment takes ~2-3 minutes (builds container)
- Frontend deployment takes ~1 minute
- Both deployments can run in parallel if user requests
- Always verify health/status after deployment
