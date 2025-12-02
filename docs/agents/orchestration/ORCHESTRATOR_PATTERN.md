# Orchestrator-Workers Pattern

## Based on Anthropic's "Building Effective Agents"

> "The orchestrator breaks down work, delegates to workers, and
> synthesizes results—valuable for coding and multi-source research."

---

## Pattern Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    KODY (Orchestrator)                      │
│                        model: opus                          │
├─────────────────────────────────────────────────────────────┤
│  1. Receive task from user                                  │
│  2. Decompose into subtasks                                 │
│  3. Delegate to workers (with full contract)                │
│  4. Wait for all workers to complete                        │
│  5. Synthesize results                                      │
│  6. Write files (workers cannot)                            │
│  7. Verify and commit                                       │
└─────────────────────────────────────────────────────────────┘
          │                    │                    │
          ▼                    ▼                    ▼
   ┌──────────┐         ┌──────────┐         ┌──────────┐
   │api-builder│         │frontend  │         │test-     │
   │  sonnet  │         │  -dev    │         │ builder  │
   │          │         │  sonnet  │         │  sonnet  │
   └──────────┘         └──────────┘         └──────────┘
       │                     │                     │
       ▼                     ▼                     ▼
   CODE ONLY             CODE ONLY             CODE ONLY
   (no file writes)      (no file writes)      (no file writes)
```

---

## When to Use

✅ **Use orchestrator-workers when:**
- Task has multiple independent subtasks
- Different expertise needed (backend vs frontend)
- Subtasks can be parallelized
- Complex task requiring decomposition

❌ **Don't use when:**
- Single, straightforward task
- Task can be done in one step
- Simpler prompt chaining would work

---

## KODY Orchestration Flow

### Step 1: Analyze Task
```
Read TASK_TRACKER.md
Identify current phase and task
Determine if task needs decomposition
```

### Step 2: Decompose (if needed)
```
Break into independent subtasks
Identify which worker handles each
Define dependencies between subtasks
```

### Step 3: Delegate with Contract
```
For each subtask:
  Invoke worker with:
  - OBJECTIVE
  - OUTPUT FORMAT
  - TOOLS
  - SOURCES
  - BOUNDARIES
```

### Step 4: Synchronize
```
Wait for all workers to complete
(Synchronous execution - simpler coordination)
```

### Step 5: Synthesize
```
Collect all code outputs
Resolve any conflicts
Write all files
```

### Step 6: Verify
```
Run type-check
Run tests if applicable
/audit quick
```

### Step 7: Commit
```
git add -A
git commit -m "Phase X.Y: [description]"
Update TASK_TRACKER.md
```

---

## Worker Agents (Core Set)

| Worker | Domain | Model |
|--------|--------|-------|
| `api-builder` | FastAPI endpoints | sonnet |
| `frontend-dev` | React/Next.js UI | sonnet |
| `test-builder` | pytest tests | sonnet |
| `deployment-validator` | Verify deployments | haiku |

---

## Parallel vs Sequential

### Parallel (Independent Tasks)
```
Task: Implement referral system

Parallel workers:
- api-builder → backend endpoints (independent)
- frontend-dev → referral page (independent)

KODY waits for both, then writes both files.
```

### Sequential (Dependencies)
```
Task: Add feature with API + UI

Sequential:
1. api-builder → creates endpoint
2. KODY writes file, deploys
3. frontend-dev → consumes endpoint (depends on #1)
4. KODY writes file, deploys
```

---

## Error Handling

From Anthropic:
> "Rather than restarting from the beginning, resume from checkpoints."

### On Worker Failure
```
1. Log the failure
2. Analyze error
3. Retry with clarified prompt (once)
4. If still fails, escalate to user
5. Never proceed to dependent tasks
```

### Checkpointing
```
After each successful subtask:
- Update TASK_TRACKER.md
- Commit changes
- /remember progress

This enables resume from last checkpoint.
```

---

## Context Management

From Anthropic:
> "Summarize completed work phases and store essential information
> in external memory before proceeding to new tasks."

### When Context Gets Large
```
1. Summarize completed work
2. Store in .claude/memory/ via /remember
3. Clear conversation history
4. Load summary into fresh context
```

### External Memory
```
/remember insight: Completed Phase 8 referral backend -
  GET /referral/code, POST /referral/apply working
  [tags: phase8, referral, checkpoint]
```

---

## Model Selection

| Role | Model | Reason |
|------|-------|--------|
| Orchestrator (KODY) | opus | Complex reasoning, decomposition |
| Workers | sonnet | Standard implementation |
| Quick validation | haiku | Fast, cheap checks |

---

## Anti-Patterns

❌ **Don't do this:**
```
- Vague delegation: "implement the feature"
- Missing boundaries: agent goes beyond scope
- No output format: agent tries to write files
- Skipping verification: bugs propagate
- Manual everything: not using workers at all
```

✅ **Do this:**
```
- Specific objectives with clear success criteria
- Explicit boundaries on what NOT to do
- Mandated output format (FILE: path + code block)
- Verification after every synthesis
- Delegate to workers, orchestrate as KODY
```
