# Nightly Auditor System

Autonomous project health monitoring for NuuMee.

## Overview

The Nightly Auditor scans the codebase daily and generates a health report. It runs automatically via GitHub Actions at 6 AM UTC and can be triggered manually.

## Architecture

```
.claude/agents/nightly-auditor.md    # Agent definition
.github/workflows/nightly-audit.yml   # GitHub Action scheduler
.claude/commands/audit.md             # Manual trigger command
.claude/reports/daily/                # Report storage
```

## What It Checks

| Check | Purpose | Risk Level |
|-------|---------|------------|
| **Security Scan** | Exposed secrets, hardcoded credentials | CRITICAL |
| **TODO Tracking** | Count and list TODO/FIXME/HACK comments | MEDIUM |
| **Dependency Health** | Outdated packages, vulnerabilities | MEDIUM |
| **Test Coverage** | Count test files, identify gaps | LOW |
| **Documentation** | Missing READMEs, doc gaps | LOW |
| **Git Health** | Uncommitted changes, recent activity | INFO |

## Report Format

Reports are stored in `.claude/reports/daily/{YYYY-MM-DD}.md`:

```markdown
# Daily Audit Report: 2024-11-28

## Risk Score: 3/10

| Metric | Value |
|--------|-------|
| TODO count | 15 |
| Test files | 12 |
| Uncommitted | 0 |

## Security Scan
- No exposed secrets
- No hardcoded credentials

## TODO Items
Total: 15
- frontend/src/auth.tsx:45 - TODO: Add refresh token handling
- ...

## Action Items
1. [MEDIUM] Address TODO backlog (15 items)
```

## Usage

### Automatic (GitHub Actions)

The audit runs automatically every day at 6 AM UTC.

To view the workflow:
1. Go to GitHub repo → Actions
2. Select "Nightly Audit" workflow
3. View run history and logs

To trigger manually:
1. Go to Actions → Nightly Audit
2. Click "Run workflow"
3. Optionally enable "full scan"

### Manual (Claude Code)

**Via slash command:**
```
/audit              # Full audit
/audit quick        # Quick scan (security + TODOs only)
```

**Via agent invocation:**
```
Run the nightly-auditor agent to scan the codebase.
```

### Viewing Reports

```bash
# List all reports
ls -la .claude/reports/daily/

# View today's report
cat .claude/reports/daily/$(date +%Y-%m-%d).md

# View last 7 days
ls -t .claude/reports/daily/ | head -7
```

## Risk Scoring

The risk score (1-10) is calculated based on:

| Finding | Score Impact |
|---------|--------------|
| Exposed API keys | +6 |
| Hardcoded credentials | +5 |
| >50 TODOs | +1 |
| <10 test files | +1 |
| Critical vulnerabilities | +3 |
| No recent commits | +1 |

**Interpretation:**
- **1-3**: Healthy codebase
- **4-6**: Minor issues, address when convenient
- **7-8**: Significant issues, prioritize fixes
- **9-10**: Critical issues, fix immediately

## Action Items Priority

Reports include prioritized action items:

| Priority | Meaning | Response Time |
|----------|---------|---------------|
| CRITICAL | Security risk, data exposure | Immediate |
| HIGH | Breaking issues, blocking bugs | Same day |
| MEDIUM | Quality issues, tech debt | This sprint |
| LOW | Nice to have, improvements | When convenient |

## Configuration

### Changing Schedule

Edit `.github/workflows/nightly-audit.yml`:

```yaml
on:
  schedule:
    # Current: 6 AM UTC daily
    - cron: '0 6 * * *'
    # Alternative: Every Monday at 9 AM UTC
    - cron: '0 9 * * 1'
```

### Adding Custom Checks

Edit `.claude/agents/nightly-auditor.md` to add new checks in the "Gather Metrics" section.

### Notification Integration

To add Slack/Discord notifications, add a step to the GitHub Action:

```yaml
- name: Notify Slack
  if: steps.security.outcome == 'failure'
  uses: slackapi/slack-github-action@v1
  with:
    channel-id: 'YOUR_CHANNEL'
    slack-message: 'Nightly Audit found issues!'
  env:
    SLACK_BOT_TOKEN: ${{ secrets.SLACK_BOT_TOKEN }}
```

## Maintenance

### Cleaning Old Reports

Reports older than 30 days can be cleaned:

```bash
find .claude/reports/daily/ -mtime +30 -delete
```

### Disabling Temporarily

To pause the audit:
1. Go to GitHub repo → Actions
2. Select "Nightly Audit"
3. Click "..." → "Disable workflow"

### Troubleshooting

**Workflow not running:**
- Check GitHub Actions is enabled for the repo
- Verify cron syntax is correct
- Check for workflow errors in Actions tab

**Reports not committing:**
- Ensure `contents: write` permission is set
- Check branch protection rules allow bot commits

**False positives in security scan:**
- Add patterns to exclusion list in the grep commands
- Use `.auditignore` file (if implemented)

## Integration with Memory System

Critical findings can be written to agent memory:

```bash
# After audit completes with critical issues
python3 .claude/memory/writer.py \
  -c bug \
  -m "Audit found exposed API key in config.ts" \
  -t "security,audit,critical"
```

This ensures critical findings persist across sessions.

## Files Reference

| File | Purpose |
|------|---------|
| `.claude/agents/nightly-auditor.md` | Agent definition |
| `.github/workflows/nightly-audit.yml` | GitHub Action |
| `.claude/commands/audit.md` | Manual command |
| `.claude/reports/daily/` | Report storage |
| `docs/NIGHTLY_AUDITOR.md` | This documentation |
