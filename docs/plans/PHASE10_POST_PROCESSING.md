# Phase 10: Post-Processing Backend Implementation

> **Status:** MVP DEPLOYED ✅
> **Created:** 2025-12-10
> **Last Updated:** 2025-12-10

---

## Design Decisions (User Approved)

| Question | Decision | Rationale |
|----------|----------|-----------|
| Upload File flow | **DISABLED** - Only "From My Jobs" | Simplifies MVP, avoids duplicate upload logic |
| Job list display | **FLAT** - Regular jobs in main list | Simpler UX, no nested UI needed |
| Chain tracking | **source_job_id** on extend/upscale job | Enables chain tracking (A → B → C) |
| Insufficient credits | **Pre-check + clear messaging** | Disable toggle if can't afford, show "Need X more credits" with buy button |

---

## Progress Summary (MVP COMPLETE)

| Category | Status | Notes |
|----------|--------|-------|
| 1. Database Schema | ✅ DONE | job_type, source_job_id, source_video_path, extension_prompt added |
| 2. API Endpoints | ✅ DONE | create_job() handles EXTEND/UPSCALE via job_type field |
| 3. Worker Jobs | ⏸️ DEFERRED | WaveSpeed methods exist, worker routing TBD |
| 4. WaveSpeed Integration | ✅ EXISTS | extend(), upscale() methods already in worker |
| 5. Frontend Updates | ✅ DONE | PostProcessingOptions wired to API |
| 6. Testing | ⏸️ DEFERRED | Manual testing done, automated tests later |
| 7. Deployment | ✅ DONE | Backend + Frontend deployed 2025-12-10 |

### Deployment Verification
- Backend API: https://nuumee-api-450296399943.us-central1.run.app ✅
- Frontend: https://nuumee.ai ✅
- Pricing endpoint verified:
  - `extend + 480p = 5 credits` ✅
  - `extend + 720p = 10 credits` ✅
  - `upscale = 5 credits (min)` ✅

---

## Category 1: Database Schema (5 tasks)

### 1.1 Add job_type field to jobs collection
- [ ] **Status:** TODO
- **File:** `backend/app/jobs/models.py`
- **Change:** Add `job_type: Literal["generate", "extend", "upscale"] = "generate"`
- **Deps:** None (foundation task)
- **Notes:** Default "generate" for backward compatibility

### 1.2 Add source_job_id field
- [ ] **Status:** TODO
- **File:** `backend/app/jobs/models.py`
- **Change:** Add `source_job_id: Optional[str] = None`
- **Deps:** 1.1
- **Notes:** References the job that produced the source video

### 1.3 Add source_video_path field
- [ ] **Status:** TODO
- **File:** `backend/app/jobs/models.py`
- **Change:** Add `source_video_path: Optional[str] = None`
- **Deps:** 1.1
- **Notes:** GCS path to source video (already validated by security check)

### 1.4 Add extension_prompt field
- [ ] **Status:** TODO
- **File:** `backend/app/jobs/models.py`
- **Change:** Add `extension_prompt: Optional[str] = None`
- **Deps:** 1.1
- **Notes:** Optional prompt for extend operation

### 1.5 Backfill existing jobs with job_type="generate"
- [ ] **Status:** TODO
- **File:** `backend/scripts/backfill_job_types.py` (new)
- **Change:** One-time migration script
- **Deps:** 1.1
- **Notes:** Run manually after deploy, handles missing field gracefully

---

## Category 2: API Endpoints (10 tasks)

### 2.1 Create POST /jobs/extend endpoint
- [ ] **Status:** TODO
- **File:** `backend/app/jobs/router.py`
- **Change:** New endpoint accepting source_job_id, prompt, resolution
- **Deps:** 1.1-1.4
- **Notes:** Validates source job exists and belongs to user

### 2.2 Create POST /jobs/upscale endpoint
- [ ] **Status:** TODO
- **File:** `backend/app/jobs/router.py`
- **Change:** New endpoint accepting source_job_id, target_resolution
- **Deps:** 1.1-1.3
- **Notes:** Validates source resolution < target resolution

