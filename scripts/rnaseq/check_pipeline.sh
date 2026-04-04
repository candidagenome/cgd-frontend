#!/bin/bash
#
# check_pipeline.sh
# Check the status of a running RNA-Seq pipeline on Tools server
#
# Usage: ./check_pipeline.sh <strain> <srr_id>

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../config.sh"

if [ $# -lt 2 ]; then
    echo "Usage: $0 <strain> <srr_id>"
    exit 1
fi

STRAIN="$1"
SRR_ID="$2"

LOG_PATH="${TOOLS_HTS_PATH}/${STRAIN}/bam/${SRR_ID}/${SRR_ID}_pipeline_log.txt"

echo -e "${YELLOW}=== Pipeline Status ===${NC}"
echo "Strain: $STRAIN"
echo "SRR ID: $SRR_ID"
echo ""

# Check if process is running
echo -e "${YELLOW}Process status:${NC}"
RUNNING=$(ssh -i "$TOOLS_KEY" "${TOOLS_USER}@${TOOLS_SERVER}" "ps aux | grep -v grep | grep 'RNAseq_pipeline.pl.*${SRR_ID}'" 2>/dev/null || true)
if [ -n "$RUNNING" ]; then
    echo -e "  ${GREEN}● Running${NC}"
else
    echo -e "  ${CYAN}○ Not running${NC}"
fi
echo ""

# Check log file
echo -e "${YELLOW}Log file (first 20 lines):${NC}"
ssh -i "$TOOLS_KEY" "${TOOLS_USER}@${TOOLS_SERVER}" "head -20 ${LOG_PATH}" 2>/dev/null || echo "  Log file not found yet"
echo ""

# Check output files
echo -e "${YELLOW}Output files:${NC}"
ssh -i "$TOOLS_KEY" "${TOOLS_USER}@${TOOLS_SERVER}" "ls -lh ${TOOLS_HTS_PATH}/${STRAIN}/bam/${SRR_ID}/" 2>/dev/null || echo "  Output directory not found yet"
