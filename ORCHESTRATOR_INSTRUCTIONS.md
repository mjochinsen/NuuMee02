# ORCHESTRATOR INSTRUCTIONS

**Purpose:** How to use TASK_TRACKER.md efficiently for token optimization and workflow management.

---

## OVERVIEW

The orchestrator pattern allows KODY to:
1. Know exactly what to do next
2. Skip reading unchanged files
3. Delegate to specialized agents
4. Track progress without losing context
5. Optimize token usage

---

## WORKFLOW

### Starting a Session

```
1. Read TASK_TRACKER.md → Get current state
2. Read CURRENT STATE section → Know where you are
3. Find next task with ⬜ status
4. Read only the files needed for that task
5. Execute task
6. Update TASK_TRACKER.md
7. Commit if phase milestone reached
```

### Token Optimization

**DO:**
- Read TASK_TRACKER.md first (small file, full context)
- Only read files relevant to current task
- Use agents for complex tasks (they have specialized context)
- Update tracker after each task

**DON'T:**
- Read entire codebase at start
- Re-read files that haven't changed
- Keep large files in context unnecessarily
- Forget to update tracker

---

## USING AGENTS

### When to Delegate

| Task Type | Agent | Why |
|-----------|-------|-----|
| FastAPI endpoints | `api-builder` | Has API patterns, error handling |
| React components | `frontend-dev` | Has component patterns, hooks |
| Deployment | `deployment-orchestrator` | Knows deploy steps |
| Validation | `deployment-validator` | Has test checklist |
| SEO | `seo-meta-tags` | Knows meta patterns |
| Accessibility | `accessibility-auditor` | Has WCAG checklist |
| Performance | `performance-optimizer` | Knows optimization patterns |

### How to Delegate

```markdown
## Delegating to Agent

1. Identify task from TASK_TRACKER.md
2. Check "Agent/Tool" column for recommended agent
3. Provide agent with:
   - Task ID and description
   - Input files needed
   - Expected output
   - Constraints
4. Agent executes and returns result
5. Update TASK_TRACKER.md with result
```

### Agent Call Format

```
TASK: [Task ID] - [Task Description]
INPUT: [Files agent needs to read]
OUTPUT: [Expected files/changes]
CONSTRAINTS: [Any limitations]
```

Example:
```
TASK: 1.3 - Implement POST /auth/register
INPUT: backend/app/auth/models.py, docs/firestore-schema.md
OUTPUT: backend/app/auth/router.py with register endpoint
CONSTRAINTS: Use Firebase Admin SDK, create Firestore user doc with 25 credits
```

---

## TASK STATES

### State Transitions

```
⬜ Not Started
    ↓ (start work)
🔄 In Progress
    ↓ (complete) or → ❌ (blocked)
✅ Complete
```

### When to Use Each State

| State | When |
|-------|------|
| ⬜ | Task not yet started |
| 🔄 | Actively working on task |
| ✅ | Task done and verified |
| ❌ | Cannot proceed (document blocker in Notes) |
| ⏭️ | Intentionally skipped (document reason in Notes) |

---

## PHASE COMPLETION

### Before Marking Phase Complete

1. All tasks have ✅ status
2. All completion criteria checked (in tracker)
3. Manual tests pass (if required)
4. Changes committed with phase message

### Phase Commit Messages

```
Phase 0: Foundation structure complete
Phase 1: Authentication complete
Phase 2: Stripe payments complete
Phase 3: Upload system complete
Phase 4: Job creation complete
Phase 5: Worker complete
Phase 6: Downloads complete
Phase 7: Subscriptions complete
Phase 8: Referral and affiliate complete
Phase 9: Launch ready
```

---

## HANDLING BLOCKERS

### When Blocked

1. Change task status to ❌
2. Add blocker description to Notes column
3. Check if other tasks can proceed
4. Report blocker to user

### Common Blockers

| Blocker | Resolution |
|---------|------------|
| Missing credentials | Check CREDENTIALS_INVENTORY.md |
| API not deployed | Complete deployment task first |
| Missing Figma design | Check FromFigmaMake/ or ask user |
| Dependency not met | Complete prerequisite phase first |

---

## CONTEXT MANAGEMENT

### What to Keep in Context

**Always:**
- TASK_TRACKER.md (current state)
- Current task's input files
- CREDENTIALS_INVENTORY.md (when doing config)

**Load When Needed:**
- docs/firestore-schema.md (database work)
- docs/PRICING_STRATEGY.md (payment work)
- FromFigmaMake/ files (UI work)

**Never Keep:**
- Completed phase files (unless modifying)
- Large generated files
- Node modules, build artifacts

### Context Refresh

If context is getting large:
1. Save current progress to TASK_TRACKER.md
2. Commit changes
3. Start fresh context
4. Read only TASK_TRACKER.md
5. Continue from current task

---

## REPORTING

### After Each Task

Update TASK_TRACKER.md:
```markdown
| 1.3 | Implement POST /auth/register | ✅ | `api-builder` | router.py | Created with Firestore integration |
```

### After Each Phase

Update CURRENT STATE:
```markdown
## CURRENT STATE

**Current Phase:** 2
**Current Task:** 2.1
**Blockers:** None
**Last Updated:** 2025-11-27 15:30
```

Update SUMMARY:
```markdown
| 1 - Auth | 19 | 19 | ✅ |
| 2 - Payments | 14 | 0 | ⬜ |
```

### To User

After completing a phase:
```
Phase [N] complete.

Completed:
- [List of what was built]

Next:
- Phase [N+1]: [Goal]
- First task: [Task description]

Ready to proceed?
```

---

## QUICK REFERENCE

### Start of Day
```
1. Read TASK_TRACKER.md
2. Check CURRENT STATE
3. Continue from last task
```

### End of Day
```
1. Update all task statuses
2. Update CURRENT STATE
3. Commit TASK_TRACKER.md
4. Note any blockers for next session
```

### Stuck?
```
1. Check task dependencies
2. Check CREDENTIALS_INVENTORY.md
3. Check relevant docs/
4. Ask user for clarification
```

---

*Use this file as reference. The actual state lives in TASK_TRACKER.md.*