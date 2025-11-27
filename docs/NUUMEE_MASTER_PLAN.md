# NuuMee02 — MASTER BUILD PLAN (FOR KODY)

**For:** KODY (Main Claude Code in VS Code on Workstation)
**Repo:** https://github.com/mjochinsen/NuuMee02
**Branch:** master
**GCP Project:** wanapi-prod
**Domain:** nuumee.ai

---

## YOUR ROLE

You are the primary code architect for NuuMee02. 

- Use agents from `.claude/agents/` to delegate work
- Build ONE phase → Test it → Deploy → Confirm → Next phase
- Never skip a phase
- Never generate extra files beyond what's needed

---

## REFERENCE FILES

| File | When to Read |
|------|--------------|
| `CREDENTIALS_INVENTORY.md` | Before any Firebase, Stripe, GCP, or API work |
| `docs/PRICING_STRATEGY.md` | Before payments or credits work |
| `docs/firestore-schema.md` | Before any Firestore work |
| `FromFigmaMake/` | Before any UI work |

---

## CRITICAL RULES

1. **Backend NEVER receives passwords.** Firebase client handles auth, backend only receives ID tokens.
2. **Stripe webhooks run on Cloud Run**, not Firebase Functions.
3. **One phase at a time.** Test before proceeding.
4. **UI comes from Figma.** Check `FromFigmaMake/` before building any page.

---

## AGENT USAGE

Use agents from `.claude/agents/`:

| Agent | Purpose |
|-------|--------|
| `deployment-orchestrator.md` | Coordinates deployments |
| `deployment-validator.md` | Validates deployments work |
| `polish-orchestrator.md` | Runs all QA/polish agents |
| `frontend-dev.md` | React/Next.js implementation |
| `api-builder.md` | FastAPI implementation |
| `seo-meta-tags.md` | SEO optimization |
| `accessibility-auditor.md` | WCAG compliance |
| `performance-optimizer.md` | Bundle and performance |

For agent creation/modification, coordinate with FIBY (Claude Code for agents).

---

## PHASE 0 — FOUNDATION

**Goal:** Clean folder structure, stub files, environment ready

### 0.1 Create Folder Structure

```
NuuMee02/
├── frontend/           # Next.js app
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── public/
│   ├── .env.local
│   └── package.json
├── backend/            # FastAPI app
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   └── config.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env
├── worker/             # Video processing worker (stub)
│   ├── main.py
│   ├── wavespeed.py
│   ├── requirements.txt
│   └── Dockerfile
├── docs/               # (already exists)
├── FromFigmaMake/      # (already exists)
├── .claude/            # (already exists)
├── README.md
├── .gitignore
└── firebase.json
```

### 0.2 Initialize Frontend

```bash
cd frontend
pnpm create next-app@latest . --typescript --tailwind --eslint --app
```

**Note:** Do NOT use `--src-dir`. Keep structure flat.

### 0.3 Initialize Backend

```bash
cd backend
mkdir -p app
touch app/__init__.py app/main.py app/config.py requirements.txt Dockerfile .env
```

### 0.4 Initialize Worker (Stub Only)

```bash
cd worker
touch main.py wavespeed.py requirements.txt Dockerfile
```

Just empty files. No logic yet.

### 0.5 Environment Files

**frontend/.env.local** (from `CREDENTIALS_INVENTORY.md`):
```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCncAQzCOU8U8Ab0HpRrvmg8yBB4x8YUyc
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=wanapi-prod.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=wanapi-prod
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=wanapi-prod.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=450296399943
NEXT_PUBLIC_FIREBASE_APP_ID=1:450296399943:web:4fbfba7d54a11918bdc962
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51STYhZ75wY1iQccDqccDSF3ybnO4LNcbzvjy3YMUkztzHQckFSPsDyLYV5Pmqfpx8bIlg3O9dDFYhtAEHfrzQdPC00Pn5sAqIv
NEXT_PUBLIC_API_URL=https://PLACEHOLDER
```

**backend/.env** (from `CREDENTIALS_INVENTORY.md`):
```
GOOGLE_CLOUD_PROJECT=wanapi-prod
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
WAVESPEED_API_KEY=xxxxx
```

### 0.6 Firebase Config

**firebase.json** (in project root):
```json
{
  "hosting": {
    "site": "nuumee-66a48",
    "public": "frontend/out",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      { "source": "**", "destination": "/index.html" }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css)",
        "headers": [{ "key": "Cache-Control", "value": "max-age=31536000" }]
      },
      {
        "source": "**/*.html",
        "headers": [{ "key": "Cache-Control", "value": "no-cache, no-store, must-revalidate" }]
      }
    ]
  }
}
```

### 0.7 Commit

```bash
git add -A
git commit -m "Phase 0: Foundation structure"
git push origin master
```

**Phase 0 complete when:** All folders exist, stub files created, environment files ready.

---

## PHASE 1 — AUTHENTICATION

**Goal:** Signup → Login → Logout → Persistent session → User in Firestore

### BACKEND

#### 1.1 Structure

