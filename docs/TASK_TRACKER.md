# NuuMee02 — MASTER TASK TRACKER

**Purpose:** Single source of truth for tasks. | **Project:** wanapi-prod | **Domain:** nuumee.ai

## TL;DR - Current State

- **Phase:** 11 (V1.0 Launch Prep) - IN PROGRESS
- **Phases 0-10:** ✅ Complete
- **Live Site:** https://nuumee.ai (TEST MODE)
- **Next Task:** Phase 11.1 - Bug Fixes, then Admin Panel
- **Target:** V1.0 Launch with Stripe LIVE mode

---

## STATUS LEGEND

| Symbol | Meaning        |
| ------ | -------------- |
| ⬜     | Not started    |
| 🔄     | In progress    |
| ✅     | Complete       |
| 🔮     | Deferred (V2+) |

---

## PHASE 11 — V1.0 LAUNCH PREP (CURRENT)

**Goal:** Production-ready for real users with real payments
**Estimated Time:** 20-25 hours total
**Dependencies:** Phases 8.5-10 complete

### Execution Order (Optimized Sequence)

```
1. Bug Fixes (unblock UX)
2. Missing Features (Subtitles, Watermark, Support attach)
3. Admin Panel (need before data cleanup)
4. SEO (marketing readiness)
5. E2E Billing Tests (safety net)
6. Database Cleanup (after admin to verify)
7. Stripe LIVE Mode (LAST - point of no return)
```

### 11.1 Bug Fixes (Priority 0 - Blocking)

| ID     | Task                                     | Status | Effort | Notes              |
| ------ | ---------------------------------------- | ------ | ------ | ------------------ |
| 11.1.1 | Fix Jobs page flickering during polling  | ✅     | 30m    | TESTED AND WORKING |
| 11.1.2 | Verify Generate job polling works smooth | ✅     | 30m    | TESTED AND WORKING |

### 11.2 Missing Features (Priority 1 - Launch Blockers)

| ID     | Task                               | Status | Effort | Notes                                      |
| ------ | ---------------------------------- | ------ | ------ | ------------------------------------------ |
| 11.2.1 | Support page: Fix attach file      | ✅     | 30m    | Inline base64 (500KB), Dec 12 2025         |
| 11.2.2 | Support page: CC support@nuumee.ai | ✅     | 30m    | Reply-to header, Dec 12 2025               |
| 11.2.3 | Post-Processing E: Auto Subtitles  | ⬜     | 3-4h   | Port n8n + Google STT + ASS code           |
| 11.2.4 | Post-Processing F: Add Watermark   | ⬜     | 1-2h   | FFmpeg overlay, user-provided or NuuMee    |
| 11.2.5 | Try Example onboarding feature     | ✅     | -      | 3-step demo with localStorage, Dec 12 2025 |

### 11.3 Admin Panel (Priority 2 - Operations Critical)

**Location:** `/admin555/*` (Next.js pages, password protected)
**Approach:** Next.js pages consistent with app

| ID     | Task                      | Status | Effort | Notes                                       |
| ------ | ------------------------- | ------ | ------ | ------------------------------------------- |
| 11.3.1 | Admin layout + auth guard | ⬜     | 1h     | Password protection, admin-only access      |
| 11.3.2 | Users page                | ⬜     | 2h     | Search, view credits/plan/jobs, add credits |
| 11.3.3 | Jobs page                 | ⬜     | 1.5h   | Queued/running/failed/completed, errors     |
| 11.3.4 | Payments page             | ⬜     | 1.5h   | Revenue, subscribers, failed payments       |
| 11.3.5 | System Health page        | ⬜     | 1h     | Worker status, API health, GCP costs        |
| 11.3.6 | Promo Codes page          | ⬜     | 1h     | Generate invite codes, track usage          |

### 11.4 SEO (Priority 3 - Marketing Ready)

| ID     | Task               | Status | Effort | Notes                         |
| ------ | ------------------ | ------ | ------ | ----------------------------- |
| 11.4.1 | JSON-LD: Homepage  | ⬜     | 30m    | Organization + WebPage schema |
| 11.4.2 | JSON-LD: Pricing   | ⬜     | 30m    | Product schema                |
| 11.4.3 | JSON-LD: Examples  | ⬜     | 30m    | ItemList schema               |
| 11.4.4 | JSON-LD: Support   | ⬜     | 30m    | FAQPage schema                |
| 11.4.5 | Create sitemap.xml | ⬜     | 30m    | All public pages              |
| 11.4.6 | Create robots.txt  | ⬜     | 15m    | Proper crawl directives       |
| 11.4.7 | Meta tags audit    | ⬜     | 1h     | title, description, og:image  |

