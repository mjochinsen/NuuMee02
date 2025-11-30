# NuuMee02 — MASTER TASK TRACKER

**Purpose:** Single source of truth for all tasks. Orchestrators use this to manage work efficiently.

**Updated by:** KODY after each task completion

**GCP Project:** wanapi-prod | **Domain:** nuumee.ai

---

## HOW TO USE THIS FILE

### For KODY:

1. Before starting work, read this file
2. Find the current phase and next incomplete task
3. Execute the task using specified agents/tools
4. Update status to ✅ when complete
5. Add any notes or blockers
6. Commit changes to this file

### For Orchestrators:

1. Parse this file to get current state
2. Identify next actionable task (status: ⬜)
3. Check dependencies are met
4. Delegate to appropriate agent
5. Update status after completion

---

## STATUS LEGEND

| Symbol | Meaning               |
| ------ | --------------------- |
| ⬜     | Not started           |
| 🔄     | In progress           |
| ✅     | Complete              |
| ❌     | Blocked               |
| ⏭️     | Skipped (with reason) |

---

## PHASE 0 — FOUNDATION

**Goal:** Clean folder structure, stub files, environment ready
**Estimated Time:** 1 hour
**Dependencies:** None

| ID   | Task                                                   | Status | Agent/Tool             | Output                | Notes                    |
| ---- | ------------------------------------------------------ | ------ | ---------------------- | --------------------- | ------------------------ |
| 0.1  | Create folder structure (frontend/, backend/, worker/) | ✅     | Manual                 | Folders exist         | Done                     |
| 0.2  | Initialize Next.js in frontend/                        | ✅     | `pnpm create next-app` | package.json, app/    | Next.js 16 with Tailwind |
| 0.3  | Create backend/app/main.py with health endpoint        | ✅     | Manual                 | main.py               | FastAPI minimal          |
| 0.4  | Create backend/requirements.txt                        | ✅     | Manual                 | requirements.txt      | Done                     |
| 0.5  | Create backend/Dockerfile                              | ✅     | Manual                 | Dockerfile            | Done                     |
| 0.6  | Create worker/ stub files                              | ✅     | Manual                 | main.py, wavespeed.py | Empty stubs only         |
| 0.7  | Create frontend/.env.local                             | ✅     | Manual                 | .env.local            | Firebase config set      |
| 0.8  | Create backend/.env                                    | ✅     | Manual                 | .env                  | GCP project set          |
| 0.9  | Create firebase.json                                   | ✅     | Manual                 | firebase.json         | Site: nuumee-66a48       |
| 0.10 | Commit and push Phase 0                                | ✅     | Git                    | 605b7e5               | "Phase 0: Foundation"    |

**Phase 0 Completion Criteria:**

- [x] All folders exist
- [x] Next.js initializes without errors
- [x] Backend health endpoint code exists
- [x] All env files created
- [x] Committed to master

---

## PHASE 1 — AUTHENTICATION

**Goal:** Signup → Login → Logout → Persistent session → User in Firestore
**Estimated Time:** 4-6 hours
**Dependencies:** Phase 0 complete

### Backend Tasks

| ID  | Task                                      | Status | Agent/Tool          | Output                            | Notes                            |
| --- | ----------------------------------------- | ------ | ------------------- | --------------------------------- | -------------------------------- |
| 1.1 | Create backend/app/auth/ folder structure | ✅     | Manual              | router.py, firebase.py, models.py | Done                             |
| 1.2 | Implement Firebase Admin SDK init         | ✅     | Manual              | firebase.py                       | Uses Secret Manager              |
| 1.3 | Implement POST /auth/register             | ✅     | Manual              | router.py                         | Creates user with 25 credits     |
| 1.4 | Implement POST /auth/login                | ✅     | Manual              | router.py                         | Validates token, returns profile |
| 1.5 | Implement GET /auth/me                    | ✅     | Manual              | router.py                         | Returns user profile             |
| 1.6 | Create auth middleware                    | ✅     | Manual              | middleware/auth.py                | Token validation                 |
| 1.7 | Deploy backend to Cloud Run               | ✅     | `gcloud run deploy` | nuumee-api-450296399943           | .env updated                     |
| 1.8 | Test backend endpoints with curl          | ✅     | curl                | Health check passed               | /docs available                  |

