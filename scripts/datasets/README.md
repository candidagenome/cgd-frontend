# Dataset Upload Scripts

Simplified workflow for adding downloadable datasets to CGD.

## Workflow

```
Local files  →  Prod server  →  Link in CGD Curator Central
(upload)        (stored)        (web UI)
```

## Quick Start

```bash
cd ~/cgd-frontend/scripts/datasets

# Download dataset files from paper to your local machine first, then:
./upload_dataset.sh Shinohara_2025 ~/Downloads/Shinohara_data/
```

## Setup

Uses shared config from `~/cgd-frontend/scripts/config.sh`.

If not already set up, see [../rnaseq/README.md](../rnaseq/README.md) for setup instructions.

## Usage

```bash
./upload_dataset.sh <author_year> <local_files_path>

# Examples:
./upload_dataset.sh Shinohara_2025 ~/Downloads/Shinohara_data/    # Upload directory
./upload_dataset.sh Smith_2024 ~/Downloads/dataset.xlsx           # Upload single file
```

## After Upload: Link in CGD

The script will display these steps after uploading:

### 1. Link dataset to reference

1. Go to CGD Curator Central → "Edit or delete an existing reference"
2. Search by PMID
3. Click "Edit reference information"
4. At bottom, click "Add a new reference URL":
   - **Source:** Author
   - **URL_type:** reference data
   - **URL:** `/download/systematic_results/Author_Year`
5. Submit

### 2. Link to publisher supplement

1. Add another URL:
   - **Source:** Publisher
   - **URL_type:** reference supplement
   - **URL:** [paste publisher's supplemental data URL]
2. Submit

### 3. Verify

- Check that dataset appears in Download menu
- Verify "web supplement" icon links to the paper
