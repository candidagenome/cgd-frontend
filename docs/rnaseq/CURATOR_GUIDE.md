# RNA-seq Import Guide for Curators

## Quick Start

### Step 1: Fill in Metadata
Use the Excel template to fill in study + sample information:
- **Study sheet**: Study_ID, PMID, Organism, Category
- **Samples sheet**: SRR_ID, Condition_Label, Bucket

See `RNA-seq_metadata_template.xlsx` for an example.

### Step 2: Upload and Start the Pipeline
First, upload your metadata file from your laptop:
```bash
scp MyStudy_2024_metadata.xlsx cgd-dev:~/work/cgd-frontend/docs/rnaseq/
```

Then SSH to the server and run the pipeline:
```bash
ssh cgd-dev
cd ~/work/cgd-frontend/docs/rnaseq/scripts/

bash run_rnaseq_pipeline.sh ../MyStudy_2024_metadata.xlsx C_auris_B8441
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
bash run_rnaseq_pipeline.sh ../MyStudy_2024_metadata.xlsx C_auris_B8441
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
- **RF** - Reverse/first-strand (most common for Illumina dUTP stranded libraries)
- **FR** - Forward/second-strand
- Leave blank for unstranded

### Sample Field Descriptions

**Condition_Label**
Human-readable label that appears in JBrowse track names and Expression tab dropdowns.
- Use descriptive text, not internal IDs
- The SRR ID is automatically appended, so don't include it
- Example: "Iracane et al long RNA strain AGO1 mutant (biol rep 3)"
- Not: "Iracane_longRNA_SC5314_AGO1-mutant_rep3"

**Bucket**
Groups samples for Expression tab fold-change display:
- `control` - baseline/reference conditions (first control sample is used for fold-change calculations)
- `basic_biology` - general experimental conditions
- `stress` - stress-related conditions
- `kill_candida` - antifungal treatments

Example: When comparing mutant vs wild-type, wild-type samples = `control`, mutant samples = `basic_biology`

**Treatment**
Free-text field describing the treatment applied. Examples:
- `Untreated`
- `Fluconazole 1 μg/mL`
- `Heat shock 42°C 30min`
- `Hypoxia`
- Leave blank if not applicable

### Quality Threshold
Samples with alignment rate **< 85%** are automatically excluded from JBrowse2 tracks.
