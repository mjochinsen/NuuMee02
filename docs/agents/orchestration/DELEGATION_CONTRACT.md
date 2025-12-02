# Sub-Agent Delegation Contract

## Based on Anthropic's Multi-Agent Research System

When KODY delegates to a sub-agent, the prompt MUST include all 5 elements:

---

## Required Elements

### 1. OBJECTIVE
What the agent must accomplish. Be specific.

```
OBJECTIVE: Implement POST /credits/auto-refill endpoint that saves
user's auto-refill preferences to Firestore.
```

### 2. OUTPUT FORMAT
Exact structure of the response. Sub-agents cannot write files.

```
OUTPUT FORMAT:
Return your response in this exact structure:

FILE: {exact file path}
```python
{complete code - no placeholders, no "..."}
```

PURPOSE: {one line description}
```

### 3. TOOLS TO USE
Which tools the agent should use.

```
TOOLS: Read (to examine existing code), Grep (to find patterns)
DO NOT USE: Write, Edit, Bash
```

### 4. SOURCES
Files/APIs the agent should reference.

```
SOURCES:
- backend/app/credits/router.py (existing credit endpoints)
- backend/app/auth/models.py (user model)
- backend/app/subscriptions/router.py (similar pattern)
```

### 5. TASK BOUNDARIES
What NOT to do. Prevents scope creep and duplication.

```
BOUNDARIES:
- DO NOT modify existing endpoints
- DO NOT implement frontend changes
- DO NOT add new dependencies
- ONLY implement the auto-refill settings endpoint
```

---

## Complete Template

```
OBJECTIVE: [specific goal]

OUTPUT FORMAT:
FILE: {path}
```{language}
{complete code}
```
PURPOSE: {description}

TOOLS: [allowed tools]
DO NOT USE: Write, Edit (sub-agents cannot persist files)

SOURCES:
- {file1} - {why}
- {file2} - {why}

BOUNDARIES:
- DO NOT {scope limit 1}
- DO NOT {scope limit 2}
- ONLY {positive constraint}
```

---

## KODY's Responsibilities

After receiving sub-agent response:

1. **Extract** FILE: path from response
2. **Extract** code block content
3. **Validate** code is complete (no placeholders)
4. **Write** file using Write tool
5. **Verify** file exists with Read tool
6. **Log** action with /remember

---

## Why This Matters

From Anthropic's research:
> "Each subagent requires an objective, an output format, guidance on
> the tools and sources to use, and clear task boundaries. Without
> detailed instructions, agents duplicate work or misinterpret
> assignments."

Without clear boundaries, one agent explored 2021 data while others
investigated 2025 - wasting tokens on misaligned work.

---

## Example: api-builder Delegation

```
OBJECTIVE: Add idempotency check to webhook handler to prevent
duplicate subscription creation.

OUTPUT FORMAT:
FILE: backend/app/webhooks/router.py
```python
{full file content}
```
PURPOSE: Webhook handler with idempotency via processed_events collection

TOOLS: Read, Grep
DO NOT USE: Write, Edit

SOURCES:
- backend/app/webhooks/router.py (current handler)
- backend/app/subscriptions/router.py (Firestore patterns)

BOUNDARIES:
- DO NOT modify subscription creation logic
- DO NOT change credit addition amounts
- ONLY add idempotency check at start of handler
- Use event.id as idempotency key
```
