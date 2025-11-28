# Infrastructure Reference for KODY/CLAUDY

Systems built by FIBY. Use these in your sessions.

---

## CRITICAL: Sub-Agent File Writes Do NOT Persist

**Sub-agents run in sandboxes. Their Write/Edit operations are discarded.**

### The Problem
```python
# WRONG - file will NOT exist after agent returns
Task(subagent_type="frontend-dev", prompt="Create page.tsx")
```

### The Solution
```python
# RIGHT - agent returns code, YOU write it
Task(
    subagent_type="frontend-dev",
    prompt="Generate code for page.tsx. DO NOT write the file. Return the code."
)
# Then YOU use Write tool with the returned code
```

### Sub-Agent Use Cases

| Task | Use Sub-Agent? |
|------|---------------|
| Explore/analyze codebase | YES |
| Generate code snippets | YES (return text, you write) |
| Validate/audit | YES |
| Create/edit files | NO - you must do it |

**Full details:** `.claude/HOW_AGENTS_WORK.md`

---

## Hooks System

9 lifecycle hooks auto-execute during sessions.

### What's Active
- `SessionStart` - Injects project context
- `UserPromptSubmit` - Logs prompts
- `PreToolUse` - Auto-approves safe ops, blocks dangerous
- `PostToolUse` - Logs results, tracks file changes
- `SubagentStop` - Tracks agent completions
- `Stop` - Session summary
- `SessionEnd` - Finalizes logs
- `PreCompact` - Preserves critical context
- `Notification` - Logs notifications

### Auto-Approved (no prompt)
- Read any file
- Write to: `.claude/`, `frontend/`, `backend/`, `worker/`, `docs/`
- Edit: `.md`, `.ts`, `.tsx`, `.py`, `.json`
- Run: `pnpm`, `git`, `ls`, `python`, `node`, `firebase`, `gcloud`

### Blocked
- `sudo`, `rm -rf /`, `chmod 777`, `shutdown`, `kill -9`
- Write to: `~/.ssh/`, `~/.aws/`, `/etc/`

### Logs
`.claude/logs/` - tools.jsonl, prompts.jsonl, agents.jsonl, sessions.jsonl

### Docs
`.claude/HOW_TO_USE_HOOKS.md`

---

## Agent Memory System

Persistent storage for insights across sessions.

### Write to Memory
```
/remember insight: Firebase returns 403 for expired tokens, not 401
/remember bug: Logout loop caused by 403 handling [tags: auth]
/remember decision: Using Firestore for real-time sync [tags: architecture]
```

### Read from Memory
```
/recall auth          # Search memory
/recall --stats       # Memory statistics
/recall bug           # All bug entries
```

### Categories
- `insight` - Discoveries about code/tools
- `pattern` - Recurring structures
- `decision` - Architectural choices (document the "why")
- `bug` - Bug causes and fixes
- `preference` - User/project preferences

### Files
- `.claude/memory/*.jsonl` - Data (gitignored)
- `.claude/memory/writer.py` - Write utility
- `.claude/memory/reader.py` - Read utility
- `.claude/agents/memory-curator.md` - Weekly cleanup agent

---

## Nightly Auditor

Autonomous daily health scan.

### Manual Trigger
```
/audit              # Full scan
/audit quick        # Security + TODOs only
```

### Automatic
GitHub Action runs 6 AM UTC daily.

### Checks
- Security scan (exposed secrets, hardcoded creds)
- TODO/FIXME/HACK count
- Dependency health
- Test file count

### Reports
`.claude/reports/daily/{YYYY-MM-DD}.md`

### Risk Score
- 1-3: Healthy
- 4-6: Minor issues
- 7+: Critical, fix immediately

---

## When to Use

| Situation | Action |
|-----------|--------|
| Learned something useful | `/remember insight: ...` |
| Fixed a tricky bug | `/remember bug: cause was X, fix was Y` |
| Made architecture decision | `/remember decision: chose X because Y` |
| Starting new domain | `/recall {domain}` to see past insights |
| Weekly maintenance | Run `memory-curator` agent |
| Check repo health | `/audit` |

---

## Agent System

40 specialized agents in `.claude/agents/`.

### Key Agents
| Agent | Use For |
|-------|---------|
| `api-builder` | FastAPI endpoints |
| `frontend-dev` | React/Next.js components |
| `deployment-orchestrator` | Firebase deployments |
| `memory-curator` | Weekly memory cleanup |
| `nightly-auditor` | Daily health scan |
| `fiby-coordinator` | Agent creation/auditing (FIBY) |

### Running Custom Agents
```
Task(
    subagent_type="general-purpose",
    prompt="Read .claude/agents/{agent-name}.md and execute it. {task}"
)
```

### Agent Docs
- `.claude/agents/README.md` - Full inventory
- `.claude/HOW_AGENTS_WORK.md` - How to invoke agents
- `docs/FIBY_AGENT_MASTER.md` - FIBY documentation

---

## Full Documentation

| Doc | Contents |
|-----|----------|
| `docs/MEMORY_SYSTEM.md` | Memory system |
| `docs/NIGHTLY_AUDITOR.md` | Auditor system |
| `.claude/HOW_TO_USE_HOOKS.md` | Hooks system |
| `.claude/HOW_AGENTS_WORK.md` | Agent invocation |
| `docs/FIBY_AGENT_MASTER.md` | FIBY meta-agent |
