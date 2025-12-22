# Monitoring Implementation Plan

## Executive Summary

**Problem**: The `/status` page showed "All Systems Operational" while the backend was actually failing (ffmpeg missing). No alerts were sent. Jobs silently failed.

**Root Cause**: Health checks only verify connectivity, not functionality. No dependency checks. No alerting system.

---

## Phase Overview

| Phase | Description | Complexity | Risk | ROI | Time Est. |
|-------|-------------|------------|------|-----|-----------|
| 1 | Startup Dependency Checks | Low | Low | High | 1-2 hours |
| 2 | Enhanced Health Endpoints | Medium | Low | High | 2-3 hours |
| 3 | Error Rate Monitoring | Medium | Low | Medium | 2-3 hours |
| 4 | Email Alerting | Medium | Medium | High | 3-4 hours |
| 5 | Synthetic Canary Tests | High | Medium | Medium | 4-6 hours |
| 6 | Cloud Monitoring Integration | High | Low | High | 4-6 hours |

---

## Phase 1: Startup Dependency Checks ⭐ RECOMMENDED

**Goal**: Fail fast on deployment if critical dependencies are missing.

### Tasks

| # | Task | File | Lines | Complexity |
|---|------|------|-------|------------|
| 1.1 | Add ffmpeg check on backend startup | `backend/app/main.py` | ~10 | Low |
| 1.2 | Add ffmpeg check on worker startup | `worker/main.py` | ~10 | Low |
| 1.3 | Add Firestore index verification | `backend/app/main.py` | ~20 | Medium |
| 1.4 | Log startup checks to Cloud Logging | `backend/app/main.py` | ~5 | Low |

### Assessment

| Metric | Value | Reasoning |
|--------|-------|-----------|
| **Complexity** | ⬤⬤○○○ Low | Simple subprocess calls and try/except |
| **Risk** | ⬤○○○○ Very Low | Fail-fast is safer than silent failures |
| **ROI** | ⬤⬤⬤⬤⬤ Very High | Would have prevented today's outage |
| **Dependencies** | None | Pure Python |

### Code Preview (Task 1.1)

```python
# backend/app/main.py - Add at startup
import subprocess
import sys

def check_ffmpeg():
    """Verify ffmpeg is installed. Fail fast if not."""
    try:
        result = subprocess.run(
            ["ffmpeg", "-version"],
            capture_output=True,
            timeout=5
        )
        if result.returncode != 0:
            raise RuntimeError("ffmpeg returned non-zero exit code")
        logger.info("✓ ffmpeg check passed")
    except FileNotFoundError:
        logger.critical("FATAL: ffmpeg not found in PATH. Container is misconfigured!")
        sys.exit(1)
    except Exception as e:
        logger.critical(f"FATAL: ffmpeg check failed: {e}")
        sys.exit(1)

# Call on startup
check_ffmpeg()
```

---

## Phase 2: Enhanced Health Endpoints ⭐ RECOMMENDED

**Goal**: Deep health checks that test actual functionality, not just connectivity.

### Tasks

| # | Task | File | Lines | Complexity |
|---|------|------|-------|------------|
| 2.1 | Add `/health/deep` endpoint with ffmpeg test | `backend/app/status/router.py` | ~30 | Low |
| 2.2 | Add Firestore query test (uses indexes) | `backend/app/status/router.py` | ~20 | Medium |
| 2.3 | Add GCS upload/download test | `backend/app/status/router.py` | ~25 | Medium |
| 2.4 | Update frontend status page to show deep checks | `frontend/app/(marketing)/status/page.tsx` | ~20 | Low |
| 2.5 | Add worker deep health check | `worker/main.py` | ~30 | Low |

### Assessment

| Metric | Value | Reasoning |
|--------|-------|-----------|
| **Complexity** | ⬤⬤⬤○○ Medium | Multiple services, but straightforward logic |
| **Risk** | ⬤⬤○○○ Low | Read-only tests, no data mutation |
| **ROI** | ⬤⬤⬤⬤⬤ Very High | Accurate status page = user trust |
| **Dependencies** | Phase 1 | Build on startup checks |

### Code Preview (Task 2.1)

