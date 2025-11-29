"""Test full checkout flow end-to-end"""
import requests
import firebase_admin
from firebase_admin import credentials, auth

# Initialize Firebase Admin
if not firebase_admin._apps:
    cred = credentials.ApplicationDefault()
    firebase_admin.initialize_app(cred, {'projectId': 'wanapi-prod'})

# Test user UID
TEST_UID = 'TYyXYnHonVhg2Lu0BTxWd4txvuQ2'

# Create custom token and exchange for ID token
print("1. Creating auth token for test user...")
custom_token = auth.create_custom_token(TEST_UID)
print(f"   Custom token created: {custom_token[:50]}...")

# Exchange custom token for ID token via REST API
print("\n2. Exchanging for ID token...")
exchange_url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=AIzaSyCncAqZcO0U8U8AbOHpRvmg0yBB4x8YUyc"
response = requests.post(exchange_url, json={
    "token": custom_token.decode() if isinstance(custom_token, bytes) else custom_token,
    "returnSecureToken": True
})

if response.status_code != 200:
    print(f"   ERROR: {response.status_code} - {response.text}")
    exit(1)

id_token = response.json()['idToken']
print(f"   ID token obtained: {id_token[:50]}...")

# Test checkout endpoint
print("\n3. Testing checkout endpoint...")
API_URL = "https://nuumee-api-450296399943.us-central1.run.app"

checkout_response = requests.post(
    f"{API_URL}/api/v1/credits/checkout",
    headers={
        "Authorization": f"Bearer {id_token}",
        "Content-Type": "application/json"
    },
    json={"package_id": "starter"}
)

print(f"   Status: {checkout_response.status_code}")
if checkout_response.status_code == 200:
    data = checkout_response.json()
    print(f"   SUCCESS! Checkout URL: {data.get('checkout_url', 'N/A')[:80]}...")
    print(f"\n   STRIPE CHECKOUT URL (click to test):")
    print(f"   {data.get('checkout_url', 'N/A')}")
else:
    print(f"   ERROR: {checkout_response.text}")
