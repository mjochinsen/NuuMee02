# NuuMee Credentials & Configuration Inventory

**Generated:** 2025-11-27
**Purpose:** Complete inventory of all credentials, configurations, and access information for fresh restart

---

## 1. Firebase Configuration

### Project Details
| Item | Value |
|------|-------|
| Project ID | `wanapi-prod` |
| Project Number | `450296399943` |
| Default Database | `(default)` |

### Firebase Web App (Client-Side)
| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `AIzaSyCncAqZcO0U8U8AbOHpRvmg0yBB4x8YUyc` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `wanapi-prod.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `wanapi-prod` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `wanapi-prod.firebasestorage.app` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `450296399943` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `1:450296399943:web:4fbfba7d54011918bdc962` |

### Firebase Hosting
| Item | Value |
|------|-------|
| Site Name | `wanapi-prod` |
| Firebase URL | `https://wanapi-prod.web.app` |
| Custom Domain | `https://nuumee.ai` |
| Public Directory | `apps/web/out` |

---

## 2. Google Cloud Platform (GCP)

### Project Settings
| Item | Value |
|------|-------|
| Project ID | `wanapi-prod` |
| Project Number | `450296399943` |
| Region | `us-central1` |

### Cloud Run API Service
| Item | Value |
|------|-------|
| Service Name | `nuumee-api` |
| Service URL | `https://nuumee-api-hu7rfrhmka-uc.a.run.app` |
| Service Account | `nuumee-api@wanapi-prod.iam.gserviceaccount.com` |
| Artifact Registry | `us-central1-docker.pkg.dev/wanapi-prod/nuumee-services` |
| Image Name | `us-central1-docker.pkg.dev/wanapi-prod/nuumee-services/nuumee-api:latest` |

### Cloud Run Worker Service
| Item | Value |
|------|-------|
| Service Name | `nuumee-worker` |
| Service Account | `nuumee-worker@wanapi-prod.iam.gserviceaccount.com` (assumed) |

### Cloud Run Configuration
| Setting | Value |
|---------|-------|
| Min Instances | `0` |
| Max Instances | `10` |
| Memory | `1Gi` |
| CPU | `1` |
| Timeout | `300` seconds |
| Concurrency | `80` |

### Cloud Storage Buckets
| Bucket | Purpose |
|--------|---------|
| `nuumee-66a48-inputs` | User uploaded files (default input) |
| `nuumee-66a48-outputs` | Processed video outputs (default output) |
| `nuumee-videos` | Video storage |
| `nuumee-images` | Image storage |
| `wanapi-prod.firebasestorage.app` | Firebase Storage |

### Secret Manager Secrets
| Secret Name | Purpose |
|-------------|---------|
| `firebase-admin-key` | Firebase Admin SDK credentials |
| `stripe-secret-key` | Stripe API secret key |
| `wavespeed-api-key` | WaveSpeed.ai API key |
| `worker-auth-token` | Worker service authentication |

---

## 3. Stripe Configuration

### API Keys
| Environment | Key Type | Value |
|-------------|----------|-------|
| Production (Live) | Publishable | `pk_live_51STYhZ75wY1iQccDqccDSF3ybnO4LNcbzvjy3YMUkztzHQckFSPsDyLYV5Pmqfpx8bIlg3O9dDFYhtAEHfrzQdPC00Pn5sAqIv` |
| Test Mode | Publishable | `pk_test_51STYhZ75wY1iQccDDRavZv2vPLXst1loXKYwN5iGNFxB6iN8RDX54qwuChVWxUZry9Twz3nGnRI16lPJMYfx18k400fcPVNHIw` |
| Secret Key | Location | Stored in GCP Secret Manager: `stripe-secret-key` |

### Webhook Configuration
| Item | Value |
|------|-------|
| Endpoint | `https://nuumee-api-hu7rfrhmka-uc.a.run.app/api/v1/webhook/stripe` |
| Signing Secret | Stored in GCP Secret Manager |

### Credit Package Price IDs (Placeholder)
| Package | Stripe Price ID |
|---------|-----------------|
| Starter (100 credits) | `price_starter_100` |
| Basic (500 credits) | `price_basic_500` |
| Pro (1000 credits) | `price_pro_1000` |
| Studio (2500 credits) | `price_studio_2500` |
| Enterprise (5000 credits) | `price_enterprise_5000` |

