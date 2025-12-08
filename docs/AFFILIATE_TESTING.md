# Affiliate System Testing Guide

## Overview

Testing affiliates is similar to referrals but with these differences:
- Affiliates must be **approved** (not auto-generated like referral codes)
- Reward is **cash commission** (30% of first purchase), not credits
- Payouts are **manual via PayPal** (V2 will automate this)

---

## Pre-requisites

1. **Create test affiliate in Firestore** (Firebase Console)
   - Collection: `affiliates`
   - Document ID: `aff_test123`
   - Fields:
     ```json
     {
       "affiliate_id": "aff_test123",
       "user_id": "<your-test-user-id>",
       "status": "approved",
       "affiliate_code": "AFF-TEST1",
       "name": "Test Affiliate",
       "email": "affiliate@test.com",
       "paypal_email": "affiliate@test.com",
       "total_clicks": 0,
       "total_signups": 0,
       "total_conversions": 0,
       "commission_earned": 0.0,
       "commission_pending": 0.0,
       "commission_paid": 0.0,
       "created_at": <timestamp>,
       "approved_at": <timestamp>
     }
     ```

2. **Create affiliate_codes entry** (for code lookup)
   - Collection: `affiliate_codes`
   - Document ID: `AFF-TEST1`
   - Fields:
     ```json
     {
       "code": "AFF-TEST1",
       "affiliate_id": "aff_test123",
       "user_id": "<your-test-user-id>",
       "created_at": <timestamp>
     }
     ```

---

## Test Flow Checklist

### Test 1: Click Tracking
- [ ] Visit `https://nuumee.ai/?a=AFF-TEST1`
- [ ] Check localStorage has `affiliate_code: AFF-TEST1`
- [ ] Verify `total_clicks` incremented in Firestore (if implemented)

### Test 2: Signup Attribution
- [ ] Create NEW account while affiliate code in localStorage
- [ ] Check user document has `affiliate_code: AFF-TEST1`
- [ ] Verify `total_signups` incremented in affiliate document
- [ ] Verify affiliate received "New signup" email (if implemented)

### Test 3: Commission on Purchase
- [ ] Log in as the new user
- [ ] Buy credits (any amount, e.g., $10)
- [ ] Verify `total_conversions` incremented
- [ ] Verify `commission_pending` = purchase × 0.30 (e.g., $3.00)
- [ ] Verify `commission_earned` updated
- [ ] Verify affiliate received "Commission earned" email (if implemented)

### Test 4: Payout Request
- [ ] Log in as affiliate user
- [ ] Go to /affiliate page
- [ ] Request payout (minimum $100)
- [ ] Verify `affiliate_payouts` document created with status "pending"
- [ ] Verify `commission_pending` decreased by payout amount

### Test 5: Admin Payout (Manual)
- [ ] Find payout request in Firebase Console (`affiliate_payouts` collection)
- [ ] Manually send PayPal payment
- [ ] Update payout document: `status: "completed"`, `completed_at: <now>`
- [ ] Update affiliate: `commission_paid` += payout amount

---

## Quick Verification Script

Run this after testing to verify affiliate state:

```python
# backend/scripts/verify_affiliate.py
import firebase_admin
from firebase_admin import credentials, firestore

if not firebase_admin._apps:
    firebase_admin.initialize_app()

db = firestore.client()

AFFILIATE_CODE = "AFF-TEST1"

# Get affiliate
aff_query = list(db.collection("affiliates").where("affiliate_code", "==", AFFILIATE_CODE).limit(1).get())
if aff_query:
    aff = aff_query[0].to_dict()
    print(f"Affiliate: {aff.get('name')}")
    print(f"  Clicks: {aff.get('total_clicks')}")
    print(f"  Signups: {aff.get('total_signups')}")
    print(f"  Conversions: {aff.get('total_conversions')}")
    print(f"  Commission Earned: ${aff.get('commission_earned', 0):.2f}")
    print(f"  Commission Pending: ${aff.get('commission_pending', 0):.2f}")
    print(f"  Commission Paid: ${aff.get('commission_paid', 0):.2f}")
else:
    print(f"Affiliate {AFFILIATE_CODE} not found")

# Get users referred by this affiliate
users = list(db.collection("users").where("affiliate_code", "==", AFFILIATE_CODE).get())
print(f"\nUsers referred: {len(users)}")
for u in users:
    ud = u.to_dict()
    print(f"  - {ud.get('email')}")
```

---

## Differences from Referral Testing

| Aspect | Referrals | Affiliates |
|--------|-----------|------------|
| Code creation | Automatic (any user) | Manual approval required |
| Tracking param | `?ref=USER-XXXXX` | `?a=AFF-XXXXX` |
| Reward type | Credits (internal) | Cash (commission_pending) |
| Reward amount | Fixed 100 credits | 30% of purchase |
| Payout | Instant (credits) | Manual PayPal |
| Testing complexity | Lower | Higher (needs admin setup) |

---

## V2 Improvements (Post-Launch)

- [ ] PayPal Payouts API integration for automated payouts
- [ ] Affiliate dashboard with real-time stats
- [ ] Cookie-based tracking (30-day window per PRICING_STRATEGY.md)
- [ ] Admin approval UI (currently Firebase Console only)
