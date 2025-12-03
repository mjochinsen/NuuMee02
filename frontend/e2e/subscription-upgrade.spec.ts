import { test, expect } from '@playwright/test';

/**
 * Subscription Upgrade Flow Test
 * Tests upgrading from Free to Creator subscription
 */

const BASE_URL = 'https://nuumee.ai';
const TEST_EMAIL = 'test54564@gmail.com';
const TEST_PASSWORD = 'test54564';

test.describe('Subscription Upgrade Flow', () => {

  test('subscribe to Creator plan from Free', async ({ page }) => {
    // Enable logging
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('[API]') || text.includes('[Firebase]') || text.includes('[SubscriptionModal]')) {
        console.log('BROWSER:', text);
      }
    });

    page.on('request', req => {
      if (req.url().includes('/api/v1/')) {
        const headers = req.headers();
        console.log('API REQUEST:', req.method(), req.url().split('/api/v1/')[1]);
        console.log('  Has auth:', !!headers['authorization']);
      }
    });

    page.on('response', res => {
      if (res.url().includes('/api/v1/')) {
        console.log('API RESPONSE:', res.status(), res.url().split('/api/v1/')[1]);
      }
    });

    // Login
    console.log('\n=== Login ===');
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    await page.getByLabel(/email/i).fill(TEST_EMAIL);
    await page.getByLabel(/^password$/i).fill(TEST_PASSWORD);
    await page.getByRole('button', { name: /^sign in$/i }).click();
    await page.waitForTimeout(5000);

    if (page.url().includes('/login')) {
      console.log('Login failed');
      await page.screenshot({ path: 'test-results/upgrade-login-failed.png', fullPage: true });
      test.skip();
      return;
    }
    console.log('Logged in, URL:', page.url());

    // Go to billing
    console.log('\n=== Navigate to Billing ===');
    await page.goto(`${BASE_URL}/billing`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'test-results/upgrade-billing-page.png', fullPage: true });

    // Check current plan
    const activePlan = await page.locator('text=Active Plan').first().isVisible();
    console.log('Active Plan section visible:', activePlan);

    // Find Subscribe to Creator button
    const subscribeBtn = page.locator('button:has-text("Subscribe to Creator")');
    if (await subscribeBtn.isVisible()) {
      console.log('\n=== Click Subscribe to Creator ===');
      await subscribeBtn.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'test-results/upgrade-subscribe-modal.png', fullPage: true });

      // Look for proceed button in modal
      const modal = page.locator('[role="dialog"]');
      if (await modal.isVisible()) {
        console.log('Modal opened');

        // Find payment button
        const proceedBtn = modal.locator('button:has-text("Proceed")').first();
        const paymentBtn = modal.locator('button:has-text("Payment")').first();

        if (await proceedBtn.isVisible()) {
          console.log('Clicking Proceed to Payment...');

          // This should redirect to Stripe
          const [response] = await Promise.all([
            page.waitForResponse(res => res.url().includes('/subscriptions/create')),
            proceedBtn.click()
          ]);

          console.log('Create subscription response:', response.status());

          // Wait for redirect
          await page.waitForTimeout(3000);
          console.log('After click URL:', page.url());

          // Should redirect to Stripe checkout
          if (page.url().includes('checkout.stripe.com')) {
            console.log('SUCCESS: Redirected to Stripe Checkout!');
          }
        }
      }
    } else {
      console.log('Subscribe to Creator button not visible - user may already have subscription');

      // Check for Creator plan being active
      const creatorActive = await page.locator('text=Creator').locator('xpath=..').locator('text=CURRENT').isVisible().catch(() => false);
      if (creatorActive) {
        console.log('User already on Creator plan');
      }
    }

    await page.screenshot({ path: 'test-results/upgrade-final.png', fullPage: true });
  });

  test('cancel subscription (if active)', async ({ page }) => {
    page.on('request', req => {
      if (req.url().includes('/api/v1/subscriptions/')) {
        const headers = req.headers();
        console.log('API REQUEST:', req.method(), req.url().split('/api/v1/')[1]);
        console.log('  Has auth:', !!headers['authorization']);
      }
    });

    page.on('response', res => {
      if (res.url().includes('/api/v1/subscriptions/')) {
        console.log('API RESPONSE:', res.status(), res.url().split('/api/v1/')[1]);
      }
    });

    // Login
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    await page.getByLabel(/email/i).fill(TEST_EMAIL);
    await page.getByLabel(/^password$/i).fill(TEST_PASSWORD);
    await page.getByRole('button', { name: /^sign in$/i }).click();
    await page.waitForTimeout(5000);

    if (page.url().includes('/login')) {
      test.skip();
      return;
    }

    // Go to billing
    await page.goto(`${BASE_URL}/billing`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Look for cancel or downgrade button
    const cancelBtn = page.locator('button:has-text("Cancel")').first();
    const activeBtn = page.locator('button:has-text("Active")').first();

    if (await activeBtn.isVisible()) {
      console.log('Found Active button (has subscription)');
      await activeBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'test-results/cancel-dropdown.png', fullPage: true });

      // Look for cancel in dropdown
      const cancelOption = page.locator('text=Cancel Subscription');
      if (await cancelOption.isVisible()) {
        console.log('Clicking Cancel Subscription...');
        await cancelOption.click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'test-results/cancel-modal.png', fullPage: true });

        // Confirm cancellation
        const confirmBtn = page.locator('button:has-text("Cancel Subscription")').last();
        if (await confirmBtn.isVisible()) {
          console.log('Confirming cancellation...');
          await confirmBtn.click();
          await page.waitForTimeout(5000);
        }
      }
    } else {
      console.log('No Active button found - user on Free tier');
    }

    await page.screenshot({ path: 'test-results/cancel-final.png', fullPage: true });
  });
});
