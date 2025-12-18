# Worker Reliability Plan v2.0

**Status:** AGREED - Ready for Implementation
**Created:** 2025-12-18
**Updated:** 2025-12-18
**Goal:** Reliable video processing - users never lose credits without getting their video

---

## Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Webhook Security | Secret token in URL | Simple, WaveSpeed pattern |
| Fallback | Keep polling as backup | Safety during transition |
| Existing stuck jobs | Ignore | Dev environment, give extra credits |
| Video download | In webhook handler (simple) | Optimize later if needed |
| Phase 1 (polling patches) | **SKIP** | Don't polish the Titanic |
| Pub/Sub buffer | **YES** | Standard pattern, reliable, free |
| Watchdog | YES | Basic proper programming |
| Idempotency | YES | Prevent duplicate processing |
| Alerting | Logs + Admin panel | Check manually for MVP |
| Correlation ID | YES | Tracing through system |
| Webhook replay endpoint | YES | Manual recovery |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         JOB CREATION                            │
│  User → Backend → Deduct credits → Create job (pending)        │
│                 → Create Cloud Task → Job status = "queued"    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      WORKER (FAST - <10 sec)                    │
│  Cloud Task → Worker                                            │
│    → Submit to WaveSpeed with webhook URL + secret token        │
│    → Save wavespeed_request_id to Firestore                     │
│    → Job status = "processing"                                  │
│    → Return 200 (done!)                                         │
│                                                                 │
│  On error (final retry):                                        │
│    → Mark job "failed", refund credits                          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    WAVESPEED (async, 1-40 min)                  │
│  Processes video, calls webhook when done                       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                 WEBHOOK RECEIVER (Backend endpoint)             │
│  POST /webhooks/wavespeed?token=SECRET                         │
│    → Verify token                                               │
│    → Publish to Pub/Sub topic "wavespeed-completions"          │
│    → Return 200 immediately (don't process here!)              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              COMPLETION PROCESSOR (Pub/Sub push subscriber)     │
│  Pub/Sub message → Backend endpoint /internal/process-completion│
│    → Find job by wavespeed_request_id (idempotency check)      │
│    → If already completed: skip (idempotent)                   │
│    → If "completed": download video, upload GCS, update status │
│    → If "failed": mark failed, refund credits                  │
│    → On error: Pub/Sub auto-retries with backoff               │
│    → Dead letter after max retries → Alert                     │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                 WATCHDOG (Cloud Scheduler - every 30 min)       │
│  Find jobs where status="processing" AND updated_at > 2 hours  │
│    → Query WaveSpeed API for actual status                     │
│    → If WaveSpeed completed: recover (download, complete)      │
│    → If WaveSpeed failed: mark failed, refund                  │
│    → If WaveSpeed still processing: wait                       │
│    → If WaveSpeed unknown: mark failed, refund, alert          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Implementation Phases

### Phase 1: Infrastructure Setup
**Create Pub/Sub topic, subscription, and dead letter queue**

| # | Task | Description |
|---|------|-------------|
| 1.1 | Create Pub/Sub topic | `wavespeed-completions` |
| 1.2 | Create dead letter topic | `wavespeed-completions-dlq` |
| 1.3 | Create push subscription | Points to backend `/internal/process-completion` |
| 1.4 | Configure retry policy | Exponential backoff, max 10 retries |
| 1.5 | Create secret | `wavespeed-webhook-token` in Secret Manager |
| 1.6 | Create Firestore index | (status, updated_at) for watchdog queries |

### Phase 2: Webhook Receiver Endpoint
**Backend receives webhook, publishes to Pub/Sub**

| # | Task | Description |
|---|------|-------------|
| 2.1 | Create `/webhooks/wavespeed` endpoint | Accept POST from WaveSpeed |
| 2.2 | Verify token | Check `?token=` matches secret |
| 2.3 | Parse WaveSpeed payload | Extract request_id, status, outputs, error |
| 2.4 | Publish to Pub/Sub | Message with job data |
| 2.5 | Return 200 immediately | Don't process, just acknowledge |
| 2.6 | Add logging | Correlation ID, request details |

### Phase 3: Completion Processor
**Process Pub/Sub messages, complete jobs**

| # | Task | Description |
|---|------|-------------|
| 3.1 | Create `/internal/process-completion` endpoint | Receives Pub/Sub push |
| 3.2 | Verify Pub/Sub OIDC token | Check `Authorization: Bearer` header, verify audience |
| 3.3 | Find job by wavespeed_request_id | Query Firestore |
| 3.4 | Idempotency check | Skip if already completed/failed |
| 3.5 | Handle "completed" | Download video, upload GCS, update job |
| 3.6 | Handle "failed" | Update job, refund credits |
| 3.7 | Handle watermarking | Apply watermark for free tier |
| 3.8 | Error handling | Let Pub/Sub retry on failure |

### Phase 4: Modify Worker
**Submit to WaveSpeed with webhook URL**

| # | Task | Description |
|---|------|-------------|
| 4.1 | Get webhook secret | From Secret Manager |
| 4.2 | Build webhook URL | `https://api.nuumee.ai/webhooks/wavespeed?token=SECRET` |
| 4.3 | Modify WaveSpeedClient | Add webhook parameter to API calls |
| 4.4 | Update job handlers | Pass webhook URL to WaveSpeed |
| 4.5 | Remove polling | Don't wait for result, return immediately |
| 4.6 | Keep polling fallback | Per-job check: if USE_WEBHOOK=false or secret missing, poll |
| 4.7 | Final retry handling | Use X-CloudTasks-TaskRetryCount |

### Phase 5: Watchdog
**Background job to catch stragglers**

| # | Task | Description |
|---|------|-------------|
| 5.1 | Create Cloud Scheduler job | Every 30 minutes |
| 5.2 | Create `/internal/watchdog` endpoint | Triggered by scheduler |
| 5.3 | Query stuck jobs | status="processing" AND updated_at < 2 hours ago |
| 5.4 | Check WaveSpeed status | For each stuck job |
| 5.5 | Recover or fail | Based on WaveSpeed status |
| 5.6 | Log failures | Structured JSON logs for manual monitoring |

### Phase 6: Admin Tools
**Manual recovery and visibility**

| # | Task | Description |
|---|------|-------------|
| 6.1 | Webhook replay endpoint | `/admin/jobs/{id}/replay-webhook` |
| 6.2 | Job status in admin panel | Show wavespeed_request_id, webhook status |
| 6.3 | DLQ monitoring docs | Document how to check DLQ in Cloud Console |

### Phase 7: Deploy & Test

| # | Task | Description |
|---|------|-------------|
| 7.1 | Deploy backend with new endpoints | |
| 7.2 | Deploy worker with webhook support | |
| 7.3 | Test with real job | End-to-end validation |
| 7.4 | Monitor logs | Verify flow works |
| 7.5 | Test failure scenarios | Webhook fails, Pub/Sub retries |

---

## Files to Create/Modify

### New Files
```
backend/app/webhooks/wavespeed.py      # Webhook receiver
backend/app/internal/completion.py      # Pub/Sub processor
backend/app/internal/watchdog.py        # Watchdog endpoint
backend/app/internal/__init__.py        # Internal routes
```

### Modified Files
```
backend/app/main.py                     # Add internal routes
backend/app/webhooks/router.py          # Include wavespeed router
worker/wavespeed.py                     # Add webhook parameter
worker/main.py                          # Submit with webhook, no polling
shared/worker_utils/firestore_utils.py  # May need updates
```

### Infrastructure (gcloud/terraform)
```
Pub/Sub topic: wavespeed-completions
Pub/Sub topic: wavespeed-completions-dlq
Pub/Sub subscription: wavespeed-completions-push
Secret: wavespeed-webhook-token
Cloud Scheduler: watchdog-job
```

---

## Rollback Plan

If webhooks fail:
1. Worker has fallback: if no webhook URL configured, use polling
2. Set environment variable `USE_WEBHOOK=false` to disable
3. Watchdog will recover stuck jobs

---

## Edge Cases Handled

| Edge Case | How Handled |
|-----------|-------------|
| Webhook arrives before request_id saved | Pub/Sub retries, job found on retry |
| Duplicate webhook | Idempotency check on wavespeed_request_id |
| Webhook fails | Pub/Sub retries 10x with backoff |
| All retries fail | Dead letter queue, check manually in Cloud Console |
| WaveSpeed never calls back | Watchdog catches after 2 hours |
| Video URL invalid | Error handling, mark failed, refund |
| Backend down when webhook arrives | Pub/Sub buffers and retries |
| Simultaneous webhooks for same job | Idempotency prevents duplicate processing |

---

## Success Metrics

1. **Zero orphaned jobs** - No jobs stuck in "queued" > 1 hour
2. **Zero lost credits** - Failed jobs always refunded
3. **Worker speed** - Cloud Task completes in <10 seconds
4. **Webhook success** - >99% processed on first try
5. **Recovery time** - Watchdog catches issues within 30 min

---

## Additional Edge Cases

| Edge Case | How Handled |
|-----------|-------------|
| WaveSpeed returns success but video URL 404 | Verify URL downloadable before marking complete, else retry |
| Malformed webhook payload | Log error, return 400, don't publish to Pub/Sub |
| GCS upload fails after download | Keep status "processing", Pub/Sub will retry |
| User deleted while job processing | Check user exists before refund, log warning if missing |
| Concurrent watchdog + webhook | Idempotency check prevents double-completion |

---

## Firestore Index Required

```
Collection: jobs
Fields: status (ASC), updated_at (ASC)
Purpose: Efficient watchdog query for stuck jobs
```
