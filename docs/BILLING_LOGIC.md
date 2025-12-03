# NuuMee Billing Logic — Implementation Reference v3.0

**Updated:** 2025-12-03
**Status:** IMPLEMENTED - Production Ready
**Aligned with:** Actual deployed code

---

## Overview

NuuMee billing has **two independent payment systems**:

1. **Subscriptions** — Monthly/Annual recurring plans (Free, Creator, Studio)
2. **Credit Packs** — One-time purchases (Starter, Popular, Pro, Mega)

These systems are independent. A Studio subscriber can still buy credit packs.

---

## Implementation Status

| Feature | Status | Notes |
|---------|--------|-------|
| Subscription creation | ✅ Complete | Stripe checkout flow |
| Plan upgrades | ✅ Complete | Immediate with proration |
| Plan downgrades | ✅ Complete | Immediate, no credit removal |
| Billing period switching | ✅ Complete | Monthly ↔ Annual |
| Subscription cancellation | ✅ Complete | At period end |
| Credit purchases | ✅ Complete | Stripe checkout |
| Transaction history | ✅ Complete | Full audit trail |
| Auto-refill settings | ✅ Complete | Config only (no auto-trigger) |
| Payment methods | ✅ Complete | Stripe portal integration |
| Founding member discount | ✅ Complete | 20% lifetime via coupon |
| Credit bucket system | ⚠️ Simplified | Single bucket (see below) |
| Referral program | ❌ Not Implemented | Future feature |

---

## 1. Data Model (Actual Implementation)

### User Document (Firestore: `/users/{uid}`)

```javascript
{
  // Identity
  user_id: "uid",
  email: "user@example.com",

  // Subscription
  subscription_tier: "free" | "creator" | "studio",
  billing_period: "month" | "year" | null,
  stripe_customer_id: "cus_...",
  stripe_subscription_id: "sub_...",

  // Credits (SINGLE BUCKET)
  credits_balance: 13340,  // All credits combined

  // Auto-refill
  auto_refill: {
    enabled: false,
    threshold: 50,
    package_id: "popular"
  },

  // Timestamps
  created_at: timestamp,
  updated_at: timestamp
}
```

### Subscription Document (Firestore: `/subscriptions/{sub_id}`)

```javascript
{
  subscription_id: "sub_abc123",
  user_id: "uid",
  stripe_subscription_id: "sub_...",
  stripe_customer_id: "cus_...",
  tier: "creator",
  status: "active" | "past_due" | "canceled",
  monthly_credits: 400,
  credits_rollover_cap: 800,
  current_period_start: timestamp,
  current_period_end: timestamp,
  cancel_at_period_end: false,
  created_at: timestamp,
  updated_at: timestamp
}
```

### Credit Transaction (Firestore: `/credit_transactions/{txn_id}`)

```javascript
{
  transaction_id: "txn_...",
  user_id: "uid",
  type: "purchase" | "subscription" | "subscription_renewal" |
        "subscription_upgrade" | "subscription_downgrade" |
        "subscription_cancel" | "billing_switch_annual" |
        "billing_switch_monthly" | "job_usage" | "refund" | "bonus",
  amount: 400,              // Credits (+ add, - deduct)
  amount_cents: 2900,       // Dollar amount in cents
  status: "completed" | "pending" | "failed",
  balance_before: 100,
  balance_after: 500,
  description: "Creator subscription - initial credits",
  related_stripe_payment_id: "pi_...",
  receipt_url: "https://pay.stripe.com/receipts/...",
  created_at: timestamp,
  metadata: {
    card_last4: "4242",
    card_brand: "visa"
  }
}
```

---

## 2. Credit System (Simplified Implementation)

### Single Bucket Model

The current implementation uses a **single `credits_balance`** field:

```
┌─────────────────────────────────────────────────┐
│           TOTAL BALANCE: 13,340                 │
│                                                 │
│  All credits are treated equally:               │
│  • From subscription grants                     │
│  • From one-time purchases                      │
│  • From bonuses                                 │
│                                                 │
│  Rollover cap applies on renewal only           │
└─────────────────────────────────────────────────┘
```

### Rollover Cap Behavior

The rollover cap is applied **only during subscription renewal**:

```python
# On renewal (invoice.paid webhook):
new_balance = current_balance + monthly_credits
capped_balance = min(new_balance, credits_rollover_cap)
user.credits_balance = capped_balance
```

| Plan | Monthly Credits | Rollover Cap |
|------|-----------------|--------------|
| Free | 25 (one-time) | N/A |
| Creator | 400 | 800 |
| Studio | 1,600 | 3,200 |

---

## 3. Plan Structure

### Subscription Tiers

