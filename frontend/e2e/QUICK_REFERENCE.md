# Visual Regression Tests - Quick Reference

## One-Time Setup

```bash
pnpm test:setup
# OR manually:
npx playwright install chromium && npx playwright install-deps
```

## Daily Commands

```bash
# Run all visual tests
pnpm test:visual

# Run with interactive UI (recommended)
pnpm test:visual:ui

# Update snapshots after intentional changes
pnpm test:visual:update

# View test report
pnpm test:visual:report
```

## Test Coverage (29 Tests)

### Pages
- Homepage (desktop + mobile + tablet)
- Login/Signup (desktop + mobile)
- 404 Error (desktop + mobile)
- Dev Sitemap (desktop + mobile)
- Component Library (desktop + mobile + tablet)
- Component States (desktop + mobile) **← Design Handoff**

### Sections
- Homepage: hero, features, pricing, use cases
- Components: buttons, forms, colors
- States: buttons, inputs, badges

## Workflow

### Before Committing UI Changes
```bash
pnpm test:visual
# If failures → review report → update if intentional
pnpm test:visual:update
git add e2e/visual.spec.ts-snapshots/
git commit -m "Update visual snapshots"
```

### Design Review
```bash
# Generate latest screenshots
pnpm dev  # Keep running
pnpm test:visual:update

# View screenshots
open e2e/visual.spec.ts-snapshots/chromium/
```

## Key Files

| File | Purpose |
|------|---------|
| `e2e/visual.spec.ts` | Test suite (530 lines) |
| `e2e/README.md` | Full documentation |
| `e2e/setup-visual-tests.sh` | Setup script |
| `playwright.config.ts` | Configuration |
| `VISUAL_TESTING_SUMMARY.md` | Implementation report |

## Snapshot Locations

```
e2e/visual.spec.ts-snapshots/
├── chromium/
│   ├── homepage-desktop.png
│   ├── dev-states-desktop.png  ← All component states
│   ├── dev-components-desktop.png
│   └── ... (29 screenshots)
└── mobile/
    └── (mobile screenshots)
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Browser launch fails | `npx playwright install-deps chromium` |
| Flaky tests | Check animations disabled, fonts loaded |
| Different screenshots on other machine | Use Docker or same OS/browser |

## CI/CD

- Auto-runs on PRs to main/master
- Uploads artifacts on failure
- Manual dispatch to update snapshots

## Resources

- Full Docs: `e2e/README.md`
- Playwright Docs: https://playwright.dev/docs/test-snapshots
- Summary: `VISUAL_TESTING_SUMMARY.md`
