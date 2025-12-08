# NuuMee02 — MASTER TASK TRACKER

**Purpose:** Single source of truth for tasks. | **Project:** wanapi-prod | **Domain:** nuumee.ai

## TL;DR - Current State

- **Phase:** 8.5 (Feature Completion) - 47% complete
- **Phases 0-7:** ✅ Complete - [see archive](archive/PHASES_0-7_COMPLETED.md)
- **Live Site:** https://nuumee.ai
- **Next Task:** 8.5.18 (billing test suite)

---

## STATUS LEGEND

| Symbol | Meaning |
|--------|---------|
| ⬜ | Not started |
| 🔄 | In progress |
| ✅ | Complete |

---

## PHASE 8 — REFERRAL & AFFILIATE

**Goal:** Referral codes, affiliate program
**Estimated Time:** 3-4 hours
**Dependencies:** Phase 7 complete

| ID   | Task                                 | Status | Agent/Tool          | Output               | Notes                                    |
| ---- | ------------------------------------ | ------ | ------------------- | -------------------- | ---------------------------------------- |
| 8.1  | Create backend/app/referral/ folder  | ✅     | `api-builder`       | router.py, models.py | Done via sub-agent                       |
| 8.2  | Implement GET /referral/code         | ✅     | `api-builder`       | router.py            | Get/generate referral code               |
| 8.3  | Implement POST /referral/apply       | ✅     | `api-builder`       | router.py            | Apply code, get 25 credits               |
| 8.4  | Create backend/app/affiliate/ folder | ✅     | `api-builder`       | router.py, models.py | Done via sub-agent                       |
| 8.5  | Implement affiliate endpoints        | ✅     | `api-builder`       | router.py            | apply, stats, payout                     |
| 8.6  | Deploy updated backend               | ✅     | `gcloud run deploy` | nuumee-api-00062-v4t | All endpoints live                       |
| 8.7  | Update referral page with API        | ✅     | Manual              | referral/page.tsx    | Uses getReferralCode API                 |
| 8.8  | Update affiliate page with API       | ✅     | Manual              | affiliate/page.tsx   | Form calls applyForAffiliate             |
| 8.9  | Deploy frontend                      | ✅     | `firebase deploy`   | wanapi-prod.web.app  | All pages deployed                       |
| 8.10 | Remove mock UI from referral page    | ✅     | Manual              | referral/page.tsx    | Leaderboard hidden, activity shows empty |
| 8.11 | Run comprehensive audit              | ✅     | `/audit quick`      | No issues found      | Security: clean, TODOs: 0, Build: pass   |
| 8.12 | Deploy and test                      | ✅     | `firebase deploy`   | wanapi-prod.web.app  | Deployed, auth-protected page works      |
| 8.13 | Commit and push Phase 8              | ✅     | Git                 | ace5d00              | "Phase 8: Remove mock UI"                |

**Phase 8 Completion Criteria:**

- [x] Can generate referral link (GET /referral/code)
- [x] New user gets 25 credits via referral (POST /referral/apply)
- [ ] Referrer gets 100 credits after purchase (future webhook enhancement)
- [ ] Committed to master

---

## PHASE 8.5 — FEATURE COMPLETION (PRIORITY)

**Goal:** Make all features fully functional - NO "Coming Soon" placeholders
**Priority Order:**

1. **Billing** - bulletproof, error-free, clear
2. **Job/Video creation** - end-to-end must work
3. **Complete all features** - everything needed for working product

**Dependencies:** Phase 8 complete

### Critical Fixes (BLOCKING)

| ID    | Task                              | Status | Agent/Tool          | Output           | Notes                             |
| ----- | --------------------------------- | ------ | ------------------- | ---------------- | --------------------------------- |
| 8.5.1 | Fix GCS signing for job downloads | ✅     | Manual              | jobs/router.py   | Use credentials= not access_token |
| 8.5.2 | Deploy backend with fix           | ✅     | `gcloud run deploy` | nuumee-api-00070 | Deployed 2025-11-30               |
| 8.5.3 | Test job download on production   | 🔄     | Manual              | Test results     | Verify signed URLs work           |
| 8.5.4 | Fix retry button on /jobs         | ✅     | Manual              | jobs/page.tsx    | Added handleRetry + onClick       |

### Billing Features (Priority 1)

| ID    | Task                            | Status | Agent/Tool    | Output             | Notes                              |
| ----- | ------------------------------- | ------ | ------------- | ------------------ | ---------------------------------- |
| 8.5.5 | Implement auto-refill feature   | ⬜     | Manual        | billing/page.tsx   | Backend + frontend                 |
| 8.5.6 | Auto-refill: Backend endpoint   | ⬜     | `api-builder` | credits/router.py  | POST /credits/auto-refill settings |
| 8.5.7 | Auto-refill: Webhook trigger    | ⬜     | Manual        | webhooks/router.py | Check balance after job completion |
| 8.5.8 | Transaction history (real data) | ✅     | Manual        | billing/page.tsx   | Uses GET /transactions             |

