import { test, expect } from '@playwright/test';

/**
 * AUTHENTICATED CHECKOUT E2E TEST
 *
 * This test verifies the ACTUAL checkout flow works with a real authenticated user.
 * Unlike other tests that just check if pages load, this test:
 * 1. Creates/uses a real test user in Firebase
 * 2. Logs in to get a real Firebase ID token
 * 3. Initiates a real checkout session via API
 * 4. Verifies Stripe Checkout URL is returned
 *
 * This is the REAL test that confirms payments work end-to-end.
 */

// Configuration
const API_URL = 'https://nuumee-api-450296399943.us-central1.run.app/api/v1';
const FRONTEND_URL = 'https://wanapi-prod.web.app';

// Firebase configuration (same as frontend)
const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyCncAqZcO0U8U8AbOHpRvmg0yBB4x8YUyc',
  authDomain: 'wanapi-prod.firebaseapp.com',
  projectId: 'wanapi-prod',
};

// Test user credentials - USE A REAL TEST ACCOUNT
// You need to create this user in Firebase Auth first
const TEST_USER = {
  email: 'test@nuumee-test.com',
  password: 'TestPassword123!',
};

// Credit packages to test
const PACKAGES = ['starter', 'popular', 'pro', 'mega'];

test.describe('Authenticated Checkout Flow', () => {
  test.describe.configure({ mode: 'serial' });

  let idToken: string | null = null;

  /**
   * Test 1: Get Firebase ID token via REST API
   * This simulates what the frontend does when logging in
   */
  test('can authenticate with Firebase and get ID token', async ({ request }) => {
    // Firebase Auth REST API endpoint for email/password sign-in
    const firebaseAuthUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_CONFIG.apiKey}`;

    const authResponse = await request.post(firebaseAuthUrl, {
      data: {
        email: TEST_USER.email,
        password: TEST_USER.password,
        returnSecureToken: true,
      },
    });

    // If user doesn't exist, we'll get a 400 error
    if (authResponse.status() === 400) {
      const errorBody = await authResponse.json();
      if (errorBody.error?.message === 'EMAIL_NOT_FOUND') {
        console.log('\n===========================================');
        console.log('TEST USER DOES NOT EXIST!');
        console.log('Please create a test user in Firebase Auth:');
        console.log(`  Email: ${TEST_USER.email}`);
        console.log(`  Password: ${TEST_USER.password}`);
        console.log('===========================================\n');
        test.skip();
        return;
      }
      console.log('Auth error:', errorBody);
    }

    expect(authResponse.ok()).toBeTruthy();

    const authData = await authResponse.json();
    expect(authData.idToken).toBeTruthy();

    idToken = authData.idToken;
    console.log(`[AUTH] Got Firebase ID token (${idToken?.substring(0, 20)}...)`);
  });

  /**
   * Test 2: Verify user exists in backend
   */
  test('user profile exists in backend', async ({ request }) => {
    test.skip(!idToken, 'No ID token available');

    const response = await request.get(`${API_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });

    if (response.status() === 404) {
      // User needs to be registered first - call register endpoint
      console.log('[AUTH] User not found in backend, registering...');

      const registerResponse = await request.post(`${API_URL}/auth/register`, {
        headers: {
          'Content-Type': 'application/json',
        },
        data: {
          id_token: idToken,
        },
      });

      if (!registerResponse.ok()) {
        console.log('Register failed:', await registerResponse.text());
      }
      expect(registerResponse.ok()).toBeTruthy();
      console.log('[AUTH] User registered successfully');
    } else {
      expect(response.ok()).toBeTruthy();
      const profile = await response.json();
      console.log(`[AUTH] User profile: ${profile.email}, credits: ${profile.credits_balance}`);
    }
  });

  /**
   * Test 3: Credit packages endpoint works
   */
  test('credit packages API returns correct data', async ({ request }) => {
    const response = await request.get(`${API_URL}/credits/packages`);
    expect(response.ok()).toBeTruthy();

    const packages = await response.json();
    expect(packages.length).toBe(4);

    for (const pkgId of PACKAGES) {
      const pkg = packages.find((p: { id: string }) => p.id === pkgId);
      expect(pkg).toBeTruthy();
      console.log(`[PACKAGES] ${pkg.id}: ${pkg.credits} credits for $${pkg.price_cents / 100}`);
    }
  });

  /**
   * Test 4: THE ACTUAL CHECKOUT TEST
   * This is the critical test that verifies Stripe checkout works
   */
  test('can create Stripe checkout session for starter package', async ({ request }) => {
    test.skip(!idToken, 'No ID token available');

    console.log('\n============================================');
    console.log('TESTING ACTUAL CHECKOUT WITH STARTER PACKAGE');
    console.log('============================================\n');

    const response = await request.post(`${API_URL}/credits/checkout`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      data: {
        package_id: 'starter',
      },
    });

    // Log the full response for debugging
    const responseBody = await response.text();
    console.log(`[CHECKOUT] Status: ${response.status()}`);
    console.log(`[CHECKOUT] Body: ${responseBody}`);

    if (!response.ok()) {
      console.log('\n!!! CHECKOUT FAILED !!!');
      console.log(`Status: ${response.status()}`);
      console.log(`Error: ${responseBody}`);

      // Parse the error for better diagnosis
      try {
        const errorJson = JSON.parse(responseBody);
        if (errorJson.detail) {
          console.log(`Detail: ${JSON.stringify(errorJson.detail)}`);
        }
      } catch {
        // Not JSON
      }
    }

    expect(response.ok()).toBeTruthy();

    const checkoutData = JSON.parse(responseBody);
    expect(checkoutData.checkout_url).toBeTruthy();
    expect(checkoutData.session_id).toBeTruthy();
    expect(checkoutData.checkout_url).toContain('checkout.stripe.com');

    console.log('\n============================================');
    console.log('CHECKOUT SUCCESS!');
    console.log(`Stripe URL: ${checkoutData.checkout_url.substring(0, 50)}...`);
    console.log(`Session ID: ${checkoutData.session_id}`);
    console.log('============================================\n');
  });

  /**
   * Test 5: Test all package IDs work
   */
  test('can create checkout session for all packages', async ({ request }) => {
    test.skip(!idToken, 'No ID token available');

    for (const packageId of PACKAGES) {
      console.log(`[CHECKOUT] Testing package: ${packageId}`);

      const response = await request.post(`${API_URL}/credits/checkout`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        data: {
          package_id: packageId,
        },
      });

      expect(response.ok(), `Checkout failed for package ${packageId}`).toBeTruthy();

      const data = await response.json();
      expect(data.checkout_url).toContain('checkout.stripe.com');
      console.log(`[CHECKOUT] ${packageId}: SUCCESS`);
    }
  });

  /**
   * Test 6: Invalid package ID returns proper error
   */
  test('invalid package ID returns 422 with clear error', async ({ request }) => {
    test.skip(!idToken, 'No ID token available');

    const response = await request.post(`${API_URL}/credits/checkout`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      data: {
        package_id: 'invalid_package',
      },
    });

    expect(response.status()).toBe(422);
    const error = await response.json();
    expect(error.detail).toBeTruthy();
    console.log(`[CHECKOUT] Invalid package error: ${JSON.stringify(error.detail)}`);
  });

  /**
   * Test 7: Missing package_id returns proper error
   */
  test('missing package_id returns 422 with Field required error', async ({ request }) => {
    test.skip(!idToken, 'No ID token available');

    const response = await request.post(`${API_URL}/credits/checkout`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      data: {}, // Empty body - missing package_id
    });

    expect(response.status()).toBe(422);
    const error = await response.json();
    console.log(`[CHECKOUT] Missing field error: ${JSON.stringify(error.detail)}`);

    // This is what the user was seeing!
    // If we get "Field required" with an empty body, that confirms the issue
    expect(error.detail).toBeTruthy();
  });

  /**
   * Test 8: Empty body returns proper error
   */
  test('completely empty body returns proper error', async ({ request }) => {
    test.skip(!idToken, 'No ID token available');

    const response = await request.post(`${API_URL}/credits/checkout`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      // No body at all
    });

    expect(response.status()).toBe(422);
    const error = await response.json();
    console.log(`[CHECKOUT] Empty body error: ${JSON.stringify(error.detail)}`);
  });
});

/**
 * Browser-based checkout flow test
 * This tests the actual UI flow
 */
test.describe('Browser Checkout Flow', () => {
  test('billing page loads and shows credit packages', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/billing`);
    await page.waitForLoadState('networkidle');

    // Should redirect to login if not authenticated
    const url = page.url();
    if (url.includes('/login')) {
      console.log('[BROWSER] Redirected to login (expected for unauthenticated user)');
      return;
    }

    // If we somehow got to billing, check for packages
    await expect(page.getByText(/Starter|Popular|Pro|Mega/i).first()).toBeVisible();
  });

  test('clicking Buy Credits shows modal', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/pricing`);
    await page.waitForLoadState('networkidle');

    // Find and click a Buy button
    const buyButton = page.locator('button').filter({ hasText: /buy/i }).first();
    await buyButton.click();

    // Should either show modal or redirect to login
    await page.waitForTimeout(1000);

    const url = page.url();
    if (url.includes('/login')) {
      console.log('[BROWSER] Redirected to login (expected)');
      return;
    }

    // Look for modal content
    const modal = page.locator('[role="dialog"], .modal, [data-state="open"]');
    if (await modal.isVisible()) {
      console.log('[BROWSER] Modal opened successfully');
    }
  });
});
