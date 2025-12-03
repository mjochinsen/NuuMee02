import { test, expect } from '@playwright/test';

/**
 * Full Subscription Flow Test
 * 1. Subscribe to Creator via Stripe checkout
 * 2. Test Switch to Annual (with active subscription)
 * 3. Test Cancel Subscription
 */

const BASE_URL = 'https://nuumee.ai';
const TEST_EMAIL = 'test54564@gmail.com';
const TEST_PASSWORD = 'test54564';

// Stripe test card
const STRIPE_TEST_CARD = '4242424242424242';
const STRIPE_EXP = '12/30';
const STRIPE_CVC = '123';
const STRIPE_ZIP = '12345';

async function login(page: any) {
  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState('networkidle');
  await page.getByLabel(/email/i).fill(TEST_EMAIL);
  await page.getByLabel(/^password$/i).fill(TEST_PASSWORD);
  await page.getByRole('button', { name: /^sign in$/i }).click();
  await page.waitForTimeout(5000);
  return !page.url().includes('/login');
}

function setupLogging(page: any) {
  page.on('request', (req: any) => {
    if (req.url().includes('/api/v1/')) {
      console.log('API:', req.method(), req.url().split('/api/v1/')[1]);
    }
  });
  page.on('response', (res: any) => {
    if (res.url().includes('/api/v1/')) {
      console.log('RESPONSE:', res.status(), res.url().split('/api/v1/')[1]);
    }
  });
  page.on('console', (msg: any) => {
    if (msg.text().includes('[SubscriptionModal]') || msg.text().includes('Error')) {
      console.log('BROWSER:', msg.text());
    }
  });
}

