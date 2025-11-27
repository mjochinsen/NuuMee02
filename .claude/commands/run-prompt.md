---
description: Delegate one or more prompts to fresh sub-task contexts with parallel or sequential execution
argument-hint: <prompt-number(s)-or-name> [--parallel|--sequential]
---

# Run Prompt System

Execute one or more prompts from `./prompts/` as delegated sub-tasks with fresh context.

## Usage

**Single prompt:**
- `/run-prompt` - Run the most recently created prompt
- `/run-prompt 5` - Run prompt 005
- `/run-prompt auth` - Run prompt with "auth" in filename

**Multiple prompts:**
- `/run-prompt 5 6 7` - Run prompts 5, 6, 7 sequentially (default)
- `/run-prompt 5 6 7 --parallel` - Run prompts 5, 6, 7 simultaneously
- `/run-prompt 5 6 7 --sequential` - Run prompts 5, 6, 7 one after another

---

## Process

### Step 1: Parse Arguments

Extract from $ARGUMENTS:
- **Prompt identifiers**: Numbers or name fragments (e.g., "5", "auth", "home-page")
- **Execution flag**: `--parallel` or `--sequential`

**Examples:**
- `"5"` → Single prompt: 005
- `"5 6 7"` → Multiple prompts: [005, 006, 007], strategy: sequential (default)
- `"5 6 7 --parallel"` → Multiple prompts: [005, 006, 007], strategy: parallel
- `"auth"` → Search for files containing "auth"
- Empty → Use most recent prompt

---

### Step 2: Resolve Files

For each identifier:

**If empty (no arguments):**
```bash
ls -t ./prompts/*.md 2>/dev/null | grep -v '/completed/' | head -1
```

**If a number (e.g., "5", "042"):**
```bash
ls ./prompts/$(printf "%03d" [number])-*.md 2>/dev/null
```

**If text (e.g., "auth", "home-page"):**
```bash
ls ./prompts/*[text]*.md 2>/dev/null | grep -v '/completed/'
```

**Matching rules:**
- ✅ Exactly one match → Use that file
- ⚠️ Multiple matches → List them, use `AskUserQuestion` to let user choose
- ❌ No matches → Report error, list available prompts with:
  ```bash
  ls ./prompts/*.md 2>/dev/null | grep -v '/completed/'
  ```

---

### Step 3: Execute Prompts

#### Single Prompt Execution

1. Read the complete prompt file content
2. Delegate to sub-agent using `Task` tool:
   - `subagent_type: "general-purpose"`
   - `prompt: [full prompt content]`
   - `description: [3-5 word summary from prompt filename]`
3. Wait for completion
4. Archive prompt:
   ```bash
   mv ./prompts/[NNN]-[name].md ./prompts/completed/[NNN]-[name]-[YYYY-MM-DD].md
   ```
5. Return results summary

---

#### Parallel Execution

**CRITICAL**: All `Task` tool calls MUST be in a **SINGLE MESSAGE** for true parallelism.

1. Read all prompt files
2. In ONE message, invoke multiple Task tools simultaneously
3. Wait for ALL to complete
4. Archive all prompts with timestamp
5. Return consolidated results

**Example structure:**
```
[Read prompt 005]
[Read prompt 006]
[Read prompt 007]

[Invoke Task for 005, Task for 006, Task for 007 in SINGLE message]

[Wait for all results]

[Archive all three prompts]

[Report consolidated results]
```

---

#### Sequential Execution

1. Read first prompt file
2. Invoke Task tool for first prompt
3. **Wait for completion** (do not proceed until done)
4. Archive first prompt
5. Read second prompt file
6. Invoke Task tool for second prompt
7. **Wait for completion**
8. Archive second prompt
9. Repeat for remaining prompts
10. Return consolidated results showing progression

**Key**: Each task must complete before starting the next one.

---

### Step 4: Archive Completed Prompts

After successful execution, move prompts to archive:

```bash
mv ./prompts/[NNN]-[name].md ./prompts/completed/[NNN]-[name]-$(date +%Y-%m-%d).md
```

This preserves history while keeping active prompts directory clean.

---

### Step 5: Report Results

**Single prompt output:**
```
✓ Executed: ./prompts/005-implement-feature.md
✓ Archived to: ./prompts/completed/005-implement-feature-2025-01-18.md

Summary:
[Concise summary of what the sub-agent accomplished]
```

**Parallel execution output:**
```
✓ Executed in PARALLEL (3 tasks):
  • ./prompts/005-implement-auth.md → Success
  • ./prompts/006-implement-api.md → Success
  • ./prompts/007-implement-ui.md → Success

✓ All archived to ./prompts/completed/

Consolidated Results:
- Task 005: [Brief summary]
- Task 006: [Brief summary]
- Task 007: [Brief summary]

All tasks completed successfully in parallel.
```

**Sequential execution output:**
```
✓ Executed SEQUENTIALLY (3 tasks):
  1. ./prompts/005-setup-database.md → Success
  2. ./prompts/006-create-migrations.md → Success
  3. ./prompts/007-seed-data.md → Success

✓ All archived to ./prompts/completed/

Progression:
  Step 1 (005): Set up PostgreSQL database with required tables
  Step 2 (006): Created 12 migration files for schema
  Step 3 (007): Seeded database with test data (500 records)

All sequential steps completed successfully.
```

---

## Error Handling

**If a prompt file is not found:**
```
❌ Error: Prompt not found

Available prompts:
  001-generate-home-page.md
  002-refactor-auth.md
  003-implement-api.md

Usage: /run-prompt <number|name> [--parallel|--sequential]
```

**If a task fails during sequential execution:**
```
❌ Sequential execution stopped at step 2/5

✓ Completed:
  1. ./prompts/005-setup-database.md → Success

❌ Failed:
  2. ./prompts/006-create-migrations.md → Error: [error message]

⏸️ Not executed:
  3. ./prompts/007-seed-data.md
  4. ./prompts/008-run-tests.md
  5. ./prompts/009-deploy.md

Fix the error in prompt 006 and re-run from that point.
```

**If a task fails during parallel execution:**
```
⚠️ Parallel execution completed with errors (2/3 succeeded)

✓ Success:
  • ./prompts/005-implement-auth.md
  • ./prompts/007-implement-ui.md

❌ Failed:
  • ./prompts/006-implement-api.md → Error: [error message]

Only successful prompts have been archived.
Re-run the failed prompt after fixing: /run-prompt 006
```

---

## Critical Notes

- **For parallel execution**: ALL Task tool calls MUST be in a single message
- **For sequential execution**: Wait for each Task to complete before starting next
- **Archive only after success**: Don't archive failed prompts
- **Provide clear results**: User should know what happened without reading logs
- **Sub-agents are isolated**: Each gets fresh 200k context with zero pollution from main conversation

---

## Context Strategy

By delegating to sub-tasks:
- Main conversation stays lean (orchestration only)
- Each sub-agent has full context budget for implementation
- No context pollution between tasks
- Can iterate on prompts without rebuilding context
- Parallel execution maximizes throughput
- Sequential execution ensures dependencies are respected