| Plan | Monthly | Annual (20% off) | Credits/Month |
|------|---------|------------------|---------------|
| Free | $0 | N/A | 25 (one-time signup) |
| Creator | $29 | $23/mo ($276/yr) | 400 |
| Studio | $99 | $79/mo ($948/yr) | 1,600 |

### Credit Packages (One-Time)

| Pack | Credits | Price | Per Credit |
|------|---------|-------|------------|
| Starter | 120 | $10 | $0.083 |
| Popular | 400 | $30 | $0.075 (+10% bonus) |
| Pro | 1,100 | $75 | $0.068 (+20% bonus) |
| Mega | 2,500 | $150 | $0.060 (+28% bonus) |

---

## 4. API Endpoints (Implemented)

### Subscriptions

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/subscriptions/tiers` | GET | List available tiers |
| `/subscriptions/create` | POST | Create new subscription (→ Stripe checkout) |
| `/subscriptions/current` | GET | Get active subscription |
| `/subscriptions/upgrade` | POST | Change tier (immediate) |
| `/subscriptions/cancel` | POST | Cancel at period end |
| `/subscriptions/switch-billing-period` | POST | Monthly ↔ Annual |
| `/subscriptions/customer-portal` | POST | Stripe customer portal |
| `/subscriptions/sync-billing-period` | POST | Sync billing period from Stripe |

### Credits

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/credits/packages` | GET | List credit packages |
| `/credits/balance` | GET | Get current balance |
| `/credits/checkout` | POST | Purchase credits (→ Stripe checkout) |
| `/credits/auto-refill` | GET | Get auto-refill settings |
| `/credits/auto-refill` | PUT | Update auto-refill settings |
| `/credits/receipt/{session_id}` | GET | Get purchase receipt |
| `/credits/payment-methods` | GET | List saved payment methods |

### Transactions

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/transactions` | GET | List credit transactions (paginated) |

### Account Management

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/auth/export` | GET | Export all user data as JSON |
| `/auth/account` | DELETE | Delete account permanently |

---

## 5. Stripe Webhook Handlers

### Events Handled

| Event | Handler | Action |
|-------|---------|--------|
| `checkout.session.completed` (subscription) | `handle_subscription_created` | Create subscription, grant initial credits |
| `checkout.session.completed` (payment) | `handle_checkout_completed` | Add purchased credits |
| `invoice.paid` | `handle_invoice_paid` | Grant renewal credits (with rollover cap) |
| `customer.subscription.updated` | `handle_subscription_updated` | Sync status and dates |
| `customer.subscription.deleted` | `handle_subscription_deleted` | Revert to free tier |

### Idempotency

All webhook handlers include idempotency checks to prevent duplicate processing.

---

## 6. Plan Change Behavior

### Upgrades (Immediate)

When upgrading (e.g., Creator → Studio):

1. Stripe subscription updated with proration
2. Credit difference added immediately (1600 - 400 = +1200)
3. User tier updated immediately
4. Transaction logged as `subscription_upgrade`

```javascript
// Credits granted on upgrade
credits_added = new_monthly_credits - old_monthly_credits
// Only if upgrading (new > old)
```

### Downgrades (Immediate, No Credit Removal)

When downgrading (e.g., Studio → Creator):

1. Stripe subscription updated with proration credit
2. **No credits removed** - user keeps all existing credits
3. User tier updated immediately
4. Transaction logged as `subscription_downgrade`
5. New rollover cap applies on next renewal

### Billing Period Switch

Monthly ↔ Annual switching:

1. Stripe handles prorated charges/credits
2. No credit impact (amount=0 in transaction)
3. User's `billing_period` field updated
4. Transaction logged as `billing_switch_annual` or `billing_switch_monthly`

### Cancellation (At Period End)

When user cancels:

1. `cancel_at_period_end` set to `true`
2. User keeps access until `current_period_end`
3. User keeps all existing credits
4. Stripe automatically cancels at period end
5. Webhook sets user to free tier when subscription deleted

---

## 7. UI Components (/billing Page)

### Sections Implemented

1. **Current Balance** - Credit count with value estimate
2. **Active Plan Card** - Current tier, price, renewal date, action buttons
3. **Subscription Plans** - Free/Creator/Studio cards with monthly/annual toggle
4. **Buy Credits** - Four credit packages with purchase buttons
5. **Auto-Refill** - Enable/disable, threshold, package selection
6. **Payment Methods** - Saved cards, Stripe portal link
7. **Transaction History** - Paginated table with receipt links

### Button States

| Current Plan | Free Button | Creator Button | Studio Button |
|--------------|-------------|----------------|---------------|
| Free | Current (disabled) | Upgrade | Upgrade |
| Creator | Downgrade | Current (disabled) | Upgrade |
| Studio | Downgrade | Downgrade | Current (disabled) |

### Modal Flows

