# 🗺️ User Dropdown Component Map

## 📊 Visual Structure

```
┌─────────────────────────────────────────────────────────────┐
│                      HEADER COMPONENT                        │
│                   /components/Header.tsx                     │
│                                                              │
│  ┌────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │    Logo    │  │  Navigation  │  │  User Controls   │   │
│  │  NuuMee.AI │  │   Links      │  │                  │   │
│  └────────────┘  └──────────────┘  └──────────────────┘   │
│                                      │                       │
│                                      ├─ Login Button        │
│                                      ├─ Credits Button      │
│                                      └─ USER DROPDOWN  ◄─── │
│                                         (What you're        │
│                                          converting)         │
└─────────────────────────────────────────────────────────────┘
                                         │
                                         │
                    ┌────────────────────┴─────────────────────┐
                    │                                          │
                    ▼                                          ▼
        ┌─────────────────────────┐              ┌──────────────────────┐
        │  DROPDOWN TRIGGER       │              │  DROPDOWN CONTENT    │
        │  (User Button)          │              │  (Menu Panel)        │
        │                         │              │                      │
        │  ┌──────────────────┐  │              │  ┌────────────────┐ │
        │  │ 👤 Alex Chen  ▼  │  │──── clicks ─→│  │ Alex Chen      │ │
        │  └──────────────────┘  │              │  │ Creator Badge  │ │
        │                         │              │  ├────────────────┤ │
        └─────────────────────────┘              │  │ 🎁 Refer Friends│ │
                                                 │  │ 💳 Billing      │ │
                                                 │  │ 🔑 API Keys     │ │
                                                 │  │ 💼 Jobs         │ │
                                                 │  │ ❓ Support      │ │
                                                 │  │ ⚙️  Settings    │ │
                                                 │  ├────────────────┤ │
                                                 │  │ 🚪 Sign Out     │ │
                                                 │  └────────────────┘ │
                                                 └──────────────────────┘
```

---

## 🧩 Component Hierarchy

```
Header (Client Component)
│
├─ Logo Section
│  └─ Link → /
│
├─ Navigation Section
│  ├─ Link → /
│  ├─ Link → /create
│  ├─ Link → /dev
│  ├─ Link → /price
│  └─ Link → /documentation
│
└─ User Controls Section
   ├─ Login Button → /login
   │
   ├─ Credits Button
   │  └─ State: credits (25)
   │
   └─ DropdownMenu ◄───────── YOU ARE HERE
      │
      ├─ DropdownMenuTrigger
      │  └─ Button
      │     ├─ User Icon (👤)
      │     ├─ Text: userName ("Alex Chen")
      │     └─ ChevronDown Icon (▼)
      │
      └─ DropdownMenuContent
         │
         ├─ Header Section (User Info)
         │  ├─ Text: userName
         │  └─ Badge: userTier ("Creator")
         │
         ├─ DropdownMenuItem (Link → /referral)
         │  ├─ Gift Icon
         │  └─ Text: "Refer Friends"
         │
         ├─ DropdownMenuItem (Link → /billing)
         │  ├─ CreditCard Icon
         │  └─ Text: "Billing"
         │
         ├─ DropdownMenuItem (Link → /api-keys)
         │  ├─ Key Icon
         │  └─ Text: "API Keys"
         │
         ├─ DropdownMenuItem (Link → /jobs)
         │  ├─ Briefcase Icon
         │  └─ Text: "Jobs"
         │
         ├─ DropdownMenuItem (Link → /support)
         │  ├─ HelpCircle Icon
         │  └─ Text: "Support"
         │
         ├─ DropdownMenuItem (Link → /settings)
         │  ├─ Settings Icon
         │  └─ Text: "Account Settings"
         │
         ├─ DropdownMenuSeparator (divider line)
         │
         └─ DropdownMenuItem (Sign Out - no link)
            ├─ LogOut Icon
            └─ Text: "Sign Out"
```

---

## 🔗 Data Flow

```
┌──────────────┐
│   useState   │
│  credits: 25 │
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│  Constants       │
│  userName        │ ───────────┐
│  userTier        │            │
└──────────────────┘            │
                                │
┌──────────────────┐            │
│  usePathname()   │            │
│  pathname        │            │
└──────┬───────────┘            │
       │                        │
       ▼                        ▼
┌──────────────────┐    ┌──────────────┐
│  isActive()      │    │  Dropdown    │
│  function        │    │  Display     │
└──────────────────┘    └──────────────┘
       │
       ▼
┌──────────────────┐
│  Navigation      │
│  Active States   │
└──────────────────┘
```

---

## 📦 Dependencies Map

```
Header.tsx
│
├─ React
│  └─ useState
│
├─ Next.js
│  ├─ Link (from 'next/link')
│  └─ usePathname (from 'next/navigation')
│
├─ Lucide Icons
│  ├─ ChevronDown
│  ├─ Zap
│  ├─ Plus
│  ├─ User
│  ├─ CreditCard
│  ├─ Key
│  ├─ Briefcase
│  ├─ HelpCircle
│  ├─ Settings
│  ├─ LogOut
│  └─ Gift
│
├─ ShadCN UI Components
│  ├─ Button (./ui/button)
│  ├─ Badge (./ui/badge)
│  └─ DropdownMenu (./ui/dropdown-menu)
│     ├─ DropdownMenu (wrapper)
│     ├─ DropdownMenuTrigger
│     ├─ DropdownMenuContent
│     ├─ DropdownMenuItem
│     └─ DropdownMenuSeparator
│
└─ Radix UI (via dropdown-menu.tsx)
   └─ @radix-ui/react-dropdown-menu@2.1.6
```

---

## 🎯 What Needs Converting

