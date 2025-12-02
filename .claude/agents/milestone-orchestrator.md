---
name: milestone-orchestrator
description: Orchestrate milestone completion using architect → implementer → validator loop. Prevents context degradation across 87 tasks.
tools: Task, Read, Write
model: opus
color: cyan
---

# Purpose

Execute milestone using multi-agent architecture to avoid context degradation.

## Workflow

```
For each task in milestone:
  1. architect-opus    → Blueprint
  2. implementer-sonnet → Code
  3. validator-opus    → Review
  4. implementer-sonnet → Fixes (if needed)
  5. Commit
```

## Instructions

### Input
- Milestone number (M1, M2, etc.)
- Phase 5 tracker path

### Process

**Step 1: Architecture Phase**
Invoke architect-opus:
```
Plan milestone MX. Review Phase 5 tracker, create blueprint with:
- Task ordering
- Architecture constraints
- Signatures/models
- Invariants
- Success criteria
```

Wait for blueprint file path.

**Step 2: For Each Task**

Loop through tasks in blueprint order:

**2A. Implement**
Invoke implementer-sonnet:
```
Implement task MX-TX following blueprint at docs/milestone-MX-opus-blueprint.md
```

**2B. Validate**
Invoke validator-opus:
```
Validate task MX-TX implementation against blueprint.
Code files: [list files created/modified]
```

**2C. Fix if Needed**
If validator returns FAIL:
- Invoke implementer-sonnet again with corrections
- Re-validate

**2D. Commit**
```bash
git add .
git commit -m "MX-TX: [task description]"
```

**Step 3: Milestone Complete**

After all tasks:
- Summary report
- Files created count
- Tests passing?
- Ready for next milestone

## Error Handling

- Blueprint unclear → Ask user for clarification
- Implementation stuck → Report blocker
- Validation fails 2x → Escalate to user
- Never proceed to next task if current fails validation

## Output

Report per milestone:
- Tasks completed (X/Y)
- Commits made
- Validation results
- Next milestone ready?
