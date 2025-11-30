/**
 * Webhook Verification Test
 *
 * This test completes a full Stripe checkout and verifies credits are added via webhook.
 * Uses Stripe test mode with test card 4242424242424242.
 *
 * Required environment variables:
 * - FIREBASE_API_KEY: Firebase Web API key
 * - TEST_EMAIL: Test user email
 * - TEST_PASSWORD: Test user password
 */
import { test, expect } from '@playwright/test';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://nuumee-api-450296399943.us-central1.run.app';
const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY || '';

// Test user credentials from environment
const TEST_EMAIL = process.env.TEST_EMAIL || '';
const TEST_PASSWORD = process.env.TEST_PASSWORD || '';

interface FirebaseAuthResponse {
  idToken: string;
  localId: string;
  email: string;
}

async function getFirebaseToken(): Promise<{ token: string; uid: string }> {
  // Try to sign in first
  const signInUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`;

  let response = await fetch(signInUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      returnSecureToken: true
    })
  });

  if (!response.ok) {
    // User doesn't exist, create them
    const signUpUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`;
    response = await fetch(signUpUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        returnSecureToken: true
      })
    });
  }

  if (!response.ok) {
    throw new Error(`Firebase auth failed: ${await response.text()}`);
  }

  const data: FirebaseAuthResponse = await response.json();
  return { token: data.idToken, uid: data.localId };
}

async function registerUserInBackend(token: string): Promise<void> {
  // Register first (uses id_token in body, not Authorization header)
  const registerResponse = await fetch(`${API_BASE}/api/v1/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ id_token: token })
  });

  if (!registerResponse.ok && registerResponse.status !== 409) {
    console.log(`Register response: ${registerResponse.status}`);
  }

  // Then login to ensure profile exists
  const loginResponse = await fetch(`${API_BASE}/api/v1/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ id_token: token })
  });

  if (!loginResponse.ok) {
    console.log(`Login response: ${loginResponse.status}`);
  }
}

async function getCreditsBalance(token: string): Promise<number> {
  const response = await fetch(`${API_BASE}/api/v1/credits/balance`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (!response.ok) {
    throw new Error(`Failed to get balance: ${await response.text()}`);
  }

  const data = await response.json();
  return data.balance;
}

async function createCheckoutSession(token: string, packageId: string): Promise<{ url: string; sessionId: string }> {
  const response = await fetch(`${API_BASE}/api/v1/credits/checkout`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ package_id: packageId })
  });

  if (!response.ok) {
    throw new Error(`Checkout failed: ${await response.text()}`);
  }

  const data = await response.json();
  return { url: data.checkout_url, sessionId: data.session_id };
}

test.describe('Webhook Credit Verification', () => {
  let authToken: string;
  let userId: string;

  test.beforeAll(async () => {
    // Validate required environment variables
    if (!FIREBASE_API_KEY) {
      throw new Error('FIREBASE_API_KEY environment variable is required');
    }
    if (!TEST_EMAIL || !TEST_PASSWORD) {
      throw new Error('TEST_EMAIL and TEST_PASSWORD environment variables are required');
    }

    // Get auth token
    const auth = await getFirebaseToken();
    authToken = auth.token;
    userId = auth.uid;

    // Register user in backend
    await registerUserInBackend(authToken);

    console.log(`[WEBHOOK TEST] User: ${TEST_EMAIL}`);
    console.log(`[WEBHOOK TEST] UID: ${userId}`);
  });

  test('complete Stripe checkout and verify credits added via webhook', async ({ page }) => {
    test.setTimeout(120000); // 2 minutes for full checkout flow

    // Get initial balance
    const initialBalance = await getCreditsBalance(authToken);
    console.log(`[WEBHOOK TEST] Initial balance: ${initialBalance} credits`);

    // Create checkout session for starter package (120 credits)
    const { url: checkoutUrl } = await createCheckoutSession(authToken, 'starter');
    console.log(`[WEBHOOK TEST] Checkout URL: ${checkoutUrl.substring(0, 80)}...`);

    // Navigate to Stripe Checkout
    await page.goto(checkoutUrl);
    await page.waitForLoadState('domcontentloaded');
    console.log(`[WEBHOOK TEST] Stripe checkout page loaded`);

    // Wait for Stripe's form to be ready
    await page.waitForTimeout(3000);

    // Click Card option to expand it (in case it's not already)
    const cardText = page.getByText('Card', { exact: true }).first();
    if (await cardText.isVisible({ timeout: 3000 }).catch(() => false)) {
      await cardText.click({ force: true });
      console.log(`[WEBHOOK TEST] Clicked Card option`);
      await page.waitForTimeout(2000);
    }

    // Use getByRole to find the inputs (Playwright accessibility tree)
    const cardNumberInput = page.getByRole('textbox', { name: 'Card number' });
    await cardNumberInput.waitFor({ state: 'visible', timeout: 15000 });
    await cardNumberInput.fill('4242424242424242');
    console.log(`[WEBHOOK TEST] Filled card number`);

    // Fill expiry
    const expiryInput = page.getByRole('textbox', { name: 'Expiration' });
    await expiryInput.fill('1230');
    console.log(`[WEBHOOK TEST] Filled expiry`);

    // Fill CVC
    const cvcInput = page.getByRole('textbox', { name: 'CVC' });
    await cvcInput.fill('123');
    console.log(`[WEBHOOK TEST] Filled CVC`);

    // Fill cardholder name
    const nameInput = page.getByRole('textbox', { name: 'Cardholder name' });
    if (await nameInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await nameInput.fill('Test User');
      console.log(`[WEBHOOK TEST] Filled name`);
    }

    // Fill ZIP code
    const zipInput = page.getByRole('textbox', { name: 'ZIP' });
    if (await zipInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await zipInput.fill('12345');
      console.log(`[WEBHOOK TEST] Filled ZIP`);
    }

    // Uncheck "Save my information" to skip phone requirement
    const saveInfoCheckbox = page.getByRole('checkbox', { name: /Save my information/i });
    if (await saveInfoCheckbox.isChecked().catch(() => false)) {
      await saveInfoCheckbox.uncheck();
      console.log(`[WEBHOOK TEST] Unchecked save info checkbox`);
      await page.waitForTimeout(1000);
    }

    // Submit payment - use specific testid for submit button
    const payButton = page.getByTestId('hosted-payment-submit-button');
    await payButton.click();
    console.log(`[WEBHOOK TEST] Clicked Pay button`);

    // Wait for redirect to success page
    await page.waitForURL(/.*\/payment\/success.*/, { timeout: 60000 });
    console.log(`[WEBHOOK TEST] Payment successful! Redirected to: ${page.url()}`);

    // Wait for webhook to process
    console.log(`[WEBHOOK TEST] Waiting 10 seconds for webhook to process...`);
    await page.waitForTimeout(10000);

    // Check new balance
    const newBalance = await getCreditsBalance(authToken);
    console.log(`[WEBHOOK TEST] New balance: ${newBalance} credits`);
    console.log(`[WEBHOOK TEST] Credits added: ${newBalance - initialBalance}`);

    // Verify credits were added (starter = 120 credits)
    expect(newBalance).toBe(initialBalance + 120);
    console.log(`[WEBHOOK TEST] SUCCESS! Webhook correctly added 120 credits.`);
  });
});
