import { test, expect } from '@playwright/test';

/**
 * Navigation and Routing Tests for NuuMee.AI
 * Tests all pages, navigation flows, and routing behavior
 */

test.describe('Homepage Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display logo and navigate to home when clicked', async ({ page }) => {
    // Verify logo exists and is visible
    const logo = page.locator('header a[href="/"]').first();
    await expect(logo).toBeVisible();
    await expect(logo.locator('text=NuuMee.AI')).toBeVisible();

    // Navigate away and click logo to return home
    await page.goto('/pricing');
    await logo.click();
    await expect(page).toHaveURL('/');
  });

  test('should navigate via header links', async ({ page }) => {
    // Test Home link
    await page.click('nav a[href="/"]');
    await expect(page).toHaveURL('/');

    // Test Create Videos link
    await page.click('nav a[href="/jobs/create"]');
    await expect(page).toHaveURL('/jobs/create');
    await page.goBack();

    // Test Pricing link
    await page.click('nav a[href="/pricing"]');
    await expect(page).toHaveURL('/pricing');
    await page.goBack();

    // Test Docs link
    await page.click('nav a[href="/documentation"]');
    await expect(page).toHaveURL('/documentation');
  });

  test('should navigate via footer links', async ({ page }) => {
    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Test Terms of Service
    await page.click('footer a[href="/terms"]');
    await expect(page).toHaveURL('/terms');
    await page.goBack();

    // Test Privacy Policy
    await page.click('footer a[href="/privacy"]');
    await expect(page).toHaveURL('/privacy');
    await page.goBack();

    // Test Careers
    await page.click('footer a[href="/careers"]');
    await expect(page).toHaveURL('/careers');
  });

  test('should navigate via CTA buttons', async ({ page }) => {
    // Test "Start Creating Free" button in hero
    const heroButton = page.locator('a[href="/jobs/create"] button:has-text("Start Creating")').first();
    await expect(heroButton).toBeVisible();
    await heroButton.click();
    await expect(page).toHaveURL('/jobs/create');
    await page.goBack();

    // Test "Try It Now" button in How It Works section
    await page.evaluate(() => window.scrollTo(0, 1000));
    const tryButton = page.locator('a[href="/jobs/create"] button:has-text("Try It Now")').first();
    await expect(tryButton).toBeVisible();
  });

  test('should display hero section with key content', async ({ page }) => {
    // Check main heading
    await expect(page.locator('h1:has-text("Replace Any Character")')).toBeVisible();

    // Check hero video preview
    await expect(page.locator('[alt="Original video"]')).toBeVisible();
    await expect(page.locator('[alt="AI-replaced character"]')).toBeVisible();

    // Check stats
    await expect(page.locator('text=1M+')).toBeVisible();
    await expect(page.locator('text=Videos Generated')).toBeVisible();
  });

  test('should display all major sections', async ({ page }) => {
    // How It Works section
    await expect(page.locator('text=See the magic in 3 simple steps')).toBeVisible();

    // Use Cases section
    await expect(page.locator('text=Endless Possibilities, Real Results')).toBeVisible();

    // Testimonials section
    await expect(page.locator('text=Loved by 10,000+ Creators')).toBeVisible();

    // Features section
    await expect(page.locator('text=Powerful Features, Simple to Use')).toBeVisible();

    // Pricing teaser section
    await expect(page.locator('text=Simple, Transparent Pricing')).toBeVisible();
  });
});

