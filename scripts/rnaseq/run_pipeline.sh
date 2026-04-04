#!/bin/bash
#
# run_pipeline.sh
# Runs the RNA-Seq alignment pipeline on the Tools server
#
# Usage: ./run_pipeline.sh <strain> <srr_id>
#
# Example:
#   ./run_pipeline.sh C_auris_B8441 SRR14758164
#   ./run_pipeline.sh C_albicans_SC5314_HapA SRR27912204

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../config.sh"

usage() {
    echo "Usage: $0 <strain> <srr_id>"
    echo ""
    echo "Valid strains:"
    echo "  C_albicans_SC5314_HapA"
    echo "  C_albicans_SC5314_HapB"
    echo "  C_auris_B8441"
    echo "  C_dubliniensis_CD36"
    echo "  C_glabrata_CBS138"
    echo "  C_parapsilosis_CDC317"
    echo ""
    echo "Example:"
    echo "  $0 C_auris_B8441 SRR14758164"
    exit 1
}

if [ $# -lt 2 ]; then
    usage
fi

STRAIN="$1"
SRR_ID="$2"

echo -e "${YELLOW}=== Run RNA-Seq Pipeline ===${NC}"
echo "Server:  Tools (${TOOLS_SERVER})"
echo "Strain:  $STRAIN"
echo "SRR ID:  $SRR_ID"
echo ""

# Start pipeline in background
echo -e "${YELLOW}Starting pipeline (runs in background, takes hours)...${NC}"
ssh -i "$TOOLS_KEY" "${TOOLS_USER}@${TOOLS_SERVER}" \
    "nohup /tools/RNAseq_pipeline.pl ${STRAIN} ${SRR_ID} > /tmp/${SRR_ID}.log 2>&1 &"

echo -e "${GREEN}✓${NC} Pipeline started"
echo ""
echo "To check progress:"
echo "  $0 --status $STRAIN $SRR_ID"
echo ""
echo "Or manually:"
echo "  ssh -i \"$TOOLS_KEY\" ${TOOLS_USER}@${TOOLS_SERVER}"
echo "  less ${TOOLS_HTS_PATH}/${STRAIN}/bam/${SRR_ID}/${SRR_ID}_pipeline_log.txt"
