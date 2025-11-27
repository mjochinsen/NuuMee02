# Sub-Agents Technical Specification

## Overview

This directory contains 4 specialized sub-agents for automated Figma-to-code page generation. Each agent follows the [Claude Code sub-agent specification](https://code.claude.com/docs/en/sub-agents) using Markdown files with YAML frontmatter.

## Agent Files

| Agent | File | Color | Model | Purpose |
|-------|------|-------|-------|---------|
| figma-extractor | `figma-extractor.md` | cyan | sonnet | Extract design specs from Figma API |
| ui-planner | `ui-planner.md` | green | sonnet | Plan React component architecture |
| frontend-dev | `frontend-dev.md` | blue | sonnet | Implement TypeScript/TSX components |
| qa-reviewer | `qa-reviewer.md` | yellow | sonnet | Review implementation accuracy |

## File Format

All agents use this structure:

```markdown
---
name: agent-name
description: When this agent should be used (for auto-discovery)
tools: Tool1, Tool2, Tool3
model: sonnet | opus | haiku
color: red | blue | green | yellow | purple | orange | pink | cyan
---

# Purpose

{Agent's role and specialty}

## Instructions

{Step-by-step process when invoked}

## Output Structure

{Expected format of agent's output}

## Report / Response

{How agent reports back to Main Agent}
```

## Invocation Patterns

### Explicit Invocation
User directly requests a specific agent:
```
> Use the figma-extractor agent to analyze Frame ID 28:3965
```

### Automatic Delegation (Recommended)
Main Agent selects agents based on description field:
```
> Generate the Examples page from Figma Frame ID 28:3965
```
The Main Agent will automatically invoke:
1. figma-extractor (sees "Figma" + "Frame ID")
2. ui-planner (sees design spec created)
3. frontend-dev (sees component plan created)
4. qa-reviewer (sees implementation complete)

## Tool Restrictions

Each agent has access only to necessary tools:

### figma-extractor
- **Bash**: curl Figma REST API
- **Write**: Create design spec markdown file
- **Read**: Verify files (if needed)

### ui-planner
- **Read**: Read design spec file
- **Write**: Create component plan file

### frontend-dev
- **Read**: Read plan and design spec
- **Write**: Create new component files
- **Edit**: Modify existing files (exports, updates)
- **Bash**: Run type checks (`tsc --noEmit`)

### qa-reviewer
- **Read**: Read all source files (spec, plan, implementation)
- **Write**: Create QA report

## Handoff Pattern

Agents communicate via structured Markdown files:

```
figma-extractor
    ↓ (writes)
docs/design-specs/{PAGE}_DESIGN.md
    ↓ (reads)
ui-planner
    ↓ (writes)
docs/ui-plans/{PAGE}_PLAN.md
    ↓ (reads)
frontend-dev
    ↓ (creates code files, then reads for review)
qa-reviewer
    ↓ (writes)
docs/qa-reports/{PAGE}_QA.md
```

**Critical:** Agents NEVER call each other. All orchestration is done by the Main Agent.

## Description Field Best Practices

The `description` field determines automatic delegation. Effective descriptions:

1. **State when to use**: "Use AFTER X" or "MUST BE USED FIRST"
2. **Use emphasis**: "PROACTIVELY", "MUST", "SPECIALIST"
3. **Describe triggers**: "when user mentions Figma designs or provides Frame IDs"
4. **Specify inputs/outputs**: "Input: design spec file. Output: component plan"
5. **Be action-oriented**: "Extracts", "Plans", "Implements", "Reviews"

### Example (figma-extractor)
```yaml
description: Figma design specification extractor. Use PROACTIVELY when user mentions extracting/analyzing Figma designs or provides Frame IDs. Specialist for fetching Figma REST API data and generating comprehensive design documentation. MUST BE USED FIRST before any UI planning or coding from Figma designs.
```

This ensures the Main Agent knows:
- When to invoke it (Figma + Frame ID)
- What it does (extract specs)
- Order in workflow (FIRST)
- Its specialty (Figma REST API)

## Agent Lifecycle

### 1. Agent Discovery
- Main Agent scans `.claude/agents/*.md`
- Parses YAML frontmatter
- Indexes agents by name and description

### 2. Agent Invocation
- User request matched against agent descriptions
- Main Agent selects best-fit agent
- Agent receives fresh 200k token context
- Agent executes according to system prompt

### 3. Agent Execution
- Agent uses only tools specified in `tools` field
- Agent follows instructions in system prompt
- Agent produces output (file or report)

### 4. Agent Response
- Agent reports back to Main Agent (NOT to user)
- Main Agent receives agent's final message
- Main Agent decides next steps
- Main Agent reports to user

### 5. Transcript Storage
- Each invocation creates: `.claude/agents/agent-{agentId}.jsonl`
- Contains full conversation history
- Used for debugging and resumption

## Debugging

### View Agent Transcripts
```bash
# List all agent transcripts
ls .claude/agents/agent-*.jsonl

# View specific agent run
cat .claude/agents/agent-abc123.jsonl | jq
```

### Common Issues

**Agent not auto-invoked:**
- Check description field includes trigger keywords
- Use more explicit user prompt: "Use the {agent-name} agent"

**Agent produces wrong output:**
- Review agent transcript: `.claude/agents/agent-{id}.jsonl`
- Check if agent had access to required input files
- Verify tools list includes necessary tools

**Agent hangs or times out:**
- Check Figma API credentials if using figma-extractor
- Verify file paths exist if using Read tool
- Review system prompt for infinite loops

**TypeScript errors after frontend-dev:**
- Agent should run `tsc --noEmit` automatically
- Check agent transcript for error output
- Re-run frontend-dev with specific error fixes

## Model Selection

All agents use `model: sonnet` for:
- Good balance of speed and quality
- Cost-effective for multi-agent workflows
- Handles complex TypeScript and React code well

For future optimization:
- **haiku**: Could be used for simple tasks (qa-reviewer for basic checks)
- **opus**: Could be used for complex components (frontend-dev for advanced features)

## Extending the System

### Adding New Agents

1. Create new `.md` file in `.claude/agents/`
2. Use YAML frontmatter with required fields
3. Write clear, structured system prompt
4. Define inputs, outputs, and handoffs
5. Test with explicit invocation first
6. Refine description for auto-discovery

### Example: Adding a Testing Agent

```markdown
---
name: test-writer
description: Automated test generator. Use AFTER frontend-dev completes implementation. Specialist for creating Vitest/Jest tests for React components with comprehensive coverage.
tools: Read, Write
model: sonnet
color: purple
---

# Purpose
You are a testing specialist...

## Instructions
1. Read implementation files
2. Read component plan for expected behavior
3. Generate unit tests for each component
4. Write integration tests for page
5. Create test file: `tests/{page}/{component}.test.tsx`

## Report / Response
Tests created successfully.
Files: {list test files}
Coverage: {estimated coverage}
```

## Integration with CI/CD

Future enhancement: Run agents as part of build pipeline:

```yaml
# .github/workflows/generate-pages.yml
name: Generate Pages from Figma

on:
  workflow_dispatch:
    inputs:
      frame_id:
        description: 'Figma Frame ID'
        required: true
      page_name:
        description: 'Page name'
        required: true

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Agentic Workflow
        run: |
          claude-code "Generate ${{ inputs.page_name }} from Frame ID ${{ inputs.frame_id }}"
      - name: Create Pull Request
        uses: peter-evans/create-pull-request@v5
```

## Performance Optimization

### Context Management
- Each agent gets fresh 200k tokens (no pollution)
- Agents read only necessary files
- Structured outputs minimize token usage

### Parallel Execution (Future)
Currently sequential. Could parallelize independent tasks:
- Generate multiple pages simultaneously
- Run qa-reviewer while starting next page's figma-extractor

### Caching
- Figma API responses could be cached
- Design specs persist for re-planning
- Component plans can be revised without re-extraction

## Security Considerations

### Figma API Token
- Store in environment variables, not in prompts
- Use project-level `.env` file
- Never commit tokens to git

### Code Generation
- Review generated code before deployment
- QA agent validates against spec (not security)
- Manual code review recommended for first few pages

### Tool Restrictions
- Agents have minimal necessary tools
- No file deletion capabilities
- Write access scoped to specific directories

## Maintenance

### Updating Agents
1. Edit `.md` file directly
2. Changes take effect immediately (no restart needed)
3. Test with explicit invocation
4. Verify auto-discovery still works

### Version Control
- Commit agent files to git
- Track changes to system prompts
- Document major revisions in commit messages

### Monitoring
- Review agent transcripts regularly
- Track QA match quality trends
- Identify patterns in critical issues

## Support

For issues or questions:
1. Check agent transcripts: `.claude/agents/agent-*.jsonl`
2. Review this README and `docs/WORKFLOW.md`
3. Consult [Claude Code documentation](https://code.claude.com/docs)
4. Open issue in project repository
