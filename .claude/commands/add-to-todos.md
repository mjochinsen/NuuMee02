---
description: Add item to TODO list with context
argument-hint: [optional todo description]
---

# Add to TODOs

Add a todo item to `TO-DOS.md` in the working directory, preserving context for future reference.

## Process

### Step 1: File Management

- Check if `TO-DOS.md` exists in working directory
- If exists: Read current contents
- If not: Will create it in Step 4

---

### Step 2: Duplicate Detection

Search existing todos for similar items.

**If similar todo found**, use `AskUserQuestion` with options:
- **Skip** - Don't add (already tracked)
- **Replace** - Update existing todo with new information
- **Add anyway** - Add as separate item (different aspect/approach)

---

### Step 3: Content Extraction

#### If command has arguments (e.g., `/add-to-todos Fix the login redirect bug`):

- Use provided text as todo title
- Extract file references from recent conversation (last 5-10 messages)
- Capture current context if relevant

#### If no arguments:

Analyze recent conversation (last 10-15 messages) for:
- **Problem or opportunity** identified
- **Affected files** with line numbers if available
- **Technical details** mentioned
- **Root cause or approach** discussed
- **Why it matters** (impact/urgency)

---

### Step 4: Entry Format

Each todo entry includes:

**Header:**
```markdown
## [Brief Context Title] - YYYY-MM-DD HH:MM
```

**Body:**
```markdown
- **[Action Verb] [Component/Feature]** - [Concise description]
  - **Problem:** [What's wrong or what's needed]
  - **Files:** [Affected files with line numbers if known]
  - **Solution:** [Hints about approach, if discussed]
  - **Impact:** [Why this matters - optional but recommended]
```

**Action verbs to use:**
- Fix, Implement, Refactor, Investigate, Optimize, Document, Test, Update, Add, Remove, etc.

**Example:**
```markdown
## Fix Authentication Redirect - 2025-01-18 14:23

- **Fix Login Flow** - Users redirected to 404 after successful login instead of dashboard
  - **Problem:** After OAuth callback, redirect logic fails for users without profile completion
  - **Files:** apps/web/src/pages/api/auth/callback.ts:45-67, apps/web/src/middleware/auth.ts:23
  - **Solution:** Check profile completion status before redirect, add fallback to /onboarding
  - **Impact:** Blocking new user signups, affects ~30% of OAuth logins
```

---

### Step 5: Write to File

1. Append new todo to `TO-DOS.md`
2. If file doesn't exist, create it with header:
   ```markdown
   # TODO List

   Items to address in this project.

   ---

   [new todo here]
   ```

3. Preserve existing content, add new entry at the bottom

---

### Step 6: Confirmation

Confirm save with:
```
✓ Added to TO-DOS.md:
  "Fix Login Flow - Users redirected to 404 after successful login"

Continue with your current task?
```

Use `AskUserQuestion` with options:
- **Yes** - Continue what we were doing
- **Show me the TODO list** - Display full TO-DOS.md
- **Add another** - Add another todo item

---

## Key Principles

- **Preserve context**: Future you should understand this weeks later without referring back to this conversation
- **Be specific**: Include file paths with line numbers when possible
- **Capture reasoning**: Why is this needed? What's the impact?
- **Action-oriented**: Start with clear action verbs
- **Optional solutions**: Capture approach ideas if discussed, but don't force it if unclear
- **No duplication**: Check for similar items before adding

---

## Example Scenarios

### Scenario 1: Bug Discovery During Implementation
```
[User working on auth system]
User: "The logout button redirects to /login but should go to homepage"
Assistant: /add-to-todos

[Analyzes conversation, creates:]
## Fix Logout Redirect - 2025-01-18 15:45

- **Fix Logout Button Redirect** - Logout redirects to /login instead of homepage
  - **Problem:** After user clicks logout, they're sent to /login page instead of /
  - **Files:** apps/web/src/components/Navbar.tsx:89 (logout button handler)
  - **Solution:** Change redirect target from '/login' to '/' in logout handler
  - **Impact:** Minor UX issue, affects all logged-in users
```

### Scenario 2: Feature Request
```
User: /add-to-todos Implement dark mode toggle in settings
Assistant:

[Creates:]
## Implement Dark Mode Toggle - 2025-01-18 16:12

- **Add Dark Mode Toggle** - Allow users to switch between light/dark themes
  - **Problem:** Users requesting dark mode for better nighttime viewing
  - **Files:** apps/web/src/pages/account/settings.tsx (add toggle), apps/web/src/pages/_app.tsx (theme provider)
  - **Solution:** Use next-themes package, add toggle in settings page, persist preference in localStorage
  - **Impact:** Top 3 feature request from users, improves accessibility
```

### Scenario 3: Technical Debt
```
[During code review]
User: "This auth logic is duplicated in 5 files"
Assistant: /add-to-todos

[Creates:]
## Refactor Auth Logic - 2025-01-18 17:30

- **Extract Duplicate Auth Logic** - Authentication checks duplicated across multiple files
  - **Problem:** Same auth validation code repeated in 5+ components, hard to maintain
  - **Files:** apps/web/src/pages/account/*.tsx, apps/web/src/components/ProtectedRoute.tsx
  - **Solution:** Create useAuth hook or auth utility function, import in all locations
  - **Impact:** Reduces code duplication, makes security updates easier
```

---

## Anti-Patterns to Avoid

❌ Vague todos: "Fix the thing"
✅ Specific todos: "Fix login redirect bug in callback.ts:45"

❌ No context: "Update the component"
✅ With context: "Update Navbar to show user avatar instead of text username"

❌ Missing files: "There's a bug in the auth system"
✅ With files: "Bug in apps/web/src/pages/api/auth/callback.ts:67"

❌ No reasoning: "Refactor the code"
✅ With reasoning: "Refactor for maintainability - currently duplicated in 5 files"
