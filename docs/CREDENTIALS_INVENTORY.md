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

### Cloud Run FFmpeg Worker Service
| Item | Value |
|------|-------|
| Service Name | `nuumee-ffmpeg-worker` |
| Service URL | `https://nuumee-ffmpeg-worker-450296399943.us-central1.run.app` |
| Memory | `2Gi` |
| Timeout | `600` seconds (10 min) |
| Purpose | Subtitle generation (Google STT + ASS) and watermark overlay |
| Cloud Tasks Queue | `nuumee-ffmpeg-jobs` |

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
| Test Mode | Publishable | `pk_test_51STYhmQBPfmhkssaQFPDg7GM76GCXsfZAXsy91ylqsy9Lovah2b2dWF0kAa4EhE9KjGyNhRXOSQPgjl6FZpllQHI00EL8k7MYt` |
| Test Mode | Secret | `sk_test_***` (See GCP Secret Manager) |
| Secret Key | Location | Stored in GCP Secret Manager: `stripe-secret-key` |

**Note:** Test keys created Nov 14, 2024. Secret key last used Nov 22.

### Webhook Configuration (Production)
| Item | Value |
|------|-------|
| Endpoint | `https://nuumee-api-450296399943.us-central1.run.app/api/v1/webhooks/stripe` |
| Signing Secret | Stored in GCP Secret Manager: `stripe-webhook-secret` |

### Test/Sandbox Configuration
| Environment | Key Type | Location |
|-------------|----------|----------|
| Test | Publishable | Frontend .env: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` |
| Test | Secret | GCP Secret Manager: `stripe-secret-key` |

### Test Webhook Configuration (ACTIVE)
| Item | Value |
|------|-------|
| Destination ID | `we_1SYib475wY1iQccD8iUKNqOC` |
| Name | `NuuMee Production Webhook` |
| Endpoint URL | `https://nuumee-api-450296399943.us-central1.run.app/api/v1/webhooks/stripe` |
| Signing Secret | GCP Secret Manager: `stripe-webhook-secret` (version 8) |
| Created | 2025-11-29 |

### Credit Package Price IDs (Placeholder)
| Package | Stripe Price ID |
|---------|-----------------|
| Starter (100 credits) | `price_starter_100` |
| Basic (500 credits) | `price_basic_500` |
| Pro (1000 credits) | `price_pro_1000` |
| Studio (2500 credits) | `price_studio_2500` |
| Enterprise (5000 credits) | `price_enterprise_5000` |

### Subscription Price IDs (Test/Sandbox)
| Plan | Price ID | Product ID | Amount | Credits/Month |
|------|----------|------------|--------|---------------|
| Creator Monthly | `price_1SWSmxQBPfmhkssa6Z8nxFcN` | `prod_TTPcWegVL3MDyq` | $29 | 400 |
| Studio Monthly | `price_1SZ311QBPfmhkssaioh8XeVc` | `prod_TW5BqLj05xoeP2` | $99 | 1,600 |

**Note:** These are TEST/SANDBOX IDs. Production Price IDs need to be created separately in Live mode.

---

## 4. WaveSpeed.ai Configuration

| Item | Value |
|------|-------|
| Base URL | `https://api.wavespeed.ai` |
| API Key | Stored in GCP Secret Manager: `wavespeed-api-key` |
| Timeout | `30` seconds |
| Retry Codes | `429, 502, 503, 504` |

---

## 5. Firebase Extensions

### Trigger Email Extension (firestore-send-email)
| Item | Value |
|------|-------|
| Extension ID | `firestore-send-email` |
| Version | `0.2.4` |
| Service Account | `ext-firestore-send-email@wanapi-prod.iam.gserviceaccount.com` |
| Cloud Functions Location | `us-central1` |
| Firestore Collection | `mail` |
| Default FROM | `NuuMee@NuuMee.ai` |

### SMTP Configuration
| Item | Value |
|------|-------|
| SMTP Provider | Gmail (Google Workspace) |
| SMTP URI | `smtps://nuumee@nuumee.ai@smtp.gmail.com:465` |
| SMTP User | `nuumee@nuumee.ai` |
| SMTP Password | App Password (stored in extension config) |
| Port | `465` (SSL) |

### Email Types Sent
| Email Type | Trigger | Recipient |
|------------|---------|-----------|
| `referral_bonus_received` | New user signs up via referral | New user |
| `referral_signup_notification` | Someone uses referral code | Referrer |

**Note:** Emails are queued to the `mail` Firestore collection. The extension automatically sends them via Gmail SMTP.

