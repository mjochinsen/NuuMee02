#!/usr/bin/env python3
"""
Notification Hook
Fires when Claude Code sends notifications.

Purpose:
- Log notifications
- Filter noise
- Track important events
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
message = hook_input.get("message", "")
cwd = hook_input.get("cwd", os.getcwd())

# Log the notification
log_dir = os.path.join(cwd, ".claude", "logs")
os.makedirs(log_dir, exist_ok=True)

log_entry = {
    "timestamp": datetime.now().isoformat(),
    "event": "Notification",
    "session_id": session_id,
    "message": message[:500] if message else ""
}

log_file = os.path.join(log_dir, "notifications.jsonl")
with open(log_file, "a") as f:
    f.write(json.dumps(log_entry) + "\n")

# Output (can suppress or modify notification)
output = {}
print(json.dumps(output))
