#!/usr/bin/env python3
"""
SessionEnd Hook
Fires when a Claude Code session ends.

Purpose:
- Finalize session logs
- Generate session summary
- Clean up temporary files
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

# Log session end
log_dir = os.path.join(cwd, ".claude", "logs")
os.makedirs(log_dir, exist_ok=True)

log_entry = {
    "timestamp": datetime.now().isoformat(),
    "event": "SessionEnd",
    "session_id": session_id
}

log_file = os.path.join(log_dir, "sessions.jsonl")
with open(log_file, "a") as f:
    f.write(json.dumps(log_entry) + "\n")

# Generate final session summary
changes_file = os.path.join(log_dir, f"session_{session_id}_changes.txt")
if os.path.exists(changes_file):
    with open(changes_file, "r") as f:
        changes = f.read().strip().split("\n") if f.read().strip() else []

    summary = {
        "timestamp": datetime.now().isoformat(),
        "session_id": session_id,
        "status": "completed",
        "files_modified": len(changes),
        "changes": changes[:20]  # Limit to 20 entries
    }

    summary_file = os.path.join(log_dir, "session_summaries.jsonl")
    with open(summary_file, "a") as f:
        f.write(json.dumps(summary) + "\n")

    # Clean up temp file
    try:
        os.remove(changes_file)
    except:
        pass

# Output
output = {}
print(json.dumps(output))
