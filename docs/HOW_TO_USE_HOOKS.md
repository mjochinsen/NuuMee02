# How to Use Claude Code Hooks

## Overview

Hooks are lifecycle events that fire during Claude Code execution. They enable:
- Automatic context injection
- Tool permission management
- Activity logging and monitoring
- Project-specific guardrails
- Sub-agent tracking

---

## Available Hooks

| Hook | When It Fires | Purpose |
|------|---------------|---------|
| `SessionStart` | New chat session begins | Inject project context, initialize logging |
| `UserPromptSubmit` | User sends a message | Log prompts, inject reminders |
| `PreToolUse` | Before any tool executes | Auto-approve safe ops, block dangerous ones |
| `PostToolUse` | After tool completes | Log results, track file changes |
| `SubagentStop` | Sub-agent finishes | Track KODY/FIBY interactions |
| `Stop` | Main agent stops responding | Generate session summary |
| `SessionEnd` | Chat session closes | Finalize logs, cleanup |
| `PreCompact` | Context about to compact | Preserve critical information |
| `Notification` | Claude sends notification | Log notifications |

---

## How Agents Automatically Benefit

### KODY (Code Architect)
- **SessionStart**: Receives current phase/task from TASK_TRACKER.md
- **PreToolUse**: File writes auto-approved within project
- **PostToolUse**: All code changes logged
- **SubagentStop**: FIBY invocations tracked

### FIBY (Agent Master)
- **SubagentStop**: Agent creation events logged
- **PostToolUse**: New agent files tracked

### All Sub-Agents
- **PreToolUse**: Same permission rules apply
- **PostToolUse**: Results logged for debugging

---

## What Triggers Each Hook

| User Action | Hooks Triggered |
|-------------|-----------------|
| Open new chat | `SessionStart` |
| Type and send message | `UserPromptSubmit` |
| Claude reads a file | `PreToolUse` → `PostToolUse` |
| Claude writes a file | `PreToolUse` → `PostToolUse` |
| Claude runs bash command | `PreToolUse` → `PostToolUse` |
| Claude spawns sub-agent | `PreToolUse` → (agent runs) → `SubagentStop` |
| Claude finishes responding | `Stop` |
| Close chat window | `SessionEnd` |
| Context gets too long | `PreCompact` |

---

## Intentional Behaviors

### Auto-Approved Operations (No Prompt)

These execute immediately:
- Read any file in project
- Write to `.claude/`, `frontend/`, `backend/`, `worker/`, `docs/`
- Edit `.md`, `.ts`, `.tsx`, `.py`, `.json` files
- Run: `ls`, `cat`, `grep`, `git status`, `pnpm`, `python`
- Glob and Grep searches
- Spawn sub-agents (Task tool)

### Blocked Operations (Denied)

These are blocked:
- Write to `~/.ssh/`, `~/.aws/`, `/etc/`
- `sudo`, `rm -rf /`, `chmod 777`
- System commands: `shutdown`, `reboot`, `kill -9`

### Ask User (Prompts for Approval)

These require confirmation:
- Writing to CREDENTIALS files
- Unknown bash commands
- Operations outside project

---

## Context Injection

### On Session Start

Every new session receives:
```
Project: NuuMee02 - AI Video Generation SaaS
Current Phase: {from TASK_TRACKER.md}
Current Task: {from TASK_TRACKER.md}
Tech Stack: Next.js + FastAPI + Firebase + Stripe
Key Files: TASK_TRACKER.md, CREDENTIALS_INVENTORY.md
Conventions: pnpm, TypeScript strict, Tailwind only
Guardrails: Never modify infra/, never commit secrets
```

### On Context Compaction

Before compaction, critical reminders preserved:
```
1. Read TASK_TRACKER.md for current state
2. Check CREDENTIALS_INVENTORY.md for secrets
3. Use pnpm (not npm)
4. Never logout on 403 (only 401)
5. Backend never receives passwords
```

---

## Log Files

All logs stored in `.claude/logs/`:

| File | Contents |
|------|----------|
| `prompts.jsonl` | User prompt history |
| `tools.jsonl` | Tool usage (PreToolUse, PostToolUse) |
| `agents.jsonl` | Sub-agent activity |
| `sessions.jsonl` | Session start/stop events |
| `session_summaries.jsonl` | Files changed per session |
| `notifications.jsonl` | Notification events |
| `fiby_invocations.jsonl` | FIBY-specific calls |

