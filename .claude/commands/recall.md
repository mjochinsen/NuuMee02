---
description: Search and retrieve agent memory entries
arguments:
  - name: query
    description: Search term, category, or --stats for statistics
    required: false
---

# Recall Agent Memory

Search the persistent memory system for insights, patterns, decisions, and bugs.

## Your Task

1. Parse the user's query: `$ARGUMENTS`

2. Run the memory reader with appropriate filters:

```bash
# If query is empty or "all" - show recent entries
python3 .claude/memory/reader.py --recent 10

# If query is "--stats" - show statistics
python3 .claude/memory/reader.py --stats

# If query is a category (insight, pattern, decision, bug, preference)
python3 .claude/memory/reader.py --category {category} --recent 10

# If query starts with "--tags"
python3 .claude/memory/reader.py --tags {tags}

# Otherwise - search by query
python3 .claude/memory/reader.py --search "{query}" --recent 20
```

3. Present the results to the user in a clear format.

4. If no results found, suggest:
   - Different search terms
   - Writing a new memory entry with `/remember`

## Examples

- `/recall auth` - Search for auth-related memories
- `/recall --stats` - Show memory statistics
- `/recall bug` - Show all bug entries
- `/recall --tags firebase,auth` - Filter by tags
- `/recall` - Show 10 most recent entries

## Memory Categories

| Category | Use For |
|----------|---------|
| insight | Discoveries and learnings |
| pattern | Recurring code patterns |
| decision | Architectural choices |
| bug | Bug causes and fixes |
| preference | User/project preferences |
