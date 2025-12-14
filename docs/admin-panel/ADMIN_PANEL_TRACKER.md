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
| 0 | Schema & Types | 🟥 Not Started | 2 |
| 1 | Foundation & Layout | 🟥 Not Started | 12 |
| 2 | Users Page | 🟥 Not Started | 10 |
| 3 | Jobs Page | 🟥 Not Started | 8 |
| 4 | Payments Page | 🟥 Not Started | 6 |
| 5 | Promo Codes Page | 🟥 Not Started | 7 |
| 6 | Dashboard Page | 🟥 Not Started | 5 |
| 7 | Polish & Deploy | 🟥 Not Started | 6 |

**Legend:** 🟥 Not Started | 🟨 In Progress | 🟩 Complete

---

## Phase 0: Schema & Types (30 min)

| ID | Task | Status | Notes |
|----|------|--------|-------|
| 0.1 | Create `ADMIN_API_SCHEMA.yaml` | 🟥 | OpenAPI 3.0 spec for all 10 endpoints |
| 0.2 | Generate `ADMIN_TYPES.ts` | 🟥 | TypeScript types from schema |

### Acceptance Criteria
- [ ] Schema defines all request/response types
- [ ] TypeScript types match Pydantic models
- [ ] Both backend and frontend reference same contract

---

## Phase 1: Foundation & Layout (2 hours)

### Backend Setup

| ID | Task | Status | Notes |
|----|------|--------|-------|
| 1.1 | Create `backend/app/admin/` directory structure | 🟥 | router.py, schemas.py, dependencies.py |
| 1.2 | Implement admin password middleware | 🟥 | Check `X-Admin-Password` header |
| 1.3 | Add `ADMIN_PASSWORD` to environment variables | 🟥 | Update CREDENTIALS_INVENTORY.md |
| 1.4 | Create basic `/api/v1/admin/health` endpoint | 🟥 | Verify auth works |

### Frontend Setup

| ID | Task | Status | Notes |
|----|------|--------|-------|
| 1.5 | Create `frontend/app/admin555/layout.tsx` | 🟥 | Password gate + sidebar + breadcrumbs |
| 1.6 | Create `AdminSidebar.tsx` with failed jobs badge | 🟥 | Navigation + red badge for failed count |
| 1.7 | Create `PasswordPrompt.tsx` | 🟥 | Input + localStorage storage |
| 1.8 | Create `frontend/app/admin555/page.tsx` placeholder | 🟥 | Basic "Admin Dashboard" text |
| 1.9 | Setup toast notifications (sonner) | 🟥 | Global toast provider |
| 1.10 | Create `AdminErrorBoundary.tsx` | 🟥 | Per-section error boundaries |
| 1.11 | Create `Breadcrumbs.tsx` component | 🟥 | Admin > Users > john@example.com |
| 1.12 | Create admin API client with error handling | 🟥 | Centralized fetch with auth header |

### Acceptance Criteria
- [ ] Visiting `/admin555` prompts for password
- [ ] Correct password grants access, stored in localStorage
- [ ] Sidebar shows navigation to all 5 pages
- [ ] Sidebar shows badge with failed jobs count
- [ ] Breadcrumbs show current location
- [ ] Toast notifications work for success/error
- [ ] Error boundaries prevent full page crashes
- [ ] Incorrect password shows error message

---

## Phase 2: Users Page (2 hours)

### Backend

| ID | Task | Status | Notes |
|----|------|--------|-------|
| 2.1 | Create `GET /api/v1/admin/users` endpoint | 🟥 | Pagination, search by email/name/uid |
| 2.2 | Create `GET /api/v1/admin/users/{uid}` endpoint | 🟥 | User detail + recent jobs + transactions |
| 2.3 | Create `POST /api/v1/admin/users/{uid}/credits` | 🟥 | Add/deduct credits, max 2000 |
| 2.4 | Add Firestore query for prefix search | 🟥 | Support partial email/name match |

### Frontend

| ID | Task | Status | Notes |
|----|------|--------|-------|
| 2.5 | Create reusable `DataTable.tsx` component | 🟥 | Pagination, search input, column headers |
| 2.6 | Create `frontend/app/admin555/users/page.tsx` | 🟥 | User list with search |
| 2.7 | Create `UserRow.tsx` component | 🟥 | Email, tier, credits, actions |
| 2.8 | Create `SlidePanel.tsx` for user details | 🟥 | Show jobs, transactions, metadata |
| 2.9 | Create `CreditAdjustModal.tsx` | 🟥 | Amount input, reason, confirmation |
| 2.10 | Persist search/page in URL params | 🟥 | `?search=john&page=2` |

### Acceptance Criteria
- [ ] Can search users by email, name, or user_id
- [ ] Clicking user row opens detail panel
- [ ] Can add/deduct credits with confirmation
- [ ] Credit adjustment limited to 2000 max
- [ ] Pagination works (25 per page)
- [ ] Filters persist on page refresh
- [ ] Toast shows on credit adjustment success/failure

---

## Phase 3: Jobs Page (1.5 hours)

### Backend

| ID | Task | Status | Notes |
|----|------|--------|-------|
| 3.1 | Create `GET /api/v1/admin/jobs` endpoint | 🟥 | Filter by status, pagination |
| 3.2 | Create `POST /api/v1/admin/jobs/{id}/retry` | 🟥 | Reset to pending, enqueue task |
| 3.3 | Add job detail lookup with error info | 🟥 | Include full error_message |

### Frontend

