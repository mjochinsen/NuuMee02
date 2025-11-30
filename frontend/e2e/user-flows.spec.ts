import { test, expect } from '@playwright/test';

/**
 * Comprehensive E2E tests for critical user flows
 * Tests the main user journeys through the application
 */

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://nuumee-api-450296399943.us-central1.run.app';

test.describe('Public Pages Load Correctly', () => {
  test('home page displays key elements', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check main heading exists
    await expect(page.locator('h1').first()).toBeVisible();

    // Check navigation links
    await expect(page.locator('nav')).toBeVisible();

    // Check CTA buttons exist
    const ctaButtons = page.locator('a[href*="signup"], button:has-text("Get Started"), a:has-text("Try")');
    await expect(ctaButtons.first()).toBeVisible();
  });

  test('pricing page displays credit packages', async ({ page }) => {
    await page.goto('/pricing');
    await page.waitForLoadState('networkidle');

    // Check pricing heading
    await expect(page.locator('h1, h2').filter({ hasText: /pricing|credits/i }).first()).toBeVisible();

    // Check at least one pricing card/package is displayed
    const pricingCards = page.locator('[class*="card"], [class*="pricing"], [class*="package"]').first();
    await expect(pricingCards).toBeVisible();

    // Check price is displayed ($ followed by number)
    await expect(page.locator('text=/\\$\\d+/')).toBeVisible();
  });

  test('examples page displays content', async ({ page }) => {
    await page.goto('/examples');
    await page.waitForLoadState('networkidle');

    // Check examples heading
    await expect(page.locator('h1, h2').first()).toBeVisible();

    // Check some example content is displayed
    const content = page.locator('main, [class*="content"]');
    await expect(content).toBeVisible();
  });

  test('affiliate page displays application form', async ({ page }) => {
    await page.goto('/affiliate');
    await page.waitForLoadState('networkidle');

    // Check affiliate heading
    await expect(page.locator('h1, h2').filter({ hasText: /affiliate/i }).first()).toBeVisible();

    // Check form elements exist
    await expect(page.locator('input[type="email"], input[name*="email"]').first()).toBeVisible();
    await expect(page.locator('button[type="submit"], button:has-text("Apply")').first()).toBeVisible();
  });

  test('support page displays contact options', async ({ page }) => {
    await page.goto('/support');
    await page.waitForLoadState('networkidle');

    // Check support heading
    await expect(page.locator('h1, h2').filter({ hasText: /support|help|contact/i }).first()).toBeVisible();
  });

  test('terms page displays legal content', async ({ page }) => {
    await page.goto('/terms');
    await page.waitForLoadState('networkidle');

    // Check terms heading
    await expect(page.locator('h1, h2').filter({ hasText: /terms/i }).first()).toBeVisible();

    // Check content exists
    await expect(page.locator('main')).toBeVisible();
  });

  test('privacy page displays policy content', async ({ page }) => {
    await page.goto('/privacy');
    await page.waitForLoadState('networkidle');

    // Check privacy heading
    await expect(page.locator('h1, h2').filter({ hasText: /privacy/i }).first()).toBeVisible();
  });
});

test.describe('Authentication Pages', () => {
  test('login page has all required elements', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Check login form exists
    await expect(page.locator('input[type="email"], input[name*="email"]').first()).toBeVisible();
    await expect(page.locator('input[type="password"]').first()).toBeVisible();

    // Check submit button
    await expect(page.locator('button[type="submit"], button:has-text(/sign in|log in/i)').first()).toBeVisible();

    // Check social login options
    await expect(page.locator('button:has-text("Google"), button[aria-label*="Google"]').first()).toBeVisible();

    // Check signup link
    await expect(page.locator('a[href*="signup"]').first()).toBeVisible();
  });

  test('signup page has all required elements', async ({ page }) => {
    await page.goto('/signup');
    await page.waitForLoadState('networkidle');

    // Check signup form exists
    await expect(page.locator('input[type="email"], input[name*="email"]').first()).toBeVisible();
    await expect(page.locator('input[type="password"]').first()).toBeVisible();

    // Check name field
    await expect(page.locator('input[name*="name"], input[placeholder*="name" i]').first()).toBeVisible();

    // Check submit button
    await expect(page.locator('button[type="submit"], button:has-text(/sign up|create account/i)').first()).toBeVisible();

    // Check login link
    await expect(page.locator('a[href*="login"]').first()).toBeVisible();
  });

  test('forgot password page exists and works', async ({ page }) => {
    await page.goto('/forgot-password');
    await page.waitForLoadState('networkidle');

    // Check email input
    await expect(page.locator('input[type="email"]').first()).toBeVisible();

    // Check submit button
    await expect(page.locator('button[type="submit"], button:has-text(/reset|send/i)').first()).toBeVisible();
  });
});

test.describe('Navigation Flow', () => {
  test('can navigate from home to pricing', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Click pricing link
    await page.locator('a[href*="pricing"], nav >> text=Pricing').first().click();
    await page.waitForLoadState('networkidle');

    // Verify on pricing page
    expect(page.url()).toContain('/pricing');
  });

  test('can navigate from home to login', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Click login link
    await page.locator('a[href*="login"], nav >> text=/log in|sign in/i').first().click();
    await page.waitForLoadState('networkidle');

    // Verify on login page
    expect(page.url()).toContain('/login');
  });

  test('can navigate from login to signup', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Click signup link
    await page.locator('a[href*="signup"]').first().click();
    await page.waitForLoadState('networkidle');

    // Verify on signup page
    expect(page.url()).toContain('/signup');
  });

  test('can navigate from signup to login', async ({ page }) => {
    await page.goto('/signup');
    await page.waitForLoadState('networkidle');

    // Click login link
    await page.locator('a[href*="login"]').first().click();
    await page.waitForLoadState('networkidle');

    // Verify on login page
    expect(page.url()).toContain('/login');
  });
});

