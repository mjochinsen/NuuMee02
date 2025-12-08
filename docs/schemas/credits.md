# Credits & Subscriptions Schema

## credit_transactions/{transactionId}

**Purpose:** Credit purchase, usage, and refund history

```typescript
{
  transaction_id: string,
  user_id: string,                    // Indexed
  type: "purchase" | "job" | "refund" | "referral" | "subscription" | "affiliate" | "founding_bonus" | "signup_bonus",
  amount: number,                     // Positive = added, Negative = deducted
  balance_before: number,
  balance_after: number,
  description: string,

  // Related entities
  related_job_id: string | null,
  related_transaction_id: string | null,
  related_stripe_payment_id: string | null,
  related_referral_code: string | null,

  created_at: timestamp,
}
```

**Indexes:**
- Composite: `user_id ASC, created_at DESC`
- Single: `type ASC`

---

## subscriptions/{subscriptionId}

**Purpose:** Active subscription records (synced with Stripe)

```typescript
{
  subscription_id: string,
  user_id: string,                    // Indexed
  stripe_subscription_id: string,     // Indexed
  stripe_customer_id: string,

  tier: "creator" | "studio",
  status: "active" | "canceled" | "past_due" | "unpaid",

  // Billing
  current_period_start: timestamp,
  current_period_end: timestamp,
  cancel_at_period_end: boolean,
  canceled_at: timestamp | null,

  // Credits
  monthly_credits: number,            // 400 (creator) or 1600 (studio)
  credits_granted_this_period: number,
  credits_remaining_this_period: number,
  credits_rollover_cap: number,       // 800 or 3200

  // Pricing
  price_monthly: number,              // USD cents
  discount_percent: number,           // Founding members (20)

  created_at: timestamp,
  updated_at: timestamp,
}
```

**Indexes:**
- Single: `user_id ASC` (unique)
- Single: `stripe_subscription_id ASC` (unique)
