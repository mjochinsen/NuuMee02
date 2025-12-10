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
- UPDATE SESSION STATE when primes/audit run
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

# Session state management
STATE_FILE = os.path.join(cwd, ".claude", "state", "session.json")

def load_session_state():
    """Load current session state."""
    try:
        if os.path.exists(STATE_FILE):
            with open(STATE_FILE, "r") as f:
                return json.load(f)
    except:
        pass
    return {"primes_loaded": [], "audit_run": False, "last_updated": None}

def save_session_state(state):
    """Save session state."""
    try:
        os.makedirs(os.path.dirname(STATE_FILE), exist_ok=True)
        state["last_updated"] = datetime.now().isoformat()
        with open(STATE_FILE, "w") as f:
            json.dump(state, f, indent=2)
    except:
        pass

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

# Output dict for feedback to Claude
output = {}

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
    command = tool_input.get("command", "")
    log_entry["command"] = command[:50]

    # DEPLOY PROMPT after git push
    if "git push" in command and "error" not in str(tool_response).lower():
        output["message"] = "✅ Push complete! Deploy to production?\n• `/deploy` - Deploy both backend + frontend\n• `/deploy backend` - Cloud Run only\n• `/deploy frontend` - Firebase only"

    # BUG FIX MEMORY PROMPT
    if any(word in command.lower() for word in ["fix", "patch", "hotfix"]):
        output["message"] = "🐛 Bug fix detected! Consider: `/remember bug: [describe what was fixed and why]`"

elif tool_name == "SlashCommand":
    # CRITICAL: Detect prime and audit commands, update session state
    command = tool_input.get("command", "")
    state = load_session_state()
    state_changed = False

    # Detect prime commands
    if "/prime-frontend" in command:
        if "frontend" not in state["primes_loaded"]:
            state["primes_loaded"].append("frontend")
            state_changed = True
    elif "/prime-backend" in command:
        if "backend" not in state["primes_loaded"]:
            state["primes_loaded"].append("backend")
            state_changed = True
    elif "/prime-bug" in command:
        if "bug" not in state["primes_loaded"]:
            state["primes_loaded"].append("bug")
            state_changed = True
    elif "/prime-feature" in command:
        if "feature" not in state["primes_loaded"]:
            state["primes_loaded"].append("feature")
            state_changed = True

    # Detect audit command
    if "/audit" in command:
        state["audit_run"] = True
        state_changed = True

    if state_changed:
        save_session_state(state)
        log_entry["session_state_updated"] = True

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
    # Suggest memory capture for bug fixes
    if "fix" in response_str or "bug" in response_str:
        output["message"] = f"🐛 Bug fix in {os.path.basename(file_path)}. Consider: `/remember bug: [cause] → [fix]`"

# Output (optional feedback to Claude)
# Note: output dict may have messages from git push, bug fix detection, etc.
print(json.dumps(output))
