#!/usr/bin/env python3
"""
Stop Hook
Fires when the main Claude Code agent finishes responding.

Purpose:
- Log session activity summary
- Track task completion
- Generate session report
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
stop_reason = hook_input.get("stop_reason", "")
transcript_path = hook_input.get("transcript_path", "")
cwd = hook_input.get("cwd", os.getcwd())

# Log the stop event
log_dir = os.path.join(cwd, ".claude", "logs")
os.makedirs(log_dir, exist_ok=True)

log_entry = {
    "timestamp": datetime.now().isoformat(),
    "event": "Stop",
    "session_id": session_id,
    "stop_reason": stop_reason,
    "transcript_path": transcript_path
}

log_file = os.path.join(log_dir, "sessions.jsonl")
with open(log_file, "a") as f:
    f.write(json.dumps(log_entry) + "\n")

# Generate session summary if changes were made
changes_file = os.path.join(log_dir, f"session_{session_id}_changes.txt")
if os.path.exists(changes_file):
    with open(changes_file, "r") as f:
        changes = f.read().strip()

    if changes:
        summary_entry = {
            "timestamp": datetime.now().isoformat(),
            "session_id": session_id,
            "files_changed": changes.split("\n")
        }

        summary_file = os.path.join(log_dir, "session_summaries.jsonl")
        with open(summary_file, "a") as f:
            f.write(json.dumps(summary_entry) + "\n")

# Output
output = {}
print(json.dumps(output))
