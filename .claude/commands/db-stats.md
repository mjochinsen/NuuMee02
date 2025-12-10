---
description: Quick Firestore collection statistics
---

# Firestore Database Stats

Get document counts and stats for Firestore collections.

## Your Task

Query Firestore for collection statistics. Use the GCP MCP tools or direct queries.

### Method 1: Using gcloud (preferred)
```bash
# This requires firebase-admin or gcloud firestore commands
# Note: Firestore doesn't have a direct "count" command, so we use a Python script
cd /home/user/NuuMee02/backend && \
GOOGLE_CLOUD_PROJECT=wanapi-prod python3 -c "
from google.cloud import firestore
db = firestore.Client()

collections = ['users', 'jobs', 'subscriptions', 'affiliates', 'referrals', 'email_templates']
print('Collection Stats (wanapi-prod)')
print('-' * 40)
for col in collections:
    try:
        docs = list(db.collection(col).limit(1000).stream())
        count = len(docs)
        suffix = '+' if count >= 1000 else ''
        print(f'{col}: {count}{suffix}')
    except Exception as e:
        print(f'{col}: Error - {e}')
"
```

### Method 2: Quick sample check
```bash
cd /home/user/NuuMee02/backend && \
GOOGLE_CLOUD_PROJECT=wanapi-prod python3 -c "
from google.cloud import firestore
db = firestore.Client()

# Get recent users
users = list(db.collection('users').order_by('created_at', direction=firestore.Query.DESCENDING).limit(5).stream())
print('Recent Users:')
for u in users:
    d = u.to_dict()
    print(f\"  - {d.get('email', 'N/A')} ({d.get('credits_balance', 0)} credits)\")

# Get recent jobs
jobs = list(db.collection('jobs').order_by('created_at', direction=firestore.Query.DESCENDING).limit(5).stream())
print('\\nRecent Jobs:')
for j in jobs:
    d = j.to_dict()
    print(f\"  - {d.get('status', 'N/A')} | {d.get('job_type', 'N/A')} | {d.get('created_at', 'N/A')}\")
"
```

## Output Format

```
## Firestore Stats (wanapi-prod)

| Collection | Count |
|------------|-------|
| users | X |
| jobs | X |
| subscriptions | X |
| affiliates | X |
| referrals | X |

### Recent Activity
- Latest user: [email] ([time])
- Latest job: [status] ([time])
- Active subscriptions: X
```

## Notes

- Counts are approximate (limited to 1000 per collection)
- Use Firebase Console for exact counts on large collections
- Stats query may take 5-10 seconds