### 11.5 E2E Billing Tests (Priority 4 - Safety Net)

| ID     | Task                               | Status | Effort | Notes                  |
| ------ | ---------------------------------- | ------ | ------ | ---------------------- |
| 11.5.1 | Test: Signup → Purchase → Generate | ⬜     | 1h     | Happy path end-to-end  |
| 11.5.2 | Test: Subscribe → Cancel → Resub   | ⬜     | 1h     | Subscription lifecycle |
| 11.5.3 | Test: Webhook failure recovery     | ⬜     | 1h     | Payment resilience     |
| 11.5.4 | Test: Credit deduction accuracy    | ⬜     | 1h     | Verify amounts match   |

### 11.6 Database Cleanup (Priority 5 - Fresh Start)

| ID     | Task                               | Status | Effort | Notes                            |
| ------ | ---------------------------------- | ------ | ------ | -------------------------------- |
| 11.6.1 | Create cleanup script              | ⬜     | 1h     | Delete test users, jobs, txns    |
| 11.6.2 | Backup current data (just in case) | ⬜     | 30m    | Firestore export                 |
| 11.6.3 | Run cleanup, verify via admin      | ⬜     | 30m    | Use admin panel to confirm clean |

### 11.7 Stripe LIVE Mode (Priority 6 - LAST STEP)

| ID     | Task                                   | Status | Effort | Notes                              |
| ------ | -------------------------------------- | ------ | ------ | ---------------------------------- |
| 11.7.1 | Complete Stripe business verification  | ⬜     | 30m    | Bank, identity, address            |
| 11.7.2 | Recreate products/prices in LIVE       | ⬜     | 1h     | Creator, Studio, credit packs      |
| 11.7.3 | Update price IDs in env/code           | ⬜     | 30m    | Store in env, not hardcoded        |
| 11.7.4 | Create LIVE webhook endpoint           | ⬜     | 30m    | New signing secret                 |
| 11.7.5 | Update all API keys (backend+frontend) | ⬜     | 30m    | STRIPE_SECRET_KEY, PUBLISHABLE_KEY |
| 11.7.6 | Test real payment end-to-end           | ⬜     | 30m    | Real card, small amount            |
| 11.7.7 | Verify statement descriptor            | ⬜     | 15m    | Shows "NUUMEE" not "UNKNOWN"       |
| 11.7.8 | Deploy final production build          | ⬜     | 30m    | Backend + Frontend                 |

**Phase 11 Completion Criteria:**

- [ ] No flickering on job status pages
- [ ] Support attach file works (max 10MB)
- [ ] Auto Subtitles (E) working
- [ ] Add Watermark (F) working
- [ ] Admin panel operational (6 pages)
- [ ] SEO: sitemap, robots, JSON-LD on all public pages
- [ ] E2E billing tests pass
- [ ] Database clean of test data
- [ ] Stripe LIVE mode active
- [ ] Real payment tested successfully

---

## PHASE 8.5 — FEATURE COMPLETION ✅

**Status:** Complete (launch-critical items done, affiliate deferred)

### Completed Features

