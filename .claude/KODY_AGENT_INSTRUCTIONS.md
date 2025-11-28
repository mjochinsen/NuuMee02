# KODY - How to Use Agents

## Quick Reference

### Run a Registered Agent (Built-in)

These agents are directly available:
- `api-builder`, `frontend-dev`, `worker-builder`, `test-builder`
- `figma-extractor`, `ui-planner`, `qa-reviewer`
- `workflow-coordinator`, `deployment-orchestrator`
- `subagent-auditor`, `architect-opus`, `validator-opus`

```
Task(
    subagent_type="api-builder",
    prompt="Implement POST /auth/register endpoint"
)
```

### Run a Custom Agent (from .claude/agents/)

Use `general-purpose` and tell it to read the agent file:

```
Task(
    subagent_type="general-purpose",
    prompt="""
    Read .claude/agents/{agent-name}.md and execute it.

    Task: {what you want done}
    """
)
```

### Create a New Agent (via FIBY)

```
Task(
    subagent_type="general-purpose",
    model="opus",
    prompt="""
    Read .claude/agents/fiby-coordinator.md and act as FIBY.

    FIBY Request:
    - Type: create
    - Query: {describe the agent you need}

    Requirements:
    - {requirement 1}
    - {requirement 2}

    Write to: .claude/agents/{new-agent-name}.md
    Use template: .claude/agents/TEMPLATE.md
    """
)
```

### Ask FIBY a Question

```
Task(
    subagent_type="general-purpose",
    prompt="""
    Read .claude/agents/fiby-coordinator.md and act as FIBY.

    FIBY Request:
    - Type: question
    - Query: Which agent should I use for {task}?
    """
)
```

### Audit an Agent (via FIBY)

```
Task(
    subagent_type="general-purpose",
    prompt="""
    Read .claude/agents/fiby-coordinator.md and act as FIBY.

    FIBY Request:
    - Type: audit
    - Query: Audit the {agent-name} agent

    Write report to: .claude/responses/audit-{agent-name}.md
    """
)
```

---

## Example: Create and Run Phase Validator

### Step 1: Create the Agent

```
Task(
    subagent_type="general-purpose",
    model="opus",
    prompt="""
    Read .claude/agents/fiby-coordinator.md and act as FIBY.

    FIBY Request:
    - Type: create
    - Query: Create phase-validator agent

    Requirements:
    - Validates that a phase is complete
    - Reads docs/TASK_TRACKER.md
    - Checks all tasks for specified phase have ✅ status
    - Verifies completion criteria checklist
    - Reports: tasks done, criteria met, issues found, PASS/FAIL

    Write to: .claude/agents/phase-validator.md
    Use template: .claude/agents/TEMPLATE.md
    """
)
```

### Step 2: Run the Validator

```
Task(
    subagent_type="general-purpose",
    prompt="""
    Read .claude/agents/phase-validator.md and execute it.

    Validate: Phase 1 (Authentication)

    Check:
    1. All Phase 1 tasks in TASK_TRACKER.md
    2. Completion criteria checklist
    3. Any blockers or issues

    Report format:
    - Phase: 1
    - Tasks: X/Y complete
    - Criteria: X/Y met
    - Status: PASS/FAIL
    - Issues: [list]
    """
)
```

---

## Common Patterns

### Deploy to Firebase
```
Task(subagent_type="deployment-orchestrator", prompt="Deploy frontend to Firebase Hosting")
```

### Generate Page from Figma
```
Task(subagent_type="workflow-coordinator", prompt="Generate Home page from Frame ID 28:1234")
```

### Build API Endpoint
```
Task(subagent_type="api-builder", prompt="Implement GET /api/jobs endpoint")
```

### Run SEO Fixes
```
Task(subagent_type="seo-meta-tags", prompt="Add meta tags to all pages in frontend/app/")
```

### Audit Code Quality
```
Task(subagent_type="subagent-auditor", prompt="Audit .claude/agents/api-builder.md")
```

---

## Key Points

1. **Registered agents** → Use directly with `subagent_type`
2. **Custom agents** → Use `general-purpose` + "Read {file} and execute"
3. **Create agents** → Use `general-purpose` + FIBY instructions
4. **FIBY is invoked via Task tool**, not a separate session
5. **Each Task spawns fresh context** - no memory pollution
