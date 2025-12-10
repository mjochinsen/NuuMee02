---
description: Run TypeScript type checking on frontend
---

# TypeScript Type Check

Run type checking on the NuuMee frontend.

## Your Task

Run TypeScript compiler in check mode (no emit):

```bash
cd /home/user/NuuMee02/frontend && pnpm tsc --noEmit 2>&1
```

## Output Format

**If no errors:**
```
## TypeScript Check

✅ **All clear** - No type errors found
```

**If errors exist:**
```
## TypeScript Check

❌ **X errors found**

### First 10 errors:
[list errors with file:line format]

### Quick fixes:
- Run `pnpm tsc --noEmit` to see all errors
- Most common: missing types, null checks, import issues
```

## Tips

- Link file paths as clickable: `[file.ts:42](frontend/file.ts#L42)`
- Group errors by file if many
- Suggest `pnpm add -D @types/xxx` for missing type packages