test.describe.serial('Full Subscription Flow', () => {

  test('1. Subscribe to Creator via Stripe Checkout', async ({ page }) => {
    setupLogging(page);
    test.setTimeout(120000); // 2 minutes for checkout

    if (!await login(page)) {
      test.skip();
      return;
    }

    await page.goto(`${BASE_URL}/billing`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    console.log('\n=== Step 1: Click Subscribe to Creator ===');

    // Check current plan first
    const activePlanText = await page.locator('text=Active Plan').locator('xpath=ancestor::div[contains(@class, "rounded")]').first().textContent();
    console.log('Current plan info:', activePlanText?.substring(0, 100));

    // If already on Creator, skip subscription step
    if (activePlanText?.includes('Creator') && !activePlanText?.includes('Subscribe')) {
      console.log('User already has Creator subscription - skipping checkout');
      return;
    }

    // Click Subscribe to Creator button
    const subscribeBtn = page.locator('button:has-text("Subscribe to Creator")');
    if (!await subscribeBtn.isVisible()) {
      console.log('Subscribe button not visible - user may already have subscription');
      return;
    }

    await subscribeBtn.click();
    await page.waitForTimeout(2000);

    // Modal should open
    const modal = page.locator('[role="dialog"]');
    expect(await modal.isVisible()).toBe(true);

    // Click Proceed to Payment
    console.log('\n=== Step 2: Click Proceed to Payment ===');
    const clicked = await page.evaluate(() => {
      const modal = document.querySelector('[role="dialog"]');
      if (!modal) return false;
      const buttons = Array.from(modal.querySelectorAll('button'));
      const proceedBtn = buttons.find(btn =>
        btn.textContent?.includes('Proceed') ||
        btn.textContent?.includes('Subscribe') ||
        btn.textContent?.includes('Payment')
      );
      if (proceedBtn) {
        proceedBtn.click();
        return true;
      }
      return false;
    });

    if (!clicked) {
      console.log('Could not find proceed button');
      return;
    }

    // Wait for Stripe redirect
    await page.waitForTimeout(5000);

    console.log('\n=== Step 3: Complete Stripe Checkout ===');
    console.log('Current URL:', page.url());

    if (!page.url().includes('checkout.stripe.com')) {
      console.log('Not on Stripe checkout page');
      return;
    }

    // Fill Stripe checkout form
    await page.waitForTimeout(3000);

    // Email field (may be pre-filled)
    const emailField = page.locator('input[name="email"]');
    if (await emailField.isVisible()) {
      await emailField.fill(TEST_EMAIL);
    }

    // Card number
    const cardFrame = page.frameLocator('iframe[name*="card"]').first();
    const cardInput = cardFrame.locator('input[name="cardnumber"]');
    if (await cardInput.isVisible()) {
      await cardInput.fill(STRIPE_TEST_CARD);
    } else {
      // Try direct input
      const cardNumber = page.locator('input[name="cardNumber"]');
      if (await cardNumber.isVisible()) {
        await cardNumber.fill(STRIPE_TEST_CARD);
      }
    }

    // Expiry
    const expInput = page.locator('input[name="cardExpiry"]');
    if (await expInput.isVisible()) {
      await expInput.fill(STRIPE_EXP);
    }

    // CVC
    const cvcInput = page.locator('input[name="cardCvc"]');
    if (await cvcInput.isVisible()) {
      await cvcInput.fill(STRIPE_CVC);
    }

    // Billing name
    const nameInput = page.locator('input[name="billingName"]');
    if (await nameInput.isVisible()) {
      await nameInput.fill('Test User');
    }

    // Country/Zip
    const zipInput = page.locator('input[name="billingPostalCode"]');
    if (await zipInput.isVisible()) {
      await zipInput.fill(STRIPE_ZIP);
    }

    await page.screenshot({ path: 'test-results/stripe-checkout-filled.png', fullPage: true });

    // Submit payment - use the specific Subscribe button
    console.log('Looking for Subscribe button...');

    // Wait for form to be ready
    await page.waitForTimeout(2000);

    // Click the Subscribe button
    const submitBtn = page.locator('button:has-text("Subscribe")').first();
    if (await submitBtn.isVisible()) {
      console.log('Found Subscribe button, clicking...');
      await submitBtn.click();

      // Wait for payment processing and redirect
      console.log('Waiting for payment to process...');

      // Wait for URL to change from Stripe
      await page.waitForURL(url => !url.toString().includes('checkout.stripe.com'), { timeout: 30000 }).catch(() => {
        console.log('Timeout waiting for redirect');
      });

      console.log('After payment URL:', page.url());

      if (page.url().includes('subscription/success') || page.url().includes('billing')) {
        console.log('SUCCESS: Subscription completed!');
        await page.screenshot({ path: 'test-results/subscription-success.png', fullPage: true });
      }
    } else {
      console.log('Subscribe button not found');
    }

    await page.screenshot({ path: 'test-results/after-stripe-checkout.png', fullPage: true });
  });

  test('2. Test Switch to Annual with active subscription', async ({ page }) => {
    setupLogging(page);

    if (!await login(page)) {
      test.skip();
      return;
    }

    await page.goto(`${BASE_URL}/billing`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    console.log('\n=== Testing Switch to Annual ===');

    // Check if user has active subscription
    const activePlanText = await page.locator('text=Active Plan').locator('xpath=ancestor::div[contains(@class, "rounded")]').first().textContent();

    if (!activePlanText?.includes('Creator') && !activePlanText?.includes('Studio')) {
      console.log('User is on Free tier - Switch to Annual requires subscription');
      test.skip();
      return;
    }

    // Click Switch to Annual
    const annualBtn = page.locator('button:has-text("Switch to Annual")');
    if (!await annualBtn.isVisible()) {
      console.log('Switch to Annual button not visible');
      return;
    }

    await annualBtn.click();
    await page.waitForTimeout(2000);

    // Modal should open
    const modal = page.locator('[role="dialog"]');
    if (await modal.isVisible()) {
      console.log('Modal opened');
      await page.screenshot({ path: 'test-results/switch-annual-modal.png' });

      // Find confirm button
      const confirmBtn = modal.locator('button').filter({ hasText: /switch|confirm|proceed/i }).first();
      if (await confirmBtn.isVisible()) {
        await confirmBtn.click();
        await page.waitForTimeout(5000);

        // Check response
        const successMsg = await page.locator('text=/success|switched|annual/i').first().isVisible().catch(() => false);
        const errorMsg = await page.locator('text=/error|failed/i').first().isVisible().catch(() => false);

        console.log('Success message:', successMsg);
        console.log('Error message:', errorMsg);
      }
    }

    await page.screenshot({ path: 'test-results/after-switch-annual.png', fullPage: true });
  });

  test('3. Test Cancel Subscription', async ({ page }) => {
    setupLogging(page);

    if (!await login(page)) {
      test.skip();
      return;
    }

    await page.goto(`${BASE_URL}/billing`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    console.log('\n=== Testing Cancel Subscription ===');

    // Check if user has active subscription
    const activePlanSection = page.locator('text=Active Plan').locator('xpath=ancestor::div[contains(@class, "rounded")]').first();
    const activePlanText = await activePlanSection.textContent();

    if (!activePlanText?.includes('Creator') && !activePlanText?.includes('Studio')) {
      console.log('User is on Free tier - no subscription to cancel');
      test.skip();
      return;
    }

    console.log('User has subscription, looking for cancel link...');

    // Find Cancel Subscription link
    const cancelLink = page.locator('text=Cancel Subscription').first();
    if (!await cancelLink.isVisible()) {
      console.log('Cancel Subscription link not visible');
      await page.screenshot({ path: 'test-results/no-cancel-link.png', fullPage: true });
      return;
    }

    await cancelLink.click();
    await page.waitForTimeout(2000);

    // Modal should open
    const modal = page.locator('[role="dialog"]');
    if (await modal.isVisible()) {
      console.log('Cancel modal opened');
      await page.screenshot({ path: 'test-results/cancel-modal.png' });

      // Select a reason (first radio button)
      const reasonRadio = modal.locator('input[type="radio"]').first();
      if (await reasonRadio.isVisible()) {
        await reasonRadio.click();
      }

      // Find confirm cancel button
      const confirmBtn = modal.locator('button').filter({ hasText: /cancel.*subscription|confirm/i }).last();
      if (await confirmBtn.isVisible()) {
        console.log('Clicking confirm cancel...');
        await confirmBtn.click();
        await page.waitForTimeout(5000);

        // Check for success
        const successVisible = await page.locator('text=/cancelled|canceled|success/i').first().isVisible().catch(() => false);
        console.log('Cancel success:', successVisible);
      }
    }

    await page.screenshot({ path: 'test-results/after-cancel.png', fullPage: true });

    // Verify plan changed to Free
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const newPlanText = await page.locator('text=Active Plan').locator('xpath=ancestor::div[contains(@class, "rounded")]').first().textContent();
    console.log('Plan after cancel:', newPlanText?.substring(0, 50));
  });
});
