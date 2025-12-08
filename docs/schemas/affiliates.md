# Affiliates Schema

## affiliates/{affiliateId}

**Purpose:** Affiliate account records

```typescript
{
  affiliate_id: string,
  user_id: string,                    // Indexed

  // Application
  status: "pending" | "approved" | "rejected" | "suspended",
  affiliate_code: string | null,      // AFF-XXXXX

  // Contact
  name: string,
  email: string,
  platform_url: string,
  platform_type: "youtube" | "instagram" | "tiktok" | "blog" | "twitter" | "other",
  promotion_plan: string,
  paypal_email: string,
  audience_size: number,

  // Performance
  total_clicks: number,
  total_signups: number,
  total_conversions: number,
  commission_earned: number,          // USD
  commission_pending: number,
  commission_paid: number,

  // Metadata
  applied_at: timestamp,
  approved_at: timestamp | null,
  rejected_at: timestamp | null,
  rejection_reason: string | null,
  created_at: timestamp,
  updated_at: timestamp,
}
```

**Indexes:**
- Single: `user_id ASC`
- Single: `status ASC`
- Single: `affiliate_code ASC` (if set)

---

## affiliate_clicks/{clickId}

**Purpose:** Track affiliate link clicks

```typescript
{
  click_id: string,
  affiliate_id: string,               // Indexed
  affiliate_code: string,

  ip_address: string,
  user_agent: string,
  referrer_url: string | null,

  converted: boolean,
  converted_user_id: string | null,
  conversion_timestamp: timestamp | null,

  timestamp: timestamp,
}
```

**Indexes:** Composite: `affiliate_id ASC, timestamp DESC`

---

## affiliate_conversions/{conversionId}

**Purpose:** Track affiliate-driven purchases

```typescript
{
  conversion_id: string,
  affiliate_id: string,               // Indexed
  affiliate_code: string,
  customer_user_id: string,

  purchase_amount: number,            // USD cents
  commission_amount: number,          // 20% of purchase
  commission_status: "pending" | "paid",

  stripe_payment_id: string,
  created_at: timestamp,
  paid_at: timestamp | null,
}
```

**Indexes:**
- Composite: `affiliate_id ASC, created_at DESC`
- Single: `customer_user_id ASC`

---

## affiliate_payouts/{payoutId}

**Purpose:** Payout history for affiliates

```typescript
{
  payout_id: string,
  affiliate_id: string,               // Indexed

  amount: number,                     // USD
  status: "pending" | "processing" | "completed" | "failed",

  paypal_email: string,
  paypal_transaction_id: string | null,

  requested_at: timestamp,
  processed_at: timestamp | null,
  completed_at: timestamp | null,
  failed_at: timestamp | null,
  failure_reason: string | null,
}
```

**Indexes:** Composite: `affiliate_id ASC, requested_at DESC`