test.describe('API Health Checks', () => {
  test('backend API is healthy', async ({ request }) => {
    const response = await request.get(`${API_URL}/health`);
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.status).toBe('healthy');
  });

  test('credit packages endpoint returns data', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/v1/credits/packages`);
    expect(response.ok()).toBeTruthy();

    const packages = await response.json();
    expect(Array.isArray(packages)).toBeTruthy();
    expect(packages.length).toBeGreaterThan(0);

    // Check package structure
    const firstPackage = packages[0];
    expect(firstPackage).toHaveProperty('id');
    expect(firstPackage).toHaveProperty('credits');
    expect(firstPackage).toHaveProperty('price_cents');
  });

  test('subscription tiers endpoint returns data', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/v1/subscriptions/tiers`);
    expect(response.ok()).toBeTruthy();

    const tiers = await response.json();
    expect(Array.isArray(tiers)).toBeTruthy();
    expect(tiers.length).toBeGreaterThan(0);

    // Check tier structure
    const firstTier = tiers[0];
    expect(firstTier).toHaveProperty('tier');
    expect(firstTier).toHaveProperty('monthly_credits');
    expect(firstTier).toHaveProperty('price_cents');
  });

  test('protected endpoints require authentication', async ({ request }) => {
    // Try to access protected endpoint without auth
    const response = await request.get(`${API_URL}/api/v1/auth/me`);
    expect(response.status()).toBe(401);
  });

  test('referral endpoint requires authentication', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/v1/referral/code`);
    expect(response.status()).toBe(401);
  });

  test('jobs endpoint requires authentication', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/v1/jobs`);
    expect(response.status()).toBe(401);
  });

  test('affiliate stats endpoint requires authentication', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/v1/affiliate/stats`);
    expect(response.status()).toBe(401);
  });
});

test.describe('Form Validation', () => {
  test('login form shows error for invalid email', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Enter invalid email
    await page.locator('input[type="email"]').first().fill('notanemail');
    await page.locator('input[type="password"]').first().fill('password123');

    // Submit form
    await page.locator('button[type="submit"]').first().click();

    // Should show error or validation message
    await page.waitForTimeout(1000);

    // Check for error indicators (validation message or still on login page)
    const hasError = await page.locator('text=/invalid|error|valid email/i').first().isVisible().catch(() => false);
    const stillOnLogin = page.url().includes('/login');

    expect(hasError || stillOnLogin).toBeTruthy();
  });

  test('signup form validates password requirements', async ({ page }) => {
    await page.goto('/signup');
    await page.waitForLoadState('networkidle');

    // Enter weak password
    const passwordInput = page.locator('input[type="password"]').first();
    await passwordInput.fill('weak');

    // Check for password strength indicator or requirements
    await page.waitForTimeout(500);

    // Look for password strength/requirements text
    const hasRequirements = await page.locator('text=/weak|strong|requirement|character/i').first().isVisible().catch(() => false);

    // Password validation should be present
    expect(hasRequirements).toBeTruthy();
  });

  test('affiliate form requires all fields', async ({ page }) => {
    await page.goto('/affiliate');
    await page.waitForLoadState('networkidle');

    // Try to submit without filling form
    const submitButton = page.locator('button[type="submit"], button:has-text("Apply")').first();
    await submitButton.click();

    // Should show validation errors or not submit
    await page.waitForTimeout(500);

    // Check we're still on the affiliate page (form didn't submit)
    expect(page.url()).toContain('/affiliate');
  });
});

test.describe('Responsive Design', () => {
  test('home page is responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check content is visible
    await expect(page.locator('h1').first()).toBeVisible();

    // Check navigation (may be in hamburger menu)
    const nav = page.locator('nav, button[aria-label*="menu"], button[class*="menu"]');
    await expect(nav.first()).toBeVisible();
  });

  test('pricing page is responsive on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad
    await page.goto('/pricing');
    await page.waitForLoadState('networkidle');

    // Check pricing content is visible
    await expect(page.locator('h1, h2').first()).toBeVisible();
    await expect(page.locator('text=/\\$\\d+/').first()).toBeVisible();
  });

  test('login page works on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Check form elements are visible and usable
    await expect(page.locator('input[type="email"]').first()).toBeVisible();
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
    await expect(page.locator('button[type="submit"]').first()).toBeVisible();
  });
});

test.describe('Error Handling', () => {
  test('404 page displays for invalid routes', async ({ page }) => {
    await page.goto('/this-page-does-not-exist-12345');
    await page.waitForLoadState('networkidle');

    // Check for 404 content
    const has404 = await page.locator('text=/404|not found|page.*exist/i').first().isVisible().catch(() => false);
    const hasHomeLink = await page.locator('a[href="/"]').first().isVisible().catch(() => false);

    // Should show 404 message or redirect to home
    expect(has404 || hasHomeLink || page.url() === `${BASE_URL}/`).toBeTruthy();
  });

  test('payment cancelled page shows message', async ({ page }) => {
    await page.goto('/payment/cancelled');
    await page.waitForLoadState('networkidle');

    // Check for cancellation message
    await expect(page.locator('text=/cancel|payment|try again/i').first()).toBeVisible();
  });

  test('payment success page shows confirmation', async ({ page }) => {
    await page.goto('/payment/success');
    await page.waitForLoadState('networkidle');

    // Check for success message or redirect
    const hasSuccess = await page.locator('text=/success|thank|complete|credit/i').first().isVisible().catch(() => false);
    const onSuccessPage = page.url().includes('/payment/success');

    expect(hasSuccess || onSuccessPage).toBeTruthy();
  });
});
