#!/bin/bash
# =============================================================================
# CGD ChIP-seq / ChEC-seq processing pipeline
#
# Produces, per study:
#   1. per-sample CPM coverage bigwigs        (QC; same as the RNA-seq pipeline)
#   2. per-IP log2(IP/control) ratio bigwigs  (the primary JBrowse display track)
#
# Differences from run_rnaseq_pipeline.sh:
#   - HISAT2 runs with --no-spliced-alignment (DNA fragments, no introns)
#   - PCR duplicates are removed (samtools fixmate/markdup)
#   - BAMs are kept until the ratio step completes (bamCompare needs them)
#   - metadata pairs each IP sample with its control(s) via the Control_SRR
#     column; multiple controls are merged into one denominator BAM
#
# Usage:
#   run_chipseq_pipeline.sh <Study_ID> <organism> <metadata.tsv> [output_base]
#
# Metadata: tab-separated with header, one row per SRR:
#   SRR_ID  Condition_Label  Assay_Type  Role  Target  Control_SRR  Replicate  Strain  Notes
#   - Role is IP or control
#   - Control_SRR: comma-separated control SRR(s), IP rows only
#   - Assay_Type: ChIP-seq or ChEC-seq (labels/category only; processing is identical)
#
# Example:
#   ./run_chipseq_pipeline.sh She_2024 C_albicans_SC5314 ../She_2024.chipseq.tsv
# =============================================================================

set -uo pipefail

STUDY=${1:?Usage: run_chipseq_pipeline.sh <Study_ID> <organism> <metadata.tsv> [output_base]}
ORGANISM=${2:?organism required (e.g. C_albicans_SC5314)}
METADATA=${3:?metadata.tsv required}
BASE=${4:-/data/HTS}

THREADS=2
FRAGMENT_LENGTH=200   # fragment extension for single-end reads
BIN_SIZE=25           # ratio bigwig bin size (bp)
PSEUDOCOUNT=1

OUTPUT_DIR="$BASE/$ORGANISM/chipseq/$STUDY"
RATIO_DIR="$OUTPUT_DIR/ratios"
FASTQ_DIR="$OUTPUT_DIR/fastq_tmp"
LOG_DIR="$OUTPUT_DIR/logs"
HISAT2_INDEX="/data/genomes/hisat2_index/$ORGANISM"
SUMMARY="$OUTPUT_DIR/${STUDY}_alignment_summary.tsv"

mkdir -p "$OUTPUT_DIR" "$RATIO_DIR" "$FASTQ_DIR" "$LOG_DIR"

# Activate the biotools conda env (hisat2, samtools, fastp, deeptools)
if [ -f ~/miniconda3/bin/activate ]; then
    source ~/miniconda3/bin/activate biotools 2>/dev/null || true
fi

for tool in hisat2 samtools fastp bamCoverage bamCompare; do
    command -v $tool >/dev/null || { echo "ERROR: $tool not found"; exit 1; }
done
[ -f "${HISAT2_INDEX}.1.ht2" ] || ls "${HISAT2_INDEX}".*.ht2 >/dev/null 2>&1 || {
    echo "ERROR: HISAT2 index not found at $HISAT2_INDEX"; exit 1; }

echo -e "srr\trole\treads\talignment_rate\tdup_removed_bam" > "$SUMMARY"

