---
description: "service (optional: api|worker): View recent Cloud Run logs"
---

# Cloud Run Logs

View recent logs from NuuMee Cloud Run services.

**User provided:** `$ARGUMENTS`

## Service Routing

### Default or `api`:
```bash
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=nuumee-api" \
  --project=wanapi-prod \
  --limit=20 \
  --format="table(timestamp,severity,textPayload)" \
  2>&1
```

### `worker`:
```bash
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=nuumee-worker" \
  --project=wanapi-prod \
  --limit=20 \
  --format="table(timestamp,severity,textPayload)" \
  2>&1
```

### `errors` or `error`:
```bash
gcloud logging read "resource.type=cloud_run_revision AND severity>=ERROR" \
  --project=wanapi-prod \
  --limit=20 \
  --format="table(timestamp,resource.labels.service_name,textPayload)" \
  2>&1
```

### `all`:
```bash
gcloud logging read "resource.type=cloud_run_revision" \
  --project=wanapi-prod \
  --limit=30 \
  --format="table(timestamp,resource.labels.service_name,severity,textPayload)" \
  2>&1
```

## Output Format

```
## Cloud Run Logs: [service]

**Project:** wanapi-prod
**Time range:** Last 20 entries

[formatted log table]

---
**Quick filters:**
- `/logs errors` - Show only errors
- `/logs worker` - Worker service only
- `/logs all` - Both services
```

## Tips

- If no logs appear, service may not have recent traffic
- Check GCP Console for more detailed filtering
- Use `--freshness=1h` for time-bounded queries
