#!/usr/bin/env python3
from google.cloud import firestore
import sys

db = firestore.Client(project='wanapi-prod')
user_id = 'TYyXYnHonVhg2Lu0BTxWd4txvuQ2'

user_ref = db.collection('users').document(user_id)
user_doc = user_ref.get()

if user_doc.exists:
    user_data = user_doc.to_dict()
    credits = user_data.get('credits_balance', 0)
    print(f'Credits: {credits}')
    sys.exit(0 if credits == 145 else 1)
else:
    print('User not found')
    sys.exit(1)
