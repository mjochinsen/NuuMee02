#!/usr/bin/env python3
"""
NuuMee Launch Cleanup Script
Cleans up test data from Firestore and GCS before going LIVE.

Usage:
    cd /home/user/NuuMee02/scripts
    GOOGLE_CLOUD_PROJECT=wanapi-prod python3 cleanup_for_launch.py

WARNING: This deletes ALL data from specified collections!
"""
import os
import sys

# Set project before imports
os.environ['GOOGLE_CLOUD_PROJECT'] = 'wanapi-prod'

from google.cloud import firestore, storage

# Collections to DELETE completely
COLLECTIONS_TO_DELETE = [
    'users',
    'jobs',
    'subscriptions',
    'referrals',
    'affiliates',
    'promo_codes',
    'payments',
    'credit_transactions',
]

# GCS buckets to clean (preserve demo/ folder)
GCS_BUCKETS_TO_CLEAN = [
    'nuumee-images',
    'nuumee-videos',
    'nuumee-outputs',
]

# Files/folders to PRESERVE
PRESERVE_PREFIXES = [
    'demo/',  # Demo files for try-it-free feature
]


def delete_collection(db, collection_name: str, batch_size: int = 100) -> int:
    """Delete all documents in a collection."""
    collection_ref = db.collection(collection_name)
    deleted = 0

    while True:
        docs = list(collection_ref.limit(batch_size).stream())
        if not docs:
            break

        batch = db.batch()
        for doc in docs:
            batch.delete(doc.reference)
            deleted += 1
        batch.commit()
        print(f"  Deleted {deleted} documents from {collection_name}...")

    return deleted


def clean_gcs_bucket(bucket_name: str, preserve_prefixes: list) -> tuple[int, int]:
    """Clean GCS bucket, preserving specified prefixes."""
    client = storage.Client()
    bucket = client.bucket(bucket_name)

    deleted = 0
    preserved = 0

    blobs = list(bucket.list_blobs())
    for blob in blobs:
        should_preserve = any(blob.name.startswith(p) for p in preserve_prefixes)
        if should_preserve:
            preserved += 1
            print(f"  PRESERVED: {blob.name}")
        else:
            blob.delete()
            deleted += 1
            if deleted % 10 == 0:
                print(f"  Deleted {deleted} files from {bucket_name}...")

    return deleted, preserved


def main():
    print("=" * 60)
    print("NuuMee Launch Cleanup Script")
    print("=" * 60)
    print("\nThis will DELETE all data from:")
    for col in COLLECTIONS_TO_DELETE:
        print(f"  - Firestore: {col}")
    print("\nThis will CLEAN (except demo/) from:")
    for bucket in GCS_BUCKETS_TO_CLEAN:
        print(f"  - GCS: {bucket}")

    print("\n" + "=" * 60)
    confirm = input("Type 'DELETE ALL' to confirm: ")
    if confirm != 'DELETE ALL':
        print("Aborted.")
        sys.exit(1)

    print("\n--- Cleaning Firestore ---")
    db = firestore.Client()

    for collection_name in COLLECTIONS_TO_DELETE:
        print(f"\nDeleting {collection_name}...")
        try:
            count = delete_collection(db, collection_name)
            print(f"  ✓ Deleted {count} documents from {collection_name}")
        except Exception as e:
            print(f"  ✗ Error deleting {collection_name}: {e}")

    print("\n--- Cleaning GCS ---")

    for bucket_name in GCS_BUCKETS_TO_CLEAN:
        print(f"\nCleaning {bucket_name}...")
        try:
            deleted, preserved = clean_gcs_bucket(bucket_name, PRESERVE_PREFIXES)
            print(f"  ✓ Deleted {deleted} files, preserved {preserved} files")
        except Exception as e:
            print(f"  ✗ Error cleaning {bucket_name}: {e}")

    print("\n" + "=" * 60)
    print("Cleanup complete!")
    print("=" * 60)


if __name__ == '__main__':
    main()