### Billing Data Integrity (Priority 1.5)

| ID     | Task                                     | Status | Agent/Tool | Output                         | Notes                                  |
| ------ | ---------------------------------------- | ------ | ---------- | ------------------------------ | -------------------------------------- |
| 8.5.15 | Create billing_period sync script        | ✅     | Manual     | scripts/sync_billing_period.py | Sync from Stripe for existing users    |
| 8.5.16 | Fix UI for missing billing_period        | ✅     | Manual     | billing/page.tsx               | Auto-sync on page load + manual button |
| 8.5.17 | Add card last4 to transaction metadata   | ✅     | Manual     | webhooks/router.py             | Store pm_xxxx last4 in transactions    |
| 8.5.18 | Create comprehensive billing test suite  | ⬜     | Manual     | e2e/billing-flows.spec.ts      | All subscription state transitions     |
| 8.5.19 | Create Subscription State Matrix doc     | ✅     | Manual     | docs/SUBSCRIPTION_STATE_MATRIX | Full flow documentation                |

### Account Features (Priority 3)

| ID     | Task                                   | Status | Agent/Tool    | Output           | Notes                        |
| ------ | -------------------------------------- | ------ | ------------- | ---------------- | ---------------------------- |
| 8.5.9  | Profile save (name, company, location) | ✅     | Manual        | account/page.tsx | PATCH /auth/me               |
| 8.5.10 | Notification preferences (backend)     | ⬜     | `api-builder` | auth/router.py   | PATCH /auth/me/notifications |
| 8.5.11 | Notification preferences (frontend)    | ⬜     | Manual        | account/page.tsx | Wire up switches to API      |
| 8.5.12 | Privacy settings (data retention)      | ⬜     | `api-builder` | users/router.py  | Store in user doc            |
| 8.5.13 | Data export feature                    | ⬜     | `api-builder` | users/router.py  | POST /users/me/export        |

### Referral Completion

| ID     | Task                                  | Status | Agent/Tool | Output             | Notes                         |
| ------ | ------------------------------------- | ------ | ---------- | ------------------ | ----------------------------- |
| 8.5.14 | Referrer gets 100 credits on purchase | ⬜     | Manual     | webhooks/router.py | In checkout.session.completed |

**Phase 8.5 Completion Criteria:**

- [ ] Job downloads work (GCS signing fixed)
- [ ] Retry button works on /jobs
- [ ] Auto-refill implemented and working
- [ ] Notification preferences save to Firestore
- [ ] All "Coming Soon" badges removed
- [ ] Referrer reward implemented

---

## PHASE 9 — POLISH & LAUNCH

**Goal:** Production-ready quality
**Estimated Time:** 4-6 hours
**Dependencies:** Phase 8.5 complete

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

| Page                  | Status | Notes                                                      |
| --------------------- | ------ | ---------------------------------------------------------- |
| referral/page.tsx     | ✅     | Activity: empty state / "coming soon". Leaderboard: hidden |
| affiliate/page.tsx    | ⬜     | Review for mock data in dashboard stats                    |
| billing/page.tsx      | ⬜     | Review for mock transaction history                        |
| jobs/page.tsx         | ✅     | Fetches real data from API                                 |
| pricing/page.tsx      | ⬜     | Review credit packages (may need API fetch)                |
| examples/page.tsx     | ⬜     | Review for hardcoded video examples                        |
| testimonials/page.tsx | ⬜     | Review for hardcoded testimonials                          |

**Rules:**

1. No hardcoded UI in page components. Fetching moco Mock Data from a database is ok, but hardcoded mock UI is not ok
2. Always fetch from API or show empty state
3. Use `/dev/*` routes for design review with mock data
4. Flag mock data with `/* DEV_ONLY */` comment if temporarily needed

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
| 8 - Referral           | 13      | 12        | 🔄     |
| 8.5 - Feature Complete | 19      | 9         | 🔄     |
| 9 - Polish             | 11      | 0         | ⬜     |
| **TOTAL**              | **132** | **110**   | 🔄     |

---

## CURRENT STATE

**Current Phase:** 8.5 (Feature Completion) - 47% Complete
**Current Task:** 8.5.18 (Create comprehensive billing test suite)
**Next Priority:** Comprehensive test suite (8.5.18), then auto-refill (8.5.5-8.5.7)
**Blockers:** None
**Last Updated:** 2025-12-02
**Live Site:** https://nuumee.ai (wanapi-prod.web.app)
**API URL:** https://nuumee-api-450296399943.us-west1.run.app
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
