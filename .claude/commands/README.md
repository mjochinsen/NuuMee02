# Custom Claude Code Commands

These slash commands streamline the Figma-to-code workflow.

---

## Available Commands

### `/generate-page <page-name> [frame-id]`
**Generate a complete page from Figma design**

Runs the full 4-agent pipeline: figma-extractor → ui-planner → frontend-dev → qa-reviewer

**Examples:**
```
/generate-page Examples
/generate-page Examples 28:3965
/generate-page Home 28:1234
```

**What it does:**
- Invokes workflow-coordinator
- Orchestrates all 4 sub-agents
- Creates design spec, component plan, code files, and QA report
- Reports final match quality and status

---

### `/watch-agents`
**Monitor agent execution transcripts**

Shows recent agent activity and current execution status.

**What it does:**
- Lists all agent transcripts in `.claude/`
- Identifies which agent each transcript belongs to
- Shows last 15 lines of most recent activity
- Provides summary of current agent work
- Suggests external monitoring scripts for real-time watching

**Use case:** Check what agents have run or debug a failed agent

---

### `/list-frames`
**List all available Figma frames**

Fetches and displays all frames from the configured Figma file that can be generated.

**What it does:**
- Calls Figma API to get file structure
- Extracts all frame names and IDs
- Shows which frames already have design specs
- Provides usage examples for each frame

**Use case:** Discover which pages you can generate before running the workflow

---

### `/clean-transcripts`
**Clean up old agent transcript files**

Removes old debugging transcripts to free up space.

**What it does:**
- Lists all transcript files with sizes
- Asks for confirmation before deleting
- Reports how many files deleted and space freed
- Safe operation - transcripts are just logs

**Use case:** Clean up after multiple workflow runs

---

## Command Workflow

**Typical workflow:**

1. **Discover frames:**
   ```
   /list-frames
   ```
   See all available Figma frames with their IDs

2. **Generate page:**
   ```
   /generate-page Examples 28:3965
   ```
   Run full pipeline for the Examples page

3. **Monitor progress (optional):**
   ```
   /watch-agents
   ```
   Check current agent status

4. **Clean up (optional):**
   ```
   /clean-transcripts
   ```
   Remove old transcript logs

---

## Real-Time Monitoring Scripts

For continuous monitoring during agent execution, use external scripts:

**PowerShell (Windows):**
```powershell
.\watch-agent.ps1
```

**Bash/WSL (Windows with Git Bash or WSL):**
```bash
./watch-agent.sh
```

Run these in a separate terminal while agents execute to see real-time progress.

---

## Command Files

Commands are defined in `.claude/commands/` as Markdown files with YAML frontmatter:

```
.claude/commands/
├── generate-page.md       - Main workflow command
├── watch-agents.md        - Monitor agent transcripts
├── list-frames.md         - List Figma frames
├── clean-transcripts.md   - Clean up logs
└── README.md             - This file
```

---

## Creating Custom Commands

To add your own commands:

1. Create a new `.md` file in `.claude/commands/`
2. Add YAML frontmatter with description:
   ```yaml
   ---
   description: What your command does
   ---
   ```
3. Write instructions for Claude on how to execute the command
4. Command becomes available as `/your-command-name`

See existing commands for examples.

---

## Tips

- Use `/generate-page` for most workflows (it handles everything)
- Use `/watch-agents` to debug failures
- Use `/list-frames` to discover what you can build
- Monitor transcripts in `.claude/agent-*.jsonl` for detailed debugging
- Press **ESC ESC** to stop a running agent mid-execution

---

**Ready to generate pages!** Try `/list-frames` to see what's available.
