# Referral System Documentation

## Overview

The NuuMee referral system allows users to invite friends and earn credits. Both the referrer and the referred user receive bonus credits.

## Credit Structure

| Event | Referred User Gets | Referrer Gets |
|-------|-------------------|---------------|
| Signup via referral link | 25 credits (on top of 25 signup bonus = 50 total) | 0 (pending) |
| First video generation | - | 25 credits |

## User Flow

### Referrer Flow
1. User logs in and visits `/referral/`
2. Frontend calls `GET /api/v1/referral/code`
3. Backend generates/retrieves referral code (format: `USER-XXXXX`)
4. User shares link: `https://nuumee.ai/ref/{CODE}/`

### Referred User Flow
1. Visits `https://nuumee.ai/ref/{CODE}/`
2. Frontend (`/ref/page.tsx`) stores code in localStorage
3. Redirects to `/login/?mode=signup`
4. User signs up (email/password or social)
5. After signup, frontend calls `POST /api/v1/referral/apply` with stored code
6. Backend grants 25 bonus credits
7. User lands on `/billing/` with 50 credits total

## Firestore Collections

### `users` Collection
```json
{
  "user_id": "firebase_uid",
  "email": "user@example.com",
  "credits_balance": 50,
  "referral_code": "USER-XXXXX",
  "referred_by": "USER-YYYYY",
  "referral_bonus_claimed": true
}
```

### `referral_codes` Collection
Document ID = referral code (e.g., `USER-XXXXX`)
```json
{
  "code": "USER-XXXXX",
  "user_id": "firebase_uid_of_owner",
  "created_at": "timestamp"
}
```

### `referrals` Collection
Tracks referral relationships
```json
{
  "referrer_id": "firebase_uid",
  "referred_user_id": "firebase_uid",
  "referral_code": "USER-XXXXX",
  "status": "signed_up|converted",
  "referred_user_bonus_granted": true,
  "referrer_bonus_granted": false,
  "created_at": "timestamp"
}
```

### `credit_transactions` Collection
Records all credit changes
```json
{
  "user_id": "firebase_uid",
  "type": "referral",
  "amount": 25,
  "status": "completed",
  "balance_before": 25,
  "balance_after": 50,
  "description": "Referral signup bonus (code: USER-XXXXX)",
  "related_referral_code": "USER-XXXXX",
  "created_at": "timestamp"
}
```

## API Endpoints

### GET /api/v1/referral/code
Returns user's referral code and stats. Creates code if missing.

**Response:**
```json
{
  "referral_code": "USER-XXXXX",
  "share_url": "https://nuumee.ai/signup?ref=USER-XXXXX",
  "stats": {
    "total_referrals": 5,
    "converted_referrals": 2,
    "total_credits_earned": 50
  }
}
```

### POST /api/v1/referral/apply
Apply a referral code during signup.

**Request:**
```json
{
  "code": "USER-XXXXX"
}
```

**Response:**
```json
{
  "credits_granted": 25,
  "message": "Referral code applied successfully!",
  "referral_code": "USER-XXXXX"
}
```

## Key Files

| File | Purpose |
|------|---------|
| `frontend/app/ref/page.tsx` | Referral link handler (stores code, redirects) |
| `frontend/app/(dashboard)/referral/page.tsx` | Referral dashboard page |
| `frontend/app/(auth)/login/page.tsx` | Applies stored referral code after signup |
| `frontend/lib/api.ts` | `applyReferralCodeWithToken()` function |
| `backend/app/referral/router.py` | All referral API endpoints |
| `backend/app/referral/models.py` | Pydantic models |

## Technical Notes

### Fire-and-Forget with Keepalive
The referral code is applied using `fetch()` with `keepalive: true` to ensure the request completes even when the page navigates away immediately after signup.

```typescript
// frontend/lib/api.ts
fetch(url, {
  method: 'POST',
  keepalive: true,  // Ensures request completes during navigation
  ...
});
```

### Token Handling
The Firebase ID token is obtained synchronously BEFORE navigation to ensure the fetch starts immediately:

```typescript
const token = await userCredential.user.getIdToken();
applyReferralCodeWithToken(storedCode, token);
router.push('/billing/');
```

### Self-Healing Referral Codes
If a user has a referral code in their user document but it's missing from the `referral_codes` collection, the `/referral/code` endpoint auto-creates it.

## Email Notifications

When a referral code is applied, two emails are automatically sent via the Firebase Trigger Email extension:

### Email to New User (referral_bonus_received)
- **Subject:** "Welcome to NuuMee! You received 25 bonus credits"
- **Content:** Welcome message with 50 credit balance info and CTA to create first video

### Email to Referrer (referral_signup_notification)
- **Subject:** "Someone signed up with your referral code!"
- **Content:** Notification that someone signed up, reminder they'll get credits when user creates first video

### `mail` Collection Document
```json
{
  "to": "user@example.com",
  "message": {
    "subject": "Email subject",
    "html": "<div>HTML content</div>"
  },
  "createdAt": "timestamp"
}
```

**Note:** Emails are processed by the `firestore-send-email` Firebase extension using Gmail SMTP (`nuumee@nuumee.ai`).

---

## Bugs Fixed (Dec 2025)

1. **Referral codes not in collection** - User docs had codes but `referral_codes` collection was empty. Fixed by creating collection entries in both `/referral/apply` and `/referral/code`.

2. **Navigation cancelling requests** - Async `getIdToken()` was racing against `router.push()`. Fixed by getting token synchronously before navigation.

3. **404 on code apply** - Backend looked up non-existent codes. Fixed with self-healing in `/referral/code`.
