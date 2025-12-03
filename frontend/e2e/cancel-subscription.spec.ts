import { test, expect } from '@playwright/test';

/**
 * Test Cancel Subscription flow
 */

const BASE_URL = 'https://nuumee.ai';
const TEST_EMAIL = 'test54564@gmail.com';
const TEST_PASSWORD = 'test54564';

test.describe('Cancel Subscription Flow', () => {
  test.setTimeout(90000);

  test('click Cancel Subscription and verify confirmation dialog', async ({ page }) => {
    // Enable logging
    page.on('console', msg => {
      if (msg.type() === 'log') {
        console.log('BROWSER:', msg.text());
      }
    });

    page.on('response', res => {
      if (res.url().includes('/api/v1/') && res.status() !== 200) {
        console.log('API ERROR:', res.status(), res.url().split('/api/v1/')[1]);
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
      test.skip();
      return;
    }

    // Navigate to billing
    console.log('\n=== Navigate to Billing ===');
    await page.goto(`${BASE_URL}/billing`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Screenshot for reference
    await page.screenshot({ path: 'test-results/cancel-sub-billing-page.png', fullPage: true });

    // Check what's visible in the Active Plan section
    console.log('\n=== Check Active Plan Section ===');
    const activePlanSection = page.locator('text=Active Plan').locator('..');

    // Check if user has a subscription
    const currentPlanText = await activePlanSection.textContent();
    console.log('Active Plan section text:', currentPlanText?.substring(0, 200));

    // Look for Cancel Subscription button
    console.log('\n=== Look for Cancel Subscription ===');
    const cancelBtn = page.getByRole('button', { name: /Cancel Subscription/i });

    if (await cancelBtn.isVisible({ timeout: 3000 })) {
      console.log('Found Cancel Subscription button!');
      await cancelBtn.click();
      await page.waitForTimeout(2000);

      // Check for confirmation dialog
      const dialog = page.locator('[role="dialog"]');
      if (await dialog.isVisible({ timeout: 3000 })) {
        console.log('Confirmation dialog appeared');
        await page.screenshot({ path: 'test-results/cancel-sub-dialog.png' });

        // Check dialog content
        const dialogContent = await dialog.textContent();
        console.log('Dialog content:', dialogContent?.substring(0, 200));

        // Close the dialog without actually canceling
        const keepBtn = dialog.locator('button').filter({ hasText: /Keep|No|Close|Cancel$/i }).first();
        if (await keepBtn.isVisible()) {
          await keepBtn.click();
          console.log('Closed dialog without canceling');
        }
      }
    } else {
      console.log('Cancel Subscription button not visible - user may be on Free plan');

      // Check if there's a Subscribe button instead
      const subscribeBtn = page.getByRole('button', { name: /Subscribe to Creator/i });
      if (await subscribeBtn.isVisible({ timeout: 2000 })) {
        console.log('Found "Subscribe to Creator" button - user is on Free plan');
      }
    }

    // Also check for Downgrade button (for users with paid subscription)
    const downgradeBtn = page.getByRole('button', { name: /Downgrade/i });
    if (await downgradeBtn.isVisible({ timeout: 2000 })) {
      console.log('Found Downgrade button');
      await downgradeBtn.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'test-results/downgrade-dialog.png' });

      // Close dialog
      const closeBtn = page.locator('[role="dialog"] button').filter({ hasText: /Close|Cancel|No/i }).first();
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
      }
    }

    await page.screenshot({ path: 'test-results/cancel-sub-final.png', fullPage: true });
  });
});
