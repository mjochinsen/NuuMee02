import { test, expect } from '@playwright/test';

/**
 * Buy Credits Individual Package Tests
 * Tests each credit package individually
 */

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
  return !page.url().includes('/login');
}

test.describe('Buy Credits - Individual Package Tests', () => {

  test('Starter package ($10, 120 credits) - opens Stripe', async ({ page }) => {
    if (!await login(page)) { test.skip(); return; }

    await page.goto(`${BASE_URL}/billing`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    console.log('\n=== Testing Starter Package ===');

    // Get all Select buttons - first 4 are credit packages
    const selectButtons = page.getByRole('button', { name: 'Select' });
    await selectButtons.nth(0).click(); // Starter is first
    await page.waitForTimeout(2000);

    // Modal should open
    const modal = page.locator('[role="dialog"]');
    expect(await modal.isVisible()).toBe(true);
    console.log('Modal opened');

    // Verify modal shows correct package
    const modalText = await modal.textContent();
    expect(modalText).toContain('Starter');
    expect(modalText).toContain('120');
    expect(modalText).toContain('$10');
    console.log('Modal shows correct Starter package details');

    // Click proceed to payment - use JS click to bypass viewport issues
    const proceedBtn = modal.getByRole('button', { name: /proceed to payment/i });
    await proceedBtn.evaluate((el: any) => el.click());
    await page.waitForTimeout(5000);

    expect(page.url()).toContain('checkout.stripe.com');
    console.log('✅ SUCCESS: Starter package redirects to Stripe');
  });

  test('Popular package ($30, 400 credits) - opens Stripe', async ({ page }) => {
    if (!await login(page)) { test.skip(); return; }

    await page.goto(`${BASE_URL}/billing`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    console.log('\n=== Testing Popular Package ===');

    const selectButtons = page.getByRole('button', { name: 'Select' });
    await selectButtons.nth(1).click(); // Popular is second
    await page.waitForTimeout(2000);

    const modal = page.locator('[role="dialog"]');
    expect(await modal.isVisible()).toBe(true);

    const modalText = await modal.textContent();
    expect(modalText).toContain('Popular');
    expect(modalText).toContain('400');
    expect(modalText).toContain('$30');
    console.log('Modal shows correct Popular package details');

    const proceedBtn = modal.getByRole('button', { name: /proceed to payment/i });
    await proceedBtn.evaluate((el: any) => el.click());
    await page.waitForTimeout(5000);

    expect(page.url()).toContain('checkout.stripe.com');
    console.log('✅ SUCCESS: Popular package redirects to Stripe');
  });

  test('Pro package ($75, 1100 credits) - opens Stripe', async ({ page }) => {
    if (!await login(page)) { test.skip(); return; }

    await page.goto(`${BASE_URL}/billing`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    console.log('\n=== Testing Pro Package ===');

    const selectButtons = page.getByRole('button', { name: 'Select' });
    await selectButtons.nth(2).click(); // Pro is third
    await page.waitForTimeout(2000);

    const modal = page.locator('[role="dialog"]');
    expect(await modal.isVisible()).toBe(true);

    const modalText = await modal.textContent();
    expect(modalText).toContain('Pro');
    expect(modalText).toContain('1100');
    expect(modalText).toContain('$75');
    console.log('Modal shows correct Pro package details');

    const proceedBtn = modal.getByRole('button', { name: /proceed to payment/i });
    await proceedBtn.evaluate((el: any) => el.click());
    await page.waitForTimeout(5000);

    expect(page.url()).toContain('checkout.stripe.com');
    console.log('✅ SUCCESS: Pro package redirects to Stripe');
  });

  test('Mega package ($150, 2500 credits) - opens Stripe', async ({ page }) => {
    if (!await login(page)) { test.skip(); return; }

    await page.goto(`${BASE_URL}/billing`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    console.log('\n=== Testing Mega Package ===');

    const selectButtons = page.getByRole('button', { name: 'Select' });
    await selectButtons.nth(3).click(); // Mega is fourth
    await page.waitForTimeout(2000);

    const modal = page.locator('[role="dialog"]');
    expect(await modal.isVisible()).toBe(true);

    const modalText = await modal.textContent();
    expect(modalText).toContain('Mega');
    expect(modalText).toContain('2500');
    expect(modalText).toContain('$150');
    console.log('Modal shows correct Mega package details');

    const proceedBtn = modal.getByRole('button', { name: /proceed to payment/i });
    await proceedBtn.evaluate((el: any) => el.click());
    await page.waitForTimeout(5000);

    expect(page.url()).toContain('checkout.stripe.com');
    console.log('✅ SUCCESS: Mega package redirects to Stripe');
  });
});
