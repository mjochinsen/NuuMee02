#!/usr/bin/env python3
"""
Backfill script to add short_id to existing jobs that don't have one.

Run with:
  GOOGLE_CLOUD_PROJECT=wanapi-prod python3 backend/scripts/backfill_short_ids.py

Or from the backend directory:
  cd backend && GOOGLE_CLOUD_PROJECT=wanapi-prod python3 scripts/backfill_short_ids.py
"""
import os
import secrets
import sys

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from google.cloud import firestore


def generate_short_id() -> str:
    """Generate a short ID for public video URLs (12 chars)."""
    return secrets.token_hex(6)


def backfill_short_ids(dry_run: bool = True):
    """
    Add short_id to all jobs that don't have one.

    Args:
        dry_run: If True, only print what would be updated without making changes.
    """
    db = firestore.Client()

    # Get all jobs
    jobs_ref = db.collection("jobs")
    all_jobs = list(jobs_ref.stream())

    print(f"Found {len(all_jobs)} total jobs")

    jobs_to_update = []
    for job_doc in all_jobs:
        data = job_doc.to_dict()
        if not data.get("short_id"):
            jobs_to_update.append(job_doc)

    print(f"Found {len(jobs_to_update)} jobs without short_id")

    if not jobs_to_update:
        print("Nothing to update!")
        return

    if dry_run:
        print("\n[DRY RUN] Would update the following jobs:")
        for job_doc in jobs_to_update[:10]:  # Show first 10
            data = job_doc.to_dict()
            print(f"  - {job_doc.id} (user: {data.get('user_id', 'unknown')[:20]}...)")
        if len(jobs_to_update) > 10:
            print(f"  ... and {len(jobs_to_update) - 10} more")
        print("\nRun with --execute to apply changes")
        return

    # Execute updates
    print("\nUpdating jobs...")
    success_count = 0
    error_count = 0

    for job_doc in jobs_to_update:
        try:
            short_id = generate_short_id()
            job_doc.reference.update({
                "short_id": short_id,
                "view_count": 0,  # Initialize view count if not present
            })
            print(f"  Updated {job_doc.id} with short_id={short_id}")
            success_count += 1
        except Exception as e:
            print(f"  ERROR updating {job_doc.id}: {e}")
            error_count += 1

    print(f"\nDone! Updated {success_count} jobs, {error_count} errors")


if __name__ == "__main__":
    dry_run = "--execute" not in sys.argv

    if dry_run:
        print("=" * 60)
        print("DRY RUN MODE - No changes will be made")
        print("=" * 60)
    else:
        print("=" * 60)
        print("EXECUTE MODE - Changes will be applied!")
        print("=" * 60)
        response = input("Are you sure you want to continue? (yes/no): ")
        if response.lower() != "yes":
            print("Aborted.")
            sys.exit(0)

    backfill_short_ids(dry_run=dry_run)
