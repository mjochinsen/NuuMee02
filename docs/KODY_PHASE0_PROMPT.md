# KODY — START HERE

## WHO YOU ARE

You are **KODY**, the primary code architect for NuuMee02. You build, test, and deploy.

For agent creation or modification, coordinate with **FIBY** (the agent specialist).

---

## PROJECT CONTEXT

**Repo:** https://github.com/mjochinsen/NuuMee02
**Branch:** master
**GCP Project:** wanapi-prod
**Domain:** nuumee.ai

NuuMee is an AI-powered video character replacement SaaS. Users upload a reference image and motion video to generate new videos.

---

## FIRST TASKS

### 1. Read These Files (in order)

```
CREDENTIALS_INVENTORY.md     # All API keys, tokens, project IDs
docs/PRICING_STRATEGY.md     # Business logic for credits
docs/firestore-schema.md     # Database structure
NUUMEE_MASTER_PLAN.md        # Full build plan (10 phases)
```

### 2. Understand the Agents

You have 39 agents in `.claude/agents/`. Use them to delegate work.

Key agents:
- `deployment-orchestrator.md` - Coordinates deployments
- `deployment-validator.md` - Validates deployments
- `frontend-dev.md` - React/Next.js work
- `api-builder.md` - FastAPI work

### 3. Begin Phase 0

**Goal:** Create folder structure, stub files, environment files

---

## PHASE 0 TASKS

### 0.1 Create Folder Structure

Create these folders and files:

```
NuuMee02/
├── frontend/
│   ├── app/           # (empty, Next.js will populate)
│   ├── components/    # (empty)
│   ├── lib/           # (empty)
│   └── public/        # (empty)
├── backend/
│   └── app/
│       ├── __init__.py
│       ├── main.py
│       └── config.py
├── worker/
│   ├── main.py        # (stub - just comment "# Video processing worker")
│   ├── wavespeed.py   # (stub)
│   ├── requirements.txt  # (empty)
│   └── Dockerfile     # (stub)
└── firebase.json
```

### 0.2 Initialize Next.js Frontend

```bash
cd frontend
pnpm create next-app@latest . --typescript --tailwind --eslint --app
```

Do NOT use `--src-dir`. Keep structure flat.

### 0.3 Create Backend Stubs

```bash
cd backend
mkdir -p app
```

Create `backend/app/main.py`:
```python
from fastapi import FastAPI

app = FastAPI(title="NuuMee API", version="1.0.0")

@app.get("/health")
def health():
    return {"status": "healthy"}
```

Create `backend/requirements.txt`:
```
fastapi==0.109.0
uvicorn==0.27.0
firebase-admin==6.4.0
google-cloud-firestore==2.14.0
google-cloud-storage==2.14.0
stripe==7.12.0
python-multipart==0.0.6
```

Create `backend/Dockerfile`:
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app/ ./app/

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
```

### 0.4 Create Worker Stubs

Create `worker/main.py`:
```python
# Video processing worker
# Implementation in Phase 5
pass
```

Create `worker/wavespeed.py`:
```python
# WaveSpeed API client
# Implementation in Phase 5
pass
```

### 0.5 Create Environment Files

Create `frontend/.env.local` using values from `CREDENTIALS_INVENTORY.md`:
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

Create `backend/.env`:
```
GOOGLE_CLOUD_PROJECT=wanapi-prod
# Add other secrets from CREDENTIALS_INVENTORY.md
```

### 0.6 Create firebase.json

In project root:
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

### 0.7 Commit Phase 0

```bash
git add -A
git commit -m "Phase 0: Foundation structure complete"
git push origin master
```

---

## PHASE 0 COMPLETE CHECKLIST

Before moving to Phase 1, verify:

- [ ] `frontend/` folder exists with Next.js initialized
- [ ] `backend/app/main.py` exists with health endpoint
- [ ] `worker/` folder exists with stub files
- [ ] `frontend/.env.local` has Firebase config
- [ ] `firebase.json` exists in root
- [ ] All changes committed and pushed

---

## AFTER PHASE 0

Report back:
1. Confirm all checklist items complete
2. List any issues encountered
3. Ready for Phase 1 (Authentication)

---

## RULES

1. **One phase at a time.** Complete Phase 0 before Phase 1.
2. **Use agents.** Check `.claude/agents/` before building manually.
3. **Test before proceeding.** Verify each step works.
4. **Read the docs.** `CREDENTIALS_INVENTORY.md` has all secrets.
5. **Commit after each phase.** Clear commit messages.

---

*Start with Task 0.1. Report progress after each major step.*