# RNA-seq Metadata Collection Template

## Overview
Use this template to collect metadata for new RNA-seq datasets before import.
Save as TSV and pass the filename to the import pipeline.

## Files
- `RNA-seq_metadata_BLANK.tsv` - Empty template to fill in
- `RNA-seq_metadata_template.tsv` - Example with Shivarathri_2022 data

## Instructions

1. Copy `RNA-seq_metadata_BLANK.tsv` to a new file named `{Study_ID}_metadata.tsv`
2. Fill in STUDY METADATA (one row)
3. Fill in SAMPLE METADATA (one row per SRR/ERR accession)
4. Save and pass to pipeline: `python import_rnaseq.py {Study_ID}_metadata.tsv`

## Field Descriptions

### STUDY METADATA (Required)
| Field | Description | Example |
|-------|-------------|---------|
| Study_ID* | Author_Year format | Shivarathri_2022 |
| PMID* | PubMed ID | 35652307 |
| NCBI_BioProject | PRJNA ID | PRJNA797998 |
| GEO_Accession | GSE ID (if available) | GSE194127 |
| Organism* | Species_Strain | C_auris_B8441, C_albicans_SC5314 |
| Category* | Study category (see below) | Antifungal Response |
| Publication_Title | Paper title | Transcriptome analysis... |

### SAMPLE METADATA (One row per sample)
| Field | Description | Example |
|-------|-------------|---------|
| SRR_ID* | SRA run accession | SRR17259761 |
| Condition_Label* | Human-readable label | AmpB Sensitive (rep 1) |
| Bucket* | Category for grouping | control |
| Replicate | Replicate number | 1, 2, 3 |
| Strain | Strain if different | B11221, mrr1a mutant |
| Treatment | Treatment details | Caspofungin 15min |
| Timepoint | Time point | 15min, 2h |
| Notes | Additional info | Sensitive isolate |

## Category Options
- Stress Response
- Antifungal Response
- Biofilm
- Morphology
- Morphology/Media
- Gene Regulation
- Immune Response
- Cell Type Switching
- Strain Comparison
- DNA Damage Response
- Colony Morphology
- Biofilm/Transcription Factors

## Bucket Options
| Bucket | Use For |
|--------|---------|
| control | Untreated/baseline (reference for fold change) |
| basic_biology | Growth, morphology, media, mutants |
| stress | Oxidative, nitrosative, pH stress |
| kill_candida | Antifungals, immune cells |

## Where to Find Information

### From Publication (PMID)
- Study category
- Experimental conditions
- Strain information
- Treatment details

### From NCBI BioProject
- SRR/ERR accessions
- Sample descriptions
- Replicate information

### From GEO (if available)
- GSM sample titles (often have condition labels)
- Experimental design
