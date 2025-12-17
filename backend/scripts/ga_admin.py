#!/usr/bin/env python3
"""
GA4 Admin API Script for MARKY
Allows managing conversions, audiences, and GA4 configuration.

Usage:
  python ga_admin.py list_conversions
  python ga_admin.py create_conversion <event_name>
  python ga_admin.py delete_conversion <conversion_id>
  python ga_admin.py list_audiences
  python ga_admin.py list_streams
"""

import json
import time
import sys
import jwt
import requests

# Configuration
SA_KEY_PATH = "/home/user/NuuMee02/.claude/nuumee-analytics-key.json"
PROPERTY_ID = "514341875"
API_BASE = "https://analyticsadmin.googleapis.com/v1alpha"


def get_access_token(scope: str = "https://www.googleapis.com/auth/analytics.edit") -> str:
    """Generate OAuth token with analytics scope."""
    with open(SA_KEY_PATH) as f:
        sa = json.load(f)

    now = int(time.time())
    payload = {
        'iss': sa['client_email'],
        'scope': scope,
        'aud': 'https://oauth2.googleapis.com/token',
        'iat': now,
        'exp': now + 3600
    }

    signed = jwt.encode(payload, sa['private_key'], algorithm='RS256')
    resp = requests.post('https://oauth2.googleapis.com/token', data={
        'grant_type': 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        'assertion': signed
    })

    return resp.json().get('access_token')


def api_request(method: str, endpoint: str, data: dict = None) -> dict:
    """Make authenticated API request."""
    token = get_access_token()
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }

    url = f"{API_BASE}/properties/{PROPERTY_ID}/{endpoint}"

    if method == 'GET':
        resp = requests.get(url, headers=headers)
    elif method == 'POST':
        resp = requests.post(url, headers=headers, json=data)
    elif method == 'DELETE':
        resp = requests.delete(url, headers=headers)
    else:
        raise ValueError(f"Unknown method: {method}")

    return resp.json() if resp.text else {}


def list_conversions():
    """List all conversion events."""
    result = api_request('GET', 'conversionEvents')
    conversions = result.get('conversionEvents', [])

    print(f"\n{'Event Name':<30} {'ID':<20} {'Counting Method'}")
    print("-" * 70)
    for conv in conversions:
        name = conv.get('eventName', 'N/A')
        conv_id = conv.get('name', '').split('/')[-1]
        method = conv.get('countingMethod', 'N/A')
        print(f"{name:<30} {conv_id:<20} {method}")

    return conversions


def create_conversion(event_name: str):
    """Mark an event as a conversion."""
    result = api_request('POST', 'conversionEvents', {'eventName': event_name})

    if 'error' in result:
        print(f"Error: {result['error'].get('message', 'Unknown error')}")
        return None

    print(f"✅ Created conversion: {event_name}")
    print(f"   ID: {result.get('name', '').split('/')[-1]}")
    return result


def delete_conversion(conversion_id: str):
    """Remove a conversion event."""
    result = api_request('DELETE', f'conversionEvents/{conversion_id}')

    if 'error' in result:
        print(f"Error: {result['error'].get('message', 'Unknown error')}")
        return False

    print(f"✅ Deleted conversion: {conversion_id}")
    return True


def list_audiences():
    """List all audiences."""
    result = api_request('GET', 'audiences')
    audiences = result.get('audiences', [])

    print(f"\n{'Audience Name':<40} {'ID'}")
    print("-" * 60)
    for aud in audiences:
        name = aud.get('displayName', 'N/A')
        aud_id = aud.get('name', '').split('/')[-1]
        print(f"{name:<40} {aud_id}")

    return audiences


def list_streams():
    """List all data streams."""
    result = api_request('GET', 'dataStreams')
    streams = result.get('dataStreams', [])

    print(f"\n{'Stream Name':<30} {'Type':<15} {'ID'}")
    print("-" * 65)
    for stream in streams:
        name = stream.get('displayName', 'N/A')
        stream_type = stream.get('type', 'N/A')
        stream_id = stream.get('name', '').split('/')[-1]
        print(f"{name:<30} {stream_type:<15} {stream_id}")

    return streams


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        return

    command = sys.argv[1]

    if command == 'list_conversions':
        list_conversions()
    elif command == 'create_conversion' and len(sys.argv) > 2:
        create_conversion(sys.argv[2])
    elif command == 'delete_conversion' and len(sys.argv) > 2:
        delete_conversion(sys.argv[2])
    elif command == 'list_audiences':
        list_audiences()
    elif command == 'list_streams':
        list_streams()
    else:
        print(__doc__)


if __name__ == '__main__':
    main()
