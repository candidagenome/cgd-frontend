#!/bin/bash
# Wang_2024 JBrowse2 Track Addition Script
# =========================================
# Run this on cgd-frontend-dev to add density and alignment tracks
#
# Usage: bash Wang_2024_jbrowse2_add_tracks.sh

set -e

JBROWSE_DIR=/data/jbrowse2
DATA_DIR=/data/HTS/C_auris_B8441/bam/Wang_2024
CONFIG_FILE=$JBROWSE_DIR/config.json

# Backup config
cp $CONFIG_FILE ${CONFIG_FILE}.bak.$(date +%Y%m%d_%H%M%S)

echo "=== Creating symlinks for BAM files ==="

SAMPLES="SRR28790270 SRR28790272 SRR28790274 SRR28790276 SRR28790278 SRR28790280 SRR28791430 SRR28791431 SRR28791432 SRR28791433 SRR28791434 SRR28791437 SRR28791438"

for SRR in $SAMPLES; do
    # Create BAM symlink
    if [ ! -L "$JBROWSE_DIR/Wang2024_${SRR}.bam" ]; then
        ln -s "$DATA_DIR/${SRR}.sorted.bam" "$JBROWSE_DIR/Wang2024_${SRR}.bam"
        echo "Created: Wang2024_${SRR}.bam"
    fi
    # Create BAM index symlink
    if [ ! -L "$JBROWSE_DIR/Wang2024_${SRR}.bam.bai" ]; then
        ln -s "$DATA_DIR/${SRR}.sorted.bam.bai" "$JBROWSE_DIR/Wang2024_${SRR}.bam.bai"
        echo "Created: Wang2024_${SRR}.bam.bai"
    fi
done

echo ""
echo "=== Symlinks created ==="
echo ""
echo "Now you need to add the track definitions to config.json."
echo "The JSON track definitions are in: Wang_2024_jbrowse2_tracks.json"
echo ""
echo "To add them, you can use jq or manually edit config.json:"
echo "  1. Open config.json"
echo "  2. Find the 'tracks' array"
echo "  3. Add the tracks from Wang_2024_jbrowse2_tracks.json"
