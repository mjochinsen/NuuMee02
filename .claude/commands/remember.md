---
description: Write a new entry to agent memory
arguments:
  - name: entry
    description: "Format: category: content [tags: tag1,tag2]"
    required: true
---

# Remember - Write to Agent Memory

Store an insight, pattern, decision, bug, or preference in persistent memory.

## Your Task

1. Parse the user's input: `$ARGUMENTS`

   Expected format:
   - `insight: Firebase returns 403 for expired tokens, not 401`
   - `bug: Infinite loop in useEffect missing dependency [tags: react,hooks]`
   - `decision: Chose Firestore for real-time sync [tags: database,architecture]`

2. Extract:
   - **category**: First word before the colon (insight, pattern, decision, bug, preference)
   - **content**: Text after the colon
   - **tags**: Optional, after `[tags: ...]`

3. Determine context from current work (check TASK_TRACKER.md or ask)

4. Write to memory:

```bash
python3 .claude/memory/writer.py \
  --category "{category}" \
  --content "{content}" \
  --context "{context}" \
  --tags "{tags}"
```

5. Confirm to user what was written.

## Examples

```
/remember insight: Firebase Auth returns 403 for expired tokens, not 401
/remember bug: Logout loop caused by treating 403 as auth failure [tags: auth,firebase]
/remember decision: Using pnpm over npm for better monorepo support [tags: tooling]
/remember pattern: All API routes follow /api/{resource}/{action} convention [tags: api,convention]
/remember preference: User prefers concise responses without emojis
```

## Categories

| Category | When to Use |
|----------|-------------|
| insight | You learned something useful about the codebase or tools |
| pattern | You noticed a recurring structure or convention |
| decision | An architectural choice was made (document the "why") |
| bug | A bug was found and fixed (document cause and solution) |
| preference | User expressed a preference for how work should be done |

## Rules

- Max 500 characters per entry
- Be concise but include the "why"
- Duplicates are automatically skipped
- Tags help with future searching
