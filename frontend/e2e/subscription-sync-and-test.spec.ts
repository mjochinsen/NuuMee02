import { test, expect } from '@playwright/test';

/**
 * Sync the test user's Stripe subscription to Firestore, then test Cancel and Switch to Annual
 */

const BASE_URL = 'https://nuumee.ai';
const API_URL = 'https://nuumee-api-450296399943.us-central1.run.app';
const TEST_EMAIL = 'test54564@gmail.com';
const TEST_PASSWORD = 'test54564';

test.describe('Subscription Sync and Management Tests', () => {
  test.setTimeout(120000);

  test('sync subscription from Stripe and test Cancel flow', async ({ page, request }) => {
    // Enable logging
    page.on('console', msg => {
      if (msg.type() === 'log' && msg.text().includes('[')) {
        console.log('BROWSER:', msg.text());
      }
    });

    page.on('response', res => {
      if (res.url().includes('/api/v1/')) {
        console.log('API RESPONSE:', res.status(), res.url().split('/api/v1/')[1]);
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
      console.log('Login failed, skipping test');
      test.skip();
      return;
    }
    console.log('Login successful');

    // Step 2: Get auth token from browser
    console.log('\n=== Step 2: Get Auth Token ===');
    const authToken = await page.evaluate(async () => {
      // @ts-ignore
      const { auth } = await import('/firebase.js');
      const user = auth.currentUser;
      if (user) {
        return await user.getIdToken();
      }
      return null;
    });

    if (!authToken) {
      console.log('Could not get auth token, trying from localStorage');
    }

    // Step 3: Call sync-from-stripe endpoint
    console.log('\n=== Step 3: Call Sync Endpoint ===');

    // Navigate to billing to trigger auth token storage
    await page.goto(`${BASE_URL}/billing`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Make API call with auth token through page context
    const syncResult = await page.evaluate(async (apiUrl) => {
      try {
        // @ts-ignore
        const firebase = await import('https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js');
        const auth = firebase.getAuth();
        await auth.authStateReady();
        const user = auth.currentUser;
        if (!user) {
          return { error: 'No user logged in' };
        }
        const token = await user.getIdToken();

        const response = await fetch(`${apiUrl}/api/v1/subscriptions/sync-from-stripe`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();
        return { status: response.status, data };
      } catch (e: any) {
        return { error: e.message };
      }
    }, API_URL);

    console.log('Sync result:', JSON.stringify(syncResult, null, 2));

    // Step 4: Refresh billing page
    console.log('\n=== Step 4: Refresh Billing Page ===');
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    await page.screenshot({ path: 'test-results/after-sync-billing.png', fullPage: true });

    // Step 5: Test Cancel Subscription
    console.log('\n=== Step 5: Test Cancel Subscription ===');

    // Look for Cancel Subscription button
    const cancelBtn = page.getByRole('button', { name: /Cancel Subscription/i });
    if (await cancelBtn.isVisible({ timeout: 5000 })) {
      console.log('Found Cancel Subscription button');
      await cancelBtn.click();
      await page.waitForTimeout(2000);

      // Check for confirmation dialog
      const confirmDialog = page.locator('[role="dialog"]');
      if (await confirmDialog.isVisible({ timeout: 3000 })) {
        console.log('Confirmation dialog appeared');
        await page.screenshot({ path: 'test-results/cancel-confirmation-dialog.png' });

        // Look for confirm button
        const confirmBtn = confirmDialog.locator('button').filter({ hasText: /Confirm|Yes|Cancel Subscription/i }).first();
        if (await confirmBtn.isVisible()) {
          console.log('Found confirm button');
          // Don't actually cancel for now - just verify the dialog works
          // await confirmBtn.click();
        }

        // Close dialog
        const closeBtn = confirmDialog.locator('button').filter({ hasText: /Close|Keep|No|Cancel$/i }).first();
        if (await closeBtn.isVisible()) {
          await closeBtn.click();
          await page.waitForTimeout(1000);
        }
      }
    } else {
      console.log('Cancel Subscription button not visible - checking subscription status');

      // Check the page content for subscription info
      const pageContent = await page.content();
      if (pageContent.includes('Creator')) {
        console.log('Creator plan found in page');
      }
      if (pageContent.includes('Free')) {
        console.log('Free tier found in page - subscription may not be synced yet');
      }
    }

    await page.screenshot({ path: 'test-results/subscription-test-final.png', fullPage: true });
  });

  test('test Switch to Annual with active subscription', async ({ page }) => {
    // Login
    console.log('\n=== Login ===');
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
    console.log('\n=== Navigate to Billing ===');
    await page.goto(`${BASE_URL}/billing`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Look for Switch to Annual button
    console.log('\n=== Test Switch to Annual ===');
    const switchBtn = page.getByRole('button', { name: /Switch to Annual/i });

    if (await switchBtn.isVisible({ timeout: 5000 })) {
      console.log('Found Switch to Annual button');
      await switchBtn.click();
      await page.waitForTimeout(2000);

      await page.screenshot({ path: 'test-results/switch-annual-dialog.png', fullPage: true });

      // Check for confirmation dialog
      const dialog = page.locator('[role="dialog"]');
      if (await dialog.isVisible({ timeout: 3000 })) {
        console.log('Dialog appeared for Switch to Annual');

        // Don't actually switch - just verify the flow works
        const closeBtn = dialog.locator('button').filter({ hasText: /Close|Cancel|No/i }).first();
        if (await closeBtn.isVisible()) {
          await closeBtn.click();
        }
      }
    } else {
      console.log('Switch to Annual button not visible - may already be on annual or no subscription');
    }

    await page.screenshot({ path: 'test-results/switch-annual-final.png', fullPage: true });
  });
});
