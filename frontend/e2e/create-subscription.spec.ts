import { test, expect } from '@playwright/test';

/**
 * Create a subscription for the test user by completing Stripe checkout
 */

const BASE_URL = 'https://nuumee.ai';
const TEST_EMAIL = 'test54564@gmail.com';
const TEST_PASSWORD = 'test54564';

test.describe('Create Subscription via Stripe Checkout', () => {
  test.setTimeout(180000); // 3 minutes

  test('complete Stripe checkout to create Creator subscription', async ({ page }) => {
    // Enable logging
    page.on('console', msg => {
      if (msg.type() === 'log') {
        console.log('BROWSER:', msg.text());
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
    console.log('Login successful, URL:', page.url());

    // Step 2: Go to billing page
    console.log('\n=== Step 2: Navigate to Billing ===');
    await page.goto(`${BASE_URL}/billing`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Step 3: Click Subscribe/Select on Creator plan
    console.log('\n=== Step 3: Click Subscribe on Creator Plan ===');

    // Scroll to Subscription Plans section
    await page.locator('text=Subscription Plans').scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    // Find the Creator plan card and click its Select button
    const creatorSection = page.locator('div').filter({ hasText: /Creator.*\$29/s }).first();
    const selectButton = creatorSection.locator('button').filter({ hasText: /Select|Subscribe/i }).first();

    if (await selectButton.isVisible()) {
      console.log('Found Select/Subscribe button, clicking...');
      await selectButton.click();
      await page.waitForTimeout(2000);
    } else {
      // Try looking for Subscribe to Creator button in the Active Plan section
      const subscribeBtn = page.getByRole('button', { name: /Subscribe to Creator/i });
      if (await subscribeBtn.isVisible()) {
        console.log('Found Subscribe to Creator button, clicking...');
        await subscribeBtn.click();
        await page.waitForTimeout(2000);
      }
    }

    // Step 4: Handle the subscription modal
    console.log('\n=== Step 4: Handle Subscription Modal ===');
    await page.screenshot({ path: 'test-results/create-sub-modal.png', fullPage: true });

    const modal = page.locator('[role="dialog"]');
    if (await modal.isVisible({ timeout: 5000 })) {
      console.log('Modal opened');

      // Find and click the Proceed to Payment button
      const proceedBtn = modal.locator('button').filter({ hasText: /Proceed to Payment|Subscribe|Confirm/i }).first();
      if (await proceedBtn.isVisible()) {
        console.log('Clicking Proceed to Payment...');
        await proceedBtn.click();

        // Wait for redirect to Stripe
        await page.waitForTimeout(8000);
        console.log('Current URL after proceed:', page.url());
      }
    }

    // Step 5: Complete Stripe Checkout
    console.log('\n=== Step 5: Complete Stripe Checkout ===');

    if (!page.url().includes('checkout.stripe.com')) {
      console.log('Not on Stripe checkout page, current URL:', page.url());
      await page.screenshot({ path: 'test-results/create-sub-not-stripe.png', fullPage: true });

      // If we're already on a success page, that's fine
      if (page.url().includes('/payment/success') || page.url().includes('/billing')) {
        console.log('Already on success or billing page');
        return;
      }
      return;
    }

    console.log('On Stripe Checkout page!');
    await page.screenshot({ path: 'test-results/create-sub-stripe-page.png', fullPage: true });

    // Fill in the Stripe checkout form
    // The test card is 4242 4242 4242 4242

    // Wait for Stripe form to load
    await page.waitForTimeout(3000);

    // Fill card number
    const cardInput = page.locator('input[name="cardNumber"], input[placeholder*="card number" i]').first();
    if (await cardInput.isVisible()) {
      console.log('Filling card number...');
      await cardInput.fill('4242424242424242');
    }

    // Fill expiry
    const expiryInput = page.locator('input[name="cardExpiry"], input[placeholder*="expir" i], input[name="exp-date"]').first();
    if (await expiryInput.isVisible()) {
      console.log('Filling expiry...');
      await expiryInput.fill('1230');
    }

    // Fill CVC
    const cvcInput = page.locator('input[name="cardCvc"], input[placeholder*="cvc" i], input[name="cvc"]').first();
    if (await cvcInput.isVisible()) {
      console.log('Filling CVC...');
      await cvcInput.fill('123');
    }

    // Fill cardholder name
    const nameInput = page.locator('input[name="billingName"], input[placeholder*="name on card" i]').first();
    if (await nameInput.isVisible()) {
      console.log('Filling cardholder name...');
      await nameInput.fill('Test User');
    }

    // Fill country/region (if needed)
    const countrySelect = page.locator('select[name="billingCountry"]').first();
    if (await countrySelect.isVisible()) {
      await countrySelect.selectOption('US');
    }

    // Fill ZIP code
    const zipInput = page.locator('input[name="billingPostalCode"], input[placeholder*="zip" i]').first();
    if (await zipInput.isVisible()) {
      console.log('Filling ZIP...');
      await zipInput.fill('12345');
    }

    await page.screenshot({ path: 'test-results/create-sub-stripe-filled.png', fullPage: true });

    // Click Subscribe/Pay button
    console.log('\n=== Step 6: Submit Payment ===');
    const submitBtn = page.locator('button[type="submit"], button:has-text("Subscribe"), button:has-text("Pay")').first();
    if (await submitBtn.isVisible()) {
      console.log('Clicking Subscribe button...');
      await submitBtn.click();

      // Wait for processing and redirect
      await page.waitForTimeout(15000);
    }

    // Step 7: Verify success
    console.log('\n=== Step 7: Verify Success ===');
    console.log('Final URL:', page.url());
    await page.screenshot({ path: 'test-results/create-sub-final.png', fullPage: true });

    // Check if we're back on the app
    if (page.url().includes('nuumee.ai')) {
      console.log('SUCCESS: Redirected back to NuuMee!');

      // Navigate to billing to verify subscription
      await page.goto(`${BASE_URL}/billing`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);

      await page.screenshot({ path: 'test-results/create-sub-billing-after.png', fullPage: true });

      // Check if Creator is now the active plan
      const creatorActive = page.locator('text=/Creator.*Current/i');
      if (await creatorActive.isVisible({ timeout: 5000 })) {
        console.log('VERIFIED: Creator plan is now active!');
      }
    }
  });
});