| ID     | Task                                   | Status | Notes                               |
| ------ | -------------------------------------- | ------ | ----------------------------------- |
| 8.5.1  | Fix GCS signing for job downloads      | ✅     | Use credentials= not access_token   |
| 8.5.2  | Deploy backend with fix                | ✅     | nuumee-api-00070                    |
| 8.5.3  | Test job download on production        | ✅     | Signed URLs working                 |
| 8.5.4  | Fix retry button on /jobs              | ✅     | Added handleRetry + onClick         |
| 8.5.5  | Implement auto-refill feature          | ✅     | Backend + frontend done             |
| 8.5.6  | Auto-refill: Backend endpoint          | ✅     | POST /credits/auto-refill           |
| 8.5.7  | Auto-refill: Webhook trigger           | ✅     | Balance check implemented           |
| 8.5.8  | Transaction history (real data)        | ✅     | Uses GET /transactions              |
| 8.5.9  | Profile save                           | ✅     | PATCH /auth/me                      |
| 8.5.10 | Notification preferences (backend)     | ✅     | Full notification system            |
| 8.5.11 | Notification preferences (frontend)    | ✅     | Wired to notification API           |
| 8.5.12 | Privacy settings (data retention)      | ✅     | Account deletion implemented        |
| 8.5.13 | Data export feature                    | ✅     | GET /auth/export                    |
| 8.5.14 | Referrer gets 100 credits on purchase  | ✅     | Verified Dec 8 2025                 |
| 8.5.15 | Billing period sync script             | ✅     | scripts/sync_billing_period.py      |
| 8.5.16 | Fix UI for missing billing_period      | ✅     | Auto-sync on page load              |
| 8.5.17 | Add card last4 to transaction metadata | ✅     | Store pm_xxxx last4                 |
| 8.5.19 | Subscription State Matrix doc          | ✅     | docs/SUBSCRIPTION_STATE_MATRIX      |
| 8.5.20 | Affiliate endpoints                    | ✅     | apply/stats/payout implemented      |
| 8.5.26 | JobPickerModal component               | ✅     | Grid thumbnails, pagination, search |
| 8.5.27 | /videos/create job selection           | ✅     | Upload File, From My Jobs           |
| 8.5.28 | GCS path ownership validation          | ✅     | Backend validates user owns path    |
| 8.5.29 | Test job chaining                      | ✅     | Build + deploy verified             |
| 8.5.30 | Deploy video pipeline feature          | ✅     | nuumee-api-00113                    |

### Deferred to V2 (Post-Launch)

| ID     | Task                             | Status | Notes                                  |
| ------ | -------------------------------- | ------ | -------------------------------------- |
| 8.5.21 | Affiliate click tracking         | 🔮     | ?a=CODE → localStorage → signup        |
| 8.5.22 | Affiliate commission on purchase | 🔮     | 30% of first purchase                  |
| 8.5.23 | Affiliate email templates        | 🔮     | approved, rejected, commission, payout |
| 8.5.24 | Test affiliate flow              | 🔮     | After above complete                   |
| 8.5.25 | Referral Activity UI             | 🔮     | Show signups, purchases, credits       |
| 8.5.18 | Billing test suite               | 🔄     | Moved to Phase 11.5                    |
| 8.5.19 | Remove Support attach file       | 🔄     | Use for early users feedback only      |

---

## PHASE 10 — POST-PROCESSING ✅

**Status:** Complete (Extend + Upscale working)

| ID    | Task                             | Status | Notes                                       |
| ----- | -------------------------------- | ------ | ------------------------------------------- |
| 10.1  | Fix pricing (per-second → fixed) | ✅     | Extend: 5/10 credits, Upscale: 100% of base |
| 10.2  | Add source_job_id to models      | ✅     | CreateJobRequest + JobResponse              |
| 10.3  | Add source_video_path to models  | ✅     | For tracking source video GCS path          |
| 10.4  | Add extension_prompt to models   | ✅     | Optional prompt for extend jobs             |
| 10.5  | Add validate_source_job()        | ✅     | Validates ownership + completion + output   |
| 10.6  | Update create_job() for EXTEND   | ✅     | Handles job_type=extend                     |
| 10.7  | Update create_job() for UPSCALE  | ✅     | Handles job_type=upscale                    |
| 10.8  | Update frontend types (api.ts)   | ✅     | JobResponse, CreateJobRequest updated       |
| 10.9  | Disable "Upload File" button     | ✅     | Shows "Coming soon" tooltip                 |
| 10.10 | Wire Generate buttons to API     | ✅     | handleExtendJob, handleUpscaleJob           |
| 10.11 | Deploy backend (Cloud Run)       | ✅     | nuumee-api-00114-5n5                        |
| 10.12 | Deploy frontend (Firebase)       | ✅     | https://nuumee.ai                           |
| 10.13 | Verify pricing endpoints         | ✅     | extend/480p=5, extend/720p=10, upscale=5    |

---

## PHASE 9 — POLISH (Merged into Phase 11)

**Note:** SEO tasks moved to Phase 11.4. Performance optimization deferred to V1.1.

### Deferred to V1.1

