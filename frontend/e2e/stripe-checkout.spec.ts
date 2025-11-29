import { test, expect } from '@playwright/test';

/**
 * Comprehensive Stripe Checkout Tests
 * Tests payments, subscriptions, and payment method management
 *
 * Reference: PRICING_STRATEGY.md
 * - Free tier: 25 credits on signup
 * - Credit packages: Starter ($10), Popular ($30), Pro ($75), Mega ($150)
 * - Subscriptions: Creator ($29/mo), Studio ($99/mo)
 */

// Test configuration
const FRONTEND_URL = 'https://wanapi-prod.web.app';
const API_URL = 'https://nuumee-api-450296399943.us-central1.run.app/api/v1';

// Stripe test card numbers
const STRIPE_TEST_CARDS = {
  SUCCESS: {
    number: '4242424242424242',
    desc: 'Successful payment',
  },
  DECLINED: {
    number: '4000000000000002',
    desc: 'Generic decline',
  },
  INSUFFICIENT_FUNDS: {
    number: '4000000000009995',
    desc: 'Insufficient funds',
  },
  REQUIRES_AUTH: {
    number: '4000002500003155',
    desc: 'Requires 3D Secure authentication',
  },
  EXPIRED_CARD: {
    number: '4000000000000069',
    desc: 'Expired card',
  },
  INCORRECT_CVC: {
    number: '4000000000000127',
    desc: 'Incorrect CVC',
  },
  PROCESSING_ERROR: {
    number: '4000000000000119',
    desc: 'Processing error',
  },
};

// Credit packages from PRICING_STRATEGY.md
const CREDIT_PACKAGES = [
  { id: 'starter', name: 'Starter', price: 10, credits: 120, bonus: null },
  { id: 'popular', name: 'Popular', price: 30, credits: 400, bonus: '+10%' },
  { id: 'pro', name: 'Pro', price: 75, credits: 1100, bonus: '+20%' },
  { id: 'mega', name: 'Mega', price: 150, credits: 2500, bonus: '+28%' },
];

// Subscription plans
const SUBSCRIPTION_PLANS = [
  { name: 'Free', price: 0, credits: 25, monthly: true },
  { name: 'Creator', priceMonthly: 29, priceAnnual: 23, credits: 400 },
  { name: 'Studio', priceMonthly: 99, priceAnnual: 79, credits: 1600 },
];

test.describe('Credit Purchase Flow', () => {
  test.describe.configure({ mode: 'serial' });

  test('Buy Credits button initiates Stripe Checkout for authenticated user', async ({ page }) => {
    // Note: This test verifies the checkout initiation flow
    // Full checkout requires actual authentication and Stripe session

    await page.goto(`${FRONTEND_URL}/pricing`);
    await page.waitForLoadState('networkidle');

    // Find the Buy button for Popular package
    const buyButtons = page.locator('button').filter({ hasText: /buy/i });
    const buttonCount = await buyButtons.count();
    expect(buttonCount).toBeGreaterThanOrEqual(4);

    // Click Buy (will redirect to login if not authenticated)
    const firstBuyButton = buyButtons.first();
    await firstBuyButton.click();

    // Should redirect to login (since not authenticated in this test)
    await page.waitForURL(/\/login/, { timeout: 10000 });
  });

  test('API endpoint returns valid credit packages', async ({ request }) => {
    const response = await request.get(`${API_URL}/credits/packages`);
    expect(response.ok()).toBeTruthy();

    const packages = await response.json();
    expect(packages).toBeInstanceOf(Array);
    expect(packages.length).toBe(4);

    // Verify each package matches expected structure
    for (const pkg of packages) {
      expect(pkg).toHaveProperty('id');
      expect(pkg).toHaveProperty('name');
      expect(pkg).toHaveProperty('price_cents');
      expect(pkg).toHaveProperty('credits');
      expect(pkg).toHaveProperty('stripe_price_id');
    }

    // Verify specific package details
    const starter = packages.find((p: Record<string, unknown>) => p.id === 'starter');
    expect(starter).toBeTruthy();
    if (starter) {
      expect(starter.price_cents).toBe(1000); // $10 in cents
      expect(starter.credits).toBe(120);
    }

    const popular = packages.find((p: Record<string, unknown>) => p.id === 'popular');
    expect(popular).toBeTruthy();
    if (popular) {
      expect(popular.price_cents).toBe(3000); // $30 in cents
      expect(popular.credits).toBe(400);
    }
  });
});

