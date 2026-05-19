# RNA-Seq Dataset Import

## For Curators

**See [CURATOR_GUIDE.md](CURATOR_GUIDE.md) for step-by-step instructions.**

Quick workflow:
```
1. Fill metadata XLSX    →  MyStudy_metadata.xlsx
2. Upload to server      →  scp metadata.xlsx cgd-dev:~/work/cgd-frontend/docs/rnaseq/
3. Run pipeline          →  bash run_rnaseq_pipeline.sh metadata.xlsx ORGANISM
4. Extract stats         →  python extract_alignment_stats.py metadata.xlsx logs/
5. Generate configs      →  python import_rnaseq.py metadata.xlsx
6. Notify developer      →  Deploy to JBrowse2
```

## Scripts

| Script | Purpose |
|--------|---------|
| `scripts/run_rnaseq_pipeline.sh` | Main pipeline (FASTQ → BigWig) |
| `scripts/extract_alignment_stats.py` | Parse HISAT2 logs, update metadata |
| `scripts/import_rnaseq.py` | Generate JBrowse2 + expression configs |

## Templates

| File | Purpose |
|------|---------|
| `RNA-seq_metadata_BLANK.xlsx` | Empty template for new studies |
| `RNA-seq_metadata_template.xlsx` | Example with sample data |
| `RNA-seq_metadata_README.md` | Field descriptions |

## Processing Status

| Species | Studies | Samples |
|---------|---------|---------|
| C. albicans SC5314 | 10 | 202 |
| C. auris B8441 | 9 | 142 |
| C. glabrata CBS138 | 5 | 50 |
| C. dubliniensis CD36 | 2 | 13 |
| C. parapsilosis CDC317 | 3 | 58 |

**Total: 29 studies, 465 samples**

## Server Locations

| Location | Description |
|----------|-------------|
| `/data/tmp/rnaseq_import/` | Pipeline working directory |
| `/data/HTS/<organism>/bam/` | Final BigWig output |
| `/data/genomes/hisat2_index/` | HISAT2 indices |
| `/data/jbrowse2/` | JBrowse2 track files |
