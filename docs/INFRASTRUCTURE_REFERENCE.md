# Infrastructure Reference for KODY/CLAUDY

Systems built by FIBY. Use these in your sessions.

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

## Full Documentation

- `docs/MEMORY_SYSTEM.md` - Complete memory system docs
- `docs/NIGHTLY_AUDITOR.md` - Complete auditor docs
