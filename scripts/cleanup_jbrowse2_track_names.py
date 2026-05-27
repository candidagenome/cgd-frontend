#!/usr/bin/env python3
"""
Script to clean up JBrowse2 track names by removing accession numbers (SRR/ERR).

This script:
1. Loads JBrowse2 config.json
2. Finds tracks with SRR/ERR numbers in their display names
3. Removes the accession numbers while preserving other info
4. Optionally updates the defaultSession for C. albicans

Usage:
    python3 cleanup_jbrowse2_track_names.py [--dry-run] [--set-defaults]

Run on the server where JBrowse2 is installed.
"""

import json
import re
import argparse
from pathlib import Path
from copy import deepcopy

# Paths - adjust for your server
JBROWSE2_DIR = Path("/data/jbrowse2")
CONFIG_FILE = JBROWSE2_DIR / "config.json"
OUTPUT_FILE = JBROWSE2_DIR / "config.json.cleaned"

# Pattern to match SRR/ERR accession numbers
# Matches: SRR12345678, ERR12345678, Srr12345678, etc.
ACCESSION_PATTERN = re.compile(r'\s*[SsEe][Rr][Rr]\d+\s*', re.IGNORECASE)

# Pattern for accession in parentheses at end: (SRR12345678)
ACCESSION_PAREN_PATTERN = re.compile(r'\s*\([SsEe][Rr][Rr]\d+\)\s*$', re.IGNORECASE)

# Default tracks for C. albicans SC5314 (HapA)
ALBICANS_DEFAULT_TRACKS = [
    "TranscribedFeatures",  # Gene Features
    "C_albicans_SC5314_lncRNA.sorted.bed",  # lncRNA
]


def load_config():
    """Load existing JBrowse2 config."""
    with open(CONFIG_FILE) as f:
        return json.load(f)


def clean_track_name(name, counter=None):
    """
    Clean accession numbers from track name.

    If counter is provided, it will be used to distinguish tracks that would
    otherwise have identical names after cleaning.

    Examples:
        "Rai 2024 ERR8278346 Coverage (HapA)" -> "Rai 2024 Sample 1 Coverage (HapA)"
        "Iracane 2024 SRR27912204 Coverage (HapA)" -> "Iracane 2024 Coverage (HapA)"
        "Singh Babakh 2021 SRR13833829 Coverage" -> "Singh Babakh 2021 Coverage"
        "Pelletier et al (UACa11; ...) (SRR24915354)" -> "Pelletier et al (UACa11; ...)"
        "Iracane 2024 Longrna Srr27912204 Coverage" -> "Iracane 2024 Longrna Coverage"
    """
    original = name

    # First, remove accession numbers in parentheses at the end
    name = ACCESSION_PAREN_PATTERN.sub('', name)

    # Then remove standalone accession numbers
    name = ACCESSION_PATTERN.sub(' ', name)

    # Clean up multiple spaces
    name = re.sub(r'\s+', ' ', name).strip()

    # If counter provided and name would be duplicate, add sample number
    if counter is not None:
        # Insert "Sample N" before "Coverage" or at end
        if ' Coverage' in name:
            name = name.replace(' Coverage', f' Sample {counter} Coverage', 1)
        else:
            name = f"{name} Sample {counter}"

    return name


def get_base_name(name):
    """Get base name without accession for grouping duplicates."""
    # Remove accession in parentheses at end
    name = ACCESSION_PAREN_PATTERN.sub('', name)
    # Remove standalone accession
    name = ACCESSION_PATTERN.sub(' ', name)
    # Clean up spaces
    name = re.sub(r'\s+', ' ', name).strip()
    return name


def get_tracks_needing_cleanup(config):
    """Find all tracks that have accession numbers in their names."""
    # First pass: group tracks by their base name to detect duplicates
    base_name_groups = {}
    for track in config.get('tracks', []):
        name = track.get('name', '')
        if ACCESSION_PATTERN.search(name) or ACCESSION_PAREN_PATTERN.search(name):
            base = get_base_name(name)
            if base not in base_name_groups:
                base_name_groups[base] = []
            base_name_groups[base].append(track)

    # Second pass: build result list with proper cleaned names
    tracks_to_clean = []
    for base_name, tracks_group in base_name_groups.items():
        tracks_group.sort(key=lambda t: t.get('trackId', ''))

        for i, track in enumerate(tracks_group):
            name = track.get('name', '')
            if len(tracks_group) == 1:
                cleaned = clean_track_name(name)
            else:
                cleaned = clean_track_name(name, counter=i + 1)

            tracks_to_clean.append({
                'trackId': track.get('trackId', ''),
                'original_name': name,
                'cleaned_name': cleaned,
                'category': track.get('category', []),
                'assemblies': track.get('assemblyNames', []),
            })

    return tracks_to_clean


