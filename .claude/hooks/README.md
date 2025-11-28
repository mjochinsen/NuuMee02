# Claude Code Hooks - NuuMee02

## Quick Reference

| Hook | Script | Purpose |
|------|--------|---------|
| SessionStart | session-start.py | Inject project context |
| UserPromptSubmit | user-prompt-submit.py | Log prompts, add reminders |
| PreToolUse | pre-tool-use.py | Auto-approve/deny operations |
| PostToolUse | post-tool-use.py | Log results, track changes |
| SubagentStop | subagent-stop.py | Track KODY/FIBY agents |
| Stop | stop.py | Session summary |
| SessionEnd | session-end.py | Finalize logs |
| PreCompact | pre-compact.py | Preserve critical context |
| Notification | notification.py | Log notifications |

## Log Files

| File | Contents |
|------|----------|
| logs/prompts.jsonl | User prompts |
| logs/tools.jsonl | Tool usage |
| logs/agents.jsonl | Sub-agent activity |
| logs/sessions.jsonl | Session events |
| logs/session_summaries.jsonl | Per-session changes |
| logs/notifications.jsonl | Notifications |
| logs/fiby_invocations.jsonl | FIBY calls |

## Auto-Approved Operations

- Read any file in project
- Write to: .claude/, frontend/, backend/, worker/, docs/
- Edit: .md, .ts, .tsx, .py, .json files
- Run: pnpm, npm, git, ls, python, node, firebase, gcloud
- Glob, Grep, Task, WebFetch, WebSearch

## Blocked Operations

- Write to: ~/.ssh/, ~/.gnupg/, ~/.aws/, /etc/
- Run: sudo, rm -rf /, chmod 777, shutdown, kill -9

## Quick Commands

```bash
# View recent tool usage
tail -5 .claude/logs/tools.jsonl | jq

# View agent invocations
cat .claude/logs/agents.jsonl | jq

# Clear all logs
rm .claude/logs/*.jsonl

# Test a hook
echo '{"tool_name":"Read"}' | python3 .claude/hooks/pre-tool-use.py
```

## Configuration

Settings in: `.claude/settings.json`
Documentation: `.claude/HOW_TO_USE_HOOKS.md`
