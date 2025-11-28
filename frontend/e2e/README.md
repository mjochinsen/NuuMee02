# Visual Regression Testing for NuuMee Phase 1.5

This directory contains Playwright visual regression tests for the NuuMee.AI frontend.

## Overview

Visual regression tests capture screenshots of pages and components, then compare them against baseline snapshots to detect unintended visual changes during development.

## Test Coverage

### Pages Tested

#### Desktop (1280x720) + Mobile (375x667)
- **Homepage** (`/`) - Full landing page with hero, features, testimonials, and pricing
- **Login** (`/login`) - Authentication page
- **Signup** (`/signup`) - Registration page
- **404 Error** - Custom error page
- **Dev Sitemap** (`/dev`) - Complete page navigation map
- **Component Library** (`/dev/components`) - All UI components showcase
- **Component States** (`/dev/states`) - Interactive state documentation (CRITICAL for design handoff)

#### Tablet (768x1024)
- Homepage
- Component Library

### Section-Level Tests

**Homepage Sections:**
- Hero section with split-screen preview
- Features grid
- Pricing teaser cards
- Use cases with category filters (dynamic content test)

**Component Library Sections:**
- Button variants
- Form controls
- Pricing cards
- Color palette

**Component States Sections:**
- Button states (default, hover, active, disabled, loading)
- Form input states
- Badge/tag states

### Test Categories

**Full Page Snapshots:**
- 29 total test cases
- Desktop and mobile viewports
- Cross-browser compatibility tests

**Dynamic Content:**
- Tests filtered states (e.g., marketing use cases)
- Handles animations by disabling them

**Interactive States:**
- Component hover/focus/disabled states
- Form validation states

## Running Tests

### Prerequisites

```bash
# Install Playwright browsers (first time only)
npx playwright install

# Install system dependencies (Linux)
npx playwright install-deps
```

### Execute Tests

```bash
# Run all visual regression tests
npx playwright test --grep @visual

# Run specific viewport
npx playwright test --grep "Desktop @visual"
npx playwright test --grep "Mobile @visual"

# Run with UI mode (interactive)
npx playwright test --grep @visual --ui

# Run on specific browser
npx playwright test --grep @visual --project=chromium
npx playwright test --grep @visual --project=mobile

# Generate test report
npx playwright test --grep @visual --reporter=html
npx playwright show-report
```

### Update Snapshots

When intentional visual changes are made:

```bash
# Update all snapshots
npx playwright test --grep @visual --update-snapshots

# Update specific test
npx playwright test visual.spec.ts:32 --update-snapshots

# Update only failed snapshots
npx playwright test --grep @visual --update-snapshots --only-changed
```

### CI/CD Integration

```bash
# Run in CI mode (strict comparison)
CI=1 npx playwright test --grep @visual --max-failures=5

# Generate artifacts for review
npx playwright test --grep @visual --reporter=html,json
```

## Test Configuration

### Viewports

| Viewport | Width x Height | Purpose |
|----------|---------------|---------|
| Desktop | 1280 x 720 | Primary desktop view |
| Mobile | 375 x 667 | iPhone SE (small mobile) |
| Tablet | 768 x 1024 | iPad portrait |

### Diff Thresholds

- **Static pages**: `maxDiffPixelRatio: 0.01` (1% tolerance)
- **Pages with images/gradients**: `maxDiffPixelRatio: 0.02` (2% tolerance)
- **Cross-browser**: `maxDiffPixelRatio: 0.03` (3% tolerance for browser rendering differences)

### Animation Handling

Tests automatically disable CSS animations and transitions:

```typescript
await page.addStyleTag({
  content: `
    * {
      animation-duration: 0s !important;
      transition-duration: 0s !important;
    }
    .animate-spin,
    .animate-pulse {
      animation: none !important;
    }
  `
});
```

## Snapshot Storage