| ID   | Task                              | Status | Notes                              |
| ---- | --------------------------------- | ------ | ---------------------------------- |
| 9.8  | Dynamic imports: Modals           | 🔮     | BuyCreditsModal, SubscriptionModal |
| 9.9  | Dynamic imports: Heavy components | 🔮     | Charts, job dialogs (>50KB)        |
| 9.10 | Bundle analysis                   | 🔮     | Target: -100-200KB initial load    |
| 9.11 | Accessibility audit               | 🔮     | WCAG compliance                    |
| 9.12 | Responsive design validation      | 🔮     | All breakpoints                    |
| 9.13 | Design system consistency         | 🔮     | No hardcoded values                |
| 9.14 | Error boundary components         | 🔮     | Error handling                     |

---

## DEFERRED FEATURES (V2+)

| Feature                   | Reason                         | Effort |
| ------------------------- | ------------------------------ | ------ |
| Affiliate tracking system | Nice-to-have, not blocking     | 6-8h   |
| Referral Activity UI      | Nice-to-have                   | 2h     |
| Early Subscriber badge    | Not critical for launch        | 1h     |
| Performance optimization  | Site works, can optimize later | 4-6h   |
| Accessibility audit       | Important but not blocking     | 3-4h   |
| PayPal Payouts API        | For affiliate payouts          | 4-6h   |

---

## SUMMARY

| Phase                  | Tasks   | Completed | Status |
| ---------------------- | ------- | --------- | ------ |
| 0 - Foundation         | 10      | 10        | ✅     |
| 1 - Auth               | 19      | 19        | ✅     |
| 2 - Payments           | 14      | 14        | ✅     |
| 3 - Uploads            | 9       | 9         | ✅     |
| 4 - Jobs               | 11      | 11        | ✅     |
| 5 - Worker             | 9       | 9         | ✅     |
| 6 - Downloads          | 7       | 7         | ✅     |
| 7 - Subscriptions      | 10      | 10        | ✅     |
| 8 - Referral           | 13      | 13        | ✅     |
| 8.5 - Feature Complete | 25      | 21        | ✅     |
| 10 - Post-Processing   | 13      | 13        | ✅     |
| 11 - V1.0 Launch Prep  | 32      | 3         | 🔄     |
| **TOTAL**              | **172** | **139**   | 🔄     |

---

## CURRENT STATE

**Current Phase:** 11 (V1.0 Launch Prep)
**Current Task:** 11.2.1 - Support page: Fix attach file
**Blockers:** None
**Last Updated:** 2025-12-12

### Just Completed (Dec 12)

- ✅ 11.1.1: Fixed Jobs page flickering - silent polling with `fetchJobs(false)`
- ✅ 11.1.2: Verified Create page has no polling (only Jobs page needed fix)

### Recent Completions (Dec 9-12, 2025)

- ✅ Phase 10: Post-Processing (Extend + Upscale) fully working
- ✅ Job Picker Modal for video chaining
- ✅ Clean video URLs (/v/{shortId})
- ✅ Try Example onboarding (3-step demo with bouncing arrows)
- ✅ localStorage flag to hide demo after completion

### Environment

**Live Site:** https://nuumee.ai (wanapi-prod.web.app)
**API URL:** https://nuumee-api-450296399943.us-west1.run.app
**Worker URL:** https://nuumee-worker-450296399943.us-central1.run.app
**Stripe Mode:** TEST (switch to LIVE in Phase 11.7)
**Stripe Webhook:** we_1SYib475wY1iQccD8iUKNqOC (test mode)

---

## ORCHESTRATOR INSTRUCTIONS

### Task Execution Pattern

For each task in Phase 11:

1. Read task requirements
2. Create granular sub-tasks if complex (>2h effort)
3. Execute with checkpoints
4. Update status immediately on completion
5. Commit progress

### For Complex Tasks (Admin Panel, etc.)

Use orchestration pattern:

1. Create detailed plan with measurable sub-tasks
2. Delegate to specialized agents where appropriate
3. Checkpoint after each sub-task
4. Resume capability if interrupted

### To update task:

```
1. Change status symbol (⬜ → 🔄 → ✅)
2. Add notes if needed
3. Update CURRENT STATE section
4. Update SUMMARY counts
5. Commit changes
```

---

_This file is the single source of truth. Update after every task._
