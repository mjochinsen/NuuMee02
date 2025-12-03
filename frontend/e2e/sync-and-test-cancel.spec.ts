import { test, expect } from '@playwright/test';

/**
 * Sync subscription from Stripe to Firestore, then test Cancel Subscription
 */

const BASE_URL = 'https://nuumee.ai';
const API_URL = 'https://nuumee-api-450296399943.us-central1.run.app';
const TEST_EMAIL = 'test54564@gmail.com';
const TEST_PASSWORD = 'test54564';

test.describe('Sync and Test Cancel Subscription', () => {
  test.setTimeout(120000);

  test('sync subscription and test cancel flow', async ({ page }) => {
    let authToken: string | null = null;

    // Intercept API requests to capture the auth token
    page.on('request', req => {
      if (req.url().includes('/api/v1/')) {
        const auth = req.headers()['authorization'];
        if (auth && auth.startsWith('Bearer ')) {
          authToken = auth.replace('Bearer ', '');
        }
      }
    });

    // Enable logging
    page.on('response', res => {
      if (res.url().includes('/api/v1/')) {
        console.log('API:', res.status(), res.url().split('/api/v1/')[1]);
      }
    });

    // Step 1: Login
    console.log('\n=== Step 1: Login ===');
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
    console.log('Logged in successfully');

    // Step 2: Navigate to billing to capture auth token from API calls
    console.log('\n=== Step 2: Navigate to Billing ===');
    await page.goto(`${BASE_URL}/billing`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    console.log('Captured auth token:', authToken ? 'YES' : 'NO');

    if (!authToken) {
      console.log('ERROR: Could not capture auth token');
      test.fail();
      return;
    }

    // Step 3: Call sync-from-stripe directly with captured token
    console.log('\n=== Step 3: Call Sync Endpoint ===');

    const syncResponse = await page.request.post(`${API_URL}/api/v1/subscriptions/sync-from-stripe`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    const syncData = await syncResponse.json();
    console.log('Sync response status:', syncResponse.status());
    console.log('Sync data:', JSON.stringify(syncData, null, 2));

    // Step 4: Reload billing page to see updated subscription
    console.log('\n=== Step 4: Reload Billing ===');
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    await page.screenshot({ path: 'test-results/after-sync-billing.png', fullPage: true });

    // Step 5: Check if user now shows Creator plan
    console.log('\n=== Step 5: Check Active Plan ===');
    const activePlanText = await page.locator('text=Active Plan').locator('..').textContent();
    console.log('Active Plan section:', activePlanText?.substring(0, 150));

    // Step 6: Test Cancel Subscription
    console.log('\n=== Step 6: Test Cancel Subscription ===');
    const cancelBtn = page.getByRole('button', { name: /Cancel Subscription/i });

    if (await cancelBtn.isVisible({ timeout: 5000 })) {
      console.log('SUCCESS: Found Cancel Subscription button!');
      await cancelBtn.click();
      await page.waitForTimeout(2000);

      // Check for dialog
      const dialog = page.locator('[role="dialog"]');
      if (await dialog.isVisible({ timeout: 3000 })) {
        console.log('Cancel confirmation dialog appeared!');
        await page.screenshot({ path: 'test-results/cancel-dialog.png' });

        // Check dialog content
        const dialogText = await dialog.textContent();
        console.log('Dialog content:', dialogText?.substring(0, 200));

        // Find the confirm cancel button in the dialog
        const confirmBtn = dialog.locator('button').filter({ hasText: /Confirm|Yes.*Cancel/i });
        if (await confirmBtn.isVisible()) {
          console.log('Found confirm button, clicking...');
          await confirmBtn.click();
          await page.waitForTimeout(3000);

          await page.screenshot({ path: 'test-results/after-cancel.png', fullPage: true });
          console.log('Cancel clicked - checking result');
        } else {
          // Just close the dialog
          const closeBtn = dialog.locator('button').filter({ hasText: /Keep|No|Close|Cancel$/i }).first();
          if (await closeBtn.isVisible()) {
            await closeBtn.click();
            console.log('Closed dialog without canceling');
          }
        }
      }
    } else {
      console.log('Cancel button not visible');

      // Check if there's still a "Subscribe to Creator" button
      const subscribeBtn = page.getByRole('button', { name: /Subscribe to Creator/i });
      if (await subscribeBtn.isVisible({ timeout: 2000 })) {
        console.log('ERROR: User still on Free plan - sync may have failed');
        console.log('Sync response was:', syncResponse.status(), JSON.stringify(syncData));
      }
    }

    await page.screenshot({ path: 'test-results/cancel-test-final.png', fullPage: true });
  });
});
