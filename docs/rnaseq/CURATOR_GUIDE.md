# RNA-seq Import Guide for Curators

## Quick Start

### Step 1: Fill in Metadata
Use the Excel template to fill in study + sample information:
- **Study sheet**: Study_ID, PMID, Organism, Category
- **Samples sheet**: See column guide below

See `RNA-seq_metadata_template.xlsx` for an example.

#### Samples Sheet Columns

| Column | Required | Notes |
|--------|----------|-------|
| SRR_ID | **Yes** | SRA run accession |
| Condition_Label | **Yes** | Human-readable label for JBrowse/Expression tab |
| Bucket | **Yes** | control, mutation, stress, kill_candida, basic_biology |
| Replicate | Optional | Replicate number (1, 2, 3...) |
| Strain | Optional | Strain name (e.g., "SC5314", "ago1Δ/Δ") |
| Treatment | Optional | External conditions (drugs, temp, media) |
| Timepoint | Optional | For time-course experiments (e.g., "0h", "2h") |
| Strandedness | Optional | RF, FR, or blank for unstranded (see below) |
| Align_Pct | Auto-filled | Filled by `extract_alignment_stats.py` after pipeline |
| Status | Auto-filled | OK or FAILED based on alignment % |
| Notes | Optional | Any notes |

### Step 2: Upload and Start the Pipeline
First, upload your metadata file from your laptop:
```bash
scp MyStudy_2024_metadata.xlsx cgd-dev:~/work/cgd-frontend/docs/rnaseq/
```

Then SSH to the server and run the pipeline in the background:
```bash
ssh cgd-dev
cd ~/work/cgd-frontend/docs/rnaseq/scripts/

nohup bash run_rnaseq_pipeline.sh ../MyStudy_2024_metadata.xlsx C_auris_B8441 > ../MyStudy_2024.log 2>&1 &
```

**IMPORTANT:** Run this command ONCE. It starts the pipeline in the background so you can log out safely.

**Organisms:** `C_auris_B8441`, `C_albicans_SC5314`, `C_glabrata_CBS138`, `C_dubliniensis_CD36`, `C_parapsilosis_CDC317`

#### How to Know It's Running
After running the command, you should see output like:
```
[1] 12345
```
This `[1] 12345` means the job is running in the background with process ID 12345. You can now safely log out.

**If you see `[1]+ Exit 1` or similar**, the job failed immediately. Check the log file for errors:
```bash
cat ~/work/cgd-frontend/docs/rnaseq/MyStudy_2024.log
```

### Step 3: Check Progress
```bash
# Check if pipeline is still running
ps aux | grep run_rnaseq_pipeline

# View the output log
tail -f ~/work/cgd-frontend/docs/rnaseq/MyStudy_2024.log

# View detailed pipeline progress
tail -f /data/tmp/rnaseq_import/MyStudy_2024/pipeline_*.log

# Check which samples completed
cat /data/tmp/rnaseq_import/MyStudy_2024/progress.txt

# Check a specific sample's log
cat /data/tmp/rnaseq_import/MyStudy_2024/logs/SRR12345678.log
```

### Step 4: After Completion
```bash
# First, activate the conda environment (required for Python scripts)
source ~/miniconda3/bin/activate biotools

# Extract alignment stats and update metadata
python extract_alignment_stats.py ../MyStudy_2024_metadata.xlsx /data/tmp/rnaseq_import/MyStudy_2024/logs/

# Generate JBrowse2 configs (excludes failed samples)
python import_rnaseq.py ../MyStudy_2024_metadata.xlsx --output-dir ../output/
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
nohup bash run_rnaseq_pipeline.sh ../MyStudy_2024_metadata.xlsx C_auris_B8441 > ../MyStudy_2024.log 2>&1 &
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

**Multiple categories:** Use comma-separated values (e.g., "Biofilm, Stress Response")

### Strandedness Options
In the Samples sheet, set the `Strandedness` column for each sample:

| Value | Library Type | Description |
|-------|--------------|-------------|
| **RF** | First-strand | dUTP method - most common (TruSeq Stranded, NEBNext) |
| **FR** | Second-strand | Less common |
| (blank) | Unstranded | Safe default if unknown |

**Tip:** dUTP = first-strand = **RF**. If not stated in BioProject, check SRA metadata for library prep method. When in doubt, leave blank - alignment will still work.

### Sample Field Descriptions

**Condition_Label**
Human-readable label that appears in JBrowse track names and Expression tab dropdowns.
- Use descriptive text, not internal IDs
- The SRR ID is automatically appended, so don't include it
- Example: "Iracane et al long RNA strain AGO1 mutant (biol rep 3)"
- Not: "Iracane_longRNA_SC5314_AGO1-mutant_rep3"

**Bucket**
Groups samples for Expression tab fold-change display:
- `control` - wild-type/baseline (first control sample is used for fold-change calculations)
- `basic_biology` - general experimental conditions
- `mutation` - mutant strains
- `stress` - stress-related conditions
- `kill_candida` - antifungal treatments

Example: When comparing mutant vs wild-type, wild-type samples = `control`, mutant samples = `mutation`

**Treatment**
Free-text field for **external conditions applied** (drugs, temperature, media changes). Examples:
- `Untreated`
- `Fluconazole 1 μg/mL`
- `Heat shock 42°C 30min`
- `Hypoxia`
- Leave blank if not applicable

**Note:** Mutations are NOT treatments. Capture mutations in:
- **Condition_Label** - e.g., "AGO1 mutant (rep 1)"
- **Strain** column - e.g., "ago1Δ/Δ" or "SC5314 ago1Δ"

### Quality Threshold
Samples with alignment rate **< 85%** are automatically excluded from JBrowse2 tracks.
