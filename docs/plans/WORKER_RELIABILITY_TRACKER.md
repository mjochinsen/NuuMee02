# Worker Reliability Implementation Tracker

**Status:** IN PROGRESS
**Started:** 2025-12-18
**Last Updated:** 2025-12-18
**Plan Document:** [WORKER_RELIABILITY_PLAN.md](./WORKER_RELIABILITY_PLAN.md)

---

## Overall Progress

| Phase | Status | Notes |
|-------|--------|-------|
| Phase 1: Infrastructure | ✅ DONE | All GCP resources created |
| Phase 2: Webhook Receiver | ✅ DONE | Endpoint created and wired up |
| Phase 3: Completion Processor | ✅ DONE | Pub/Sub handler created |
| Phase 4: Modify Worker | 🔄 IN PROGRESS | WaveSpeedClient partially updated |
| Phase 5: Watchdog | ⏳ PENDING | |
| Phase 6: Admin Tools | ⏳ PENDING | |
| Phase 7: Deploy & Test | ⏳ PENDING | |

---

## Phase 1: Infrastructure Setup ✅ DONE

| Task | Status | Details |
|------|--------|---------|
| 1.1 Create Pub/Sub topic | ✅ | `wavespeed-completions` created |
| 1.2 Create DLQ topic | ✅ | `wavespeed-completions-dlq` created |
| 1.3 Create push subscription | ✅ | `wavespeed-completions-push` → `/internal/process-completion` |
| 1.4 Configure retry policy | ✅ | 10s-600s backoff, 10 retries, 600s ack deadline |
| 1.5 Create secret | ✅ | `wavespeed-webhook-token` in Secret Manager |
| 1.6 Create Firestore index | ✅ | (status, updated_at) deployed via `firebase deploy --only firestore:indexes` |

**GCP Resources Created:**
- `gcloud pubsub topics create wavespeed-completions`
- `gcloud pubsub topics create wavespeed-completions-dlq`
- `gcloud pubsub subscriptions create wavespeed-completions-push` with OIDC auth
- `gcloud secrets create wavespeed-webhook-token`
- Service accounts granted secretAccessor role: nuumee-api, nuumee-worker

---

## Phase 2: Webhook Receiver ✅ DONE

| Task | Status | Details |
|------|--------|---------|
| 2.1 Create endpoint | ✅ | `POST /webhooks/wavespeed?token=SECRET` |
| 2.2 Verify token | ✅ | Checks query param against secret |
| 2.3 Parse payload | ✅ | Extracts request_id, status, outputs |
| 2.4 Publish to Pub/Sub | ✅ | Publishes to `wavespeed-completions` topic |
| 2.5 Return 200 immediately | ✅ | No processing, just acknowledge |
| 2.6 Add logging | ✅ | Correlation logging included |

**Files Created:**
- `backend/app/webhooks/wavespeed.py` - Webhook receiver endpoint

**Files Modified:**
- `backend/app/webhooks/router.py` - Added `router.include_router(wavespeed_router)`

---

## Phase 3: Completion Processor ✅ DONE

| Task | Status | Details |
|------|--------|---------|
| 3.1 Create endpoint | ✅ | `POST /internal/process-completion` |
| 3.2 Verify Pub/Sub OIDC | ✅ | Checks Authorization Bearer token |
| 3.3 Find job by request_id | ✅ | Queries `wavespeed_request_id` field |
| 3.4 Idempotency check | ✅ | Skips if status is completed/failed |
| 3.5 Handle "completed" | ✅ | Download video, upload GCS, update status |
| 3.6 Handle "failed" | ✅ | Update status, refund credits |
| 3.7 Handle watermarking | ✅ | FFmpeg watermark for free tier |
| 3.8 Error handling | ✅ | Return 500 to trigger Pub/Sub retry |

**Files Created:**
- `backend/app/internal/__init__.py` - Internal router
- `backend/app/internal/completion.py` - Completion processor

**Files Modified:**
- `backend/app/main.py` - Added `app.include_router(internal_router)`

---

## Phase 4: Modify Worker 🔄 IN PROGRESS

