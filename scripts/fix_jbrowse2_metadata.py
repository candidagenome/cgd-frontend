#!/usr/bin/env python3
"""
Script to fix JBrowse2 track metadata using old JBrowse1 tracks.conf and metadata CSVs.

This script:
1. Parses old JBrowse1 tracks.conf to extract track_label -> SRR mapping
2. Reads metadata from old JBrowse1 CSV files
3. Updates JBrowse2 config.json with proper names and metadata

Usage:
    python3 fix_jbrowse2_metadata.py [--dry-run]
"""

import json
import csv
import os
import re
import argparse
from pathlib import Path
from collections import defaultdict

# Paths
JBROWSE2_DIR = Path("/data/jbrowse2")
JBROWSE1_DIR = Path("/data/jbrowse")
CONFIG_FILE = JBROWSE2_DIR / "config.json"
OUTPUT_FILE = JBROWSE2_DIR / "config.json.new"

# Species to process
SPECIES_LIST = [
    "C_albicans_SC5314",
    "C_auris_B8441",
    "C_dubliniensis_CD36",
    "C_glabrata_CBS138",
    "C_parapsilosis_CDC317",
]

# Category normalizations to ensure consistent Author_Year format
CATEGORY_NORMALIZATIONS = {
    # Glazier
    "Glazier": "Glazier_2023",
    # Jenull - different pubmed IDs should be unified
    "Jenull_et_al._4701": "Jenull_2021",
    "Jenull_et_al._1091": "Jenull_2021",
    # Biermann variations
    "Biermann_et_al._0390": "Biermann_2022",
    "Biermann_et_al._1122": "Biermann_2022",
    "Biermann_et_al_2022": "Biermann_2022",
    # Chow
    "Chow_et_al._1091": "Chow_2023",
    "Chow_et_al_2023": "Chow_2023",
    # Shivarathri
    "Shivarathri": "Shivarathri_2019",
    "Shivarathri_et_al.": "Shivarathri_2019",
    # Pelletier
    "Pelletier": "Pelletier_2024",
    # Other et_al variations
    "Balla_et_al.": "Balla_2020",
    "Jakab_et_al.": "Jakab_2021",
    "Simm_et_al.": "Simm_2019",
    "Bhakt_et_al.": "Bhakt_2022",
    # Authors without year
    "Grumaz": "Grumaz_2013",
    "Kumar": "Kumar_2022",
    "Zhang": "Zhang_2015",
    "Ni": "Ni_2009",
    "Vu": "Vu_2023",
    "Guida": "Guida_2011",
    "Connolly": "Connolly_2013",
    "Linde_&_Duggan": "Linde_2015",
    # Invalid categories
    "A": "Unknown",
    "WO": "Unknown",
    "Gene Expression": None,  # Will be replaced with author-based category
}


def normalize_category(category):
    """Normalize category name to consistent Author_Year format."""
    if category in CATEGORY_NORMALIZATIONS:
        return CATEGORY_NORMALIZATIONS[category]
    return category


def load_config():
    """Load existing JBrowse2 config."""
    with open(CONFIG_FILE) as f:
        return json.load(f)


def parse_tracks_conf(species):
    """Parse JBrowse1 tracks.conf to extract track info with SRR mapping."""
    conf_path = JBROWSE1_DIR / species / "tracks.conf"
    tracks = {}

    if not conf_path.exists():
        print(f"  Warning: {conf_path} not found")
        return tracks

    current_track = None
    current_data = {}

    with open(conf_path, 'r') as f:
        for line in f:
            line = line.strip()

            # Skip comments and empty lines
            if not line or line.startswith('#'):
                continue

            # New track section
            match = re.match(r'\[tracks\.(\w+)\]', line)
            if match:
                # Save previous track
                if current_track and current_data:
                    tracks[current_track] = current_data
                current_track = match.group(1)
                current_data = {'label': current_track}
                continue

            # Track properties
            if current_track and '=' in line:
                key, value = line.split('=', 1)
                key = key.strip()
                value = value.strip()
                current_data[key] = value

        # Save last track
        if current_track and current_data:
            tracks[current_track] = current_data

    return tracks


def extract_srr_from_url(url):
    """Extract SRR number from urlTemplate."""
    match = re.search(r'(SRR\d+)', url)
    return match.group(1) if match else None


