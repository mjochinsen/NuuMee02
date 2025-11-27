# Ask FIBY - Agent Master

**Usage:** `/ask-fiby <request>`

## Description

Invoke FIBY, the Agent Master, to get help with:
- Creating new agents
- Auditing existing agents
- Choosing the right agent for a task
- Understanding agent usage
- Improving agent quality

## Examples

```
/ask-fiby create agent for stripe webhook handling
/ask-fiby audit the api-builder agent
/ask-fiby which agent should I use for authentication?
/ask-fiby improve the frontend-dev agent error handling
/ask-fiby list all orchestrator agents
```

## Instructions

When this command is invoked with `$ARGUMENTS`, parse the request and invoke FIBY with a structured payload.

### Step 1: Parse Request Type

Analyze `$ARGUMENTS` to determine type:
- Contains "create", "new", "build" → type: "create"
- Contains "audit", "review", "check", "validate" → type: "audit"
- Contains "which", "recommend", "improve", "best" → type: "recommend"
- Otherwise → type: "question"

### Step 2: Extract Target

- For audit: extract agent name (e.g., "api-builder" from "audit the api-builder agent")
- For create: extract purpose (e.g., "stripe webhook handling")
- For recommend: extract task description
- For question: use full query

### Step 3: Invoke FIBY

Use the Task tool with subagent_type `fiby-coordinator`:

```
prompt: |
  ## FIBY Request

  **Type:** {type}
  **Query:** $ARGUMENTS
  **Target:** {extracted target or "none"}

  ## Specific Files to Read (ONLY these)

  {For audit: ".claude/agents/{target}.md"}
  {For create: ".claude/agents/TEMPLATE.md"}
  {For recommend: ".claude/agents/README.md"}
  {For question: relevant agent file if mentioned, else README.md}

  ## Instructions

  1. Read ONLY the files listed above (token management critical)
  2. Execute the {type} workflow from your instructions
  3. If creating files, write to .claude/responses/
  4. Report back with:
     - Direct answer
     - Files created/modified (if any)
     - Recommended next steps

  ## Constraints

  - DO NOT read entire repository
  - DO NOT glob all agents unless explicitly asked
  - Stay under 50k tokens
  - Be concise in response
```

### Step 4: Report Results

After FIBY completes, summarize for the user:
- What was done
- Files created/modified
- Recommended next steps

## Request Type Reference

| Type | Triggers | Target Extraction |
|------|----------|-------------------|
| create | "create", "new", "build" | Purpose description |
| audit | "audit", "review", "check" | Agent name |
| recommend | "which", "recommend", "improve" | Task/feature |
| question | (default) | Full query |

## Output

FIBY will respond with:
- Direct answer to your request
- Files created (if any)
- Audit scores (if auditing)
- Recommended next steps
- References to documentation

## Related Commands

- `/list-frames` - List Figma frames
- `/generate-page` - Generate page from Figma (uses workflow-coordinator)
- `/deploy-firebase` - Deploy to Firebase (uses deployment-orchestrator)

## Documentation

- Full FIBY docs: [docs/FIBY_AGENT_MASTER.md](docs/FIBY_AGENT_MASTER.md)
- Agent inventory: [.claude/agents/README.md](.claude/agents/README.md)
- Agent template: [.claude/agents/TEMPLATE.md](.claude/agents/TEMPLATE.md)
