# Infrastructure Reference for KODY/CLAUDY

Systems built by FIBY. Use these in your sessions.

---

## CRITICAL: Delegation Contract (Anthropic Best Practices)

**Sub-agents run in sandboxes. Their Write/Edit operations are discarded.**

### 5-Element Delegation Contract

Every sub-agent prompt MUST include:

```
OBJECTIVE: [specific goal]

OUTPUT FORMAT:
FILE: {path}
```{language}
{complete code}
```
PURPOSE: {description}

TOOLS: [allowed tools]
DO NOT USE: Write, Edit

SOURCES:
- {file1} - {why}
- {file2} - {why}

BOUNDARIES:
- DO NOT {scope limit 1}
- DO NOT {scope limit 2}
- ONLY {positive constraint}
```

### Why 5 Elements?

From Anthropic's Multi-Agent Research:
> "Each subagent requires an objective, an output format, guidance on
> tools and sources to use, and clear task boundaries. Without detailed
> instructions, agents duplicate work or misinterpret assignments."

### KODY's Post-Delegation Flow

1. **Extract** FILE: path from response
2. **Extract** code block content
3. **Validate** no placeholders ("...", "// rest here")
4. **Write** using Write tool
5. **Verify** file exists
6. **Checkpoint** with /remember

**Full contract:** `docs/agents/orchestration/DELEGATION_CONTRACT.md`

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
`docs/HOW_TO_USE_HOOKS.md`

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
- `docs/HOW_AGENTS_WORK.md` - How to invoke agents + limitations
- `docs/FIBY_AGENT_MASTER.md` - FIBY documentation
- `docs/KODY_AGENT_INSTRUCTIONS.md` - KODY usage guide

---

## Orchestrator-Workers Pattern

KODY acts as orchestrator, delegates to workers.

```
KODY (Orchestrator - opus)
  ├── Decompose task into subtasks
  ├── Delegate to workers (sonnet)
  ├── Wait for completion
  ├── Synthesize results
  └── Write files + verify
```

### Key Pattern
1. Orchestrator decomposes work
2. Workers return code (no file writes)
3. Orchestrator writes all files
4. Checkpoint after each task

**Full pattern:** `docs/agents/orchestration/ORCHESTRATOR_PATTERN.md`

---

## Checkpointing

From Anthropic: "Resume from checkpoints rather than restarting."

### Checkpoint Triggers
- Task completed → update TASK_TRACKER + /remember
- Phase completed → /whats-next + commit
- Context large → summarize + store
- Session ending → /whats-next

### Recovery
1. Read TASK_TRACKER.md
2. /recall {domain}
3. Resume from last task

**Full guide:** `docs/agents/orchestration/CHECKPOINTING.md`

---

## Full Documentation

| Doc | Contents |
|-----|----------|
| `docs/agents/orchestration/DELEGATION_CONTRACT.md` | 5-element delegation |
| `docs/agents/orchestration/ORCHESTRATOR_PATTERN.md` | Orchestrator-workers |
| `docs/agents/orchestration/CHECKPOINTING.md` | Recovery & context |
| `docs/agents/orchestration/systems/PRIME_SYSTEM.md` | Prime commands |
| `docs/MEMORY_SYSTEM.md` | Memory system |
| `docs/NIGHTLY_AUDITOR.md` | Auditor system |
| `docs/HOW_TO_USE_HOOKS.md` | Hooks system |
| `docs/HOW_AGENTS_WORK.md` | Agent limitations |