| Task | Status | Details |
|------|--------|---------|
| 4.1 Get webhook secret | ⏳ | Need to add to worker/main.py |
| 4.2 Build webhook URL | ⏳ | `https://api.nuumee.ai/webhooks/wavespeed?token=SECRET` |
| 4.3 Modify WaveSpeedClient | 🔄 | `animate()` updated, `extend()` updated, `upscale()` and `foley()` PENDING |
| 4.4 Update job handlers | ⏳ | Pass webhook_url to WaveSpeed calls |
| 4.5 Remove polling | ⏳ | Return immediately after submit |
| 4.6 Keep polling fallback | ⏳ | If USE_WEBHOOK=false or secret missing |
| 4.7 Final retry handling | ⏳ | Use X-CloudTasks-TaskRetryCount header |

**Files Modified (in progress):**
- `worker/wavespeed.py` - Added `webhook_url` param to `animate()` and `extend()`, need to do `upscale()` and `foley()`

**Remaining work:**
1. Add `webhook_url` param to `upscale()` method
2. Add `webhook_url` param to `foley()` method
3. Update `worker/main.py`:
   - Add `get_webhook_url()` function to get secret and build URL
   - Modify `process_animate_job()` to pass webhook_url
   - Modify `process_extend_job()` to pass webhook_url
   - Modify `process_upscale_job()` to pass webhook_url
   - Modify `process_foley_job()` to pass webhook_url
   - Add fallback: if USE_WEBHOOK=false or no secret, use polling
   - Return immediately after WaveSpeed submit (no poll_result)

---

## Phase 5: Watchdog ⏳ PENDING

| Task | Status | Details |
|------|--------|---------|
| 5.1 Create Cloud Scheduler job | ⏳ | Every 30 minutes |
| 5.2 Create `/internal/watchdog` endpoint | ⏳ | |
| 5.3 Query stuck jobs | ⏳ | status="processing" AND updated_at < 2 hours ago |
| 5.4 Check WaveSpeed status | ⏳ | For each stuck job |
| 5.5 Recover or fail | ⏳ | Based on WaveSpeed status |
| 5.6 Log failures | ⏳ | Structured JSON logs |

---

## Phase 6: Admin Tools ⏳ PENDING

| Task | Status | Details |
|------|--------|---------|
| 6.1 Webhook replay endpoint | ⏳ | `/admin/jobs/{id}/replay-webhook` |
| 6.2 Job status in admin panel | ⏳ | Show wavespeed_request_id, webhook status |
| 6.3 DLQ monitoring docs | ⏳ | Document how to check DLQ |

---

## Phase 7: Deploy & Test ⏳ PENDING

| Task | Status | Details |
|------|--------|---------|
| 7.1 Deploy backend | ⏳ | |
| 7.2 Deploy worker | ⏳ | |
| 7.3 Test with real job | ⏳ | End-to-end validation |
| 7.4 Monitor logs | ⏳ | |
| 7.5 Test failure scenarios | ⏳ | |

---

## Git Status

**Latest Commit:** `aa67c10` - "fix: Worker shared module import + reliability plan"

**Uncommitted Changes:**
- `backend/app/webhooks/wavespeed.py` (NEW)
- `backend/app/webhooks/router.py` (modified - added wavespeed include)
- `backend/app/internal/__init__.py` (NEW)
- `backend/app/internal/completion.py` (NEW)
- `backend/app/main.py` (modified - added internal router)
- `worker/wavespeed.py` (modified - added webhook_url to animate/extend)
- `firebase.json` (modified - added firestore indexes config)
- `firestore.indexes.json` (NEW)

---

## Quick Resume Commands

To continue from where we left off:

```bash
# Check current status
git status

# Verify GCP resources
gcloud pubsub topics list --project=wanapi-prod
gcloud pubsub subscriptions list --project=wanapi-prod
gcloud secrets list --project=wanapi-prod

# Test webhook secret
gcloud secrets versions access latest --secret=wavespeed-webhook-token --project=wanapi-prod
```

---

## Key Decisions Made

1. **Webhook Security:** Secret token in URL query param
2. **Pub/Sub Buffer:** YES - for reliability
3. **Watchdog:** YES - every 30 min
4. **Alerting:** Logs + Admin panel only (MVP)
5. **Polling Fallback:** Keep as safety during transition

---

## Files Reference

| File | Purpose |
|------|---------|
| `backend/app/webhooks/wavespeed.py` | Receives WaveSpeed callback, publishes to Pub/Sub |
| `backend/app/internal/completion.py` | Processes Pub/Sub messages, completes jobs |
| `worker/wavespeed.py` | WaveSpeed API client with webhook support |
| `worker/main.py` | Worker entry point (needs webhook integration) |
| `docs/plans/WORKER_RELIABILITY_PLAN.md` | Full plan document |
