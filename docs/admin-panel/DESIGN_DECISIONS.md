# Admin Panel - Design Decisions

**Document Created:** 2025-12-14
**Status:** Pre-Implementation Planning Complete
**Location:** `/admin555/*`

---

## Executive Summary

This document captures all design decisions made during the Admin Panel planning discussion. These decisions are final and should be followed during implementation.

---

## 1. Architecture Decisions

### Route Structure
**Decision:** Direct `/admin555/` route (not route group)
```
frontend/app/admin555/
├── layout.tsx          # Password gate + sidebar
├── page.tsx            # Dashboard
├── users/page.tsx      # User management
├── jobs/page.tsx       # Job management
├── payments/page.tsx   # Payment analytics
└── promos/page.tsx     # Promo codes
```
**Rationale:** Simpler structure, matches original spec, no over-engineering

### Authentication
**Decision:** Simple shared password protection
- Environment variable: `ADMIN_PASSWORD`
- Storage: `localStorage` (persists across tabs/sessions)
- Single admin: Owner only (no multi-admin support needed)
- No user-level `is_admin` field for V1

**Rationale:** One-person business, simplicity over complexity

### Mobile Support
**Decision:** Desktop-only
- No responsive design required
- If opened on mobile, may be cumbersome but functional
- No mobile-specific layouts or components

---

## 2. Feature Scope

### Pages Included (5 total)

| Page | Route | Purpose |
|------|-------|---------|
| Dashboard | `/admin555` | KPI overview (users, revenue, jobs) |
| Users | `/admin555/users` | Search, view details, add credits |
| Jobs | `/admin555/jobs` | Filter by status, view errors, retry failed |
| Payments | `/admin555/payments` | Revenue stats, recent transactions |
| Promo Codes | `/admin555/promos` | Create/manage credit promo codes |

### Features Explicitly Excluded for V1

| Feature | Reason | Future? |
|---------|--------|---------|
| System Health page | Can check Cloud Run console directly | Maybe |
| Charts/graphs | Adds complexity, numbers sufficient for V1 | Yes |
| Audit log | Single admin, not needed | If multi-admin |
| Multiple admin roles | Single admin | If needed |
| Mobile responsive | Desktop-only requirement | No |
| GCP cost widget | Check GCP console directly | No |
| WaveSpeed health check | No public endpoint | No |
| Bulk credit adjustment | Rare need | Maybe |
| Export to CSV | Nice-to-have | Yes |
| Email user directly | Low priority | Maybe |
| Promo discount percentages | Credits-only for V1 | Yes |

---

## 3. Promo Codes

### Behavior
- **Type:** Credits only (no discounts for V1)
- **Format:** Custom strings allowed (e.g., `WELCOME50`, `LAUNCH100`)
- **Discount feature:** Added to TASK_TRACKER.md as future enhancement

### Data Model
```typescript
// Firestore: promo_codes/{codeId}
{
  code: string,             // "WELCOME50" (unique, uppercase)
  credits: number,          // Credits to give
  max_uses: number | null,  // null = unlimited
  current_uses: number,     // Track redemptions
  expires_at: timestamp | null,
  active: boolean,
  created_at: timestamp,
}
```

---

## 4. Credit Adjustment

### Rules
- **Maximum per adjustment:** 2,000 credits ($200 equivalent)
- **Negative adjustments:** Allowed (for corrections)
- **Confirmation required:** Yes, with amount and user email shown
- **Transaction logging:** Via existing `credit_transactions` collection

### UI Flow
1. Click "Adjust Credits" on user row
2. Modal opens with:
   - Current balance shown
   - Input field for adjustment (+/-)
   - Reason field (optional but encouraged)
3. Confirmation dialog: "Add 100 credits to user@email.com?"
4. On confirm: API call, refresh user data

---

## 5. Job Retry

