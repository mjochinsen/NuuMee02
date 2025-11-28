# Agent Memory System

Persistent cognitive layer for Claude Code agents.

## Purpose

Store reusable insights, patterns, and decisions that persist across sessions.
This is the "brain" that agents evolve with.

## Files

| File | Purpose | Example |
|------|---------|---------|
| `insights.jsonl` | Discoveries and learnings | "Firebase Auth returns 403 for expired tokens, not 401" |
| `patterns.jsonl` | Recurring code patterns | "All API routes use the same error handling structure" |
| `decisions.jsonl` | Architectural choices | "Chose Firestore over Postgres for real-time sync" |
| `bugs.jsonl` | Bug causes and fixes | "Infinite loop caused by useEffect missing dependency" |
| `preferences.jsonl` | User/project preferences | "User prefers concise responses, no emojis" |

## Rules

1. **Append-only** - Never delete entries, only add
2. **Max 500 chars** - Forces conciseness
3. **No duplicates** - Check hash before writing
4. **On-demand loading** - Use `/recall` command, not auto-loaded
5. **Weekly curation** - Curator agent removes stale/duplicate entries

## Schema

Each entry follows:
```json
{
  "id": "uuid",
  "timestamp": "ISO-8601",
  "category": "insight|pattern|decision|bug|preference",
  "context": "phase-1|auth|payments|etc",
  "content": "The actual insight (max 500 chars)",
  "source": "session-id or agent-name",
  "tags": ["auth", "firebase", "bug"],
  "hash": "sha256 of content for deduplication"
}
```

## Usage

### Writing (automatic via hooks)
Significant events trigger memory writes automatically.

### Reading
```
/recall auth          # Search memory for auth-related entries
/recall --recent 10   # Last 10 entries
/recall --bugs        # All bug entries
```

### Curating
```
Run memory-curator agent weekly
```

## Integration

- **Write trigger**: `post-tool-use.py` hook detects significant completions
- **Read trigger**: `/recall` slash command
- **Curate trigger**: `memory-curator` agent (manual or scheduled)