def update_track_names(config):
    """Update all track names to remove accession numbers."""
    updated_count = 0

    # First pass: group tracks by their base name to detect duplicates
    base_name_groups = {}
    for track in config.get('tracks', []):
        name = track.get('name', '')
        if ACCESSION_PATTERN.search(name) or ACCESSION_PAREN_PATTERN.search(name):
            base = get_base_name(name)
            if base not in base_name_groups:
                base_name_groups[base] = []
            base_name_groups[base].append(track)

    # Second pass: update names, adding sample numbers for duplicates
    for base_name, tracks_group in base_name_groups.items():
        if len(tracks_group) == 1:
            # No duplicates, just clean the name
            track = tracks_group[0]
            cleaned = clean_track_name(track['name'])
            if cleaned != track['name']:
                track['name'] = cleaned
                updated_count += 1
        else:
            # Multiple tracks would have same name - add sample numbers
            # Sort by trackId to ensure consistent numbering
            tracks_group.sort(key=lambda t: t.get('trackId', ''))
            for i, track in enumerate(tracks_group, 1):
                cleaned = clean_track_name(track['name'], counter=i)
                if cleaned != track['name']:
                    track['name'] = cleaned
                    updated_count += 1

    return updated_count


def setup_default_session(config, assembly="C_albicans_SC5314"):
    """
    Set up default session with recommended tracks for an assembly.

    This configures which tracks are visible by default when users load JBrowse.
    """
    # Find tracks for this assembly
    assembly_tracks = []
    for track in config.get('tracks', []):
        if assembly in track.get('assemblyNames', []):
            assembly_tracks.append(track)

    # Build default session with key tracks
    default_track_configs = []

    for track_id in ALBICANS_DEFAULT_TRACKS:
        # Find the track
        track = next((t for t in assembly_tracks if t.get('trackId') == track_id), None)
        if track:
            default_track_configs.append({
                "type": track.get('type', 'FeatureTrack'),
                "configuration": track_id,
            })

    # Create default session structure
    default_session = {
        "name": "CGD JBrowse 2",
        "view": {
            "id": "linearGenomeView",
            "type": "LinearGenomeView",
            "tracks": default_track_configs,
        }
    }

    return default_session


def main():
    parser = argparse.ArgumentParser(description='Clean up JBrowse2 track names')
    parser.add_argument('--dry-run', action='store_true',
                        help='Show what would be done without writing')
    parser.add_argument('--set-defaults', action='store_true',
                        help='Also configure default session for C. albicans')
    parser.add_argument('--config', type=str, default=str(CONFIG_FILE),
                        help=f'Path to config.json (default: {CONFIG_FILE})')
    parser.add_argument('--output', type=str, default=str(OUTPUT_FILE),
                        help=f'Output path (default: {OUTPUT_FILE})')
    args = parser.parse_args()

    config_path = Path(args.config)
    output_path = Path(args.output)

    print(f"Loading config from: {config_path}")

    if not config_path.exists():
        print(f"Error: Config file not found: {config_path}")
        return 1

    with open(config_path) as f:
        config = json.load(f)

    tracks = config.get('tracks', [])
    print(f"Found {len(tracks)} tracks")

    # Find tracks that need cleanup
    print("\nAnalyzing track names...")
    tracks_to_clean = get_tracks_needing_cleanup(config)

    print(f"\nFound {len(tracks_to_clean)} tracks with accession numbers in names:")

    # Group by category/author
    by_category = {}
    for t in tracks_to_clean:
        cat = t['category'][1] if len(t['category']) > 1 else 'Unknown'
        if cat not in by_category:
            by_category[cat] = []
        by_category[cat].append(t)

    for cat, cat_tracks in sorted(by_category.items()):
        print(f"\n  {cat}: {len(cat_tracks)} tracks")
        # Show first 2 examples
        for t in cat_tracks[:2]:
            print(f"    - {t['original_name']}")
            print(f"      -> {t['cleaned_name']}")
        if len(cat_tracks) > 2:
            print(f"    ... and {len(cat_tracks) - 2} more")

    if args.dry_run:
        print("\n[DRY RUN] No changes written.")
        return 0

    # Actually update the config
    print("\nUpdating track names...")
    updated_count = update_track_names(config)
    print(f"Updated {updated_count} track names")

    # Optionally set up default session
    if args.set_defaults:
        print("\nSetting up default session for C. albicans...")
        config['defaultSession'] = setup_default_session(config)
        print("Default session configured with Gene Features and lncRNA tracks")

    # Write output
    print(f"\nWriting to: {output_path}")
    with open(output_path, 'w') as f:
        json.dump(config, f, indent=2)

    print(f"\nDone! Review {output_path} and apply with:")
    print(f"  cp {config_path} {config_path}.backup")
    print(f"  mv {output_path} {config_path}")

    return 0


if __name__ == '__main__':
    exit(main())
