# Navigation and Routing Tests

Comprehensive end-to-end tests for NuuMee.AI navigation and routing.

## Overview

**Test File**: `e2e/navigation.spec.ts`  
**Lines of Code**: 598  
**Total Tests**: 44 tests  
**Test Suites**: 11 test suites  
**Browsers**: Desktop Chrome + iPhone 14 Mobile

## Quick Start

```bash
# Run all navigation tests
npx playwright test navigation.spec.ts

# Run with UI
npx playwright test navigation.spec.ts --ui

# Run specific suite
npx playwright test navigation.spec.ts -g "Homepage Navigation"
```

## Test Coverage Summary

| Category | Tests | Key Checks |
|----------|-------|------------|
| Homepage Navigation | 6 | Logo, header links, footer, CTAs, hero content |
| Marketing Pages | 8 | Pricing, docs, examples, comparison, testimonials, etc. |
| Legal Pages | 3 | Privacy, terms, navigation between pages |
| Dev Pages | 6 | Sitemap, components, states, modals |
| 404 Page | 4 | Error page display, helpful links, recovery |
| Auth Pages | 3 | Login, signup navigation |
| Navigation Flows | 3 | Multi-page journeys, back/forward |
| Responsive | 2 | Mobile and desktop viewports |
| Performance | 3 | Load times, console errors, images |
| SEO | 3 | Titles, meta descriptions, canonical URLs |
| Accessibility | 3 | Landmarks, keyboard nav, alt text |

**Total: 44 tests across 11 categories**

## Detailed Test Breakdown

### 1. Homepage Navigation (6 tests)

**Purpose**: Verify all navigation elements on the homepage work correctly.

Tests:
- ✅ Logo click navigates to home
- ✅ Header links work (Home, Create Videos, Pricing, Docs)
- ✅ Footer links work (Terms, Privacy, Careers)
- ✅ CTA buttons navigate correctly
- ✅ Hero section displays key content
- ✅ All major sections are visible

### 2. Marketing Pages (8 tests)

**Purpose**: Ensure all marketing pages load without errors.

Pages tested:
- ✅ `/pricing` - Pricing cards and plans
- ✅ `/documentation` - API documentation
- ✅ `/examples` - Gallery and use cases
- ✅ `/comparison` - Competitor comparison
- ✅ `/testimonials` - User testimonials
- ✅ `/changelog` - Product updates
- ✅ `/careers` - Job listings
- ✅ `/status` - System status indicators

### 3. Legal Pages (3 tests)

**Purpose**: Verify legal pages and navigation between them.

- ✅ `/privacy` - Privacy policy loads
- ✅ `/terms` - Terms of service loads
- ✅ Navigation: privacy ↔ terms works

### 4. Dev Pages (6 tests)

**Purpose**: Test design system and development tools.

- ✅ `/dev` - Design system sitemap with all pages listed
- ✅ `/dev/components` - Component library with demos
- ✅ `/dev/states` - Component state demonstrations
- ✅ `/dev/modals` - Subscription modal variations
- ✅ Modal functionality (open/close)
- ✅ Navigation between dev pages

Key checks:
- Sitemap shows page count
- Component sections load (buttons, forms, colors)
- State demos show (default, hover, active, disabled)
- Modal buttons work

### 5. 404 Page (4 tests)

**Purpose**: Verify error handling and recovery.

- ✅ Unknown routes show 404 page
- ✅ 404 page displays correct content ("Scene Missing", "Take 404")
- ✅ Helpful links present
- ✅ Navigation from 404 to home works

### 6. Authentication Pages (3 tests)

**Purpose**: Test auth page loading.

- ✅ `/login` page loads
- ✅ `/signup` page loads
- ✅ Navigation between login and signup

### 7. Cross-Page Navigation Flows (3 tests)

**Purpose**: Test multi-step user journeys.

- ✅ Complete journey: home → pricing → docs → create
- ✅ Browser back/forward buttons work
- ✅ Scroll position handling

### 8. Responsive Navigation (2 tests)

**Purpose**: Verify mobile and desktop views.

- ✅ Mobile viewport (375×667) - Logo visible, nav adapted
- ✅ Desktop viewport (1920×1080) - All nav links visible

### 9. Page Load Performance (3 tests)

**Purpose**: Ensure fast and error-free loading.

- ✅ Homepage loads < 5 seconds
- ✅ No critical console errors
- ✅ All images load successfully

### 10. SEO and Metadata (3 tests)

**Purpose**: Verify SEO best practices.

- ✅ Page title contains "NuuMee"
- ✅ Meta description exists and contains "AI"
- ✅ Canonical URL (if present)

### 11. Accessibility (3 tests)

**Purpose**: Ensure WCAG compliance basics.

- ✅ Navigation landmarks (header, main, footer)
- ✅ Keyboard navigation works
- ✅ Images have alt text

## Running Tests

### Basic Commands

```bash
# Run all navigation tests
npx playwright test navigation.spec.ts

# Run with visual feedback
npx playwright test navigation.spec.ts --headed

# Run with interactive UI
npx playwright test navigation.spec.ts --ui

# Run specific test suite
npx playwright test navigation.spec.ts -g "Homepage Navigation"
npx playwright test navigation.spec.ts -g "Dev Pages"
npx playwright test navigation.spec.ts -g "404 Page"
```

