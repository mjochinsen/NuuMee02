# Refactoring Plan: Billing Page & Subscriptions Router

## Overview

This document outlines a plan to refactor two large files:
- **Frontend**: `billing/page.tsx` (~1,421 LOC)
- **Backend**: `subscriptions/router.py` (~958 LOC)

Goal: Split into smaller, maintainable modules without breaking functionality.

---

## Phase 1: Backend - Subscriptions Router Refactoring

### Current State Analysis

**File**: `backend/app/subscriptions/router.py` (958 LOC)

**Endpoints**:
1. `GET /tiers` - List subscription tiers (public)
2. `POST /create` - Create subscription checkout
3. `GET /current` - Get current subscription
4. `POST /upgrade` - Upgrade/downgrade subscription
5. `POST /cancel` - Cancel subscription
6. `POST /switch-billing-period` - Switch monthly/annual
7. `POST /sync-from-stripe` - Sync subscription from Stripe
8. `POST /sync-billing-period` - Sync billing period only
9. `POST /customer-portal` - Create Stripe customer portal session

### Proposed Structure

```
backend/app/subscriptions/
├── __init__.py
├── router.py          # Main router (slim, ~150 LOC)
├── models.py          # Already exists (keep as-is)
├── services/
│   ├── __init__.py
│   ├── stripe_service.py      # Stripe API interactions (~200 LOC)
│   ├── subscription_service.py # Business logic (~250 LOC)
│   └── sync_service.py        # Sync operations (~150 LOC)
└── utils.py           # Helper functions (~50 LOC)
```

### Refactoring Steps

1. **Create `services/stripe_service.py`**
   - Move: `_ensure_stripe_key()`, Stripe session creation, portal creation
   - Functions: `create_checkout_session()`, `create_portal_session()`, `get_subscription()`, `modify_subscription()`, `cancel_subscription()`

2. **Create `services/subscription_service.py`**
   - Move: Business logic for create, upgrade, downgrade, cancel
   - Functions: `process_subscription_create()`, `process_upgrade()`, `process_cancel()`, `calculate_proration()`

3. **Create `services/sync_service.py`**
   - Move: Sync logic from `/sync-from-stripe` and `/sync-billing-period`
   - Functions: `sync_subscription_from_stripe()`, `sync_billing_period()`

4. **Create `utils.py`**
   - Move: `generate_subscription_id()`, helper functions
   - Add: Firestore transaction helpers

5. **Update `router.py`**
   - Keep only route handlers
   - Import and call service functions
   - Target: <150 LOC

### Migration Strategy (Safe)

- Create new files alongside existing code
- Add integration tests before refactoring
- Use feature flag to switch between old/new
- Deploy incrementally

---

## Phase 2: Frontend - Billing Page Refactoring

### Current State Analysis

**File**: `frontend/app/(dashboard)/billing/page.tsx` (1,421 LOC)

**Components/Sections**:
1. Balance & Plan Cards (header section)
2. Buy Credits Section (credit packages grid)
3. Subscription Plans Section (plan cards + toggle)
4. Special Offers Section (billing status, founding member)
5. Auto-Refill Section
6. Payment Methods Section
7. Transaction History Section
8. Modals (Purchase, Upgrade, Add Card - legacy)
9. BuyCreditsModal, SubscriptionModal (existing components)

### Proposed Structure

```
frontend/app/(dashboard)/billing/
├── page.tsx                    # Main page (~150 LOC)
├── components/
│   ├── BalanceCard.tsx         # Current balance display
│   ├── ActivePlanCard.tsx      # Active plan display
│   ├── BuyCreditsSection.tsx   # Credit packages grid
│   ├── SubscriptionPlansSection.tsx  # Plans + toggle
│   ├── SpecialOffersSection.tsx      # Status + founding
│   ├── AutoRefillSection.tsx   # Auto-refill settings
│   ├── PaymentMethodsSection.tsx     # Payment methods
│   ├── TransactionHistorySection.tsx # Transaction table
│   └── index.ts                # Barrel export
├── hooks/
│   ├── useTransactions.ts      # Transaction fetching
│   ├── usePaymentMethods.ts    # Payment methods fetching
│   ├── useAutoRefill.ts        # Auto-refill settings
│   └── useBillingSync.ts       # Billing period sync
└── types.ts                    # Shared types
```

### Refactoring Steps

1. **Extract hooks first** (minimal risk)
   - `useTransactions` - transaction fetching logic
   - `usePaymentMethods` - payment method fetching
   - `useAutoRefill` - auto-refill settings
   - `useBillingSync` - billing period sync