### ✅ Already Next.js Compatible
```
✅ dropdown-menu.tsx (has "use client")
✅ badge.tsx (UI component)
✅ button.tsx (UI component)
✅ Lucide icons (icon library)
```

### ❌ Needs Conversion
```
❌ Header.tsx
   - Missing "use client" directive
   - Using react-router-dom
   - Using useLocation hook
   - Using Link with "to" prop
```

---

## 🔄 Import Transformation

### React Router → Next.js

```
BEFORE                              AFTER
══════                              ═════
react-router-dom                    next/link
│                                   next/navigation
├─ Link                             │
│  └─ to="/path"                    ├─ Link
│                                   │  └─ href="/path"
└─ useLocation                      │
   └─ location.pathname             └─ usePathname
                                       └─ pathname
```

---

## 🏗️ Component Structure Code

```typescript
// Header.tsx structure
export function Header() {
  // 1. HOOKS & STATE
  const [credits] = useState(25);
  const pathname = usePathname(); // ← NEEDS CONVERSION
  
  // 2. CONSTANTS
  const userName = "Alex Chen";
  const userTier = "Creator";
  
  // 3. HELPER FUNCTIONS
  const isActive = (path: string) => pathname === path;
  
  // 4. RENDER
  return (
    <header>
      {/* Logo Section */}
      {/* Navigation Section */}
      {/* User Controls Section */}
      <div>
        <button>Login</button>
        <button>Credits</button>
        
        {/* DROPDOWN - The component you're converting */}
        <DropdownMenu>
          <DropdownMenuTrigger>...</DropdownMenuTrigger>
          <DropdownMenuContent>
            {/* User info header */}
            {/* Menu items with Links */}
            {/* Separator */}
            {/* Sign out item */}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
```

---

## 📏 Line Number Reference

```
/components/Header.tsx

Lines 1-13:   Imports (CONVERT THESE)
Line  14:     Component declaration
Lines 15-18:  State & constants
Lines 20:     isActive function (CONVERT THIS)
Lines 22-23:  Header opening
Lines 25-76:  Left side (Logo + Nav)
Lines 78-156: Right side (User controls)
  Lines 81-85:   Login button
  Lines 87-92:   Credits button
  Lines 94-154:  User dropdown ◄── TARGET
    Lines 95-102:  Trigger button
    Lines 103-153: Dropdown content
      Lines 104-111: User info header
      Lines 112-117: Refer Friends
      Lines 118-123: Billing
      Lines 124-129: API Keys
      Lines 130-135: Jobs
      Lines 136-141: Support
      Lines 142-147: Account Settings
      Line  148:     Separator
      Lines 149-152: Sign Out
```

---

## 🎨 Styling Class Map

```
Component              Tailwind Classes
─────────              ────────────────
Header                 border-b border-[#334155] bg-[#0F172A]/95
Container              mx-auto px-6 h-16
Logo                   rounded-lg bg-gradient-to-br from-[#00F0D9] to-[#3B1FE2]
Nav Links              text-[#94A3B8] hover:text-[#00F0D9]
Active Link            text-[#F1F5F9]
Credits Button         bg-gradient-to-r from-[#3B1FE2] to-[#00F0D9]

Dropdown Trigger       bg-[#1E293B] border-[#334155] hover:border-[#00F0D9]
Dropdown Content       w-56 bg-[#1E293B] border-[#334155]
User Badge             bg-gradient-to-r from-[#3B1FE2] to-[#00F0D9]
Menu Item              text-[#F1F5F9] hover:bg-[#334155] hover:text-[#00F0D9]
Separator              bg-[#334155]
```

---

## 🔍 Quick Locate Guide

### To find the user dropdown in Header.tsx:

1. **Search for:** `DropdownMenu` (line 95)
2. **Search for:** `Alex Chen` (line 16, 99, 106)
3. **Search for:** `userTier` (line 17, 108)
4. **Search for:** `Sign Out` (line 151)

### To find related components:

1. **Dropdown UI:** `/components/ui/dropdown-menu.tsx`
2. **Badge UI:** `/components/ui/badge.tsx`
3. **Example usage:** `/pages/ComponentsDEVPage.tsx` (line 519)

---

## 📚 Related Files You Might Need

```
/components/
├── Header.tsx                    ◄── PRIMARY TARGET
├── ui/
│   ├── dropdown-menu.tsx        ◄── Dropdown primitives (don't change)
│   ├── badge.tsx                ◄── Badge component (don't change)
│   └── button.tsx               ◄── Button component (don't change)

/pages/
├── ReferralPage.tsx             ← Dropdown links here
├── BillingPage.tsx              ← Dropdown links here
├── APIKeysPage.tsx              ← Dropdown links here
├── JobsPage.tsx                 ← Dropdown links here
├── SupportPage.tsx              ← Dropdown links here
└── AccountSettingsPage.tsx      ← Dropdown links here

/docs/
├── NEXT_JS_DROPDOWN_CONVERSION_GUIDE.md    ◄── Full guide
├── DROPDOWN_CONVERSION_CHEATSHEET.md       ◄── Quick reference
└── DROPDOWN_COMPONENT_MAP.md               ◄── This file
```

---

## 🎯 Action Items

1. ✏️ Open `/components/Header.tsx`
2. 🔍 Locate lines 1-13 (imports)
3. ✏️ Add `'use client';` at line 1
4. 🔄 Replace react-router imports with Next.js
5. 🔍 Locate line 18 (useLocation)
6. 🔄 Replace with usePathname
7. 🔍 Find all `to="`
8. 🔄 Replace with `href="`
9. 💾 Save file
10. 🧪 Test dropdown functionality

---

**Visual Reference:** See provided screenshot for final result  
**Time to Complete:** ~10 minutes  
**Difficulty:** ⭐⭐☆☆☆ (Easy)
