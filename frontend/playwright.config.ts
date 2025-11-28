import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for NuuMee Phase 1.5 testing
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  // Visual regression test configuration
  expect: {
    toHaveScreenshot: {
      // Maximum pixel ratio difference allowed (2% default)
      maxDiffPixelRatio: 0.02,
      // Number of times to retry screenshot comparison
      maxDiffPixels: undefined,
      // Animation settings for consistent screenshots
      animations: 'disabled',
      // Ensure consistent rendering
      caret: 'hide',
    },
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile',
      use: { ...devices['iPhone 14'] },
    },
  ],

  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
