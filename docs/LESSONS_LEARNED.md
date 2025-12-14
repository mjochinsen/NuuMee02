# NuuMee Project - Lessons Learned

**Created:** 2025-11-27
**Purpose:** Avoid repeating mistakes from 35,000+ lines of over-engineered code

## TL;DR - Top 5 Rules

1. **Only logout on 401, never 403** - 403 = show error, not force logout
2. **Check backend endpoints before frontend work** - No assumptions
3. **Firebase Hosting Site = default (wanapi-prod)** - Not nuumee-66a48
4. **GCS signing: use credentials=, not access_token=**
5. **Static export = no dynamic routes** - Use query params or client-side

---

## Critical Mistakes to NEVER Repeat

### 1. Auth Interceptor Logout Loop (CRITICAL)
**What Happened:** The API interceptor was signing out users on 403 (Forbidden) errors.

**Why It's Wrong:** 403 means "you don't have permission" not "you're not logged in". A 403 should show an error message, not force logout.

**The Bug:**
```typescript
// BAD - This was the problem
if (response.status === 403) {
  auth.signOut();  // WRONG! This causes infinite login loops
  router.push('/login');
}
```

**The Fix:**
```typescript
// GOOD - Only logout on 401
if (response.status === 401) {
  auth.signOut();
  router.push('/login');
}
// 403 = show "Access Denied" message, don't logout
```

**Rule:** Only sign out on 401 (Unauthorized). Never on 403 (Forbidden).

---

### 2. Backend-Frontend Endpoint Mismatch
**What Happened:** Phase 7 frontend was built assuming endpoint paths that didn't exist in Phase 5 backend.

**Result:** 15 endpoint mismatches. Nothing worked. Hours wasted.

**Root Cause:**
- No OpenAPI spec enforced after backend deployment
- Frontend architect designed from scratch instead of checking backend
- No validation step before implementation

**Prevention:**
```bash
# ALWAYS do this before frontend work:
curl https://[api-url]/openapi.json > openapi.yaml
# Then READ the spec before designing anything
```

**Rule:** Backend OpenAPI spec is the single source of truth. Frontend MUST match exactly.

---

### 3. Over-Engineering Everything
**What Happened:** Built 35,000+ lines for an MVP that needed ~3,000.

**Examples of Over-Engineering:**
- 8 milestone blueprints (400KB of planning docs)
- 39 specialized agents for a simple app
- Multi-phase architecture with orchestrators
- Abstract factory patterns for simple CRUD
- 5 layers of validation for one form

**Signs You're Over-Engineering:**
- More than 3 abstraction layers
- Files with only 1-2 functions
- "Just in case" code for scenarios that won't happen
- Spending more time on architecture than building
- Can't explain the flow in 2 sentences

**Rule:** Build the simplest thing that works. Refactor later IF needed.

---

### 4. Not Testing Auth Flow Early
**What Happened:** Auth bugs discovered late in development, after 30+ components built.

**Prevention:**
1. Test login/logout first
2. Test token refresh
3. Test protected routes
4. THEN build features

**Rule:** Auth must work before building anything else.

---

### 5. Hardcoded Paths in Reusable Code
**What Happened:** Agents had paths like `apps/web/` hardcoded, making them useless in other projects.

**Example:**
```markdown
# BAD
Prompt: "Configure Next.js at apps/web/ for static export"

# GOOD
Prompt: "Configure Next.js at [PROJECT_PATH] for static export"
```

**Rule:** Make tools generic. Pass paths as parameters.

---

## Useful Hints & Shortcuts

### Firebase

```bash
# Quick deploy
firebase deploy --only hosting

# Test locally first
firebase emulators:start --only hosting

# Check login status
firebase login:list

# Switch projects
firebase use wanapi-prod
```

### Git Recovery

```bash
# Recover deleted file (if not committed)
git restore <filename>

# Recover from last commit
git checkout HEAD -- <filename>

# See what changed
git diff

# Undo last commit (keep changes)
git reset --soft HEAD~1
```

### Quick Checks

```bash
# Check if port is in use
lsof -i :3000

# Kill process on port
kill $(lsof -t -i:3000)

# Check disk space
df -h

# Find large files
find . -size +10M -type f
```

### TypeScript

