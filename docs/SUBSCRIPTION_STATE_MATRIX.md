# NuuMee Subscription State Matrix

**Purpose:** Complete documentation of all subscription states, transitions, and billing flows.

**Last Updated:** 2025-12-02

---

## 1. Subscription Tiers

| Tier    | Monthly Price | Annual Price | Credits/Month | Rollover Cap |
|---------|--------------|--------------|---------------|--------------|
| Free    | $0           | N/A          | 25 (signup)   | 25           |
| Creator | $29/month    | $290/year    | 400           | 800          |
| Studio  | $99/month    | $990/year    | 1600          | 3200         |

**Notes:**
- Free tier gets 25 credits on signup only (no monthly renewal)
- Annual pricing = 10 months for price of 12 (16.7% discount)
- Rollover cap = 2x monthly credits (unused credits don't exceed this)

---

## 2. User States

### 2.1 Subscription Tier States

| State          | `subscription_tier` | `billing_period` | Description                    |
|----------------|---------------------|------------------|--------------------------------|
| Free           | `free`              | `null`           | No active subscription         |
| Creator Monthly| `creator`           | `month`          | $29/month subscription         |
| Creator Annual | `creator`           | `year`           | $290/year subscription         |
| Studio Monthly | `studio`            | `month`          | $99/month subscription         |
| Studio Annual  | `studio`            | `year`           | $990/year subscription         |

### 2.2 Firestore User Document Fields

```javascript
{
  user_id: string,
  email: string,
  credits_balance: number,        // Current credit balance
  subscription_tier: string,      // "free" | "creator" | "studio"
  billing_period: string | null,  // "month" | "year" | null
  stripe_customer_id: string,     // Stripe customer ID
  stripe_subscription_id: string, // Active Stripe subscription ID
  current_period_start: timestamp,
  current_period_end: timestamp,
  cancel_at_period_end: boolean,
  created_at: timestamp,
  updated_at: timestamp
}
```

---

## 3. State Transitions

### 3.1 Valid Transitions Diagram

```
                    ┌─────────────────────────────────────┐
                    │                                     │
                    ▼                                     │
┌──────────┐    Subscribe    ┌──────────────┐         │
│   FREE   │ ──────────────► │   CREATOR    │ ◄───────┘
└──────────┘                 │  (Monthly)   │
     ▲                       └──────────────┘
     │                             │  │
     │ Cancel                      │  │ Switch Billing
     │ (period end)                │  ▼
     │                       ┌──────────────┐
     │                       │   CREATOR    │
     │                       │  (Annual)    │
     │                       └──────────────┘
     │                             │
     │ Cancel                      │ Upgrade
     │ (period end)                ▼
     │                       ┌──────────────┐
     └─────────────────────── │   STUDIO     │ ◄───────┐
                             │  (Monthly)   │         │
                             └──────────────┘         │
                                   │  │               │
                                   │  │ Switch        │
                                   │  ▼               │
                             ┌──────────────┐         │
                             │   STUDIO     │─────────┘
                             │  (Annual)    │ Downgrade
                             └──────────────┘
```

### 3.2 Transition Actions

| From State       | To State         | Action                | API Endpoint                    | Stripe Event                    |
|------------------|------------------|----------------------|----------------------------------|--------------------------------|
| Free             | Creator Monthly  | Subscribe            | POST /subscriptions/create       | checkout.session.completed     |
| Free             | Creator Annual   | Subscribe            | POST /subscriptions/create       | checkout.session.completed     |
| Free             | Studio Monthly   | Subscribe            | POST /subscriptions/create       | checkout.session.completed     |
| Free             | Studio Annual    | Subscribe            | POST /subscriptions/create       | checkout.session.completed     |
| Creator Monthly  | Creator Annual   | Switch Billing       | POST /subscriptions/switch       | customer.subscription.updated  |
| Creator Annual   | Creator Monthly  | Switch Billing       | POST /subscriptions/switch       | customer.subscription.updated  |
| Creator Monthly  | Studio Monthly   | Upgrade              | POST /subscriptions/upgrade      | customer.subscription.updated  |
| Creator Monthly  | Studio Annual    | Upgrade              | POST /subscriptions/upgrade      | customer.subscription.updated  |
| Creator Annual   | Studio Monthly   | Upgrade              | POST /subscriptions/upgrade      | customer.subscription.updated  |
| Creator Annual   | Studio Annual    | Upgrade              | POST /subscriptions/upgrade      | customer.subscription.updated  |
| Studio Monthly   | Studio Annual    | Switch Billing       | POST /subscriptions/switch       | customer.subscription.updated  |
| Studio Annual    | Studio Monthly   | Switch Billing       | POST /subscriptions/switch       | customer.subscription.updated  |
| Studio Monthly   | Creator Monthly  | Downgrade            | POST /subscriptions/upgrade      | customer.subscription.updated  |
| Studio Monthly   | Creator Annual   | Downgrade            | POST /subscriptions/upgrade      | customer.subscription.updated  |
| Studio Annual    | Creator Monthly  | Downgrade            | POST /subscriptions/upgrade      | customer.subscription.updated  |
| Studio Annual    | Creator Annual   | Downgrade            | POST /subscriptions/upgrade      | customer.subscription.updated  |
| Creator *        | Free             | Cancel               | POST /subscriptions/cancel       | customer.subscription.deleted  |
| Studio *         | Free             | Cancel               | POST /subscriptions/cancel       | customer.subscription.deleted  |

---

## 4. User Flows

### 4.1 First Sign-Up Flow

```
1. User visits /signup
2. User creates account (email/password or social)
3. Frontend calls POST /auth/register with Firebase ID token
4. Backend:
   a. Verifies Firebase token
   b. Creates Firestore user document:
      - credits_balance: 25
      - subscription_tier: "free"
      - billing_period: null
      - generates referral_code
   c. Returns UserProfile
5. User redirected to /create (or home)
6. UI shows: "25 credits" in header
```

### 4.2 Subscribe to Creator (Monthly) Flow

```
1. User visits /billing or /pricing
2. User clicks "Select" on Creator Monthly plan
3. Frontend calls POST /subscriptions/create:
   - tier: "creator"
   - annual: false
4. Backend:
   a. Creates Stripe Checkout Session with:
      - price_id: price_creator_monthly
      - mode: "subscription"
      - customer_email (or existing customer)
   b. Returns { checkout_url }
5. Frontend redirects to Stripe Checkout
6. User completes payment
7. Stripe webhook: checkout.session.completed
8. Backend webhook handler:
   a. Updates user document:
      - subscription_tier: "creator"
      - billing_period: "month"
      - credits_balance += 400
      - stripe_subscription_id: sub_xxx
   b. Creates transaction record
9. User redirected to /payment/success
10. UI shows: Creator badge, new credit balance
```

### 4.3 Switch Billing Period Flow (Monthly → Annual)

```
1. User on Creator Monthly visits /billing
2. User clicks "Switch to Annual"
3. Confirmation modal shows savings ($348 vs $290/year)
4. User clicks "Confirm Switch to Annual"
5. Frontend calls POST /subscriptions/switch:
   - annual: true
6. Backend:
   a. Retrieves current Stripe subscription
   b. Updates subscription items to annual price
   c. Stripe prorates the change
   d. Updates user document:
      - billing_period: "year"
   e. Creates transaction record (billing_switch_annual)
7. Success modal shows confirmation
8. UI shows: "Switch to Monthly" button
```

### 4.4 Switch Billing Period Flow (Annual → Monthly)

```
1. User on Creator Annual visits /billing
2. User clicks "Switch to Monthly"
3. Confirmation modal warns about higher long-term cost
4. User clicks "Confirm Switch to Monthly"
5. Frontend calls POST /subscriptions/switch:
   - annual: false
6. Backend:
   a. Retrieves current Stripe subscription
   b. Updates subscription items to monthly price
   c. Stripe prorates the change
   d. Updates user document:
      - billing_period: "month"
   e. Creates transaction record (billing_switch_monthly)
7. Success modal shows confirmation
8. UI shows: "Switch to Annual" button
```

### 4.5 Upgrade Tier Flow (Creator → Studio)

```
1. User on Creator Monthly visits /billing
2. User clicks "Select" on Studio plan
3. Upgrade confirmation modal shows:
   - New price ($99/month or $990/year)
   - Additional credits (1600 - 400 = 1200 more)
   - Prorated charge amount
4. User clicks "Confirm Upgrade"
5. Frontend calls POST /subscriptions/upgrade:
   - tier: "studio"
   - annual: false (or current billing period)
6. Backend:
   a. Updates Stripe subscription to new price
   b. Prorates charge
   c. Updates user document:
      - subscription_tier: "studio"
      - credits_balance += credit difference
   d. Creates transaction record
7. Success modal shows confirmation
8. UI shows: Studio badge, new credits
```

### 4.6 Downgrade Tier Flow (Studio → Creator)

```
1. User on Studio visits /billing
2. User clicks "Select" on Creator plan
3. Downgrade confirmation modal shows:
   - New price ($29/month or $290/year)
   - Warning: takes effect at end of billing period
   - Credits remain until renewal
4. User clicks "Confirm Downgrade"
5. Frontend calls POST /subscriptions/upgrade:
   - tier: "creator"
   - annual: current billing period
6. Backend:
   a. Schedules Stripe subscription change at period end
   b. Updates user document:
      - pending_tier_change: "creator"
   c. Creates transaction record
7. Success modal shows confirmation
8. At period end, Stripe webhook triggers tier change
```

### 4.7 Cancel Subscription Flow (Downgrade to Free)

```
1. User on Creator/Studio visits /billing
2. User clicks "Select" on Free plan
3. Cancellation confirmation modal shows:
   - Access until current period end date
   - Credits remain but won't renew
   - Feature comparison (what they lose)
4. User clicks "Confirm Downgrade to Free"
5. Frontend calls POST /subscriptions/cancel
6. Backend:
   a. Sets Stripe subscription cancel_at_period_end: true
   b. Updates user document:
      - cancel_at_period_end: true
   c. Creates transaction record
7. Success modal shows confirmation
8. At period end, Stripe webhook: customer.subscription.deleted
9. Backend updates:
   - subscription_tier: "free"
   - billing_period: null
10. UI shows: Free badge
```

### 4.8 Credit Purchase Flow (One-Time)

```
1. User visits /pricing or /billing
2. User clicks "Buy" on credit package:
   - 100 credits: $10
   - 500 credits: $45
   - 1000 credits: $80
3. Frontend calls POST /credits/checkout:
   - package_id: "credits_100" (or 500/1000)
4. Backend:
   a. Creates Stripe Checkout Session:
      - mode: "payment" (one-time)
      - line_items: credit package
   b. Returns { checkout_url }
5. Frontend redirects to Stripe Checkout
6. User completes payment
7. Stripe webhook: checkout.session.completed
8. Backend:
   a. Updates user credits_balance
   b. Creates transaction record
9. User redirected to /payment/success
10. UI shows: new credit balance
```

### 4.9 Subscription Renewal Flow (Automatic)

```
1. Stripe invoice.paid webhook fires at period end
2. Backend webhook handler:
   a. Verifies subscription is active
   b. Calculates credits to add:
      - Creator: 400
      - Studio: 1600
   c. Applies rollover cap (2x monthly)
   d. Updates user document:
      - credits_balance = min(current + monthly, rollover_cap)
      - current_period_start/end updated
   e. Creates transaction record
3. User sees new credits on next login
```

---

## 5. UI State Display

### 5.1 Billing Page - Active Plan Section

| User State       | Badge Color | Badge Text       | Billing Toggle          |
|------------------|-------------|------------------|-------------------------|
| Free             | Gray        | "Free"           | Hidden                  |
| Creator Monthly  | Indigo      | "Creator Monthly"| "Switch to Annual"      |
| Creator Annual   | Indigo      | "Creator Annual" | "Switch to Monthly"     |
| Studio Monthly   | Purple      | "Studio Monthly" | "Switch to Annual"      |
| Studio Annual    | Purple      | "Studio Annual"  | "Switch to Monthly"     |

### 5.2 Billing Page - Plan Cards

| User State       | Free Card Button | Creator Card Button | Studio Card Button |
|------------------|------------------|---------------------|---------------------|
| Free             | "Active"         | "Select"            | "Select"            |
| Creator Monthly  | "Select"         | "Active"            | "Select"            |
| Creator Annual   | "Select"         | "Active"            | "Select"            |
| Studio Monthly   | "Select"         | "Select"            | "Active"            |
| Studio Annual    | "Select"         | "Select"            | "Active"            |

### 5.3 Pricing Toggle (Monthly/Annual)

| Toggle Position | Shows Prices                                    |
|-----------------|-------------------------------------------------|
| Monthly         | Free: $0, Creator: $29/mo, Studio: $99/mo      |
| Annual          | Free: $0, Creator: $24.17/mo, Studio: $82.50/mo |

---

## 6. Transaction Types

| Type                    | Description                          | Amount    | Credits Change |
|-------------------------|--------------------------------------|-----------|----------------|
| `signup`                | Initial signup bonus                 | $0        | +25            |
| `credit_purchase`       | One-time credit purchase             | $10-$80   | +100 to +1000  |
| `subscription_create`   | New subscription                     | $29-$990  | +400 to +1600  |
| `subscription_renewal`  | Monthly/annual renewal               | $29-$990  | +400 to +1600  |
| `subscription_cancel`   | Subscription cancelled               | $0        | 0              |
| `billing_switch_annual` | Switched from monthly to annual      | Prorated  | 0              |
| `billing_switch_monthly`| Switched from annual to monthly      | Prorated  | 0              |
| `subscription_upgrade`  | Upgraded to higher tier              | Prorated  | +credits diff  |
| `subscription_downgrade`| Downgraded to lower tier             | $0        | 0              |
| `job_charge`            | Credits used for video generation    | $0        | -N credits     |
| `referral_bonus`        | Referred user signed up              | $0        | +25            |
| `referrer_reward`       | Referred user made first purchase    | $0        | +100           |

---

## 7. Edge Cases

### 7.1 Missing `billing_period` Field

**Cause:** Legacy users or data inconsistency
**Detection:** `subscription_tier !== "free" && billing_period === null`
**UI Behavior:**
- Default to showing "Switch to Annual" button
- On click, sync billing_period from Stripe before proceeding

**Fix Script:** See `/backend/scripts/sync_billing_period.py`

### 7.2 Stripe Customer Without Subscription

**Cause:** User cancelled or subscription expired
**Detection:** Stripe customer exists but no active subscription
**Backend Behavior:** Return subscription_tier: "free"

### 7.3 Multiple Active Subscriptions

**Cause:** Stripe error or edge case
**Detection:** Stripe returns multiple active subscriptions
**Backend Behavior:** Use most recent, log warning

### 7.4 Failed Payment on Renewal

**Cause:** Card declined, expired, etc.
**Stripe Behavior:** Retries up to 4 times over ~3 weeks
**Backend Behavior:**
- On invoice.payment_failed: Log warning, optionally notify user
- On subscription.deleted: Update to free tier

### 7.5 Proration on Billing Period Switch

**Stripe Behavior:**
- Monthly → Annual: Credit for remaining monthly, charge for annual
- Annual → Monthly: No immediate refund, monthly starts at period end

---

## 8. API Endpoints Summary

| Endpoint                           | Method | Auth | Description                      |
|------------------------------------|--------|------|----------------------------------|
| `/subscriptions/create`            | POST   | Yes  | Create new subscription          |
| `/subscriptions/cancel`            | POST   | Yes  | Cancel at period end             |
| `/subscriptions/upgrade`           | POST   | Yes  | Change tier                      |
| `/subscriptions/switch`            | POST   | Yes  | Change billing period            |
| `/subscriptions/current`           | GET    | Yes  | Get active subscription          |
| `/subscriptions/tiers`             | GET    | No   | List available tiers/prices      |
| `/subscriptions/customer-portal`   | POST   | Yes  | Get Stripe portal URL            |
| `/credits/checkout`                | POST   | Yes  | Buy credit package               |
| `/credits/balance`                 | GET    | Yes  | Get current balance              |
| `/transactions`                    | GET    | Yes  | List transaction history         |
| `/webhooks/stripe`                 | POST   | No   | Stripe webhook handler           |

---

## 9. Stripe Price IDs (Production)

| Plan               | Price ID                    | Amount    |
|--------------------|-----------------------------|-----------|
| Creator Monthly    | `price_creator_monthly`     | $29/month |
| Creator Annual     | `price_creator_annual`      | $290/year |
| Studio Monthly     | `price_studio_monthly`      | $99/month |
| Studio Annual      | `price_studio_annual`       | $990/year |
| Credits 100        | `price_credits_100`         | $10       |
| Credits 500        | `price_credits_500`         | $45       |
| Credits 1000       | `price_credits_1000`        | $80       |

**Note:** Replace with actual Stripe Price IDs from dashboard.

---

## 10. Testing Checklist

### 10.1 New User Flows
- [ ] Signup creates user with 25 credits, free tier
- [ ] Subscribe to Creator Monthly
- [ ] Subscribe to Creator Annual
- [ ] Subscribe to Studio Monthly
- [ ] Subscribe to Studio Annual

### 10.2 Billing Period Changes
- [ ] Creator Monthly → Annual
- [ ] Creator Annual → Monthly
- [ ] Studio Monthly → Annual
- [ ] Studio Annual → Monthly

### 10.3 Tier Changes
- [ ] Creator → Studio (upgrade)
- [ ] Studio → Creator (downgrade)
- [ ] Creator → Free (cancel)
- [ ] Studio → Free (cancel)

### 10.4 Credit Purchases
- [ ] Buy 100 credits
- [ ] Buy 500 credits
- [ ] Buy 1000 credits

### 10.5 Renewal Flows
- [ ] Monthly subscription renewal
- [ ] Annual subscription renewal
- [ ] Rollover cap enforcement

### 10.6 Edge Cases
- [ ] Missing billing_period handled
- [ ] Failed payment handled
- [ ] Double-click prevention
- [ ] Concurrent request handling

---

_Document maintained by KODY. Update when subscription logic changes._
