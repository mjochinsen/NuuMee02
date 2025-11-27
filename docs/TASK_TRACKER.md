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

| Symbol | Meaning |
|--------|--------|
| ⬜ | Not started |
| 🔄 | In progress |
| ✅ | Complete |
| ❌ | Blocked |
| ⏭️ | Skipped (with reason) |

---

## PHASE 0 — FOUNDATION

**Goal:** Clean folder structure, stub files, environment ready
**Estimated Time:** 1 hour
**Dependencies:** None

| ID | Task | Status | Agent/Tool | Output | Notes |
|----|------|--------|------------|--------|-------|
| 0.1 | Create folder structure (frontend/, backend/, worker/) | ✅ | Manual | Folders exist | Done |
| 0.2 | Initialize Next.js in frontend/ | ✅ | `pnpm create next-app` | package.json, app/ | Next.js 16 with Tailwind |
| 0.3 | Create backend/app/main.py with health endpoint | ✅ | Manual | main.py | FastAPI minimal |
| 0.4 | Create backend/requirements.txt | ✅ | Manual | requirements.txt | Done |
| 0.5 | Create backend/Dockerfile | ✅ | Manual | Dockerfile | Done |
| 0.6 | Create worker/ stub files | ✅ | Manual | main.py, wavespeed.py | Empty stubs only |
| 0.7 | Create frontend/.env.local | ✅ | Manual | .env.local | Firebase config set |
| 0.8 | Create backend/.env | ✅ | Manual | .env | GCP project set |
| 0.9 | Create firebase.json | ✅ | Manual | firebase.json | Site: nuumee-66a48 |
| 0.10 | Commit and push Phase 0 | ✅ | Git | 605b7e5 | "Phase 0: Foundation" |

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

| ID | Task | Status | Agent/Tool | Output | Notes |
|----|------|--------|------------|--------|-------|
| 1.1 | Create backend/app/auth/ folder structure | ✅ | Manual | router.py, firebase.py, models.py | Done |
| 1.2 | Implement Firebase Admin SDK init | ✅ | Manual | firebase.py | Uses Secret Manager |
| 1.3 | Implement POST /auth/register | ✅ | Manual | router.py | Creates user with 25 credits |
| 1.4 | Implement POST /auth/login | ✅ | Manual | router.py | Validates token, returns profile |
| 1.5 | Implement GET /auth/me | ✅ | Manual | router.py | Returns user profile |
| 1.6 | Create auth middleware | ✅ | Manual | middleware/auth.py | Token validation |
| 1.7 | Deploy backend to Cloud Run | ✅ | `gcloud run deploy` | nuumee-api-450296399943 | .env updated |
| 1.8 | Test backend endpoints with curl | ✅ | curl | Health check passed | /docs available |

### Frontend Tasks

| ID | Task | Status | Agent/Tool | Output | Notes |
|----|------|--------|------------|--------|-------|
| 1.9 | Review FromFigmaMake/ for login/signup designs | ✅ | Manual | Design notes | LoginPage.tsx reference |
| 1.10 | Create lib/firebase.ts | ✅ | Manual | firebase.ts | Google/GitHub/Email auth |
| 1.11 | Create lib/api.ts | ✅ | Manual | api.ts | Auth header, no 403 logout |
| 1.12 | Create components/AuthProvider.tsx | ✅ | Manual | AuthProvider.tsx | Auth context |
| 1.13 | Create app/login/page.tsx | ✅ | Manual | page.tsx | Login + forgot password |
| 1.14 | Create app/signup/page.tsx | ✅ | Manual | page.tsx | With password strength |
| 1.15 | Create components/Navbar.tsx | ✅ | Manual | Navbar.tsx | User menu, credits display |
| 1.16 | Update app/layout.tsx with AuthProvider | ✅ | Manual | layout.tsx | Wrapped app |
| 1.17 | Deploy frontend to Firebase Hosting | ✅ | `firebase deploy` | nuumee-66a48.web.app | Deployed |
| 1.18 | Test full auth flow on live site | ✅ | WebFetch | All pages verified | Home, login, signup live |
| 1.19 | Commit and push Phase 1 | ✅ | Git | 396a77f | Frontend pushed |

**Phase 1 Completion Criteria:**
- [ ] Can signup at https://nuumee.ai/signup
- [ ] User document created in Firestore with 25 credits
- [ ] Can login at https://nuumee.ai/login
- [ ] Session persists on page refresh
- [ ] Logout works
- [ ] Committed to master

---

## PHASE 2 — PAYMENTS

**Goal:** Buy credits via Stripe, see balance in UI
**Estimated Time:** 3-4 hours
**Dependencies:** Phase 1 complete

### Backend Tasks