```bash
# Type check without building
pnpm tsc --noEmit

# Find type errors in specific file
pnpm tsc --noEmit src/file.ts
```

---

## Best Tools & Agents

### Most Useful Agents
| Agent | When to Use |
|-------|-------------|
| `deployment-validator.md` | After every deployment |
| `accessibility-auditor.md` | Before launch |
| `performance-optimizer.md` | When app feels slow |
| `documentation-generator.md` | After major features |

### Skip These (Over-Engineered)
- Complex orchestrators (milestone-orchestrator, phase7-orchestrator)
- Architecture planning agents (architect-opus, frontend-architect-opus)
- Multi-step pipelines (workflow-coordinator)

### Most Useful Commands
| Command | Purpose |
|---------|---------|
| `/check-todos` | Track progress |
| `/create-prompt` | Write better prompts |

---

## Project Structure Best Practices

### Keep It Flat
```
# BAD - Too nested
src/
  features/
    auth/
      components/
        forms/
          LoginForm/
            index.tsx
            styles.ts
            types.ts

# GOOD - Flat and simple
src/
  components/
    LoginForm.tsx
    Header.tsx
  pages/
    login.tsx
    index.tsx
```

### One File Per Component
```typescript
// BAD - Separate files for everything
// LoginForm/index.tsx
// LoginForm/styles.ts
// LoginForm/types.ts
// LoginForm/hooks.ts
// LoginForm/utils.ts

// GOOD - Everything in one file until it grows
// LoginForm.tsx (includes styles, types, hooks)
```

---

## Environment Variables

### Never Commit These
```
.env
.env.local
.env.production
credentials.json
serviceAccountKey.json
```

### Always Have a Template
```bash
# .env.example (committed)
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_FIREBASE_API_KEY=
STRIPE_SECRET_KEY=

# .env.local (NOT committed)
NEXT_PUBLIC_API_URL=https://actual-url.com
...
```

---

## Common Pitfalls

### 1. Forgetting `NEXT_PUBLIC_` Prefix
```typescript
// BAD - Won't work in browser
process.env.API_URL

// GOOD - Available in browser
process.env.NEXT_PUBLIC_API_URL
```

### 2. useEffect Dependency Array
```typescript
// BAD - Infinite loop
useEffect(() => {
  fetchData();
}, [data]); // data changes on every fetch!

// GOOD - Only run once
useEffect(() => {
  fetchData();
}, []);
```

### 3. Not Handling Loading States
```typescript
// BAD
const data = useFetch('/api/data');
return <div>{data.name}</div>; // Crashes if data is null

// GOOD
const { data, loading, error } = useFetch('/api/data');
if (loading) return <Spinner />;
if (error) return <Error />;
return <div>{data.name}</div>;
```

### 4. Forgetting Error Boundaries
React crashes the whole app on unhandled errors. Wrap sections in error boundaries.

---

## API Design Rules

### Use Consistent Naming
```
# GOOD
GET    /api/users
GET    /api/users/{id}
POST   /api/users
PUT    /api/users/{id}
DELETE /api/users/{id}

# BAD
GET    /api/getUsers
GET    /api/user/{id}
POST   /api/createUser
```

### Always Return Consistent Shapes
```json
// GOOD - Always same structure
{
  "success": true,
  "data": { ... },
  "error": null
}

// BAD - Different shapes
{ "user": { ... } }  // sometimes
{ "data": { ... } }  // other times
{ "result": { ... } } // why not
```

---

## Deployment Checklist

### Before Every Deploy
- [ ] All TypeScript errors fixed (`pnpm tsc --noEmit`)
- [ ] Build succeeds locally (`pnpm build`)
- [ ] Environment variables set in production
- [ ] No console.log statements left
- [ ] No hardcoded localhost URLs

### After Every Deploy
- [ ] Test login flow
- [ ] Test main user journey
- [ ] Check browser console for errors
- [ ] Check network tab for failed requests
- [ ] Test on mobile

---

## When to Start Fresh vs. Fix

### Start Fresh When:
- More than 50% of code needs changing
- Architecture fundamentally wrong
- Can rebuild faster than fix
- Technical debt is blocking progress

### Fix In Place When:
- Issue is isolated to specific files
- Architecture is sound, just buggy
- You understand the existing code
- Less than 30% needs changing

