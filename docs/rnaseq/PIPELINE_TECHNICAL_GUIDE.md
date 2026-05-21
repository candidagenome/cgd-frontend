# RNA-seq Import Pipeline - Technical Guide

## Overview

The CGD RNA-seq import pipeline processes raw sequencing data from public repositories and generates normalized coverage tracks for visualization in JBrowse2 and expression quantification.

**Pipeline Flow:**
```
FASTQ (raw reads) → BAM (aligned reads) → BigWig (coverage track)
```

---

## Data Sources

### Where to Find Datasets

1. **NCBI SRA (Sequence Read Archive)**
   - URL: https://www.ncbi.nlm.nih.gov/sra
   - Search by organism, study, or publication
   - Each sample has an SRR accession (e.g., SRR27911207)

2. **ENA (European Nucleotide Archive)**
   - URL: https://www.ebi.ac.uk/ena
   - Mirrors NCBI SRA data
   - Often faster downloads from European servers
   - **The pipeline downloads from ENA by default**

3. **GEO (Gene Expression Omnibus)**
   - URL: https://www.ncbi.nlm.nih.gov/geo
   - Search by GSE accession or PMID
   - Links to SRA for raw data

### Finding Study Information

1. Start with a publication (PMID)
2. Find the GEO accession (GSE*) or BioProject (PRJNA*)
3. Get individual sample SRR IDs from SRA

---

## Programs Used

### 1. wget
**Purpose:** Download FASTQ files from ENA

```bash
wget -O sample.fastq.gz ftp://ftp.sra.ebi.ac.uk/vol1/fastq/SRR279/007/SRR27911207/SRR27911207_1.fastq.gz
```

- Downloads compressed FASTQ files directly from ENA FTP servers
- Supports both single-end (`_1.fastq.gz`) and paired-end (`_1.fastq.gz`, `_2.fastq.gz`) reads

---

### 2. HISAT2
**Purpose:** Align RNA-seq reads to a reference genome

```bash
hisat2 -p 8 --dta -x /data/genomes/hisat2_index/C_albicans_SC5314 \
    --rna-strandness RF \
    -1 sample_1.fastq.gz -2 sample_2.fastq.gz
```

**Key Parameters:**
| Parameter | Description |
|-----------|-------------|
| `-p 8` | Use 8 threads |
| `--dta` | Report alignments tailored for downstream transcript assembly (StringTie) |
| `-x` | Path to HISAT2 index (pre-built for each organism) |
| `--rna-strandness RF` | Library is first-strand (dUTP method) |
| `-1`, `-2` | Paired-end FASTQ files |
| `-U` | Single-end FASTQ file |

**Strandedness Options:**
- `RF` (first-strand/dUTP): Most common (TruSeq Stranded, NEBNext)
- `FR` (second-strand): Less common
- (none): Unstranded libraries

**Output:** SAM format (streamed to samtools)

---

### 3. samtools
**Purpose:** Convert and sort aligned reads

```bash
samtools view -@ 4 -bS - | samtools sort -@ 4 -m 1G -o sorted.bam -
```

**Two-step process:**

#### samtools view
Converts SAM to BAM (binary format)
| Parameter | Description |
|-----------|-------------|
| `-@` | Number of threads |
| `-b` | Output BAM format |
| `-S` | Input is SAM (deprecated but harmless) |
| `-` | Read from stdin |

#### samtools sort
Sorts alignments by genomic position
| Parameter | Description |
|-----------|-------------|
| `-@` | Number of threads |
| `-m 1G` | Memory per thread (prevents OOM on small instances) |
| `-o` | Output file |

#### samtools index
Creates BAM index for random access
```bash
samtools index sorted.bam
```

---

### 4. bamCoverage (deepTools)
**Purpose:** Generate normalized coverage tracks (BigWig)

```bash
bamCoverage -b sorted.bam -o coverage.bigwig --normalizeUsing CPM -p 8
```

**Key Parameters:**
| Parameter | Description |
|-----------|-------------|
| `-b` | Input BAM file |
| `-o` | Output BigWig file |
| `--normalizeUsing CPM` | Counts Per Million normalization |
| `-p` | Number of threads |

**Normalization Methods:**
- **CPM** (Counts Per Million): Default, allows comparison between samples
- **RPKM/FPKM**: Normalized by gene length (less common for coverage tracks)
- **BPM**: Bins Per Million
- **None**: Raw counts

**Output:** BigWig file - compact binary format for genome browsers

---

## Pipeline Steps (Detailed)

### Step 1: Download FASTQ
```
ENA FTP Server → Local FASTQ files
```
- Compressed gzip format (.fastq.gz)
- ~1-5 GB per sample typically
- Deleted after BigWig generation to save space

