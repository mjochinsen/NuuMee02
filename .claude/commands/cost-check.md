---
description: GCP billing summary for current month
---

# GCP Cost Check

Get billing summary for the wanapi-prod project.

## Your Task

Use the GCP MCP tools to retrieve billing information.

### Method 1: MCP Tool (preferred)
```
Use mcp__gcp__get-billing-info with projectId="wanapi-prod"
```

### Method 2: gcloud CLI
```bash
# Get current month costs
gcloud billing accounts list --format="table(name,displayName)" 2>/dev/null

# Get project billing info
gcloud billing projects describe wanapi-prod 2>/dev/null
```

### Method 3: Cost forecast
```
Use mcp__gcp__get-cost-forecast with projectId="wanapi-prod" and months=1
```

## Key Services to Monitor

| Service | Typical Cost Driver |
|---------|-------------------|
| Cloud Run | API requests, compute time |
| Cloud Storage | Video file storage |
| Firestore | Document reads/writes |
| Cloud Build | Container builds on deploy |
| Networking | Egress bandwidth |

## Output Format

```
## GCP Costs: wanapi-prod

**Period:** [current month]
**Billing Account:** [account name]

### Cost Breakdown
| Service | Cost |
|---------|------|
| Cloud Run | $X.XX |
| Cloud Storage | $X.XX |
| Firestore | $X.XX |
| Other | $X.XX |
| **Total** | **$X.XX** |

### Forecast
- This month estimate: $X.XX
- Trend: [increasing/stable/decreasing]

### Alerts
- [Any budget alerts or anomalies]
```

## Budget Thresholds

Typical monthly costs for NuuMee:
- **Low traffic:** $5-20/month
- **Medium traffic:** $20-100/month
- **High traffic:** $100-500/month

Flag if costs exceed $100/month unexpectedly.
