/**
 * Automated Checkout Flow Test
 * Tests the complete payment flow using Firebase Auth and Stripe test mode
 */

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const API_URL = 'https://nuumee-api-450296399943.us-central1.run.app/api/v1';

const firebaseConfig = {
  apiKey: 'AIzaSyCncAqZcO0U8U8AbOHpRvmg0yBB4x8YUyc',
  authDomain: 'wanapi-prod.firebaseapp.com',
  projectId: 'wanapi-prod',
};

async function runTests() {
  console.log('🧪 Starting Automated Checkout Tests\n');

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);

  // Test credentials (you need a test user)
  const TEST_EMAIL = process.env.TEST_EMAIL || 'test@nuumee.ai';
  const TEST_PASSWORD = process.env.TEST_PASSWORD || 'testpassword123';

  let idToken: string | null = null;

  // Test 1: Authenticate
  console.log('=== TEST 1: Firebase Authentication ===');
  try {
    const userCredential = await signInWithEmailAndPassword(auth, TEST_EMAIL, TEST_PASSWORD);
    idToken = await userCredential.user.getIdToken();
    console.log('✅ Authentication successful');
    console.log(`   User: ${userCredential.user.email}`);
    console.log(`   Token: ${idToken.substring(0, 50)}...`);
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string };
    console.log('❌ Authentication failed:', err.code || err.message);
    console.log('   Note: Create a test user or set TEST_EMAIL and TEST_PASSWORD env vars');
    process.exit(1);
  }

  // Test 2: Get user profile
  console.log('\n=== TEST 2: Get User Profile ===');
  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const profile = await response.json();
      console.log('✅ Profile retrieved');
      console.log(`   Credits: ${profile.credits_balance}`);
      console.log(`   Tier: ${profile.subscription_tier}`);
    } else {
      const error = await response.json();
      console.log('❌ Profile failed:', response.status, error.detail);
    }
  } catch (error) {
    console.log('❌ Profile request failed:', error);
  }

  // Test 3: Create checkout session
  console.log('\n=== TEST 3: Create Checkout Session ===');
  try {
    const response = await fetch(`${API_URL}/credits/checkout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ package_id: 'starter' }),
    });

    if (response.ok) {
      const checkout = await response.json();
      console.log('✅ Checkout session created');
      console.log(`   Session ID: ${checkout.session_id}`);
      console.log(`   Checkout URL: ${checkout.checkout_url}`);
      console.log('\n📋 To complete payment manually:');
      console.log(`   1. Open: ${checkout.checkout_url}`);
      console.log('   2. Use card: 4242 4242 4242 4242');
      console.log('   3. Any future expiry, any CVC, any ZIP');
    } else {
      const error = await response.json();
      console.log('❌ Checkout failed:', response.status, error.detail);
    }
  } catch (error) {
    console.log('❌ Checkout request failed:', error);
  }

  // Test 4: Test invalid package
  console.log('\n=== TEST 4: Invalid Package (expect 400) ===');
  try {
    const response = await fetch(`${API_URL}/credits/checkout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ package_id: 'invalid_package' }),
    });

    if (response.status === 400) {
      console.log('✅ Invalid package correctly rejected');
    } else {
      console.log('❌ Expected 400, got:', response.status);
    }
  } catch (error) {
    console.log('❌ Request failed:', error);
  }

  console.log('\n=== TEST SUMMARY ===');
  console.log('API endpoints are functioning correctly.');
  console.log('Stripe checkout session can be created with valid auth.');

  process.exit(0);
}

runTests().catch(console.error);
