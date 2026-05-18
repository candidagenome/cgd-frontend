# RNA-Seq Dataset Processing Status

## Overview

This directory tracks the status of RNA-Seq dataset processing for CGD organisms.

**Processing server:** `cgd-frontend-dev`
**Pipeline scripts:** `scripts/dataset_import/`
**Data source:** `../cgd/DataSets_to_import.xlsx`

## Species Summary

| Species | Completed Studies | Total Samples | In Progress | Next Priority |
|---------|-------------------|---------------|-------------|---------------|
| [C. albicans SC5314](C_albicans_SC5314_studies.md) | 10 | 202 | Iracane_2024 | Wu Y, Yau KPS |
| [C. auris B8441](C_auris_B8441_studies.md) | 9 | 142 | - | Kean_2018 |
| [C. glabrata CBS138](C_glabrata_CBS138_studies.md) | 5 | 50 | - | Raj_2024, Rana_2025 |
| [C. dubliniensis CD36](C_dubliniensis_CD36_studies.md) | 2 | 13 | - | Meza-Devalos |
| [C. parapsilosis CDC317](C_parapsilosis_CDC317_studies.md) | 3 | 58 | - | - |

**Total: 29 completed studies, 465 samples**

## Recent Completions

**Wang_2024 (C. auris)** - PRJNA1086003 - Completed 2025-05-17
- 13 samples: AR0382/AR0387 strains, In Vitro Biofilm vs In Vivo Catheter
- Expression tab and JBrowse tracks configured

## Pipeline Workflow

1. Download FASTQ from SRA: `01_download_sra.sh`
2. Align with HISAT2: `02_align_reads.sh`
3. Generate BigWig: `03_generate_bigwig.sh`
4. Copy to production server when ready

## File Locations

| Location | Description |
|----------|-------------|
| `/data/tmp/dataset_import/` | Working directory for processing |
| `/data/HTS/<species>/bam/<study>/` | Final output location |
| `/data/genomes/` | Reference genomes and HISAT2 indices |

## Last Updated

2025-05-17