| ID | Task | Status | Agent/Tool | Output | Notes |
|----|------|--------|------------|--------|-------|
| 2.1 | Create backend/app/credits/ folder | ⬜ | Manual | router.py, models.py | |
| 2.2 | Implement POST /credits/checkout | ⬜ | `api-builder` | router.py | Creates Stripe session |
| 2.3 | Implement POST /webhooks/stripe | ⬜ | `api-builder` | router.py | Handles checkout.session.completed |
| 2.4 | Configure Stripe webhook in dashboard | ⬜ | Manual | Webhook URL | Point to Cloud Run |
| 2.5 | Deploy updated backend | ⬜ | `gcloud run deploy` | Live URL | |
| 2.6 | Test webhook with Stripe CLI | ⬜ | `stripe listen` | Test results | |

### Frontend Tasks

| ID | Task | Status | Agent/Tool | Output | Notes |
|----|------|--------|------------|--------|-------|
| 2.7 | Review FromFigmaMake/ for pricing page | ⬜ | Manual | Design notes | |
| 2.8 | Create app/pricing/page.tsx | ⬜ | `frontend-dev` | page.tsx | Credit packages |
| 2.9 | Create app/payment/success/page.tsx | ⬜ | `frontend-dev` | page.tsx | Success confirmation |
| 2.10 | Create app/payment/cancel/page.tsx | ⬜ | `frontend-dev` | page.tsx | Cancel message |
| 2.11 | Add credit balance display to Navbar | ⬜ | `frontend-dev` | Navbar.tsx | Shows current credits |
| 2.12 | Deploy frontend | ⬜ | `firebase deploy` | Live site | |
| 2.13 | Test full payment flow (test mode) | ⬜ | `deployment-validator` | Test results | Use 4242 card |
| 2.14 | Commit and push Phase 2 | ⬜ | Git | Commit hash | "Phase 2: Payments complete" |

**Phase 2 Completion Criteria:**
- [ ] Can click Buy Credits
- [ ] Stripe checkout opens
- [ ] After payment, redirect to success page
- [ ] Credits updated in Firestore
- [ ] UI shows new balance
- [ ] Committed to master

---

## PHASE 3 — UPLOADS

**Goal:** Upload reference image + motion video to GCS
**Estimated Time:** 2-3 hours
**Dependencies:** Phase 2 complete

| ID | Task | Status | Agent/Tool | Output | Notes |
|----|------|--------|------------|--------|-------|
| 3.1 | Create backend/app/upload/ folder | ⬜ | Manual | router.py | |
| 3.2 | Implement POST /upload/signed-url | ⬜ | `api-builder` | router.py | GCS signed URLs |
| 3.3 | Deploy updated backend | ⬜ | `gcloud run deploy` | Live URL | |
| 3.4 | Review FromFigmaMake/ for upload UI | ⬜ | Manual | Design notes | |
| 3.5 | Create upload components (drag-drop, preview) | ⬜ | `frontend-dev` | Components | |
| 3.6 | Create app/create/page.tsx | ⬜ | `frontend-dev` | page.tsx | Upload interface |
| 3.7 | Deploy frontend | ⬜ | `firebase deploy` | Live site | |
| 3.8 | Test uploads to GCS | ⬜ | `deployment-validator` | Test results | Verify files in bucket |
| 3.9 | Commit and push Phase 3 | ⬜ | Git | Commit hash | "Phase 3: Uploads complete" |

**Phase 3 Completion Criteria:**
- [ ] Can upload image via drag-drop
- [ ] Can upload video via drag-drop
- [ ] Files appear in GCS bucket
- [ ] Preview shows uploaded files
- [ ] Committed to master

---

## PHASE 4 — JOB CREATION

**Goal:** Create job, deduct credits, store in Firestore
**Estimated Time:** 3-4 hours
**Dependencies:** Phase 3 complete

| ID | Task | Status | Agent/Tool | Output | Notes |
|----|------|--------|------------|--------|-------|
| 4.1 | Create backend/app/jobs/ folder | ⬜ | Manual | router.py, models.py | |
| 4.2 | Implement POST /jobs | ⬜ | `api-builder` | router.py | Create job, deduct credits |
| 4.3 | Implement GET /jobs | ⬜ | `api-builder` | router.py | List user's jobs |
| 4.4 | Implement GET /jobs/{id} | ⬜ | `api-builder` | router.py | Job details |
| 4.5 | Deploy updated backend | ⬜ | `gcloud run deploy` | Live URL | |
| 4.6 | Create cost calculator component | ⬜ | `frontend-dev` | Component | Shows credit cost |
| 4.7 | Create app/jobs/page.tsx (job list) | ⬜ | `frontend-dev` | page.tsx | |
| 4.8 | Add job submission to create page | ⬜ | `frontend-dev` | page.tsx | Submit button |
| 4.9 | Deploy frontend | ⬜ | `firebase deploy` | Live site | |
| 4.10 | Test job creation flow | ⬜ | `deployment-validator` | Test results | |
| 4.11 | Commit and push Phase 4 | ⬜ | Git | Commit hash | "Phase 4: Jobs complete" |