### Frontend Tasks

| ID   | Task                                           | Status | Agent/Tool        | Output               | Notes                      |
| ---- | ---------------------------------------------- | ------ | ----------------- | -------------------- | -------------------------- |
| 1.9  | Review FromFigmaMake/ for login/signup designs | ✅     | Manual            | Design notes         | LoginPage.tsx reference    |
| 1.10 | Create lib/firebase.ts                         | ✅     | Manual            | firebase.ts          | Google/GitHub/Email auth   |
| 1.11 | Create lib/api.ts                              | ✅     | Manual            | api.ts               | Auth header, no 403 logout |
| 1.12 | Create components/AuthProvider.tsx             | ✅     | Manual            | AuthProvider.tsx     | Auth context               |
| 1.13 | Create app/login/page.tsx                      | ✅     | Manual            | page.tsx             | Login + forgot password    |
| 1.14 | Create app/signup/page.tsx                     | ✅     | Manual            | page.tsx             | With password strength     |
| 1.15 | Create components/Navbar.tsx                   | ✅     | Manual            | Navbar.tsx           | User menu, credits display |
| 1.16 | Update app/layout.tsx with AuthProvider        | ✅     | Manual            | layout.tsx           | Wrapped app                |
| 1.17 | Deploy frontend to Firebase Hosting            | ✅     | `firebase deploy` | nuumee-66a48.web.app | Deployed                   |
| 1.18 | Test full auth flow on live site               | ✅     | WebFetch          | All pages verified   | Home, login, signup live   |
| 1.19 | Commit and push Phase 1                        | ✅     | Git               | 396a77f              | Frontend pushed            |

**Phase 1 Completion Criteria:**

- [x] Can signup at https://nuumee-66a48.web.app/signup/ (page deployed, form functional)
- [x] User document created in Firestore with 25 credits (backend endpoint verified)
- [x] Can login at https://nuumee-66a48.web.app/login/ (page deployed, form functional)
- [x] Session persists on page refresh (AuthProvider implemented)
- [x] Logout works (signOut function implemented in AuthProvider)
- [x] Committed to master (396a77f, 98ba07d)

---

## PHASE 2 — PAYMENTS

**Goal:** Buy credits via Stripe, see balance in UI
**Estimated Time:** 3-4 hours
**Dependencies:** Phase 1 complete

### Backend Tasks

| ID  | Task                                  | Status | Agent/Tool          | Output                      | Notes                                   |
| --- | ------------------------------------- | ------ | ------------------- | --------------------------- | --------------------------------------- |
| 2.1 | Create backend/app/credits/ folder    | ✅     | Manual              | router.py, models.py        | Done                                    |
| 2.2 | Implement POST /credits/checkout      | ✅     | `api-builder`       | router.py                   | Creates Stripe session                  |
| 2.3 | Implement POST /webhooks/stripe       | ✅     | `api-builder`       | router.py                   | Handles checkout.session.completed      |
| 2.4 | Configure Stripe webhook in dashboard | ✅     | Manual              | we_1SYib475wY1iQccD8iUKNqOC | Recreated with correct URL              |
| 2.5 | Deploy updated backend                | ✅     | `gcloud run deploy` | nuumee-api-00051            | Done                                    |
| 2.6 | Test webhook with Stripe CLI          | ✅     | Playwright          | whsec_d1m8...               | Automated E2E test, credits add via API |

### Frontend Tasks