get_ena_url() {
    local srr=$1
    local six=${srr:0:6}
    if [ ${#srr} -gt 9 ]; then
        local suffix
        suffix=$(printf "%03d" "${srr:9}")
        echo "https://ftp.sra.ebi.ac.uk/vol1/fastq/${six}/${suffix}/${srr}"
    else
        echo "https://ftp.sra.ebi.ac.uk/vol1/fastq/${six}/${srr}"
    fi
}

download_fastq() {
    local url=$1 dest=$2 tries=0
    while [ $tries -lt 5 ]; do
        if wget -q -c --tries=3 --timeout=60 -O "$dest" "$url"; then
            gzip -t "$dest" 2>/dev/null && return 0
            # Download "completed" but the file is corrupt (e.g. a partial
            # left by a crash that -c resumed onto) — discard and refetch,
            # otherwise every retry inherits the same poisoned file.
            rm -f "$dest"
        fi
        tries=$((tries + 1))
        sleep 10
    done
    rm -f "$dest"
    return 1
}

# Column lookup by header name so column order in the sheet doesn't matter.
col_idx() {
    head -1 "$METADATA" | tr '\t' '\n' | grep -nix "$1" | cut -d: -f1
}
SRR_COL=$(col_idx "SRR_ID")
ROLE_COL=$(col_idx "Role")
CTRL_COL=$(col_idx "Control_SRR")
LABEL_COL=$(col_idx "Condition_Label")
[ -n "$SRR_COL" ] && [ -n "$ROLE_COL" ] && [ -n "$CTRL_COL" ] || {
    echo "ERROR: metadata must have SRR_ID, Role, and Control_SRR columns"; exit 1; }

ALL_SRRS=$(tail -n +2 "$METADATA" | awk -F'\t' -v c="$SRR_COL" 'length($c) {print $c}')

# =========================================================================
# Phase 1: download, trim, align, dedup, per-sample coverage
# =========================================================================
for SRR in $ALL_SRRS; do
    SAMPLE_LOG="$LOG_DIR/${SRR}.log"
    FINAL_BAM="$OUTPUT_DIR/${SRR}/${SRR}_dedup.bam"
    if [ -s "$FINAL_BAM" ] && [ -s "${FINAL_BAM}.bai" ]; then
        echo "[$(date)] $SRR already processed, skipping"
        continue
    fi
    echo "[$(date)] === Processing $SRR ==="
    (
        set -e
        mkdir -p "$OUTPUT_DIR/${SRR}"
        ENA_URL=$(get_ena_url "$SRR")

        # Use pre-staged fastqs when present and intact (e.g. fetched from
        # NCBI via prefetch/fasterq-dump during an ENA outage). The ENA path
        # below must not run in that case: wget -O truncates the file and
        # download_fastq deletes it outright on failure.
        if gzip -t "$FASTQ_DIR/${SRR}_1.fastq.gz" 2>/dev/null; then
            echo "[$(date)] Using pre-staged fastq(s) for $SRR" > "$SAMPLE_LOG"
            PAIRED=false
            if gzip -t "$FASTQ_DIR/${SRR}_2.fastq.gz" 2>/dev/null; then
                PAIRED=true
            fi
        else
            echo "[$(date)] Downloading $SRR from ENA" > "$SAMPLE_LOG"
            if ! download_fastq "${ENA_URL}/${SRR}_1.fastq.gz" "$FASTQ_DIR/${SRR}_1.fastq.gz"; then
                download_fastq "${ENA_URL}/${SRR}.fastq.gz" "$FASTQ_DIR/${SRR}_1.fastq.gz"
            fi
            PAIRED=false
            if wget -q --spider --tries=3 --timeout=30 "${ENA_URL}/${SRR}_2.fastq.gz" 2>/dev/null; then
                download_fastq "${ENA_URL}/${SRR}_2.fastq.gz" "$FASTQ_DIR/${SRR}_2.fastq.gz"
                PAIRED=true
            fi
        fi

        echo "[$(date)] Trimming with fastp (paired=$PAIRED)" >> "$SAMPLE_LOG"
        if [ "$PAIRED" = true ]; then
            timeout -k 30 3600 fastp \
                -i "$FASTQ_DIR/${SRR}_1.fastq.gz" -I "$FASTQ_DIR/${SRR}_2.fastq.gz" \
                -o "$FASTQ_DIR/${SRR}_1.trim.fastq.gz" -O "$FASTQ_DIR/${SRR}_2.trim.fastq.gz" \
                --thread $THREADS -j "$LOG_DIR/${SRR}.fastp.json" -h "$LOG_DIR/${SRR}.fastp.html" \
                >> "$SAMPLE_LOG" 2>&1
        else
            timeout -k 30 3600 fastp \
                -i "$FASTQ_DIR/${SRR}_1.fastq.gz" \
                -o "$FASTQ_DIR/${SRR}_1.trim.fastq.gz" \
                --thread $THREADS -j "$LOG_DIR/${SRR}.fastp.json" -h "$LOG_DIR/${SRR}.fastp.html" \
                >> "$SAMPLE_LOG" 2>&1
        fi

        echo "[$(date)] Aligning with HISAT2 (--no-spliced-alignment)" >> "$SAMPLE_LOG"
        if [ "$PAIRED" = true ]; then
            hisat2 -p $THREADS --no-spliced-alignment --no-temp-splicesite -x "$HISAT2_INDEX" \
                -1 "$FASTQ_DIR/${SRR}_1.trim.fastq.gz" -2 "$FASTQ_DIR/${SRR}_2.trim.fastq.gz" \
                --summary-file "$LOG_DIR/${SRR}.hisat2.txt" 2>> "$SAMPLE_LOG" \
                | samtools view -b -q 10 - > "$OUTPUT_DIR/${SRR}/${SRR}_raw.bam"
        else
            hisat2 -p $THREADS --no-spliced-alignment --no-temp-splicesite -x "$HISAT2_INDEX" \
                -U "$FASTQ_DIR/${SRR}_1.trim.fastq.gz" \
                --summary-file "$LOG_DIR/${SRR}.hisat2.txt" 2>> "$SAMPLE_LOG" \
                | samtools view -b -q 10 - > "$OUTPUT_DIR/${SRR}/${SRR}_raw.bam"
        fi

        echo "[$(date)] Removing PCR duplicates" >> "$SAMPLE_LOG"
        # Both sorts run concurrently in this pipe; keep -m small or the
        # combined footprint OOMs the 8GB processing host (seen 2026-08-12).
        samtools sort -n -@ $THREADS -m 384M "$OUTPUT_DIR/${SRR}/${SRR}_raw.bam" \
            | samtools fixmate -m - - \
            | samtools sort -@ $THREADS -m 384M - \
            | samtools markdup -r - "$FINAL_BAM"
        samtools index "$FINAL_BAM"
        rm -f "$OUTPUT_DIR/${SRR}/${SRR}_raw.bam"

        echo "[$(date)] Per-sample CPM coverage bigwig" >> "$SAMPLE_LOG"
        bamCoverage -b "$FINAL_BAM" \
            -o "$OUTPUT_DIR/${SRR}/${SRR}_coverage.bigwig" \
            --normalizeUsing CPM --binSize $BIN_SIZE -p $THREADS >> "$SAMPLE_LOG" 2>&1

        rm -f "$FASTQ_DIR/${SRR}"_*.fastq.gz
        echo "[$(date)] $SRR done" >> "$SAMPLE_LOG"
    )
    if [ $? -ne 0 ]; then
        echo "[$(date)] ERROR processing $SRR (see $SAMPLE_LOG)"
        echo -e "${SRR}\t?\t?\tFAILED\t" >> "$SUMMARY"
        continue
    fi
    RATE=$(grep -o "[0-9.]*% overall alignment rate" "$LOG_DIR/${SRR}.hisat2.txt" 2>/dev/null | grep -o "^[0-9.]*" || echo "?")
    READS=$(head -1 "$LOG_DIR/${SRR}.hisat2.txt" 2>/dev/null | grep -o "^[0-9]*" || echo "?")
    ROLE=$(tail -n +2 "$METADATA" | awk -F'\t' -v s="$SRR" -v c="$SRR_COL" -v r="$ROLE_COL" '$c==s {print $r}')
    echo -e "${SRR}\t${ROLE}\t${READS}\t${RATE}\t$FINAL_BAM" >> "$SUMMARY"
done

# =========================================================================
# Phase 2: log2(IP/control) ratio bigwigs
# =========================================================================
echo "[$(date)] === Building log2 ratio tracks ==="
tail -n +2 "$METADATA" | while IFS= read -r LINE; do
    # awk keeps empty tab-separated fields positional (bash read -a does not)
    SRR=$(echo "$LINE" | awk -F'\t' -v c="$SRR_COL" '{print $c}')
    ROLE=$(echo "$LINE" | awk -F'\t' -v c="$ROLE_COL" '{print $c}')
    CTRLS=$(echo "$LINE" | awk -F'\t' -v c="$CTRL_COL" '{print $c}' | tr -d ' ')
    [ -n "$SRR" ] || continue
    ROLE_LC=$(echo "$ROLE" | tr 'A-Z' 'a-z')
    [ "$ROLE_LC" = "ip" ] || continue
    if [ -z "$CTRLS" ]; then
        echo "WARNING: IP sample $SRR has no Control_SRR; skipping ratio"
        continue
    fi

    IP_BAM="$OUTPUT_DIR/${SRR}/${SRR}_dedup.bam"
    [ -s "$IP_BAM" ] || { echo "WARNING: no BAM for IP $SRR; skipping ratio"; continue; }

    # Denominator: single control BAM, or a merged BAM for pooled controls.
    CTRL_LIST=$(echo "$CTRLS" | tr ',' ' ')
    N_CTRL=$(echo "$CTRL_LIST" | wc -w)
    if [ "$N_CTRL" -eq 1 ]; then
        CTRL_BAM="$OUTPUT_DIR/${CTRL_LIST// /}/${CTRL_LIST// /}_dedup.bam"
    else
        MERGE_KEY=$(echo "$CTRL_LIST" | tr ' ' '_')
        CTRL_BAM="$OUTPUT_DIR/merged_controls_${MERGE_KEY}.bam"
        if [ ! -s "$CTRL_BAM" ]; then
            BAMS=""
            for C in $CTRL_LIST; do BAMS="$BAMS $OUTPUT_DIR/$C/${C}_dedup.bam"; done
            samtools merge -f -@ $THREADS "$CTRL_BAM" $BAMS && samtools index "$CTRL_BAM"
        fi
    fi
    [ -s "$CTRL_BAM" ] || { echo "WARNING: control BAM missing for IP $SRR; skipping"; continue; }

    # Single-end data needs an explicit fragment-extension length.
    EXTEND="--extendReads"
    if ! samtools view -f 1 "$IP_BAM" 2>/dev/null | head -1 | grep -q .; then
        EXTEND="--extendReads $FRAGMENT_LENGTH"
    fi

    OUT="$RATIO_DIR/${STUDY}_${SRR}_log2ratio.bigwig"
    if [ -s "$OUT" ]; then
        echo "[$(date)] ratio for $SRR exists, skipping"
        continue
    fi
    echo "[$(date)] bamCompare: $SRR vs [$CTRLS]"
    bamCompare -b1 "$IP_BAM" -b2 "$CTRL_BAM" \
        --operation log2 --pseudocount $PSEUDOCOUNT \
        --binSize $BIN_SIZE $EXTEND -p $THREADS \
        -o "$OUT" >> "$LOG_DIR/${SRR}.ratio.log" 2>&1 \
        || echo "ERROR: bamCompare failed for $SRR (see $LOG_DIR/${SRR}.ratio.log)"
done

rmdir "$FASTQ_DIR" 2>/dev/null
echo "[$(date)] === Pipeline complete ==="
echo "Summary:  $SUMMARY"
echo "Coverage: $OUTPUT_DIR/<SRR>/<SRR>_coverage.bigwig"
echo "Ratios:   $RATIO_DIR/${STUDY}_<SRR>_log2ratio.bigwig"