---

## 6. Domain & Hosting

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

## 7. OAuth Providers

### Firebase Authentication
Firebase Auth is used with the following providers enabled:
- Email/Password
- Google OAuth
- GitHub OAuth
- Apple OAuth

**Note:** OAuth client IDs are configured in Firebase Console, not in code.
Access at: https://console.firebase.google.com/project/wanapi-prod/authentication/providers

---

## 8. Analytics & Tracking

### GA4 Property Details
| Item | Value |
|------|-------|
| GA4 Property ID | `514341875` |
| Property Name | `wanapi-prod` |
| Measurement ID | `G-GN64HWEKWS` |
| GA4 Stream ID | `13048850413` |
| Stream Name | `NuuMee Frontend App` |
| Account ID | `366511275` |

### Analytics Service Account
| Item | Value |
|------|-------|
| Service Account | `nuumee-analytics@wanapi-prod.iam.gserviceaccount.com` |
| Key Location | `.claude/nuumee-analytics-key.json` |
| GA4 Role | Viewer (can read + manage conversions) |
| Admin Script | `backend/scripts/ga_admin.py` |

### MARKY Quick Start (GA4 Data API)
```bash
# Set credentials (required before any GA4 query)
export GOOGLE_APPLICATION_CREDENTIALS=/home/user/NuuMee02/.claude/nuumee-analytics-key.json

# Example: Get event counts for last 7 days
GOOGLE_CLOUD_PROJECT=wanapi-prod python3 -c "
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import RunReportRequest, DateRange, Dimension, Metric

client = BetaAnalyticsDataClient()
request = RunReportRequest(
    property='properties/514341875',
    dimensions=[Dimension(name='eventName')],
    metrics=[Metric(name='eventCount')],
    date_ranges=[DateRange(start_date='7daysAgo', end_date='today')],
)
response = client.run_report(request)
for row in response.rows:
    print(f'{row.dimension_values[0].value}: {row.metric_values[0].value}')
"
```

**Verified Working:** 2025-12-18 ✅

### Other Tracking
| Service | ID | Notes |
|---------|-------|-------|
| Google Tag Manager | `GTM-WF8HJMM5` | Legacy (not currently used) |
| Microsoft Clarity | `ubfootn25x` | Heatmaps/session recording |

### GA4 Conversion Events Tracked
| Event | Trigger | Data |
|-------|---------|------|
| `sign_up` | New user creates account | method (email/Google/GitHub) |
| `login` | Existing user logs in | method (email/Google/GitHub) |
| `purchase` | Payment success page loads | transaction_id, value, currency, items |

### GA4 Admin Commands (for MARKY)
```bash
/migrate ga_admin.py list_conversions         # List all conversion events
/migrate ga_admin.py create_conversion <name> # Mark event as conversion
/migrate ga_admin.py delete_conversion <id>   # Remove conversion
/migrate ga_admin.py list_audiences           # List audiences
/migrate ga_admin.py list_streams             # List data streams
```

### Analytics Implementation Files
| File | Purpose |
|------|---------|
| `frontend/lib/analytics.ts` | Tracking utility functions |
| `frontend/components/GoogleAnalytics.tsx` | GA4 script loader |
| `frontend/app/layout.tsx` | GoogleAnalytics component inclusion |
| `backend/scripts/ga_admin.py` | GA4 Admin API script |

---

## 9. Environment Variables Summary

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

### Admin Panel
```env
ADMIN_PASSWORD=<secure password for admin panel access>
```
**Note:** Set this environment variable in Cloud Run for the backend service.
The admin panel at `/admin555` requires this password for access.

---

## 10. API Endpoints

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
| `/api/v1/admin/*` | Admin panel endpoints (password protected) |

---

## 11. Firestore Collections

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
| `mail` | Email queue (Trigger Email extension) |
| `referral_codes` | Referral code lookup |
| `promo_codes` | Admin promo codes for credit grants |

### Firestore Indexes
Defined in: `infra/firestore/firestore.indexes.json`
- Jobs by user and date
- Jobs by status and date
- Credit transactions by user and date
- Referrals by referrer and status
- Affiliate clicks/conversions by affiliate

---

## 12. Business Constants

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

## 13. Deployment Commands

Use slash commands for deployment (NOT shell scripts):

| Command | Purpose |
|---------|---------|
| `/deploy` | Deploy both backend and frontend |
| `/deploy backend` | Deploy only FastAPI to Cloud Run |
| `/deploy frontend` | Deploy only Next.js to Firebase Hosting |
| `/deploy --skip-build` | Deploy frontend without rebuilding |