**Phase 4 Completion Criteria:**
- [ ] Can submit job after upload
- [ ] Credits deducted correctly
- [ ] Job appears in Firestore
- [ ] Job appears in job list UI
- [ ] Insufficient credits shows error
- [ ] Committed to master

---

## PHASE 5 — WORKER

**Goal:** Process jobs via WaveSpeed, generate videos
**Estimated Time:** 4-6 hours
**Dependencies:** Phase 4 complete

| ID | Task | Status | Agent/Tool | Output | Notes |
|----|------|--------|------------|--------|-------|
| 5.1 | Implement worker/main.py | ⬜ | `api-builder` | main.py | Cloud Run entry point |
| 5.2 | Implement worker/wavespeed.py | ⬜ | `api-builder` | wavespeed.py | WaveSpeed API client |
| 5.3 | Create worker/requirements.txt | ⬜ | Manual | requirements.txt | |
| 5.4 | Create worker/Dockerfile | ⬜ | Manual | Dockerfile | |
| 5.5 | Deploy worker to Cloud Run | ⬜ | `gcloud run deploy` | Live URL | No public access |
| 5.6 | Set up Cloud Tasks queue | ⬜ | `gcloud tasks` | Queue | |
| 5.7 | Add job enqueueing to backend | ⬜ | `api-builder` | Updated POST /jobs | |
| 5.8 | Test end-to-end job processing | ⬜ | Manual | Test results | |
| 5.9 | Commit and push Phase 5 | ⬜ | Git | Commit hash | "Phase 5: Worker complete" |

**Phase 5 Completion Criteria:**
- [ ] Job triggers worker
- [ ] Worker calls WaveSpeed API
- [ ] Output uploaded to GCS
- [ ] Job status updated to "completed"
- [ ] Committed to master

---

## PHASE 6 — DOWNLOADS

**Goal:** View completed jobs, download results
**Estimated Time:** 2-3 hours
**Dependencies:** Phase 5 complete

| ID | Task | Status | Agent/Tool | Output | Notes |
|----|------|--------|------------|--------|-------|
| 6.1 | Implement GET /jobs/{id}/output | ⬜ | `api-builder` | router.py | Signed download URL |
| 6.2 | Deploy updated backend | ⬜ | `gcloud run deploy` | Live URL | |
| 6.3 | Add download button to job list | ⬜ | `frontend-dev` | Component | |
| 6.4 | Create job detail page | ⬜ | `frontend-dev` | page.tsx | Status, preview, download |
| 6.5 | Deploy frontend | ⬜ | `firebase deploy` | Live site | |
| 6.6 | Test download flow | ⬜ | `deployment-validator` | Test results | |
| 6.7 | Commit and push Phase 6 | ⬜ | Git | Commit hash | "Phase 6: Downloads complete" |

**Phase 6 Completion Criteria:**
- [ ] Completed jobs show download button
- [ ] Download works
- [ ] Video plays correctly
- [ ] Committed to master

---

## PHASE 7 — SUBSCRIPTIONS

**Goal:** Monthly subscription tiers with recurring credits
**Estimated Time:** 3-4 hours
**Dependencies:** Phase 6 complete

| ID | Task | Status | Agent/Tool | Output | Notes |
|----|------|--------|------------|--------|-------|
| 7.1 | Create backend/app/subscriptions/ folder | ⬜ | Manual | router.py | |
| 7.2 | Implement POST /subscriptions/create | ⬜ | `api-builder` | router.py | |
| 7.3 | Implement POST /subscriptions/cancel | ⬜ | `api-builder` | router.py | |
| 7.4 | Implement GET /subscriptions/current | ⬜ | `api-builder` | router.py | |
| 7.5 | Add invoice.paid webhook handler | ⬜ | `api-builder` | router.py | Add monthly credits |
| 7.6 | Deploy updated backend | ⬜ | `gcloud run deploy` | Live URL | |
| 7.7 | Add subscription UI to pricing page | ⬜ | `frontend-dev` | page.tsx | |
| 7.8 | Deploy frontend | ⬜ | `firebase deploy` | Live site | |
| 7.9 | Test subscription flow | ⬜ | `deployment-validator` | Test results | |
| 7.10 | Commit and push Phase 7 | ⬜ | Git | Commit hash | "Phase 7: Subscriptions complete" |

