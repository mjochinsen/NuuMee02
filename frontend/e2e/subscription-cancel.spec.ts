import { test, expect } from '@playwright/test';

test.describe('Subscription Cancel Flow', () => {
  test('verify auth token is attached to cancel request', async ({ page }) => {
    // Track all API requests
    const apiRequests: { url: string; method: string; headers: Record<string, string> }[] = [];

    page.on('request', req => {
      if (req.url().includes('/api/v1/subscriptions/')) {
        const headers = req.headers();
        console.log('\n=== API REQUEST ===');
        console.log('URL:', req.method(), req.url());
        console.log('Has Authorization:', !!headers['authorization']);
        if (headers['authorization']) {
          console.log('Auth Header:', headers['authorization'].substring(0, 20) + '...');
        }
        apiRequests.push({
          url: req.url(),
          method: req.method(),
          headers
        });
      }
    });

    page.on('response', res => {
      if (res.url().includes('/api/v1/subscriptions/')) {
        console.log('RESPONSE:', res.status(), res.url());
      }
    });

    page.on('console', msg => {
      if (msg.text().includes('[API]') || msg.text().includes('[Firebase]')) {
        console.log('BROWSER LOG:', msg.text());
      }
    });

    // Go to billing page directly
    await page.goto('https://nuumee.ai/billing');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);

    // Check if redirected (not logged in)
    if (currentUrl === 'https://nuumee.ai/' || currentUrl.includes('/login')) {
      console.log('Not logged in - skipping test');
      test.skip();
      return;
    }

    // Take screenshot of billing page
    await page.screenshot({ path: 'test-results/billing-cancel-test.png', fullPage: true });

    // Look for downgrade or cancel button
    const freeButton = page.locator('button:has-text("Free")').first();
    const cancelButton = page.locator('button:has-text("Cancel")').first();
    const downgradeButton = page.locator('button:has-text("Downgrade")').first();

    if (await freeButton.isVisible()) {
      console.log('Clicking Free button to downgrade...');
      await freeButton.click();
    } else if (await downgradeButton.isVisible()) {
      console.log('Clicking Downgrade button...');
      await downgradeButton.click();
    } else if (await cancelButton.isVisible()) {
      console.log('Clicking Cancel button...');
      await cancelButton.click();
    }

    await page.waitForTimeout(2000);

    // Check for modal
    const modal = page.locator('[role="dialog"]');
    if (await modal.isVisible()) {
      console.log('Modal is visible');
      await page.screenshot({ path: 'test-results/cancel-modal.png', fullPage: true });

      // Look for confirm button
      const confirmBtn = page.locator('button:has-text("Confirm Downgrade")').first();
      const cancelSubBtn = page.locator('button:has-text("Cancel Subscription")').first();

      if (await confirmBtn.isVisible()) {
        console.log('Clicking Confirm Downgrade...');
        await confirmBtn.click();
      } else if (await cancelSubBtn.isVisible()) {
        console.log('Clicking Cancel Subscription...');
        await cancelSubBtn.click();
      }

      // Wait for API request
      await page.waitForTimeout(5000);
    }

    // Check if any subscription API calls were made
    console.log('\n=== API CALLS SUMMARY ===');
    const subscriptionCalls = apiRequests.filter(r => r.url.includes('/subscriptions/'));
    console.log('Total subscription API calls:', subscriptionCalls.length);

    for (const call of subscriptionCalls) {
      console.log('\nCall:', call.method, call.url);
      console.log('Has auth:', !!call.headers['authorization']);
    }

    // Final screenshot
    await page.screenshot({ path: 'test-results/after-cancel-attempt.png', fullPage: true });
  });

  test('verify auth token on switch billing period', async ({ page }) => {
    const apiRequests: { url: string; method: string; hasAuth: boolean }[] = [];

    page.on('request', req => {
      if (req.url().includes('/api/v1/subscriptions/')) {
        const headers = req.headers();
        console.log('REQUEST:', req.method(), req.url());
        console.log('Has Auth:', !!headers['authorization']);
        apiRequests.push({
          url: req.url(),
          method: req.method(),
          hasAuth: !!headers['authorization']
        });
      }
    });

    await page.goto('https://nuumee.ai/billing');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    if (page.url() !== 'https://nuumee.ai/billing') {
      console.log('Not logged in');
      test.skip();
      return;
    }

    // Look for annual toggle or button
    const annualBtn = page.locator('button:has-text("Annual")').first();
    const switchAnnualBtn = page.locator('button:has-text("Switch to Annual")').first();

    if (await annualBtn.isVisible()) {
      console.log('Clicking Annual button...');
      await annualBtn.click();
      await page.waitForTimeout(2000);
    }

    // Check for modal with switch button
    const modal = page.locator('[role="dialog"]');
    if (await modal.isVisible()) {
      const switchBtn = page.locator('button:has-text("Switch to Annual")').first();
      if (await switchBtn.isVisible()) {
        console.log('Clicking Switch to Annual in modal...');
        await switchBtn.click();
        await page.waitForTimeout(5000);
      }
    }

    console.log('\n=== API CALLS ===');
    for (const call of apiRequests) {
      console.log(`${call.method} ${call.url} - Auth: ${call.hasAuth}`);
    }

    await page.screenshot({ path: 'test-results/after-annual-attempt.png', fullPage: true });
  });
});