### View Recent Activity

```bash
# Last 10 tool uses
tail -10 .claude/logs/tools.jsonl | jq

# Last 5 agent invocations
tail -5 .claude/logs/agents.jsonl | jq

# Today's session summaries
cat .claude/logs/session_summaries.jsonl | jq
```

---

## Usage Patterns

### Pattern 1: Start Fresh Session

```
1. Open new Claude Code chat
2. SessionStart hook injects project context
3. You see current phase/task automatically
4. Start working
```

### Pattern 2: Run Sub-Agent

```
User: "Use api-builder to implement /auth/register"

Hooks:
1. UserPromptSubmit → logged
2. PreToolUse (Task) → auto-approved
3. Sub-agent runs...
4. SubagentStop → logged with agent type
5. PostToolUse → result logged
```

### Pattern 3: Create Files

```
User: "Create the auth router"

Hooks:
1. PreToolUse (Write) → auto-approved (backend/)
2. PostToolUse → file creation logged
3. Session changes file updated
```

### Pattern 4: Dangerous Command Blocked

```
User: "Run sudo apt update"

Hooks:
1. PreToolUse (Bash) → DENIED
2. User sees: "Operation blocked by hooks"
```

---

## Everyday Commands

### View Logs

```bash
# All tool usage today
cat .claude/logs/tools.jsonl | jq 'select(.timestamp | startswith("2025-11-28"))'

# All sub-agents
cat .claude/logs/agents.jsonl | jq

# FIBY invocations
cat .claude/logs/fiby_invocations.jsonl | jq
```

### Clear Logs

```bash
# Clear all logs
rm .claude/logs/*.jsonl

# Clear specific log
rm .claude/logs/tools.jsonl
```

### Check Hook Scripts

```bash
# List all hooks
ls -la .claude/hooks/

# Test a hook manually
echo '{"session_id":"test","tool_name":"Read"}' | python3 .claude/hooks/pre-tool-use.py
```

---

## Troubleshooting

### Hook Not Running

1. Check `.claude/settings.json` has the hook configured
2. Verify Python script exists and is executable
3. Check logs for errors: `.claude/logs/`

### Permission Denied Unexpectedly

1. Check `permissions.deny` in settings.json
2. Check `pre-tool-use.py` DANGEROUS_PATHS list
3. Path may be outside project root

### Context Not Injected

1. Verify `session-start.py` exists
2. Check `docs/TASK_TRACKER.md` exists and is readable
3. Check logs for SessionStart event

---

## Hook Script Reference

| Script | Input (stdin) | Output (stdout) |
|--------|---------------|-----------------|
| `user-prompt-submit.py` | `{prompt, session_id}` | `{context: "..."}` |
| `pre-tool-use.py` | `{tool_name, tool_input}` | `{decision: "allow/deny"}` |
| `post-tool-use.py` | `{tool_name, tool_response}` | `{}` |
| `subagent-stop.py` | `{tool_input, tool_response}` | `{}` |
| `session-start.py` | `{session_id, cwd}` | `{context: "..."}` |
| `session-end.py` | `{session_id}` | `{}` |
| `pre-compact.py` | `{session_id}` | `{context: "..."}` |
| `stop.py` | `{session_id, stop_reason}` | `{}` |
| `notification.py` | `{message}` | `{}` |

---

## NuuMee-Specific Behaviors

### Guardrails Enforced

1. **Never modify outside project** - Parent paths (`../`) blocked
2. **Never write secrets** - SSH, AWS, GnuPG paths blocked
3. **Never run dangerous commands** - sudo, rm -rf, chmod 777 blocked
4. **Always log sub-agents** - KODY/FIBY interactions tracked

### Context Injected

1. **Current phase/task** - From TASK_TRACKER.md
2. **Tech stack reminder** - Next.js, FastAPI, Firebase
3. **Conventions** - pnpm, TypeScript, Tailwind
4. **Known bugs to avoid** - 403/401 auth issue

---

*Hooks are project-local and safe. They only affect this project.*
