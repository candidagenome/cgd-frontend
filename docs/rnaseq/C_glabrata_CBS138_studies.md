# C. glabrata CBS138 RNA-Seq Studies

## Overview

This document tracks RNA-Seq dataset processing status for *Candida glabrata* CBS138.

**Data location:** `/data/HTS/C_glabrata_CBS138/bam/`

## Completed Studies

| Study | Samples | Status | PMID | Notes |
|-------|---------|--------|------|-------|
| Bhakt_2022 | 7 | Complete | 36108742 | (+/-) CgSet4 and caspofungin |
| Kumar_2024 | 13 | Complete | 38632999 | Macrophage-ingested wt and Cgsnf2Δ |
| Linde_2015 | 12 | Complete | 25586221 | pH change and nitrosative stress |
| Ni_2023 | 12 | Complete | 37891489 | (+/-) Ckb1/Ckb2 and MMS |
| Vu_2021 | 6 | Complete | 34591857 | G898D UPC2A transcriptome |

**Total completed: 5 studies, 50 samples**

## In Progress

| Study | Samples | Completed | Status | PMID | Notes |
|-------|---------|-----------|--------|------|-------|
| Cavalheiro_2021 | 12 | 0 | Aborted | 34285314 | Problem with % alignment |

## Pending Studies (NEXT)

| Study | BioProject | PMID | Description | Priority |
|-------|------------|------|-------------|----------|
| Raj_2024 | PRJNA640406 | 38641593 | Planktonic v biofilm | NEXT |
| Rana_2025 | ? | 40677213 | (+/-) 3AT and H2O2; (+/-) GCN4 | NEXT |

### Other Pending

| Study | BioProject | PMID | Description |
|-------|------------|------|-------------|
| Dottor_2024 | PRJNA1060729 | 38861404 | Thiamine starvation |
| ? | PRJNA897921 | 37046215 | Cdc50 knockout |
| ? | PRJNA789874 | 34935446 | ROX1 mutations |
| ? | PRJNA756363 | 34591857 | Fluconazole treatment |
| ? | PRJNA740465 | 34372698 | Mitochondria and echinocandin |
| ? | PRJNA726326 | 35727043 | Haploid and diploid |
| ? | PRJNA685126 | 35050001 | Fluconazole and Mar1 |
| ? | PRJNA682828 | 35774458 | Copper and fluconazole |
| ? | PRJNA655241 | 33323516 | DNA damage |
| ? | PRJNA623751 | 33135521 | CgTog1 |
| ? | PRJNA598167 | 32134928 | Histone H4 dosage |
| ? | PRJNA530999 | 32571817 | Fluconazole and Rpn4 |
| ? | PRJNA495600 | 31993211 | Biofilm fluconazole |
| ? | PRJNA382954 | 28485712 | Starvation response |
| ? | PRJNA339934 | 28489916 | Old v young cells |
| ? | PRJNA306939 | 29311082 | Ada2 |

### Aborted/Skipped

| Study | BioProject | PMID | Reason |
|-------|------------|------|--------|
| Yu_2022 | PRJNA800257 | 35658596 | Problem with % alignment |
| Cavalheiro_2021 | PRJNA589660 | 34285314 | Problem with % alignment |

## Processing Notes

- Processing server: `cgd-frontend-dev`
- Pipeline scripts: `scripts/dataset_import/`
- Working directory: `/data/tmp/dataset_import/`
- Final output: `/data/HTS/C_glabrata_CBS138/bam/<study>/`

## Last Updated

2025-05-16
