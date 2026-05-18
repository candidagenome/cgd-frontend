# C. auris B8441 RNA-Seq Studies

## Overview

This document tracks RNA-Seq dataset processing status for *Candida auris* B8441.

**Data location:** `/data/HTS/C_auris_B8441/bam/`

## Completed Studies

| Study | Samples | Status | PMID | Notes |
|-------|---------|--------|------|-------|
| Balla_2023 | 6 | Complete | 37532970 | (+/-) tyrosol |
| Biermann_2022 | 24 | Complete | 35473297 | (+/-) Mrr1 Inducers |
| Chow_2023 | 9 | Complete | 38014938 | (+/-) Ubr2 and Mub1 |
| Jakab_2021 | 6 | Complete | 34643421 | (+/-) farnesol |
| Jenull_2021 | 12 | Complete | 33937102 | Phenotypic variations |
| Pelletier_2024 | 48 | Complete | 38466738 | (+/-) aggregation |
| Shivarathri_2022 | 12 | Complete | 35652307 | AmpB sens v res |
| Simm_2022 | 12 | Complete | 35412372 | (+/-) pyrvinium pamoate |
| Wang_2024 | 13 | Complete | PRJNA1086003 | Biofilm: In Vitro vs In Vivo Catheter |

**Total completed: 9 studies, 142 samples**

### Wang_2024 Study Details (PRJNA1086003)

**Completed: 2025-05-17**

Study comparing in vitro biofilm vs in vivo catheter infection in two C. auris strains (AR0382, AR0387).

| SRR ID | Strain | Condition | Replicate | Library Size (M reads) |
|--------|--------|-----------|-----------|------------------------|
| SRR28790270 | AR0382 | In Vitro Biofilm | 1 | 73.0 |
| SRR28790272 | AR0382 | In Vitro Biofilm | 2 | 83.0 |
| SRR28790274 | AR0382 | In Vitro Biofilm | 3 | 73.4 |
| SRR28791430 | AR0382 | In Vivo Catheter | 1 | 49.9 |
| SRR28791431 | AR0382 | In Vivo Catheter | 2 | 41.7 |
| SRR28791432 | AR0382 | In Vivo Catheter | 3 | 39.6 |
| SRR28790276 | AR0387 | In Vitro Biofilm | 1 | 90.9 |
| SRR28790278 | AR0387 | In Vitro Biofilm | 2 | 48.9 |
| SRR28790280 | AR0387 | In Vitro Biofilm | 3 | 57.7 |
| SRR28791433 | AR0387 | In Vivo Catheter | 1 | 57.2 |
| SRR28791434 | AR0387 | In Vivo Catheter | 2 | 48.2 |
| SRR28791437 | AR0387 | In Vivo Catheter | 3 | 48.9 |
| SRR28791438 | AR0387 | In Vivo Catheter | 4 | 83.2 |

**Pipeline:** HISAT2 → samtools sort → bamCoverage (CPM normalized BigWig)
**Expression tab:** Configured in `cgd-backend/cgd/api/services/expression_service.py`
**JBrowse tracks:** `/data/HTS/C_auris_B8441/bam/Wang_2024/tracks.conf`

## In Progress

*No studies currently in progress*

## Pending Studies

| Study | BioProject | PMID | Description | Priority |
|-------|------------|------|-------------|----------|
| Kean_2018 | PRJNA477447 | 29997121 | Biofilm formation | NEXT |
| Chauhan | PRJNA1232830 | 40066990 | (+/-) GCN5 | |
| Zhang | GSE293594 | 40394068 | (+/-) GCN5; (+/-) FLC | |
| Phan-Canh | PRJNA1169348 | 40638387 | White v brown phenotypes | |
| Kovacs | GSE302377 | 41817193 | Caspo and posaconazole | |

### Lower Priority / Skipped

| Study | BioProject | PMID | Reason |
|-------|------------|------|--------|
| PRJNA925797 | - | - | Skip - no publication |
| PRJNA926102 | - | - | Skip - no publication |
| PRJNA814991 | - | - | Lower priority - echinocandin res v susc |
| Munoz | PRJNA445471 | 30559369 | SKIP - quality too low |

## Processing Notes

- Processing server: `cgd-frontend-dev`
- Pipeline scripts: `scripts/dataset_import/`
- Working directory: `/data/tmp/dataset_import/`
- Final output: `/data/HTS/C_auris_B8441/bam/<study>/`

## Last Updated

2025-05-17
