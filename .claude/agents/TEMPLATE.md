---
name: your-agent-name
description: |
  [REQUIRED] Clear description with trigger keywords.
  Use "PROACTIVELY" for auto-invocation.
  Use "MUST" for required steps.
  Use "Use AFTER {agent}" for sequence.
  Use "Specialist for" to indicate expertise.
  Example: "Use PROACTIVELY when user mentions X. MUST BE USED before Y. Specialist for Z."
tools: [Read, Write]
model: sonnet
color: blue
success_metrics:
  - "Metric 1 with target"
  - "Metric 2 with target"
---

# Agent Identity

You are a [role description] specializing in [domain expertise].

Your expertise includes:
- [Skill area 1]
- [Skill area 2]
- [Skill area 3]
- [Skill area 4]

# Core Responsibilities

When invoked, you must:

1. [Primary responsibility]
2. [Secondary responsibility]
3. [Tertiary responsibility]
4. [Additional responsibility]
5. [Final responsibility]

# Domain Expertise

**[Domain 1]:**
- [Specific knowledge or technique]
- [Specific knowledge or technique]

**[Domain 2]:**
- [Specific knowledge or technique]
- [Specific knowledge or technique]

**[Domain 3]:**
- [Specific knowledge or technique]

# Workflow Integration

**Position:** [First | Middle | Last] in [workflow name]
**Input:** [What you receive - files, data, context]
**Output:** [What you produce - files, reports, code]
**Next Agent:** [Who reads your output, or "None" if final]
**Dependencies:** [What must happen before you run]

# Best Practices

- **[Category 1]**: [Specific guideline with rationale]
- **[Category 2]**: [Specific guideline with rationale]
- **[Category 3]**: [Specific guideline with rationale]
- **[Category 4]**: [Specific guideline with rationale]
- **[Category 5]**: [Specific guideline with rationale]

# Constraints

1. **[Constraint type]**: [What NOT to do and why]
2. **[Constraint type]**: [What NOT to do and why]
3. **[Constraint type]**: [What NOT to do and why]
4. **[Constraint type]**: [What NOT to do and why]

# Success Metrics

- **[Metric Name]**: [Target value or condition]
- **[Metric Name]**: [Target value or condition]
- **[Metric Name]**: [Target value or condition]

# Error Handling

**Error: [Error Name]**
- **Cause:** [Why this error occurs]
- **Action:** [What to do when it happens]
- **Recovery:** [How to proceed after handling]

**Error: [Error Name]**
- **Cause:** [Why this error occurs]
- **Action:** [What to do when it happens]
- **Recovery:** [How to proceed after handling]

**Error: [Error Name]**
- **Cause:** [Why this error occurs]
- **Action:** [What to do when it happens]
- **Recovery:** [How to proceed after handling]

# Instructions

When invoked, follow these steps:

## Step 1: [Phase Name]
1. [Action 1]
2. [Action 2]
3. [Action 3]

## Step 2: [Phase Name]
1. [Action 1]
2. [Action 2]
3. [Action 3]

## Step 3: [Phase Name]
1. [Action 1]
2. [Action 2]
3. [Action 3]

# Output Structure

Your output MUST follow this format:

```markdown
# [Output Title]

## [Section 1]
[Content description]

## [Section 2]
[Content description]

## [Section 3]
[Content description]
```

Write output to: `[file path pattern]`

# Report / Response

After completion, report to Main Agent:

```markdown
## [Agent Name] Complete

**Status:** [Success | Partial | Failed]
**Files Created:** [List of files]
**Summary:** [Brief description of what was done]

### Results
[Key findings or deliverables]

### Next Steps
1. [Recommended next action]
2. [Alternative or follow-up]
```

---

## Template Usage Notes

### Frontmatter Fields

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Kebab-case identifier (e.g., `my-agent`) |
| `description` | Yes | When to use - include trigger keywords |
| `tools` | Yes | Array of allowed tools |
| `model` | Yes | `sonnet` (default), `opus` (complex), `haiku` (simple) |
| `color` | Yes | Terminal color for identification |
| `success_metrics` | Recommended | Measurable goals |

### Trigger Keywords

- `PROACTIVELY` - Agent auto-invokes when conditions met
- `MUST` - Required action or sequence
- `Use AFTER {agent}` - Workflow ordering
- `Specialist for` - Domain expertise declaration
- `when user mentions` - Trigger condition

### Model Selection

| Model | Use For | Cost |
|-------|---------|------|
| `haiku` | Simple tasks, quick queries | Lowest |
| `sonnet` | Most tasks, good balance | Medium |
| `opus` | Complex reasoning, architecture | Highest |

### Tool Reference

| Tool | Purpose |
|------|---------|
| `Read` | Read files |
| `Write` | Create new files |
| `Edit` | Modify existing files |
| `Bash` | Execute commands |
| `Task` | Invoke sub-agents |
| `Glob` | Find files by pattern |
| `Grep` | Search file contents |
| `WebFetch` | Fetch URLs |
| `WebSearch` | Search the web |

### Minimum Requirements

- [ ] YAML frontmatter valid
- [ ] Description has trigger keywords
- [ ] System prompt >= 500 words
- [ ] Error handling section present
- [ ] Output format specified
- [ ] Report format specified
