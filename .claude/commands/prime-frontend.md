# Frontend Context Prime

You are working on the **frontend** of NuuMee - a Next.js 14 application.

## Location
`/frontend` - Next.js app with App Router

## Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS only (no CSS files)
- **Components:** shadcn/ui
- **Auth:** Firebase Auth (client SDK)
- **State:** React Context for auth, local state for forms

## File Structure
```
frontend/
  app/           # Pages (App Router)
  components/    # Reusable components
  lib/           # Utilities (firebase.ts, api.ts)
  public/        # Static assets
  e2e/           # Playwright tests
```

## Design Reference
All UI must match designs in `FromFigmaMake/`:
- `FromFigmaMake/components/` - Component examples
- `FromFigmaMake/pages/` - Page layouts
- `FromFigmaMake/styles/` - Color tokens, typography
- `FromFigmaMake/guidelines/` - Spacing, patterns

## Code Standards
- Components < 200 lines (split if larger)
- Functions < 30 lines
- One component per file
- Use `cn()` for conditional classes
- Flat folder structure (no deep nesting)

## Common Patterns

### API Calls
```typescript
import { api } from '@/lib/api';
const data = await api.get('/endpoint', token);
```

### Auth Context
```typescript
import { useAuth } from '@/components/AuthProvider';
const { user, loading } = useAuth();
```

### Protected Routes
```typescript
if (!user && !loading) redirect('/login');
```

## Testing
```bash
# In frontend/
npx playwright test              # All tests
npx playwright test --ui         # Visual UI
npx playwright test auth.spec.ts # Specific test
```

## Build & Deploy
```bash
cd frontend
pnpm build                       # Build for production
cd .. && firebase deploy --only hosting
```

## Key Files to Read
- `frontend/lib/firebase.ts` - Firebase client config
- `frontend/lib/api.ts` - API client with auth headers
- `frontend/components/AuthProvider.tsx` - Auth context
