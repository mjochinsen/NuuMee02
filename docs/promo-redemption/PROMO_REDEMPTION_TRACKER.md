# Promo Code Redemption - Implementation Tracker

**Created:** 2025-12-14
**Design Doc:** [DESIGN_DECISIONS.md](./DESIGN_DECISIONS.md)
**Location:** `/billing` page
**Estimated Total:** 2-2.5 hours

---

## Overview

| Phase | Description | Status | Tasks |
|-------|-------------|--------|-------|
| 1 | Backend API | 🟥 Not Started | 4 |
| 2 | Frontend UI | 🟥 Not Started | 4 |
| 3 | Integration & Deploy | 🟥 Not Started | 3 |

**Legend:** 🟥 Not Started | 🟨 In Progress | 🟩 Complete

---

## Phase 1: Backend API (1 hour)

| ID | Task | Status | Notes |
|----|------|--------|-------|
| 1.1 | Create `backend/app/promo/` module structure | 🟥 | __init__, router, schemas, service |
| 1.2 | Implement Pydantic schemas | 🟥 | RedeemRequest, RedeemResponse |
| 1.3 | Implement redemption service with transaction | 🟥 | Atomic Firestore update |
| 1.4 | Register router in main.py | 🟥 | /api/v1/promo prefix |

### Acceptance Criteria
- [ ] POST /api/v1/promo/redeem accepts code and returns credits_added
- [ ] Validates all 6 rules (auth, exists, active, not expired, uses left, not redeemed)
- [ ] Uses Firestore transaction for atomic updates
- [ ] Returns generic error for all failure cases

---

## Phase 2: Frontend UI (45 min)

| ID | Task | Status | Notes |
|----|------|--------|-------|
| 2.1 | Add `redeemPromo()` to api.ts | 🟥 | POST to /promo/redeem |
| 2.2 | Create PromoRedemption component | 🟥 | Input + button + inline messages |
| 2.3 | Add to billing page | 🟥 | Below subscription section |
| 2.4 | Handle loading/success/error states | 🟥 | Inline feedback |

### Acceptance Criteria
- [ ] Input field with "Redeem" button
- [ ] Button disabled when input empty or loading
- [ ] Success: Shows green message with credits added
- [ ] Error: Shows red message "Invalid or expired promo code"
- [ ] Clears input on success
- [ ] Updates credit balance display

---

## Phase 3: Integration & Deploy (30 min)

| ID | Task | Status | Notes |
|----|------|--------|-------|
| 3.1 | TypeScript type check | 🟥 | pnpm tsc --noEmit |
| 3.2 | Deploy backend | 🟥 | gcloud run deploy |
| 3.3 | Deploy frontend | 🟥 | firebase deploy |

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