**Old .sh scripts were removed.** Use `/deploy` instead.

---

## 14. Important URLs

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

## 15. GitHub Repository

| Item | Value |
|------|-------|
| Repository | `mjochinsen/NuuMee` |
| URL | https://github.com/mjochinsen/NuuMee |
| Main Branch | `master` |
| Backup Branch | `backup-2025-11-27-before-restart` |

---

## 16. MCP Servers (Claude Code Integrations)

**Config File:** `.mcp.json`

### Active MCP Servers

| Server | Purpose | User |
|--------|---------|------|
| `figma` | Design extraction from Figma files | KODY |
| `github` | PR/issue management, code search | KODY |
| `stripe-test` | Stripe TEST mode - subscriptions, payments | KODY |
| `stripe-live` | Stripe LIVE mode - production payments | KODY |
| `playwright` | E2E testing, browser automation | KODY |
| `apidog` | API documentation, OpenAPI specs | KODY |
| `gcp` | Cloud Run logs, billing, GCP resources | KODY |
| `firebase` | Firestore data, Firebase project management | KODY |
| `google-analytics` | GA4 reports, real-time data, property details | MARKY |

### Tool Naming Convention
```
mcp__{server}__{tool}
```
Examples:
- `mcp__stripe-test__list_subscriptions`
- `mcp__firebase__firestore_query`
- `mcp__google-analytics__get_report`

### Setup Requirements

**Firebase MCP:**
- Requires: `firebase login` (one-time auth)
- Uses: `GOOGLE_CLOUD_PROJECT=wanapi-prod`
- Docs: https://firebase.google.com/docs/ai-assistance/mcp-server

**Google Analytics MCP (Official):**
- Package: `analytics-mcp` (via pipx)
- Service Account: `nuumee-analytics@wanapi-prod.iam.gserviceaccount.com`
- Key File: `.claude/nuumee-analytics-key.json`
- Property ID: `514341875` (wanapi-prod GA4)
- Tools: `get_account_summaries`, `run_report`, `run_realtime_report`, `get_property_details`
- Admin Script: `backend/scripts/ga_admin.py` (for conversions, audiences)

**Google Ads (No API needed):**
- Account: H2Op (Customer ID: `7880123674`)

| Method | Purpose | How |
|--------|---------|-----|
| **Editor** | Create campaigns | MARKY creates CSV → Import in desktop app |
| **Scripts** | Automate existing | MARKY writes JS → Paste in Ads UI |

- Editor Download: https://ads.google.com/intl/en_us/home/tools/ads-editor/
- Scripts URL: https://ads.google.com/aw/bulk/scripts?ocid=7880123674
- Reference: See `docs/MARKY_REFERENCE.md`

**Stripe MCP:**
- Test: Uses `sk_test_*` key
- Live: Needs `sk_live_*` key (replace placeholder in .mcp.json)

### User Assignment

| User | MCP Servers | Purpose |
|------|-------------|---------|
| **KODY** | figma, github, stripe-*, playwright, apidog, gcp, firebase | Code & Infrastructure |
| **MARKY** | google-analytics, stripe-* + Google Ads Scripts | Marketing, Ads & Revenue Analytics |

### MARKY Capabilities (Marketing Automation)

**Google Analytics (Ready ✅):**
- Run custom reports (traffic, conversions, user behavior)
- Real-time visitor monitoring
- Get property details and account summaries
- List Google Ads links

**Google Ads (Ready ✅):**
- **Editor:** Create campaigns via CSV import (bulk creation)
- **Scripts:** Automate existing campaigns (reports, alerts, optimization)
- No API approval needed

**Stripe (Ready ✅):**
- List subscriptions and revenue
- View customer data
- Analyze payment trends

---

## Notes

1. **Secret Keys**: All sensitive keys (Stripe secret, Firebase admin, WaveSpeed API) are stored in GCP Secret Manager, NOT in code.

2. **Stripe Price IDs**: The price IDs in code are placeholders. Actual Stripe Price IDs must be created in Stripe Dashboard and configured.

3. **OAuth Configuration**: OAuth provider settings (Google, GitHub, Apple) are managed in Firebase Console Authentication settings.

4. **WaveSpeed API**: Requires valid API key to be configured in Secret Manager for video processing to work.

5. **CORS**: Currently configured for `localhost:3000` and `nuumee.ai` only.

6. **MCP Servers**: Restart Claude Code after modifying `.mcp.json` for changes to take effect.

---

*This inventory is for internal reference only. Do not share publicly.*