```
backend/app/
├── __init__.py
├── main.py
├── config.py
├── auth/
│   ├── __init__.py
│   ├── router.py
│   ├── firebase.py
│   └── models.py
└── middleware/
    └── auth.py
```

#### 1.2 Endpoints (3 only)

```
POST /auth/register
- Accept: Firebase ID token (client already created user)
- Create Firestore /users/{uid} document:
  - email
  - display_name
  - created_at
  - credits_balance: 25
  - referral_code: generated
  - subscription_tier: "free"
- Return: user profile

POST /auth/login
- Accept: Firebase ID token
- Validate token
- Return: user profile from Firestore

GET /auth/me
- Requires: Firebase ID token in Authorization header
- Return: user profile from Firestore
```

**Remember:** Backend NEVER receives passwords. Only Firebase ID tokens.

#### 1.3 Deploy Backend

```bash
cd backend
gcloud run deploy nuumee-api \
  --source . \
  --region us-central1 \
  --project wanapi-prod \
  --allow-unauthenticated
```

After deploy, update `frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=https://nuumee-api-xxxxxx-uc.a.run.app
```

#### 1.4 Test Backend

```bash
# Health check
curl https://nuumee-api-xxxxxx-uc.a.run.app/health

# Test endpoints with valid Firebase token
```

---

### FRONTEND

#### 1.5 Extract from Figma

Check `FromFigmaMake/` for:
- Login page design
- Signup page design  
- Navbar component

Convert ONLY these to Next.js.

#### 1.6 Structure

```
frontend/
├── app/
│   ├── layout.tsx
│   ├── page.tsx           # Landing (minimal placeholder)
│   ├── login/
│   │   └── page.tsx
│   └── signup/
│       └── page.tsx
├── components/
│   ├── Navbar.tsx
│   └── AuthProvider.tsx
└── lib/
    ├── firebase.ts
    └── api.ts
```

#### 1.7 Auth Flow

1. User enters email/password on signup page
2. Firebase client SDK creates user
3. Get Firebase ID token
4. Send token to backend `/auth/register`
5. Backend creates Firestore user document
6. Store user state in AuthProvider
7. Redirect to dashboard

Login flow:
1. User enters credentials
2. Firebase client authenticates
3. Get Firebase ID token
4. Send token to backend `/auth/login`
5. Backend returns user profile
6. Store in AuthProvider

#### 1.8 Deploy Frontend

```bash
cd frontend
pnpm build
cd ..
firebase deploy --only hosting --project wanapi-prod
```

#### 1.9 Test End-to-End

Manual tests:
- [ ] https://nuumee.ai/signup works
- [ ] Account created in Firebase Auth
- [ ] User document created in Firestore with 25 credits
- [ ] https://nuumee.ai/login works
- [ ] Navbar shows user info after login
- [ ] Refresh page - still logged in
- [ ] Logout works

**Use Agent:** `deployment-validator`

#### 1.10 Commit

```bash
git add -A
git commit -m "Phase 1: Authentication complete"
git push origin master
```

**Phase 1 complete when:** All auth tests pass. Do not proceed until 100% working.

---

## PHASE 2 — PAYMENTS (Stripe)

**Goal:** Buy credits, see them in UI

### BACKEND

#### 2.1 Endpoints

```
POST /credits/checkout
- Requires auth
- Accept: package_id
- Create Stripe Checkout session
- Return: checkout_url

POST /webhooks/stripe
- Public endpoint (Stripe only)
- Verify Stripe signature
- Handle: checkout.session.completed
- Update Firestore credits_balance
```

**Note:** Webhook runs on Cloud Run, not Firebase Functions.

### FRONTEND

#### 2.2 Pages

```
frontend/app/
├── pricing/
│   └── page.tsx
└── payment/
    ├── success/
    │   └── page.tsx
    └── cancel/
        └── page.tsx
```

#### 2.3 Test

Use Stripe test card: `4242 4242 4242 4242`

- [ ] Buy credits flow works
- [ ] Webhook fires
- [ ] Credits update in Firestore
- [ ] UI shows new balance

#### 2.4 Commit

```bash
git add -A
git commit -m "Phase 2: Stripe payments complete"
git push origin master
```

---

## PHASE 3 — UPLOADS

**Goal:** Upload reference image + motion video to GCS

### BACKEND

#### 3.1 Endpoint

```
POST /upload/signed-url
- Requires auth
- Accept: file_type, content_type
- Generate GCS signed upload URL
- Return: upload_url, file_path
```

### FRONTEND

#### 3.2 UI

From `FromFigmaMake/`, get upload/create screen design.

Build:
- Drag-and-drop zones
- File previews
- Progress indicators

#### 3.3 Test

- [ ] Image uploads to GCS
- [ ] Video uploads to GCS
- [ ] Files in `gs://bucket/{user_id}/` structure

#### 3.4 Commit

```bash
git add -A
git commit -m "Phase 3: Upload system complete"
git push origin master
```

---

## PHASE 4 — JOB CREATION

**Goal:** Create job, deduct credits

### BACKEND

#### 4.1 Endpoints

