# Instructions for Claude: React to Next.js Component Conversion

## Step 1: Discovery
Before converting ANY component, you MUST:

1. **Read the target component file completely**
2. **Search for ALL imported components** using `file_search` with the import names
3. **Read each imported component** to check if it needs conversion
4. **Check for React Router usage**: `useLocation`, `useNavigate`, `useParams`, `Link`, `Navigate`
5. **Check for browser APIs**: `window.location`, `window.history`
6. **List ALL dependencies** before making changes

## Step 2: Analyze Dependencies
For each component found, check:
- Does it import other custom components? → Read those too
- Does it use React Router? → Needs conversion
- Does it use hooks? → Needs `'use client'`
- Does it use browser APIs? → Needs `'use client'`

## Step 3: Convert Bottom-Up
Convert in this order:
1. Leaf components (no custom component imports) first
2. Parent components last
3. NEVER convert a parent before its children are converted

## Step 4: Required Changes for Each Component

### A. Client Directive
Add `'use client';` if component uses:
- `useState`, `useEffect`, `useRef`, etc.
- Event handlers (`onClick`, `onChange`, etc.)
- Browser APIs (`window`, `document`, `localStorage`)
- React Router hooks

### B. Import Changes
```typescript
// WRONG
import { Link, useLocation, useNavigate } from 'react-router-dom';

// CORRECT
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
```

### C. Hook Changes
```typescript
// WRONG
const location = useLocation();
const navigate = useNavigate();

// CORRECT
const pathname = usePathname();
const router = useRouter();
```

### D. Navigation Changes
```typescript
// WRONG
<Link to="/path">Text</Link>
navigate('/path');
window.location.href = '/path';

// CORRECT
<Link href="/path">Text</Link>
router.push('/path');
router.push('/path');
```

### E. Path Checks
```typescript
// WRONG
location.pathname === '/path'
location.pathname.startsWith('/path')

// CORRECT
pathname === '/path'
pathname.startsWith('/path')
```

## Step 5: Verification
After converting, verify:
1. All imports from the original component are preserved
2. All child components are imported correctly
3. No React Router imports remain
4. `'use client'` is at line 1 (before all imports)
5. All `to=` changed to `href=`
6. All `location` changed to `pathname`
7. All `navigate()` changed to `router.push()`

## Common Mistakes to Avoid
❌ Converting parent before children
❌ Missing `'use client'` directive
❌ Leaving `to=` instead of `href=`
❌ Not reading imported components
❌ Assuming components exist without checking
❌ Forgetting to import `useRouter` when using `router.push()`

## Example Workflow
```bash
User: "Convert Header.tsx to Next.js"

1. read('/components/Header.tsx')
2. file_search for imported components: "UserDropdown", "Navigation", etc.
3. read each found component
4. Check if they need conversion
5. Convert children first
6. Convert Header last
7. Verify all changes
```

## File Search Pattern
When component imports `UserDropdown`:
```typescript
file_search({
  content_pattern: "export.*UserDropdown|function UserDropdown|const UserDropdown",
  name_pattern: "**/*.tsx"
})
```

## Critical Rules
1. ALWAYS read the file first
2. ALWAYS search for dependencies
3. NEVER assume a component exists
4. CONVERT children before parents
5. CHECK every import is Next.js compatible
6. ADD 'use client' when needed
7. CHANGE all routing to Next.js patterns