2. **Extract small components** (isolated sections)
   - `BalanceCard` - standalone, no dependencies
   - `ActivePlanCard` - standalone
   - `AutoRefillSection` - uses `useAutoRefill` hook

3. **Extract complex components**
   - `TransactionHistorySection` - uses `useTransactions`
   - `PaymentMethodsSection` - uses `usePaymentMethods`
   - `SubscriptionPlansSection` - complex, has toggle

4. **Update main page**
   - Import and compose components
   - Pass down necessary props/callbacks
   - Target: <200 LOC

### Component Communication

```
BillingPage (state owner)
├── BalanceCard (credits, onBuyCredits)
├── ActivePlanCard (plan, onUpgrade, onCancel)
├── BuyCreditsSection (packages, onSelect)
├── SubscriptionPlansSection (plans, billingCycle, onSelect)
├── SpecialOffersSection (currentPlan, isAnnual)
├── AutoRefillSection (settings, onSave)
├── PaymentMethodsSection (methods, onManage)
└── TransactionHistorySection (transactions, page, onPageChange)
```

---

## Phase 3: GitHub Setup for Safe Refactoring

### Branch Strategy

```
master (protected)
  └── refactor/billing-backend
  └── refactor/billing-frontend
```

### Steps

1. **Create feature branches**
   ```bash
   git checkout -b refactor/billing-backend
   git checkout -b refactor/billing-frontend
   ```

2. **Add tests before refactoring**
   - Backend: pytest integration tests for each endpoint
   - Frontend: E2E tests for billing page flows

3. **Implement changes on feature branches**

4. **Create PRs with detailed descriptions**
   - List all changes
   - Include before/after line counts
   - Add testing instructions

5. **Review and merge**

### Rollback Strategy

- Each refactor is in a separate branch
- Can revert any PR if issues found
- Old code preserved until verified

---

## Orchestration with Agents

### Backend Refactor (api-builder agent)

```yaml
Objective: Refactor subscriptions router into services
Output:
  - backend/app/subscriptions/services/stripe_service.py
  - backend/app/subscriptions/services/subscription_service.py
  - backend/app/subscriptions/services/sync_service.py
  - backend/app/subscriptions/utils.py
  - Updated router.py
Tools: Read, Write, Edit
Sources:
  - backend/app/subscriptions/router.py
  - backend/app/subscriptions/models.py
Boundaries:
  - Do not change endpoint signatures
  - Do not modify models.py
  - Preserve all logging
  - Keep rate limiting in router
```

### Frontend Refactor (frontend-dev agent)

```yaml
Objective: Extract billing page components and hooks
Output:
  - frontend/app/(dashboard)/billing/components/*.tsx
  - frontend/app/(dashboard)/billing/hooks/*.ts
  - Updated page.tsx
Tools: Read, Write, Edit
Sources:
  - frontend/app/(dashboard)/billing/page.tsx
  - frontend/components/SubscriptionModal.tsx
  - frontend/components/BuyCreditsModal.tsx
Boundaries:
  - Do not change visual appearance
  - Preserve all functionality
  - Use TypeScript strict mode
  - Use Tailwind only
```

---

## Success Criteria

### Backend
- [ ] Each file < 300 LOC
- [ ] All endpoints work identically
- [ ] Tests pass
- [ ] No new TypeScript errors (via pytest)

### Frontend
- [ ] Main page < 200 LOC
- [ ] Each component < 200 LOC
- [ ] All functionality preserved
- [ ] Type-check passes
- [ ] Build succeeds
- [ ] Visual appearance unchanged

---

## Timeline

| Phase | Task | Effort |
|-------|------|--------|
| 1.1 | Add backend integration tests | 2-3 hours |
| 1.2 | Create backend services | 3-4 hours |
| 1.3 | Update router, test, PR | 1-2 hours |
| 2.1 | Extract frontend hooks | 1-2 hours |
| 2.2 | Extract small components | 2-3 hours |
| 2.3 | Extract complex components | 3-4 hours |
| 2.4 | Update page, test, PR | 1-2 hours |
| 3 | Final testing & deploy | 1-2 hours |

**Total**: ~15-22 hours of development

---

## Risk Mitigation

1. **Feature branches** - All work on separate branches
2. **Tests first** - Write tests before refactoring
3. **Incremental PRs** - Small, reviewable changes
4. **Rollback plan** - Can revert any PR instantly
5. **Monitoring** - Check error rates after deploy

---

Created: 2025-12-03
Status: READY FOR IMPLEMENTATION