### 2.3 Implement credit calculation for extend
- [ ] **Status:** TODO
- **File:** `backend/app/credits/service.py`
- **Change:** `calculate_extend_credits(resolution: str) -> int`
- **Deps:** None
- **Notes:** 480p=5 credits, 720p=10 credits (from PRICING_STRATEGY.md)

### 2.4 Implement credit calculation for upscale
- [ ] **Status:** TODO
- **File:** `backend/app/credits/service.py`
- **Change:** `calculate_upscale_credits(base_credits: int) -> int`
- **Deps:** None
- **Notes:** Returns base_credits (100% of generation cost)

### 2.5 Add atomic transaction: deduct credits + create job
- [ ] **Status:** TODO
- **File:** `backend/app/jobs/service.py`
- **Change:** Firestore transaction wrapper
- **Deps:** 2.3, 2.4
- **Notes:** CRITICAL - prevents double-charging, ensures consistency

### 2.6 Add source job validation helper
- [ ] **Status:** TODO
- **File:** `backend/app/jobs/service.py`
- **Change:** `validate_source_job(job_id, user_id) -> Job`
- **Deps:** None
- **Notes:** Checks exists, belongs to user, status=completed, has output_video

### 2.7 Add resolution validation for upscale
- [ ] **Status:** TODO
- **File:** `backend/app/jobs/service.py`
- **Change:** `validate_upscale_resolution(source_res, target_res) -> bool`
- **Deps:** None
- **Notes:** Prevents 720p → 480p (downscale not supported)

### 2.8 Create GET /jobs/{id}/chain endpoint
- [ ] **Status:** TODO
- **File:** `backend/app/jobs/router.py`
- **Change:** Returns chain of related jobs via source_job_id
- **Deps:** 1.2
- **Notes:** Nice-to-have for debugging, low priority

### 2.9 Add credit pre-check endpoint enhancement
- [ ] **Status:** TODO
- **File:** `backend/app/credits/router.py`
- **Change:** `GET /credits/check?operation=extend&resolution=720p`
- **Deps:** 2.3, 2.4
- **Notes:** Frontend uses this to disable toggles if insufficient

### 2.10 Add credit refund helper for failed jobs
- [ ] **Status:** TODO
- **File:** `backend/app/credits/service.py`
- **Change:** `refund_credits(user_id, amount, reason)`
- **Deps:** None
- **Notes:** Called by worker on unrecoverable failure

---

## Category 3: Worker Jobs (8 tasks)

### 3.1 Create ExtendJobProcessor class
- [ ] **Status:** TODO
- **File:** `worker/processors/extend.py` (new)
- **Change:** Handles extend job lifecycle
- **Deps:** 2.1, 4.1
- **Notes:** Downloads source video, calls WaveSpeed, uploads result

### 3.2 Create UpscaleJobProcessor class
- [ ] **Status:** TODO
- **File:** `worker/processors/upscale.py` (new)
- **Change:** Handles upscale job lifecycle
- **Deps:** 2.2, 4.2
- **Notes:** Similar pattern to ExtendJobProcessor

### 3.3 Update job dispatcher to route by job_type
- [ ] **Status:** TODO
- **File:** `worker/main.py` or `worker/dispatcher.py`
- **Change:** Switch on job_type to select processor
- **Deps:** 3.1, 3.2
- **Notes:** Maintain backward compat for generate jobs

### 3.4 Implement progress updates for extend
- [ ] **Status:** TODO
- **File:** `worker/processors/extend.py`
- **Change:** Update job.progress during WaveSpeed polling
- **Deps:** 3.1
- **Notes:** Frontend shows progress bar

### 3.5 Implement progress updates for upscale
- [ ] **Status:** TODO
- **File:** `worker/processors/upscale.py`
- **Change:** Update job.progress during WaveSpeed polling
- **Deps:** 3.2
- **Notes:** Same pattern as 3.4

### 3.6 Implement failure handling with credit refund
- [ ] **Status:** TODO
- **File:** `worker/processors/base.py`
- **Change:** On unrecoverable error, call refund_credits
- **Deps:** 2.10
- **Notes:** Log refund reason, notify user

