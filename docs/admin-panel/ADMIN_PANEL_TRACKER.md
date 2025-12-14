# Admin Panel Implementation Tracker

**Created:** 2025-12-14
**Design Doc:** [DESIGN_DECISIONS.md](./DESIGN_DECISIONS.md)
**API Contract:** [ADMIN_API_SCHEMA.yaml](./ADMIN_API_SCHEMA.yaml)
**Location:** `/admin555/*`
**Estimated Total:** 8-10 hours

---

## Orchestration Strategy

**Pattern:** Phased Parallel Execution (FIBY Approved)

```
Phase 0: Schema First (Sequential - KODY)
├── Create ADMIN_API_SCHEMA.yaml (OpenAPI spec)
└── Generate ADMIN_TYPES.ts (TypeScript types)

Phase 1: Foundation (Sequential - KODY)
├── Backend: Admin auth middleware, health endpoint
└── Frontend: Layout, sidebar, password gate, toast system

Phase 2-5: Build Pages (Parallel - Agents)
├── api-builder → FastAPI routes (sonnet)
└── frontend-dev → React components (sonnet)

Phase 6: Dashboard (Sequential - KODY)
└── Aggregate stats from all endpoints

Phase 7: Polish & Deploy (Sequential - KODY)
└── Loading states, error handling, deploy
```

**Delegation Contract:** Both agents reference `ADMIN_API_SCHEMA.yaml` as source of truth.

---

## Overview

| Phase | Description | Status | Tasks |
|-------|-------------|--------|-------|
| 0 | Schema & Types | 🟩 Complete | 2 |
| 1 | Foundation & Layout | 🟩 Complete | 12 |
| 2 | Users Page | 🟩 Complete | 10 |
| 3 | Jobs Page | 🟩 Complete | 8 |
| 4 | Payments Page | 🟩 Complete | 6 |
| 5 | Promo Codes Page | 🟩 Complete | 7 |
| 6 | Dashboard Page | 🟩 Complete | 5 |
| 7 | Polish & Deploy | 🟩 Complete | 6 |

**Legend:** 🟥 Not Started | 🟨 In Progress | 🟩 Complete

**Completed:** December 14, 2025

---

## Phase 0: Schema & Types (30 min) ✅

| ID | Task | Status | Notes |
|----|------|--------|-------|
| 0.1 | Create `ADMIN_API_SCHEMA.yaml` | 🟩 | OpenAPI 3.0 spec for all 10 endpoints |
| 0.2 | Generate `ADMIN_TYPES.ts` | 🟩 | TypeScript types from schema |

### Acceptance Criteria
- [x] Schema defines all request/response types
- [x] TypeScript types match Pydantic models
- [x] Both backend and frontend reference same contract

---

## Phase 1: Foundation & Layout (2 hours) ✅

### Backend Setup

| ID | Task | Status | Notes |
|----|------|--------|-------|
| 1.1 | Create `backend/app/admin/` directory structure | 🟩 | router.py, schemas.py, dependencies.py |
| 1.2 | Implement admin password middleware | 🟩 | Check `X-Admin-Password` header |
| 1.3 | Add `ADMIN_PASSWORD` to environment variables | 🟩 | Cloud Run env var set |
| 1.4 | Create basic `/api/v1/admin/health` endpoint | 🟩 | Verify auth works |

### Frontend Setup

| ID | Task | Status | Notes |
|----|------|--------|-------|
| 1.5 | Create `frontend/app/admin555/layout.tsx` | 🟩 | Password gate + sidebar + breadcrumbs |
| 1.6 | Create `AdminSidebar.tsx` with failed jobs badge | 🟩 | Navigation + red badge for failed count |
| 1.7 | Create `PasswordPrompt.tsx` | 🟩 | Input + localStorage storage |
| 1.8 | Create `frontend/app/admin555/page.tsx` placeholder | 🟩 | Full dashboard implemented |
| 1.9 | Setup toast notifications (sonner) | 🟩 | Global toast provider |
| 1.10 | Create `AdminErrorBoundary.tsx` | 🟩 | Per-section error boundaries |
| 1.11 | Create `Breadcrumbs.tsx` component | 🟩 | Admin > Users > john@example.com |
| 1.12 | Create admin API client with error handling | 🟩 | Centralized fetch with auth header |

