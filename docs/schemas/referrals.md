# Referrals Schema

## referrals/{referralId}

**Purpose:** Track individual referral conversions

```typescript
{
  referral_id: string,
  referrer_id: string,                // User who shared link (indexed)
  referred_user_id: string | null,    // User who signed up
  referral_code: string,              // USER-XXXXX (indexed)

  // Status
  status: "visited" | "signed_up" | "converted",

  // Tracking
  click_timestamp: timestamp,
  signup_timestamp: timestamp | null,
  conversion_timestamp: timestamp | null,
  first_purchase_amount: number | null,

  // Rewards
  referred_user_bonus_granted: boolean,     // 25 credits
  referrer_bonus_granted: boolean,          // 100 credits

  // Anti-fraud
  ip_address: string,
  user_agent: string,
  device_fingerprint: string | null,
  blocked: boolean,
  block_reason: string | null,

  created_at: timestamp,
  updated_at: timestamp,
}
```

**Indexes:**
- Composite: `referrer_id ASC, status ASC`
- Single: `referred_user_id ASC`
- Single: `referral_code ASC`

---

## referral_codes/{code}

**Purpose:** Unique referral code lookup (prevent duplicates)

```typescript
{
  code: string,                       // USER-XXXXX (doc ID, unique)
  user_id: string,
  created_at: timestamp,
}
```

**Indexes:** Document ID is indexed by default
