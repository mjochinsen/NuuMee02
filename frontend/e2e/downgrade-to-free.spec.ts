import { test, expect } from '@playwright/test';

const BASE_URL = 'https://nuumee.ai';
const TEST_EMAIL = 'test54564@gmail.com';
const TEST_PASSWORD = 'test54564';

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

test('test downgrade to free plan', async ({ page }) => {
  // Log all console messages
  page.on('console', msg => {
    console.log('BROWSER:', msg.text());
  });

  // Log all API calls
  page.on('response', response => {
    if (response.url().includes('/api/v1/')) {
      const path = response.url().split('/api/v1/')[1].split('?')[0];
      console.log('API:', response.status(), path);
    }
  });

  if (!await login(page)) {
    test.skip();
    return;
  }

  await page.goto(`${BASE_URL}/billing`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  console.log('\n=== Step 1: Check current plan ===');
  const pageContent = await page.content();
  console.log('Has Creator indicator:', pageContent.includes('creator'));
  console.log('Has Studio indicator:', pageContent.includes('studio'));

  console.log('\n=== Step 2: Find Free plan card ===');

  // Find the Subscription Plans section specifically
  const subscriptionPlansSection = page.locator('h2:has-text("Subscription Plans")');
  const isVisible = await subscriptionPlansSection.isVisible();
  console.log('Subscription Plans section visible:', isVisible);

  // The Free plan card: look for a card with "⭐" (Free icon) and "$0" and "forever"
  // Need to be within the Subscription Plans section
  const freePlanCard = page.locator('.border.rounded-2xl').filter({ hasText: /Free.*forever/s }).first();
  const freePlanCardVisible = await freePlanCard.isVisible();
  console.log('Free plan card visible:', freePlanCardVisible);

  if (freePlanCardVisible) {
    const cardContent = await freePlanCard.textContent();
    console.log('Free plan card content:', cardContent?.substring(0, 100));
  }

  if (freePlanCardVisible) {
    // Get the button in the Free plan card (use first() to avoid multiple matches)
    const selectBtn = freePlanCard.locator('button').first();
    const btnText = await selectBtn.textContent();
    console.log('Free plan button text:', btnText);

    if (btnText && !btnText.includes('Active')) {
      console.log('\n=== Step 3: Click to downgrade to Free ===');
      await selectBtn.click();
      await page.waitForTimeout(2000);

      // Check if modal opened
      const modal = page.locator('[role="dialog"]');
      const modalVisible = await modal.isVisible();
      console.log('Modal appeared:', modalVisible);

      if (modalVisible) {
        const modalContent = await modal.textContent();
        console.log('Modal content preview:', modalContent?.substring(0, 300));

        // Look for the "Confirm Downgrade to Free" button
        const confirmBtn = modal.locator('button:has-text("Confirm Downgrade")');
        const confirmBtnVisible = await confirmBtn.isVisible();
        console.log('Confirm Downgrade button visible:', confirmBtnVisible);

        if (confirmBtnVisible) {
          console.log('\n=== Step 4: Click Confirm Downgrade ===');
          await confirmBtn.click();
          await page.waitForTimeout(5000);

          // Check for success or error
          const successModal = page.locator('text=/canceled|success/i');
          const errorToast = page.locator('[data-sonner-toast]');

          console.log('Success modal appeared:', await successModal.isVisible().catch(() => false));
          console.log('Toast appeared:', await errorToast.isVisible().catch(() => false));

          if (await errorToast.isVisible().catch(() => false)) {
            const toastText = await errorToast.textContent();
            console.log('Toast content:', toastText);
          }

          await page.screenshot({ path: 'test-results/downgrade-result.png', fullPage: true });
        }
      }
    } else {
      console.log('Free plan is already the current plan (Active)');
    }
  } else {
    console.log('Could not find Free plan card');
    await page.screenshot({ path: 'test-results/billing-page-debug.png', fullPage: true });
  }
});
