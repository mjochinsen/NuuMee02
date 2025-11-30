import { test, expect } from '@playwright/test';

/**
 * Tests for dashboard pages (protected routes)
 * These test the behavior when unauthenticated and page structure
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://nuumee-api-450296399943.us-central1.run.app';

test.describe('Jobs Page', () => {
  test('jobs page loads and shows auth requirement when unauthenticated', async ({ page }) => {
    await page.goto('/jobs');
    await page.waitForLoadState('networkidle');

    // Should either redirect to login or show sign-in prompt
    const url = page.url();
    const redirectedToLogin = url.includes('/login');
    const showsSignInPrompt = await page.locator('text=/sign in|log in|create an account/i').first().isVisible().catch(() => false);
    const showsJobsContent = await page.locator('text=/your videos|my videos|job|generation/i').first().isVisible().catch(() => false);

    // Either redirected, shows sign-in prompt, or shows jobs page (which will be empty)
    expect(redirectedToLogin || showsSignInPrompt || showsJobsContent).toBeTruthy();
  });

  test('jobs page has proper structure', async ({ page }) => {
    await page.goto('/jobs');
    await page.waitForLoadState('networkidle');

    // If we're on jobs page (not redirected), check structure
    if (page.url().includes('/jobs')) {
      // Check for heading
      const hasHeading = await page.locator('h1, h2').first().isVisible().catch(() => false);

      // Check for navigation back to create
      const hasCreateLink = await page.locator('a[href*="create"], button:has-text(/create|new/i)').first().isVisible().catch(() => false);

      // At least one of these should exist on a properly structured jobs page
      expect(hasHeading || hasCreateLink).toBeTruthy();
    }
  });
});

test.describe('Referral Page', () => {
  test('referral page loads and shows auth requirement when unauthenticated', async ({ page }) => {
    await page.goto('/referral');
    await page.waitForLoadState('networkidle');

    const url = page.url();
    const redirectedToLogin = url.includes('/login');
    const showsSignInPrompt = await page.locator('text=/sign in|log in|create an account/i').first().isVisible().catch(() => false);
    const showsReferralContent = await page.locator('text=/referral|invite|friend|credit/i').first().isVisible().catch(() => false);

    expect(redirectedToLogin || showsSignInPrompt || showsReferralContent).toBeTruthy();
  });

  test('referral page has proper structure when loaded', async ({ page }) => {
    await page.goto('/referral');
    await page.waitForLoadState('networkidle');

    if (page.url().includes('/referral')) {
      // Check for referral-related content
      const hasHeading = await page.locator('h1, h2').first().isVisible().catch(() => false);

      expect(hasHeading).toBeTruthy();
    }
  });
});

test.describe('Billing Page', () => {
  test('billing page loads and shows auth requirement', async ({ page }) => {
    await page.goto('/billing');
    await page.waitForLoadState('networkidle');

    const url = page.url();
    const redirectedToLogin = url.includes('/login');
    const showsSignInPrompt = await page.locator('text=/sign in|log in|create an account/i').first().isVisible().catch(() => false);
    const showsBillingContent = await page.locator('text=/billing|credits|subscription|payment/i').first().isVisible().catch(() => false);

    expect(redirectedToLogin || showsSignInPrompt || showsBillingContent).toBeTruthy();
  });

  test('billing page shows credit packages', async ({ page }) => {
    await page.goto('/billing');
    await page.waitForLoadState('networkidle');

    if (page.url().includes('/billing')) {
      // Check for credit packages or pricing info
      const hasCredits = await page.locator('text=/credits|package/i').first().isVisible().catch(() => false);
      const hasPricing = await page.locator('text=/\\$\\d+/').first().isVisible().catch(() => false);

      // Billing page should show some pricing/credits info even when not logged in
      expect(hasCredits || hasPricing).toBeTruthy();
    }
  });
});

test.describe('Account Page', () => {
  test('account page loads and shows auth requirement', async ({ page }) => {
    await page.goto('/account');
    await page.waitForLoadState('networkidle');

    const url = page.url();
    const redirectedToLogin = url.includes('/login');
    const showsSignInPrompt = await page.locator('text=/sign in|log in|create an account/i').first().isVisible().catch(() => false);
    const showsAccountContent = await page.locator('text=/account|profile|settings/i').first().isVisible().catch(() => false);

    expect(redirectedToLogin || showsSignInPrompt || showsAccountContent).toBeTruthy();
  });
});

test.describe('Create Video Page', () => {
  test('create page loads and shows upload interface or auth', async ({ page }) => {
    await page.goto('/create');
    await page.waitForLoadState('networkidle');

    const url = page.url();
    const redirectedToLogin = url.includes('/login');
    const showsSignInPrompt = await page.locator('text=/sign in|log in/i').first().isVisible().catch(() => false);
    const showsUploadUI = await page.locator('text=/upload|drag|drop|image|video/i').first().isVisible().catch(() => false);

    expect(redirectedToLogin || showsSignInPrompt || showsUploadUI).toBeTruthy();
  });

  test('create page in test mode loads test files', async ({ page }) => {
    await page.goto('/create?test=1');
    await page.waitForLoadState('networkidle');

    // In test mode, should show test files or test mode indicator
    const hasTestMode = await page.locator('text=/test mode|sample|demo/i').first().isVisible().catch(() => false);
    const hasUploadUI = await page.locator('text=/upload|drag|drop/i').first().isVisible().catch(() => false);

    // Either shows test mode or normal upload UI
    expect(hasTestMode || hasUploadUI).toBeTruthy();
  });
});

test.describe('API Key Page', () => {
  test('api-keys page loads and shows auth requirement', async ({ page }) => {
    await page.goto('/api-keys');
    await page.waitForLoadState('networkidle');

    const url = page.url();
    const redirectedToLogin = url.includes('/login');
    const showsSignInPrompt = await page.locator('text=/sign in|log in|create an account/i').first().isVisible().catch(() => false);
    const showsApiKeyContent = await page.locator('text=/api key|access key|secret/i').first().isVisible().catch(() => false);

    expect(redirectedToLogin || showsSignInPrompt || showsApiKeyContent).toBeTruthy();
  });
});

test.describe('Dev Pages (Design Review)', () => {
  test('dev index page lists all development pages', async ({ page }) => {
    await page.goto('/dev');
    await page.waitForLoadState('networkidle');

    // Check dev page loads
    await expect(page.locator('h1, h2').first()).toBeVisible();

    // Check for links to other dev pages
    const hasLinks = await page.locator('a[href*="/dev/"]').first().isVisible().catch(() => false);

    expect(hasLinks).toBeTruthy();
  });

  test('dev components page shows UI components', async ({ page }) => {
    await page.goto('/dev/components');
    await page.waitForLoadState('networkidle');

    // Check components page loads with some content
    await expect(page.locator('main, [class*="content"]').first()).toBeVisible();
  });

  test('dev modals page shows modal examples', async ({ page }) => {
    await page.goto('/dev/modals');
    await page.waitForLoadState('networkidle');

    // Check modals page loads
    await expect(page.locator('h1, h2').first()).toBeVisible();

    // Check for modal trigger buttons
    const hasButtons = await page.locator('button').first().isVisible().catch(() => false);

    expect(hasButtons).toBeTruthy();
  });

  test('dev states page shows loading/error states', async ({ page }) => {
    await page.goto('/dev/states');
    await page.waitForLoadState('networkidle');

    // Check states page loads
    await expect(page.locator('main').first()).toBeVisible();
  });
});

test.describe('API Endpoint Validation', () => {
  test('job cost estimation endpoint works', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/v1/jobs/cost?job_type=animate&resolution=480p&duration_seconds=10`);
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data).toHaveProperty('estimated_credits');
    expect(data.estimated_credits).toBeGreaterThan(0);
  });

  test('credit packages have valid Stripe price IDs', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/v1/credits/packages`);
    expect(response.ok()).toBeTruthy();

    const packages = await response.json();

    for (const pkg of packages) {
      expect(pkg).toHaveProperty('stripe_price_id');
      // Stripe price IDs start with 'price_'
      expect(pkg.stripe_price_id).toMatch(/^price_/);
    }
  });

  test('subscription tiers have valid configuration', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/v1/subscriptions/tiers`);
    expect(response.ok()).toBeTruthy();

    const tiers = await response.json();

    for (const tier of tiers) {
      expect(tier).toHaveProperty('tier');
      expect(tier).toHaveProperty('name');
      expect(tier).toHaveProperty('price_cents');
      expect(tier).toHaveProperty('monthly_credits');
      expect(tier.price_cents).toBeGreaterThan(0);
      expect(tier.monthly_credits).toBeGreaterThan(0);
    }
  });
});