### Behavior
- **Credits:** Use already-charged credits (no re-charge)
- **Rationale:** User already paid; system failure shouldn't cost them twice
- **Eligible jobs:** Only `status: failed` jobs
- **Action:** Reset status to `pending`, enqueue to Cloud Tasks

---

## 6. User Search

### Capabilities
- Search by: Email, display name, user_id
- Type: Server-side prefix search (Firestore range query)
- Pagination: 25 users per page
- Filters in URL: `?search=john&page=2` (persists on refresh)

---

## 7. Backend API Endpoints

```
GET  /api/v1/admin/stats              # Dashboard KPIs
GET  /api/v1/admin/users              # List with search/pagination
GET  /api/v1/admin/users/{uid}        # User detail + jobs + transactions
POST /api/v1/admin/users/{uid}/credits # Add/deduct credits (max 2000)
GET  /api/v1/admin/jobs               # List with status filter
POST /api/v1/admin/jobs/{id}/retry    # Retry failed job
GET  /api/v1/admin/payments           # Revenue + recent transactions
GET  /api/v1/admin/promos             # List promo codes
POST /api/v1/admin/promos             # Create promo code
DELETE /api/v1/admin/promos/{id}      # Delete/deactivate promo code
```

### Authentication
- All endpoints require valid admin password
- Password sent via `X-Admin-Password` header
- Backend validates against `ADMIN_PASSWORD` env var

---

## 8. Component Architecture

### Reusable Components
```
frontend/components/admin/
├── AdminLayout.tsx       # Password gate + sidebar wrapper
├── AdminSidebar.tsx      # Navigation links
├── DataTable.tsx         # Generic table (pagination, search, sort)
├── StatsCard.tsx         # KPI display card
├── SlidePanel.tsx        # Side panel for details
├── ConfirmDialog.tsx     # Confirmation modal
└── EmptyState.tsx        # "No data" placeholder
```

### Page Components
```
frontend/components/admin/pages/
├── dashboard/
│   └── QuickStats.tsx
├── users/
│   ├── UserRow.tsx
│   ├── UserDetailPanel.tsx
│   └── CreditAdjustModal.tsx
├── jobs/
│   ├── JobRow.tsx
│   └── JobDetailModal.tsx
├── payments/
│   ├── RevenueStats.tsx
│   └── TransactionList.tsx
└── promos/
    ├── PromoRow.tsx
    └── CreatePromoModal.tsx
```

---

## 9. Edge Cases Handled

| Scenario | Handling |
|----------|----------|
| User has 0 jobs | Show "No jobs yet" empty state |
| User deleted account | Show `[DELETED]` badge |
| Job has no error message | Show "Unknown error" |
| No Stripe customer | Show "No payment history" |
| Negative credit adjustment | Allow with red styling + confirmation |
| Empty admin password | Require minimum 8 characters |
| Search with no results | Show "No users found" empty state |

---

## 10. Security Considerations

| Risk | Mitigation |
|------|------------|
| Password in network | HTTPS only, POST body not URL |
| Session hijacking | localStorage with password hash comparison |
| Accidental large credit add | Max 2000 limit + confirmation dialog |
| Unauthorized access | Password required on every page load |

---

## 11. Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend Framework | Next.js 14 (App Router) |
| UI Components | shadcn/ui (existing) |
| Styling | Tailwind CSS |
| State Management | React useState/useEffect |
| Data Fetching | fetch API |
| Backend | FastAPI (Python) |
| Database | Firestore |
| Payments Data | Stripe API + Firestore cache |

---

## 12. Future Enhancements (Post V1)

Tracked in TASK_TRACKER.md:
- [ ] Charts for revenue/user growth over time
- [ ] Promo codes with discount percentages
- [ ] Audit log for admin actions
- [ ] Export users/jobs to CSV
- [ ] Email user directly from admin
- [ ] System health dashboard
- [ ] Multi-admin support with roles

---

## Approval

This document was discussed and approved on 2025-12-14.
All decisions are final for V1 implementation.