| ID | Task | Status | Notes |
|----|------|--------|-------|
| 3.4 | Create `frontend/app/admin555/jobs/page.tsx` | 🟥 | Jobs list with status filter |
| 3.5 | Create `JobRow.tsx` component | 🟥 | Status badge, user, type, actions |
| 3.6 | Create status filter dropdown | 🟥 | All, Pending, Processing, Completed, Failed |
| 3.7 | Create `JobDetailModal.tsx` | 🟥 | Show full error, input/output paths |
| 3.8 | Implement retry button for failed jobs | 🟥 | Confirmation before retry |

### Acceptance Criteria
- [ ] Can filter jobs by status
- [ ] Failed jobs show error message
- [ ] Can retry failed jobs (resets to pending)
- [ ] Job detail shows all metadata
- [ ] Pagination works
- [ ] Toast shows on retry success/failure

---

## Phase 4: Payments Page (1.5 hours)

### Backend

| ID | Task | Status | Notes |
|----|------|--------|-------|
| 4.1 | Create `GET /api/v1/admin/payments` endpoint | 🟥 | Aggregate stats + recent transactions |
| 4.2 | Integrate Stripe API for revenue data | 🟥 | MRR, total revenue, subscriber count |
| 4.3 | Cache Stripe data (5 min TTL) | 🟥 | Avoid rate limits |

### Frontend

| ID | Task | Status | Notes |
|----|------|--------|-------|
| 4.4 | Create `frontend/app/admin555/payments/page.tsx` | 🟥 | Stats cards + transaction list |
| 4.5 | Create `StatsCard.tsx` component | 🟥 | Reusable KPI card |
| 4.6 | Create transaction list with basic info | 🟥 | Amount, user, date, type |

### Acceptance Criteria
- [ ] Shows MRR, total revenue, subscriber count
- [ ] Shows recent credit purchases
- [ ] Shows recent subscription events
- [ ] Data refreshes on page load

---

## Phase 5: Promo Codes Page (1 hour)

### Backend

| ID | Task | Status | Notes |
|----|------|--------|-------|
| 5.1 | Create Firestore `promo_codes` collection | 🟥 | Schema per DESIGN_DECISIONS.md |
| 5.2 | Create `GET /api/v1/admin/promos` endpoint | 🟥 | List all promo codes |
| 5.3 | Create `POST /api/v1/admin/promos` endpoint | 🟥 | Create new promo code |
| 5.4 | Create `DELETE /api/v1/admin/promos/{id}` | 🟥 | Deactivate promo code |

### Frontend

| ID | Task | Status | Notes |
|----|------|--------|-------|
| 5.5 | Create `frontend/app/admin555/promos/page.tsx` | 🟥 | Promo list + create button |
| 5.6 | Create `CreatePromoModal.tsx` | 🟥 | Code, credits, max uses, expiry |
| 5.7 | Create `PromoRow.tsx` component | 🟥 | Code, credits, uses, status, delete |

### Acceptance Criteria
- [ ] Can create promo code with custom name
- [ ] Can set credits amount, max uses, expiry date
- [ ] Can deactivate/delete promo codes
- [ ] Shows usage count for each code
- [ ] Toast shows on create/delete success/failure

---

## Phase 6: Dashboard Page (1 hour)

### Backend

| ID | Task | Status | Notes |
|----|------|--------|-------|
| 6.1 | Create `GET /api/v1/admin/stats` endpoint | 🟥 | Aggregate KPIs |

### Frontend

| ID | Task | Status | Notes |
|----|------|--------|-------|
| 6.2 | Update `frontend/app/admin555/page.tsx` | 🟥 | Full dashboard with stats |
| 6.3 | Display: Total users, new today | 🟥 | From Firestore count |
| 6.4 | Display: Jobs today, failed jobs | 🟥 | From Firestore query |
| 6.5 | Display: Revenue this month | 🟥 | From payments endpoint |

### Acceptance Criteria
- [ ] Dashboard shows key metrics at a glance
- [ ] Numbers update on page refresh
- [ ] Links to relevant pages (e.g., "12 failed jobs" links to jobs?status=failed)

---

## Phase 7: Polish & Deploy (1 hour)

| ID | Task | Status | Notes |
|----|------|--------|-------|
| 7.1 | Add loading states to all pages | 🟥 | Skeleton loaders |
| 7.2 | Verify all toasts work correctly | 🟥 | Success/error for all actions |
| 7.3 | Add empty states | 🟥 | "No users found" etc. |
| 7.4 | TypeScript type check | 🟥 | `pnpm tsc --noEmit` |
| 7.5 | Deploy backend | 🟥 | `/deploy backend` |
| 7.6 | Deploy frontend | 🟥 | `/deploy frontend` |

### Acceptance Criteria
- [ ] All pages load without errors
- [ ] All features work end-to-end
- [ ] TypeScript passes
- [ ] Deployed and accessible at nuumee.ai/admin555

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

## Testing Checklist

Before deployment:

- [ ] Password protection works
- [ ] Sidebar badge shows failed jobs count
- [ ] Breadcrumbs update on navigation
- [ ] Toast notifications work for all actions
- [ ] Error boundaries catch component errors
- [ ] Can search users
- [ ] Can view user details
- [ ] Can add credits (with confirmation)
- [ ] Can filter jobs by status
- [ ] Can retry failed jobs
- [ ] Payment stats load correctly
- [ ] Can create promo codes
- [ ] Can delete promo codes
- [ ] Dashboard stats are accurate
- [ ] All pages handle loading states
- [ ] All pages handle errors gracefully
- [ ] All pages handle empty states

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