### Acceptance Criteria
- [x] Visiting `/admin555` prompts for password
- [x] Correct password grants access, stored in localStorage
- [x] Sidebar shows navigation to all 5 pages
- [x] Sidebar shows badge with failed jobs count
- [x] Breadcrumbs show current location
- [x] Toast notifications work for success/error
- [x] Error boundaries prevent full page crashes
- [x] Incorrect password shows error message

---

## Phase 2: Users Page (2 hours) ✅

### Backend

| ID | Task | Status | Notes |
|----|------|--------|-------|
| 2.1 | Create `GET /api/v1/admin/users` endpoint | 🟩 | Pagination, search by email/name/uid |
| 2.2 | Create `GET /api/v1/admin/users/{uid}` endpoint | 🟩 | User detail + recent jobs + transactions |
| 2.3 | Create `POST /api/v1/admin/users/{uid}/credits` | 🟩 | Add/deduct credits, max 2000 |
| 2.4 | Add Firestore query for prefix search | 🟩 | Support partial email/name match |

### Frontend

| ID | Task | Status | Notes |
|----|------|--------|-------|
| 2.5 | Create reusable `DataTable.tsx` component | 🟩 | Inline in page (not separate component) |
| 2.6 | Create `frontend/app/admin555/users/page.tsx` | 🟩 | User list with search |
| 2.7 | Create `UserRow.tsx` component | 🟩 | Inline in page |
| 2.8 | Create `SlidePanel.tsx` for user details | 🟩 | UserDetailPanel component |
| 2.9 | Create `CreditAdjustModal.tsx` | 🟩 | CreditAdjustmentForm in slide panel |
| 2.10 | Persist search/page in URL params | 🟩 | URL state management |

### Acceptance Criteria
- [x] Can search users by email, name, or user_id
- [x] Clicking user row opens detail panel
- [x] Can add/deduct credits with confirmation
- [x] Credit adjustment limited to 2000 max
- [x] Pagination works (25 per page)
- [x] Filters persist on page refresh
- [x] Toast shows on credit adjustment success/failure

---

## Phase 3: Jobs Page (1.5 hours) ✅

### Backend

| ID | Task | Status | Notes |
|----|------|--------|-------|
| 3.1 | Create `GET /api/v1/admin/jobs` endpoint | 🟩 | Filter by status, pagination |
| 3.2 | Create `POST /api/v1/admin/jobs/{id}/retry` | 🟩 | Reset to pending, enqueue task |
| 3.3 | Add job detail lookup with error info | 🟩 | Include full error_message |

### Frontend

| ID | Task | Status | Notes |
|----|------|--------|-------|
| 3.4 | Create `frontend/app/admin555/jobs/page.tsx` | 🟩 | Jobs list with status filter tabs |
| 3.5 | Create `JobRow.tsx` component | 🟩 | Inline in page |
| 3.6 | Create status filter dropdown | 🟩 | Tab-based: All, Pending, Processing, Completed, Failed |
| 3.7 | Create `JobDetailModal.tsx` | 🟩 | JobDetailPanel slide-over |
| 3.8 | Implement retry button for failed jobs | 🟩 | Confirmation before retry |

### Acceptance Criteria
- [x] Can filter jobs by status
- [x] Failed jobs show error message
- [x] Can retry failed jobs (resets to pending)
- [x] Job detail shows all metadata
- [x] Pagination works
- [x] Toast shows on retry success/failure

---

## Phase 4: Payments Page (1.5 hours) ✅

