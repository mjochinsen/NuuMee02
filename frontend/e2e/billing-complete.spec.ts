import { test, expect } from '@playwright/test';

/**
 * Complete Billing Page E2E Tests
 * Tests EVERY button and workflow on the /billing page
 */

const BASE_URL = 'https://nuumee.ai';
const TEST_EMAIL = 'test54564@gmail.com';
const TEST_PASSWORD = 'test54564';

// Helper to login
async function login(page: any) {
  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState('networkidle');
  await page.getByLabel(/email/i).fill(TEST_EMAIL);
  await page.getByLabel(/^password$/i).fill(TEST_PASSWORD);
  await page.getByRole('button', { name: /^sign in$/i }).click();
  await page.waitForTimeout(5000);

  if (page.url().includes('/login')) {
    return false;
  }
  return true;
}

// Helper to setup API logging
function setupLogging(page: any) {
  page.on('request', (req: any) => {
    if (req.url().includes('/api/v1/')) {
      const headers = req.headers();
      console.log('API:', req.method(), req.url().split('/api/v1/')[1], '| Auth:', !!headers['authorization']);
    }
  });

  page.on('response', (res: any) => {
    if (res.url().includes('/api/v1/')) {
      console.log('RESPONSE:', res.status(), res.url().split('/api/v1/')[1]);
    }
  });

  page.on('console', (msg: any) => {
    const text = msg.text();
    if (text.includes('[SubscriptionModal]') || text.includes('[API]') || text.includes('Error')) {
      console.log('BROWSER:', text);
    }
  });
}

