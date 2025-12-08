# Firestore Indexes & Security Rules

## Composite Indexes

**File:** `firestore.indexes.json`

```json
{
  "indexes": [
    {
      "collectionGroup": "jobs",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "user_id", "order": "ASCENDING" },
        { "fieldPath": "created_at", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "jobs",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "user_id", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "created_at", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "jobs",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "created_at", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "credit_transactions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "user_id", "order": "ASCENDING" },
        { "fieldPath": "created_at", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "referrals",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "referrer_id", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "affiliate_clicks",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "affiliate_id", "order": "ASCENDING" },
        { "fieldPath": "timestamp", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "affiliate_conversions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "affiliate_id", "order": "ASCENDING" },
        { "fieldPath": "created_at", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "affiliate_payouts",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "affiliate_id", "order": "ASCENDING" },
        { "fieldPath": "requested_at", "order": "DESCENDING" }
      ]
    }
  ]
}
```

---

## Security Rules

**File:** `firestore.rules`

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    function isAdmin() {
      return isAuthenticated() &&
             get(/databases/$(database)/documents/admins/$(request.auth.uid)).data.role == 'admin';
    }

    // Users
    match /users/{userId} {
      allow read: if isOwner(userId) || isAdmin();
      allow create: if isOwner(userId);
      allow update: if isOwner(userId) &&
                      !request.resource.data.diff(resource.data).affectedKeys().hasAny(['credits_balance']);
      allow delete: if isAdmin();
    }

    // Jobs
    match /jobs/{jobId} {
      allow read: if isOwner(resource.data.user_id) || isAdmin();
      allow create: if isAuthenticated();
      allow update: if isAdmin();
      allow delete: if isOwner(resource.data.user_id) || isAdmin();
    }

    // Credit Transactions (read-only for users)
    match /credit_transactions/{transactionId} {
      allow read: if isOwner(resource.data.user_id) || isAdmin();
      allow write: if isAdmin();
    }

    // Subscriptions
    match /subscriptions/{subscriptionId} {
      allow read: if isOwner(resource.data.user_id) || isAdmin();
      allow write: if isAdmin();
    }

    // Referrals
    match /referrals/{referralId} {
      allow read: if isOwner(resource.data.referrer_id) ||
                     isOwner(resource.data.referred_user_id) ||
                     isAdmin();
      allow write: if isAdmin();
    }

    // Referral Codes
    match /referral_codes/{code} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }

    // Affiliates
    match /affiliates/{affiliateId} {
      allow read: if isOwner(resource.data.user_id) || isAdmin();
      allow create: if isAuthenticated();
      allow update: if isAdmin();
      allow delete: if isAdmin();
    }

    // Affiliate Clicks (backend only)
    match /affiliate_clicks/{clickId} {
      allow read: if false;
      allow write: if false;
    }

    // Affiliate Conversions
    match /affiliate_conversions/{conversionId} {
      allow read: if isAuthenticated() &&
                     get(/databases/$(database)/documents/affiliates/$(request.auth.uid)).data.status == 'approved';
      allow write: if isAdmin();
    }

    // Affiliate Payouts
    match /affiliate_payouts/{payoutId} {
      allow read: if isOwner(resource.data.affiliate_id) || isAdmin();
      allow create: if isOwner(resource.data.affiliate_id);
      allow update: if isAdmin();
    }

    // API Keys
    match /api_keys/{keyId} {
      allow read: if isOwner(resource.data.user_id) || isAdmin();
      allow create: if isAuthenticated();
      allow update: if isOwner(resource.data.user_id) || isAdmin();
      allow delete: if isOwner(resource.data.user_id) || isAdmin();
    }

    // Webhooks
    match /webhooks/{webhookId} {
      allow read: if isOwner(resource.data.user_id) || isAdmin();
      allow write: if isOwner(resource.data.user_id) || isAdmin();
    }

    // Payment Methods
    match /payment_methods/{paymentMethodId} {
      allow read: if isOwner(resource.data.user_id) || isAdmin();
      allow write: if isOwner(resource.data.user_id) || isAdmin();
    }

    // System config (admin only)
    match /system/{document=**} {
      allow read: if isAdmin();
      allow write: if isAdmin();
    }
  }
}
```

---

## Deployment

```bash
# Deploy indexes
firebase deploy --only firestore:indexes

# Deploy security rules
firebase deploy --only firestore:rules
```
