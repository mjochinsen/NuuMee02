#!/usr/bin/env python3
"""
Memory Writer Utility

Writes entries to the agent memory system.
Used by hooks and agents to persist insights.

Usage:
    python3 writer.py --category insight --content "Firebase returns 403 for expired tokens" --tags auth,firebase
"""

import argparse
import hashlib
import json
import os
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path

MEMORY_DIR = Path(__file__).parent
MAX_CONTENT_LENGTH = 500

CATEGORY_FILES = {
    "insight": "insights.jsonl",
    "pattern": "patterns.jsonl",
    "decision": "decisions.jsonl",
    "bug": "bugs.jsonl",
    "preference": "preferences.jsonl"
}


def compute_hash(content: str) -> str:
    """Compute SHA-256 hash of content for deduplication."""
    return hashlib.sha256(content.encode()).hexdigest()


def is_duplicate(file_path: Path, content_hash: str) -> bool:
    """Check if content already exists in memory."""
    if not file_path.exists():
        return False

    try:
        with open(file_path, 'r') as f:
            for line in f:
                if line.strip():
                    entry = json.loads(line)
                    if entry.get("hash") == content_hash:
                        return True
    except (json.JSONDecodeError, IOError):
        pass

    return False


def write_memory(
    category: str,
    content: str,
    context: str = "",
    source: str = "",
    tags: list = None
) -> dict:
    """Write a memory entry to the appropriate file."""

    if category not in CATEGORY_FILES:
        return {"error": f"Invalid category: {category}"}

    # Enforce max length
    if len(content) > MAX_CONTENT_LENGTH:
        content = content[:MAX_CONTENT_LENGTH - 3] + "..."

    content_hash = compute_hash(content)
    file_path = MEMORY_DIR / CATEGORY_FILES[category]

    # Check for duplicates
    if is_duplicate(file_path, content_hash):
        return {"status": "skipped", "reason": "duplicate"}

    entry = {
        "id": str(uuid.uuid4()),
        "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "category": category,
        "context": context or "",
        "content": content,
        "source": source or "unknown",
        "tags": tags or [],
        "hash": content_hash,
        "score": 5,  # Default score
        "archived": False
    }

    # Append to file
    try:
        with open(file_path, 'a') as f:
            f.write(json.dumps(entry) + "\n")
        return {"status": "written", "id": entry["id"], "file": str(file_path)}
    except IOError as e:
        return {"error": str(e)}


def main():
    parser = argparse.ArgumentParser(description="Write to agent memory")
    parser.add_argument("--category", "-c", required=True,
                        choices=list(CATEGORY_FILES.keys()),
                        help="Memory category")
    parser.add_argument("--content", "-m", required=True,
                        help="Memory content (max 500 chars)")
    parser.add_argument("--context", "-x", default="",
                        help="Project context (phase, feature)")
    parser.add_argument("--source", "-s", default="",
                        help="Source session or agent")
    parser.add_argument("--tags", "-t", default="",
                        help="Comma-separated tags")

    args = parser.parse_args()

    tags = [t.strip() for t in args.tags.split(",") if t.strip()] if args.tags else []

    result = write_memory(
        category=args.category,
        content=args.content,
        context=args.context,
        source=args.source,
        tags=tags
    )

    print(json.dumps(result))


if __name__ == "__main__":
    main()
