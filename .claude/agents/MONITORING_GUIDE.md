# Agent Monitoring Guide

Real-time monitoring of sub-agent execution using transcript files.

---

## How Agent Transcripts Work

When you invoke a sub-agent, Claude Code creates a transcript file:

```
.claude/agent-{agentId}.jsonl
```

This JSONL file contains the **entire conversation** between Main Agent and the sub-agent:
- System prompt sent to sub-agent
- Sub-agent's thoughts and reasoning
- Tool calls (Read, Write, Bash, etc.)
- Tool outputs
- Final response back to Main Agent

---

## Real-Time Monitoring (Linux/Mac/WSL)

### Method 1: Follow Latest Transcript

```bash
# Watch for new agent transcripts and tail the latest one
watch -n 1 'ls -t .claude/agent-*.jsonl 2>/dev/null | head -1 | xargs tail -20'
```

### Method 2: Tail Specific Agent

If you know the agent ID:

```bash
tail -f .claude/agent-<agentId>.jsonl
```

### Method 3: Pretty Print JSON Lines

```bash
tail -f .claude/agent-<agentId>.jsonl | jq -r '.content // .message // .'
```

---

## Real-Time Monitoring (Windows - PowerShell)

### Method 1: Watch Latest Transcript

```powershell
while ($true) {
    $latest = Get-ChildItem .claude\agent-*.jsonl -ErrorAction SilentlyContinue |
              Sort-Object LastWriteTime -Descending |
              Select-Object -First 1

    if ($latest) {
        Clear-Host
        Write-Host "Monitoring: $($latest.Name)" -ForegroundColor Cyan
        Get-Content $latest.FullName -Tail 30
    }

    Start-Sleep -Seconds 2
}
```

### Method 2: Continuous Tail (PowerShell 3.0+)

```powershell
Get-Content .claude\agent-<agentId>.jsonl -Wait -Tail 20
```

---

## Real-Time Monitoring (Windows - Git Bash)

If you have Git for Windows:

```bash
# Watch latest transcript
watch -n 1 'ls -t .claude/agent-*.jsonl 2>/dev/null | head -1 | xargs tail -20'

# Or tail specific file
tail -f .claude/agent-<agentId>.jsonl
```

---

## Post-Execution Analysis

After an agent completes (or fails), you can analyze the full transcript:

### Find Latest Agent Run

```bash
ls -lt .claude/agent-*.jsonl | head -1
```

### Read Full Transcript

```bash
cat .claude/agent-<agentId>.jsonl
```

### Pretty Print with jq

```bash
cat .claude/agent-<agentId>.jsonl | jq '.'
```

### Extract Only Agent Messages

```bash
cat .claude/agent-<agentId>.jsonl | jq -r 'select(.role=="assistant") | .content'
```

### Extract Tool Calls

```bash
cat .claude/agent-<agentId>.jsonl | jq 'select(.tool_use) | {tool: .name, input: .input}'
```

### Find Errors

```bash
cat .claude/agent-<agentId>.jsonl | jq 'select(.error or (.content | contains("error")))'
```

---

## Understanding Transcript Structure

Each line in the JSONL file is a JSON object representing a message:

### System Prompt
```json
{
  "role": "system",
  "content": "You are a world-class design analyst..."
}
```

### Agent Thinking
```json
{
  "role": "assistant",
  "content": "I'll start by fetching the Figma data..."
}
```

### Tool Call
```json
{
  "role": "assistant",
  "tool_use": {
    "name": "bash",
    "input": {
      "command": "curl -H 'X-Figma-Token: ...' ..."
    }
  }
}
```

### Tool Result
```json
{
  "role": "user",
  "tool_result": {
    "output": "...",
    "success": true
  }
}
```

---

## Debugging Failed Agents

When an agent fails, the transcript shows **exactly where it failed**:

1. **Find the transcript:**
   ```bash
   ls -lt .claude/agent-*.jsonl | head -1
   ```

2. **Search for errors:**
   ```bash
   grep -i "error\|fail" .claude/agent-<id>.jsonl
   ```

3. **Check last tool call:**
   ```bash
   tail -20 .claude/agent-<id>.jsonl | jq 'select(.tool_use)'
   ```

4. **Read final messages:**
   ```bash
   tail -50 .claude/agent-<id>.jsonl
   ```

---

## Agent ID Mapping

Agent IDs are random, but you can identify which agent ran by checking the system prompt:

```bash
# Check which agent this transcript belongs to
head -1 .claude/agent-<id>.jsonl | jq -r '.content' | head -20
```

