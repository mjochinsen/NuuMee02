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

When this command is invoked, use the Task tool to launch the `fiby-coordinator` agent with the user's request.

**Request:** $ARGUMENTS

### Process

1. **Parse Request**
   - Identify request type: create | audit | recommend | question
   - Extract target agent or topic

2. **Invoke FIBY**
   Use the Task tool with:
   ```
   subagent_type: fiby-coordinator
   prompt: |
     KODY Request: $ARGUMENTS

     Context:
     - Project: NuuMee02
     - Phase: Check TASK_TRACKER.md for current phase
     - Agent Count: 39 agents in .claude/agents/

     Instructions:
     1. Read the request carefully
     2. Determine request type (create/audit/recommend/question)
     3. Execute appropriate workflow from your instructions
     4. Write response to .claude/responses/ if creating files
     5. Report back with summary and next steps
   ```

3. **Report Results**
   After FIBY completes, summarize:
   - What was done
   - Files created/modified
   - Recommended next steps

## Request Types

### Create Agent
```
/ask-fiby create agent for {purpose}
/ask-fiby new agent to handle {task}
/ask-fiby build an agent that {description}
```

### Audit Agent
```
/ask-fiby audit {agent-name}
/ask-fiby review all frontend agents
/ask-fiby check api-builder quality
```

### Recommend Agent
```
/ask-fiby which agent for {task}
/ask-fiby what agent handles {feature}
/ask-fiby recommend agent for Phase {N}
```

### Question
```
/ask-fiby how to use {agent-name}
/ask-fiby when to invoke {agent}
/ask-fiby explain {agent} workflow
```

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
