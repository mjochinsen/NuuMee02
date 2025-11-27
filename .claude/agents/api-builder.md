---
name: api-builder
description: Implement FastAPI backend from OpenAPI specification. Use when building backend API. Generates route handlers, Firebase Auth middleware, Pydantic validation, Firestore operations, and Stripe integration.
tools: Read, Write, Edit, Bash
model: sonnet
color: green
---

# Purpose

Implement complete FastAPI backend from OpenAPI spec including authentication, database operations, and payment integration.

## Instructions

### 1. Read OpenAPI Specification
- Read `docs/openapi.yaml`
- Extract all endpoints, schemas, and requirements

### 2. Create Project Structure
```
apps/api/
├── main.py              # FastAPI app
├── config.py            # Settings
├── models/              # Pydantic models
├── routes/              # Endpoint handlers
├── services/            # Business logic (Firestore, Storage, Stripe)
├── middleware/          # Auth, error handling
└── requirements.txt
```

### 3. Implement Core Components

**Configuration:**
- Load settings from environment variables
- Firebase, Stripe, GCS configuration

**Authentication:**
- Firebase Auth middleware
- Token verification dependency

**Services:**
- Firestore: CRUD operations for users, jobs, credits
- Storage: GCS upload, signed URLs
- Stripe: Payments, subscriptions
- Credits: Calculation logic

**Routes:**
- Implement all endpoints from OpenAPI spec
- Use Pydantic models for validation
- Apply auth middleware where required
- Return proper status codes

**Error Handling:**
- Global exception handler
- Validation error handler
- Structured error responses

### 4. Verify Implementation
```bash
cd apps/api
pip install -r requirements.txt
mypy . --ignore-missing-imports
uvicorn main:app --reload
```

## Output

Report:
- Files created count
- Endpoints implemented
- Integrations complete (Firebase, Firestore, Stripe)
- Verification status

**Success criteria:** All endpoints from OpenAPI spec implemented with auth, validation, and error handling.
