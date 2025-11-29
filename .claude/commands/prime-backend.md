# Backend Context Prime

You are working on the **backend** of NuuMee - a FastAPI application on Cloud Run.

## Location
`/backend` - FastAPI Python application

## Tech Stack
- **Framework:** FastAPI
- **Language:** Python 3.11
- **Database:** Firestore (Native Mode)
- **Auth:** Firebase Admin SDK (verify ID tokens)
- **Hosting:** Google Cloud Run
- **Payments:** Stripe

## File Structure
```
backend/
  app/
    __init__.py
    main.py           # FastAPI app, routes
    config.py         # Environment config
    auth/             # Auth routes, middleware
    credits/          # Credit purchase routes
    jobs/             # Job creation routes
    upload/           # GCS signed URLs
    subscriptions/    # Stripe subscriptions
  requirements.txt
  Dockerfile
  .env
```

## Critical Rules

**Backend NEVER receives passwords.**
- Frontend uses Firebase Auth client SDK
- Backend only receives Firebase ID tokens
- Verify tokens with Firebase Admin SDK

**AUTH RULE (Frontend response handling):**
- NEVER sign out user on HTTP 403
- 403 = insufficient permissions → show toast only
- 401 = invalid token → signOut() is correct
- This prevents logout loops seen in early builds

## Auth Pattern
```python
from firebase_admin import auth

def verify_token(token: str) -> dict:
    decoded = auth.verify_id_token(token)
    return decoded  # Contains uid, email, etc.
```

## Firestore Pattern
```python
from google.cloud import firestore
db = firestore.Client()

# Read
doc = db.collection('users').document(uid).get()

# Write (with transaction for credits)
@firestore.transactional
def deduct_credits(transaction, user_ref, amount):
    user = user_ref.get(transaction=transaction)
    new_balance = user.get('credits_balance') - amount
    transaction.update(user_ref, {'credits_balance': new_balance})
```

## API Response Pattern
```python
from fastapi import HTTPException

# Success
return {"success": True, "data": result}

# Error
raise HTTPException(status_code=400, detail="Error message")
```

## Deploy
```bash
gcloud run deploy nuumee-api \
  --source backend/ \
  --region us-central1 \
  --project wanapi-prod \
  --allow-unauthenticated
```

## Key Files to Read
- `docs/firestore-schema.md` - Database structure (35KB)
- `docs/PRICING_STRATEGY.md` - Credit costs, tiers
- `CREDENTIALS_INVENTORY.md` - API keys, secrets

## Testing Endpoints
```bash
# Health check
curl https://[API_URL]/health

# With auth token
curl -H "Authorization: Bearer $TOKEN" https://[API_URL]/auth/me
```