**NuuMee Decision:** Started fresh because auth was broken at the interceptor level, endpoints didn't match, and 35K lines was too much to audit.

---

## Key Numbers to Remember

| Metric | Target | Red Flag |
|--------|--------|----------|
| Component lines | < 200 | > 400 |
| Function lines | < 30 | > 50 |
| File imports | < 10 | > 15 |
| Nesting depth | < 3 | > 5 |
| Build time | < 60s | > 120s |
| Bundle size | < 500KB | > 1MB |

---

## Final Wisdom

1. **Build one thing, test it, then move on.** Don't build 10 features and then discover none of them work.

2. **Read the API spec before writing frontend code.** Not after. Not during. BEFORE.

3. **If you're not sure, keep it simple.** You can always add complexity. Removing it is painful.

4. **Test auth first.** Everything depends on it.

5. **Don't trust your past self.** Document why, not just what.

6. **Backups that depend on git are not backups.** Keep a copy outside version control.

7. **One working feature > ten planned features.**

---

## Claude-Specific Lessons

### 1. Don't Delete .claude or .vscode Folders
**What Happened:** Deleted `.vscode/` folder, broke VS Code appearance. Almost deleted `.claude/` folder containing all agents and chat history.

**Rule:** Never delete configuration folders without explicit user request.

### 2. Backup BEFORE Deleting
**What Happened:** Started deleting files before making complete backup.

**Correct Order:**
1. Create backup folder
2. Copy ALL files to backup
3. Verify backup is complete
4. THEN delete from original

### 3. Git Restore is NOT a Backup
**What Happened:** Assumed `git restore` would recover files. User pointed out: "We're deleting the .git folder!"

**Rule:** If .git might be deleted, make a REAL copy to another folder.

### 4. Read Files Before Modifying
**What Happened:** Made assumptions about file contents without reading first.

**Rule:** Always `Read` a file before `Edit` or `Write`.

### 5. Agents Can't Delete Themselves
Claude Code runs from `.claude/` folder. Deleting it mid-session = disaster.

---

## Stripe Integration Lessons

### 1. Test Mode vs Live Mode
```typescript
// ALWAYS check which mode you're in
const isTestMode = process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_');
console.log(`Stripe mode: ${isTestMode ? 'TEST' : 'LIVE'}`);
```

### 2. Webhook Signature Verification
```typescript
// ALWAYS verify webhook signatures
const sig = request.headers['stripe-signature'];
const event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
// Never trust unverified webhook data
```

### 3. Price IDs Change Between Environments
Test mode price IDs ≠ Live mode price IDs. Store both:
```
STRIPE_PRICE_STARTER_TEST=price_test_xxx
STRIPE_PRICE_STARTER_LIVE=price_live_xxx
```

---

## Cloud Run / Docker Lessons (Dec 2025)

### 1. Docker Layer Caching Can Serve Stale Code
**What Happened:** Source files were correct, `.dockerignore` was in place, `__pycache__` was cleared locally - but Cloud Run kept serving old code after 5+ deployments.

**Root Cause:** Docker layer caching preserved old code. Even `gcloud run deploy` with new code didn't rebuild layers that appeared unchanged.

**The Fix:**
```bash
# Force fresh build with new image tag
gcloud builds submit --tag gcr.io/PROJECT/IMAGE:fresh-v2

# Then deploy that specific image
gcloud run deploy SERVICE --image gcr.io/PROJECT/IMAGE:fresh-v2
```

**Rule:** When code changes aren't reflected after deploy, build a fresh image with a new tag.

### 2. Always Add .dockerignore to Exclude Pycache
```
# backend/.dockerignore
__pycache__
*.pyc
*.pyo
.pytest_cache
.mypy_cache
```

**Rule:** Add `.dockerignore` before first Docker build. It prevents compiled Python files from being included.

### 3. Enum Values Must Match Firestore Data
**What Happened:** Admin users endpoint returned 500 because `UserTier` enum didn't include `creator` tier that existed in Firestore.

**The Bug:**
```python
# BAD - Missing tier values
class UserTier(str, Enum):
    FREE = "free"
    PRO = "pro"

# User in Firestore has subscription_tier: "creator"
# → ValueError: 'creator' is not a valid UserTier
```

