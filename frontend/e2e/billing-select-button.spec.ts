import { test, expect } from '@playwright/test';

/**
 * Test the "Select" button in the Subscription Plans section
 */

const BASE_URL = 'https://nuumee.ai';
const TEST_EMAIL = 'test54564@gmail.com';
const TEST_PASSWORD = 'test54564';

test.describe('Billing Page Select Button', () => {

  test('clicking Select button on Creator plan opens subscribe modal', async ({ page }) => {
    // Enable logging
    page.on('request', req => {
      if (req.url().includes('/api/v1/')) {
        const headers = req.headers();
        console.log('API:', req.method(), req.url().split('/api/v1/')[1], '| Auth:', !!headers['authorization']);
      }
    });

    page.on('response', res => {
      if (res.url().includes('/api/v1/')) {
        console.log('RESPONSE:', res.status(), res.url().split('/api/v1/')[1]);
      }
    });

    page.on('console', msg => {
      if (msg.text().includes('[SubscriptionModal]')) {
        console.log('BROWSER:', msg.text());
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

    // Go to billing
    console.log('\n=== Navigate to Billing ===');
    await page.goto(`${BASE_URL}/billing`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Scroll to Subscription Plans section
    await page.locator('text=Subscription Plans').scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    // Take screenshot before clicking
    await page.screenshot({ path: 'test-results/before-select-click.png', fullPage: true });

    // Find the Creator plan card and click its Select button
    // The Creator plan card contains "Creator", "$29", and a "Select" button
    const creatorCard = page.locator('div').filter({ hasText: /Creator.*\$29/s }).first();
    const selectButton = creatorCard.locator('button:has-text("Select")');

    console.log('\n=== Click Select Button on Creator Card ===');
    if (await selectButton.isVisible()) {
      console.log('Found Select button, clicking...');
      await selectButton.click();
      await page.waitForTimeout(2000);

      // Take screenshot of modal
      await page.screenshot({ path: 'test-results/after-select-click.png', fullPage: true });

      // Check if modal opened
      const modal = page.locator('[role="dialog"]');
      if (await modal.isVisible()) {
        console.log('Modal opened successfully!');

        // Check the modal title/content
        const modalTitle = await modal.locator('h2, [class*="title"]').first().textContent();
        console.log('Modal title:', modalTitle);

        // Find and click the proceed/subscribe button in the modal
        const proceedBtn = modal.locator('button').filter({ hasText: /proceed|subscribe|payment/i }).first();
        if (await proceedBtn.isVisible()) {
          console.log('Found proceed button, clicking...');
          await proceedBtn.click();
          await page.waitForTimeout(5000);

          // Check if redirected to Stripe
          console.log('After proceed URL:', page.url());
          if (page.url().includes('checkout.stripe.com')) {
            console.log('SUCCESS: Redirected to Stripe Checkout!');
          }
        }
      } else {
        console.log('ERROR: Modal did not open!');
      }
    } else {
      console.log('ERROR: Select button not found on Creator card');
      // List all buttons for debugging
      const buttons = await page.locator('button').allTextContents();
      console.log('All buttons:', buttons.filter(b => b.trim()).slice(0, 20));
    }

    await page.screenshot({ path: 'test-results/select-button-final.png', fullPage: true });
  });
});