### Subscription Price IDs (Placeholder)
| Plan | Stripe Price ID |
|------|-----------------|
| Pro Monthly | `price_pro_monthly` |
| Studio Monthly | `price_studio_monthly` |
| Enterprise Monthly | `price_enterprise_monthly` |

**Note:** These are placeholder IDs in code. Actual Stripe Price IDs need to be created in Stripe Dashboard and configured.

---

## 4. WaveSpeed.ai Configuration

| Item | Value |
|------|-------|
| Base URL | `https://api.wavespeed.ai` |
| API Key | Stored in GCP Secret Manager: `wavespeed-api-key` |
| Timeout | `30` seconds |
| Retry Codes | `429, 502, 503, 504` |

---

## 5. Domain & Hosting

### Custom Domain
| Item | Value |
|------|-------|
| Primary Domain | `nuumee.ai` |
| Firebase URL | `wanapi-prod.web.app` |
| App Name | `NuuMee.AI` |

### DNS/CDN
- Custom domain configured via Firebase Hosting
- CDN cache: `max-age=3600` (1 hour for assets)
- HTML files: `no-cache, no-store, must-revalidate`

---

## 6. OAuth Providers

### Firebase Authentication
Firebase Auth is used with the following providers enabled:
- Email/Password
- Google OAuth
- GitHub OAuth
- Apple OAuth

**Note:** OAuth client IDs are configured in Firebase Console, not in code.
Access at: https://console.firebase.google.com/project/wanapi-prod/authentication/providers

---

## 7. Analytics & Tracking

| Service | ID |
|---------|-------|
| Google Analytics | `G-665HXGSWLB` |
| Google Tag Manager | `GTM-WF8HJMM5` |
| Microsoft Clarity | `ubfootn25x` |

---

## 8. Environment Variables Summary

### Frontend (apps/web/.env.production)
```env
NEXT_PUBLIC_API_URL=https://nuumee-api-hu7rfrhmka-uc.a.run.app
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCncAqZcO0U8U8AbOHpRvmg0yBB4x8YUyc
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=wanapi-prod.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=wanapi-prod
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=wanapi-prod.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=450296399943
NEXT_PUBLIC_FIREBASE_APP_ID=1:450296399943:web:4fbfba7d54011918bdc962
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51STYhZ75wY1iQccDqccDSF3ybnO4LNcbzvjy3YMUkztzHQckFSPsDyLYV5Pmqfpx8bIlg3O9dDFYhtAEHfrzQdPC00Pn5sAqIv
NEXT_PUBLIC_APP_NAME=NuuMee.AI
NEXT_PUBLIC_APP_URL=https://nuumee.ai
NEXT_PUBLIC_GA_ID=G-665HXGSWLB
NEXT_PUBLIC_GTM_ID=GTM-WF8HJMM5
NEXT_PUBLIC_CLARITY_ID=ubfootn25x
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_DEBUG=false
```

### Backend (Cloud Run Environment - from deploy script)
```env
GCP_PROJECT_ID=wanapi-prod
GCP_PROJECT_NUMBER=450296399943
GCP_REGION=us-central1
FIRESTORE_DATABASE_ID=(default)
GCS_BUCKET_VIDEOS=nuumee-videos
GCS_BUCKET_IMAGES=nuumee-images
GCS_SIGNED_URL_EXPIRATION=3600
CORS_ALLOWED_ORIGINS=["http://localhost:3000","https://nuumee.ai"]
RATE_LIMIT_PER_MINUTE=100
RATE_LIMIT_PER_HOUR=1000
LOG_LEVEL=INFO
LOG_FORMAT=json
USE_SECRET_MANAGER=true
```

### Worker Service Environment
```env
WAVESPEED_API_KEY=<from secret manager: wavespeed-api-key>
WAVESPEED_BASE_URL=https://api.wavespeed.ai
WORKER_AUTH_TOKEN=<from secret manager: worker-auth-token>
```

---

## 9. API Endpoints

### Backend API Routes
| Route | Purpose |
|-------|---------|
| `/health` | Health check |
| `/api/v1/user/profile` | User profile CRUD |
| `/api/v1/user/referral-stats` | Referral statistics |
| `/api/v1/credits/balance` | Credit balance |
| `/api/v1/credits/packages` | Available packages |
| `/api/v1/credits/purchase` | Initiate purchase |
| `/api/v1/credits/transactions` | Transaction history |
| `/api/v1/jobs/*` | Job management |
| `/api/v1/upload/*` | File upload |
| `/api/v1/subscription/*` | Subscription management |
| `/api/v1/webhook/stripe` | Stripe webhooks |
| `/api/v1/affiliate/*` | Affiliate program |
| `/api/v1/referral/*` | Referral program |
| `/api/v1/status/*` | Service status |
| `/api/v1/changelog/*` | Changelog |

