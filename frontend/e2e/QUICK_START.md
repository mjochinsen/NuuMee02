# Quick Start Guide - Authentication E2E Tests

## 1. Install Dependencies

```bash
cd /home/user/NuuMee02/frontend

# Install Playwright browsers (first time only)
npx playwright install

# Install system dependencies (Linux/Ubuntu)
npx playwright install-deps
```

## 2. Start Dev Server

```bash
# In one terminal
pnpm dev
```

## 3. Run Tests

```bash
# In another terminal

# Run all authentication tests
npx playwright test e2e/auth.spec.ts

# Run with visual UI (recommended for debugging)
npx playwright test e2e/auth.spec.ts --ui

# Run in headed mode (see the browser)
npx playwright test e2e/auth.spec.ts --headed
```

## 4. View Results

```bash
# Open HTML report
npx playwright show-report
```

## Common Commands

```bash
# Run specific test group
npx playwright test e2e/auth.spec.ts -g "Login Page"
npx playwright test e2e/auth.spec.ts -g "Signup Page"

# Run visual regression tests only
npx playwright test e2e/auth.spec.ts --grep @visual

# Update visual snapshots (after UI changes)
npx playwright test e2e/auth.spec.ts --grep @visual --update-snapshots

# Run on specific browser
npx playwright test e2e/auth.spec.ts --project=chromium
npx playwright test e2e/auth.spec.ts --project=mobile

# Debug a specific test
npx playwright test e2e/auth.spec.ts -g "should load login page" --debug
```

## Troubleshooting

### Tests won't run

```bash
# Make sure dev server is running
curl http://localhost:3000

# Check if Playwright is installed
npx playwright --version

# Reinstall if needed
npx playwright install --with-deps
```

### Missing system libraries (Linux)

```bash
# Install all dependencies
npx playwright install-deps

# Or manually install
sudo apt-get update
sudo apt-get install -y \
  libxkbcommon0 \
  libgbm1 \
  libpango-1.0-0 \
  libcairo2
```

### Tests fail randomly

```bash
# Run with retries
npx playwright test e2e/auth.spec.ts --retries=2

# Check specific test in debug mode
npx playwright test e2e/auth.spec.ts -g "failing test name" --debug
```

## Test Files

- **Main Test Suite:** `/home/user/NuuMee02/frontend/e2e/auth.spec.ts`
- **Summary:** `/home/user/NuuMee02/frontend/e2e/AUTH_TEST_SUMMARY.md`
- **Config:** `/home/user/NuuMee02/frontend/playwright.config.ts`

## Test Coverage

- **104 total tests** (52 unique × 2 browsers)
- **Login page:** 15 tests
- **Signup page:** 13 tests
- **Protected routes:** 4 tests
- **Public routes:** 4 tests
- **Navigation:** 3 tests
- **Visual regression:** 4 tests
- **Mobile responsive:** 2 tests
- **Accessibility:** 4 tests

## Success!

If tests pass, you'll see:
```
✓ 104 passed (2m 30s)
```

If tests fail:
1. Check the HTML report: `npx playwright show-report`
2. Look at screenshots in `test-results/`
3. Review error messages in terminal
4. Run failing test in debug mode

---

**Need Help?** Check the full documentation in `AUTH_TEST_SUMMARY.md`
