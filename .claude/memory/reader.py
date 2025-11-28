#!/usr/bin/env python3
"""
Memory Reader Utility

Reads and searches agent memory.
Used by /recall command and agents.

Usage:
    python3 reader.py --search "auth"
    python3 reader.py --category bug --recent 5
    python3 reader.py --tags firebase,auth
"""

import argparse
import json
import os
from datetime import datetime, timezone, timedelta
from pathlib import Path

MEMORY_DIR = Path(__file__).parent

CATEGORY_FILES = {
    "insight": "insights.jsonl",
    "pattern": "patterns.jsonl",
    "decision": "decisions.jsonl",
    "bug": "bugs.jsonl",
    "preference": "preferences.jsonl"
}


def load_all_memories() -> list:
    """Load all memory entries from all files."""
    all_entries = []

    for category, filename in CATEGORY_FILES.items():
        file_path = MEMORY_DIR / filename
        if file_path.exists():
            try:
                with open(file_path, 'r') as f:
                    for line in f:
                        if line.strip():
                            entry = json.loads(line)
                            if not entry.get("archived", False):
                                all_entries.append(entry)
            except (json.JSONDecodeError, IOError):
                pass

    # Sort by timestamp descending
    all_entries.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
    return all_entries


def search_memories(
    query: str = None,
    category: str = None,
    tags: list = None,
    context: str = None,
    recent: int = None
) -> list:
    """Search memories with filters."""
    entries = load_all_memories()

    # Filter by category
    if category:
        entries = [e for e in entries if e.get("category") == category]

    # Filter by context
    if context:
        entries = [e for e in entries if context.lower() in e.get("context", "").lower()]

    # Filter by tags
    if tags:
        entries = [e for e in entries if any(t in e.get("tags", []) for t in tags)]

    # Filter by search query (searches content and tags)
    if query:
        query_lower = query.lower()
        entries = [
            e for e in entries
            if query_lower in e.get("content", "").lower()
            or query_lower in " ".join(e.get("tags", [])).lower()
            or query_lower in e.get("context", "").lower()
        ]

    # Limit results
    if recent:
        entries = entries[:recent]

    return entries


def format_output(entries: list, format_type: str = "text") -> str:
    """Format entries for output."""
    if format_type == "json":
        return json.dumps(entries, indent=2)

    if not entries:
        return "No memories found."

    lines = [f"Found {len(entries)} memories:\n"]

    for entry in entries:
        timestamp = entry.get("timestamp", "")[:10]  # Just date
        category = entry.get("category", "unknown")
        content = entry.get("content", "")
        tags = ", ".join(entry.get("tags", []))
        context = entry.get("context", "")

        lines.append(f"[{timestamp}] [{category}] {content}")
        if tags:
            lines.append(f"  Tags: {tags}")
        if context:
            lines.append(f"  Context: {context}")
        lines.append("")

    return "\n".join(lines)


def get_stats() -> dict:
    """Get memory statistics."""
    entries = load_all_memories()

    stats = {
        "total": len(entries),
        "by_category": {},
        "recent_7_days": 0
    }

    from datetime import timedelta
    week_ago = (datetime.utcnow() - timedelta(days=7)).isoformat()

    for entry in entries:
        cat = entry.get("category", "unknown")
        stats["by_category"][cat] = stats["by_category"].get(cat, 0) + 1

        if entry.get("timestamp", "") > week_ago:
            stats["recent_7_days"] += 1

    return stats


def main():
    parser = argparse.ArgumentParser(description="Read agent memory")
    parser.add_argument("--search", "-s", help="Search query")
    parser.add_argument("--category", "-c", choices=list(CATEGORY_FILES.keys()),
                        help="Filter by category")
    parser.add_argument("--tags", "-t", help="Comma-separated tags to filter")
    parser.add_argument("--context", "-x", help="Filter by context")
    parser.add_argument("--recent", "-r", type=int, help="Limit to N most recent")
    parser.add_argument("--format", "-f", choices=["text", "json"], default="text",
                        help="Output format")
    parser.add_argument("--stats", action="store_true", help="Show memory statistics")

    args = parser.parse_args()

    if args.stats:
        stats = get_stats()
        print(json.dumps(stats, indent=2))
        return

    tags = [t.strip() for t in args.tags.split(",") if t.strip()] if args.tags else None

    entries = search_memories(
        query=args.search,
        category=args.category,
        tags=tags,
        context=args.context,
        recent=args.recent or 20  # Default limit
    )

    print(format_output(entries, args.format))


if __name__ == "__main__":
    main()
