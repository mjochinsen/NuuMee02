---
description: "script_name: Run backend migration/utility scripts"
---

# Run Migration Script

Execute backend Python scripts for migrations and utilities.

**User provided:** `$ARGUMENTS`

## Script Location

```
/home/user/NuuMee02/backend/scripts/
```

## Usage

### List available scripts:
```bash
ls -la /home/user/NuuMee02/backend/scripts/*.py 2>/dev/null | awk '{print $NF}' | xargs -n1 basename
```

### Run specific script:
```bash
cd /home/user/NuuMee02/backend && \
GOOGLE_CLOUD_PROJECT=wanapi-prod python3 scripts/$ARGUMENTS 2>&1
```

## Common Scripts

| Script | Purpose |
|--------|---------|
| `seed_email_templates.py` | Seed Firestore email templates |
| `backfill_short_ids.py` | Add short IDs to existing jobs |

## Output Format

```
## Migration: [script_name]

**Status:** [Running/Complete/Failed]
**Output:**
[script output]

**Duration:** X seconds
```

## Safety Notes

- Always runs with `GOOGLE_CLOUD_PROJECT=wanapi-prod`
- Scripts should be idempotent (safe to run multiple times)
- Check script source before running if unfamiliar
- Some scripts may require confirmation for destructive operations
