# Agent Memory System

Persistent cognitive layer for Claude Code agents in NuuMee.

## Overview

The memory system stores insights, patterns, decisions, bugs, and preferences that persist across sessions. This becomes the "brain" that agents evolve with over time.

## Architecture

```
.claude/memory/
├── README.md           # Quick reference
├── schema.json         # JSON schema for entries
├── writer.py           # Write utility
├── reader.py           # Read/search utility
├── insights.jsonl      # Discoveries and learnings
├── patterns.jsonl      # Recurring code patterns
├── decisions.jsonl     # Architectural choices
├── bugs.jsonl          # Bug causes and fixes
└── preferences.jsonl   # User/project preferences
```

## Memory Categories

| Category | Purpose | Example |
|----------|---------|---------|
| **insight** | Discoveries about code, tools, or APIs | "Firebase Auth returns 403 for expired tokens, not 401" |
| **pattern** | Recurring structures or conventions | "All API routes follow /api/{resource}/{action}" |
| **decision** | Architectural choices with reasoning | "Chose Firestore over Postgres for real-time sync" |
| **bug** | Bug causes and their fixes | "Infinite loop caused by useEffect missing dependency" |
| **preference** | User or project preferences | "User prefers concise responses, no emojis" |

## Entry Schema

```json
{
  "id": "uuid-v4",
  "timestamp": "2024-11-28T12:00:00Z",
  "category": "insight",
  "context": "phase-1",
  "content": "The actual insight (max 500 chars)",
  "source": "session-id or agent-name",
  "tags": ["auth", "firebase"],
  "hash": "sha256-for-deduplication",
  "score": 5,
  "archived": false
}
```

## Usage

### Writing Memory

**Via slash command:**
```
/remember insight: Firebase Auth returns 403 for expired tokens
/remember bug: Logout loop from treating 403 as auth failure [tags: auth]
/remember decision: Using pnpm for better monorepo support [tags: tooling]
```

**Via Python:**
```bash
python3 .claude/memory/writer.py \
  --category insight \
  --content "Firebase returns 403 for expired tokens" \
  --context "auth" \
  --tags "firebase,auth"
```

### Reading Memory

**Via slash command:**
```
/recall auth          # Search for auth-related entries
/recall --stats       # Show memory statistics
/recall bug           # Show all bug entries
/recall               # Show 10 most recent
```

**Via Python:**
```bash
# Search
python3 .claude/memory/reader.py --search "auth"

# By category
python3 .claude/memory/reader.py --category bug --recent 10

# Statistics
python3 .claude/memory/reader.py --stats
```

### Curating Memory

Run weekly to keep memory clean:

```
Use the memory-curator agent to clean up agent memory.
```

Or:
```bash
# Check stats first
python3 .claude/memory/reader.py --stats

# If >500 entries or duplicates suspected, run curator
```

## Rules

1. **Append-only** - Never delete entries, only archive
2. **Max 500 chars** - Forces conciseness
3. **No duplicates** - SHA-256 hash check before writing
4. **On-demand loading** - Use `/recall`, not auto-loaded every session
5. **Weekly curation** - Run memory-curator to maintain quality

## Integration Points

### Hooks

The `post-tool-use.py` hook has memory integration:
- Detects significant events (bug fixes, architectural changes)
- Can write to memory automatically (currently disabled to prevent noise)

### Agents

Any agent can write to memory:
```python
# In agent workflow
subprocess.run([
    "python3", ".claude/memory/writer.py",
    "-c", "insight",
    "-m", "Discovered that X works better than Y",
    "-t", "performance,optimization"
])
```

### Commands

| Command | Purpose |
|---------|---------|
| `/recall {query}` | Search memory |
| `/remember {entry}` | Write to memory |

## Best Practices

### When to Write

**DO write:**
- Bug causes and solutions (prevents repeat debugging)
- Architectural decisions with reasoning (preserves context)
- User preferences (maintains consistency)
- Discovered patterns (helps future agents)

**DON'T write:**
- Temporary notes (use comments instead)
- Session-specific context (use TASK_TRACKER.md)
- Code snippets (too verbose, use file references)
- Duplicate information (check first)

### Entry Quality

**Good entry:**
```
decision: Chose Firebase Auth over custom JWT because: 1) Built-in session management, 2) Works with Firestore security rules, 3) Handles token refresh automatically [tags: auth,architecture]
```

**Bad entry:**
```
decision: using firebase
```

### Tag Conventions

Use consistent tags:
- **Modules:** `auth`, `payments`, `video`, `api`, `frontend`, `backend`
- **Tools:** `firebase`, `stripe`, `wavespeed`, `firestore`
- **Types:** `performance`, `security`, `ux`, `architecture`

## Maintenance

### Weekly Curation

Run the memory-curator agent every week:
1. Removes duplicates
2. Merges similar entries
3. Archives stale content (>90 days)
4. Scores usefulness

### Size Limits

- Target: <500 entries
- Warning: >800 entries
- Critical: >1000 entries (run curator immediately)

### Backup

Memory files are version-controlled. For manual backup:
```bash
cp -r .claude/memory/ .claude/memory-backup-$(date +%Y%m%d)/
```

## Troubleshooting

### Memory not writing
1. Check writer.py exists and is executable
2. Check disk space
3. Verify JSON syntax in content

### Duplicate entries appearing
1. Hash collision (rare) - content may differ slightly
2. Run memory-curator to deduplicate

### Memory search slow
1. Check total entry count (`--stats`)
2. Run curator to reduce entries
3. Use specific category filters

## Files Reference

| File | Purpose |
|------|---------|
| `.claude/memory/writer.py` | Write entries |
| `.claude/memory/reader.py` | Read/search entries |
| `.claude/memory/schema.json` | Entry validation schema |
| `.claude/agents/memory-curator.md` | Curation agent |
| `.claude/commands/recall.md` | Search command |
| `.claude/commands/remember.md` | Write command |
