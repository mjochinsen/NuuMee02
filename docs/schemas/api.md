# API & System Schema

## api_keys/{keyId}

**Purpose:** API key management

```typescript
{
  key_id: string,
  user_id: string,                    // Indexed

  name: string,
  key_hash: string,                   // SHA-256 hash (indexed)
  key_prefix: string,                 // First 12 chars (display)
  environment: "live" | "test",

  status: "active" | "revoked",

  created_at: timestamp,
  last_used_at: timestamp | null,
  revoked_at: timestamp | null,
}
```

**Indexes:**
- Single: `user_id ASC`
- Single: `key_hash ASC` (authentication)

---

## webhooks/{webhookId}

**Purpose:** Webhook configuration (one per user)

```typescript
{
  webhook_id: string,
  user_id: string,                    // Indexed (unique)

  url: string,
  secret: string,
  events: string[],                   // ["job.completed", "job.failed"]

  enabled: boolean,

  created_at: timestamp,
  updated_at: timestamp,
  last_triggered_at: timestamp | null,
  last_status_code: number | null,
}
```

**Indexes:** Single: `user_id ASC` (unique)

---

## payment_methods/{paymentMethodId}

**Purpose:** Stripe payment methods

```typescript
{
  payment_method_id: string,
  user_id: string,                    // Indexed
  stripe_payment_method_id: string,   // Indexed
  stripe_customer_id: string,

  brand: "visa" | "mastercard" | "amex" | "discover",
  last4: string,
  expiry_month: number,
  expiry_year: number,

  is_default: boolean,

  created_at: timestamp,
  updated_at: timestamp,
}
```

**Indexes:**
- Single: `user_id ASC`
- Single: `stripe_payment_method_id ASC`

---

## system/config

**Purpose:** System-wide configuration and counters

```typescript
{
  founding_member_count: number,      // 0-100
  total_users: number,
  total_jobs: number,
  maintenance_mode: boolean,
  credit_packages: {
    starter: { credits: 120, price: 1000, bonus_percent: 20 },
    popular: { credits: 400, price: 3000, bonus_percent: 33 },
    pro: { credits: 1100, price: 7500, bonus_percent: 47 },
    mega: { credits: 2500, price: 15000, bonus_percent: 67 },
  },
  updated_at: timestamp,
}
```
