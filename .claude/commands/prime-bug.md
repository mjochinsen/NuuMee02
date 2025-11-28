# Bug Fixing Context Prime

You are debugging an issue in NuuMee. This prime loads debugging context and lessons learned.

## Debugging Workflow

1. **Reproduce** - Understand exactly what's failing
2. **Isolate** - Find the specific file/function
3. **Understand** - Read the code before changing
4. **Fix** - Minimal change to fix the issue
5. **Verify** - Test the fix works
6. **Prevent** - Add to LESSONS_LEARNED.md if significant

## Known Critical Bugs (From LESSONS_LEARNED.md)

### Auth Login Loop (CRITICAL)
```typescript
// WRONG - 403 means "forbidden", not "unauthenticated"
if (response.status === 403) auth.signOut();  // Causes infinite loops!

// RIGHT - Only logout on 401
if (response.status === 401) auth.signOut();
```

### Common Pitfalls

**Environment Variables**
```typescript
// WRONG - Won't work in browser
process.env.API_URL

// RIGHT - Available in browser
process.env.NEXT_PUBLIC_API_URL
```

**useEffect Dependencies**
```typescript
// WRONG - Infinite loop
useEffect(() => { fetchData(); }, [data]);

// RIGHT - Run once
useEffect(() => { fetchData(); }, []);
```

**Loading States**
```typescript
// WRONG - Crashes if data is null
return <div>{data.name}</div>;

// RIGHT - Handle loading
if (loading) return <Spinner />;
if (error) return <Error />;
return <div>{data.name}</div>;
```

## Quick Checks

```bash
# TypeScript errors
cd frontend && pnpm tsc --noEmit

# Check what port is in use
lsof -i :3000

# View recent git changes
git diff HEAD~3

# Check logs
tail -20 .claude/logs/tools.jsonl | jq
```

## Time-Boxing Rule

**If stuck for 30 minutes:**
1. Step back - is the approach wrong?
2. Check LESSONS_LEARNED.md
3. Ask the user for clarification
4. Don't keep trying the same thing

## Files to Check

| Symptom | Check These Files |
|---------|------------------|
| Auth issues | `frontend/lib/firebase.ts`, `frontend/components/AuthProvider.tsx` |
| API errors | `frontend/lib/api.ts`, `backend/app/main.py` |
| Build fails | `frontend/tsconfig.json`, `frontend/next.config.js` |
| Deploy fails | `firebase.json`, `.firebaserc`, `Dockerfile` |

## After Fixing

If the bug was significant or could recur:
1. Add entry to `LESSONS_LEARNED.md`
2. Include: What happened, why it's wrong, the fix
3. Commit with clear message explaining the bug
