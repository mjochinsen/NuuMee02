---
name: completion-checks
enabled: true
event: stop
pattern: .*
action: warn
---

## Before Completing This Task

Please verify you've completed these checks:

- [ ] **Tests pass** - Run `pnpm test` or relevant test command
- [ ] **Type check passes** - Run `pnpm type-check` or `npx tsc --noEmit`
- [ ] **Build succeeds** - Run `pnpm build` to verify no build errors
- [ ] **Audit clean** - Run `/audit quick` for security & TODO review

If any of these haven't been run yet, please complete them before finishing.

*Note: This is a reminder, not a blocker. Skip if checks aren't applicable to this task.*