- **Subscribe** → Stripe checkout for new subscription
- **Upgrade** → Immediate change with confirmation
- **Downgrade** → Immediate change with confirmation
- **Cancel** → Scheduled for period end with feedback
- **Buy Credits** → Stripe checkout for one-time purchase

---

## 8. Account Management (/account Page)

### Delete Account Tab

1. **Download My Data** - Exports JSON with profile, subscriptions, transactions, jobs
2. **Downgrade to Free** - Cancels subscription at period end
3. **Delete Account** - Permanently deletes:
   - Stripe subscriptions (canceled immediately)
   - Firestore data (user, subscriptions, transactions, jobs)
   - Firebase Auth user

---

## 9. Key Business Rules

### The 5 Implemented Rules

1. **Upgrades are immediate + prorated** - User pays difference, gets credits now
2. **Downgrades are immediate, no credit removal** - User keeps all credits
3. **Cancellation at period end** - User keeps access until billing period ends
4. **Single credit bucket** - All credits treated equally
5. **Rollover cap on renewal only** - Applied when monthly credits are granted

### What Happens to Credits

| Action | Credit Impact |
|--------|---------------|
| New subscription | +monthly_credits |
| Renewal | +monthly_credits (capped at rollover_cap) |
| Upgrade | +credit_difference (new - old) |
| Downgrade | No change |
| Purchase pack | +pack_credits |
| Cancel | No change (keep all) |
| Delete account | All credits deleted with account |

---

## 10. Stripe Configuration

### Price IDs

```javascript
// Subscriptions (from environment)
STRIPE_CREATOR_PRICE_ID     // Creator monthly
STRIPE_STUDIO_PRICE_ID      // Studio monthly
// Annual prices configured in Stripe Dashboard

// Credit Packs (from environment)
STRIPE_PRICE_STARTER        // $10 → 120 credits
STRIPE_PRICE_POPULAR        // $30 → 400 credits
STRIPE_PRICE_PRO            // $75 → 1100 credits
STRIPE_PRICE_MEGA           // $150 → 2500 credits
```

### Founding Member Coupon

- ID: `FOUNDING20`
- Discount: 20% off
- Duration: Forever (all renewals)
- Applied at subscription checkout when `founding=true`

---

## 11. Error Handling

### Common Scenarios

| Scenario | Behavior |
|----------|----------|
| Payment fails | Subscription goes to `past_due`, Stripe retries |
| No active subscription for cancel | Returns error "No active subscription" |
| Already on target tier | Returns error "Already on [tier] plan" |
| Invalid package ID | Returns error "Invalid package" |
| Webhook replay | Idempotency check prevents duplicate credits |

---

## 12. Not Implemented (Future Features)

The following features from the original spec are NOT implemented:

1. **Two-bucket credit system** - Subscription vs purchased credits
2. **Referral program** - Referral codes and bonuses
3. **Scheduled downgrades** - Downgrades happen immediately
4. **Auto-refill trigger** - Settings saved but no automatic purchase
5. **Add-on tier discounts** - (15%/25% off add-ons)
6. **Founding member tracking** - Discount applied but not flagged in user record

---

## 13. File Reference

| Component | Path |
|-----------|------|
| Billing page | `frontend/app/(dashboard)/billing/page.tsx` |
| Account page | `frontend/app/(dashboard)/account/page.tsx` |
| Subscription modal | `frontend/components/SubscriptionModal.tsx` |
| Buy credits modal | `frontend/components/BuyCreditsModal.tsx` |
| Transaction history | `frontend/app/(dashboard)/billing/components/TransactionHistorySection.tsx` |
| API client | `frontend/lib/api.ts` |
| Subscriptions router | `backend/app/subscriptions/router.py` |
| Credits router | `backend/app/credits/router.py` |
| Webhooks router | `backend/app/webhooks/router.py` |
| Auth router | `backend/app/auth/router.py` |
| Subscription service | `backend/app/subscriptions/services/subscription_service.py` |

---

## 14. Testing Checklist

### Manual Test Scenarios

- [ ] Create new Creator subscription (monthly)
- [ ] Create new Studio subscription (annual)
- [ ] Upgrade Creator → Studio (verify +1200 credits)
- [ ] Downgrade Studio → Creator (verify credits preserved)
- [ ] Switch monthly → annual (verify no credit change)
- [ ] Cancel subscription (verify access until period end)
- [ ] Purchase Starter credit pack
- [ ] Purchase Popular credit pack
- [ ] View transaction history (verify all actions logged)
- [ ] Download user data (verify JSON export)
- [ ] Delete account (verify complete cleanup)

---

**Document Version:** 3.0
**Last Updated:** 2025-12-03
**Status:** IMPLEMENTED - Reflects Production Code
