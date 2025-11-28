# FIBY Test Instructions

**Purpose:** Test FIBY functionality in a separate chat window

---

## How to Test FIBY

Open a NEW Claude Code chat window in VS Code and paste ONE of these test prompts:

---

### Test 1: Direct FIBY Invocation (Recommended)

```
I am testing FIBY, the Agent Master for NuuMee.

Read the file .claude/agents/fiby-coordinator.md and act as FIBY.

FIBY Request:
- Type: question
- Query: Which agent should I use for building FastAPI endpoints?

Follow the FIBY workflow and respond as FIBY would.
```

---

### Test 2: Agent Audit Test

```
I am testing FIBY, the Agent Master.

Read .claude/agents/fiby-coordinator.md for your instructions.
Then read .claude/agents/api-builder.md

Act as FIBY and audit the api-builder agent. Check:
- YAML frontmatter validity
- Description has trigger keywords
- Error handling documented
- Success metrics defined

Provide an audit score out of 10.
```

---

### Test 3: Create Agent Test

```
I am testing FIBY, the Agent Master.

Read .claude/agents/fiby-coordinator.md for your instructions.
Read .claude/agents/TEMPLATE.md for the agent template.

Act as FIBY and create a new agent specification for:
- Name: credential-checker
- Purpose: Validate API credentials before deployment
- Tools needed: Bash, Read
- Model: haiku (fast, simple task)

Write the agent to .claude/responses/test-credential-checker.md (not the actual agents folder).
```

---

### Test 4: Recommend Agent Test

```
I am testing FIBY, the Agent Master.

Read .claude/agents/fiby-coordinator.md for your instructions.
Read .claude/agents/README.md for the agent inventory.

Act as FIBY and answer:
"I need to deploy my Next.js app to Firebase Hosting. Which agents should I use and in what order?"
```

---

## Expected Behavior

FIBY should:
1. Read ONLY the files specified (not the entire repo)
2. Follow the workflow from fiby-coordinator.md
3. Respond with structured output
4. Stay concise (token management)

## If It Doesn't Work

The issue is that `fiby-coordinator` is NOT in the Task tool's hardcoded registry.

**Workaround:** Claude must read the fiby-coordinator.md file and "act as" FIBY, rather than spawning it as a sub-agent.

This is a documentation/prompt-based agent, not a registered sub-agent.

---

## Success Criteria

- [ ] FIBY reads only specified files
- [ ] FIBY follows its workflow steps
- [ ] Response is structured (Type, Result, Recommendations)
- [ ] No token explosion (doesn't read entire repo)
- [ ] Audit provides score and actionable feedback
- [ ] Create generates valid agent markdown

---

## Report Results

After testing, note:
1. Which test(s) you ran
2. Did FIBY follow instructions?
3. Was context management respected?
4. Any issues encountered?

Report back to the main KODY session.
