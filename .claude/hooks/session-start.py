#!/usr/bin/env python3
"""
SessionStart Hook
Fires when a new Claude Code session starts or resumes.

Purpose:
- Initialize session tracking
- Inject project context
- Set up environment
- Load project state
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

# Log session start
log_dir = os.path.join(cwd, ".claude", "logs")
os.makedirs(log_dir, exist_ok=True)

log_entry = {
    "timestamp": datetime.now().isoformat(),
    "event": "SessionStart",
    "session_id": session_id,
    "cwd": cwd
}

log_file = os.path.join(log_dir, "sessions.jsonl")
with open(log_file, "a") as f:
    f.write(json.dumps(log_entry) + "\n")

# Project context to inject
# Read current phase from TASK_TRACKER if available
current_phase = "Unknown"
current_task = "Unknown"

task_tracker = os.path.join(cwd, "docs", "TASK_TRACKER.md")
if os.path.exists(task_tracker):
    try:
        with open(task_tracker, "r") as f:
            content = f.read()
            # Extract current state
            if "Current Phase:" in content:
                for line in content.split("\n"):
                    if "Current Phase:" in line:
                        current_phase = line.split(":")[-1].strip()
                    if "Current Task:" in line:
                        current_task = line.split(":")[-1].strip()
    except:
        pass

# NuuMee project context
project_context = f"""
<nuumee-context>
Project: NuuMee02 - AI Video Generation SaaS
Current Phase: {current_phase}
Current Task: {current_task}

Tech Stack:
- Frontend: Next.js 14, TypeScript, Tailwind, shadcn/ui
- Backend: FastAPI (Python 3.11), Cloud Run
- Database: Firestore (wanapi-prod)
- Auth: Firebase Auth (client SDK only)
- Payments: Stripe
- Storage: Google Cloud Storage

Key Files:
- docs/TASK_TRACKER.md - Current state (READ FIRST)
- CREDENTIALS_INVENTORY.md - All secrets
- docs/NUUMEE_MASTER_PLAN.md - Full roadmap

Conventions:
- Use pnpm (not npm)
- TypeScript strict mode
- Tailwind only (no CSS files)
- Components < 200 lines
- Plan before implementing

Guardrails:
- NEVER modify infra/ without explicit permission
- NEVER commit secrets or .env files
- NEVER use 403 for logout (use 401 only)
- Backend NEVER receives passwords (Firebase handles auth)
</nuumee-context>
"""

# Output context injection
output = {
    "context": project_context.strip()
}

print(json.dumps(output))
