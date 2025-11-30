import { test, expect } from '@playwright/test';

/**
 * Upload Flow E2E Tests
 *
 * Tests the video creation page upload functionality.
 * Run with: npx playwright test e2e/upload-flow.spec.ts
 *
 * Enable test mode by adding ?test=1 to the URL
 */

const BASE_URL = process.env.TEST_URL || 'https://wanapi-prod.web.app';

test.describe('Video Upload Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Enable test mode via query param
    await page.goto(`${BASE_URL}/videos/create?test=1`);

    // Wait for page to load
    await expect(page.locator('h1')).toContainText('AI Character Replacement Studio');
  });

  test('should show test mode button when test=1', async ({ page }) => {
    // Test mode button should be visible
    const testButton = page.getByTestId('load-test-files');
    await expect(testButton).toBeVisible();
    await expect(testButton).toContainText('Load Test Files');
  });

  test('should load test files when clicking test button', async ({ page }) => {
    // Click the load test files button
    const testButton = page.getByTestId('load-test-files');
    await testButton.click();

    // Wait for files to load (button text changes to Loading...)
    await expect(testButton).toContainText('Loading...');

    // Wait for files to finish loading
    await expect(testButton).toContainText('Load Test Files', { timeout: 10000 });

    // Check that image preview is now showing
    const imagePreview = page.locator('img[alt="Reference"]');
    await expect(imagePreview).toBeVisible({ timeout: 5000 });

    // Check that generate button is now enabled
    const generateButton = page.locator('button:has-text("Generate Video")');
    await expect(generateButton).toBeEnabled();
  });

  test('should show sign-in error when not authenticated', async ({ page }) => {
    // First load test files
    const testButton = page.getByTestId('load-test-files');
    await testButton.click();
    await expect(testButton).toContainText('Load Test Files', { timeout: 10000 });

    // Wait for image preview to appear
    await expect(page.locator('img[alt="Reference"]')).toBeVisible({ timeout: 5000 });

    // Click generate - should fail since not logged in
    const generateButton = page.locator('button:has-text("Generate Video")');
    await generateButton.click();

    // Should show sign-in error (user is null)
    await expect(page.locator('text=Please sign in to generate videos')).toBeVisible({ timeout: 5000 });
  });

  test('should consistently show sign-in error after clearing cookies', async ({ page, context }) => {
    // Clear any auth tokens
    await context.clearCookies();

    // Reload page with test mode
    await page.goto(`${BASE_URL}/videos/create?test=1`);

    // Load test files
    const testButton = page.getByTestId('load-test-files');
    await testButton.click();
    await expect(testButton).toContainText('Load Test Files', { timeout: 10000 });

    // Wait for files to load
    await expect(page.locator('img[alt="Reference"]')).toBeVisible({ timeout: 5000 });

    // Click generate
    const generateButton = page.locator('button:has-text("Generate Video")');
    await generateButton.click();

    // Should show sign-in error since user is not authenticated
    await expect(page.locator('text=Please sign in to generate videos')).toBeVisible({ timeout: 5000 });
  });

  test('should hide test button in normal mode', async ({ page }) => {
    // Go to page without test param
    await page.goto(`${BASE_URL}/videos/create`);

    // Test button should NOT be visible
    const testButton = page.getByTestId('load-test-files');
    await expect(testButton).not.toBeVisible();
  });
});

test.describe('API Health Check', () => {
  test('should have working API', async ({ request }) => {
    const response = await request.get('https://nuumee-api-450296399943.us-central1.run.app/health');
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.status).toBe('healthy');
  });
});
