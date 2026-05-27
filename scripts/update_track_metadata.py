#!/usr/bin/env python3
"""
Script to update JBrowse2 track names with proper metadata from SRA/ENA.

This script updates track names for:
- Rai_2024 (ERR8278346-ERR8278363)
- Singh-Babakh_2021 (SRR13833829-SRR13833836)
- Iracane_2024 longRNA (SRR27912204, etc.)

Usage:
    python3 update_track_metadata.py [--dry-run]
"""

import json
import re
import argparse
from pathlib import Path

JBROWSE2_DIR = Path("/data/jbrowse2")
CONFIG_FILE = JBROWSE2_DIR / "config.json"

# Rai_2024 metadata (ERR accessions -> sample info)
RAI_2024_METADATA = {
    "ERR8278346": ("CEC4665", "rep 1"),  # WT control
    "ERR8278347": ("CEC4665", "rep 2"),
    "ERR8278348": ("CEC4665", "rep 3"),
    "ERR8278349": ("SN152", "rep 1"),  # Parental strain
    "ERR8278350": ("SN152", "rep 2"),
    "ERR8278351": ("SN152", "rep 3"),
    "ERR8278352": ("TetO-ZCF15", "rep 1"),  # ZCF15 overexpression
    "ERR8278353": ("TetO-ZCF15", "rep 2"),
    "ERR8278354": ("TetO-ZCF15", "rep 3"),
    "ERR8278355": ("TetO-ZCF26", "rep 1"),  # ZCF26 overexpression
    "ERR8278356": ("TetO-ZCF26", "rep 2"),
    "ERR8278357": ("TetO-ZCF26", "rep 3"),
    "ERR8278358": ("zcf15 null", "rep 1"),  # ZCF15 knockout
    "ERR8278359": ("zcf15 null", "rep 2"),
    "ERR8278360": ("zcf15 null", "rep 3"),
    "ERR8278361": ("zcf26 null", "rep 1"),  # ZCF26 knockout
    "ERR8278362": ("zcf26 null", "rep 2"),
    "ERR8278363": ("zcf26 null", "rep 3"),
}

# Singh-Babakh_2021 metadata (SRR accessions -> sample info)
SINGH_BABAKH_METADATA = {
    "SRR13833829": ("TYE7-OE", "rep A"),  # TYE7 overexpression
    "SRR13833830": ("TYE7-OE", "rep B"),
    "SRR13833831": ("GAL4-OE", "rep A"),  # GAL4 overexpression
    "SRR13833832": ("GAL4-OE", "rep B"),
    "SRR13833833": ("GLK1-OE", "rep A"),  # GLK1 overexpression
    "SRR13833834": ("GLK1-OE", "rep B"),
    "SRR13833835": ("empty vector", "rep A"),  # Control
    "SRR13833836": ("empty vector", "rep B"),
}

# Iracane_2024 longRNA metadata
IRACANE_LONGRNA_METADATA = {
    "SRR27912204": ("AGO1-K361E", "rep 1"),
    "SRR27912324": ("AGO1-K361E", "rep 2"),
    "SRR27912626": ("AGO1-K361E", "rep 3"),
    "SRR27926874": ("ago1 mutant", "rep 4"),
    "SRR27927865": ("ago1 mutant", "rep 5"),
    "SRR27928088": ("WT", "rep 4"),
    "SRR27928186": ("WT", "rep 5"),
    "SRR27928389": ("WT", "rep 6"),
    "SRR27942832": ("WT", "rep 1"),
    "SRR27959444": ("ago1 mutant", "rep 3"),
    "SRR27959445": ("ago1 mutant", "rep 2"),
    "SRR27959447": ("WT", "rep 2"),
    "SRR27959451": ("ago1 mutant", "rep 1"),
    "SRR27959457": ("WT", "rep 3"),
}


def find_accession_in_trackid(track_id):
    """Extract SRR/ERR accession from track ID."""
    # Match patterns like ERR8278346, SRR13833829, etc.
    match = re.search(r'([SE]RR\d+)', track_id, re.IGNORECASE)
    if match:
        return match.group(1).upper()
    return None


