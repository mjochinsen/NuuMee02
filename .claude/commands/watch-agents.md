---
description: Monitor agent execution transcripts in real-time
---

List all agent transcripts and show the latest activity. Use this to debug agent execution or monitor workflow progress.

**Instructions:**

1. Find all agent transcript files in `.claude/`
2. If transcripts exist:
   - List them sorted by modification time (most recent first)
   - Show which agent each transcript belongs to by reading the first few lines
   - Display the last 15 lines of the most recent transcript
   - Show file size and last modified time
   - Provide a summary of what the agent is doing
3. If no transcripts exist:
   - Inform user that no agents have been invoked yet
   - Suggest invoking workflow-coordinator or a specific agent

**Output format:**

```
=== Agent Transcripts ===

Recent transcripts (sorted by time):
1. agent-abc123.jsonl - figma-extractor - 14.3KB - 2m ago
2. agent-xyz789.jsonl - ui-planner - 8.1KB - 5m ago

=== Latest Activity (agent-abc123.jsonl) ===

[Last 15 lines of transcript showing agent's recent actions]

Summary: figma-extractor is fetching Figma data for Frame ID 28:3965

Tip: For continuous monitoring, run in a separate terminal:
  PowerShell: .\watch-agent.ps1
  Bash/WSL: ./watch-agent.sh
```

**Notes:**
- Use Read tool to examine transcript files
- Parse JSONL to identify agent type from system prompt
- Don't overwhelm user - show summary, not full transcript
- Suggest external monitoring scripts for real-time watching
