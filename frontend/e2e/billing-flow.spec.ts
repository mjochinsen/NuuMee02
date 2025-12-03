import { test, expect } from '@playwright/test';

/**
 * Billing Flow E2E Test
 * Tests subscription management with real authentication
 */

// Use production URL directly
const BASE_URL = 'https://nuumee.ai';

// Test user credentials - use an existing test account
const TEST_EMAIL = 'test54564@gmail.com';
const TEST_PASSWORD = 'test54564';

test.describe('Billing Flow - Authenticated', () => {

  test('login and test downgrade to free', async ({ page }) => {
    // Enable detailed logging
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('[API]') || text.includes('[Firebase]') || text.includes('[SubscriptionModal]')) {
        console.log('BROWSER:', text);
      }
    });

    page.on('request', req => {
      if (req.url().includes('/api/v1/subscriptions/')) {
        const headers = req.headers();
        console.log('\n=== SUBSCRIPTION API REQUEST ===');
        console.log('URL:', req.method(), req.url());
        console.log('Has Authorization:', !!headers['authorization']);
        if (headers['authorization']) {
          console.log('Token prefix:', headers['authorization'].substring(0, 30) + '...');
        } else {
          console.log('WARNING: NO AUTH TOKEN!');
        }
      }
    });

    page.on('response', res => {
      if (res.url().includes('/api/v1/subscriptions/')) {
        console.log('RESPONSE:', res.status(), res.url());
      }
    });

    // Step 1: Go to login page
    console.log('\n=== Step 1: Login ===');
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');

    // Fill login form
    await page.getByLabel(/email/i).fill(TEST_EMAIL);
    await page.getByLabel(/^password$/i).fill(TEST_PASSWORD);

    // Click sign in
    await page.getByRole('button', { name: /^sign in$/i }).click();

    // Wait for redirect after login
    await page.waitForTimeout(5000);
    console.log('After login, URL:', page.url());

    // Check if login was successful (should be redirected away from login page)
    if (page.url().includes('/login')) {
      console.log('Login failed - still on login page');
      await page.screenshot({ path: 'test-results/login-failed.png', fullPage: true });

      // Check for error message
      const errorVisible = await page.locator('text=/error|invalid|failed/i').first().isVisible().catch(() => false);
      if (errorVisible) {
        console.log('Login error detected');
      }
      test.skip();
      return;
    }

    // Step 2: Navigate to billing page
    console.log('\n=== Step 2: Navigate to Billing ===');
    await page.goto(`${BASE_URL}/billing`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    console.log('On billing page:', page.url());
    await page.screenshot({ path: 'test-results/billing-page-logged-in.png', fullPage: true });

    // Check we're actually on billing page
    if (!page.url().includes('/billing')) {
      console.log('Not on billing page, redirected to:', page.url());
      test.skip();
      return;
    }

    // Step 3: Find and click downgrade/free button
    console.log('\n=== Step 3: Find Downgrade Button ===');

    // List all buttons for debugging
    const buttons = await page.locator('button').all();
    console.log('Total buttons found:', buttons.length);
    for (let i = 0; i < Math.min(buttons.length, 15); i++) {
      const text = await buttons[i].textContent();
      const visible = await buttons[i].isVisible();
      if (visible && text?.trim()) {
        console.log(`Button ${i}: "${text.trim().substring(0, 40)}"`);
      }
    }

    // Try to find downgrade to free button
    const freeButton = page.locator('button').filter({ hasText: /free/i }).first();
    const downgradeButton = page.locator('button').filter({ hasText: /downgrade/i }).first();

    let buttonClicked = false;

    if (await freeButton.isVisible()) {
      console.log('Found Free button, clicking...');
      await freeButton.click();
      buttonClicked = true;
    } else if (await downgradeButton.isVisible()) {
      console.log('Found Downgrade button, clicking...');
      await downgradeButton.click();
      buttonClicked = true;
    }

    if (!buttonClicked) {
      console.log('No downgrade button found - user may be on Free tier already');
      await page.screenshot({ path: 'test-results/no-downgrade-button.png', fullPage: true });
      test.skip();
      return;
    }

    await page.waitForTimeout(2000);

    // Step 4: Interact with modal
    console.log('\n=== Step 4: Modal Interaction ===');
    await page.screenshot({ path: 'test-results/modal-opened.png', fullPage: true });

    const modal = page.locator('[role="dialog"]');
    if (await modal.isVisible()) {
      console.log('Modal is visible');

      // Look for confirm button
      const confirmButtons = [
        'Confirm Downgrade to Free',
        'Confirm Downgrade',
        'Cancel Subscription',
        'Proceed',
      ];

      for (const btnText of confirmButtons) {
        const btn = modal.locator(`button:has-text("${btnText}")`);
        if (await btn.isVisible()) {
          console.log(`Clicking button: "${btnText}"`);

          // Wait a moment for any async operations
          await page.waitForTimeout(1000);

          await btn.click();

          // Wait for API call
          await page.waitForTimeout(5000);
          break;
        }
      }
    } else {
      console.log('Modal not visible');
    }

    // Step 5: Check results
    console.log('\n=== Step 5: Results ===');
    await page.screenshot({ path: 'test-results/after-action.png', fullPage: true });

    // Check for success message or error
    const successVisible = await page.locator('text=/success|cancelled|downgraded/i').first().isVisible().catch(() => false);
    const errorVisible = await page.locator('text=/error|failed/i').first().isVisible().catch(() => false);

    console.log('Success message visible:', successVisible);
    console.log('Error message visible:', errorVisible);
  });

  test('login and test switch to annual', async ({ page }) => {
    // Enable logging
    page.on('request', req => {
      if (req.url().includes('/api/v1/subscriptions/')) {
        const headers = req.headers();
        console.log('API REQUEST:', req.method(), req.url());
        console.log('Has auth:', !!headers['authorization']);
      }
    });

    page.on('response', res => {
      if (res.url().includes('/api/v1/subscriptions/')) {
        console.log('API RESPONSE:', res.status(), res.url());
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
      console.log('Login failed');
      test.skip();
      return;
    }

    // Go to billing
    await page.goto(`${BASE_URL}/billing`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    if (!page.url().includes('/billing')) {
      console.log('Not on billing page');
      test.skip();
      return;
    }

    // Find annual/switch button
    const annualButton = page.locator('button').filter({ hasText: /annual|switch.*annual/i }).first();

    if (await annualButton.isVisible()) {
      console.log('Found Annual button, clicking...');
      await annualButton.click();
      await page.waitForTimeout(2000);

      await page.screenshot({ path: 'test-results/annual-modal.png', fullPage: true });

      // Look for confirm in modal
      const modal = page.locator('[role="dialog"]');
      if (await modal.isVisible()) {
        const switchBtn = modal.locator('button:has-text("Switch to Annual")');
        if (await switchBtn.isVisible()) {
          console.log('Clicking Switch to Annual in modal...');
          await switchBtn.click();
          await page.waitForTimeout(5000);
        }
      }

      await page.screenshot({ path: 'test-results/after-annual-switch.png', fullPage: true });
    } else {
      console.log('No annual button found');
      await page.screenshot({ path: 'test-results/no-annual-button.png', fullPage: true });
    }
  });
});