**The Fix:**
```python
# GOOD - All tiers included + defensive parsing
class UserTier(str, Enum):
    FREE = "free"
    STARTER = "starter"
    CREATOR = "creator"
    PRO = "pro"

# Defensive parsing with fallback
try:
    tier = UserTier(tier_value)
except ValueError:
    tier = UserTier.FREE  # Safe default
```

**Rule:** Enums must include ALL possible values from Firestore. Use try/except for defensive parsing.

---

## Firestore Lessons

### 0. CRITICAL: Use `credits_balance` NOT `credits` (Dec 2025)
**What Happened:** User documents had TWO credit fields:
- `credits` - old field, used by some admin services
- `credits_balance` - correct field, used by main app

Promo code redemption wrote to `credits` but billing page displayed `credits_balance`. Users appeared to get no credits.

**The Bug:**
```python
# BAD - Wrong field name
user_data.get("credits", 0)
user_ref.update({"credits": new_balance})

# GOOD - Correct field name
user_data.get("credits_balance", 0)
user_ref.update({"credits_balance": new_balance})
```

**Files Fixed:**
- `backend/app/promo/service.py` - promo redemption
- `backend/app/admin/services/users.py` - admin user display + credit adjustment
- `backend/app/admin/services/promos.py` - admin promo redemption

**Rule:** ALWAYS use `credits_balance` for user credit operations. Search for `"credits"` before adding credit logic.

---

### 1. Transactions for Credit Operations
```typescript
// BAD - Race condition possible
const user = await getDoc(userRef);
await updateDoc(userRef, { credits: user.credits - 10 });

// GOOD - Atomic transaction
await runTransaction(db, async (transaction) => {
  const user = await transaction.get(userRef);
  const newCredits = user.data().credits - 10;
  if (newCredits < 0) throw new Error('Insufficient credits');
  transaction.update(userRef, { credits: newCredits });
});
```

### 2. Security Rules Matter
```javascript
// BAD - Anyone can read/write
allow read, write: if true;

// GOOD - Only authenticated users can access their own data
allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
```

### 3. Index Your Queries
Firestore queries with multiple conditions need composite indexes. Create them proactively.

---

## Cost Control

### 1. Set Budget Alerts
- Firebase: Set budget alerts in GCP Console
- Stripe: Monitor webhook volume
- Cloud Run: Set max instances limit

### 2. Monitor Token Usage
Claude API costs add up. Track:
- Tokens per request
- Requests per user
- Cost per feature

### 3. Cache Expensive Operations
```typescript
// Don't call API on every render
const cachedData = useMemo(() => expensiveApiCall(), [dependencies]);
```

---

## Communication Lessons

### 1. Confirm Before Destructive Actions
```
BAD: "I'll delete the apps folder now."
GOOD: "This will delete 35,000 lines of code. Type 'confirm' to proceed."
```

### 2. Show Progress on Long Tasks
```
Processing... (3/10 files complete)
Processing... (7/10 files complete)
Done! 10 files processed.
```

### 3. Explain WHY, Not Just WHAT
```
BAD: "I changed the API endpoint."
GOOD: "I changed the API endpoint because the old one was returning 404s due to the backend update in Phase 5."
```

---

## File Organization

### 1. Credentials in ONE Place
Don't scatter API keys across multiple files. One `CREDENTIALS_INVENTORY.md` rules them all.

### 2. Design Assets Separate from Code
Keep `FromFigmaMake/` separate. Reference it, don't copy-paste into components.

### 3. Documentation Next to Code
```
components/
  Button.tsx
  Button.md       # Documentation lives with component
```

---

## Testing Lessons

### 1. Test the Happy Path First
Don't start with edge cases. Make sure login works before testing "forgot password with invalid email on mobile Safari."

### 2. Manual Testing Before Automated
Automated tests for broken features = wasted effort. Verify manually, then automate.

### 3. Test with Real Data
Mock data hides bugs. Use real Firestore (test project) and real Stripe (test mode).

---

## Time Management

### 1. Time-Box Debugging
If you can't fix it in 30 minutes, step back and reconsider the approach.

### 2. Don't Optimize Prematurely
```
BAD: "Let me add caching to this function that runs once per page load."
GOOD: Ship it. Optimize when it's actually slow.
```

### 3. Know When to Ask
Stuck for an hour? Ask the user. They might have context you don't.

---

*Learn from these mistakes. Don't repeat them.*