### Step 2: Align Reads
```
FASTQ → HISAT2 → SAM (streamed)
```
- Aligns reads to reference genome
- Reports alignment rate (target: >85%)
- Handles spliced alignments (intron-spanning reads)

### Step 3: Convert and Sort
```
SAM → samtools view → BAM → samtools sort → Sorted BAM
```
- BAM is ~50% smaller than SAM
- Sorting required for indexing and coverage calculation
- Memory-limited to prevent crashes

### Step 4: Index BAM
```
Sorted BAM → samtools index → BAM.bai
```
- Creates index for random access
- Required by bamCoverage

### Step 5: Generate BigWig
```
Sorted BAM → bamCoverage → BigWig
```
- CPM normalization for cross-sample comparison
- Compact format (~50-200 MB per sample)
- Ready for JBrowse2 visualization

### Step 6: Cleanup
```
Delete: FASTQ, BAM, BAM.bai
Keep: BigWig only
```
- Saves significant disk space
- BigWig is the only file needed for visualization

---

## Directory Structure

```
/data/tmp/rnaseq_import/{study_id}/
├── fastq/                    # Downloaded FASTQ files (temporary)
├── logs/                     # Per-sample alignment logs
│   ├── SRR27911207.log
│   └── SRR27911216.log
├── progress.txt              # Resume tracking file
└── pipeline_*.log            # Main pipeline log

/data/HTS/{organism}/bam/{study_id}/
├── SRR27911207/
│   └── SRR27911207_sorted_hits.bigwig
├── SRR27911216/
│   └── SRR27911216_sorted_hits.bigwig
└── ...
```

---

## Pre-built Resources

### HISAT2 Indexes
Location: `/data/genomes/hisat2_index/`

| Organism | Index Path |
|----------|------------|
| C. albicans SC5314 | `C_albicans_SC5314` |
| C. auris B8441 | `C_auris_B8441` |
| C. glabrata CBS138 | `C_glabrata_CBS138` |
| C. dubliniensis CD36 | `C_dubliniensis_CD36` |
| C. parapsilosis CDC317 | `C_parapsilosis_CDC317` |

---

## Post-Pipeline Steps

### 1. Extract Alignment Statistics
```bash
python extract_alignment_stats.py metadata.xlsx /data/tmp/rnaseq_import/{study}/logs/
```
- Parses HISAT2 logs for alignment rates
- Updates metadata file with Align_Pct and Status columns
- Samples with <85% alignment are marked FAILED

### 2. Generate JBrowse2 Configuration
```bash
python import_rnaseq.py metadata.xlsx --output-dir output/
```
- Creates JBrowse2 track configurations
- Creates symlinks in `/data/jbrowse2/` for BigWig files
- Generates expression service configuration

### 3. Rebuild Expression Cache
```bash
cd cgd-backend && python scripts/rebuild_expression_cache.py
```
- Generates pre-computed expression values
- Required for Expression tab on locus pages

---

## Quality Control

### Alignment Rate Thresholds
| Rate | Status | Action |
|------|--------|--------|
| ≥85% | OK | Include in JBrowse2 |
| <85% | FAILED | Exclude from JBrowse2, investigate |
| <50% | Critical | Check library prep, contamination, wrong organism |

### Common Issues
1. **Low alignment rate**: Wrong organism, contamination, poor library quality
2. **OOM errors**: Reduce samtools threads, add `-m` memory limit
3. **Broken pipe**: Usually OOM - check `dmesg` for OOM killer messages

---

## Time and Resource Estimates

| Metric | Estimate |
|--------|----------|
| Time per sample | 30-60 minutes |
| Disk per sample (temporary) | 5-10 GB |
| Disk per sample (final BigWig) | 50-200 MB |
| Memory required | 4-8 GB |
| CPU threads | 8 recommended |

---

## Example: Full Pipeline Run

```bash
# 1. Upload metadata
scp Study_2024_metadata.xlsx cgd-dev:~/work/cgd-frontend/docs/rnaseq/

# 2. Run pipeline (background)
ssh cgd-dev
cd ~/work/cgd-frontend/docs/rnaseq/scripts/
nohup bash run_rnaseq_pipeline.sh ../Study_2024_metadata.xlsx C_albicans_SC5314 > ../Study_2024.log 2>&1 &

# 3. Monitor progress
tail -f /data/tmp/rnaseq_import/Study_2024/pipeline_*.log
cat /data/tmp/rnaseq_import/Study_2024/progress.txt

# 4. Post-processing (after pipeline completes)
source ~/miniconda3/bin/activate biotools
python extract_alignment_stats.py ../Study_2024_metadata.xlsx /data/tmp/rnaseq_import/Study_2024/logs/
python import_rnaseq.py ../Study_2024_metadata.xlsx --output-dir ../output/

# 5. Notify developer to deploy configs
```
