import { test, expect } from '@playwright/test';

test.describe('Debug Upgrade Plan Flow', () => {
  test('login and click upgrade plan', async ({ page }) => {
    // Enable console logging
    page.on('console', msg => console.log('BROWSER:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
    page.on('request', req => {
      if (req.url().includes('/api/')) {
        console.log('API REQUEST:', req.method(), req.url());
      }
    });
    page.on('response', res => {
      if (res.url().includes('/api/')) {
        console.log('API RESPONSE:', res.status(), res.url());
      }
    });

    // Go to login page
    await page.goto('https://nuumee.ai/login');
    await page.waitForLoadState('networkidle');
    console.log('On login page');

    // Click Google sign in
    const googleButton = page.locator('button:has-text("Continue with Google")');
    if (await googleButton.isVisible()) {
      console.log('Google button found, clicking...');
      // This will open popup - for now let's check billing page directly if already logged in
    }

    // Try going to billing directly (if session exists)
    await page.goto('https://nuumee.ai/billing');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    console.log('Current URL after billing:', currentUrl);

    // If redirected to home, we're not logged in
    if (currentUrl === 'https://nuumee.ai/' || currentUrl.includes('/login')) {
      console.log('Not logged in - need auth');
      // Take screenshot
      await page.screenshot({ path: 'test-results/not-logged-in.png' });
      return;
    }

    // We're on billing page - take screenshot
    await page.screenshot({ path: 'test-results/billing-page.png', fullPage: true });
    console.log('Screenshot saved');

    // Look for Upgrade Plan button
    const upgradeButton = page.locator('button:has-text("Upgrade Plan")').first();
    const upgradeVisible = await upgradeButton.isVisible();
    console.log('Upgrade Plan button visible:', upgradeVisible);

    if (upgradeVisible) {
      console.log('Clicking Upgrade Plan...');
      await upgradeButton.click();
      await page.waitForTimeout(2000);
      
      // Screenshot after clicking
      await page.screenshot({ path: 'test-results/after-upgrade-click.png', fullPage: true });
      
      // Check for modal
      const modal = page.locator('[role="dialog"]');
      const modalVisible = await modal.isVisible();
      console.log('Modal visible:', modalVisible);

      if (modalVisible) {
        // Look for Upgrade Now button in modal
        const upgradeNowBtn = page.locator('button:has-text("Upgrade Now")');
        const upgradeNowVisible = await upgradeNowBtn.isVisible();
        console.log('Upgrade Now button visible:', upgradeNowVisible);

        if (upgradeNowVisible) {
          console.log('Clicking Upgrade Now...');
          
          // Listen for navigation (Stripe redirect)
          const navigationPromise = page.waitForURL('**/checkout.stripe.com/**', { timeout: 10000 }).catch(() => null);
          
          await upgradeNowBtn.click();
          
          // Wait for either navigation or error
          await page.waitForTimeout(5000);
          
          const newUrl = page.url();
          console.log('URL after Upgrade Now click:', newUrl);
          
          // Screenshot final state
          await page.screenshot({ path: 'test-results/after-upgrade-now.png', fullPage: true });
        }
      }
    }

    // Also try the subscription plan cards
    const studioCard = page.locator('text=Studio').first();
    if (await studioCard.isVisible()) {
      console.log('Found Studio card');
    }
  });

  test('check billing page elements', async ({ page }) => {
    await page.goto('https://nuumee.ai/billing');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Check if redirected
    if (page.url() !== 'https://nuumee.ai/billing') {
      console.log('Redirected to:', page.url());
      return;
    }

    // List all buttons on the page
    const buttons = await page.locator('button').all();
    console.log('Found', buttons.length, 'buttons');
    
    for (let i = 0; i < Math.min(buttons.length, 20); i++) {
      const text = await buttons[i].textContent();
      const visible = await buttons[i].isVisible();
      if (visible && text) {
        console.log(`Button ${i}: "${text.trim().substring(0, 50)}"`);
      }
    }
  });
});
