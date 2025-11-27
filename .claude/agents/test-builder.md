---
name: test-builder
description: Create comprehensive test suite for backend. Use AFTER api-builder and worker-builder. Generates unit tests, integration tests, E2E tests, and mocks with pytest.
tools: Read, Write, Edit, Bash
model: sonnet
color: yellow
---

# Purpose

Create comprehensive test suite for FastAPI backend and worker service using pytest.

## Instructions

### 1. Read Implementation
- Read all files in `apps/api/`
- Read all files in `apps/worker/`
- Identify components to test

### 2. Create Test Structure
```
tests/
├── conftest.py          # Fixtures and config
├── unit/
│   ├── api/            # API endpoint tests
│   └── worker/         # Worker service tests
├── integration/        # API + Firestore tests
├── e2e/               # Full workflow tests
├── performance/       # Load tests
├── mocks/             # Mock external services
└── requirements.txt
```

### 3. Create Test Fixtures
- Mock Firestore client
- Mock WaveSpeed.ai API
- Mock Stripe API
- Mock SendGrid
- Sample user data
- Sample job data

### 4. Write Tests

**Unit Tests:**
- Test each API endpoint (auth, videos, jobs, credits)
- Test worker services (WaveSpeed client, FFmpeg, job manager)
- Test job handlers
- Mock all external dependencies

**Integration Tests:**
- Test API + Firestore workflows
- Test worker + GCS operations
- Test complete job flow

**E2E Tests:**
- Test upload → job creation → processing → completion
- Test payment flow

**Performance Tests:**
- Load test API endpoints
- Concurrent job processing

### 5. Run Tests
```bash
pip install -r tests/requirements.txt
pytest tests/ -v --cov=apps --cov-report=html
```

## Output

Report:
- Total tests created
- Tests by category (unit, integration, E2E, performance)
- Test results (passing/failing)
- Code coverage percentage
- Mocks implemented

**Success criteria:** 80%+ code coverage with all tests passing.
