#!/usr/bin/env python3
"""
PreToolUse Hook
Fires before any tool is executed.

Purpose:
- Auto-approve safe operations
- Block dangerous operations
- Log tool usage intentions
- Validate file paths
- WARN if prime not loaded before domain edits
- WARN if committing without audit
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
tool_name = hook_input.get("tool_name", "")
tool_input = hook_input.get("tool_input", {})
cwd = hook_input.get("cwd", os.getcwd())

# Session state for warnings
state_file = os.path.join(cwd, ".claude", "state", "session.json")
session_state = {"primes_loaded": [], "audit_run": False}
try:
    if os.path.exists(state_file):
        with open(state_file, "r") as f:
            session_state = json.load(f)
except:
    pass

warnings = []

# Project root detection
project_root = cwd
project_name = os.path.basename(project_root)

# Safe paths (within project)
SAFE_PATHS = [
    ".claude/",
    "frontend/",
    "backend/",
    "worker/",
    "docs/",
    "FromFigmaMake/",
]

# Dangerous paths (never allow)
DANGEROUS_PATHS = [
    "~/.ssh",
    "~/.gnupg",
    "~/.aws",
    "/etc/",
    "/usr/",
    "/var/",
    "/tmp/",
    "../",  # Parent traversal
]

# Dangerous commands
DANGEROUS_COMMANDS = [
    "rm -rf /",
    "rm -rf ~",
    "sudo",
    "chmod 777",
    "dd if=",
    "mkfs",
    "> /dev/",
    "passwd",
]

def is_safe_path(path):
    """Check if path is within project and safe."""
    if not path:
        return True

    # Expand home directory
    path = os.path.expanduser(path)

    # Check for dangerous paths
    for dangerous in DANGEROUS_PATHS:
        if dangerous in path:
            return False

    # Check if within project
    abs_path = os.path.abspath(path)
    if not abs_path.startswith(project_root):
        return False

    return True

def is_safe_command(command):
    """Check if bash command is safe."""
    if not command:
        return True

    command_lower = command.lower()
    for dangerous in DANGEROUS_COMMANDS:
        if dangerous.lower() in command_lower:
            return False

    return True

# Decision logic
decision = None  # None = ask user, "allow" = auto-approve, "deny" = block

if tool_name == "Read":
    # Auto-approve reading any file in project
    file_path = tool_input.get("file_path", "")
    if is_safe_path(file_path):
        decision = "allow"

elif tool_name in ["Write", "Edit"]:
    # Auto-approve writes to safe project paths
    file_path = tool_input.get("file_path", "")
    if is_safe_path(file_path):
        # Check for protected files
        protected = [".env", "CREDENTIALS", "secrets", ".ssh", ".gnupg"]
        is_protected = any(p in file_path for p in protected)
        if not is_protected:
            decision = "allow"

        # WARNING: Check if prime is loaded for domain
        primes_loaded = session_state.get("primes_loaded", [])
        if "frontend" in file_path and "frontend" not in primes_loaded:
            warnings.append("WARNING: Editing frontend/ without /prime-frontend loaded.")
        elif "backend" in file_path and "backend" not in primes_loaded:
            warnings.append("WARNING: Editing backend/ without /prime-backend loaded.")

elif tool_name == "Bash":
    command = tool_input.get("command", "")
    if is_safe_command(command):
        # Auto-approve safe commands
        # Commands that are safe (with or without flags)
        safe_commands = ["ls", "cat", "head", "tail", "grep", "find", "pwd",
                        "echo", "pnpm", "npm", "npx", "python", "python3", "node",
                        "tree", "wc", "which", "mkdir", "touch", "curl", "wget",
                        "timeout", "for", "cp", "mv", "rm", "chmod", "date", "sleep",
                        "cd", "gcloud", "firebase", "gsutil"]
        # Git commands (need specific handling)
        safe_git = ["git status", "git log", "git diff", "git add", "git commit",
                   "git push", "git checkout", "git branch", "git fetch", "git pull",
                   "git remote", "git show", "git stash", "git rev-parse", "git mv",
                   "git rm", "git restore", "git reset"]

        cmd_stripped = command.strip()
        cmd_parts = cmd_stripped.split()
        base_cmd = cmd_parts[0] if cmd_parts else ""

        # Handle env var prefixes like PLAYWRIGHT_BASE_URL=... command
        if "=" in base_cmd and not base_cmd.startswith("-"):
            # Extract the actual command after env vars
            for i, part in enumerate(cmd_parts):
                if "=" not in part:
                    base_cmd = part
                    break

        # Check if base command is safe
        if base_cmd in safe_commands:
            decision = "allow"
        # Check if git command is safe
        elif cmd_stripped.startswith("git "):
            if any(cmd_stripped.startswith(g) for g in safe_git):
                decision = "allow"

        # WARNING: Check if committing without audit
        if "git commit" in command:
            audit_run = session_state.get("audit_run", False)
            if not audit_run:
                warnings.append("WARNING: Committing without running /audit quick first.")
    else:
        decision = "deny"

elif tool_name in ["Glob", "Grep"]:
    # Auto-approve search operations
    decision = "allow"

elif tool_name == "Task":
    # Auto-approve spawning sub-agents
    decision = "allow"

elif tool_name in ["WebFetch", "WebSearch"]:
    # Auto-approve web operations
    decision = "allow"

elif tool_name in ["TodoWrite", "SlashCommand"]:
    # Auto-approve utility tools
    decision = "allow"

# Log the decision
log_dir = os.path.join(cwd, ".claude", "logs")
os.makedirs(log_dir, exist_ok=True)

log_entry = {
    "timestamp": datetime.now().isoformat(),
    "event": "PreToolUse",
    "session_id": session_id,
    "tool_name": tool_name,
    "decision": decision or "ask",
    "tool_input_preview": str(tool_input)[:200]
}

log_file = os.path.join(log_dir, "tools.jsonl")
with open(log_file, "a") as f:
    f.write(json.dumps(log_entry) + "\n")

# Output decision and warnings
output = {}
if decision:
    output["decision"] = decision

# Include warnings as user message
if warnings:
    output["message"] = "\n".join(warnings)

print(json.dumps(output))
