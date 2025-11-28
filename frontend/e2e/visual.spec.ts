import { test, expect } from '@playwright/test';

/**
 * Visual Regression Tests for NuuMee Phase 1.5
 *
 * These tests capture screenshots of all pages in both desktop and mobile viewports
 * to detect unintended visual changes during development.
 *
 * Run with: npx playwright test --grep @visual
 * Update snapshots: npx playwright test --grep @visual --update-snapshots
 */

// Helper to wait for page to be fully loaded with fonts and images
async function waitForPageReady(page: any) {
  // Wait for network to be idle
  await page.waitForLoadState('networkidle');

  // Wait for fonts to load
  await page.evaluate(() => document.fonts.ready);

  // Small buffer to ensure animations settle
  await page.waitForTimeout(500);
}

test.describe('Visual Regression - Desktop @visual', () => {
  test.use({
    viewport: { width: 1280, height: 720 },
    // Disable animations for consistent screenshots
    reducedMotion: 'reduce',
  });

  test('Homepage matches snapshot', async ({ page }) => {
    await page.goto('/');
    await waitForPageReady(page);

    // Hide dynamic timestamps and dates if any
    await page.addStyleTag({
      content: `
        * {
          animation-duration: 0s !important;
          transition-duration: 0s !important;
        }
      `
    });

    await expect(page).toHaveScreenshot('homepage-desktop.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    });
  });

  test('Login page matches snapshot', async ({ page }) => {
    await page.goto('/login');
    await waitForPageReady(page);

    await expect(page).toHaveScreenshot('login-desktop.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });
  });

  test('Signup page matches snapshot', async ({ page }) => {
    await page.goto('/signup');
    await waitForPageReady(page);

    await expect(page).toHaveScreenshot('signup-desktop.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });
  });

  test('404 error page matches snapshot', async ({ page }) => {
    await page.goto('/this-page-does-not-exist');
    await waitForPageReady(page);

    await expect(page).toHaveScreenshot('404-desktop.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });
  });

  test('Dev sitemap matches snapshot', async ({ page }) => {
    await page.goto('/dev');
    await waitForPageReady(page);

    await expect(page).toHaveScreenshot('dev-sitemap-desktop.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });
  });

  test('Dev component library matches snapshot', async ({ page }) => {
    await page.goto('/dev/components');
    await waitForPageReady(page);

    // Disable animations for consistent screenshots
    await page.addStyleTag({
      content: `
        * {
          animation-duration: 0s !important;
          transition-duration: 0s !important;
        }
      `
    });

    await expect(page).toHaveScreenshot('dev-components-desktop.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    });
  });

  test('Dev component states matches snapshot', async ({ page }) => {
    await page.goto('/dev/states');
    await waitForPageReady(page);

    // Disable animations for loader spinners
    await page.addStyleTag({
      content: `
        .animate-spin,
        .animate-pulse {
          animation: none !important;
        }
        * {
          transition-duration: 0s !important;
        }
      `
    });

    await expect(page).toHaveScreenshot('dev-states-desktop.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    });
  });
});

test.describe('Visual Regression - Mobile @visual', () => {
  test.use({
    viewport: { width: 375, height: 667 }, // iPhone SE
    reducedMotion: 'reduce',
  });

  test('Homepage mobile matches snapshot', async ({ page }) => {
    await page.goto('/');
    await waitForPageReady(page);

    await page.addStyleTag({
      content: `
        * {
          animation-duration: 0s !important;
          transition-duration: 0s !important;
        }
      `
    });

    await expect(page).toHaveScreenshot('homepage-mobile.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    });
  });

  test('Login page mobile matches snapshot', async ({ page }) => {
    await page.goto('/login');
    await waitForPageReady(page);

    await expect(page).toHaveScreenshot('login-mobile.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });
  });

  test('Signup page mobile matches snapshot', async ({ page }) => {
    await page.goto('/signup');
    await waitForPageReady(page);

    await expect(page).toHaveScreenshot('signup-mobile.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });
  });

  test('404 error page mobile matches snapshot', async ({ page }) => {
    await page.goto('/this-page-does-not-exist');
    await waitForPageReady(page);

    await expect(page).toHaveScreenshot('404-mobile.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });
  });

  test('Dev sitemap mobile matches snapshot', async ({ page }) => {
    await page.goto('/dev');
    await waitForPageReady(page);

    await expect(page).toHaveScreenshot('dev-sitemap-mobile.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });
  });

  test('Dev component library mobile matches snapshot', async ({ page }) => {
    await page.goto('/dev/components');
    await waitForPageReady(page);

    await page.addStyleTag({
      content: `
        * {
          animation-duration: 0s !important;
          transition-duration: 0s !important;
        }
      `
    });

    await expect(page).toHaveScreenshot('dev-components-mobile.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    });
  });

  test('Dev component states mobile matches snapshot', async ({ page }) => {
    await page.goto('/dev/states');
    await waitForPageReady(page);

    await page.addStyleTag({
      content: `
        .animate-spin,
        .animate-pulse {
          animation: none !important;
        }
        * {
          transition-duration: 0s !important;
        }
      `
    });

    await expect(page).toHaveScreenshot('dev-states-mobile.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    });
  });
});

test.describe('Visual Regression - Homepage Sections @visual', () => {
  test.use({
    viewport: { width: 1280, height: 720 },
    reducedMotion: 'reduce',
  });

  test('Homepage hero section matches snapshot', async ({ page }) => {
    await page.goto('/');
    await waitForPageReady(page);

    // Find and scroll to hero section
    const heroSection = page.locator('section').first();
    await heroSection.scrollIntoViewIfNeeded();

    await expect(heroSection).toHaveScreenshot('homepage-hero-section.png', {
      maxDiffPixelRatio: 0.02,
    });
  });

  test('Homepage features section matches snapshot', async ({ page }) => {
    await page.goto('/');
    await waitForPageReady(page);

    // Disable animations
    await page.addStyleTag({
      content: `
        * {
          animation-duration: 0s !important;
          transition-duration: 0s !important;
        }
      `
    });

    // Find features section (contains "Powerful Features")
    const featuresSection = page.locator('section:has-text("Powerful Features")');
    await featuresSection.scrollIntoViewIfNeeded();

    await expect(featuresSection).toHaveScreenshot('homepage-features-section.png', {
      maxDiffPixelRatio: 0.02,
    });
  });

  test('Homepage pricing teaser matches snapshot', async ({ page }) => {
    await page.goto('/');
    await waitForPageReady(page);

    // Find pricing section
    const pricingSection = page.locator('section:has-text("Simple, Transparent Pricing")');
    await pricingSection.scrollIntoViewIfNeeded();

    await expect(pricingSection).toHaveScreenshot('homepage-pricing-section.png', {
      maxDiffPixelRatio: 0.02,
    });
  });
});

test.describe('Visual Regression - Interactive States @visual', () => {
  test.use({
    viewport: { width: 1280, height: 720 },
  });

  test('Dev states page - button states', async ({ page }) => {
    await page.goto('/dev/states');
    await waitForPageReady(page);

    // Disable animations
    await page.addStyleTag({
      content: `
        .animate-spin,
        .animate-pulse {
          animation: none !important;
        }
      `
    });

    // Find the button section
    const buttonSection = page.locator('text=Buttons').locator('..').locator('..');
    await buttonSection.scrollIntoViewIfNeeded();

    await expect(buttonSection).toHaveScreenshot('dev-states-buttons.png', {
      maxDiffPixelRatio: 0.02,
    });
  });

  test('Dev states page - form controls', async ({ page }) => {
    await page.goto('/dev/states');
    await waitForPageReady(page);

    // Find the input fields section
    const inputSection = page.locator('text=Input Fields').locator('..').locator('..');
    await inputSection.scrollIntoViewIfNeeded();

    await expect(inputSection).toHaveScreenshot('dev-states-inputs.png', {
      maxDiffPixelRatio: 0.02,
    });
  });

  test('Dev states page - badges and tags', async ({ page }) => {
    await page.goto('/dev/states');
    await waitForPageReady(page);

    // Disable loader animations
    await page.addStyleTag({
      content: `
        .animate-spin {
          animation: none !important;
        }
      `
    });

    // Find the badges section
    const badgeSection = page.locator('text=Badges & Tags').locator('..').locator('..');
    await badgeSection.scrollIntoViewIfNeeded();

    await expect(badgeSection).toHaveScreenshot('dev-states-badges.png', {
      maxDiffPixelRatio: 0.02,
    });
  });
});

test.describe('Visual Regression - Component Library Sections @visual', () => {
  test.use({
    viewport: { width: 1280, height: 720 },
    reducedMotion: 'reduce',
  });

  test('Component library - buttons section', async ({ page }) => {
    await page.goto('/dev/components');
    await waitForPageReady(page);

    const buttonSection = page.locator('text=Button Variants').locator('..').locator('..');
    await buttonSection.scrollIntoViewIfNeeded();

    await expect(buttonSection).toHaveScreenshot('components-buttons.png', {
      maxDiffPixelRatio: 0.02,
    });
  });

  test('Component library - form controls section', async ({ page }) => {
    await page.goto('/dev/components');
    await waitForPageReady(page);

    const formSection = page.locator('text=Form Controls').locator('..').locator('..');
    await formSection.scrollIntoViewIfNeeded();

    await expect(formSection).toHaveScreenshot('components-forms.png', {
      maxDiffPixelRatio: 0.02,
    });
  });

  test('Component library - pricing cards section', async ({ page }) => {
    await page.goto('/dev/components');
    await waitForPageReady(page);

    const pricingSection = page.locator('text=Pricing Cards').locator('..').locator('..');
    await pricingSection.scrollIntoViewIfNeeded();

    await expect(pricingSection).toHaveScreenshot('components-pricing-cards.png', {
      maxDiffPixelRatio: 0.02,
    });
  });

  test('Component library - color palette section', async ({ page }) => {
    await page.goto('/dev/components');
    await waitForPageReady(page);

    const colorSection = page.locator('text=NuuMee Brand Colors').locator('..').locator('..');
    await colorSection.scrollIntoViewIfNeeded();

    await expect(colorSection).toHaveScreenshot('components-colors.png', {
      maxDiffPixelRatio: 0.01,
    });
  });
});

test.describe('Visual Regression - Cross-browser @visual', () => {
  // This test group will run on all configured browsers in playwright.config.ts

  test('Homepage renders consistently across browsers', async ({ page }) => {
    await page.goto('/');
    await waitForPageReady(page);

    await page.addStyleTag({
      content: `
        * {
          animation-duration: 0s !important;
          transition-duration: 0s !important;
        }
      `
    });

    // Take a screenshot above the fold only for faster cross-browser testing
    await expect(page).toHaveScreenshot('homepage-above-fold.png', {
      fullPage: false,
      maxDiffPixelRatio: 0.03,
    });
  });

  test('Login page renders consistently across browsers', async ({ page }) => {
    await page.goto('/login');
    await waitForPageReady(page);

    await expect(page).toHaveScreenshot('login-above-fold.png', {
      fullPage: false,
      maxDiffPixelRatio: 0.02,
    });
  });
});

test.describe('Visual Regression - Dynamic Content @visual', () => {
  test.use({
    viewport: { width: 1280, height: 720 },
    reducedMotion: 'reduce',
  });

  test('Homepage with filtered use cases', async ({ page }) => {
    await page.goto('/');
    await waitForPageReady(page);

    // Disable animations
    await page.addStyleTag({
      content: `
        * {
          animation-duration: 0s !important;
          transition-duration: 0s !important;
        }
      `
    });

    // Find and interact with use case filters
    const useCasesSection = page.locator('section:has-text("Endless Possibilities")');
    await useCasesSection.scrollIntoViewIfNeeded();

    // Click on a category filter
    const marketingTab = page.locator('button:has-text("Marketing")').first();
    if (await marketingTab.isVisible()) {
      await marketingTab.click();
      await page.waitForTimeout(300);

      await expect(useCasesSection).toHaveScreenshot('homepage-usecases-marketing.png', {
        maxDiffPixelRatio: 0.02,
      });
    }
  });
});

test.describe('Visual Regression - Responsive Breakpoints @visual', () => {
  // Test tablet viewport
  test('Homepage tablet view matches snapshot', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await waitForPageReady(page);

    await page.addStyleTag({
      content: `
        * {
          animation-duration: 0s !important;
          transition-duration: 0s !important;
        }
      `
    });

    await expect(page).toHaveScreenshot('homepage-tablet.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    });
  });

  test('Dev components tablet view matches snapshot', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/dev/components');
    await waitForPageReady(page);

    await page.addStyleTag({
      content: `
        * {
          animation-duration: 0s !important;
          transition-duration: 0s !important;
        }
      `
    });

    await expect(page).toHaveScreenshot('dev-components-tablet.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    });
  });
});
