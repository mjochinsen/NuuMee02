#!/usr/bin/env python3
"""
PostToolUse Hook
Fires after a tool completes successfully.

Purpose:
- Log tool results
- Track file changes
- Monitor performance
- Summarize operations
- Write significant events to agent memory
"""

import json
import sys
import os
import subprocess
from datetime import datetime
from pathlib import Path

# Read hook input from stdin
try:
    hook_input = json.load(sys.stdin)
except:
    hook_input = {}

session_id = hook_input.get("session_id", "unknown")
tool_name = hook_input.get("tool_name", "")
tool_input = hook_input.get("tool_input", {})
tool_response = hook_input.get("tool_response", "")
cwd = hook_input.get("cwd", os.getcwd())

# Memory writer path
MEMORY_WRITER = Path(cwd) / ".claude" / "memory" / "writer.py"

# Calculate response size
response_size = len(str(tool_response)) if tool_response else 0

# Log the result
log_dir = os.path.join(cwd, ".claude", "logs")
os.makedirs(log_dir, exist_ok=True)

log_entry = {
    "timestamp": datetime.now().isoformat(),
    "event": "PostToolUse",
    "session_id": session_id,
    "tool_name": tool_name,
    "success": True,
    "response_size": response_size,
    "tool_input_preview": str(tool_input)[:100]
}

# Track specific tool types
if tool_name == "Write":
    file_path = tool_input.get("file_path", "")
    log_entry["file_created"] = file_path

elif tool_name == "Edit":
    file_path = tool_input.get("file_path", "")
    log_entry["file_edited"] = file_path

elif tool_name == "Task":
    subagent_type = tool_input.get("subagent_type", "")
    log_entry["subagent"] = subagent_type

elif tool_name == "Bash":
    command = tool_input.get("command", "")[:50]
    log_entry["command"] = command

log_file = os.path.join(log_dir, "tools.jsonl")
with open(log_file, "a") as f:
    f.write(json.dumps(log_entry) + "\n")

# Track file modifications for session summary
if tool_name in ["Write", "Edit"]:
    file_path = tool_input.get("file_path", "")
    if file_path:
        changes_file = os.path.join(log_dir, f"session_{session_id}_changes.txt")
        with open(changes_file, "a") as f:
            action = "Created" if tool_name == "Write" else "Modified"
            f.write(f"{action}: {file_path}\n")

# Memory writing for significant events
def write_to_memory(category, content, context="", tags=None):
    """Write to agent memory if writer exists."""
    if not MEMORY_WRITER.exists():
        return
    try:
        cmd = [
            "python3", str(MEMORY_WRITER),
            "-c", category,
            "-m", content[:500],
            "-s", session_id,
        ]
        if context:
            cmd.extend(["-x", context])
        if tags:
            cmd.extend(["-t", ",".join(tags)])
        subprocess.run(cmd, capture_output=True, timeout=2)
    except:
        pass  # Silent fail - don't block tool execution

# Detect significant events for memory
# Bug fixes (if response mentions fix, error, bug)
response_str = str(tool_response).lower()
if tool_name in ["Edit", "Write"] and any(word in response_str for word in ["fix", "bug", "error", "issue"]):
    file_path = tool_input.get("file_path", "unknown")
    # Extract context from file path
    if "auth" in file_path.lower():
        ctx = "auth"
    elif "payment" in file_path.lower() or "stripe" in file_path.lower():
        ctx = "payments"
    elif "video" in file_path.lower():
        ctx = "video"
    else:
        ctx = "general"
    # Don't auto-write bugs - too noisy. Let agents decide.

# Output (optional feedback to Claude)
output = {}
print(json.dumps(output))
