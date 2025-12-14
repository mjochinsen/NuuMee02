# Promo Code Redemption - Design Decisions

**Created:** 2025-12-14
**Status:** Approved
**Location:** `/billing` page (existing)

---

## Overview

Allow authenticated users to redeem promo codes for free credits.

---

## Decisions Made

### 1. Redemption Location
**Decision:** Billing page only (MVP)
**Rationale:** Simplest implementation, one location, users are already thinking about credits here.
**Future:** Can add signup integration post-launch if needed.

### 2. Data Model
**Decision:** Array on promo document (`redeemed_by: [uid1, uid2, ...]`)
**Rationale:** Simple, prevents duplicate redemptions, won't hit array limits for promo codes.

### 3. Rate Limiting
**Decision:** Defer to v2
**Rationale:** Promo codes already have max_uses and expiration. Add rate limiting only if abuse detected.

### 4. Code Format
**Decision:** No additional enforcement
**Rationale:** Admin panel already handles code creation. Backend converts to uppercase for matching.

### 5. Success Feedback
**Decision:** Inline message (not toast)
**Rationale:** User is focused on that section, inline feedback is more contextual.

### 6. Error Messages
**Decision:** Generic errors for security
**Rationale:** Don't reveal if code exists vs expired vs invalid. Single message: "Invalid or expired code"

---

## API Contract

### Endpoint
`POST /api/v1/promo/redeem`

### Request
```json
{
  "code": "SUMMER2025"
}
```

### Response (Success - 200)
```json
{
  "success": true,
  "credits_added": 100,
  "new_balance": 535,
  "message": "Added 100 credits to your account!"
}
```

### Response (Error - 400)
```json
{
  "detail": "Invalid or expired promo code"
}
```

---

## Validation Rules (Backend)

1. User is authenticated (Firebase ID token)
2. Code exists in `promo_codes` collection
3. Code is active (`active === true`)
4. Code not expired (`expires_at === null OR expires_at > now`)
5. Code has remaining uses (`max_uses === null OR current_uses < max_uses`)
6. User hasn't redeemed (`uid NOT IN redeemed_by`)

---

## Firestore Operations (Atomic Transaction)

```python
# In transaction:
1. Read promo_codes/{code}
2. Validate all rules
3. Update promo: increment current_uses, append uid to redeemed_by
4. Update user: increment credits
5. Return new balance
```

---

## UI Design

**Location:** `/billing` page, below subscription info

```
┌─────────────────────────────────────────┐
│  🎁 Have a promo code?                  │
│  ┌──────────────────────┐  ┌─────────┐  │
│  │ Enter code           │  │ Redeem  │  │
│  └──────────────────────┘  └─────────┘  │
└─────────────────────────────────────────┘

Success state:
┌─────────────────────────────────────────┐
│  🎁 Have a promo code?                  │
│  ✅ Added 100 credits to your account!  │
│  ┌──────────────────────┐  ┌─────────┐  │
│  │                      │  │ Redeem  │  │
│  └──────────────────────┘  └─────────┘  │
└─────────────────────────────────────────┘

Error state:
┌─────────────────────────────────────────┐
│  🎁 Have a promo code?                  │
│  ❌ Invalid or expired promo code       │
│  ┌──────────────────────┐  ┌─────────┐  │
│  │ BADCODE              │  │ Redeem  │  │
│  └──────────────────────┘  └─────────┘  │
└─────────────────────────────────────────┘
```

---

## Edge Cases Handled

| Case | Handling |
|------|----------|
| Same code twice by same user | "Already redeemed" (backend check) |
| Expired code | "Invalid or expired" |
| Max uses reached | "Invalid or expired" |
| Invalid code | "Invalid or expired" |
| Race condition | Firestore transaction ensures atomicity |
| Case sensitivity | Uppercase conversion on backend |
| Whitespace | Trim on frontend and backend |
| Empty input | Button disabled until input |

---

## Files to Create/Modify

### Backend
- `backend/app/promo/` - New module
  - `__init__.py`
  - `router.py` - POST /promo/redeem
  - `schemas.py` - Request/response models
  - `service.py` - Redemption logic with transaction

### Frontend
- `frontend/lib/api.ts` - Add `redeemPromo()` function
- `frontend/app/billing/page.tsx` - Add PromoRedemption component

---

## Out of Scope (v1)

- Signup integration
- Rate limiting
- Dedicated /redeem page
- URL parameter auto-apply
- Email-based codes