```
POST /jobs
- Requires auth
- Check credits sufficient
- Deduct credits (Firestore transaction)
- Create job document
- Return: job_id, status

GET /jobs
- Requires auth
- Return: user's jobs

GET /jobs/{id}
- Requires auth
- Return: job details
```

### FRONTEND

#### 4.2 UI

- Job form (after uploads)
- Cost calculator
- Submit button
- Job list page

#### 4.3 Test

- [ ] Job creates
- [ ] Credits deducted
- [ ] Job appears in list
- [ ] Insufficient credits shows error

#### 4.4 Commit

```bash
git add -A
git commit -m "Phase 4: Job creation complete"
git push origin master
```

---

## PHASE 5 — WORKER

**Goal:** Generate videos via WaveSpeed

### WORKER

#### 5.1 Implementation

```
worker/
├── main.py         # Cloud Run entry point
├── wavespeed.py    # WaveSpeed API client
├── requirements.txt
└── Dockerfile
```

#### 5.2 Flow

1. Triggered by Cloud Tasks (or Pub/Sub)
2. Fetch job from Firestore
3. Call WaveSpeed API
4. Poll for completion
5. Upload result to GCS
6. Update job status to "completed"
7. Send email notification

#### 5.3 Deploy

```bash
cd worker
gcloud run deploy nuumee-worker \
  --source . \
  --region us-central1 \
  --project wanapi-prod \
  --no-allow-unauthenticated
```

#### 5.4 Test

- [ ] Job processes end-to-end
- [ ] Output in GCS
- [ ] Status updates correctly

#### 5.5 Commit

```bash
git add -A
git commit -m "Phase 5: Worker complete"
git push origin master
```

---

## PHASE 6 — DOWNLOADS

**Goal:** View jobs, download results

### BACKEND

```
GET /jobs/{id}/output
- Requires auth
- Generate signed download URL (7-day expiry)
- Return: download_url
```

### FRONTEND

- Job list with status
- Download button for completed jobs

### Test

- [ ] Completed jobs visible
- [ ] Download works

### Commit

```bash
git add -A
git commit -m "Phase 6: Downloads complete"
git push origin master
```

---

## PHASE 7 — SUBSCRIPTIONS

**Goal:** Monthly subscription tiers

### BACKEND

```
POST /subscriptions/create
POST /subscriptions/cancel
GET /subscriptions/current
```

Webhook handles: `invoice.paid`, `customer.subscription.deleted`

### Test

- [ ] Subscribe works
- [ ] Monthly credits added
- [ ] Cancel stops renewals

### Commit

```bash
git add -A
git commit -m "Phase 7: Subscriptions complete"
git push origin master
```

---

## PHASE 8 — REFERRAL & AFFILIATE

**Goal:** Referral codes, affiliate tracking

### BACKEND

```
GET /referral/code
POST /referral/apply
POST /affiliate/apply
GET /affiliate/stats
POST /affiliate/payout
```

### Test

- [ ] Referral link works
- [ ] New user gets 25 credits
- [ ] Referrer gets 100 credits after purchase

### Commit

```bash
git add -A
git commit -m "Phase 8: Referral and affiliate complete"
git push origin master
```

---

## PHASE 9 — POLISH & LAUNCH

**Goal:** Production-ready quality

### 9.1 Run Polish Agents

**Use:** `polish-orchestrator`

Run sequentially:
1. `seo-meta-tags` - Meta tags, JSON-LD, sitemap.xml, robots.txt
2. `accessibility-auditor` - WCAG 2.1 AA
3. `performance-optimizer` - Dynamic imports, bundle size
4. `responsive-design-validator` - All breakpoints
5. `design-system-consistency` - No hardcoded values
6. `error-boundary-loading-states` - Error handling

### 9.2 SEO Checklist

- [ ] Unique title per page
- [ ] Meta descriptions
- [ ] JSON-LD on public pages
- [ ] sitemap.xml
- [ ] robots.txt
- [ ] Open Graph tags

### 9.3 Final Tests

- [ ] Full user journey works
- [ ] Mobile responsive
- [ ] No console errors
- [ ] Analytics firing

### 9.4 Commit

```bash
git add -A
git commit -m "Phase 9: Launch ready"
git push origin master
```

---

## EXPECTED OUTPUT

| Component | Lines |
|-----------|-------|
| Backend | 2,500 - 3,500 |
| Frontend | 1,500 - 2,000 |
| Worker | 300 - 500 |
| **Total** | **~5,000** |

---

## PHASE TIMING

| Phase | Time |
|-------|------|
| 0 - Foundation | 1 hr |
| 1 - Auth | 4-6 hrs |
| 2 - Payments | 3-4 hrs |
| 3 - Uploads | 2-3 hrs |
| 4 - Jobs | 3-4 hrs |
| 5 - Worker | 4-6 hrs |
| 6 - Downloads | 2-3 hrs |
| 7 - Subscriptions | 3-4 hrs |
| 8 - Referral | 3-4 hrs |
| 9 - Polish | 4-6 hrs |
| **Total** | **~35-45 hrs** |

---

*Build one phase. Test it. Confirm it works. Then next phase.*