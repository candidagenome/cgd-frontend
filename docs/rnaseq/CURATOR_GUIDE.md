# RNA-seq Import Guide for Curators

## Quick Start

### Step 1: Fill in Metadata
Copy the blank template and fill in study + sample information:
```bash
cp RNA-seq_metadata_BLANK.tsv MyStudy_2024_metadata.tsv
```

Edit the TSV with study info (PMID, organism, category) and sample info (SRR IDs, condition labels).

See `RNA-seq_metadata_template.tsv` for an example.

### Step 2: Start the Pipeline
```bash
cd ~/work/cgd-frontend/docs/rnaseq/scripts/

bash run_rnaseq_pipeline.sh ../MyStudy_2024_metadata.tsv C_auris_B8441
```

**Organisms:** `C_auris_B8441`, `C_albicans_SC5314`, `C_glabrata_CBS138`, `C_dubliniensis_CD36`, `C_parapsilosis_CDC317`

### Step 3: Check Progress
```bash
# View live progress
tail -f /data/tmp/rnaseq_import/MyStudy_2024/pipeline_*.log

# Check which samples completed
cat /data/tmp/rnaseq_import/MyStudy_2024/progress.txt

# Check a specific sample's log
cat /data/tmp/rnaseq_import/MyStudy_2024/logs/SRR12345678.log
```

### Step 4: After Completion
```bash
# Extract alignment stats and update metadata
python extract_alignment_stats.py ../MyStudy_2024_metadata.tsv /data/tmp/rnaseq_import/MyStudy_2024/logs/

# Generate JBrowse2 configs (excludes failed samples)
python import_rnaseq.py ../MyStudy_2024_metadata.tsv --output-dir ../output/
```

Then notify developer to deploy the configs.

---

## Detailed Information

### Pipeline Duration
- ~30-60 minutes per sample
- 20-sample study = ~10-20 hours

### If Pipeline Fails or Stops
Just run the same command again - it will **resume from where it left off**:
```bash
bash run_rnaseq_pipeline.sh ../MyStudy_2024_metadata.tsv C_auris_B8441
```

### Check for Failed Samples
```bash
grep FAILED /data/tmp/rnaseq_import/MyStudy_2024/progress.txt
```

### File Locations
| Location | Description |
|----------|-------------|
| `/data/tmp/rnaseq_import/<study>/` | Working directory |
| `/data/tmp/rnaseq_import/<study>/logs/` | Per-sample HISAT2 logs |
| `/data/HTS/<organism>/bam/<study>/` | Final BigWig output |

### Category Options
- Stress Response
- Antifungal Response
- Biofilm
- Morphology
- Morphology/Media
- Gene Regulation
- Immune Response
- Cell Type Switching
- Strain Comparison
- Mutation Comparison
- DNA Damage Response

### Quality Threshold
Samples with alignment rate **< 85%** are automatically excluded from JBrowse2 tracks.