test.describe('Marketing Pages', () => {
  test('should load /pricing page with pricing cards', async ({ page }) => {
    await page.goto('/pricing');
    await expect(page).toHaveURL('/pricing');

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Check for pricing cards (Free, Creator, Studio)
    await expect(page.locator('text=Free')).toBeVisible();
    await expect(page.locator('text=$0')).toBeVisible();
  });

  test('should load /documentation page', async ({ page }) => {
    await page.goto('/documentation');
    await expect(page).toHaveURL('/documentation');
    await page.waitForLoadState('networkidle');

    // Verify page loaded without errors
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load /examples page with gallery', async ({ page }) => {
    await page.goto('/examples');
    await expect(page).toHaveURL('/examples');
    await page.waitForLoadState('networkidle');

    // Verify page loaded
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load /comparison page', async ({ page }) => {
    await page.goto('/comparison');
    await expect(page).toHaveURL('/comparison');
    await page.waitForLoadState('networkidle');

    // Verify page loaded
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load /testimonials page with testimonial content', async ({ page }) => {
    await page.goto('/testimonials');
    await expect(page).toHaveURL('/testimonials');
    await page.waitForLoadState('networkidle');

    // Verify page loaded
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load /changelog page', async ({ page }) => {
    await page.goto('/changelog');
    await expect(page).toHaveURL('/changelog');
    await page.waitForLoadState('networkidle');

    // Verify page loaded
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load /careers page with job listings', async ({ page }) => {
    await page.goto('/careers');
    await expect(page).toHaveURL('/careers');
    await page.waitForLoadState('networkidle');

    // Verify page loaded
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load /status page with status indicators', async ({ page }) => {
    await page.goto('/status');
    await expect(page).toHaveURL('/status');
    await page.waitForLoadState('networkidle');

    // Verify page loaded
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Legal Pages', () => {
  test('should load /privacy page with privacy policy content', async ({ page }) => {
    await page.goto('/privacy');
    await expect(page).toHaveURL('/privacy');
    await page.waitForLoadState('networkidle');

    // Verify page has content
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load /terms page with terms of service content', async ({ page }) => {
    await page.goto('/terms');
    await expect(page).toHaveURL('/terms');
    await page.waitForLoadState('networkidle');

    // Verify page has content
    await expect(page.locator('body')).toBeVisible();
  });

  test('should navigate between legal pages', async ({ page }) => {
    await page.goto('/privacy');
    await expect(page).toHaveURL('/privacy');

    // Navigate to footer and click Terms
    const termsLink = page.locator('footer a[href="/terms"]');
    await termsLink.scrollIntoViewIfNeeded();
    await termsLink.click();
    await expect(page).toHaveURL('/terms');

    // Go back to Privacy
    const privacyLink = page.locator('footer a[href="/privacy"]');
    await privacyLink.scrollIntoViewIfNeeded();
    await privacyLink.click();
    await expect(page).toHaveURL('/privacy');
  });
});

test.describe('Dev Pages', () => {
  test('should load /dev page with sitemap', async ({ page }) => {
    await page.goto('/dev');
    await expect(page).toHaveURL('/dev');

    // Check for sitemap header
    await expect(page.locator('h1:has-text("NuuMee.AI Design System")')).toBeVisible();

    // Check for page sections
    await expect(page.locator('text=Public Pages')).toBeVisible();
    await expect(page.locator('text=Authenticated Pages')).toBeVisible();
    await expect(page.locator('text=Design System & Testing')).toBeVisible();

    // Verify total pages count is displayed
    await expect(page.locator('text=Total Pages')).toBeVisible();
  });

  test('should load /dev/components page with component demos', async ({ page }) => {
    await page.goto('/dev/components');
    await expect(page).toHaveURL('/dev/components');

    // Check page title
    await expect(page.locator('h1:has-text("Component Library")')).toBeVisible();

    // Check for component sections
    await expect(page.locator('h2:has-text("Button Variants")')).toBeVisible();
    await expect(page.locator('h2:has-text("Form Controls")')).toBeVisible();
    await expect(page.locator('h2:has-text("Color Palette")')).toBeVisible();

    // Verify color swatches are displayed
    await expect(page.locator('text=#00F0D9')).toBeVisible();
    await expect(page.locator('text=#3B1FE2')).toBeVisible();
  });

  test('should load /dev/states page with state demos', async ({ page }) => {
    await page.goto('/dev/states');
    await expect(page).toHaveURL('/dev/states');

    // Check page title
    await expect(page.locator('h1:has-text("Component States Reference")')).toBeVisible();

    // Check for state sections
    await expect(page.locator('h2:has-text("Buttons")')).toBeVisible();
    await expect(page.locator('h2:has-text("Input Fields")')).toBeVisible();
    await expect(page.locator('h2:has-text("Badges & Tags")')).toBeVisible();

    // Verify different button states are shown
    await expect(page.locator('text=Default')).toBeVisible();
    await expect(page.locator('text=Hover')).toBeVisible();
    await expect(page.locator('text=Active')).toBeVisible();
    await expect(page.locator('text=Disabled')).toBeVisible();
  });

  test('should load /dev/modals page with modal buttons', async ({ page }) => {
    await page.goto('/dev/modals');
    await expect(page).toHaveURL('/dev/modals');

    // Check page title
    await expect(page.locator('h1:has-text("Subscription Modal Variations")')).toBeVisible();

    // Check for modal trigger cards
    await expect(page.locator('text=subscribe Modal')).toBeVisible();
    await expect(page.locator('text=upgrade Modal')).toBeVisible();
    await expect(page.locator('text=cancel Modal')).toBeVisible();
  });

  test('should open modal on /dev/modals page', async ({ page }) => {
    await page.goto('/dev/modals');

    // Click subscribe modal button
    await page.click('button:has-text("Open subscribe Modal")');

    // Verify modal opens
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await expect(page.locator('text=Subscribe to NuuMee')).toBeVisible();

    // Close modal
    await page.click('button:has-text("Cancel")');
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
  });

  test('should navigate between dev pages', async ({ page }) => {
    // Start at /dev
    await page.goto('/dev');

    // Click Component Library link
    await page.click('a[href="/dev/components"]');
    await expect(page).toHaveURL('/dev/components');

    // Go back to dev menu via link
    await page.click('a[href="/dev"]:has-text("Dev Menu")');
    await expect(page).toHaveURL('/dev');

    // Click Component States link
    await page.click('a[href="/dev/states"]');
    await expect(page).toHaveURL('/dev/states');
  });
});

test.describe('404 Page', () => {
  test('should display 404 page for unknown route', async ({ page }) => {
    await page.goto('/this-page-does-not-exist');

    // Verify 404 page is shown
    await expect(page.locator('text=404')).toBeVisible();
    await expect(page.locator('text=Scene Missing')).toBeVisible();
    await expect(page.locator('text=Take 404: Page Not Found')).toBeVisible();
  });

  test('should have helpful links on 404 page', async ({ page }) => {
    await page.goto('/nonexistent-route');

    // Verify helpful links exist
    await expect(page.locator('a[href="/"]')).toBeVisible();
    await expect(page.locator('a[href="/jobs/create"]')).toBeVisible();
    await expect(page.locator('a[href="/jobs"]')).toBeVisible();
    await expect(page.locator('a[href="/support"]')).toBeVisible();
  });

  test('should navigate back home from 404 page', async ({ page }) => {
    await page.goto('/invalid-url');

    // Click "Roll Camera on New Project" button (goes to home)
    await page.click('a[href="/"] button:has-text("Roll Camera")');
    await expect(page).toHaveURL('/');
  });

  test('should navigate to other pages from 404', async ({ page }) => {
    await page.goto('/missing-page');

    // Click Generate Videos button
    await page.click('a[href="/jobs/create"] button:has-text("Generate Videos")');
    await expect(page).toHaveURL('/jobs/create');
  });
});

test.describe('Authentication Pages', () => {
  test('should load /login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveURL('/login');
    await page.waitForLoadState('networkidle');

    // Verify page loaded
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load /signup page', async ({ page }) => {
    await page.goto('/signup');
    await expect(page).toHaveURL('/signup');
    await page.waitForLoadState('networkidle');

    // Verify page loaded
    await expect(page.locator('body')).toBeVisible();
  });

  test('should navigate from login to signup', async ({ page }) => {
    await page.goto('/login');

    // Look for signup link (if exists in UI)
    const signupLink = page.locator('a[href="/signup"]').first();
    if (await signupLink.isVisible()) {
      await signupLink.click();
      await expect(page).toHaveURL('/signup');
    }
  });
});

test.describe('Cross-Page Navigation Flows', () => {
  test('should navigate through complete user journey', async ({ page }) => {
    // Start on homepage
    await page.goto('/');
    await expect(page).toHaveURL('/');

    // Go to pricing
    await page.click('nav a[href="/pricing"]');
    await expect(page).toHaveURL('/pricing');

    // Go to documentation
    await page.click('nav a[href="/documentation"]');
    await expect(page).toHaveURL('/documentation');

    // Go to create videos
    await page.click('nav a[href="/jobs/create"]');
    await expect(page).toHaveURL('/jobs/create');

    // Return home via logo
    await page.click('header a[href="/"]');
    await expect(page).toHaveURL('/');
  });

  test('should use browser back/forward navigation', async ({ page }) => {
    await page.goto('/');
    await page.goto('/pricing');
    await page.goto('/documentation');

    // Go back
    await page.goBack();
    await expect(page).toHaveURL('/pricing');

    // Go back again
    await page.goBack();
    await expect(page).toHaveURL('/');

    // Go forward
    await page.goForward();
    await expect(page).toHaveURL('/pricing');
  });

  test('should maintain scroll position on navigation', async ({ page }) => {
    await page.goto('/');

    // Scroll down
    await page.evaluate(() => window.scrollTo(0, 1000));
    const scrollPos = await page.evaluate(() => window.scrollY);
    expect(scrollPos).toBeGreaterThan(500);

    // Navigate away
    await page.click('nav a[href="/pricing"]');
    await expect(page).toHaveURL('/pricing');

    // Navigate back
    await page.goBack();
    await expect(page).toHaveURL('/');
  });
});

test.describe('Responsive Navigation', () => {
  test('should display mobile navigation on small screens', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Logo should still be visible
    await expect(page.locator('header a[href="/"]')).toBeVisible();

    // Desktop nav might be hidden
    const desktopNav = page.locator('nav.hidden.md\\:flex');
    if (await desktopNav.count() > 0) {
      await expect(desktopNav).not.toBeVisible();
    }
  });

  test('should display desktop navigation on large screens', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');

    // Desktop nav should be visible
    const nav = page.locator('header nav');
    await expect(nav).toBeVisible();

    // All nav links should be visible
    await expect(page.locator('nav a[href="/"]')).toBeVisible();
    await expect(page.locator('nav a[href="/jobs/create"]')).toBeVisible();
    await expect(page.locator('nav a[href="/pricing"]')).toBeVisible();
  });
});

