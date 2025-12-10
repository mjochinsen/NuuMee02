---
description: "message (optional): Enhanced git commit with auto-message"
---

# Enhanced Git Commit

Commit changes with auto-generated message if none provided.

**User provided:** `$ARGUMENTS`

## Workflow

### Step 1: Check status
```bash
cd /home/user/NuuMee02 && git status --short
```

If no changes, report "Nothing to commit" and stop.

### Step 2: Show diff summary
```bash
cd /home/user/NuuMee02 && git diff --stat
```

### Step 3: Generate or use message

**If user provided message:** Use `$ARGUMENTS` as commit message.

**If no message:** Analyze the changes and generate a concise message:
- Look at files changed
- Identify the type: feat/fix/docs/refactor/chore
- Summarize in imperative mood (e.g., "Add user authentication")

### Step 4: Stage and commit
```bash
cd /home/user/NuuMee02 && git add . && git commit -m "[message]"
```

### Step 5: Ask about push
Ask user: "Push to origin? (y/n)"

If yes:
```bash
cd /home/user/NuuMee02 && git push
```

## Output Format

```
## Git Commit

**Files changed:** X files (+Y/-Z lines)

### Changes:
[list of files with status]

**Commit message:**
> [message]

✅ Committed: [short hash]

Push to origin? [waiting for response]
```

## Message Format Guidelines

- Start with type: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`
- Use imperative mood: "Add feature" not "Added feature"
- Keep under 72 characters
- Be specific but concise

## Examples

```
/commit                     # Auto-generate message
/commit fix: resolve login bug
/commit docs: update pricing strategy
```