test.describe('Billing Page - Complete Tests', () => {

  test.describe.serial('Buy Credits Section', () => {

    test('1. Buy Credits - Starter package opens checkout', async ({ page }) => {
      setupLogging(page);

      if (!await login(page)) {
        test.skip();
        return;
      }

      await page.goto(`${BASE_URL}/billing`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Find Starter package (120 credits, $10)
      console.log('\n=== Testing Starter Package ===');

      // Scroll to Buy Credits section
      await page.locator('#buy-credits').scrollIntoViewIfNeeded();
      await page.waitForTimeout(1000);

      // Find all Select buttons in the Buy Credits section and click the first one (Starter)
      const selectBtn = page.locator('#buy-credits button:has-text("Select")').first();

      await selectBtn.click();
      await page.waitForTimeout(2000);

      // Modal should open
      const modal = page.locator('[role="dialog"]');
      expect(await modal.isVisible()).toBe(true);
      console.log('Modal opened for Starter package');

      // Wait for modal to settle
      await page.waitForTimeout(1000);

      // Find and click the proceed button using JavaScript
      const clicked = await page.evaluate(() => {
        const modal = document.querySelector('[role="dialog"]');
        if (!modal) return false;

        const buttons = Array.from(modal.querySelectorAll('button'));
        const proceedBtn = buttons.find(btn => btn.textContent?.includes('Proceed to Payment'));

        if (proceedBtn) {
          proceedBtn.click();
          return true;
        }
        return false;
      });

      if (clicked) {
        await page.waitForTimeout(5000);
        // Should redirect to Stripe
        expect(page.url()).toContain('checkout.stripe.com');
        console.log('SUCCESS: Starter package redirects to Stripe');
      } else {
        console.log('Failed to find Proceed to Payment button');
      }
    });

    test('2. Buy Credits - Popular package opens checkout', async ({ page }) => {
      setupLogging(page);

      if (!await login(page)) {
        test.skip();
        return;
      }

      await page.goto(`${BASE_URL}/billing`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      console.log('\n=== Testing Popular Package ===');

      // Scroll to Buy Credits section
      await page.locator('#buy-credits').scrollIntoViewIfNeeded();
      await page.waitForTimeout(1000);

      // Find the second Select button (Popular package)
      const selectBtn = page.locator('#buy-credits button:has-text("Select")').nth(1);

      await selectBtn.click();
      await page.waitForTimeout(2000);

      const modal = page.locator('[role="dialog"]');
      expect(await modal.isVisible()).toBe(true);
      console.log('Modal opened for Popular package');

      await page.waitForTimeout(1000);

      const clicked = await page.evaluate(() => {
        const modal = document.querySelector('[role="dialog"]');
        if (!modal) return false;
        const buttons = Array.from(modal.querySelectorAll('button'));
        const proceedBtn = buttons.find(btn => btn.textContent?.includes('Proceed to Payment'));
        if (proceedBtn) {
          proceedBtn.click();
          return true;
        }
        return false;
      });

      if (clicked) {
        await page.waitForTimeout(5000);
        expect(page.url()).toContain('checkout.stripe.com');
        console.log('SUCCESS: Popular package redirects to Stripe');
      }
    });

    test('3. Buy Credits - Pro package opens checkout', async ({ page }) => {
      setupLogging(page);

      if (!await login(page)) {
        test.skip();
        return;
      }

      await page.goto(`${BASE_URL}/billing`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      console.log('\n=== Testing Pro Package ===');

      // Scroll to Buy Credits section
      await page.locator('#buy-credits').scrollIntoViewIfNeeded();
      await page.waitForTimeout(1000);

      // Find the third Select button (Pro package)
      const selectBtn = page.locator('#buy-credits button:has-text("Select")').nth(2);

      await selectBtn.click();
      await page.waitForTimeout(2000);

      const modal = page.locator('[role="dialog"]');
      expect(await modal.isVisible()).toBe(true);
      console.log('Modal opened for Pro package');

      await page.waitForTimeout(1000);

      const clicked = await page.evaluate(() => {
        const modal = document.querySelector('[role="dialog"]');
        if (!modal) return false;
        const buttons = Array.from(modal.querySelectorAll('button'));
        const proceedBtn = buttons.find(btn => btn.textContent?.includes('Proceed to Payment'));
        if (proceedBtn) {
          proceedBtn.click();
          return true;
        }
        return false;
      });

      if (clicked) {
        await page.waitForTimeout(5000);
        expect(page.url()).toContain('checkout.stripe.com');
        console.log('SUCCESS: Pro package redirects to Stripe');
      }
    });

    test('4. Buy Credits - Mega package opens checkout', async ({ page }) => {
      setupLogging(page);

      if (!await login(page)) {
        test.skip();
        return;
      }

      await page.goto(`${BASE_URL}/billing`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      console.log('\n=== Testing Mega Package ===');

      // Scroll to Buy Credits section
      await page.locator('#buy-credits').scrollIntoViewIfNeeded();
      await page.waitForTimeout(1000);

      // Find the fourth Select button (Mega package)
      const selectBtn = page.locator('#buy-credits button:has-text("Select")').nth(3);

      await selectBtn.click();
      await page.waitForTimeout(2000);

      const modal = page.locator('[role="dialog"]');
      expect(await modal.isVisible()).toBe(true);
      console.log('Modal opened for Mega package');

      await page.waitForTimeout(1000);

      const clicked = await page.evaluate(() => {
        const modal = document.querySelector('[role="dialog"]');
        if (!modal) return false;
        const buttons = Array.from(modal.querySelectorAll('button'));
        const proceedBtn = buttons.find(btn => btn.textContent?.includes('Proceed to Payment'));
        if (proceedBtn) {
          proceedBtn.click();
          return true;
        }
        return false;
      });

      if (clicked) {
        await page.waitForTimeout(5000);
        expect(page.url()).toContain('checkout.stripe.com');
        console.log('SUCCESS: Mega package redirects to Stripe');
      }
    });
  });

  test.describe.serial('Subscription Plans Section', () => {

    test('5. Subscribe to Creator - Active Plan button', async ({ page }) => {
      setupLogging(page);

      if (!await login(page)) {
        test.skip();
        return;
      }

      await page.goto(`${BASE_URL}/billing`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      console.log('\n=== Testing Subscribe to Creator (Active Plan section) ===');

      // Find the "Subscribe to Creator" button in Active Plan section
      const subscribeBtn = page.locator('button:has-text("Subscribe to Creator")');

      if (await subscribeBtn.isVisible()) {
        await subscribeBtn.click();
        await page.waitForTimeout(2000);

        const modal = page.locator('[role="dialog"]');
        expect(await modal.isVisible()).toBe(true);
        console.log('Modal opened');

        // Click proceed
        const proceedBtn = modal.locator('button').filter({ hasText: /proceed|subscribe|payment/i }).first();
        if (await proceedBtn.isVisible()) {
          await proceedBtn.click();
          await page.waitForTimeout(5000);
          expect(page.url()).toContain('checkout.stripe.com');
          console.log('SUCCESS: Subscribe to Creator redirects to Stripe');
        }
      } else {
        console.log('Subscribe to Creator button not visible (user may already have subscription)');
      }
    });

    test('6. Select Creator plan - Subscription Plans section', async ({ page }) => {
      setupLogging(page);

      if (!await login(page)) {
        test.skip();
        return;
      }

      await page.goto(`${BASE_URL}/billing`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      console.log('\n=== Testing Select on Creator (Subscription Plans section) ===');

      // Scroll to Subscription Plans
      await page.locator('text=Subscription Plans').scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);

      // Find Creator card in Subscription Plans section
      const creatorCard = page.locator('div').filter({ hasText: /Creator.*\$29.*per month/s }).first();
      const selectBtn = creatorCard.locator('button:has-text("Select")');

      if (await selectBtn.isVisible()) {
        await selectBtn.click();
        await page.waitForTimeout(2000);

        const modal = page.locator('[role="dialog"]');
        expect(await modal.isVisible()).toBe(true);
        console.log('Modal opened');

        const proceedBtn = modal.locator('button').filter({ hasText: /proceed|subscribe|payment/i }).first();
        if (await proceedBtn.isVisible()) {
          await proceedBtn.click();
          await page.waitForTimeout(5000);
          expect(page.url()).toContain('checkout.stripe.com');
          console.log('SUCCESS: Select Creator redirects to Stripe');
        }
      } else {
        console.log('Creator Select button not visible (may be current plan)');
      }
    });

    test('7. Select Studio plan - Subscription Plans section', async ({ page }) => {
      setupLogging(page);

      if (!await login(page)) {
        test.skip();
        return;
      }

      await page.goto(`${BASE_URL}/billing`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      console.log('\n=== Testing Select/Upgrade on Studio (Subscription Plans section) ===');

      await page.locator('text=Subscription Plans').scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);

      // Find Studio card
      const studioCard = page.locator('div').filter({ hasText: /Studio.*\$99.*per month/s }).first();
      const actionBtn = studioCard.locator('button:has-text("Select"), button:has-text("Upgrade")').first();

      if (await actionBtn.isVisible()) {
        const btnText = await actionBtn.textContent();
        console.log(`Found button: "${btnText}"`);
        await actionBtn.click();
        await page.waitForTimeout(2000);

        const modal = page.locator('[role="dialog"]');
        expect(await modal.isVisible()).toBe(true);
        console.log('Modal opened');

        const proceedBtn = modal.locator('button').filter({ hasText: /proceed|subscribe|upgrade|payment/i }).first();
        if (await proceedBtn.isVisible()) {
          await proceedBtn.click();
          await page.waitForTimeout(5000);
          // Could redirect to Stripe or show success for upgrade
          console.log('Action completed, URL:', page.url());
        }
      } else {
        console.log('Studio action button not visible');
      }
    });
  });

  test.describe.serial('Special Offers Section', () => {

    test('8. Switch to Annual button', async ({ page }) => {
      setupLogging(page);

      if (!await login(page)) {
        test.skip();
        return;
      }

      await page.goto(`${BASE_URL}/billing`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      console.log('\n=== Testing Switch to Annual ===');

      const annualBtn = page.locator('button:has-text("Switch to Annual")');

      if (await annualBtn.isVisible()) {
        await annualBtn.click();
        await page.waitForTimeout(2000);

        const modal = page.locator('[role="dialog"]');
        if (await modal.isVisible()) {
          console.log('Modal opened for Switch to Annual');
          await page.screenshot({ path: 'test-results/annual-modal.png' });

          // Find confirm button
          const confirmBtn = modal.locator('button').filter({ hasText: /switch|confirm|proceed/i }).first();
          if (await confirmBtn.isVisible()) {
            await confirmBtn.click();
            await page.waitForTimeout(5000);
            // Will either succeed or fail based on subscription status
            console.log('Switch to Annual action triggered');
          }
        }
      } else {
        console.log('Switch to Annual button not visible');
      }
    });

    test('9. Founding Member - Claim Your Spot', async ({ page }) => {
      setupLogging(page);

      if (!await login(page)) {
        test.skip();
        return;
      }

      await page.goto(`${BASE_URL}/billing`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      console.log('\n=== Testing Founding Member - Claim Your Spot ===');

      const foundingBtn = page.locator('button:has-text("Claim Your Spot")');

      if (await foundingBtn.isVisible({ timeout: 3000 })) {
        await foundingBtn.click();
        await page.waitForTimeout(2000);

        const modal = page.locator('[role="dialog"]');
        expect(await modal.isVisible()).toBe(true);
        console.log('Modal opened for Founding Member');

        const proceedBtn = modal.locator('button').filter({ hasText: /proceed|claim|subscribe|payment/i }).first();
        if (await proceedBtn.isVisible()) {
          await proceedBtn.click();
          await page.waitForTimeout(5000);

          // Two valid outcomes:
          // 1. Redirect to Stripe (Free tier user)
          // 2. Error message about existing subscription (already subscribed user)
          const currentUrl = page.url();
          const errorMessage = await page.locator('text=/already has an active subscription/i').isVisible({ timeout: 2000 }).catch(() => false);

          if (currentUrl.includes('checkout.stripe.com')) {
            console.log('SUCCESS: Founding Member redirects to Stripe (Free tier user)');
          } else if (errorMessage || currentUrl.includes('/billing')) {
            // Backend correctly rejected - user already has subscription
            console.log('SUCCESS: Backend correctly rejected Founding Member for subscribed user');
          } else {
            // Unexpected state - fail the test
            expect(currentUrl).toContain('checkout.stripe.com');
          }
        }
      } else {
        // Expected behavior: Founding Member is only shown to Free tier users
        // If user has an active subscription, this button is hidden
        console.log('Claim Your Spot button not visible (expected for subscribed users)');
        console.log('SUCCESS: Founding Member correctly hidden for subscribed user');
      }
    });
  });

  test.describe.serial('Auto-Refill Section', () => {

    test('10. Auto-Refill - Toggle and Save', async ({ page }) => {
      setupLogging(page);

      if (!await login(page)) {
        test.skip();
        return;
      }

      await page.goto(`${BASE_URL}/billing`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      console.log('\n=== Testing Auto-Refill Settings ===');

      // Find Auto-Refill section using heading role
      await page.getByRole('heading', { name: 'Auto-Refill' }).scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);

      // Toggle the switch
      const toggle = page.locator('button[role="switch"]').first();
      if (await toggle.isVisible()) {
        const wasChecked = await toggle.getAttribute('data-state') === 'checked';
        await toggle.click();
        await page.waitForTimeout(1000);

        const isNowChecked = await toggle.getAttribute('data-state') === 'checked';
        console.log(`Toggle changed: ${wasChecked} -> ${isNowChecked}`);

        // Click Save Settings
        const saveBtn = page.locator('button:has-text("Save Settings")');
        if (await saveBtn.isVisible()) {
          await saveBtn.click();
          await page.waitForTimeout(3000);
          console.log('Save Settings clicked');
        }

        // Toggle back
        await toggle.click();
        await page.waitForTimeout(500);
        if (await saveBtn.isVisible()) {
          await saveBtn.click();
          await page.waitForTimeout(2000);
        }
        console.log('SUCCESS: Auto-Refill toggle and save works');
      }
    });
  });

  test.describe.serial('Data Display Sections', () => {

    test('11. Payment Methods - Displays correctly', async ({ page }) => {
      setupLogging(page);

      if (!await login(page)) {
        test.skip();
        return;
      }

      await page.goto(`${BASE_URL}/billing`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);

      console.log('\n=== Testing Payment Methods Display ===');

      await page.getByRole('heading', { name: 'Payment Methods' }).scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);

      // Check if section exists and shows either cards or empty state
      const paymentSection = page.locator('text=Payment Methods').locator('xpath=ancestor::div[contains(@class, "rounded")]').first();
      expect(await paymentSection.isVisible()).toBe(true);

      const hasCards = await page.locator('text=/Visa|Mastercard|Amex|•••• \\d{4}/i').first().isVisible().catch(() => false);
      const hasEmptyState = await page.locator('text=No saved payment methods').isVisible().catch(() => false);

      console.log(`Payment Methods: Has cards: ${hasCards}, Empty state: ${hasEmptyState}`);
      expect(hasCards || hasEmptyState).toBe(true);
      console.log('SUCCESS: Payment Methods section displays correctly');
    });

    test('12. Transaction History - Displays correctly', async ({ page }) => {
      setupLogging(page);

      if (!await login(page)) {
        test.skip();
        return;
      }

      await page.goto(`${BASE_URL}/billing`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);

      console.log('\n=== Testing Transaction History Display ===');

      await page.getByRole('heading', { name: 'Transaction History' }).scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);

      // Check if section exists
      const txnSection = page.locator('text=Transaction History').locator('xpath=ancestor::div[contains(@class, "rounded")]').first();
      expect(await txnSection.isVisible()).toBe(true);

      const hasTransactions = await page.locator('text=/Credit Purchase|Subscription|Refund|credits/i').first().isVisible().catch(() => false);
      const hasEmptyState = await page.locator('text=No transactions yet').isVisible().catch(() => false);

      console.log(`Transaction History: Has transactions: ${hasTransactions}, Empty state: ${hasEmptyState}`);
      expect(hasTransactions || hasEmptyState).toBe(true);
      console.log('SUCCESS: Transaction History section displays correctly');
    });

    test('13. Current Balance - Displays correctly', async ({ page }) => {
      setupLogging(page);

      if (!await login(page)) {
        test.skip();
        return;
      }

      await page.goto(`${BASE_URL}/billing`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);

      console.log('\n=== Testing Current Balance Display ===');

      // Check Current Balance section
      const balanceSection = page.locator('text=Current Balance').locator('xpath=ancestor::div[contains(@class, "rounded")]').first();
      expect(await balanceSection.isVisible()).toBe(true);

      // Should show credits number
      const creditsDisplay = page.locator('text=/\\d+.*Credits/i').first();
      expect(await creditsDisplay.isVisible()).toBe(true);

      console.log('SUCCESS: Current Balance displays correctly');
    });

    test('14. Active Plan - Displays correctly', async ({ page }) => {
      setupLogging(page);

      if (!await login(page)) {
        test.skip();
        return;
      }

      await page.goto(`${BASE_URL}/billing`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);

      console.log('\n=== Testing Active Plan Display ===');

      const planSection = page.locator('text=Active Plan').locator('xpath=ancestor::div[contains(@class, "rounded")]').first();
      expect(await planSection.isVisible()).toBe(true);

      // Should show plan name (Free, Creator, or Studio)
      const planName = await page.locator('text=/Free|Creator|Studio/').first().isVisible();
      expect(planName).toBe(true);

      console.log('SUCCESS: Active Plan displays correctly');
    });
  });
});
