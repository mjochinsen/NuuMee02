#!/usr/bin/env python3
"""
UserPromptSubmit Hook
Fires when user submits a prompt, before processing.

Purpose:
- Log user prompts
- Inject project context
- Filter/validate prompts
- Add safety checks
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
prompt = hook_input.get("prompt", "")
cwd = hook_input.get("cwd", os.getcwd())

# Log the prompt
log_dir = os.path.join(cwd, ".claude", "logs")
os.makedirs(log_dir, exist_ok=True)

log_entry = {
    "timestamp": datetime.now().isoformat(),
    "event": "UserPromptSubmit",
    "session_id": session_id,
    "prompt_preview": prompt[:200] if prompt else "",
    "prompt_length": len(prompt) if prompt else 0
}

log_file = os.path.join(log_dir, "prompts.jsonl")
with open(log_file, "a") as f:
    f.write(json.dumps(log_entry) + "\n")

# Context injection for NuuMee project
context_injection = """
<project-context>
Project: NuuMee02 - AI Video Generation SaaS
Stack: Next.js + FastAPI + Firebase + Firestore + Stripe
Key Files: TASK_TRACKER.md (current state), CREDENTIALS_INVENTORY.md (secrets)
Conventions: pnpm (not npm), Tailwind only, TypeScript strict, components < 200 lines
Guardrails: Never modify infra/ without explicit permission, never commit secrets
</project-context>
"""

# Output: Can add context or block prompt
output = {
    "context": context_injection.strip()
}

print(json.dumps(output))