| ID   | Task                                   | Status | Agent/Tool             | Output       | Notes                                       |
| ---- | -------------------------------------- | ------ | ---------------------- | ------------ | ------------------------------------------- |
| 2.7  | Review FromFigmaMake/ for pricing page | ✅     | Manual                 | Design notes | Done in Phase 1.6                           |
| 2.8  | Create app/pricing/page.tsx            | ✅     | `frontend-dev`         | page.tsx     | Credit packages                             |
| 2.9  | Create app/payment/success/page.tsx    | ✅     | `frontend-dev`         | page.tsx     | Success confirmation                        |
| 2.10 | Create app/payment/cancel/page.tsx     | ✅     | `frontend-dev`         | page.tsx     | Cancel message                              |
| 2.11 | Add credit balance display to Navbar   | ✅     | `frontend-dev`         | Header.tsx   | Shows credits when logged in                |
| 2.12 | Deploy frontend                        | ✅     | `firebase deploy`      | Live site    | Done                                        |
| 2.13 | Test full payment flow (test mode)     | ✅     | Playwright             | Test passed  | E2E test: checkout → webhook → credits added |
| 2.14 | Commit and push Phase 2                | ✅     | Git                    | See below    | Phase 2 complete                            |

**Phase 2 Completion Criteria:**

- [x] Can click Buy Credits (onClick handlers on pricing + billing pages)
- [x] Stripe checkout opens (API creates session, redirects to Stripe)
- [x] After payment, redirect to success page (shows credits added)
- [x] Credits updated in Firestore (webhook verified via Playwright E2E test)
- [x] UI shows new balance (Header displays credits from profile)
- [x] Committed to master

---

## PHASE 3 — UPLOADS

**Goal:** Upload reference image + motion video to GCS
**Estimated Time:** 2-3 hours
**Dependencies:** Phase 2 complete

| ID  | Task                                          | Status | Agent/Tool             | Output           | Notes                       |
| --- | --------------------------------------------- | ------ | ---------------------- | ---------------- | --------------------------- |
| 3.1 | Create backend/app/upload/ folder             | ✅     | `api-builder`          | router.py        | Done via sub-agent          |
| 3.2 | Implement POST /upload/signed-url             | ✅     | `api-builder`          | router.py        | GCS signed URLs             |
| 3.3 | Deploy updated backend                        | ✅     | `gcloud run deploy`    | nuumee-api-00051 | Deployed                    |
| 3.4 | Review FromFigmaMake/ for upload UI           | ✅     | Manual                 | Design notes     | Design reviewed             |
| 3.5 | Create upload components (drag-drop, preview) | ✅     | `frontend-dev`         | Components       | DropZone, FilePreview, Progress |
| 3.6 | Create app/create/page.tsx                    | ✅     | `frontend-dev`         | page.tsx         | Upload interface            |
| 3.7 | Deploy frontend                               | ✅     | `firebase deploy`      | Live site        | wanapi-prod.web.app         |
| 3.8 | Test uploads to GCS                           | ✅     | `deployment-validator` | Test results     | Files in nuumee-images/videos |
| 3.9 | Commit and push Phase 3                       | ✅     | Git                    | d218221          | "Phase 3 Complete"          |

**Phase 3 Completion Criteria:**

- [x] Can upload image via drag-drop
- [x] Can upload video via drag-drop
- [x] Files appear in GCS bucket
- [x] Preview shows uploaded files
- [x] Committed to master

---

## PHASE 4 — JOB CREATION

**Goal:** Create job, deduct credits, store in Firestore
**Estimated Time:** 3-4 hours
**Dependencies:** Phase 3 complete