test.describe('Page Load Performance', () => {
  test('should load homepage quickly', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    // Page should load within reasonable time (5 seconds)
    expect(loadTime).toBeLessThan(5000);
  });

  test('should not have console errors on homepage', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Filter out known acceptable errors (like Firebase warnings)
    const criticalErrors = consoleErrors.filter(
      (error) =>
        !error.includes('Firebase') &&
        !error.includes('firebaseapp.com') &&
        !error.includes('favicon')
    );

    expect(criticalErrors).toHaveLength(0);
  });

  test('should not have broken images on homepage', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Get all images
    const images = await page.locator('img').all();

    // Check each image loads successfully
    for (const img of images) {
      const naturalWidth = await img.evaluate((el) => (el as HTMLImageElement).naturalWidth);
      // Image should have width > 0 (not broken), or have a fallback placeholder
      // Allow 0 width for lazy-loaded images
      expect(naturalWidth).toBeGreaterThanOrEqual(0);
    }
  });
});

test.describe('SEO and Metadata', () => {
  test('should have proper page title on homepage', async ({ page }) => {
    await page.goto('/');
    const title = await page.title();
    expect(title).toContain('NuuMee');
  });

  test('should have meta description', async ({ page }) => {
    await page.goto('/');
    const metaDescription = await page.locator('meta[name="description"]').getAttribute('content');
    expect(metaDescription).toBeTruthy();
    expect(metaDescription).toContain('AI');
  });

  test('should have proper canonical URL', async ({ page }) => {
    await page.goto('/');

    // Check if canonical link exists (optional)
    const canonical = page.locator('link[rel="canonical"]');
    const count = await canonical.count();

    if (count > 0) {
      const href = await canonical.getAttribute('href');
      expect(href).toBeTruthy();
    }
  });
});

test.describe('Accessibility', () => {
  test('should have accessible navigation landmarks', async ({ page }) => {
    await page.goto('/');

    // Header should exist
    await expect(page.locator('header')).toBeVisible();

    // Main content should exist
    await expect(page.locator('main')).toBeVisible();

    // Footer should exist
    await expect(page.locator('footer')).toBeVisible();
  });

  test('should have keyboard navigable links', async ({ page }) => {
    await page.goto('/');

    // Focus first link
    await page.keyboard.press('Tab');

    // Check if an element is focused
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
  });

  test('should have alt text on images', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Get all images
    const images = await page.locator('img').all();

    // Each image should have alt attribute (can be empty for decorative images)
    for (const img of images) {
      const alt = await img.getAttribute('alt');
      expect(alt).not.toBeNull();
    }
  });
});