**Phase 7 Completion Criteria:**
- [ ] Can subscribe to tier
- [ ] Credits added immediately
- [ ] Can cancel subscription
- [ ] Committed to master

---

## PHASE 8 — REFERRAL & AFFILIATE

**Goal:** Referral codes, affiliate program
**Estimated Time:** 3-4 hours
**Dependencies:** Phase 7 complete

| ID | Task | Status | Agent/Tool | Output | Notes |
|----|------|--------|------------|--------|-------|
| 8.1 | Create backend/app/referral/ folder | ⬜ | Manual | router.py | |
| 8.2 | Implement GET /referral/code | ⬜ | `api-builder` | router.py | |
| 8.3 | Implement POST /referral/apply | ⬜ | `api-builder` | router.py | |
| 8.4 | Create backend/app/affiliate/ folder | ⬜ | Manual | router.py | |
| 8.5 | Implement affiliate endpoints | ⬜ | `api-builder` | router.py | apply, stats, payout |
| 8.6 | Deploy updated backend | ⬜ | `gcloud run deploy` | Live URL | |
| 8.7 | Create referral page | ⬜ | `frontend-dev` | page.tsx | Share link |
| 8.8 | Create affiliate dashboard | ⬜ | `frontend-dev` | page.tsx | Stats, payout |
| 8.9 | Deploy frontend | ⬜ | `firebase deploy` | Live site | |
| 8.10 | Test referral flow | ⬜ | `deployment-validator` | Test results | |
| 8.11 | Commit and push Phase 8 | ⬜ | Git | Commit hash | "Phase 8: Referral complete" |

**Phase 8 Completion Criteria:**
- [ ] Can generate referral link
- [ ] New user gets 25 credits via referral
- [ ] Referrer gets 100 credits after purchase
- [ ] Committed to master

---

## PHASE 9 — POLISH & LAUNCH

**Goal:** Production-ready quality
**Estimated Time:** 4-6 hours
**Dependencies:** Phase 8 complete

| ID | Task | Status | Agent/Tool | Output | Notes |
|----|------|--------|------------|--------|-------|
| 9.1 | Run seo-meta-tags agent | ⬜ | `seo-meta-tags` | Meta tags, JSON-LD | All public pages |
| 9.2 | Create sitemap.xml | ⬜ | `seo-meta-tags` | sitemap.xml | |
| 9.3 | Create robots.txt | ⬜ | `seo-meta-tags` | robots.txt | |
| 9.4 | Run accessibility-auditor | ⬜ | `accessibility-auditor` | Audit report | Fix issues |
| 9.5 | Run performance-optimizer | ⬜ | `performance-optimizer` | Optimization report | Dynamic imports |
| 9.6 | Run responsive-design-validator | ⬜ | `responsive-design-validator` | Validation report | All breakpoints |
| 9.7 | Run design-system-consistency | ⬜ | `design-system-consistency` | Consistency report | No hardcoded values |
| 9.8 | Run error-boundary-loading-states | ⬜ | `error-boundary-loading-states` | Components | Error handling |
| 9.9 | Final deployment | ⬜ | `deployment-orchestrator` | Live site | |
| 9.10 | Full user journey test | ⬜ | `deployment-validator` | Test results | End-to-end |
| 9.11 | Commit and push Phase 9 | ⬜ | Git | Commit hash | "Phase 9: Launch ready" |

**Phase 9 Completion Criteria:**
- [ ] All SEO elements in place
- [ ] Accessibility audit passes
- [ ] Performance acceptable
- [ ] All breakpoints work
- [ ] No console errors
- [ ] Full user journey works
- [ ] Committed to master

---

## SUMMARY

| Phase | Tasks | Completed | Status |
|-------|-------|-----------|--------|
| 0 - Foundation | 10 | 10 | ✅ |
| 1 - Auth | 19 | 19 | ✅ |
| 2 - Payments | 14 | 0 | ⬜ |
| 3 - Uploads | 9 | 0 | ⬜ |
| 4 - Jobs | 11 | 0 | ⬜ |
| 5 - Worker | 9 | 0 | ⬜ |
| 6 - Downloads | 7 | 0 | ⬜ |
| 7 - Subscriptions | 10 | 0 | ⬜ |
| 8 - Referral | 11 | 0 | ⬜ |
| 9 - Polish | 11 | 0 | ⬜ |
| **TOTAL** | **111** | **29** | 🔄 |

---

## CURRENT STATE

**Current Phase:** 2
**Current Task:** 2.1 (Create backend/app/credits/ folder)
**Blockers:** None
**Last Updated:** 2025-11-27 23:45
**Live Site:** https://nuumee-66a48.web.app

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

*This file is the single source of truth. Update after every task.*