### Backend

| ID | Task | Status | Notes |
|----|------|--------|-------|
| 4.1 | Create `GET /api/v1/admin/payments` endpoint | 🟩 | Aggregate stats + recent transactions |
| 4.2 | Integrate Stripe API for revenue data | 🟩 | MRR, total revenue, subscriber count |
| 4.3 | Cache Stripe data (5 min TTL) | 🟩 | Avoid rate limits |

### Frontend

| ID | Task | Status | Notes |
|----|------|--------|-------|
| 4.4 | Create `frontend/app/admin555/payments/page.tsx` | 🟩 | Stats cards + transaction list |
| 4.5 | Create `StatsCard.tsx` component | 🟩 | Inline StatsCard component |
| 4.6 | Create transaction list with basic info | 🟩 | Amount, user, date, type |

### Acceptance Criteria
- [x] Shows MRR, total revenue, subscriber count
- [x] Shows recent credit purchases
- [x] Shows recent subscription events
- [x] Data refreshes on page load

---

## Phase 5: Promo Codes Page (1 hour) ✅

### Backend

| ID | Task | Status | Notes |
|----|------|--------|-------|
| 5.1 | Create Firestore `promo_codes` collection | 🟩 | Schema per DESIGN_DECISIONS.md |
| 5.2 | Create `GET /api/v1/admin/promos` endpoint | 🟩 | List all promo codes |
| 5.3 | Create `POST /api/v1/admin/promos` endpoint | 🟩 | Create new promo code |
| 5.4 | Create `DELETE /api/v1/admin/promos/{id}` | 🟩 | Deactivate promo code |

### Frontend

| ID | Task | Status | Notes |
|----|------|--------|-------|
| 5.5 | Create `frontend/app/admin555/promos/page.tsx` | 🟩 | Promo list + create form |
| 5.6 | Create `CreatePromoModal.tsx` | 🟩 | Inline form in page |
| 5.7 | Create `PromoRow.tsx` component | 🟩 | Inline table rows |

### Acceptance Criteria
- [x] Can create promo code with custom name
- [x] Can set credits amount, max uses, expiry date
- [x] Can deactivate/delete promo codes
- [x] Shows usage count for each code
- [x] Toast shows on create/delete success/failure

---

## Phase 6: Dashboard Page (1 hour) ✅

### Backend

| ID | Task | Status | Notes |
|----|------|--------|-------|
| 6.1 | Create `GET /api/v1/admin/dashboard` endpoint | 🟩 | Aggregate KPIs |

### Frontend

| ID | Task | Status | Notes |
|----|------|--------|-------|
| 6.2 | Update `frontend/app/admin555/page.tsx` | 🟩 | Full dashboard with stats |
| 6.3 | Display: Total users, new today | 🟩 | From Firestore count |
| 6.4 | Display: Jobs today, failed jobs | 🟩 | From Firestore query |
| 6.5 | Display: Revenue this month | 🟩 | MRR from Stripe |

### Acceptance Criteria
- [x] Dashboard shows key metrics at a glance
- [x] Numbers update on page refresh
- [x] Links to relevant pages (e.g., "12 failed jobs" links to jobs?status=failed)

---

## Phase 7: Polish & Deploy (1 hour) ✅

| ID | Task | Status | Notes |
|----|------|--------|-------|
| 7.1 | Add loading states to all pages | 🟩 | Loader2 spinners |
| 7.2 | Verify all toasts work correctly | 🟩 | Success/error for all actions |
| 7.3 | Add empty states | 🟩 | "No users found" etc. |
| 7.4 | TypeScript type check | 🟩 | `pnpm tsc --noEmit` passed |
| 7.5 | Deploy backend | 🟩 | nuumee-api-00135 |
| 7.6 | Deploy frontend | 🟩 | Firebase Hosting |

