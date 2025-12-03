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

test('debug downgrade flow with screenshots', async ({ page }) => {
  // Log ALL console messages
  page.on('console', msg => {
    console.log('BROWSER:', msg.text());
  });

  // Log API responses
  page.on('response', response => {
    if (response.url().includes('/api/v1/')) {
      const path = response.url().split('/api/v1/')[1].split('?')[0];
      console.log('API:', response.status(), path);
    }
  });

  if (!await login(page)) {
    console.log('Login failed');
    test.skip();
    return;
  }

  await page.goto(`${BASE_URL}/billing`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  // Take screenshot of billing page
  await page.screenshot({ path: 'test-results/debug-1-billing-page.png', fullPage: true });

  // Check Active Plan section
  const activePlan = await page.locator('text=Active Plan').first().textContent();
  console.log('Active Plan section found:', !!activePlan);

  // Check if user has Cancel Subscription button (meaning they have an active subscription)
  const cancelBtn = page.locator('button:has-text("Cancel Subscription")');
  const hasCancelBtn = await cancelBtn.isVisible();
  console.log('Has Cancel Subscription button:', hasCancelBtn);

  // Find Free plan and click Select
  const freePlanCard = page.locator('.border.rounded-2xl').filter({ hasText: /Free.*forever/s }).first();
  const selectBtn = freePlanCard.locator('button').first();
  const btnText = await selectBtn.textContent();
  console.log('Free plan button text:', btnText);

  if (btnText === 'Active') {
    console.log('User is already on Free plan!');
    return;
  }

  // Click to open modal
  await selectBtn.click();
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'test-results/debug-2-modal-opened.png', fullPage: true });

  // Check modal content
  const modal = page.locator('[role="dialog"]');
  const modalVisible = await modal.isVisible();
  console.log('Modal visible:', modalVisible);

  if (modalVisible) {
    const modalTitle = await modal.locator('h2, [class*="DialogTitle"]').first().textContent();
    console.log('Modal title:', modalTitle);

    // Find and click the confirm button
    const confirmBtn = modal.locator('button:has-text("Confirm Downgrade")');
    const confirmBtnVisible = await confirmBtn.isVisible();
    console.log('Confirm button visible:', confirmBtnVisible);

    if (confirmBtnVisible) {
      console.log('Clicking Confirm Downgrade...');
      await confirmBtn.click();

      // Wait for response
      await page.waitForTimeout(5000);
      await page.screenshot({ path: 'test-results/debug-3-after-confirm.png', fullPage: true });

      // Check for success modal or error
      const successDialog = page.locator('[role="dialog"]');
      const stillHasDialog = await successDialog.isVisible();
      console.log('Dialog still visible after confirm:', stillHasDialog);

      if (stillHasDialog) {
        const dialogContent = await successDialog.textContent();
        console.log('Dialog content after confirm:', dialogContent?.substring(0, 200));
      }

      // Check for toast
      const toasts = page.locator('[data-sonner-toast]');
      const toastCount = await toasts.count();
      console.log('Toast count:', toastCount);

      if (toastCount > 0) {
        const toastText = await toasts.first().textContent();
        console.log('Toast text:', toastText);
      }
    }
  }
});
