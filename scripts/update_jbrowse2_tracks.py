#!/usr/bin/env python3
"""
Script to add missing tracks and metadata to JBrowse2 config.

This script:
1. Reads existing JBrowse2 config.json
2. Finds data files in /data/jbrowse2/ that aren't in the config
3. Reads metadata from old JBrowse1 CSV files
4. Creates new track entries with metadata
5. Outputs an updated config.json

Usage:
    python3 update_jbrowse2_tracks.py [--dry-run]
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

# Species mapping from HTS directory names to assembly names
SPECIES_MAP = {
    "C_albicans_SC5314": "C_albicans_SC5314",
    "C_auris_B8441": "C_auris_B8441",
    "C_dubliniensis_CD36": "C_dubliniensis_CD36",
    "C_glabrata_CBS138": "C_glabrata_CBS138",
    "C_parapsilosis_CDC317": "C_parapsilosis_CDC317",
    "C_tropicalis_MYA3404": "C_tropicalis_MYA3404",
}

# File extensions to track types
FILE_TYPE_MAP = {
    ".bigwig": "QuantitativeTrack",
    ".bw": "QuantitativeTrack",
    ".bam": "AlignmentsTrack",
    ".vcf.gz": "VariantTrack",
}


def load_config():
    """Load existing JBrowse2 config."""
    with open(CONFIG_FILE) as f:
        return json.load(f)


def get_existing_track_ids(config):
    """Get set of existing track IDs."""
    return {track.get("trackId") for track in config.get("tracks", [])}


def get_existing_track_uris(config):
    """Get set of existing track URIs/filenames."""
    uris = set()
    for track in config.get("tracks", []):
        adapter = track.get("adapter", {})
        # Check various adapter location fields
        for key in ["bigWigLocation", "bamLocation", "vcfGzLocation", "gffGzLocation"]:
            if key in adapter:
                uri = adapter[key].get("uri", "")
                if uri:
                    uris.add(uri)
                    uris.add(os.path.basename(uri))
        # Also check nested locations
        if "index" in adapter and "location" in adapter["index"]:
            uri = adapter["index"]["location"].get("uri", "")
            if uri:
                uris.add(uri)
    return uris


def get_species_from_symlink(filepath):
    """Determine species from symlink target path."""
    try:
        target = os.readlink(filepath)
        for hts_name, assembly_name in SPECIES_MAP.items():
            if hts_name in target:
                return assembly_name
    except OSError:
        pass
    return None


def load_metadata_csv(species):
    """Load metadata from JBrowse1 CSV file for a species."""
    csv_path = JBROWSE1_DIR / species / f"{species}_MetaData.csv"
    metadata = {}
    if csv_path.exists():
        try:
            with open(csv_path, encoding='utf-8-sig') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    label = row.get('label', '').strip()
                    if label:
                        metadata[label] = {
                            'key': row.get('key', ''),
                            'description': row.get('description', ''),
                            'condition': row.get('condition', ''),
                            'category': row.get('category', ''),
                            'technique': row.get('technique', ''),
                            'track_type': row.get('track_type', ''),
                            'organism': row.get('organism', ''),
                            'strain': row.get('strain', ''),
                            'haplotype': row.get('haplotype', ''),
                            'first_author': row.get('first_author', ''),
                            'pubmed_id': row.get('pubmed_id', ''),
                        }
        except Exception as e:
            print(f"Warning: Could not load metadata for {species}: {e}")
    return metadata


def find_metadata_match(filename, metadata_dict):
    """Try to match a filename to metadata entry."""
    basename = os.path.basename(filename)
    name_lower = basename.lower()

    # Direct match by label
    for label, meta in metadata_dict.items():
        if label.lower() in name_lower or name_lower in label.lower():
            return meta

    # Try matching by author name
    # Extract author from filename like "Shivarathri2019_HapA_SRR..."
    author_match = re.match(r'^([A-Za-z]+)', basename)
    if author_match:
        author = author_match.group(1).lower()
        for label, meta in metadata_dict.items():
            if meta.get('first_author', '').lower().startswith(author):
                return meta

    return None


def parse_filename_info(filename):
    """Extract info from filename for track naming."""
    basename = os.path.basename(filename)
    name = os.path.splitext(basename)[0]

    # Handle double extensions like .vcf.gz
    if name.endswith('.vcf'):
        name = name[:-4]

    # Try to parse common patterns
    # Pattern: Author_Year_SRRnumber_type
    match = re.match(r'^([A-Za-z]+)(\d{4})?_?(HapA|HapB)?_?(SRR\d+)?_?(.*)$', name, re.IGNORECASE)
    if match:
        author = match.group(1)
        year = match.group(2) or ""
        haplotype = match.group(3) or ""
        srr = match.group(4) or ""
        track_type = match.group(5) or ""
        return {
            'author': author,
            'year': year,
            'haplotype': haplotype,
            'srr': srr,
            'track_type': track_type,
        }

    return {'author': name, 'year': '', 'haplotype': '', 'srr': '', 'track_type': ''}


def create_track_entry(filepath, species, metadata=None, file_info=None):
    """Create a JBrowse2 track entry."""
    filename = os.path.basename(filepath)
    ext = None
    for e in FILE_TYPE_MAP.keys():
        if filename.endswith(e):
            ext = e
            break

    if not ext:
        return None

    track_type = FILE_TYPE_MAP[ext]

    # Generate track ID from filename
    track_id = filename.replace('.', '_').replace('-', '_')
    # Clean up common suffixes
    if track_id.endswith('_bigwig'):
        track_id = track_id[:-7]
    if track_id.endswith('_coverage_coverage'):
        track_id = track_id[:-9]
    if not track_id.endswith('_coverage') and ext in ['.bigwig', '.bw']:
        track_id = track_id + '_coverage'

    # Build track name
    if file_info:
        parts = []
        if file_info.get('author'):
            parts.append(file_info['author'])
        if file_info.get('year'):
            parts.append(file_info['year'])
        if file_info.get('srr'):
            parts.append(file_info['srr'])
        if file_info.get('haplotype'):
            parts.append(f"({file_info['haplotype']})")
        # Add track type but clean it up
        if file_info.get('track_type'):
            tt = file_info['track_type'].replace('_', ' ').title()
            # Avoid redundant "Coverage Coverage"
            if tt.lower() != 'coverage':
                parts.append(tt)
        # Add "Coverage" suffix for bigwig files
        if ext in ['.bigwig', '.bw'] and 'Coverage' not in ' '.join(parts):
            parts.append('Coverage')
        track_name = ' '.join(parts) if parts else filename
    else:
        track_name = filename

    # Build category
    category = ["Coverage"]
    if file_info and file_info.get('author'):
        author = file_info['author']
        year = file_info.get('year', '')
        category.append(f"{author}_{year}" if year else author)

    # Use metadata if available
    if metadata:
        if metadata.get('key'):
            track_name = metadata['key']
        if metadata.get('category'):
            category = ["Coverage", metadata['category']]

    track = {
        "type": track_type,
        "trackId": track_id,
        "name": track_name,
        "assemblyNames": [species],
        "category": category,
    }

    # Add adapter based on file type
    if ext in [".bigwig", ".bw"]:
        track["adapter"] = {
            "type": "BigWigAdapter",
            "bigWigLocation": {
                "uri": filename,
                "locationType": "UriLocation"
            }
        }
    elif ext == ".bam":
        track["adapter"] = {
            "type": "BamAdapter",
            "bamLocation": {
                "uri": filename,
                "locationType": "UriLocation"
            },
            "index": {
                "location": {
                    "uri": filename + ".bai",
                    "locationType": "UriLocation"
                },
                "indexType": "BAI"
            }
        }
    elif ext == ".vcf.gz":
        track["adapter"] = {
            "type": "VcfTabixAdapter",
            "vcfGzLocation": {
                "uri": filename,
                "locationType": "UriLocation"
            },
            "index": {
                "location": {
                    "uri": filename + ".tbi",
                    "locationType": "UriLocation"
                },
                "indexType": "TBI"
            }
        }

    # Add metadata if available
    if metadata:
        meta_obj = {}
        if metadata.get('description'):
            meta_obj['description'] = metadata['description']
        if metadata.get('condition'):
            meta_obj['condition'] = metadata['condition']
        if metadata.get('technique'):
            meta_obj['technique'] = metadata['technique']
        if metadata.get('first_author'):
            meta_obj['author'] = metadata['first_author']
        if metadata.get('pubmed_id'):
            meta_obj['pubmed_id'] = metadata['pubmed_id']
        if metadata.get('haplotype'):
            meta_obj['haplotype'] = metadata['haplotype']
        if meta_obj:
            track['metadata'] = meta_obj

    return track


def main():
    parser = argparse.ArgumentParser(description='Update JBrowse2 tracks config')
    parser.add_argument('--dry-run', action='store_true', help='Show what would be done without writing')
    parser.add_argument('--coverage-only', action='store_true', default=True,
                        help='Only add coverage (bigwig) tracks, skip BAM alignments')
    parser.add_argument('--include-bam', action='store_true', help='Also add BAM alignment tracks')
    args = parser.parse_args()

    if args.include_bam:
        args.coverage_only = False

    print("Loading existing config...")
    config = load_config()
    existing_uris = get_existing_track_uris(config)
    existing_ids = get_existing_track_ids(config)

    print(f"Found {len(config.get('tracks', []))} existing tracks")
    print(f"Found {len(existing_uris)} existing URIs")

    # Load metadata for all species
    print("\nLoading metadata CSVs...")
    all_metadata = {}
    for species in SPECIES_MAP.values():
        metadata = load_metadata_csv(species)
        all_metadata[species] = metadata
        print(f"  {species}: {len(metadata)} metadata entries")

    # Find data files
    print("\nScanning for data files...")
    new_tracks = []
    skipped_existing = 0
    skipped_type = 0
    skipped_species = 0

    for filepath in JBROWSE2_DIR.iterdir():
        if not filepath.is_symlink():
            continue

        filename = filepath.name

        # Skip index files
        if filename.endswith(('.bai', '.tbi', '.fai', '.csi')):
            continue

        # Skip non-data files
        is_data_file = any(filename.endswith(ext) for ext in FILE_TYPE_MAP.keys())
        if not is_data_file:
            continue

        # Skip if coverage-only mode and this is a BAM
        if args.coverage_only and filename.endswith('.bam'):
            skipped_type += 1
            continue

        # Check if already in config
        if filename in existing_uris:
            skipped_existing += 1
            continue

        # Get species from symlink
        species = get_species_from_symlink(filepath)
        if not species:
            print(f"  Warning: Could not determine species for {filename}")
            skipped_species += 1
            continue

        # Try to find metadata
        metadata = find_metadata_match(filename, all_metadata.get(species, {}))

        # Parse filename for info
        file_info = parse_filename_info(filename)

        # Create track entry
        track = create_track_entry(filepath, species, metadata, file_info)
        if track:
            # Ensure unique track ID
            base_id = track['trackId']
            counter = 1
            while track['trackId'] in existing_ids:
                track['trackId'] = f"{base_id}_{counter}"
                counter += 1
            existing_ids.add(track['trackId'])
            new_tracks.append(track)

    print(f"\nResults:")
    print(f"  Skipped (already in config): {skipped_existing}")
    print(f"  Skipped (BAM files, coverage-only): {skipped_type}")
    print(f"  Skipped (unknown species): {skipped_species}")
    print(f"  New tracks to add: {len(new_tracks)}")

    # Group by species for summary
    by_species = defaultdict(list)
    for track in new_tracks:
        species = track['assemblyNames'][0]
        by_species[species].append(track)

    print("\nNew tracks by species:")
    for species, tracks in sorted(by_species.items()):
        print(f"  {species}: {len(tracks)}")

    if args.dry_run:
        print("\n[DRY RUN] Would add these tracks:")
        for track in new_tracks[:10]:
            print(f"  - {track['trackId']} ({track['assemblyNames'][0]})")
        if len(new_tracks) > 10:
            print(f"  ... and {len(new_tracks) - 10} more")
    else:
        # Add new tracks to config
        config['tracks'] = config.get('tracks', []) + new_tracks

        # Write updated config
        print(f"\nWriting updated config to {OUTPUT_FILE}...")
        with open(OUTPUT_FILE, 'w') as f:
            json.dump(config, f, indent=2)

        print(f"Done! Review {OUTPUT_FILE} and rename to config.json when ready.")
        print(f"  mv {OUTPUT_FILE} {CONFIG_FILE}")


if __name__ == '__main__':
    main()