Snapshots are stored in:
```
e2e/visual.spec.ts-snapshots/
├── chromium/
│   ├── homepage-desktop.png
│   ├── homepage-mobile.png
│   └── ...
└── mobile/
    ├── homepage-mobile.png
    └── ...
```

**Note:** Snapshots should be committed to version control to track visual changes.

## Best Practices

### When to Update Snapshots

✅ **Update snapshots when:**
- Intentional design changes are made
- New features are added
- Component library updates
- Color palette changes

❌ **Don't update snapshots for:**
- Random test failures (investigate first)
- Flaky tests (fix the flakiness)
- CI environment differences (use same OS/browser)

### Handling Flaky Tests

1. **Check for animations:** Ensure all animations are disabled
2. **Verify fonts:** Wait for `document.fonts.ready`
3. **Network stability:** Use `networkidle` load state
4. **Dynamic content:** Mock or freeze timestamps, random data
5. **Retry logic:** Configure retries in `playwright.config.ts`

### Design Handoff Workflow

For designers reviewing implementation:

```bash
# 1. Generate latest screenshots
npx playwright test --grep "@visual" --update-snapshots

# 2. View screenshots
open e2e/visual.spec.ts-snapshots/chromium/

# 3. Critical pages for design review:
# - dev-states-desktop.png (all component states)
# - dev-components-desktop.png (component library)
# - components-colors.png (brand color palette)
# - homepage-desktop.png (landing page)
```

## Troubleshooting

### Issue: Screenshots differ slightly on different machines

**Solution:** Run tests in Docker or use Playwright's `docker` container:

```bash
docker run --rm --network host -v $(pwd):/work/ -w /work/ -it mcr.microsoft.com/playwright:v1.57.0-jammy /bin/bash
npm install
npx playwright test --grep @visual
```

### Issue: Fonts look different in snapshots

**Solution:** Ensure fonts are loaded:

```typescript
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(500); // Buffer for font rendering
```

### Issue: External images cause flakiness

**Solution:** Mock external image sources or use local assets in `public/`:

```typescript
await page.route('**/images.unsplash.com/**', route => {
  route.fulfill({ path: 'public/mock-image.jpg' });
});
```

## Performance

**Typical execution times:**
- Single page (desktop + mobile): ~3-5 seconds
- Full suite (29 tests): ~2-3 minutes
- With snapshot updates: ~3-5 minutes

**Optimization tips:**
- Run tests in parallel (configured in `playwright.config.ts`)
- Use `--shard` for distributed testing in CI
- Skip full-page screenshots in rapid development, use section tests

## Integration with Development Workflow

### Pre-commit Hook

```bash
# .husky/pre-commit
npx playwright test --grep "@visual" --max-failures=1
```

### Pull Request Checks

GitHub Actions workflow example:

```yaml
name: Visual Regression Tests
on: [pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npx playwright install --with-deps
      - run: npx playwright test --grep @visual
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

## Test Maintenance

**Weekly:**
- Review failed tests in CI
- Update snapshots for merged design changes

**Monthly:**
- Audit test coverage for new pages
- Remove obsolete tests
- Update Playwright version

**Per Release:**
- Regenerate all baseline snapshots
- Archive previous snapshots for rollback

## File Structure

```
e2e/
├── visual.spec.ts              # Main visual regression test suite
├── README.md                   # This file
└── visual.spec.ts-snapshots/  # Baseline snapshots (git-tracked)
    ├── chromium/
    │   ├── homepage-desktop.png
    │   ├── homepage-mobile.png
    │   ├── dev-states-desktop.png
    │   └── ...
    └── mobile/
        └── ...
```

## Support

For issues or questions:
- Check Playwright docs: https://playwright.dev/docs/test-snapshots
- Review test failures in HTML report: `npx playwright show-report`
- Inspect snapshots visually in `e2e/visual.spec.ts-snapshots/`

---

**Last Updated:** 2025-11-28
**Playwright Version:** 1.57.0
**Test Count:** 29 tests across 5 test suites