---

## 10. Firestore Collections

### Active Collections
| Collection | Purpose |
|------------|---------|
| `users` | User profiles |
| `jobs` | Video processing jobs |
| `credit_transactions` | Credit transaction history |
| `referrals` | Referral relationships |
| `signup_bonuses` | Signup bonus records |
| `subscriptions` | Active subscriptions |
| `payments` | Payment records |
| `pending_purchases` | In-progress purchases |
| `uploads` | Upload metadata |
| `webhook_events` | Stripe webhook event log |
| `affiliates` | Affiliate program members |
| `affiliate_clicks` | Affiliate link clicks |
| `affiliate_conversions` | Affiliate conversions |
| `affiliate_payouts` | Affiliate payout requests |
| `incidents` | System incidents |
| `maintenance` | Scheduled maintenance |
| `changelog` | Product changelog |
| `coming_soon` | Upcoming features |

### Firestore Indexes
Defined in: `infra/firestore/firestore.indexes.json`
- Jobs by user and date
- Jobs by status and date
- Credit transactions by user and date
- Referrals by referrer and status
- Affiliate clicks/conversions by affiliate

---

## 11. Business Constants

### Credit System
| Constant | Value |
|----------|-------|
| Credit Value (USD) | $0.10 per credit |
| Signup Bonus | 25 credits |
| Referrer Bonus | 100 credits |
| Referral Minimum Purchase | $10.00 |
| Low Balance Warning | 5 credits |

### Affiliate Program
| Constant | Value |
|----------|-------|
| Commission Rate | 20% |
| Minimum Payout | $100.00 |

### Credit Packages
| Package | Credits | Price | Bonus |
|---------|---------|-------|-------|
| Starter | 100 | $10.00 | 0% |
| Basic | 500 | $45.00 | 10% (+50) |
| Pro | 1000 | $85.00 | 15% (+150) |
| Studio | 2500 | $200.00 | 20% (+500) |
| Enterprise | 5000 | $375.00 | 25% (+1250) |

### Subscription Plans
| Plan | Monthly Price | Credits/Month |
|------|---------------|---------------|
| Pro | $45.00 | 550 |
| Studio | $200.00 | 3000 |
| Enterprise | $375.00 | 6250 |

---

## 12. Deployment Scripts

| Script | Purpose |
|--------|---------|
| `deploy-api.sh` | Deploy backend to Cloud Run |
| `deploy-worker.sh` | Deploy worker to Cloud Run |
| `deploy-frontend.sh` | Deploy frontend to Firebase Hosting |
| `deploy-firestore.sh` | Deploy Firestore rules/indexes |
| `test-deployment.sh` | Test deployed services |

---

## 13. Important URLs

| Resource | URL |
|----------|-----|
| Production Site | https://nuumee.ai |
| Firebase Hosting | https://wanapi-prod.web.app |
| API Base | https://nuumee-api-hu7rfrhmka-uc.a.run.app |
| API Health | https://nuumee-api-hu7rfrhmka-uc.a.run.app/health |
| Firebase Console | https://console.firebase.google.com/project/wanapi-prod |
| GCP Console | https://console.cloud.google.com/home/dashboard?project=wanapi-prod |
| Stripe Dashboard | https://dashboard.stripe.com |

---

## 14. GitHub Repository

| Item | Value |
|------|-------|
| Repository | `mjochinsen/NuuMee` |
| URL | https://github.com/mjochinsen/NuuMee |
| Main Branch | `master` |
| Backup Branch | `backup-2025-11-27-before-restart` |

---

## Notes

1. **Secret Keys**: All sensitive keys (Stripe secret, Firebase admin, WaveSpeed API) are stored in GCP Secret Manager, NOT in code.

2. **Stripe Price IDs**: The price IDs in code are placeholders. Actual Stripe Price IDs must be created in Stripe Dashboard and configured.

3. **OAuth Configuration**: OAuth provider settings (Google, GitHub, Apple) are managed in Firebase Console Authentication settings.

4. **WaveSpeed API**: Requires valid API key to be configured in Secret Manager for video processing to work.

5. **CORS**: Currently configured for `localhost:3000` and `nuumee.ai` only.

---

*This inventory is for internal reference only. Do not share publicly.*