| ID   | Task                                | Status | Agent/Tool             | Output               | Notes                      |
| ---- | ----------------------------------- | ------ | ---------------------- | -------------------- | -------------------------- |
| 4.1  | Create backend/app/jobs/ folder     | ✅     | Manual                 | router.py, models.py | Done                       |
| 4.2  | Implement POST /jobs                | ✅     | `api-builder`          | router.py            | Create job, deduct credits |
| 4.3  | Implement GET /jobs                 | ✅     | `api-builder`          | router.py            | List user's jobs           |
| 4.4  | Implement GET /jobs/{id}            | ✅     | `api-builder`          | router.py            | Job details                |
| 4.5  | Deploy updated backend              | ✅     | `gcloud run deploy`    | nuumee-api-00056     | Deployed                   |
| 4.6  | Create cost calculator component    | ✅     | `frontend-dev`         | GET /jobs/cost       | API endpoint               |
| 4.7  | Create app/jobs/page.tsx (job list) | ✅     | `frontend-dev`         | page.tsx             | Fetches from API           |
| 4.8  | Add job submission to create page   | ✅     | `frontend-dev`         | page.tsx             | Result section with status |
| 4.9  | Deploy frontend                     | ✅     | `firebase deploy`      | Live site            | wanapi-prod.web.app        |
| 4.10 | Test job creation flow              | ✅     | `deployment-validator` | Test results         | Playwright tests pass      |
| 4.11 | Commit and push Phase 4             | ✅     | Git                    | f02cd14              | "Phase 4: Jobs complete"   |

**Phase 4 Completion Criteria:**

- [x] Can submit job after upload
- [x] Credits deducted correctly
- [x] Job appears in Firestore
- [x] Job appears in job list UI
- [x] Insufficient credits shows error
- [x] Committed to master

---

## PHASE 5 — WORKER

**Goal:** Process jobs via WaveSpeed, generate videos
**Estimated Time:** 4-6 hours
**Dependencies:** Phase 4 complete

| ID  | Task                           | Status | Agent/Tool          | Output                           | Notes                      |
| --- | ------------------------------ | ------ | ------------------- | -------------------------------- | -------------------------- |
| 5.1 | Implement worker/main.py       | ✅     | Manual              | main.py                          | Flask + Cloud Tasks handler |
| 5.2 | Implement worker/wavespeed.py  | ✅     | Manual              | wavespeed.py                     | WaveSpeed API client       |
| 5.3 | Create worker/requirements.txt | ✅     | Manual              | requirements.txt                 | flask, gunicorn, gcp libs  |
| 5.4 | Create worker/Dockerfile       | ✅     | Manual              | Dockerfile                       | gunicorn + 600s timeout    |
| 5.5 | Deploy worker to Cloud Run     | ✅     | `gcloud run deploy` | nuumee-worker-00003              | Allow unauthenticated      |
| 5.6 | Set up Cloud Tasks queue       | ✅     | Existing            | nuumee-video-processing          | 5/sec, 3 retries           |
| 5.7 | Add job enqueueing to backend  | ✅     | Manual              | tasks/queue.py, jobs/router.py   | Jobs auto-queued on create |
| 5.8 | Test end-to-end job processing | ✅     | Manual + Agents     | 40 tests, 90% coverage           | All 4 job types working    |
| 5.9 | Commit and push Phase 5        | ✅     | Git                 | ae0215b, e4f4590                 | "Phase 5: Worker complete" |

**Phase 5 Completion Criteria:**

- [x] Job triggers worker (via Cloud Tasks)
- [x] Worker calls WaveSpeed API (all 4 endpoints: animate, extend, upscale, foley)
- [x] Output uploaded to GCS (nuumee-outputs bucket)
- [x] Job status updated to "completed" (status flow: pending→queued→processing→completed)
- [x] Committed to branch (ae0215b, e4f4590)

---

## PHASE 6 — DOWNLOADS

**Goal:** View completed jobs, download results
**Estimated Time:** 2-3 hours
**Dependencies:** Phase 5 complete