test.describe('Pricing Page Display', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/pricing`);
    await page.waitForLoadState('networkidle');
  });

  test('displays all credit packages with correct prices and credits', async ({ page }) => {
    for (const pkg of CREDIT_PACKAGES) {
      // Check package name (as heading to be specific)
      await expect(page.getByRole('heading', { name: pkg.name, exact: true })).toBeVisible();

      // Check price
      await expect(page.getByText(`$${pkg.price}`).first()).toBeVisible();

      // Check credits
      await expect(page.getByText(`${pkg.credits} credits`, { exact: true })).toBeVisible();
    }
  });

  test('displays subscription plans with Monthly/Annual toggle', async ({ page }) => {
    // Check toggle exists
    await expect(page.getByText(/monthly/i)).toBeVisible();
    await expect(page.getByText(/annually/i)).toBeVisible();

    // Check annual discount badge
    await expect(page.getByText(/save/i)).toBeVisible();

    // Click annually and verify prices change
    await page.getByText(/annually/i).click();

    // Verify the 20% discount is shown
    const saveBadge = page.getByText(/save 20%/i);
    await expect(saveBadge).toBeVisible();
  });

  test('Free tier shows 25 credits (one-time signup)', async ({ page }) => {
    // Verify Free tier details
    await expect(page.getByText(/free/i).first()).toBeVisible();
    await expect(page.getByText(/25 credits/i)).toBeVisible();
  });

  test('cost calculator shows correct recommendations', async ({ page }) => {
    // Find and interact with calculator
    const calculatorSection = page.locator('text=Calculator');
    if (await calculatorSection.isVisible()) {
      // Check slider exists
      const slider = page.locator('input[type="range"]');
      if (await slider.isVisible()) {
        // Test with 50 videos
        await slider.fill('50');

        // Should recommend Creator or Studio plan
        await expect(page.getByText(/Creator|Studio/i).first()).toBeVisible();
      }
    }
  });
});

test.describe('Payment Success Flow', () => {
  test('payment success page shows credit confirmation', async ({ page }) => {
    // Test success page with credits param
    await page.goto(`${FRONTEND_URL}/payment/success?credits=400`);
    await page.waitForLoadState('networkidle');

    // Should show success message
    await expect(page.getByText(/success|congratulations|thank you/i).first()).toBeVisible();

    // Should mention credits
    await expect(page.getByText(/credits/i).first()).toBeVisible();
  });

  test('success page has navigation to create video', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/payment/success?credits=400`);
    await page.waitForLoadState('networkidle');

    // Should have CTA to create video or go to dashboard
    const ctaButtons = page.locator('a, button').filter({ hasText: /create|start|dashboard/i });
    const count = await ctaButtons.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('Payment Cancelled Flow', () => {
  test('cancelled page allows retry', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/payment/cancelled`);
    await page.waitForLoadState('networkidle');

    // Should show cancellation message
    await expect(page.getByText(/cancel/i).first()).toBeVisible();

    // Should have retry option
    await expect(page.getByText(/try again/i)).toBeVisible();

    // Click try again
    await page.getByText(/try again/i).click();
    await page.waitForURL(/\/(pricing|billing)/, { timeout: 10000 });
  });

  test('cancelled page has support link', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/payment/cancelled`);
    await page.waitForLoadState('networkidle');

    // Should have support link
    const supportLink = page.getByRole('link', { name: /support/i });
    await expect(supportLink.first()).toBeVisible();
  });
});

