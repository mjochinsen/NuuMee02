---
description: Run a manual project audit and generate a health report
arguments:
  - name: scope
    description: "full (all checks) or quick (security + TODOs only)"
    required: false
---

# Manual Project Audit

Run the nightly-auditor agent to scan the codebase and generate a health report.

## Your Task

1. Determine scope from arguments: `$ARGUMENTS`
   - If empty or "full": Run complete audit
   - If "quick": Run only security scan and TODO count

2. Execute the nightly-auditor agent:

```
Read .claude/agents/nightly-auditor.md and execute it.
Generate today's audit report.
Scope: {full or quick}
```

3. After completion, show the user:
   - Risk score
   - Critical issues (if any)
   - Report location

## Quick Audit (if scope = quick)

Run only these checks:
```bash
# Security scan
grep -rn "sk_live\|pk_live\|API_KEY=" --include="*.ts" --include="*.py" . 2>/dev/null | grep -v node_modules | head -10

# TODO count
grep -rn "TODO\|FIXME" --include="*.ts" --include="*.tsx" --include="*.py" . 2>/dev/null | grep -v node_modules | wc -l
```

Report these results directly without creating a full report file.

## Examples

```
/audit              # Full audit
/audit full         # Full audit (explicit)
/audit quick        # Quick scan only
```