def get_haplotype_from_name(name):
    """Extract haplotype (HapA/HapB) from track name."""
    if 'HapA' in name or 'hap A' in name.lower():
        return 'hap A'
    elif 'HapB' in name or 'hap B' in name.lower():
        return 'hap B'
    return None


def update_track_name(track, metadata_map, author_prefix):
    """
    Update a single track's name using metadata.

    Returns (old_name, new_name) or None if no update needed.
    """
    track_id = track.get('trackId', '')
    old_name = track.get('name', '')

    # Find accession in track ID
    accession = find_accession_in_trackid(track_id)
    if not accession or accession not in metadata_map:
        return None

    # Get metadata
    condition, replicate = metadata_map[accession]

    # Get haplotype
    haplotype = get_haplotype_from_name(old_name)

    # Build new name
    # Format: "Author et al condition (replicate; hap X)"
    if haplotype:
        new_name = f"{author_prefix} {condition} ({replicate}; {haplotype})"
    else:
        new_name = f"{author_prefix} {condition} ({replicate})"

    # Add "Coverage" suffix if original had it
    if 'Coverage' in old_name and 'Coverage' not in new_name:
        new_name += " Coverage"

    # Add "Longrna" if original had it
    if 'Longrna' in old_name or 'longRNA' in old_name.lower():
        # Insert before condition
        new_name = new_name.replace(author_prefix, f"{author_prefix} Longrna")

    if old_name != new_name:
        return (old_name, new_name)
    return None


def update_all_tracks(config, dry_run=False):
    """Update all tracks with proper metadata."""
    updates = []

    for track in config.get('tracks', []):
        category = track.get('category', [])
        track_id = track.get('trackId', '')

        # Check which dataset this track belongs to
        update = None

        if 'Rai_2024' in str(category) or 'Rai_2024' in track_id:
            update = update_track_name(track, RAI_2024_METADATA, "Rai et al")
        elif 'Singh-Babakh_2021' in str(category) or 'Singh-Babakh_2021' in track_id:
            update = update_track_name(track, SINGH_BABAKH_METADATA, "Singh Babakh et al")
        elif 'Iracane_2024' in str(category) or 'Iracane_2024' in track_id:
            update = update_track_name(track, IRACANE_LONGRNA_METADATA, "Iracane et al")

        if update:
            old_name, new_name = update
            updates.append({
                'trackId': track_id,
                'old_name': old_name,
                'new_name': new_name,
                'category': category,
            })
            if not dry_run:
                track['name'] = new_name

    return updates


def main():
    parser = argparse.ArgumentParser(description='Update JBrowse2 track names with SRA metadata')
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

    # Update tracks
    print("\nUpdating track names with SRA metadata...")
    updates = update_all_tracks(config, dry_run=args.dry_run)

    # Group by dataset
    by_dataset = {}
    for u in updates:
        cat = u['category']
        dataset = cat[1] if len(cat) > 1 else 'Unknown'
        if dataset not in by_dataset:
            by_dataset[dataset] = []
        by_dataset[dataset].append(u)

    print(f"\nFound {len(updates)} tracks to update:")
    for dataset, dataset_updates in sorted(by_dataset.items()):
        print(f"\n  {dataset}: {len(dataset_updates)} tracks")
        for u in dataset_updates[:5]:
            print(f"    - {u['old_name']}")
            print(f"      -> {u['new_name']}")
        if len(dataset_updates) > 5:
            print(f"    ... and {len(dataset_updates) - 5} more")

    if args.dry_run:
        print("\n[DRY RUN] No changes written.")
        return 0

    # Write output
    output_path = config_path.parent / "config.json.metadata_updated"
    print(f"\nWriting to: {output_path}")
    with open(output_path, 'w') as f:
        json.dump(config, f, indent=2)

    print(f"\nDone! Apply with:")
    print(f"  cp {config_path} {config_path}.backup_metadata")
    print(f"  mv {output_path} {config_path}")

    return 0


if __name__ == '__main__':
    exit(main())