### 3.7 Implement retry logic (3 attempts)
- [ ] **Status:** TODO
- **File:** `worker/processors/base.py`
- **Change:** Wrap WaveSpeed calls with retry decorator
- **Deps:** 3.1, 3.2
- **Notes:** Exponential backoff, log each attempt

### 3.8 Add job completion webhook/notification
- [ ] **Status:** TODO
- **File:** `worker/processors/base.py`
- **Change:** Trigger notification on job complete
- **Deps:** 3.1, 3.2
- **Notes:** Nice-to-have, can defer to later phase

---

## Category 4: WaveSpeed Integration (6 tasks)

### 4.1 Add extend API client method
- [ ] **Status:** TODO
- **File:** `worker/wavespeed/client.py`
- **Change:** `async def extend_video(video_url, prompt, resolution)`
- **Deps:** None
- **Notes:** Check WaveSpeed docs for exact endpoint/params

### 4.2 Add upscale API client method
- [ ] **Status:** TODO
- **File:** `worker/wavespeed/client.py`
- **Change:** `async def upscale_video(video_url, target_resolution)`
- **Deps:** None
- **Notes:** Check WaveSpeed docs for exact endpoint/params

### 4.3 Implement async polling for extend
- [ ] **Status:** TODO
- **File:** `worker/wavespeed/client.py`
- **Change:** Poll until status=completed or failed
- **Deps:** 4.1
- **Notes:** Same pattern as generate, ~30s interval

### 4.4 Implement async polling for upscale
- [ ] **Status:** TODO
- **File:** `worker/wavespeed/client.py`
- **Change:** Poll until status=completed or failed
- **Deps:** 4.2
- **Notes:** Same pattern as 4.3

### 4.5 Handle WaveSpeed rate limits
- [ ] **Status:** TODO
- **File:** `worker/wavespeed/client.py`
- **Change:** Detect 429, implement backoff
- **Deps:** 4.1, 4.2
- **Notes:** Log rate limit events for monitoring

### 4.6 Generate signed URL for source video
- [ ] **Status:** TODO
- **File:** `worker/storage/gcs.py`
- **Change:** `generate_signed_url(gcs_path, expiry_hours=1)`
- **Deps:** None
- **Notes:** WaveSpeed needs public URL to access our GCS videos

---

## Category 5: Frontend Updates (10 tasks)

### 5.1 Add credit pre-check on component mount
- [ ] **Status:** TODO
- **File:** `frontend/components/PostProcessingOptions.tsx`
- **Change:** Fetch user credits, calculate affordability
- **Deps:** 2.9
- **Notes:** Disable toggles user can't afford

### 5.2 Disable "Upload File" button
- [ ] **Status:** TODO
- **File:** `frontend/components/PostProcessingOptions.tsx`
- **Change:** Gray out with "Coming soon" tooltip
- **Deps:** None
- **Notes:** User decision: MVP uses only "From My Jobs"

### 5.3 Wire Generate button to POST /jobs/extend
- [ ] **Status:** TODO
- **File:** `frontend/components/PostProcessingOptions.tsx`
- **Change:** Replace mock with real API call
- **Deps:** 2.1
- **Notes:** Include source_job_id, prompt, resolution

### 5.4 Wire Generate button to POST /jobs/upscale
- [ ] **Status:** TODO
- **File:** `frontend/components/PostProcessingOptions.tsx`
- **Change:** Replace mock with real API call
- **Deps:** 2.2
- **Notes:** Include source_job_id, target_resolution

### 5.5 Show "Insufficient credits" inline error
- [ ] **Status:** TODO
- **File:** `frontend/components/PostProcessingOptions.tsx`
- **Change:** Display error with "Buy credits" link
- **Deps:** 5.1
- **Notes:** Better UX than generic error toast

### 5.6 Add loading state during job creation
- [ ] **Status:** TODO
- **File:** `frontend/components/PostProcessingOptions.tsx`
- **Change:** Disable button, show spinner
- **Deps:** 5.3, 5.4
- **Notes:** Prevent double-click

### 5.7 Navigate to jobs list after successful creation
- [ ] **Status:** TODO
- **File:** `frontend/components/PostProcessingOptions.tsx`
- **Change:** router.push('/videos') on success
- **Deps:** 5.3, 5.4
- **Notes:** User can track progress there

