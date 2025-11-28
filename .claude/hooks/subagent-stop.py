#!/usr/bin/env python3
"""
SubagentStop Hook
Fires when a sub-agent (spawned via Task tool) finishes.

Purpose:
- Track agent completions
- Log agent results
- Monitor KODY/FIBY interactions
- Performance tracking
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
tool_input = hook_input.get("tool_input", {})
tool_response = hook_input.get("tool_response", "")
cwd = hook_input.get("cwd", os.getcwd())

# Extract agent info
subagent_type = tool_input.get("subagent_type", "unknown")
prompt = tool_input.get("prompt", "")
model = tool_input.get("model", "default")
description = tool_input.get("description", "")

# Log the agent completion
log_dir = os.path.join(cwd, ".claude", "logs")
os.makedirs(log_dir, exist_ok=True)

log_entry = {
    "timestamp": datetime.now().isoformat(),
    "event": "SubagentStop",
    "session_id": session_id,
    "subagent_type": subagent_type,
    "model": model,
    "description": description,
    "prompt_preview": prompt[:200] if prompt else "",
    "response_size": len(str(tool_response)) if tool_response else 0,
    "success": True
}

log_file = os.path.join(log_dir, "agents.jsonl")
with open(log_file, "a") as f:
    f.write(json.dumps(log_entry) + "\n")

# Special tracking for FIBY invocations
if "fiby" in prompt.lower() or "fiby-coordinator" in prompt.lower():
    fiby_log = {
        "timestamp": datetime.now().isoformat(),
        "session_id": session_id,
        "request_type": "fiby",
        "prompt_preview": prompt[:300] if prompt else ""
    }

    fiby_file = os.path.join(log_dir, "fiby_invocations.jsonl")
    with open(fiby_file, "a") as f:
        f.write(json.dumps(fiby_log) + "\n")

# Output
output = {}
print(json.dumps(output))
