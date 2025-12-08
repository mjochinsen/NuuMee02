# Users Collection Schema

**Collection:** `users/{userId}`
**Purpose:** User profiles, credits, subscription info

## Document Structure

```typescript
{
  // Identity
  user_id: string,                    // Firebase Auth UID
  email: string,                      // Primary email (indexed)
  email_verified: boolean,
  display_name: string | null,
  username: string | null,            // Unique, optional
  avatar_url: string | null,

  // Profile
  company: string | null,
  location: string | null,
  bio: string | null,                 // Max 500 chars

  // Credits & Billing
  credits_balance: number,            // Default: 25 for new users
  subscription_tier: "free" | "creator" | "studio",
  stripe_customer_id: string | null,

  // Founding Member Program
  founding_member: boolean,
  founding_discount: number,          // 0.20 = 20% lifetime
  founding_joined_at: timestamp | null,
  founding_number: number | null,     // 1-100

  // Referral System
  referral_code: string,              // USER-XXXXX (unique)
  referred_by: string | null,
  referral_bonus_claimed: boolean,    // 25 credits
  referrer_bonus_paid: boolean,       // 100 credits to referrer

  // Affiliate Program
  is_affiliate: boolean,
  affiliate_status: "none" | "pending" | "approved" | "rejected",
  affiliate_code: string | null,      // AFF-XXXXX

  // Notification Preferences
  notifications: {
    email_on_completion: boolean,
    email_on_failure: boolean,
    email_on_low_credits: boolean,
    email_on_billing: boolean,
    email_product_updates: boolean,
    email_marketing: boolean,
    browser_notifications: boolean,
  },

  // Webhook
  webhook_url: string | null,
  webhook_secret: string | null,
  webhook_events: string[],

  // Metadata
  created_at: timestamp,
  updated_at: timestamp,
  last_login_at: timestamp,
}
```

## Indexes

- `email` (unique via Security Rules)
- `referral_code` (unique via Security Rules)
- `username` (unique if set)
