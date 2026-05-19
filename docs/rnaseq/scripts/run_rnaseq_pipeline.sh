#!/bin/bash
# =============================================================================
# RNA-seq Processing Pipeline for Curators
# =============================================================================
# Processes RNA-seq data from metadata TSV: FASTQ → BAM → BigWig
# Supports resume from interrupted runs.
#
# Usage:
#   bash run_rnaseq_pipeline.sh <metadata.tsv> <organism>
#
# Example:
#   bash run_rnaseq_pipeline.sh Iracane_2021_metadata.tsv C_auris_B8441
#
# Organisms: C_auris_B8441, C_albicans_SC5314, C_glabrata_CBS138,
#            C_dubliniensis_CD36, C_parapsilosis_CDC317
#
# After completion, run:
#   python extract_alignment_stats.py <metadata.tsv> <work_dir>/logs/
#   python import_rnaseq.py <metadata.tsv>
# =============================================================================

set -e

# Check arguments
if [ $# -lt 2 ]; then
    echo "Usage: bash run_rnaseq_pipeline.sh <metadata.tsv> <organism>"
    echo ""
    echo "Organisms: C_auris_B8441, C_albicans_SC5314, C_glabrata_CBS138,"
    echo "           C_dubliniensis_CD36, C_parapsilosis_CDC317"
    exit 1
fi

METADATA_TSV=$1
ORGANISM=$2

# Validate metadata file
if [ ! -f "$METADATA_TSV" ]; then
    echo "ERROR: Metadata file not found: $METADATA_TSV"
    exit 1
fi

# Extract study ID from metadata
STUDY_ID=$(grep -A1 "## STUDY METADATA" "$METADATA_TSV" | tail -1 | cut -f1)
if [ -z "$STUDY_ID" ] || [ "$STUDY_ID" = "Study_ID" ]; then
    STUDY_ID=$(basename "$METADATA_TSV" .tsv | sed 's/_metadata//')
fi

echo "=============================================="
echo "RNA-seq Pipeline"
echo "=============================================="
echo "Study:    $STUDY_ID"
echo "Organism: $ORGANISM"
echo "Metadata: $METADATA_TSV"
echo "=============================================="

# Configuration
THREADS=8
WORK_DIR=/data/tmp/rnaseq_import/${STUDY_ID}
FASTQ_DIR=$WORK_DIR/fastq
LOG_DIR=$WORK_DIR/logs
OUTPUT_DIR=/data/HTS/${ORGANISM}/bam/${STUDY_ID}
HISAT2_INDEX=/data/genomes/hisat2_index/${ORGANISM}

# Validate HISAT2 index exists
if [ ! -f "${HISAT2_INDEX}.1.ht2" ]; then
    echo "ERROR: HISAT2 index not found: ${HISAT2_INDEX}"
    echo "Available indexes:"
    ls -d /data/genomes/hisat2_index/*/ 2>/dev/null || echo "  None found"
    exit 1
fi

# Create directories
mkdir -p "$FASTQ_DIR" "$LOG_DIR" "$OUTPUT_DIR"

# Progress file for resume support
PROGRESS_FILE=$WORK_DIR/progress.txt
touch "$PROGRESS_FILE"

# Log file
MAIN_LOG=$WORK_DIR/pipeline_$(date +%Y%m%d_%H%M%S).log

echo "Work directory: $WORK_DIR"
echo "Output directory: $OUTPUT_DIR"
echo "Log file: $MAIN_LOG"
echo ""

# Activate conda environment
if [ -f ~/miniconda3/bin/activate ]; then
    source ~/miniconda3/bin/activate biotools 2>/dev/null || true
fi

# Extract SRR IDs from metadata (skip header)
SAMPLES=$(awk -F'\t' '
    /^## SAMPLE METADATA/ { in_samples=1; next }
    /^##/ { in_samples=0 }
    in_samples && !/^#/ && !/^SRR_ID/ && NF>0 { print $1 }
' "$METADATA_TSV")

TOTAL=$(echo "$SAMPLES" | wc -w | tr -d ' ')
echo "Found $TOTAL samples to process"
echo ""

# Function to get ENA FTP URL for an SRR ID
get_ena_url() {
    local srr=$1
    local prefix=${srr:0:6}
    local suffix=${srr: -2}
    # ENA URL pattern
    echo "ftp://ftp.sra.ebi.ac.uk/vol1/fastq/${prefix}/0${suffix}/${srr}"
}

# Process each sample
COUNT=0
FAILED=0
for SRR in $SAMPLES; do
    COUNT=$((COUNT + 1))
    echo "[$COUNT/$TOTAL] Processing $SRR..." | tee -a "$MAIN_LOG"

    # Check if already completed
    if grep -q "^${SRR}:COMPLETE$" "$PROGRESS_FILE" 2>/dev/null; then
        echo "  Already complete, skipping" | tee -a "$MAIN_LOG"
        continue
    fi

    # Check if BigWig already exists in output
    if [ -f "$OUTPUT_DIR/${SRR}/${SRR}_sorted_hits.bigwig" ]; then
        echo "  BigWig exists, marking complete" | tee -a "$MAIN_LOG"
        echo "${SRR}:COMPLETE" >> "$PROGRESS_FILE"
        continue
    fi

    SAMPLE_LOG=$LOG_DIR/${SRR}.log
    echo "  Log: $SAMPLE_LOG" | tee -a "$MAIN_LOG"

    # Mark as in progress
    echo "${SRR}:STARTED:$(date)" >> "$PROGRESS_FILE"

    (
        set -e

        # Get ENA URL
        ENA_URL=$(get_ena_url "$SRR")

        # Download FASTQ files
        echo "[$(date)] Downloading from ENA..." >> "$SAMPLE_LOG"
        if [ ! -f "$FASTQ_DIR/${SRR}_1.fastq.gz" ]; then
            wget -q -O "$FASTQ_DIR/${SRR}_1.fastq.gz" "${ENA_URL}/${SRR}_1.fastq.gz" 2>> "$SAMPLE_LOG" || \
            wget -q -O "$FASTQ_DIR/${SRR}_1.fastq.gz" "${ENA_URL}/${SRR}.fastq.gz" 2>> "$SAMPLE_LOG"
        fi

        # Check if paired-end
        if wget -q --spider "${ENA_URL}/${SRR}_2.fastq.gz" 2>/dev/null; then
            if [ ! -f "$FASTQ_DIR/${SRR}_2.fastq.gz" ]; then
                wget -q -O "$FASTQ_DIR/${SRR}_2.fastq.gz" "${ENA_URL}/${SRR}_2.fastq.gz" 2>> "$SAMPLE_LOG"
            fi
            PAIRED=true
        else
            PAIRED=false
        fi

        # Align with HISAT2
        echo "[$(date)] Aligning with HISAT2..." >> "$SAMPLE_LOG"
        mkdir -p "$OUTPUT_DIR/${SRR}"

        if [ "$PAIRED" = true ]; then
            hisat2 -p $THREADS --dta -x "$HISAT2_INDEX" \
                -1 "$FASTQ_DIR/${SRR}_1.fastq.gz" \
                -2 "$FASTQ_DIR/${SRR}_2.fastq.gz" 2>> "$SAMPLE_LOG" | \
                samtools view -@ $THREADS -bS - | \
                samtools sort -@ $THREADS -o "$OUTPUT_DIR/${SRR}/${SRR}_sorted_hits.bam" -
        else
            hisat2 -p $THREADS --dta -x "$HISAT2_INDEX" \
                -U "$FASTQ_DIR/${SRR}_1.fastq.gz" 2>> "$SAMPLE_LOG" | \
                samtools view -@ $THREADS -bS - | \
                samtools sort -@ $THREADS -o "$OUTPUT_DIR/${SRR}/${SRR}_sorted_hits.bam" -
        fi

        # Index BAM
        echo "[$(date)] Indexing BAM..." >> "$SAMPLE_LOG"
        samtools index "$OUTPUT_DIR/${SRR}/${SRR}_sorted_hits.bam"

        # Generate BigWig (CPM normalized)
        echo "[$(date)] Generating BigWig..." >> "$SAMPLE_LOG"
        bamCoverage -b "$OUTPUT_DIR/${SRR}/${SRR}_sorted_hits.bam" \
            -o "$OUTPUT_DIR/${SRR}/${SRR}_sorted_hits.bigwig" \
            --normalizeUsing CPM -p $THREADS 2>> "$SAMPLE_LOG"

        # Clean up FASTQ and BAM (keep only BigWig)
        echo "[$(date)] Cleaning up..." >> "$SAMPLE_LOG"
        rm -f "$FASTQ_DIR/${SRR}_1.fastq.gz" "$FASTQ_DIR/${SRR}_2.fastq.gz"
        rm -f "$OUTPUT_DIR/${SRR}/${SRR}_sorted_hits.bam"
        rm -f "$OUTPUT_DIR/${SRR}/${SRR}_sorted_hits.bam.bai"

        echo "[$(date)] Complete" >> "$SAMPLE_LOG"

    ) 2>&1 | tee -a "$SAMPLE_LOG"

    # Check if successful
    if [ -f "$OUTPUT_DIR/${SRR}/${SRR}_sorted_hits.bigwig" ]; then
        echo "  SUCCESS" | tee -a "$MAIN_LOG"
        echo "${SRR}:COMPLETE" >> "$PROGRESS_FILE"
    else
        echo "  FAILED - check $SAMPLE_LOG" | tee -a "$MAIN_LOG"
        echo "${SRR}:FAILED:$(date)" >> "$PROGRESS_FILE"
        FAILED=$((FAILED + 1))
    fi

    echo "" | tee -a "$MAIN_LOG"
done

# Summary
echo "=============================================="
echo "Pipeline Complete"
echo "=============================================="
echo "Total samples:  $TOTAL"
echo "Successful:     $((TOTAL - FAILED))"
echo "Failed:         $FAILED"
echo ""
echo "Output: $OUTPUT_DIR"
echo "Logs:   $LOG_DIR"
echo ""
echo "Next steps:"
echo "  1. python extract_alignment_stats.py $METADATA_TSV $LOG_DIR"
echo "  2. python import_rnaseq.py $METADATA_TSV"
echo "=============================================="

if [ $FAILED -gt 0 ]; then
    echo ""
    echo "WARNING: $FAILED sample(s) failed. Check logs for details."
    echo "To retry failed samples, run this script again."
    exit 1
fi
