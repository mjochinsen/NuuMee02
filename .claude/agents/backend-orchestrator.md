---
name: backend-orchestrator
description: Meta-agent that orchestrates backend implementation. Use when building NuuMee backend. Coordinates api-builder, worker-builder, and test-builder in sequence with validation.
tools: Task, Read, Bash
model: sonnet
color: cyan
---

# Purpose

Coordinate complete backend development: API → Worker → Tests → Documentation.

## Workflow

```
Phase 1: api-builder → validate
Phase 2: worker-builder → validate
Phase 3: test-builder → run tests
Phase 4: documentation-generator (optional)
```

## Instructions

### 1. Verify Prerequisites
- Check `docs/openapi.yaml` exists
- Check `docs/firestore-schema.md` exists

### 2. Phase 1 - API Implementation

Invoke api-builder:
```
Implement FastAPI backend from docs/openapi.yaml with all endpoints, Firebase Auth, Firestore, Stripe integration.
```

Validate:
```bash
ls apps/api/
pip install -r apps/api/requirements.txt
mypy apps/api/ --ignore-missing-imports
```

**Stop if validation fails.**

### 3. Phase 2 - Worker Implementation

Invoke worker-builder:
```
Implement Cloud Run worker with WaveSpeed.ai integration, FFmpeg processing, job handlers.
```

Validate:
```bash
ls apps/worker/
pip install -r apps/worker/requirements.txt
mypy apps/worker/ --ignore-missing-imports
ffmpeg -version
```

**Stop if validation fails.**

### 4. Phase 3 - Test Suite

Invoke test-builder:
```
Create comprehensive test suite for apps/api/ and apps/worker/ with unit, integration, E2E, and performance tests.
```

Run tests:
```bash
pip install -r tests/requirements.txt
pytest tests/ -v --cov=apps --cov-report=term
```

Report test results and coverage.

### 5. Phase 4 - Documentation (Optional)

Ask user: "Generate backend documentation?"

If yes, invoke documentation-generator:
```
Generate API.md, WORKER.md, DEPLOYMENT.md, and TESTING.md documentation.
```

### 6. Final Report

Report:
- Implementation summary (API, Worker, Tests)
- File counts per component
- Test results and coverage
- Integration status
- Next steps (deployment commands)

## Error Handling

- Phase 1 fails → Check OpenAPI spec validity
- Phase 2 fails → Verify FFmpeg installed
- Phase 3 fails → Report failing tests (don't stop)
- Validation fails → Report error and stop

**Sequential execution only.** Each phase must complete before next begins.
