---
description: "endpoint (optional): Quick API endpoint verification"
---

# Test API Endpoint

Quick verification of NuuMee API endpoints.

**User provided:** `$ARGUMENTS`

## Base URL

```
https://nuumee-api-450296399943.us-central1.run.app
```

## Endpoint Routing

Parse arguments and test accordingly:

### No arguments or `health`:
```bash
curl -s https://nuumee-api-450296399943.us-central1.run.app/health
```
Expected: `{"status":"healthy","service":"nuumee-api"}`

### `pricing` or `cost`:
```bash
curl -s "https://nuumee-api-450296399943.us-central1.run.app/api/v1/jobs/cost?job_type=animate&resolution=480p"
```

### `endpoints` or `all`:
```bash
curl -s https://nuumee-api-450296399943.us-central1.run.app/openapi.json | jq '.paths | keys' 2>/dev/null || \
curl -s https://nuumee-api-450296399943.us-central1.run.app/openapi.json | python3 -c "import sys,json; print('\n'.join(json.load(sys.stdin)['paths'].keys()))"
```

### Custom endpoint (e.g., `/api/v1/credits/packages`):
```bash
curl -s "https://nuumee-api-450296399943.us-central1.run.app$ARGUMENTS"
```

## Output Format

```
## API Test: [endpoint]

**Status:** ✅ 200 OK | ❌ [error code]
**Response time:** Xms
**Response:**
[formatted JSON output]
```

## Common Endpoints

| Endpoint | Auth | Description |
|----------|------|-------------|
| `/health` | No | Health check |
| `/api/v1/jobs/cost` | No | Pricing calculator |
| `/api/v1/credits/packages` | No | Credit packages |
| `/api/v1/auth/me` | Yes | Current user |
| `/openapi.json` | No | API schema |