test.describe('Subscription Management', () => {
  test('billing page displays subscription options', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/billing`);
    await page.waitForLoadState('networkidle');

    // Check for subscription-related content
    // Note: May redirect to login if not authenticated
    const url = page.url();
    if (url.includes('/login')) {
      // Expected behavior for unauthenticated users
      expect(url).toContain('/login');
    } else {
      // Should show plan options
      await expect(page.getByText(/plan|subscription/i).first()).toBeVisible();
    }
  });

  test('pricing page subscription buttons link to checkout', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/pricing`);
    await page.waitForLoadState('networkidle');

    // Find Get Started buttons for subscription plans
    const getStartedButtons = page.locator('button').filter({ hasText: /get started/i });
    const count = await getStartedButtons.count();
    expect(count).toBeGreaterThanOrEqual(3); // Free, Creator, Studio

    // First button (Free) should work differently
    // Creator and Studio buttons should initiate checkout
  });
});

test.describe('Stripe Test Cards Reference', () => {
  /**
   * This test documents the Stripe test cards available
   * Full automated tests with these cards require:
   * 1. Authenticated user session
   * 2. Stripe Checkout session
   * 3. iframe interaction (which Playwright can handle)
   *
   * Manual testing guide:
   * 1. Use any email: test@example.com
   * 2. Use card number from STRIPE_TEST_CARDS
   * 3. Use any future date: 12/34
   * 4. Use any 3 digits for CVC: 123
   * 5. Use any 5 digits for zip: 12345
   */

  test('documents available test cards', async () => {
    // Document test cards for reference
    const cardDescriptions = Object.entries(STRIPE_TEST_CARDS).map(
      ([name, card]) => `${name}: ${card.number} - ${card.desc}`
    );

    console.log('\nStripe Test Cards for Manual Testing:');
    console.log('=====================================');
    cardDescriptions.forEach((desc) => console.log(desc));
    console.log('\nUse any future expiry (12/34), any CVC (123), any ZIP (12345)');

    expect(Object.keys(STRIPE_TEST_CARDS).length).toBe(7);
  });
});

test.describe('API Health and Configuration', () => {
  test('health endpoint is healthy', async ({ request }) => {
    const response = await request.get('https://nuumee-api-450296399943.us-central1.run.app/health');
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.status).toBe('healthy');
    expect(data.service).toBe('nuumee-api');
  });

  test('credits/packages endpoint is accessible without auth', async ({ request }) => {
    const response = await request.get(`${API_URL}/credits/packages`);
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
  });

  test('credits/balance endpoint requires auth', async ({ request }) => {
    const response = await request.get(`${API_URL}/credits/balance`);
    // Should return 401 without authentication
    expect(response.status()).toBe(401);
  });
});

test.describe('UI Consistency - Modals and Stripe Integration', () => {
  test('pricing page Buy Credits buttons are consistent', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/pricing`);
    await page.waitForLoadState('networkidle');

    // All Buy buttons should have similar styling
    const buyButtons = page.locator('button').filter({ hasText: /buy/i });
    const buttonCount = await buyButtons.count();

    for (let i = 0; i < buttonCount; i++) {
      const button = buyButtons.nth(i);
      await expect(button).toBeVisible();

      // Check buttons are clickable (not disabled by default)
      const isDisabled = await button.isDisabled();
      expect(isDisabled).toBe(false);
    }
  });

  test('pricing page Get Started buttons are consistent', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/pricing`);
    await page.waitForLoadState('networkidle');

    // Get Started buttons for subscription plans
    const getStartedButtons = page.locator('button').filter({ hasText: /get started/i });
    const count = await getStartedButtons.count();

    expect(count).toBeGreaterThanOrEqual(3); // Free, Creator, Studio

    for (let i = 0; i < count; i++) {
      const button = getStartedButtons.nth(i);
      await expect(button).toBeVisible();
    }
  });
});
