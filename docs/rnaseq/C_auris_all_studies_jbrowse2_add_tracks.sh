#!/bin/bash
# C. auris RNA-seq JBrowse2 Track Addition Script
# ================================================
# Adds all C. auris RNA-seq studies to JBrowse2
# Run this on cgd-frontend-dev
#
# Usage: bash C_auris_all_studies_jbrowse2_add_tracks.sh

set -e

JBROWSE_DIR=/data/jbrowse2
HTS_DIR=/data/HTS/C_auris_B8441/bam
CONFIG_FILE=$JBROWSE_DIR/config.json

# Backup config
cp $CONFIG_FILE ${CONFIG_FILE}.bak.$(date +%Y%m%d_%H%M%S)

echo "=== Creating symlinks for all C. auris RNA-seq datasets ==="

# Define all studies and their samples
# Format: Study_Name:SRR1,SRR2,SRR3,...

declare -A STUDIES

STUDIES["Balla_2023"]="SRR23266136,SRR23266137,SRR23266138,SRR23266139,SRR23266140,SRR23266141"
STUDIES["Biermann_2022"]="SRR17805771,SRR17805772,SRR17805773,SRR17805774,SRR17805775,SRR17805776,SRR17805777,SRR17805778,SRR17805779,SRR17805780,SRR17805781,SRR17805782,SRR17805783,SRR17805784,SRR17805785,SRR17805786,SRR17805787,SRR17805788,SRR17805789,SRR17805790,SRR17805791,SRR17805792,SRR17805793,SRR17805794"
STUDIES["Chow_2023"]="SRR22315644,SRR22315645,SRR22315646,SRR22315647,SRR22315648,SRR22315649,SRR22315650,SRR22315651,SRR22315652"
STUDIES["Jakab_2021"]="SRR15131027,SRR15131028,SRR15131029,SRR15131030,SRR15131031,SRR15131032"
STUDIES["Jenull_2021"]="SRR13576978,SRR13576979,SRR13576980,SRR13576981,SRR13576982,SRR13576983,SRR13576984,SRR13576985,SRR13576986,SRR13576987,SRR13576988,SRR13576989"
STUDIES["Pelletier_2024"]="SRR24915334,SRR24915335,SRR24915336,SRR24915337,SRR24915338,SRR24915339,SRR24915340,SRR24915341,SRR24915342,SRR24915343,SRR24915344,SRR24915345,SRR24915346,SRR24915347,SRR24915348,SRR24915349,SRR24915350,SRR24915351,SRR24915352,SRR24915353,SRR24915354,SRR24915355,SRR24915356,SRR24915357,SRR24915358,SRR24915359,SRR24915360,SRR24915361,SRR24915362,SRR24915363,SRR24915364,SRR24915365,SRR24915366,SRR24915367,SRR24915368,SRR24915369,SRR24915370,SRR24915371,SRR24915372,SRR24915373,SRR24915374,SRR24915375,SRR24915376,SRR24915377,SRR24915378,SRR24915379,SRR24915380,SRR24915381"
STUDIES["Shivarathri_2022"]="SRR17259761,SRR17259762,SRR17259763,SRR17259764,SRR17259765,SRR17259766,SRR17259767,SRR17259768,SRR17259769,SRR17259770,SRR17259771,SRR17259772"
STUDIES["Simm_2022"]="SRR14758158,SRR14758159,SRR14758160,SRR14758161,SRR14758162,SRR14758163,SRR14758164,SRR14758165,SRR14758166,SRR14758167,SRR14758168,SRR14758169"

for STUDY in "${!STUDIES[@]}"; do
    echo ""
    echo "--- Processing $STUDY ---"

    # Get prefix for track naming (remove underscore and year)
    PREFIX=$(echo "$STUDY" | sed 's/_//')

    IFS=',' read -ra SAMPLES <<< "${STUDIES[$STUDY]}"

    for SRR in "${SAMPLES[@]}"; do
        SOURCE_DIR="$HTS_DIR/$STUDY/$SRR"

        # Create BAM symlink
        if [ ! -L "$JBROWSE_DIR/${PREFIX}_${SRR}.bam" ]; then
            if [ -f "$SOURCE_DIR/${SRR}_sorted_hits.bam" ]; then
                ln -s "$SOURCE_DIR/${SRR}_sorted_hits.bam" "$JBROWSE_DIR/${PREFIX}_${SRR}.bam"
                echo "Created: ${PREFIX}_${SRR}.bam"
            else
                echo "WARNING: BAM not found: $SOURCE_DIR/${SRR}_sorted_hits.bam"
            fi
        fi

        # Create BAM index symlink
        if [ ! -L "$JBROWSE_DIR/${PREFIX}_${SRR}.bam.bai" ]; then
            if [ -f "$SOURCE_DIR/${SRR}_sorted_hits.bam.bai" ]; then
                ln -s "$SOURCE_DIR/${SRR}_sorted_hits.bam.bai" "$JBROWSE_DIR/${PREFIX}_${SRR}.bam.bai"
                echo "Created: ${PREFIX}_${SRR}.bam.bai"
            else
                echo "WARNING: BAM index not found: $SOURCE_DIR/${SRR}_sorted_hits.bam.bai"
            fi
        fi

        # Create BigWig symlink for coverage
        if [ ! -L "$JBROWSE_DIR/${PREFIX}_${SRR}_coverage.bigwig" ]; then
            if [ -f "$SOURCE_DIR/${SRR}_sorted_hits.bigwig" ]; then
                ln -s "$SOURCE_DIR/${SRR}_sorted_hits.bigwig" "$JBROWSE_DIR/${PREFIX}_${SRR}_coverage.bigwig"
                echo "Created: ${PREFIX}_${SRR}_coverage.bigwig"
            else
                echo "WARNING: BigWig not found: $SOURCE_DIR/${SRR}_sorted_hits.bigwig"
            fi
        fi
    done
done

echo ""
echo "=== Symlinks created ==="
echo ""
echo "Now add the track definitions from C_auris_all_studies_jbrowse2_tracks.json to config.json"
echo ""
echo "Use: jq '.tracks += input' $CONFIG_FILE ~/C_auris_all_studies_jbrowse2_tracks.json > config.json.new && mv config.json.new $CONFIG_FILE"
