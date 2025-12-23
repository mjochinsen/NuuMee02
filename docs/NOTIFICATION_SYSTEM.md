# NuuMee Notification System

## Overview

Simple, scalable notification system using Firebase Trigger Email extension.

**Philosophy:** Inline preference check + direct write to `mail` collection. No background queues.

---

## Architecture

```
Route Handler
     │
     ▼
notify.send("job.completed", user_id, payload)
     │
     ├─→ Fetch user doc (get email + preferences)
     │
     ├─→ Check if user wants this notification
     │
     ├─→ Fetch template from Firestore
     │
     ├─→ Render template with payload
     │
     └─→ Write to `mail` collection
              │
              ▼
     Firebase Trigger Email Extension
              │
              ▼
        Email Delivered
```

---

## Event Types

### Transactional (We Handle)

| Event Type | Preference Key | Description |
|------------|----------------|-------------|
| `account.welcome` | None (always) | New user signup |
| `account.welcome_referral` | None (always) | Signup via referral |
| `job.completed` | `email_on_completion` | Video render finished |
| `job.failed` | `email_on_failure` | Video render failed |
| `job.policy_violation` | None (always) | Video rejected for policy violation |
| `credits.low_warning` | `email_on_low_credits` | Balance < 10 credits |
| `referral.signup` | None (always) | Someone used your code |
| `referral.conversion` | None (always) | Referral made purchase |

### Future: Affiliate Events

| Event Type | Preference Key | Description |
|------------|----------------|-------------|
| `affiliate.approved` | None (always) | Application approved |
| `affiliate.commission` | None (always) | Commission earned |
| `affiliate.payout` | None (always) | Payout sent |

### External Systems (Not Us)

| Type | Handled By |
|------|------------|
| Payment receipts | Stripe |
| Subscription events | Stripe |
| Product updates | Email marketing tool |
| Marketing emails | Email marketing tool |

---

## User Preferences Schema

```python
# In user document
"notifications": {
    "email_on_completion": True,     # Job completed
    "email_on_failure": True,        # Job failed
    "email_on_low_credits": True,    # Low balance warning
    "email_product_updates": True,   # (future: marketing tool)
    "email_marketing": False,        # (future: marketing tool)
    "browser_notifications": True,   # (future: push)
}
```

---

## Firestore Collections

### `email_templates`

```
Document ID: event type (e.g., "job.completed")

{
    "subject": "Your video is ready: {{video_title}}",
    "html": "<html>...</html>",
    "text": "Plain text version...",
    "variables": ["video_title", "download_url", "first_name"],
    "active": true,
    "updated_at": timestamp
}
```

### `mail` (Firebase Extension)

```
{
    "to": "user@example.com",
    "message": {
        "subject": "Your video is ready: My Awesome Video",
        "html": "<html>rendered content</html>",
        "text": "Plain text rendered"
    }
}
```

### `notification_log` (Audit Trail)

```
{
    "user_id": "uid_123",
    "event_type": "job.completed",
    "email": "user@example.com",
    "sent_at": timestamp,
    "mail_doc_id": "mail_abc123",
    "payload": { ... }
}
```

---

## Module Structure

```
backend/app/notifications/
├── __init__.py          # Exports send() function
├── service.py           # Main NotificationService class
├── templates.py         # Template fetching and rendering
├── preferences.py       # Preference checking logic
└── constants.py         # Event types, preference mappings
```

---

## API

### Main Function

```python
from app.notifications import notify

# In route handler:
await notify.send(
    event_type="job.completed",
    user_id="uid_123",
    payload={
        "video_title": "My Video",
        "download_url": "https://...",
        "job_id": "job_456"
    }
)
```

### Returns

```python
NotificationResult(
    sent: bool,
    reason: str,  # "sent" | "preference_disabled" | "template_not_found" | "error"
    mail_doc_id: Optional[str]
)
```

---

## Template Variables by Event

### `account.welcome`
- `first_name`: User's display name or "there"
- `dashboard_url`: Link to dashboard

### `account.welcome_referral`
- `first_name`: User's display name
- `bonus_credits`: Credits received (e.g., 25)
- `dashboard_url`: Link to dashboard

### `job.completed`
- `first_name`: User's display name
- `video_title`: Name of the video
- `download_url`: Signed URL to download
- `expires_in`: Human readable expiry (e.g., "7 days")

### `job.failed`
- `first_name`: User's display name
- `video_title`: Name of the video
- `error_reason`: Why it failed
- `retry_url`: Link to retry
- `support_url`: Link to support

### `job.policy_violation`
- `first_name`: User's display name
- `video_title`: Name of the video
- `violation_type`: Reason for rejection (see table below)
- `dashboard_url`: Link to dashboard
- `support_url`: Link to support

**Violation Type Values:**
| Violation | `violation_type` value |
|-----------|------------------------|
| Nudity | `Nudity or sexually explicit content detected` |
| Minor | `Content involving a minor flagged for review` |
| Violence | `Violent or harmful imagery detected` |
| Illegal | `Content flagged as potentially illegal` |
| Other | `Content violates our community guidelines` |

### `credits.low_warning`
- `first_name`: User's display name
- `current_balance`: Current credit count
- `pricing_url`: Link to buy more

### `referral.signup`
- `first_name`: Referrer's name
- `referred_email`: Masked email (j***@example.com)

### `referral.conversion`
- `first_name`: Referrer's name
- `bonus_credits`: Credits earned
- `new_balance`: Updated credit balance

---

## Error Handling

| Error | Behavior |
|-------|----------|
| User not found | Log warning, return `sent=False` |
| Preference disabled | Return `sent=False, reason="preference_disabled"` |
| Template not found | Log error, return `sent=False, reason="template_not_found"` |
| Mail write fails | Log error, raise exception (caller decides retry) |

---

## Scaling Notes

- **Current:** Direct writes, synchronous preference check
- **10K users:** Still fine, Firestore handles it
- **100K+ users:** Consider adding a queue (Cloud Tasks) between send() and mail write
- **Never:** Don't over-engineer early

---

## Security

- Never log full email addresses (mask: j***@example.com)
- Download URLs should be signed with expiry
- Templates stored in Firestore, not user-editable
- Validate event_type against whitelist
