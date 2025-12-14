# Promo Code Redemption - Implementation Tracker

**Created:** 2025-12-14
**Design Doc:** [DESIGN_DECISIONS.md](./DESIGN_DECISIONS.md)
**Location:** `/billing` page
**Estimated Total:** 2-2.5 hours

---

## Overview

| Phase | Description | Status | Tasks |
|-------|-------------|--------|-------|
| 1 | Backend API | 🟩 Complete | 4 |
| 2 | Frontend UI | 🟩 Complete | 4 |
| 3 | Integration & Deploy | 🟩 Complete | 3 |

**Legend:** 🟥 Not Started | 🟨 In Progress | 🟩 Complete

---

## Phase 1: Backend API (1 hour)

| ID | Task | Status | Notes |
|----|------|--------|-------|
| 1.1 | Create `backend/app/promo/` module structure | 🟩 | __init__, router, schemas, service |
| 1.2 | Implement Pydantic schemas | 🟩 | RedeemRequest, RedeemResponse |
| 1.3 | Implement redemption service with transaction | 🟩 | Atomic Firestore update |
| 1.4 | Register router in main.py | 🟩 | /api/v1/promo prefix |

### Acceptance Criteria
- [x] POST /api/v1/promo/redeem accepts code and returns credits_added
- [x] Validates all 6 rules (auth, exists, active, not expired, uses left, not redeemed)
- [x] Uses Firestore transaction for atomic updates
- [x] Returns generic error for all failure cases

---

## Phase 2: Frontend UI (45 min)

| ID | Task | Status | Notes |
|----|------|--------|-------|
| 2.1 | Add `redeemPromo()` to api.ts | 🟩 | POST to /promo/redeem |
| 2.2 | Create PromoRedemption component | 🟩 | Input + button + inline messages |
| 2.3 | Add to billing page | 🟩 | Below BalanceCard |
| 2.4 | Handle loading/success/error states | 🟩 | Inline feedback |

### Acceptance Criteria
- [x] Input field with "Redeem" button
- [x] Button disabled when input empty or loading
- [x] Success: Shows green message with credits added
- [x] Error: Shows red message with error
- [x] Clears input on success
- [x] Updates credit balance display (refreshProfile)

---

## Phase 3: Integration & Deploy (30 min)

| ID | Task | Status | Notes |
|----|------|--------|-------|
| 3.1 | TypeScript type check | 🟩 | pnpm tsc --noEmit |
| 3.2 | Deploy backend | 🟩 | nuumee-api-00137-skd |
| 3.3 | Deploy frontend | 🟩 | wanapi-prod.web.app |

### Acceptance Criteria
- [ ] Can redeem test promo code on production
- [ ] Credits update immediately
- [ ] Error handling works

---

## Testing Checklist

- [ ] Valid code adds credits
- [ ] Invalid code shows error
- [ ] Expired code shows error
- [ ] Already redeemed code shows error
- [ ] Max uses reached shows error
- [ ] Credits balance updates after success
- [ ] Input clears on success
- [ ] Cannot redeem same code twice

---

## Files to Create

```
backend/app/promo/
├── __init__.py
├── router.py
├── schemas.py
└── service.py

frontend/ (modifications)
├── lib/api.ts          (add redeemPromo)
└── app/billing/page.tsx (add PromoRedemption)
```

---

## Notes

- No rate limiting in v1 (defer until needed)
- No signup integration in v1 (billing page only)
- Generic error messages for security
- Firestore transaction for atomicity