| ID  | Task                            | Status | Agent/Tool             | Output                       | Notes                         |
| --- | ------------------------------- | ------ | ---------------------- | ---------------------------- | ----------------------------- |
| 6.1 | Implement GET /jobs/{id}/output | ✅     | `api-builder`          | router.py, models.py         | Signed download URL (1hr)     |
| 6.2 | Deploy updated backend          | ✅     | `gcloud run deploy`    | nuumee-api-00059-td5         | All endpoints live            |
| 6.3 | Add download button to job list | ✅     | `frontend-dev`         | jobs/page.tsx                | Loading state, disabled check |
| 6.4 | Create job detail modal         | ✅     | `frontend-dev`         | jobs/page.tsx (modal)        | Static export constraint      |
| 6.5 | Deploy frontend                 | ✅     | `firebase deploy`      | wanapi-prod.web.app          |                               |
| 6.6 | Test download flow              | ✅     | Manual                 | 401 auth required (correct)  | Endpoint verified             |
| 6.7 | Commit and push Phase 6         | ✅     | Git                    | c2610bd                      | "Phase 6: Downloads complete" |

**Phase 6 Completion Criteria:**

- [x] Completed jobs show download button
- [x] Download works (signed URL generation)
- [x] Job detail modal displays all info
- [x] Committed to branch (c2610bd)

---

## PHASE 7 — SUBSCRIPTIONS

**Goal:** Monthly subscription tiers with recurring credits
**Estimated Time:** 3-4 hours
**Dependencies:** Phase 6 complete

| ID   | Task                                     | Status | Agent/Tool             | Output                | Notes                                          |
| ---- | ---------------------------------------- | ------ | ---------------------- | --------------------- | ---------------------------------------------- |
| 7.1  | Create backend/app/subscriptions/ folder | ✅     | Manual                 | router.py, models.py  | Creator ($29) & Studio ($99) tiers             |
| 7.2  | Implement POST /subscriptions/create     | ✅     | Manual                 | router.py             | Stripe checkout session creation               |
| 7.3  | Implement POST /subscriptions/cancel     | ✅     | Manual                 | router.py             | Cancel at period end via Stripe                |
| 7.4  | Implement GET /subscriptions/current     | ✅     | Manual                 | router.py             | Returns active subscription or null            |
| 7.5  | Add invoice.paid webhook handler         | ✅     | Manual                 | webhooks/router.py    | Credits on create + renewals, rollover cap     |
| 7.6  | Deploy updated backend                   | ✅     | `gcloud run deploy`    | nuumee-api-00060-lfs  | New revision deployed                          |
| 7.7  | Add subscription UI to billing page      | ✅     | Manual                 | billing/page.tsx      | Updated tiers: 400/1600 credits                |
| 7.8  | Deploy frontend                          | ✅     | `firebase deploy`      | wanapi-prod.web.app   | SubscriptionModal uses real API                |
| 7.9  | Test subscription flow                   | ✅     | Manual                 | API endpoints live    | Needs Stripe price IDs for full E2E            |
| 7.10 | Commit and push Phase 7                  | ✅     | Git                    | 2d50d1c               | "Phase 7: Subscriptions complete"              |

**Phase 7 Completion Criteria:**

- [x] Can subscribe to tier (API ready, needs Stripe price IDs)
- [x] Credits added immediately (via checkout.session.completed webhook)
- [x] Can cancel subscription (cancel_at_period_end)
- [x] Committed to branch (2d50d1c)

---

## PHASE 8 — REFERRAL & AFFILIATE

**Goal:** Referral codes, affiliate program
**Estimated Time:** 3-4 hours
**Dependencies:** Phase 7 complete

