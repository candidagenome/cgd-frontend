#!/usr/bin/env python3
"""
Script to configure JBrowse2 default session and track visibility.

This script sets up which tracks are visible by default when users load JBrowse2.
The curator requested that certain tracks (like Mutagenesis/Segal Transposon)
should NOT be shown by default.

Usage:
    python3 set_jbrowse2_defaults.py [--dry-run]

Run on the server where JBrowse2 is installed.
"""

import json
import argparse
from pathlib import Path

# Paths
JBROWSE2_DIR = Path("/data/jbrowse2")
CONFIG_FILE = JBROWSE2_DIR / "config.json"
OUTPUT_FILE = JBROWSE2_DIR / "config.json.defaults"

# Default tracks for each assembly
# These are the tracks that should be visible by default
DEFAULT_TRACKS = {
    "C_albicans_SC5314": [
        # Core annotation tracks
        "TranscribedFeatures",  # Gene Features
        "C_albicans_SC5314_lncRNA.sorted.bed",  # lncRNA
        # Conservation tracks (HapA only by default)
        # Add more as needed
    ],
    "C_auris_B8441": [
        "TranscribedFeatures_auris",
    ],
    "C_dubliniensis_CD36": [
        "TranscribedFeatures_dubliniensis",
    ],
    "C_glabrata_CBS138": [
        "TranscribedFeatures_glabrata",
    ],
    "C_parapsilosis_CDC317": [
        "TranscribedFeatures_parapsilosis",
    ],
}

# Tracks that should NEVER be shown by default
# (even if they were previously defaulted)
EXCLUDE_FROM_DEFAULTS = [
    "Segal",  # Mutagenesis tracks
    "Transposon",
    "WO1",  # Variant tracks
]


def load_config(config_path):
    """Load existing JBrowse2 config."""
    with open(config_path) as f:
        return json.load(f)


def should_exclude(track):
    """Check if track should be excluded from defaults."""
    name = track.get('name', '')
    track_id = track.get('trackId', '')

    for pattern in EXCLUDE_FROM_DEFAULTS:
        if pattern.lower() in name.lower() or pattern.lower() in track_id.lower():
            return True
    return False


def find_track_id(config, assembly, partial_id):
    """Find a track ID that matches the partial ID for an assembly."""
    for track in config.get('tracks', []):
        if assembly in track.get('assemblyNames', []):
            track_id = track.get('trackId', '')
            if partial_id in track_id or track_id == partial_id:
                return track_id
    return None


def build_default_session(config, primary_assembly="C_albicans_SC5314"):
    """
    Build a default session configuration.

    JBrowse2 defaultSession can specify:
    - The initial view/assembly
    - Which tracks are displayed by default
    """
    # Find default tracks for the primary assembly
    default_track_ids = DEFAULT_TRACKS.get(primary_assembly, [])

    # Build track display configurations
    track_displays = []
    for track_id_pattern in default_track_ids:
        # Try to find matching track
        actual_id = find_track_id(config, primary_assembly, track_id_pattern)
        if actual_id:
            # Find the track to get its type
            track = next((t for t in config['tracks'] if t.get('trackId') == actual_id), None)
            if track:
                track_displays.append({
                    "type": f"{track.get('type', 'FeatureTrack')}Display",
                    "configuration": f"{actual_id}-{track.get('type', 'FeatureTrack')}Display",
                })

    # Build the default session
    default_session = {
        "name": "CGD JBrowse 2",
        "views": [
            {
                "id": "linearGenomeView-1",
                "type": "LinearGenomeView",
                "displayedRegions": [],  # Will use assembly default
                "tracks": track_displays,
            }
        ],
    }

    return default_session


def analyze_current_defaults(config):
    """Analyze what tracks might currently be showing as defaults."""
    current_session = config.get('defaultSession', {})

    print("\nCurrent defaultSession:")
    print(json.dumps(current_session, indent=2))

    # Check for any tracks that might be set to show by default via other means
    tracks_with_default_on = []
    for track in config.get('tracks', []):
        # Check if track has any default display settings
        displays = track.get('displays', [])
        for display in displays:
            if display.get('defaultRendering'):
                tracks_with_default_on.append(track.get('trackId'))

    if tracks_with_default_on:
        print(f"\nTracks with default display settings: {len(tracks_with_default_on)}")
        for tid in tracks_with_default_on[:5]:
            print(f"  - {tid}")


def main():
    parser = argparse.ArgumentParser(description='Configure JBrowse2 default session')
    parser.add_argument('--dry-run', action='store_true',
                        help='Show what would be done without writing')
    parser.add_argument('--analyze', action='store_true',
                        help='Just analyze current defaults')
    parser.add_argument('--config', type=str, default=str(CONFIG_FILE),
                        help=f'Path to config.json (default: {CONFIG_FILE})')
    parser.add_argument('--output', type=str, default=str(OUTPUT_FILE),
                        help=f'Output path (default: {OUTPUT_FILE})')
    parser.add_argument('--assembly', type=str, default="C_albicans_SC5314",
                        help='Primary assembly for default view')
    args = parser.parse_args()

    config_path = Path(args.config)
    output_path = Path(args.output)

    print(f"Loading config from: {config_path}")

    if not config_path.exists():
        print(f"Error: Config file not found: {config_path}")
        return 1

    config = load_config(config_path)
    tracks = config.get('tracks', [])
    print(f"Found {len(tracks)} tracks")

    if args.analyze:
        analyze_current_defaults(config)
        return 0

    # Build new default session
    print(f"\nBuilding default session for {args.assembly}...")
    new_session = build_default_session(config, args.assembly)

    print("\nNew defaultSession:")
    print(json.dumps(new_session, indent=2))

    # Check for tracks that should be excluded
    print("\nTracks that will be excluded from defaults:")
    excluded = [t for t in tracks if should_exclude(t)]
    for t in excluded[:10]:
        print(f"  - {t.get('name', t.get('trackId'))}")
    if len(excluded) > 10:
        print(f"  ... and {len(excluded) - 10} more")

    if args.dry_run:
        print("\n[DRY RUN] No changes written.")
        return 0

    # Update config
    config['defaultSession'] = new_session

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
