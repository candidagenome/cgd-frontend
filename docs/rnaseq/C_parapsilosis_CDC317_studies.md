# C. parapsilosis CDC317 RNA-Seq Studies

## Overview

This document tracks RNA-Seq dataset processing status for *Candida parapsilosis* CDC317.

**Data location:** `/data/HTS/C_parapsilosis_CDC317/bam/`

## Completed Studies

| Study | Samples | Status | PMID | Notes |
|-------|---------|--------|------|-------|
| Connolly_2013 | 8 | Complete | 23895281 | Efg1 phenotype switch |
| Guida_2011 | 26 | Complete | 22192698 | Transcriptional landscape |
| Holland_2014 | 24 | Complete | ? | |

**Total completed: 3 studies, 58 samples**

## In Progress

| Study | Samples | Completed | Status | PMID | Notes |
|-------|---------|-----------|--------|------|-------|
| | | | | | None |

## Pending/Problematic Studies

| Study | BioProject | PMID | Alignment | Notes |
|-------|------------|------|-----------|-------|
| Jakab_2019 | PRJNA531086 | 31399405 | 72% | (+/-) tyrosol |
| Bliss_2021 | PRJNA668176 | 33568454 | 49% | Inducible adhesion |

## Processing Notes

- Processing server: `cgd-frontend-dev`
- Pipeline scripts: `scripts/dataset_import/`
- Working directory: `/data/tmp/dataset_import/`
- Final output: `/data/HTS/C_parapsilosis_CDC317/bam/<study>/`

## Last Updated

2025-05-16
