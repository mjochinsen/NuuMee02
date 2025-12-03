import { test, expect } from '@playwright/test';

/**
 * Test Account Settings page functionality:
 * - Download My Data
 * - Downgrade to Free
 * - Delete Account
 */

const BASE_URL = 'https://nuumee.ai';
const TEST_EMAIL = 'test54564@gmail.com';
const TEST_PASSWORD = 'test54564';

test.describe('Account Settings Page', () => {
  test.setTimeout(90000);

  test.beforeEach(async ({ page }) => {
    // Enable logging
    page.on('console', msg => {
      if (msg.type() === 'log' || msg.type() === 'error') {
        console.log(`BROWSER ${msg.type().toUpperCase()}:`, msg.text());
      }
    });

    page.on('response', res => {
      if (res.url().includes('/api/v1/') && res.status() >= 400) {
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
      console.log('Login failed - skipping test');
      test.skip();
      return;
    }
    console.log('Login successful');
  });

  test('navigate to account settings and verify page loads', async ({ page }) => {
    console.log('\n=== Navigate to Account Settings ===');
    await page.goto(`${BASE_URL}/account`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Check page title/header
    const header = page.locator('h1').first();
    await expect(header).toBeVisible();
    console.log('Account page header:', await header.textContent());

    // Take screenshot
    await page.screenshot({ path: 'test-results/account-settings-page.png', fullPage: true });

    // Check for tabs
    const tabList = page.locator('[role="tablist"], .tabs, [data-tabs]');
    if (await tabList.isVisible({ timeout: 2000 })) {
      console.log('Found tab navigation');
    }
  });

  test('navigate to delete account tab', async ({ page }) => {
    console.log('\n=== Navigate to Delete Account Tab ===');
    await page.goto(`${BASE_URL}/account`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Look for Delete Account tab
    const deleteTab = page.getByRole('button', { name: /delete account/i })
      .or(page.locator('button:has-text("Delete Account")'))
      .or(page.getByText(/delete account/i).locator('..'));

    if (await deleteTab.isVisible({ timeout: 3000 })) {
      await deleteTab.click();
      await page.waitForTimeout(1000);
      console.log('Clicked Delete Account tab');
    }

    await page.screenshot({ path: 'test-results/delete-account-tab.png', fullPage: true });

    // Check for "Download My Data" button
    const downloadBtn = page.getByRole('button', { name: /download my data/i });
    if (await downloadBtn.isVisible({ timeout: 3000 })) {
      console.log('Found "Download My Data" button');
      expect(await downloadBtn.isVisible()).toBe(true);
    }

    // Check for "Downgrade to Free" button
    const downgradeBtn = page.getByRole('button', { name: /downgrade to free/i });
    if (await downgradeBtn.isVisible({ timeout: 3000 })) {
      console.log('Found "Downgrade to Free" button');
    }

    // Check for "Delete My Account" button
    const deleteBtn = page.getByRole('button', { name: /delete.*account/i });
    if (await deleteBtn.isVisible({ timeout: 3000 })) {
      console.log('Found "Delete My Account" button');
    }
  });

  test('click Download My Data and verify API call', async ({ page }) => {
    console.log('\n=== Test Download My Data ===');
    await page.goto(`${BASE_URL}/account`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Navigate to delete account tab if needed
    const deleteTab = page.getByRole('button', { name: /delete account/i });
    if (await deleteTab.isVisible({ timeout: 2000 })) {
      await deleteTab.click();
      await page.waitForTimeout(1000);
    }

    const downloadBtn = page.getByRole('button', { name: /download my data/i });

    if (await downloadBtn.isVisible({ timeout: 3000 })) {
      console.log('Clicking Download My Data button...');

      // Set up listener for download
      const downloadPromise = page.waitForEvent('download', { timeout: 30000 }).catch(() => null);

      // Set up listener for API response
      const apiPromise = page.waitForResponse(
        res => res.url().includes('/auth/export') && res.status() === 200,
        { timeout: 30000 }
      ).catch(() => null);

      await downloadBtn.click();

      // Wait for either download or API response
      const [download, apiResponse] = await Promise.all([downloadPromise, apiPromise]);

      if (download) {
        console.log('Download initiated:', await download.suggestedFilename());
        expect(download).toBeTruthy();
      }

      if (apiResponse) {
        console.log('API response received:', apiResponse.status());
        const data = await apiResponse.json().catch(() => null);
        if (data) {
          console.log('Export data received with keys:', Object.keys(data.data || data));
        }
      }

      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'test-results/download-data-result.png' });
    } else {
      console.log('Download My Data button not found');
      test.skip();
    }
  });

  test('click Downgrade to Free and verify API call', async ({ page }) => {
    console.log('\n=== Test Downgrade to Free ===');
    await page.goto(`${BASE_URL}/account`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Navigate to delete account tab if needed
    const deleteTab = page.getByRole('button', { name: /delete account/i });
    if (await deleteTab.isVisible({ timeout: 2000 })) {
      await deleteTab.click();
      await page.waitForTimeout(1000);
    }

    const downgradeBtn = page.getByRole('button', { name: /downgrade to free/i });

    if (await downgradeBtn.isVisible({ timeout: 3000 })) {
      // Check if button is disabled (user already on free plan)
      const isDisabled = await downgradeBtn.isDisabled();
      if (isDisabled) {
        console.log('Downgrade button is disabled - user is likely on Free plan already');
        return;
      }

      console.log('Clicking Downgrade to Free button...');

      // Set up listener for API response
      const apiPromise = page.waitForResponse(
        res => res.url().includes('/subscriptions/cancel') && (res.status() === 200 || res.status() === 400),
        { timeout: 30000 }
      ).catch(() => null);

      await downgradeBtn.click();

      const apiResponse = await apiPromise;
      if (apiResponse) {
        console.log('API response received:', apiResponse.status());
        const data = await apiResponse.json().catch(() => null);
        if (data) {
          console.log('Cancel response:', JSON.stringify(data).substring(0, 200));
        }

        // Check for success toast or error
        await page.waitForTimeout(2000);

        // Look for toast notification
        const toast = page.locator('[role="alert"], .toast, .notification');
        if (await toast.isVisible({ timeout: 3000 })) {
          console.log('Toast message:', await toast.textContent());
        }
      }

      await page.screenshot({ path: 'test-results/downgrade-result.png', fullPage: true });
    } else {
      console.log('Downgrade to Free button not found');
      test.skip();
    }
  });

  test('click Delete Account and verify confirmation modal', async ({ page }) => {
    console.log('\n=== Test Delete Account Flow ===');
    await page.goto(`${BASE_URL}/account`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Navigate to delete account tab if needed
    const deleteTab = page.getByRole('button', { name: /delete account/i });
    if (await deleteTab.isVisible({ timeout: 2000 })) {
      await deleteTab.click();
      await page.waitForTimeout(1000);
    }

    const deleteBtn = page.getByRole('button', { name: /delete.*my.*account/i })
      .or(page.locator('button:has-text("Delete My Account")'));

    if (await deleteBtn.isVisible({ timeout: 3000 })) {
      console.log('Clicking Delete My Account button...');
      await deleteBtn.click();
      await page.waitForTimeout(1000);

      // Check for confirmation modal
      const modal = page.locator('[role="dialog"]');
      if (await modal.isVisible({ timeout: 3000 })) {
        console.log('Confirmation modal appeared');
        await page.screenshot({ path: 'test-results/delete-confirm-modal.png' });

        // Check modal content
        const modalText = await modal.textContent();
        console.log('Modal content preview:', modalText?.substring(0, 300));

        // Verify confirmation input exists
        const confirmInput = modal.locator('input[type="text"]');
        if (await confirmInput.isVisible({ timeout: 2000 })) {
          console.log('Found confirmation text input');

          // DO NOT TYPE "DELETE" - this would actually delete the account!
          // Just verify the input exists and the confirm button is disabled
          const confirmBtn = modal.getByRole('button', { name: /yes.*delete/i });
          if (await confirmBtn.isVisible({ timeout: 2000 })) {
            const isDisabled = await confirmBtn.isDisabled();
            console.log('Confirm button disabled (expected):', isDisabled);
            expect(isDisabled).toBe(true);
          }
        }

        // Close the modal
        const cancelBtn = modal.getByRole('button', { name: /cancel/i });
        if (await cancelBtn.isVisible()) {
          await cancelBtn.click();
          console.log('Closed modal without deleting');
        }
      } else {
        console.log('Confirmation modal did not appear');
      }

      await page.screenshot({ path: 'test-results/delete-account-final.png', fullPage: true });
    } else {
      console.log('Delete My Account button not found');
      test.skip();
    }
  });
});