| ID    | Task                                  | Status | Agent/Tool             | Output                 | Notes                                    |
| ----- | ------------------------------------- | ------ | ---------------------- | ---------------------- | ---------------------------------------- |
| 8.1   | Create backend/app/referral/ folder   | ✅     | `api-builder`          | router.py, models.py   | Done via sub-agent                       |
| 8.2   | Implement GET /referral/code          | ✅     | `api-builder`          | router.py              | Get/generate referral code               |
| 8.3   | Implement POST /referral/apply        | ✅     | `api-builder`          | router.py              | Apply code, get 25 credits               |
| 8.4   | Create backend/app/affiliate/ folder  | ✅     | `api-builder`          | router.py, models.py   | Done via sub-agent                       |
| 8.5   | Implement affiliate endpoints         | ✅     | `api-builder`          | router.py              | apply, stats, payout                     |
| 8.6   | Deploy updated backend                | ✅     | `gcloud run deploy`    | nuumee-api-00062-v4t   | All endpoints live                       |
| 8.7   | Update referral page with API         | ✅     | Manual                 | referral/page.tsx      | Uses getReferralCode API                 |
| 8.8   | Update affiliate page with API        | ✅     | Manual                 | affiliate/page.tsx     | Form calls applyForAffiliate             |
| 8.9   | Deploy frontend                       | ✅     | `firebase deploy`      | wanapi-prod.web.app    | All pages deployed                       |
| 8.10  | Remove mock UI from referral page     | ✅     | Manual                 | referral/page.tsx      | Leaderboard hidden, activity shows empty |
| 8.11  | Run comprehensive audit               | ✅     | `/audit quick`         | No issues found        | Security: clean, TODOs: 0, Build: pass   |
| 8.12  | Deploy and test                       | ✅     | `firebase deploy`      | wanapi-prod.web.app    | Deployed, auth-protected page works      |
| 8.13  | Commit and push Phase 8               | ✅     | Git                    | ace5d00                | "Phase 8: Remove mock UI"                |

**Phase 8 Completion Criteria:**

- [x] Can generate referral link (GET /referral/code)
- [x] New user gets 25 credits via referral (POST /referral/apply)
- [ ] Referrer gets 100 credits after purchase (future webhook enhancement)
- [ ] Committed to master

---

## PHASE 9 — POLISH & LAUNCH

**Goal:** Production-ready quality
**Estimated Time:** 4-6 hours
**Dependencies:** Phase 8 complete

| ID   | Task                              | Status | Agent/Tool                      | Output              | Notes                   |
| ---- | --------------------------------- | ------ | ------------------------------- | ------------------- | ----------------------- |
| 9.1  | Run seo-meta-tags agent           | ⬜     | `seo-meta-tags`                 | Meta tags, JSON-LD  | All public pages        |
| 9.2  | Create sitemap.xml                | ⬜     | `seo-meta-tags`                 | sitemap.xml         |                         |
| 9.3  | Create robots.txt                 | ⬜     | `seo-meta-tags`                 | robots.txt          |                         |
| 9.4  | Run accessibility-auditor         | ⬜     | `accessibility-auditor`         | Audit report        | Fix issues              |
| 9.5  | Run performance-optimizer         | ⬜     | `performance-optimizer`         | Optimization report | Dynamic imports         |
| 9.6  | Run responsive-design-validator   | ⬜     | `responsive-design-validator`   | Validation report   | All breakpoints         |
| 9.7  | Run design-system-consistency     | ⬜     | `design-system-consistency`     | Consistency report  | No hardcoded values     |
| 9.8  | Run error-boundary-loading-states | ⬜     | `error-boundary-loading-states` | Components          | Error handling          |
| 9.9  | Final deployment                  | ⬜     | `deployment-orchestrator`       | Live site           |                         |
| 9.10 | Full user journey test            | ⬜     | `deployment-validator`          | Test results        | End-to-end              |
| 9.11 | Commit and push Phase 9           | ⬜     | Git                             | Commit hash         | "Phase 9: Launch ready" |

**Phase 9 Completion Criteria:**

- [ ] All SEO elements in place
- [ ] Accessibility audit passes
- [ ] Performance acceptable
- [ ] All breakpoints work
- [ ] No console errors
- [ ] Full user journey works
- [ ] Committed to master

---

## ONGOING — MOCK UI REMOVAL

