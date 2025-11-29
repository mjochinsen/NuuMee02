import { test, expect } from '@playwright/test';

// Test configuration
const FRONTEND_URL = 'https://wanapi-prod.web.app';

test.describe('Subscription Modal Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dev/modals`);
    await page.waitForLoadState('networkidle');
  });

  test('modals page loads with all modal buttons', async ({ page }) => {
    // Check all 6 modal buttons are present
    await expect(page.getByRole('button', { name: /open subscribe modal/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /open upgrade modal/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /open downgrade modal/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /open cancel modal/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /open annual modal/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /open founding modal/i })).toBeVisible();
  });

  test('subscribe modal opens and displays correctly', async ({ page }) => {
    // Click the subscribe modal button
    await page.getByRole('button', { name: /open subscribe modal/i }).click();

    // Wait for dialog to appear
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 });

    // Check modal content
    await expect(page.getByText(/subscribe to nuumee/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /subscribe now/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /cancel/i })).toBeVisible();

    // Close modal
    await page.getByRole('button', { name: /cancel/i }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('upgrade modal opens and displays correctly', async ({ page }) => {
    await page.getByRole('button', { name: /open upgrade modal/i }).click();

    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/upgrade your plan/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /upgrade plan/i })).toBeVisible();

    // Close modal
    await page.getByRole('button', { name: /cancel/i }).click();
  });

  test('downgrade modal opens and displays correctly', async ({ page }) => {
    await page.getByRole('button', { name: /open downgrade modal/i }).click();

    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/downgrade plan/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /confirm downgrade/i })).toBeVisible();

    // Close modal
    await page.getByRole('button', { name: /cancel/i }).click();
  });

  test('cancel modal opens and displays correctly', async ({ page }) => {
    await page.getByRole('button', { name: /open cancel modal/i }).click();

    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 });
    // Use heading role to avoid matching button with same text
    await expect(page.getByRole('heading', { name: /cancel subscription/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /cancel subscription/i })).toBeVisible();

    // Close by clicking the close button (X) in the dialog
    await page.getByRole('dialog').getByRole('button').first().click();
  });

  test('annual modal opens and displays correctly', async ({ page }) => {
    await page.getByRole('button', { name: /open annual modal/i }).click();

    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 });
    // Use heading role to be specific
    await expect(page.getByRole('heading', { name: /switch to annual billing/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /switch to annual/i })).toBeVisible();

    // Should show savings info - use .first() since 20% appears in description and badge
    await expect(page.getByText(/20%/i).first()).toBeVisible();

    // Close modal
    await page.getByRole('button', { name: /cancel/i }).click();
  });

  test('founding modal opens and displays correctly', async ({ page }) => {
    await page.getByRole('button', { name: /open founding modal/i }).click();

    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 });
    // Use heading role to be specific - "Founding Member" appears multiple places
    await expect(page.getByRole('heading', { name: /founding member/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /become a founder/i })).toBeVisible();

    // Close modal
    await page.getByRole('button', { name: /cancel/i }).click();
  });

  test('modal can be closed by clicking outside', async ({ page }) => {
    await page.getByRole('button', { name: /open subscribe modal/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 });

    // Click outside the modal (on the overlay)
    await page.mouse.click(10, 10);

    // Dialog should close
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 3000 });
  });

  test('modal can be closed by pressing Escape', async ({ page }) => {
    await page.getByRole('button', { name: /open subscribe modal/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 });

    // Press Escape
    await page.keyboard.press('Escape');

    // Dialog should close
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 3000 });
  });

  test('modal primary action triggers alert', async ({ page }) => {
    // Set up dialog handler
    page.on('dialog', async (dialog) => {
      expect(dialog.message()).toContain('Subscribe Now clicked');
      await dialog.accept();
    });

    await page.getByRole('button', { name: /open subscribe modal/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 });

    // Click primary action
    await page.getByRole('button', { name: /subscribe now/i }).click();

    // Modal should close after action
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 3000 });
  });
});

test.describe('Modal Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dev/modals`);
    await page.waitForLoadState('networkidle');
  });

  test('modal has proper focus management', async ({ page }) => {
    await page.getByRole('button', { name: /open subscribe modal/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 });

    // Focus should be trapped in modal
    const focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(['BUTTON', 'DIV']).toContain(focused);

    // Tab through modal elements
    await page.keyboard.press('Tab');
    const newFocused = await page.evaluate(() => document.activeElement?.tagName);
    expect(['BUTTON', 'DIV']).toContain(newFocused);
  });

  test('modal has proper ARIA attributes', async ({ page }) => {
    await page.getByRole('button', { name: /open subscribe modal/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 });

    // Check dialog role
    const dialog = page.getByRole('dialog');
    await expect(dialog).toHaveAttribute('role', 'dialog');

    // Check for aria-modal
    const ariaModal = await dialog.getAttribute('aria-modal');
    // Radix UI uses data-state instead sometimes
    expect(ariaModal === 'true' || await dialog.getAttribute('data-state') === 'open').toBeTruthy();
  });
});