### Browser-Specific

```bash
# Desktop Chrome only
npx playwright test navigation.spec.ts --project=chromium

# Mobile (iPhone 14) only
npx playwright test navigation.spec.ts --project=mobile

# Both browsers
npx playwright test navigation.spec.ts
```

### Debugging

```bash
# Debug mode with Playwright Inspector
npx playwright test navigation.spec.ts --debug

# Show trace viewer
npx playwright show-trace

# Generate HTML report
npx playwright test navigation.spec.ts --reporter=html
npx playwright show-report
```

## Test Examples

### Example 1: Logo Navigation

```typescript
test('should display logo and navigate to home when clicked', async ({ page }) => {
  await page.goto('/');
  
  const logo = page.locator('header a[href="/"]').first();
  await expect(logo).toBeVisible();
  await expect(logo.locator('text=NuuMee.AI')).toBeVisible();
  
  await page.goto('/pricing');
  await logo.click();
  await expect(page).toHaveURL('/');
});
```

### Example 2: Dev Page Modal

```typescript
test('should open modal on /dev/modals page', async ({ page }) => {
  await page.goto('/dev/modals');
  
  await page.click('button:has-text("Open subscribe Modal")');
  await expect(page.locator('[role="dialog"]')).toBeVisible();
  await expect(page.locator('text=Subscribe to NuuMee')).toBeVisible();
  
  await page.click('button:has-text("Cancel")');
  await expect(page.locator('[role="dialog"]')).not.toBeVisible();
});
```

### Example 3: 404 Recovery

```typescript
test('should navigate back home from 404 page', async ({ page }) => {
  await page.goto('/invalid-url');
  
  await expect(page.locator('text=404')).toBeVisible();
  await page.click('a[href="/"] button:has-text("Roll Camera")');
  await expect(page).toHaveURL('/');
});
```

## Pages Tested

### Public Pages (9)
- `/` - Homepage
- `/pricing` - Plans and pricing
- `/documentation` - API docs
- `/examples` - Use case gallery
- `/comparison` - Competitor comparison
- `/testimonials` - User reviews
- `/changelog` - Product updates
- `/careers` - Job listings
- `/status` - System status

### Legal Pages (2)
- `/privacy` - Privacy policy
- `/terms` - Terms of service

### Dev Pages (4)
- `/dev` - Complete sitemap
- `/dev/components` - Component library
- `/dev/states` - Component states
- `/dev/modals` - Modal variations

### Authentication (2)
- `/login` - User login
- `/signup` - User registration

### Error Pages (1)
- `404` - Page not found

**Total: 18+ unique pages**

## Best Practices

### Selectors
✅ **Good**: Text content, semantic roles
```typescript
page.locator('text=NuuMee.AI')
page.locator('[role="dialog"]')
page.locator('a[href="/pricing"]')
```

❌ **Avoid**: Fragile CSS classes
```typescript
page.locator('.css-xyzabc')
page.locator('div > div > button')
```

### Waiting
✅ **Good**: Wait for stability
```typescript
await page.waitForLoadState('networkidle');
await expect(element).toBeVisible();
```

❌ **Avoid**: Arbitrary timeouts
```typescript
await page.waitForTimeout(5000);
```

### Assertions
✅ **Good**: Clear expectations
```typescript
await expect(page).toHaveURL('/pricing');
await expect(heading).toBeVisible();
```

## CI/CD Integration

### GitHub Actions

```yaml
name: E2E Navigation Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npx playwright install --with-deps
      - run: npx playwright test navigation.spec.ts
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

## Troubleshooting

### Dev Server Not Running

**Problem**: Tests fail with "Target page has been closed"

**Solution**:
```bash
# Start dev server first
pnpm dev

# Then run tests in another terminal
npx playwright test navigation.spec.ts
```

### Tests Timing Out

**Problem**: Tests take too long

**Solution**: Increase timeout in `playwright.config.ts`:
```typescript
use: {
  timeout: 60000, // 60 seconds
}
```

### Console Errors

**Problem**: Console error assertions fail

**Solution**: Filter known acceptable errors:
```typescript
const criticalErrors = errors.filter(
  (error) => !error.includes('Firebase') && !error.includes('favicon')
);
```

## Test Statistics

- **Total Tests**: 44
- **Test Suites**: 11
- **Pages Covered**: 18+
- **Browsers**: 2 (Desktop + Mobile)
- **Total Test Runs**: 88 (44 tests × 2 browsers)
- **Lines of Code**: 598
- **Execution Time**: ~2-3 minutes for full suite

## Success Criteria

All tests verify:
- ✅ Navigation links work correctly
- ✅ Pages load without errors
- ✅ Content is visible and accessible
- ✅ Mobile and desktop views work
- ✅ Performance is acceptable (< 5s load)
- ✅ SEO metadata exists
- ✅ Accessibility standards met
- ✅ Error handling works (404 pages)
- ✅ User flows complete successfully

## Next Steps

Potential additions:
1. Visual regression tests (screenshots)
2. Authentication flow tests (login/logout)
3. Form submission tests
4. API integration tests
5. Payment flow tests
6. Accessibility audits with axe-core
7. Performance budgets
8. Network condition tests

---

**Created**: 2025-11-28  
**Playwright Version**: Latest  
**Framework**: Next.js 14  
**Test Framework**: Playwright
