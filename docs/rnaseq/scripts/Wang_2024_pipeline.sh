#!/bin/bash
# Wang_2024 RNA-Seq Processing Pipeline
# =====================================
# Study: PRJNA1086003 - Biofilm formation in C. auris
# Strains: AR0382, AR0387
# Conditions: In Vitro Biofilm (control) vs In Vivo Catheter (experimental)
# Samples: 13 total
#
# Pipeline: HISAT2 alignment -> samtools sort -> bamCoverage (CPM normalized BigWig)
#
# Processing dates: 2025-05-15 to 2025-05-17
# Server: cgd-frontend-dev
# Working directory: /data/tmp/dataset_import/Wang_2024/
# Output: /data/HTS/C_auris_B8441/bam/Wang_2024/
#
# Note: FASTQ downloads use ENA (European Nucleotide Archive) FTP URLs
#       because NCBI SRA toolkit had SSL certificate issues on the server.

set -e

source ~/miniconda3/bin/activate biotools

THREADS=8
HISAT2_INDEX=/data/genomes/hisat2_index/C_auris_B8441
STUDY_DIR=/data/tmp/dataset_import/Wang_2024
FASTQ_DIR=$STUDY_DIR/fastq
ALIGNED_DIR=$STUDY_DIR/aligned
OUTPUT_DIR=/data/HTS/C_auris_B8441/bam/Wang_2024

# Sample mapping with ENA FTP URLs
# URL pattern: ftp://ftp.sra.ebi.ac.uk/vol1/fastq/SRR287/0XX/SRRxxxxxxxx/
# where XX is the last 2 digits of the SRR accession

declare -A URLS
# AR0382 - In Vitro Biofilm (control)
URLS[SRR28790270]="ftp://ftp.sra.ebi.ac.uk/vol1/fastq/SRR287/070/SRR28790270"
URLS[SRR28790272]="ftp://ftp.sra.ebi.ac.uk/vol1/fastq/SRR287/072/SRR28790272"
URLS[SRR28790274]="ftp://ftp.sra.ebi.ac.uk/vol1/fastq/SRR287/074/SRR28790274"
# AR0382 - In Vivo Catheter (experimental)
URLS[SRR28791430]="ftp://ftp.sra.ebi.ac.uk/vol1/fastq/SRR287/030/SRR28791430"
URLS[SRR28791431]="ftp://ftp.sra.ebi.ac.uk/vol1/fastq/SRR287/031/SRR28791431"
URLS[SRR28791432]="ftp://ftp.sra.ebi.ac.uk/vol1/fastq/SRR287/032/SRR28791432"
# AR0387 - In Vitro Biofilm (control)
URLS[SRR28790276]="ftp://ftp.sra.ebi.ac.uk/vol1/fastq/SRR287/076/SRR28790276"
URLS[SRR28790278]="ftp://ftp.sra.ebi.ac.uk/vol1/fastq/SRR287/078/SRR28790278"
URLS[SRR28790280]="ftp://ftp.sra.ebi.ac.uk/vol1/fastq/SRR287/080/SRR28790280"
# AR0387 - In Vivo Catheter (experimental)
URLS[SRR28791433]="ftp://ftp.sra.ebi.ac.uk/vol1/fastq/SRR287/033/SRR28791433"
URLS[SRR28791434]="ftp://ftp.sra.ebi.ac.uk/vol1/fastq/SRR287/034/SRR28791434"
URLS[SRR28791437]="ftp://ftp.sra.ebi.ac.uk/vol1/fastq/SRR287/037/SRR28791437"
URLS[SRR28791438]="ftp://ftp.sra.ebi.ac.uk/vol1/fastq/SRR287/038/SRR28791438"

SAMPLES="SRR28790270 SRR28790272 SRR28790274 SRR28790276 SRR28790278 SRR28790280 SRR28791430 SRR28791431 SRR28791432 SRR28791433 SRR28791434 SRR28791437 SRR28791438"

echo "=== Wang_2024 Pipeline - Started at $(date) ===" | tee -a $STUDY_DIR/pipeline.log

for SRR in $SAMPLES; do
    if [ -f "$OUTPUT_DIR/${SRR}.bw" ]; then
        echo "[$SRR] Already complete, skipping" | tee -a $STUDY_DIR/pipeline.log
        continue
    fi

    echo "[$SRR] Starting at $(date)" | tee -a $STUDY_DIR/pipeline.log
    BASE_URL=${URLS[$SRR]}

    # Download from ENA
    if [ ! -f "$FASTQ_DIR/${SRR}_1.fastq.gz" ] || [ ! -f "$FASTQ_DIR/${SRR}_2.fastq.gz" ]; then
        echo "[$SRR] Downloading from ENA..." | tee -a $STUDY_DIR/pipeline.log
        rm -f $FASTQ_DIR/${SRR}_*.fastq.gz 2>/dev/null
        wget -q -O $FASTQ_DIR/${SRR}_1.fastq.gz "${BASE_URL}/${SRR}_1.fastq.gz"
        wget -q -O $FASTQ_DIR/${SRR}_2.fastq.gz "${BASE_URL}/${SRR}_2.fastq.gz"
    fi

    echo "[$SRR] Aligning with HISAT2..." | tee -a $STUDY_DIR/pipeline.log
    hisat2 -p $THREADS --dta -x $HISAT2_INDEX \
        -1 $FASTQ_DIR/${SRR}_1.fastq.gz \
        -2 $FASTQ_DIR/${SRR}_2.fastq.gz 2>> $ALIGNED_DIR/$SRR.log | \
        samtools view -@ $THREADS -bS - | \
        samtools sort -@ $THREADS -o $ALIGNED_DIR/$SRR.sorted.bam -

    echo "[$SRR] Indexing BAM..." | tee -a $STUDY_DIR/pipeline.log
    samtools index $ALIGNED_DIR/$SRR.sorted.bam

    echo "[$SRR] Generating BigWig..." | tee -a $STUDY_DIR/pipeline.log
    bamCoverage -b $ALIGNED_DIR/$SRR.sorted.bam -o $ALIGNED_DIR/$SRR.bw --normalizeUsing CPM -p $THREADS

    echo "[$SRR] Copying to output..." | tee -a $STUDY_DIR/pipeline.log
    cp $ALIGNED_DIR/$SRR.sorted.bam $OUTPUT_DIR/
    cp $ALIGNED_DIR/$SRR.sorted.bam.bai $OUTPUT_DIR/
    cp $ALIGNED_DIR/$SRR.bw $OUTPUT_DIR/

    echo "[$SRR] Cleaning up FASTQ..." | tee -a $STUDY_DIR/pipeline.log
    rm -f $FASTQ_DIR/${SRR}_1.fastq.gz $FASTQ_DIR/${SRR}_2.fastq.gz

    echo "[$SRR] Complete at $(date)" | tee -a $STUDY_DIR/pipeline.log
done

echo "=== Pipeline complete at $(date) ===" | tee -a $STUDY_DIR/pipeline.log

# Post-processing: Reorganize BigWig files for expression service
# The expression service expects: {study}/{sample}/{sample}_sorted_hits.bigwig
echo "=== Reorganizing BigWig files for expression service ===" | tee -a $STUDY_DIR/pipeline.log
for SRR in $SAMPLES; do
    mkdir -p $OUTPUT_DIR/$SRR
    cp $OUTPUT_DIR/$SRR.bw $OUTPUT_DIR/$SRR/${SRR}_sorted_hits.bigwig
done
echo "=== Reorganization complete ===" | tee -a $STUDY_DIR/pipeline.log