### Acceptance Criteria
- [x] All pages load without errors
- [x] All features work end-to-end
- [x] TypeScript passes
- [x] Deployed and accessible at nuumee.ai/admin555

---

## File Structure (Final)

```
docs/admin-panel/
├── DESIGN_DECISIONS.md          # Architecture decisions
├── ADMIN_PANEL_TRACKER.md       # This file
├── ADMIN_API_SCHEMA.yaml        # OpenAPI 3.0 spec (source of truth)
└── ADMIN_TYPES.ts               # Generated TypeScript types

backend/app/admin/
├── __init__.py
├── router.py                    # All admin endpoints
├── schemas.py                   # Pydantic models (match ADMIN_TYPES.ts)
├── dependencies.py              # Admin auth middleware
└── services/
    ├── __init__.py
    ├── users.py                 # User CRUD operations
    ├── jobs.py                  # Job management
    ├── payments.py              # Stripe integration
    └── promos.py                # Promo code management

frontend/app/admin555/
├── layout.tsx                   # Password gate + sidebar + breadcrumbs
├── page.tsx                     # Dashboard
├── users/page.tsx               # User management
├── jobs/page.tsx                # Job management
├── payments/page.tsx            # Payment analytics
└── promos/page.tsx              # Promo codes

frontend/components/admin/
├── AdminSidebar.tsx             # Navigation + failed jobs badge
├── Breadcrumbs.tsx              # Navigation breadcrumbs
├── DataTable.tsx                # Reusable table component
├── StatsCard.tsx                # KPI card
├── SlidePanel.tsx               # Side panel for details
├── ConfirmDialog.tsx            # Confirmation modal
├── EmptyState.tsx               # Empty state placeholder
├── PasswordPrompt.tsx           # Password entry form
├── AdminErrorBoundary.tsx       # Error boundary wrapper
└── AdminToastProvider.tsx       # Sonner toast setup
```

---

## Dependencies

### Backend
- No new dependencies (uses existing FastAPI, Firestore, Stripe)

### Frontend
- `sonner` - Toast notifications (shadcn/ui compatible)
- No other new dependencies

---

## Environment Variables

Add to Cloud Run and local `.env`:

```bash
ADMIN_PASSWORD=your_secure_password_here
```

Document in `CREDENTIALS_INVENTORY.md`.

---

## Testing Checklist ✅

Verified on December 14, 2025:

- [x] Password protection works
- [x] Sidebar badge shows failed jobs count
- [x] Breadcrumbs update on navigation
- [x] Toast notifications work for all actions
- [x] Error boundaries catch component errors
- [x] Can search users
- [x] Can view user details
- [x] Can add credits (with confirmation)
- [x] Can filter jobs by status
- [x] Can retry failed jobs
- [x] Payment stats load correctly
- [x] Can create promo codes
- [x] Can delete promo codes
- [x] Dashboard stats are accurate
- [x] All pages handle loading states
- [x] All pages handle errors gracefully
- [x] All pages handle empty states

---

## Future Enhancements (Post V1)

| Feature | Priority | Effort |
|---------|----------|--------|
| Charts for revenue/growth trends | Medium | 2h |
| Promo codes with discount % | Low | 1h |
| Audit log for admin actions | Low | 2h |
| Export users/jobs to CSV | Low | 1h |
| Email user directly | Low | 0.5h |
| Multi-admin with roles | Low | 3h |
| Keyboard shortcuts (Cmd+K) | Low | 1h |
| Activity feed on dashboard | Low | 1.5h |

---

## Notes

- Credit adjustment max: 2000 credits
- Job retry: Uses already-charged credits (no re-charge)
- Search: Server-side prefix search (Firestore range query)
- Pagination: 25 items per page
- Password: Stored in localStorage (persists across sessions)
- Toasts: sonner library for all user feedback
- Error boundaries: Per-section to prevent full page crashes
- Breadcrumbs: Auto-generated from route structure