```python
@router.get("/deep")
async def deep_health_check():
    """
    Deep health check - tests actual functionality, not just connectivity.
    Use this for monitoring, not for load balancer health checks.
    """
    checks = {}

    # Check ffmpeg
    try:
        result = subprocess.run(["ffmpeg", "-version"], capture_output=True, timeout=5)
        checks["ffmpeg"] = {"status": "ok", "version": result.stdout.decode()[:50]}
    except Exception as e:
        checks["ffmpeg"] = {"status": "error", "error": str(e)}

    # Check Firestore indexes (run actual query)
    try:
        db = firestore.Client()
        # This query requires composite index - will fail if index missing
        query = db.collection("jobs").where("user_id", "==", "__health_check__").order_by("created_at", direction=firestore.Query.DESCENDING).limit(1)
        list(query.stream())  # Execute query
        checks["firestore_indexes"] = {"status": "ok"}
    except Exception as e:
        checks["firestore_indexes"] = {"status": "error", "error": str(e)}

    overall = "healthy" if all(c["status"] == "ok" for c in checks.values()) else "unhealthy"
    return {"status": overall, "checks": checks}
```

---

## Phase 3: Error Rate Monitoring

**Goal**: Track error rates and detect anomalies.

### Tasks

| # | Task | File | Lines | Complexity |
|---|------|------|-------|------------|
| 3.1 | Add error counter metrics | `backend/app/middleware.py` | ~30 | Medium |
| 3.2 | Add job failure rate tracking | `backend/app/jobs/router.py` | ~20 | Low |
| 3.3 | Create `/metrics` endpoint (Prometheus format) | `backend/app/metrics/router.py` | ~50 | Medium |
| 3.4 | Add dashboard widget for error rates | `frontend/app/admin555/` | ~100 | Medium |

### Assessment

| Metric | Value | Reasoning |
|--------|-------|-----------|
| **Complexity** | ⬤⬤⬤○○ Medium | Metrics collection requires careful design |
| **Risk** | ⬤⬤○○○ Low | Read-only, no business logic changes |
| **ROI** | ⬤⬤⬤○○ Medium | Good for trends, but requires dashboard |
| **Dependencies** | None | Can be done independently |

---

## Phase 4: Email Alerting ⭐ RECOMMENDED

**Goal**: Get notified when things break.

### Tasks

| # | Task | File | Lines | Complexity |
|---|------|------|-------|------------|
| 4.1 | Create alert templates in Firestore | `backend/scripts/seed_email_templates.py` | ~30 | Low |
| 4.2 | Add `send_alert()` function | `backend/app/notifications/alerts.py` | ~50 | Medium |
| 4.3 | Alert on job failure with specific errors | `backend/app/internal/completion.py` | ~20 | Low |
| 4.4 | Alert on health check failures | `backend/app/status/router.py` | ~15 | Low |
| 4.5 | Add rate limiting (max 1 alert per error type per hour) | `backend/app/notifications/alerts.py` | ~30 | Medium |
| 4.6 | Configure admin email in environment | `.env` / Secret Manager | ~5 | Low |

### Assessment

| Metric | Value | Reasoning |
|--------|-------|-----------|
| **Complexity** | ⬤⬤⬤○○ Medium | Email sending exists, need alerting logic |
| **Risk** | ⬤⬤⬤○○ Medium | Risk of alert storms if not rate-limited |
| **ROI** | ⬤⬤⬤⬤⬤ Very High | Would have alerted you today |
| **Dependencies** | Email system (exists) | Uses existing SendGrid setup |

### Code Preview (Task 4.2)

```python
# backend/app/notifications/alerts.py
from datetime import datetime, timedelta
from google.cloud import firestore

ALERT_COOLDOWN = timedelta(hours=1)
_last_alerts: dict[str, datetime] = {}

async def send_alert(alert_type: str, title: str, message: str, severity: str = "error"):
    """
    Send alert to admin(s). Rate-limited to prevent storms.

    severity: "info", "warning", "error", "critical"
    """
    # Rate limiting
    now = datetime.utcnow()
    if alert_type in _last_alerts:
        if now - _last_alerts[alert_type] < ALERT_COOLDOWN:
            logger.debug(f"Alert {alert_type} rate-limited")
            return

    _last_alerts[alert_type] = now

    # Send email
    admin_email = os.getenv("ALERT_EMAIL", "mjochinsen@gmail.com")
    await send_email(
        to_email=admin_email,
        template_id="system_alert",
        template_data={
            "title": title,
            "message": message,
            "severity": severity,
            "timestamp": now.isoformat(),
            "environment": os.getenv("ENVIRONMENT", "production")
        }
    )

    # Log to Firestore for history
    db = firestore.Client()
    db.collection("system_alerts").add({
        "type": alert_type,
        "title": title,
        "message": message,
        "severity": severity,
        "created_at": now
    })
```

