#!/usr/bin/env python3
"""
PreCompact Hook
Fires before context compaction (when context is too long).

Purpose:
- Preserve important context
- Log what will be compacted
- Inject critical reminders
"""

import json
import sys
import os
from datetime import datetime

# Read hook input from stdin
try:
    hook_input = json.load(sys.stdin)
except:
    hook_input = {}

session_id = hook_input.get("session_id", "unknown")
cwd = hook_input.get("cwd", os.getcwd())

# Log compaction event
log_dir = os.path.join(cwd, ".claude", "logs")
os.makedirs(log_dir, exist_ok=True)

log_entry = {
    "timestamp": datetime.now().isoformat(),
    "event": "PreCompact",
    "session_id": session_id,
    "message": "Context compaction triggered - preserving critical info"
}

log_file = os.path.join(log_dir, "sessions.jsonl")
with open(log_file, "a") as f:
    f.write(json.dumps(log_entry) + "\n")

# Critical context to preserve during compaction
preserve_context = """
<preserve-during-compaction>
CRITICAL REMINDERS:
1. Read docs/TASK_TRACKER.md for current state
2. Check CREDENTIALS_INVENTORY.md for secrets
3. Use pnpm (not npm)
4. Never logout on 403 errors (only 401)
5. Backend never receives passwords

Current Session Files Changed:
- Check .claude/logs/session_{session_id}_changes.txt

To resume work:
- Read TASK_TRACKER.md
- Find current phase and task
- Continue from there
</preserve-during-compaction>
"""

# Output context to preserve
output = {
    "context": preserve_context.strip()
}

print(json.dumps(output))