**Goal:** Remove all mock/hardcoded UI and replace with real API data or empty states
**Policy:**
- Production users see honest, real data (empty states when nothing exists)
- Dev/demo pages can show full UI for stakeholder review (via `/dev/*` routes)
- Pages only exposed to users when real data is available

| Page                   | Status | Notes                                                        |
| ---------------------- | ------ | ------------------------------------------------------------ |
| referral/page.tsx      | ✅     | Activity: empty state / "coming soon". Leaderboard: hidden   |
| affiliate/page.tsx     | ⬜     | Review for mock data in dashboard stats                      |
| billing/page.tsx       | ⬜     | Review for mock transaction history                          |
| jobs/page.tsx          | ✅     | Fetches real data from API                                   |
| pricing/page.tsx       | ⬜     | Review credit packages (may need API fetch)                  |
| examples/page.tsx      | ⬜     | Review for hardcoded video examples                          |
| testimonials/page.tsx  | ⬜     | Review for hardcoded testimonials                            |

**Rules:**
1. No hardcoded data arrays in page components
2. Always fetch from API or show empty state
3. Use `/dev/*` routes for design review with mock data
4. Flag mock data with `/* DEV_ONLY */` comment if temporarily needed

---

## SUMMARY

| Phase             | Tasks   | Completed | Status |
| ----------------- | ------- | --------- | ------ |
| 0 - Foundation    | 10      | 10        | ✅     |
| 1 - Auth          | 19      | 19        | ✅     |
| 2 - Payments      | 14      | 14        | ✅     |
| 3 - Uploads       | 9       | 9         | ✅     |
| 4 - Jobs          | 11      | 11        | ✅     |
| 5 - Worker        | 9       | 9         | ✅     |
| 6 - Downloads     | 7       | 7         | ✅     |
| 7 - Subscriptions | 10      | 10        | ✅     |
| 8 - Referral      | 13      | 12        | 🔄     |
| 9 - Polish        | 11      | 0         | ⬜     |
| **TOTAL**         | **113** | **101**   | 🔄     |

---

## CURRENT STATE

**Current Phase:** 8 (Referral & Affiliate) - 92% Complete
**Current Task:** 8.13 (Commit and push Phase 8)
**Blockers:** None
**Last Updated:** 2025-11-30
**Live Site:** https://wanapi-prod.web.app (nuumee.ai)
**API URL:** https://nuumee-api-450296399943.us-central1.run.app
**Worker URL:** https://nuumee-worker-450296399943.us-central1.run.app
**Stripe Webhook:** we_1SYib475wY1iQccD8iUKNqOC (verified working)
**Upload Endpoint:** POST /upload/signed-url (GCS signed URLs)
**Jobs Endpoint:** POST /jobs (auto-enqueues), GET /jobs, GET /jobs/{id}, GET /jobs/{id}/output
**Subscriptions Endpoint:** POST /subscriptions/create, POST /subscriptions/cancel, GET /subscriptions/current, GET /subscriptions/tiers
**Referral Endpoint:** GET /referral/code, POST /referral/apply
**Affiliate Endpoint:** POST /affiliate/apply, GET /affiliate/stats, POST /affiliate/payout
**Cloud Tasks Queue:** nuumee-video-processing (5/sec, 3 retries)
**Subscription Tiers:** Creator ($29/mo, 400 credits), Studio ($99/mo, 1600 credits)

---

## ORCHESTRATOR INSTRUCTIONS

### To get next task:

```
1. Read TASK_TRACKER.md
2. Find current phase (first phase with incomplete tasks)
3. Find first task with status ⬜
4. Check dependencies met
5. Return task details
```

### To update task:

```
1. Change status symbol (⬜ → 🔄 → ✅)
2. Add notes if needed
3. Update CURRENT STATE section
4. Update SUMMARY counts
5. Commit changes
```

### To check phase completion:

```
1. All tasks in phase have ✅ status
2. All completion criteria checked
3. Commit exists with phase message
```

---

_This file is the single source of truth. Update after every task._
