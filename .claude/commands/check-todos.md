---
description: Review and manage TODO list
---

# Check TODOs

Review the `TO-DOS.md` file and help manage todo items.

## Process

### Step 1: Read TO-DOS.md

Check if file exists:
```bash
test -f TO-DOS.md && cat TO-DOS.md || echo "No TODO file found. Use /add-to-todos to create one."
```

If file doesn't exist, inform user and exit.

---

### Step 2: Parse and Categorize

Parse the file and extract:
- Total number of todos
- Group by category (bugs, features, refactoring, documentation, etc.)
- Identify any high-priority items (look for keywords: critical, urgent, blocking, high-priority)
- Note dates (oldest vs newest)

**Category Detection:**
- "Fix" → Bugs
- "Implement", "Add" → Features
- "Refactor", "Extract", "Optimize" → Refactoring
- "Document", "Write docs" → Documentation
- "Investigate", "Research" → Investigation
- "Test" → Testing

---

### Step 3: Display Summary

Show organized summary:

```
📋 TODO List Summary (12 items)

🐛 BUGS (3):
  1. [2025-01-18] Fix login redirect - apps/web/src/pages/api/auth/callback.ts:45
  2. [2025-01-17] Handle null user avatars - apps/web/src/components/Navbar.tsx:89
  3. [2025-01-16] Fix type error in profile page - apps/web/src/pages/account/profile.tsx:120

✨ FEATURES (4):
  4. [2025-01-18] Implement dark mode toggle - apps/web/src/pages/account/settings.tsx
  5. [2025-01-17] Add export to CSV functionality - apps/web/src/pages/videos/jobs.tsx
  6. [2025-01-15] Create user onboarding flow - apps/web/src/pages/onboarding.tsx
  7. [2025-01-14] Add video preview thumbnails - apps/web/src/components/VideoCard.tsx

🔧 REFACTORING (3):
  8. [2025-01-18] Extract duplicate auth logic - apps/web/src/pages/account/*.tsx
  9. [2025-01-16] Optimize video upload component - apps/web/src/components/UploadZone.tsx
  10. [2025-01-15] Consolidate API client code - apps/web/src/lib/api/*.ts

📝 DOCUMENTATION (2):
  11. [2025-01-17] Document API integration - README.md
  12. [2025-01-14] Add component usage examples - packages/ui/README.md

⚠️ High Priority: Items #1, #4, #8 (mentioned as urgent/blocking)
📅 Oldest: 2025-01-14 | Newest: 2025-01-18
```

---

### Step 4: Offer Actions

Use `AskUserQuestion` with options:
- **Mark complete** - Check off finished item(s)
- **Add details** - Expand on an existing todo
- **Remove** - Delete obsolete todo(s)
- **Prioritize** - Reorder or flag important items
- **Export** - Copy list to clipboard/file
- **Continue** - Return to current work

---

### Step 5: Execute Action

#### Mark Complete

1. Ask which item(s) to mark (by number or description)
2. Add strikethrough or move to "Completed" section:
   ```markdown
   ## ✅ Completed - 2025-01-18

   - **~~Fix Login Flow~~** - ✅ Completed on 2025-01-18
     - Solution implemented in apps/web/src/pages/api/auth/callback.ts
   ```
3. Update TO-DOS.md
4. Confirm: "✓ Marked item #1 as complete"

#### Add Details

1. Ask which item to expand
2. Read current entry
3. Ask what details to add (files, solution ideas, priority, etc.)
4. Update entry with new information
5. Confirm update

#### Remove

1. Ask which item(s) to remove
2. Confirm deletion (show what will be deleted)
3. Remove from file
4. Confirm: "✓ Removed 2 items from TODO list"

#### Prioritize

1. Ask how to prioritize:
   - Move to top
   - Add "🔴 HIGH PRIORITY" marker
   - Reorder by date
   - Group by impact
2. Update file with new order/markers
3. Confirm changes

#### Export

1. Ask format:
   - Plain text
   - Markdown (as-is)
   - GitHub Issues format
   - JSON
2. Generate formatted output
3. Save to file or display for copying

---

### Step 6: Confirm and Continue

After action completion:
```
✓ TODO list updated

What would you like to do next?
- Check the updated list
- Continue with current work
- Add a new todo
```

---

## Example Interactions

### Example 1: Quick Review
```
User: /check-todos

📋 TODO List Summary (5 items)

🐛 BUGS (2):
  1. [2025-01-18] Fix login redirect
  2. [2025-01-17] Handle null avatars

✨ FEATURES (3):
  3. [2025-01-18] Dark mode toggle
  4. [2025-01-17] CSV export
  5. [2025-01-16] Onboarding flow

What would you like to do?
- Mark complete | Add details | Remove | Prioritize | Export | Continue

User: Continue

✓ Returning to current work
```

### Example 2: Mark Complete
```
User: /check-todos

[Shows list]

User: Mark complete

Which item(s)? (number or description)

User: 1 and 3

✓ Marked complete:
  #1 - Fix login redirect (moved to Completed section)
  #3 - Dark mode toggle (moved to Completed section)

Updated TODO list now has 3 remaining items.
```

### Example 3: Prioritize
```
User: /check-todos

[Shows list]

User: Prioritize

How should I prioritize?
- Move to top | Add HIGH PRIORITY marker | Reorder by date | Group by impact

User: Move item 4 to top

✓ Moved "CSV export functionality" to top of list (now item #1)

The most urgent item is now: CSV export functionality
```

---

## Display Format Options

**Compact Format** (for quick review):
```
1. Fix login redirect (Bug, 2025-01-18)
2. Dark mode toggle (Feature, 2025-01-18)
3. Extract auth logic (Refactoring, 2025-01-17)
```

**Detailed Format** (for full review):
```
## Fix Login Redirect - 2025-01-18

- **Fix Login Flow** - Users redirected to 404
  - Problem: OAuth callback fails for incomplete profiles
  - Files: callback.ts:45, auth.ts:23
  - Solution: Add profile completion check
  - Impact: Blocking 30% of logins
```

**By Default**: Use summary format with categories. User can request detailed view.

---

## Smart Features

**Aging Detection:**
- Items >7 days old: Mark with 📅
- Items >30 days old: Mark with ⚠️ (stale)

**Impact Analysis:**
- Keywords like "blocking", "critical" → 🔴
- Keywords like "affects all users" → High impact
- Keywords like "nice to have" → Low priority

**File Tracking:**
- Group by affected files
- Show which files have most todos

**Progress Tracking:**
- Show completed vs remaining ratio
- Weekly completion rate (if dates available)
