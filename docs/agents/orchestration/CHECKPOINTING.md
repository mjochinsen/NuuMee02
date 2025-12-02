# Checkpointing & Context Management

## Based on Anthropic's Multi-Agent Research System

> "The design combines the adaptability of AI agents with deterministic
> safeguards like retry logic and regular checkpoints."

---

## Why Checkpointing?

1. **Context limits** - 200k tokens fills up
2. **Failure recovery** - Resume without restarting
3. **Session handoff** - Continue in new session
4. **Audit trail** - Track what was done

---

## Checkpoint Triggers

Create checkpoint when:

| Trigger | Action |
|---------|--------|
| Task completed | `/remember` + update TASK_TRACKER |
| Phase completed | `/whats-next` + commit |
| Context > 100k tokens | Summarize + store in memory |
| Before risky operation | Save state first |
| Session ending | `/whats-next` |

---

## Checkpoint Storage

### 1. TASK_TRACKER.md (Primary)
```markdown
| 8.5.3 | Test job download | ✅ | Manual | Test passed | Signed URLs work |
```
- Single source of truth
- Updated after each task
- Machine-readable status

### 2. Memory System (Insights)
```bash
/remember insight: Phase 8 complete - referral gives 25 credits
  to new user, 100 to referrer on purchase [tags: phase8, milestone]
```
- Captures learnings
- Searchable via `/recall`
- Persists across sessions

### 3. whats-next.md (Handoff)
```bash
/whats-next
```
- Full context dump
- Detailed next steps
- Use before session end

### 4. Git Commits (Code State)
```bash
git commit -m "Phase 8: Referral complete"
```
- Code checkpoints
- Recoverable state
- Audit trail

---

## Recovery Flow

### On Failure
```
1. Check TASK_TRACKER.md for last completed task
2. Check git log for last commit
3. /recall {domain} for relevant insights
4. Resume from last known good state
```

### On Session Start
```
1. Read TASK_TRACKER.md
2. Read whats-next.md (if exists)
3. /recall recent to load context
4. Continue from current task
```

---

## Context Compaction

When context gets large:

### Step 1: Summarize
```
Current work summary:
- Completed: Phase 8 tasks 1-10
- In progress: 8.5.3 (testing downloads)
- Key decisions: GCS signing uses credentials= param
- Blockers: None
```

### Step 2: Store
```bash
/remember insight: Phase 8.5 progress - GCS signing fixed,
  retry button working, testing downloads [tags: phase85, checkpoint]
```

### Step 3: Reference
Instead of re-reading files, use stored knowledge:
```bash
/recall gcs signing
/recall phase 8.5
```

---

## Checkpoint Frequency

| Task Type | Checkpoint Every |
|-----------|-----------------|
| Code implementation | After each file written |
| Multi-file change | After all files written |
| Deployment | After verification |
| Bug fix | After fix confirmed |
| Phase completion | Full checkpoint + commit |

---

## Commands Reference

| Command | When to Use |
|---------|-------------|
| `/remember category: content [tags]` | After completing work |
| `/recall query` | Before starting work |
| `/whats-next` | End of session |
| `/audit quick` | Before commits |
| Update TASK_TRACKER.md | After each task |

---

## Example: Task 8.5.6 Checkpoint

```bash
# After completing auto-refill backend endpoint

# 1. Update TASK_TRACKER.md
| 8.5.6 | Auto-refill: Backend endpoint | ✅ | api-builder | credits/router.py | POST /credits/auto-refill |

# 2. Store insight
/remember pattern: auto-refill stores threshold and
  package_id in user doc, triggers on job completion
  [tags: billing, auto-refill]

# 3. Commit
git add backend/app/credits/router.py
git commit -m "8.5.6: Add auto-refill settings endpoint"

# 4. Ready for next task (8.5.7)
```

---

## Anti-Patterns

❌ **Don't:**
- Work for hours without checkpointing
- Rely only on conversation history
- Skip TASK_TRACKER updates
- Forget to commit after changes

✅ **Do:**
- Checkpoint after every task
- Use multiple storage mechanisms
- Keep TASK_TRACKER current
- Commit frequently
