#!/bin/bash
set -e

# Activate conda environment if available
if [ -f "$HOME/miniconda3/bin/activate" ]; then
    source "$HOME/miniconda3/bin/activate" biotools 2>/dev/null || true
fi

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

SPECIES="$1"
FASTQ_DIR="$2"
SAMPLE_NAME="$3"
OUTPUT_DIR="${4:-/data/tmp/dataset_import/aligned}"

if [ -z "$SPECIES" ] || [ -z "$FASTQ_DIR" ] || [ -z "$SAMPLE_NAME" ]; then
    echo -e "${RED}Usage: $0 <SPECIES> <FASTQ_DIR> <SAMPLE_NAME> [OUTPUT_DIR]${NC}"
    exit 1
fi

THREADS=8
HISAT2_EXTRA_ARGS="--dta"
GENOME_BASE="/data/genomes"

case "$SPECIES" in
    C_albicans_SC5314)
        GENOME_FASTA="$GENOME_BASE/C_albicans_SC5314_A22_current_chromosomes.fasta"
        HISAT2_INDEX="$GENOME_BASE/hisat2_index/C_albicans_SC5314"
        ;;
    C_auris_B8441)
        GENOME_FASTA="$GENOME_BASE/C_auris_B8441_current_chromosomes.fasta"
        HISAT2_INDEX="$GENOME_BASE/hisat2_index/C_auris_B8441"
        ;;
    C_glabrata_CBS138)
        GENOME_FASTA="$GENOME_BASE/C_glabrata_CBS138_current_chromosomes.fasta"
        HISAT2_INDEX="$GENOME_BASE/hisat2_index/C_glabrata_CBS138"
        ;;
    C_dubliniensis_CD36)
        GENOME_FASTA="$GENOME_BASE/C_dubliniensis_CD36_current_chromosomes.fasta"
        HISAT2_INDEX="$GENOME_BASE/hisat2_index/C_dubliniensis_CD36"
        ;;
    C_parapsilosis_CDC317)
        GENOME_FASTA="$GENOME_BASE/C_parapsilosis_CDC317_current_chromosomes.fasta"
        HISAT2_INDEX="$GENOME_BASE/hisat2_index/C_parapsilosis_CDC317"
        ;;
    C_tropicalis_MYA3404)
        GENOME_FASTA="$GENOME_BASE/C_tropicalis_current_chromosomes.fasta"
        HISAT2_INDEX="$GENOME_BASE/hisat2_index/C_tropicalis"
        ;;
    *)
        echo -e "${RED}Error: Unknown species: $SPECIES${NC}"
        exit 1
        ;;
esac

# Build index if needed
if [ ! -f "${HISAT2_INDEX}.1.ht2" ]; then
    echo -e "${YELLOW}Building HISAT2 index...${NC}"
    mkdir -p $(dirname "$HISAT2_INDEX")
    hisat2-build -p $THREADS "$GENOME_FASTA" "$HISAT2_INDEX"
fi

mkdir -p "$OUTPUT_DIR"

echo -e "${GREEN}=== Aligning $SAMPLE_NAME ===${NC}"

# Detect input files
if [ -f "$FASTQ_DIR/${SAMPLE_NAME}_1.fastq.gz" ]; then
    R1="$FASTQ_DIR/${SAMPLE_NAME}_1.fastq.gz"
    [ -f "$FASTQ_DIR/${SAMPLE_NAME}_2.fastq.gz" ] && R2="$FASTQ_DIR/${SAMPLE_NAME}_2.fastq.gz"
elif [ -f "$FASTQ_DIR/${SAMPLE_NAME}.fastq.gz" ]; then
    R1="$FASTQ_DIR/${SAMPLE_NAME}.fastq.gz"
else
    echo -e "${RED}Error: No FASTQ for $SAMPLE_NAME${NC}"
    exit 1
fi

SORTED_BAM="$OUTPUT_DIR/${SAMPLE_NAME}.sorted.bam"
[ -f "$SORTED_BAM" ] && echo "Already exists: $SORTED_BAM" && exit 0

if [ -n "$R2" ]; then
    hisat2 -p $THREADS $HISAT2_EXTRA_ARGS -x "$HISAT2_INDEX" -1 "$R1" -2 "$R2" 2>"$OUTPUT_DIR/${SAMPLE_NAME}.log" | \
        samtools view -@ $THREADS -bS - | samtools sort -@ $THREADS -o "$SORTED_BAM"
else
    hisat2 -p $THREADS $HISAT2_EXTRA_ARGS -x "$HISAT2_INDEX" -U "$R1" 2>"$OUTPUT_DIR/${SAMPLE_NAME}.log" | \
        samtools view -@ $THREADS -bS - | samtools sort -@ $THREADS -o "$SORTED_BAM"
fi

samtools index -@ $THREADS "$SORTED_BAM"
tail -5 "$OUTPUT_DIR/${SAMPLE_NAME}.log"
echo -e "${GREEN}Done: $SORTED_BAM${NC}"
