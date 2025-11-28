# How Agents Actually Work in NuuMee

---

## CRITICAL LIMITATION: Sub-Agent File Writes Do NOT Persist

**Sub-agents run in isolated sandboxes. Their file writes are discarded.**

| Agent Context | File Writes Persist? |
|---------------|---------------------|
| Main Claude (KODY) | YES |
| Sub-agents via Task() | NO - sandboxed |

### What This Means

When you spawn a sub-agent:
```python
Task(subagent_type="frontend-dev", prompt="Create page.tsx")
```

The sub-agent will:
1. Report "file created successfully"
2. Return a success message
3. **But the file does NOT exist on disk**

### MANDATORY CONTRACTS

#### Sub-Agent Contract (when generating code)

Sub-agents MUST follow this format:

```
DO NOT write or edit files. Instead:

1. Return the exact file path
2. Return the complete content
3. Keep code inside a single fenced code block
4. Keep the response deterministic (no placeholders, no "...")
```

**Example sub-agent response:**

```
FILE: frontend/app/dashboard/page.tsx

\`\`\`tsx
'use client';

import { useState } from 'react';

export default function DashboardPage() {
  return (
    <div className="p-4">
      <h1>Dashboard</h1>
    </div>
  );
}
\`\`\`
```

#### KODY Contract (when receiving code from sub-agent)

When a sub-agent returns file content, KODY MUST:

1. Extract the file path from response
2. Extract the code block content
3. Use `Write` tool to create the file
4. Verify the file exists after writing
5. Log the action

**Example KODY workflow:**

```python
# 1. Spawn sub-agent for code generation
result = Task(
    subagent_type="frontend-dev",
    prompt="""
    Generate code for frontend/app/dashboard/page.tsx

    CONTRACT:
    - DO NOT write the file
    - Return: FILE: {path}
    - Return: Complete code in fenced block
    - No placeholders or "..."
    """
)

# 2. Parse response, extract path and code
# 3. Write file
Write(file_path="frontend/app/dashboard/page.tsx", content=extracted_code)

# 4. Verify
# File now exists on disk
```

### WRONG vs RIGHT

```python
# WRONG - file won't persist
Task(
    subagent_type="frontend-dev",
    prompt="Create frontend/app/dashboard/page.tsx"
)

# RIGHT - explicit contract
Task(
    subagent_type="frontend-dev",
    prompt="""
    Generate code for frontend/app/dashboard/page.tsx

    CONTRACT:
    - DO NOT write the file
    - Return: FILE: {path}
    - Return: Complete code in fenced block
    - No placeholders
    """
)
# Then KODY extracts and writes
```

### When to Use Sub-Agents

| Use Case | Sub-Agent? | Why |
|----------|------------|-----|
| Explore codebase | YES | Read-only |
| Analyze architecture | YES | Read-only |
| Generate code snippets | YES | Returns text, KODY writes |
| Validate/audit | YES | Read-only checks |
| Create files | NO | Writes don't persist |
| Edit existing files | NO | Edits don't persist |
| Run bash commands | MAYBE | Some persist, some don't |

### TL;DR

**Sub-agents = research assistants that return text.**
**KODY = the only one who can write files.**

---

## Agent Types

Claude Code has TWO ways to use agents:

### Method 1: Built-in Registered Agents

These work directly with the Task tool:

```
Task(subagent_type="api-builder", prompt="Build the /auth/register endpoint")
```

**Available built-in types:**
- `general-purpose` - Generic agent for any task
- `Explore` - Fast codebase exploration
- `api-builder` - FastAPI implementation
- `frontend-dev` - React/Next.js implementation
- `workflow-coordinator` - Figma-to-code pipelines
- `deployment-orchestrator` - Firebase deployments
- `subagent-auditor` - Agent file auditing
- ... and others listed in the Task tool description

### Method 2: Custom Agent Files (via general-purpose)

For agents NOT in the built-in list, use `general-purpose` and tell it to read the agent file:

```
Task(
    subagent_type="general-purpose",
    prompt="Read .claude/agents/phase-validator.md and execute it.
            Run the Phase 1 validation suite."
)
```

The spawned Claude will:
1. Read the agent file
2. Follow those instructions
3. Execute the task
4. Report back

---

## KODY's Workflow

### Running a Built-in Agent

KODY says:
```
Use the api-builder agent to implement POST /auth/register
```

KODY's Claude does:
```python
Task(
    subagent_type="api-builder",
    prompt="Implement POST /auth/register endpoint following docs/firestore-schema.md"
)
```

### Running a Custom Agent

KODY says:
```
Run the phase-validator agent for Phase 1
```

KODY's Claude does:
```python
Task(
    subagent_type="general-purpose",
    prompt="""
    Read .claude/agents/phase-validator.md and act as that agent.

    Execute: Phase 1 validation

    Follow the instructions in the agent file exactly.
    Report back with the validation results.
    """
)
```

### Running FIBY

KODY says:
```
Ask FIBY to create an agent for error logging
```

KODY's Claude does:
```python
Task(
    subagent_type="general-purpose",
    model="opus",  # FIBY uses opus for complex reasoning
    prompt="""
    Read .claude/agents/fiby-coordinator.md and act as FIBY.

    FIBY Request:
    - Type: create
    - Query: Create an agent for error logging

    Follow the FIBY workflow exactly.
    Write the new agent to .claude/agents/error-logger.md
    Report back with what was created.
    """
)
```

---

## Quick Reference

| KODY Wants To... | subagent_type | What to Pass |
|------------------|---------------|--------------|
| Build API endpoints | `api-builder` | Endpoint specs |
| Build React components | `frontend-dev` | Component requirements |
| Generate from Figma | `workflow-coordinator` | Frame IDs |
| Deploy to Firebase | `deployment-orchestrator` | Deploy instructions |
| Run custom agent | `general-purpose` | "Read {agent.md} and execute {task}" |
| Ask FIBY | `general-purpose` + opus | "Read fiby-coordinator.md, Type: {x}, Query: {y}" |

---

## Example: Phase 1 Validation

KODY's prompt:
```
Run Phase 1 validation to check if authentication is complete
```

KODY's Claude executes:
```python
Task(
    subagent_type="general-purpose",
    prompt="""
    You are executing the phase-validator agent.

    Read: .claude/agents/phase-validator.md (if it exists)
    Read: docs/TASK_TRACKER.md for Phase 1 tasks

    Validate Phase 1 (Authentication):
    1. Check all Phase 1 tasks are marked complete
    2. Verify backend endpoints exist and respond
    3. Verify frontend pages exist
    4. Test auth flow if possible

    Report:
    - Tasks completed: X/Y
    - Issues found: [list]
    - Phase 1 status: PASS/FAIL
    """
)
```

---

## The Key Insight

**Every `.claude/agents/*.md` file is a prompt template.**

When KODY needs to run it:
1. Spawn a `general-purpose` agent
2. Tell it to read the agent file
3. Tell it what task to execute
4. It becomes that agent by following the instructions

This is how custom agents work in Claude Code.
