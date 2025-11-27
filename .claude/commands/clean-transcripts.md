---
description: Clean up old agent transcript files
---

Remove old agent transcript files from `.claude/` to free up space and reduce clutter.

**Instructions:**

1. List all transcript files: `.claude/agent-*.jsonl`
2. Show user how many transcripts exist and their total size
3. Ask for confirmation before deleting
4. If user confirms:
   - Delete all `.claude/agent-*.jsonl` files
   - Report how many files were deleted and space freed
5. If user declines:
   - Offer to show transcript details with `/watch-agents`
   - Suggest keeping recent transcripts for debugging

**Safety:**
- Always ask for confirmation before deletion
- Show what will be deleted (count and size)
- Explain that transcripts are logs and safe to delete after review

**Output:**
```
Found 5 agent transcripts (total size: 127 KB):
- agent-abc123.jsonl - 45 KB - figma-extractor - 2h ago
- agent-def456.jsonl - 32 KB - ui-planner - 2h ago
- agent-ghi789.jsonl - 28 KB - frontend-dev - 2h ago
- agent-jkl012.jsonl - 18 KB - qa-reviewer - 2h ago
- agent-mno345.jsonl - 4 KB - workflow-coordinator - 3h ago

Delete all transcripts? (y/n)

[If yes:]
✅ Deleted 5 transcript files, freed 127 KB

[If no:]
Transcripts preserved. Use /watch-agents to review them.
```

**Note:**
Transcripts are debugging logs. Safe to delete after reviewing agent execution.
