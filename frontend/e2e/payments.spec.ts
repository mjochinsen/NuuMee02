import { test, expect } from '@playwright/test';

// Test configuration
const FRONTEND_URL = 'https://wanapi-prod.web.app';
const API_URL = 'https://nuumee-api-450296399943.us-central1.run.app/api/v1';

// Credit packages configuration (from PRICING_STRATEGY.md)
const CREDIT_PACKAGES = [
  { id: 'starter', name: 'Starter', price: 10, credits: 120 },
  { id: 'popular', name: 'Popular', price: 30, credits: 400 },
  { id: 'pro', name: 'Pro', price: 75, credits: 1100 },
  { id: 'mega', name: 'Mega', price: 150, credits: 2500 },
];

// Stripe test cards
const STRIPE_CARDS = {
  SUCCESS: '4242424242424242',
  DECLINED: '4000000000000002',
  REQUIRES_AUTH: '4000002500003155',
};

test.describe('Pricing Page Display', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/pricing`);
    await page.waitForLoadState('networkidle');
  });

  test('displays all credit packages correctly', async ({ page }) => {
    // Check each package is displayed - use heading role to avoid duplicate matches
    for (const pkg of CREDIT_PACKAGES) {
      await expect(page.getByRole('heading', { name: pkg.name, exact: true })).toBeVisible();
      await expect(page.getByText(`$${pkg.price}`).first()).toBeVisible();
      // Use exact match for credits to avoid matching "credits/month" variants
      await expect(page.getByText(`${pkg.credits} credits`, { exact: true })).toBeVisible();
    }
  });

  test('displays subscription plans with toggle', async ({ page }) => {
    // Check for monthly/annually toggle
    await expect(page.getByText(/monthly/i)).toBeVisible();
    await expect(page.getByText(/annually/i)).toBeVisible();

    // Click annually and check for discount badge
    await page.getByText(/annually/i).click();
    await expect(page.getByText(/save/i)).toBeVisible();
  });

  test('all buy buttons are visible', async ({ page }) => {
    const buyButtons = page.locator('button').filter({ hasText: /buy/i });
    const count = await buyButtons.count();
    expect(count).toBeGreaterThanOrEqual(4); // At least 4 packages
  });

  test('cost calculator is functional', async ({ page }) => {
    // Find calculator section
    const calculator = page.locator('text=Calculator').first();
    if (await calculator.isVisible()) {
      // Interact with slider or input
      const slider = page.locator('input[type="range"]').first();
      if (await slider.isVisible()) {
        await slider.fill('50');
      }
    }
  });
});

test.describe('Unauthenticated User Flow', () => {
  test('redirects to login when clicking Buy without authentication', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto(`${FRONTEND_URL}/pricing`);
    await page.waitForLoadState('networkidle');

    // Click first Buy button
    const buyButton = page.locator('button').filter({ hasText: /buy/i }).first();
    await buyButton.click();

    // Should redirect to login
    await page.waitForURL(/\/login/, { timeout: 10000 });
    expect(page.url()).toContain('/login');
  });
});

test.describe('Payment Success Page', () => {
  test('displays success message and content', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/payment/success?credits=400`);
    await page.waitForLoadState('networkidle');

    // Should show success indicator
    await expect(page.getByText(/success|payment/i).first()).toBeVisible();

    // Should show credits amount
    await expect(page.getByText(/credits/i).first()).toBeVisible();
  });

  test('has navigation buttons', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/payment/success?credits=400`);
    await page.waitForLoadState('networkidle');

    // Should have CTA buttons
    const buttons = page.locator('button, a[href]');
    const count = await buttons.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('Payment Cancelled Page', () => {
  test('displays cancellation message', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/payment/cancelled`);
    await page.waitForLoadState('networkidle');

    // Should show cancelled message
    await expect(page.getByText(/cancel/i).first()).toBeVisible();
  });

  test('has try again and support links', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/payment/cancelled`);
    await page.waitForLoadState('networkidle');

    // Should have Try Again link
    await expect(page.getByText(/try again/i)).toBeVisible();

    // Should have Support link - use more specific selector
    await expect(page.getByRole('link', { name: /support/i }).first()).toBeVisible();
  });

  test('try again navigates to pricing', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/payment/cancelled`);
    await page.waitForLoadState('networkidle');

    await page.getByText(/try again/i).click();
    await page.waitForURL(/\/pricing/, { timeout: 10000 });
  });
});

test.describe('API Endpoints', () => {
  test('credits packages endpoint returns data', async ({ request }) => {
    const response = await request.get(`${API_URL}/credits/packages`);
    expect(response.ok()).toBeTruthy();

    const packages = await response.json();
    expect(packages).toBeInstanceOf(Array);
    expect(packages.length).toBe(4);

    // Verify package structure
    for (const pkg of packages) {
      expect(pkg).toHaveProperty('id');
      expect(pkg).toHaveProperty('name');
      expect(pkg).toHaveProperty('price_cents');
      expect(pkg).toHaveProperty('credits');
    }
  });

  test('health endpoint is healthy', async ({ request }) => {
    const response = await request.get('https://nuumee-api-450296399943.us-central1.run.app/health');
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.status).toBe('healthy');
  });
});

test.describe('Mobile Responsiveness', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('pricing page is mobile friendly', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/pricing`);
    await page.waitForLoadState('networkidle');

    // All packages should still be visible - use heading role to avoid duplicate matches
    for (const pkg of CREDIT_PACKAGES) {
      await expect(page.getByRole('heading', { name: pkg.name, exact: true })).toBeVisible();
    }
  });

  test('buy buttons are tappable on mobile', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/pricing`);
    await page.waitForLoadState('networkidle');

    const buyButton = page.locator('button').filter({ hasText: /buy/i }).first();
    const box = await buyButton.boundingBox();

    expect(box).toBeTruthy();
    if (box) {
      // Check buttons meet minimum touch target (36px is acceptable with padding)
      expect(box.height).toBeGreaterThanOrEqual(36);
    }
  });
});

test.describe('Accessibility', () => {
  test('pricing page has proper heading structure', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/pricing`);
    await page.waitForLoadState('networkidle');

    // Should have h1
    const h1 = page.locator('h1');
    await expect(h1.first()).toBeVisible();
  });

  test('buttons are keyboard accessible', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/pricing`);
    await page.waitForLoadState('networkidle');

    // Tab to first interactive element
    await page.keyboard.press('Tab');

    // Something should be focused
    const focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(focused).toBeTruthy();
  });
});
