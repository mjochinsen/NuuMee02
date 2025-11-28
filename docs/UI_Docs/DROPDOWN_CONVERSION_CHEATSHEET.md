# ⚡ Dropdown Conversion Cheatsheet

## 🎯 Quick Reference for React → Next.js Conversion

---

## 📝 The 4 Essential Changes

### 1️⃣ Add Client Directive
```typescript
'use client'; // ← Line 1 of Header.tsx

import { ChevronDown, ... } from 'lucide-react';
```

### 2️⃣ Change Imports
```typescript
// ❌ OLD (React Router)
import { Link, useLocation } from 'react-router-dom';

// ✅ NEW (Next.js)
import Link from 'next/link';
import { usePathname } from 'next/navigation';
```

### 3️⃣ Update Hook Usage
```typescript
// ❌ OLD
const location = useLocation();
const isActive = (path: string) => location.pathname === path;

// ✅ NEW
const pathname = usePathname();
const isActive = (path: string) => pathname === path;
```

### 4️⃣ Change Link Props
```typescript
// ❌ OLD
<Link to="/billing">

// ✅ NEW
<Link href="/billing">
```

---

## 🔍 Find & Replace Commands

### VS Code (Cmd/Ctrl + H)

**Replace 1:** Link props
```
Find:    to="
Replace: href="
```

**Replace 2:** Location variable
```
Find:    location.pathname
Replace: pathname
```

---

## 🗂️ Files to Modify

### Must Change ✏️
- `/components/Header.tsx` (Main component)

### Already Good ✅
- `/components/ui/dropdown-menu.tsx` (Has "use client")
- `/components/ui/badge.tsx` (UI component)

### Don't Touch 🚫
- Any file in `/components/ui/` (ShadCN components)

---

## 🧪 Test Checklist

```
[ ] Dropdown opens when clicking user button
[ ] All 7 menu items visible:
    [ ] Refer Friends
    [ ] Billing
    [ ] API Keys
    [ ] Jobs
    [ ] Support
    [ ] Account Settings
    [ ] ---- (separator) ----
    [ ] Sign Out
[ ] Navigation works for each link
[ ] User name shows: "Alex Chen"
[ ] Badge shows: "Creator" (purple-cyan gradient)
[ ] Hover effects work (cyan highlight)
[ ] No console errors
[ ] Active page highlighted in navigation
```

---

## ⚠️ Common Errors

| Error | Fix |
|-------|-----|
| `useLocation is not a function` | Use `usePathname` instead |
| `Cannot find module 'react-router-dom'` | Remove import, use Next.js imports |
| `Objects are not valid as React child` | Check Link/DropdownMenuItem order |
| Dropdown doesn't open | Add `"use client"` directive |
| Navigation doesn't work | Change `to=` to `href=` |

---

## 📍 Code Locations

### Header Component
- **File:** `/components/Header.tsx`
- **Lines:** 1-159
- **User Dropdown:** Lines 95-154

### Dropdown Items
```typescript
Line 112-117:  Refer Friends → /referral
Line 118-123:  Billing → /billing
Line 124-129:  API Keys → /api-keys
Line 130-135:  Jobs → /jobs
Line 136-141:  Support → /support
Line 142-147:  Account Settings → /settings
Line 149-152:  Sign Out (no link)
```

---

## 🎨 Styling Reference

```typescript
// Button trigger
bg-[#1E293B] border-[#334155] hover:border-[#00F0D9]

// Dropdown menu
w-56 bg-[#1E293B] border-[#334155]

// Menu items
text-[#F1F5F9] hover:bg-[#334155] hover:text-[#00F0D9]

// User tier badge
bg-gradient-to-r from-[#3B1FE2] to-[#00F0D9]
```

---

## 🚀 Copy-Paste Solution

### Complete Header.tsx (Top Section)
```typescript
'use client';

import { ChevronDown, Zap, Plus, User, CreditCard, Key, Briefcase, HelpCircle, Settings, LogOut, Gift } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Badge } from './ui/badge';

export function Header() {
  const [credits] = useState(25);
  const userName = "Alex Chen";
  const userTier = "Creator";
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;
  
  // ... rest of component
}
```

---

## ⏱️ Estimated Time

- **Reading guide:** 5 minutes
- **Making changes:** 2 minutes
- **Testing:** 3 minutes
- **Total:** ~10 minutes

---

## ✅ Done When...

```
✅ File saved with changes
✅ No TypeScript errors
✅ No console errors
✅ Dropdown opens/closes
✅ All links navigate correctly
✅ Styling looks correct
✅ User info displays
```

---

## 🆘 Emergency Rollback

If something breaks, revert to React Router version:

```typescript
// Restore these lines:
import { Link, useLocation } from 'react-router-dom';
const location = useLocation();
// Change all href= back to to=
```

---

## 📞 Need Help?

1. Check main guide: `/NEXT_JS_DROPDOWN_CONVERSION_GUIDE.md`
2. Check browser console for errors
3. Verify "use client" is line 1
4. Compare with `/pages/ComponentsDEVPage.tsx` dropdown example

---

**Quick Start:** Just make the 4 changes above → Test → Done! 🎉