def load_metadata_csv(species):
    """Load metadata from JBrowse1 CSV file for a species."""
    csv_path = JBROWSE1_DIR / species / f"{species}_MetaData.csv"
    metadata = {}

    if not csv_path.exists():
        print(f"  Warning: {csv_path} not found")
        return metadata

    try:
        with open(csv_path, encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            for row in reader:
                label = row.get('label', '').strip()
                if label:
                    metadata[label] = {
                        'key': row.get('key', '').strip(),
                        'description': row.get('description', '').strip(),
                        'condition': row.get('condition', '').strip(),
                        'category': row.get('category', '').strip(),
                        'technique': row.get('technique', '').strip(),
                        'track_type': row.get('track_type', '').strip(),
                        'organism': row.get('organism', '').strip(),
                        'strain': row.get('strain', '').strip(),
                        'haplotype': row.get('haplotype', '').strip(),
                        'first_author': row.get('first_author', '').strip(),
                        'pubmed_id': row.get('pubmed_id', '').strip(),
                    }
    except Exception as e:
        print(f"  Warning: Could not load metadata for {species}: {e}")

    return metadata


def extract_haplotype_from_label(label):
    """Extract haplotype (HapA/HapB or A/B) from track label."""
    if '_HapA_' in label or label.endswith('_HapA'):
        return 'HapA'
    elif '_HapB_' in label or label.endswith('_HapB'):
        return 'HapB'
    elif '_hapA_' in label or label.endswith('_hapA'):
        return 'HapA'
    elif '_hapB_' in label or label.endswith('_hapB'):
        return 'HapB'
    return None


def build_srr_to_metadata_mapping(species):
    """Build mapping from SRR+haplotype to metadata using tracks.conf and CSV."""
    tracks_conf = parse_tracks_conf(species)
    metadata_csv = load_metadata_csv(species)

    srr_mapping = {}

    for track_label, track_info in tracks_conf.items():
        # Only process coverage tracks (skip alignments and density)
        if not track_label.endswith('_coverage'):
            continue

        url = track_info.get('urlTemplate', '')
        srr = extract_srr_from_url(url)

        if not srr:
            continue

        # Extract haplotype from track label
        haplotype = extract_haplotype_from_label(track_label)

        # Get metadata from CSV
        meta = metadata_csv.get(track_label, {})

        # Get display name from tracks.conf 'key' field
        display_name = track_info.get('key', '')

        if display_name or meta:
            # Use SRR+haplotype as key to distinguish HapA vs HapB
            key = f"{srr}_{haplotype}" if haplotype else srr
            srr_mapping[key] = {
                'display_name': display_name,
                'track_label': track_label,
                'url': url,
                'haplotype': haplotype or meta.get('haplotype', ''),
                **meta
            }

    return srr_mapping


def extract_srr_from_filename(filename):
    """Extract SRR number from JBrowse2 filename."""
    match = re.search(r'(SRR\d+)', filename)
    return match.group(1) if match else None


def extract_haplotype_from_filename(filename):
    """Extract haplotype from JBrowse2 filename."""
    if '_HapA_' in filename or 'HapA_' in filename:
        return 'HapA'
    elif '_HapB_' in filename or 'HapB_' in filename:
        return 'HapB'
    return None


def get_species_from_track(track):
    """Get species from track's assemblyNames."""
    assemblies = track.get('assemblyNames', [])
    for sp in SPECIES_LIST:
        if sp in assemblies:
            return sp
    return None


def update_track_with_metadata(track, srr_meta):
    """Update a track with proper metadata."""
    updated = False

    # Update name if we have a display name
    if srr_meta.get('display_name'):
        old_name = track.get('name', '')
        new_name = srr_meta['display_name']
        if old_name != new_name:
            track['name'] = new_name
            updated = True

    # Update category - always use author-based category for consistency
    if srr_meta.get('first_author'):
        old_category = track.get('category', [])
        # Build author_year category (e.g., "Glazier_2023")
        author = srr_meta['first_author'].replace(' ', '_')
        # Extract year from pubmed_id or track label if available
        year = ''
        if srr_meta.get('pubmed_id'):
            # Try to get year from existing track label or leave empty
            pass
        # Check if track label has year
        track_label = srr_meta.get('track_label', '')
        year_match = re.search(r'(\d{4})', track_label)
        if year_match:
            year = year_match.group(1)

        author_category = f"{author}_{year}" if year else author
        # Normalize to ensure consistent naming
        author_category = normalize_category(author_category)
        new_category = ['Coverage', author_category]
        if old_category != new_category:
            track['category'] = new_category
            updated = True

    # Add metadata object
    meta_obj = {}
    if srr_meta.get('description'):
        meta_obj['description'] = srr_meta['description']
    if srr_meta.get('condition'):
        meta_obj['condition'] = srr_meta['condition']
    if srr_meta.get('technique'):
        meta_obj['technique'] = srr_meta['technique']
    if srr_meta.get('first_author'):
        meta_obj['author'] = srr_meta['first_author']
    if srr_meta.get('pubmed_id'):
        meta_obj['pubmed_id'] = srr_meta['pubmed_id']
    if srr_meta.get('haplotype'):
        meta_obj['haplotype'] = srr_meta['haplotype']
    if srr_meta.get('strain'):
        meta_obj['strain'] = srr_meta['strain']

    if meta_obj:
        track['metadata'] = meta_obj
        updated = True

    return updated


def main():
    parser = argparse.ArgumentParser(description='Fix JBrowse2 track metadata')
    parser.add_argument('--dry-run', action='store_true', help='Show what would be done without writing')
    args = parser.parse_args()

    print("Loading existing JBrowse2 config...")
    config = load_config()
    tracks = config.get('tracks', [])
    print(f"Found {len(tracks)} tracks")

    # Build SRR -> metadata mapping for each species
    print("\nBuilding SRR to metadata mapping from JBrowse1...")
    all_srr_mappings = {}
    for species in SPECIES_LIST:
        print(f"  Processing {species}...")
        mapping = build_srr_to_metadata_mapping(species)
        all_srr_mappings[species] = mapping
        print(f"    Found {len(mapping)} SRR mappings")

    # Update tracks
    print("\nUpdating tracks...")
    updated_count = 0
    not_found_count = 0
    already_good_count = 0

    for track in tracks:
        # Get the URI/filename
        adapter = track.get('adapter', {})
        uri = None
        for key in ['bigWigLocation', 'bamLocation', 'vcfGzLocation']:
            if key in adapter:
                uri = adapter[key].get('uri', '')
                break

        if not uri:
            continue

        # Extract SRR and haplotype from filename
        srr = extract_srr_from_filename(uri)
        if not srr:
            continue

        haplotype = extract_haplotype_from_filename(uri)

        # Get species
        species = get_species_from_track(track)
        if not species:
            continue

        # Look up metadata - try with haplotype first, then without
        species_mappings = all_srr_mappings.get(species, {})
        key_with_hap = f"{srr}_{haplotype}" if haplotype else srr
        srr_meta = species_mappings.get(key_with_hap) or species_mappings.get(srr)
        if not srr_meta:
            not_found_count += 1
            continue

        # Update track
        if update_track_with_metadata(track, srr_meta):
            updated_count += 1
        else:
            already_good_count += 1

    # Normalize all existing categories for consistency
    print("\nNormalizing categories...")
    normalized_count = 0
    for track in tracks:
        cat = track.get('category', [])
        if len(cat) >= 2:
            old_cat = cat[1]
            new_cat = normalize_category(old_cat)
            if new_cat and new_cat != old_cat:
                cat[1] = new_cat
                normalized_count += 1

    print(f"\nResults:")
    print(f"  Tracks updated: {updated_count}")
    print(f"  Already correct: {already_good_count}")
    print(f"  SRR not found in JBrowse1: {not_found_count}")
    print(f"  Categories normalized: {normalized_count}")

    if args.dry_run:
        print("\n[DRY RUN] Would update these tracks (sample):")
        sample_count = 0
        for track in tracks:
            if track.get('metadata'):
                print(f"  - {track.get('name', 'Unknown')}")
                sample_count += 1
                if sample_count >= 10:
                    print(f"  ... and more")
                    break
    else:
        # Write updated config
        print(f"\nWriting updated config to {OUTPUT_FILE}...")
        with open(OUTPUT_FILE, 'w') as f:
            json.dump(config, f, indent=2)

        print(f"Done! Review {OUTPUT_FILE} and rename to config.json when ready.")
        print(f"  cp {CONFIG_FILE} {CONFIG_FILE}.backup2")
        print(f"  mv {OUTPUT_FILE} {CONFIG_FILE}")


if __name__ == '__main__':
    main()
