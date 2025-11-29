#!/usr/bin/env python3
"""Create a test user in Firebase for E2E testing."""
import os
import requests

# Firebase configuration
FIREBASE_API_KEY = 'AIzaSyCncAqZcO0U8U8AbOHpRvmg0yBB4x8YUyc'

# Test user credentials
TEST_EMAIL = 'test@nuumee-test.com'
TEST_PASSWORD = 'TestPassword123!'

def create_test_user():
    """Create a test user using Firebase Auth REST API."""
    # Firebase Auth REST API endpoint for sign up
    signup_url = f'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key={FIREBASE_API_KEY}'

    response = requests.post(signup_url, json={
        'email': TEST_EMAIL,
        'password': TEST_PASSWORD,
        'returnSecureToken': True,
    })

    if response.status_code == 200:
        data = response.json()
        print(f"SUCCESS: Test user created!")
        print(f"  Email: {TEST_EMAIL}")
        print(f"  UID: {data['localId']}")
        print(f"  ID Token (first 50 chars): {data['idToken'][:50]}...")
        return data['idToken']
    elif response.status_code == 400:
        error = response.json()
        if error.get('error', {}).get('message') == 'EMAIL_EXISTS':
            print(f"Test user already exists: {TEST_EMAIL}")
            # Try to sign in instead
            return sign_in_test_user()
        else:
            print(f"ERROR: {error}")
            return None
    else:
        print(f"ERROR: {response.status_code} - {response.text}")
        return None

def sign_in_test_user():
    """Sign in existing test user to get ID token."""
    signin_url = f'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={FIREBASE_API_KEY}'

    response = requests.post(signin_url, json={
        'email': TEST_EMAIL,
        'password': TEST_PASSWORD,
        'returnSecureToken': True,
    })

    if response.status_code == 200:
        data = response.json()
        print(f"SUCCESS: Signed in as test user")
        print(f"  Email: {TEST_EMAIL}")
        print(f"  UID: {data['localId']}")
        return data['idToken']
    else:
        print(f"Sign-in ERROR: {response.status_code} - {response.text}")
        return None

def test_checkout_api(id_token):
    """Test the checkout API with the ID token."""
    API_URL = 'https://nuumee-api-450296399943.us-central1.run.app/api/v1'

    print("\n" + "="*50)
    print("TESTING CHECKOUT API")
    print("="*50)

    # First, ensure user is registered in backend
    print("\n1. Checking/registering user in backend...")
    me_response = requests.get(
        f'{API_URL}/auth/me',
        headers={'Authorization': f'Bearer {id_token}'}
    )

    if me_response.status_code == 404:
        print("   User not in backend, registering...")
        register_response = requests.post(
            f'{API_URL}/auth/register',
            headers={'Content-Type': 'application/json'},
            json={'id_token': id_token}
        )
        if register_response.status_code == 200:
            print(f"   Registered: {register_response.json()}")
        else:
            print(f"   Register failed: {register_response.status_code} - {register_response.text}")
            return
    elif me_response.status_code == 200:
        profile = me_response.json()
        print(f"   User exists: {profile.get('email')}, credits: {profile.get('credits_balance')}")
    else:
        print(f"   ERROR: {me_response.status_code} - {me_response.text}")
        return

    # Test checkout
    print("\n2. Testing checkout API...")
    checkout_response = requests.post(
        f'{API_URL}/credits/checkout',
        headers={
            'Authorization': f'Bearer {id_token}',
            'Content-Type': 'application/json'
        },
        json={'package_id': 'starter'}
    )

    print(f"   Status: {checkout_response.status_code}")
    print(f"   Response: {checkout_response.text}")

    if checkout_response.status_code == 200:
        data = checkout_response.json()
        print("\n" + "="*50)
        print("CHECKOUT SUCCESS!")
        print(f"  Stripe URL: {data['checkout_url'][:80]}...")
        print(f"  Session ID: {data['session_id']}")
        print("="*50)
    else:
        print("\n" + "="*50)
        print("CHECKOUT FAILED!")
        print(f"  Status: {checkout_response.status_code}")
        print(f"  Error: {checkout_response.text}")
        print("="*50)

if __name__ == '__main__':
    print("Creating/signing in test user...")
    token = create_test_user()

    if token:
        test_checkout_api(token)
