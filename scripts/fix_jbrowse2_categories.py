#!/usr/bin/env python3
"""
Script to fix JBrowse2 track categories.

Changes:
- "Coverage / X" -> "RNA-Seq / X" for most tracks
- "Coverage / Muzzey_2013" -> "DNA-Seq / Muzzey_2013"
- "Coverage / Lohse_2016" -> "ChIP-Seq / Lohse_2016"

Usage:
    python3 fix_jbrowse2_categories.py [--dry-run]
"""

import json
import argparse
from pathlib import Path

JBROWSE2_DIR = Path("/data/jbrowse2")
CONFIG_FILE = JBROWSE2_DIR / "config.json"

# Special category mappings (author -> new category type)
SPECIAL_CATEGORIES = {
    "Muzzey_2013": "DNA-Seq",
    "Lohse_2016": "ChIP-Seq",
}


def fix_categories(config, dry_run=False):
    """Fix track categories."""
    changes = []

    for track in config.get('tracks', []):
        category = track.get('category', [])

        # Only modify "Coverage / Author" categories
        if len(category) >= 2 and category[0] == 'Coverage':
            author = category[1]
            old_category = list(category)

            # Determine new category type
            if author in SPECIAL_CATEGORIES:
                new_type = SPECIAL_CATEGORIES[author]
            else:
                new_type = "RNA-Seq"

            # Update category
            new_category = [new_type] + category[1:]

            if old_category != new_category:
                changes.append({
                    'name': track.get('name', ''),
                    'trackId': track.get('trackId', ''),
                    'old': old_category,
                    'new': new_category,
                })

                if not dry_run:
                    track['category'] = new_category

    return changes


def main():
    parser = argparse.ArgumentParser(description='Fix JBrowse2 track categories')
    parser.add_argument('--dry-run', action='store_true',
                        help='Show what would be done without writing')
    parser.add_argument('--config', type=str, default=str(CONFIG_FILE),
                        help=f'Path to config.json (default: {CONFIG_FILE})')
    args = parser.parse_args()

    config_path = Path(args.config)

    print(f"Loading config from: {config_path}")

    with open(config_path) as f:
        config = json.load(f)

    tracks = config.get('tracks', [])
    print(f"Found {len(tracks)} tracks")

    # Fix categories
    print("\nAnalyzing categories...")
    changes = fix_categories(config, dry_run=args.dry_run)

    # Group changes by new category type
    by_type = {}
    for change in changes:
        new_type = change['new'][0]
        if new_type not in by_type:
            by_type[new_type] = []
        by_type[new_type].append(change)

    print(f"\nFound {len(changes)} tracks to update:")
    for cat_type, cat_changes in sorted(by_type.items()):
        print(f"\n  {cat_type}: {len(cat_changes)} tracks")
        # Show first 3 examples
        for c in cat_changes[:3]:
            print(f"    - {c['old']} -> {c['new']}")
        if len(cat_changes) > 3:
            print(f"    ... and {len(cat_changes) - 3} more")

    if args.dry_run:
        print("\n[DRY RUN] No changes written.")
        return 0

    # Write output
    output_path = config_path.parent / "config.json.categories_fixed"
    print(f"\nWriting to: {output_path}")
    with open(output_path, 'w') as f:
        json.dump(config, f, indent=2)

    print(f"\nDone! Apply with:")
    print(f"  cp {config_path} {config_path}.backup_categories")
    print(f"  mv {output_path} {config_path}")

    return 0


if __name__ == '__main__':
    exit(main())