### 5.8 Show job type badge in jobs list
- [ ] **Status:** TODO
- **File:** `frontend/components/JobCard.tsx` or similar
- **Change:** Display "Extend" / "Upscale" badge
- **Deps:** 1.1
- **Notes:** Visual differentiation

### 5.9 Show source chain link in job details
- [ ] **Status:** TODO
- **File:** `frontend/app/(dashboard)/videos/[id]/page.tsx`
- **Change:** "Extended from: [link to source job]"
- **Deps:** 1.2
- **Notes:** Nice-to-have for traceability

### 5.10 Add auto-refill prompt on low credits
- [ ] **Status:** TODO
- **File:** `frontend/components/PostProcessingOptions.tsx`
- **Change:** "Enable auto-refill?" prompt when credits low
- **Deps:** 5.5
- **Notes:** Links to existing auto-refill settings

---

## Category 6: Testing (4 tasks)

### 6.1 Unit tests for credit calculation
- [ ] **Status:** TODO
- **File:** `backend/tests/test_credits.py`
- **Change:** Test extend/upscale credit calculations
- **Deps:** 2.3, 2.4
- **Notes:** Cover edge cases (invalid resolution, etc.)

### 6.2 Integration tests for extend endpoint
- [ ] **Status:** TODO
- **File:** `backend/tests/test_jobs.py`
- **Change:** Test full flow with mocked WaveSpeed
- **Deps:** 2.1
- **Notes:** Test validation, credit deduction, job creation

### 6.3 Integration tests for upscale endpoint
- [ ] **Status:** TODO
- **File:** `backend/tests/test_jobs.py`
- **Change:** Test full flow with mocked WaveSpeed
- **Deps:** 2.2
- **Notes:** Test resolution validation

### 6.4 E2E test for post-processing flow
- [ ] **Status:** TODO
- **File:** `frontend/e2e/post-processing.spec.ts` (new)
- **Change:** Playwright test for extend/upscale
- **Deps:** 5.3, 5.4
- **Notes:** Can use test mode to skip actual WaveSpeed

---

## Category 7: Deployment (2 tasks)

### 7.1 Deploy backend with new endpoints
- [ ] **Status:** TODO
- **Command:** `./deploy-api.sh`
- **Deps:** All Category 2 complete
- **Notes:** Verify endpoints accessible

### 7.2 Deploy frontend with wired buttons
- [ ] **Status:** TODO
- **Command:** `./deploy-frontend.sh`
- **Deps:** All Category 5 complete, 7.1
- **Notes:** Test on staging first if available

---

## Implementation Order (Recommended)

```
PHASE A: Foundation (Tasks 1.1-1.4, 2.3-2.4, 2.6-2.7)
   └── Schema + credit helpers + validation

PHASE B: API Layer (Tasks 2.1, 2.2, 2.5, 2.9, 2.10)
   └── Endpoints with transactions

PHASE C: Worker Layer (Tasks 4.1-4.6, 3.1-3.7)
   └── WaveSpeed client + job processors

PHASE D: Frontend (Tasks 5.1-5.7)
   └── Wire UI to backend

PHASE E: Polish (Tasks 5.8-5.10, 2.8, 3.8)
   └── Nice-to-have features

PHASE F: Testing + Deploy (Tasks 6.1-6.4, 7.1-7.2)
   └── Verify everything works
```

---

## Edge Cases Checklist

- [ ] Extend 480p video (costs 5 credits, not based on source)
- [ ] Extend 720p video (costs 10 credits)
- [ ] Upscale already-extended video (chain: generate → extend → upscale)
- [ ] Upscale 720p to 720p (should be rejected - no improvement)
- [ ] User deletes source job while extend is processing
- [ ] Concurrent extend + upscale on same source
- [ ] WaveSpeed times out after 10 minutes
- [ ] User runs out of credits mid-operation (prevented by atomic transaction)

---

## Recovery Notes

If session interrupted, resume from first unchecked task in current phase.
Always verify previous task actually completed before moving on.
Check Firestore and GCS for partial state.

---

## Changelog

| Date | Change |
|------|--------|
| 2025-12-10 | Initial plan created with 45 tasks |