Look for keywords:
- **figma-extractor**: "world-class design analyst", "Figma REST API"
- **ui-planner**: "senior frontend architect", "component hierarchies"
- **frontend-dev**: "expert React/Next.js developer", "TypeScript"
- **qa-reviewer**: "meticulous QA engineer", "design-to-code accuracy"
- **workflow-coordinator**: "workflow orchestration specialist", "pipeline"

---

## Live Monitoring During Workflow

When running a workflow, you can monitor multiple agents:

### Terminal 1: Run Workflow
```bash
# (Claude Code terminal)
# User invokes workflow-coordinator
```

### Terminal 2: Monitor Transcripts
```bash
# Watch for new transcripts
watch -n 1 'ls -lt .claude/agent-*.jsonl 2>/dev/null | head -5'
```

### Terminal 3: Tail Latest Agent
```bash
# Follow the most recent agent execution
while true; do
    latest=$(ls -t .claude/agent-*.jsonl 2>/dev/null | head -1)
    if [ -n "$latest" ]; then
        clear
        echo "=== Monitoring: $latest ==="
        tail -30 "$latest"
    fi
    sleep 2
done
```

---

## Quick Commands Reference

| Task | Command (Bash/WSL) | Command (PowerShell) |
|------|-------------------|---------------------|
| List transcripts | `ls -lt .claude/agent-*.jsonl` | `Get-ChildItem .claude\agent-*.jsonl \| Sort-Object LastWriteTime -Desc` |
| Tail latest | `tail -f $(ls -t .claude/agent-*.jsonl \| head -1)` | `Get-Content $(Get-ChildItem .claude\agent-*.jsonl \| Sort-Object LastWriteTime -Desc \| Select-Object -First 1).FullName -Wait` |
| Count agents run | `ls .claude/agent-*.jsonl \| wc -l` | `(Get-ChildItem .claude\agent-*.jsonl).Count` |
| Find errors | `grep -i error .claude/agent-*.jsonl` | `Select-String -Path .claude\agent-*.jsonl -Pattern "error" -CaseSensitive:$false` |
| Clean old transcripts | `rm .claude/agent-*.jsonl` | `Remove-Item .claude\agent-*.jsonl` |

---

## ESC ESC to Stop Agent

**Important:** If an agent is running wild or stuck:

1. Press **ESC ESC** in Claude Code
2. Agent stops at current checkpoint
3. Returns control to Main Agent
4. Transcript preserves all work up to that point

---

## Example: Monitoring figma-extractor

```bash
# Start tailing in a separate terminal
tail -f .claude/agent-<id>.jsonl

# You'll see:
# 1. System prompt: "You are a world-class design analyst..."
# 2. Agent thinking: "I'll fetch the Figma data for Frame ID 28:3965"
# 3. Tool call: curl command to Figma API
# 4. Tool result: JSON response from Figma
# 5. Agent processing: "Analyzing colors... extracting typography..."
# 6. Tool call: Write to docs/design-specs/EXAMPLES_DESIGN.md
# 7. Final response: "Design specification extracted successfully..."
```

---

## Transcript Lifecycle

1. **Agent Invoked**: Transcript file created `.claude/agent-<random-id>.jsonl`
2. **During Execution**: New lines appended in real-time
3. **Agent Completes**: Final response written, file closed
4. **Persistent**: Transcript remains for debugging
5. **Manual Cleanup**: Delete old transcripts when no longer needed

---

## Advanced: Extract Specific Data

### Get all Bash commands run by an agent
```bash
cat .claude/agent-<id>.jsonl | jq -r 'select(.tool_use.name=="bash") | .tool_use.input.command'
```

### Get all files written
```bash
cat .claude/agent-<id>.jsonl | jq -r 'select(.tool_use.name=="write") | .tool_use.input.file_path'
```

### Calculate agent execution time
```bash
# First message timestamp
first=$(head -1 .claude/agent-<id>.jsonl | jq -r '.timestamp // empty')
# Last message timestamp
last=$(tail -1 .claude/agent-<id>.jsonl | jq -r '.timestamp // empty')
```

---

## Notes

- Transcripts are **append-only** during execution
- Each JSONL line is a complete JSON object (not pretty-printed)
- Agent IDs are random UUIDs (no predictable naming)
- Transcripts **persist** after agent completes (manual cleanup required)
- File watching may lag 1-2 seconds behind real-time execution
- Use `jq` for better readability (install: `sudo apt install jq` or `choco install jq`)

---

**Ready to monitor!** When you invoke an agent, open a second terminal and start tailing the transcript file.