---

## Phase 5: Synthetic Canary Tests

**Goal**: Proactively detect issues before users do.

### Tasks

| # | Task | File | Lines | Complexity |
|---|------|------|-------|------------|
| 5.1 | Create canary test job (uses test image/video) | `backend/app/internal/canary.py` | ~80 | High |
| 5.2 | Schedule hourly canary via Cloud Scheduler | GCP Console / Terraform | N/A | Medium |
| 5.3 | Track canary success/failure in Firestore | `backend/app/internal/canary.py` | ~30 | Low |
| 5.4 | Alert on canary failure | `backend/app/internal/canary.py` | ~20 | Low |
| 5.5 | Add canary status to admin dashboard | `frontend/app/admin555/` | ~50 | Medium |

### Assessment

| Metric | Value | Reasoning |
|--------|-------|-----------|
| **Complexity** | ⬤⬤⬤⬤○ High | End-to-end test requires careful orchestration |
| **Risk** | ⬤⬤⬤○○ Medium | Uses real resources (credits, storage) |
| **ROI** | ⬤⬤⬤○○ Medium | Good but expensive to maintain |
| **Dependencies** | Phase 4 | Needs alerting system |

---

## Phase 6: Cloud Monitoring Integration

**Goal**: Professional-grade monitoring with GCP native tools.

### Tasks

| # | Task | File | Lines | Complexity |
|---|------|------|-------|------------|
| 6.1 | Create uptime check for API health | GCP Console / Terraform | N/A | Low |
| 6.2 | Create uptime check for deep health | GCP Console / Terraform | N/A | Low |
| 6.3 | Configure alert policy (email on failure) | GCP Console / Terraform | N/A | Medium |
| 6.4 | Add custom metrics (job success rate) | `backend/app/` | ~50 | High |
| 6.5 | Create monitoring dashboard | GCP Console | N/A | Medium |
| 6.6 | Set up PagerDuty/OpsGenie integration | GCP Console | N/A | Medium |

### Assessment

| Metric | Value | Reasoning |
|--------|-------|-----------|
| **Complexity** | ⬤⬤⬤⬤○ High | GCP configuration, IAM, etc. |
| **Risk** | ⬤⬤○○○ Low | GCP manages the infrastructure |
| **ROI** | ⬤⬤⬤⬤○ High | Industry-standard monitoring |
| **Dependencies** | Phase 2 | Needs deep health endpoints |

---

## Decision Matrix

| Phase | Prevents Today's Issue? | Effort | Recommendation |
|-------|------------------------|--------|----------------|
| **1** | ✅ Yes (fail fast) | 1-2h | **DO FIRST** |
| **2** | ✅ Yes (accurate status) | 2-3h | **DO SECOND** |
| **3** | ❌ No (detection only) | 2-3h | Later |
| **4** | ✅ Yes (alerts you) | 3-4h | **DO THIRD** |
| **5** | ✅ Yes (proactive) | 4-6h | Nice to have |
| **6** | ✅ Yes (professional) | 4-6h | Later |

---

## Recommended Implementation Order

### Immediate (Today)
1. **Phase 1**: Startup checks - prevents deployment of broken containers
2. **Phase 2**: Deep health - accurate status page

### This Week
3. **Phase 4**: Email alerting - get notified when things break

### Later (When Scaling)
4. Phase 6: Cloud Monitoring - professional uptime monitoring
5. Phase 3: Error rate metrics - for dashboards
6. Phase 5: Canary tests - proactive detection

---

## Total Effort Estimate

| Scope | Time | Prevents Future Outages? |
|-------|------|-------------------------|
| Phases 1-2 only | 3-5 hours | Partially (better detection) |
| Phases 1-2-4 | 6-9 hours | Yes (detection + alerting) |
| All phases | 16-24 hours | Yes (enterprise-grade) |

---

## Risks of NOT Implementing

1. **User Trust**: Status page lies, users lose confidence
2. **Revenue Loss**: Jobs fail silently, users don't retry, they churn
3. **Debugging Time**: Each incident requires manual log diving
4. **Reputation**: "NuuMee is unreliable" spreads in communities

---

## Next Steps

- [ ] User approves phases to implement
- [ ] Implement Phase 1 (startup checks)
- [ ] Deploy and verify
- [ ] Implement Phase 2 (deep health)
- [ ] Implement Phase 4 (alerting)
- [ ] Document in LESSONS_LEARNED.md
