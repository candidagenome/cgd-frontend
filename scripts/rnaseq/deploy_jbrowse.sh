#!/bin/bash
#
# deploy_jbrowse.sh
# Copies RNA-Seq data from Tools server and deploys to JBrowse (dev or prod)
#
# Usage: ./deploy_jbrowse.sh <env> <strain> <srr_id> <author_year>
#
# Examples:
#   ./deploy_jbrowse.sh dev C_auris_B8441 SRR14758164 Simm_2024
#   ./deploy_jbrowse.sh prod C_auris_B8441 SRR14758164 Simm_2024
#   ./deploy_jbrowse.sh dev C_albicans_SC5314 SRR27912204 Iracane_2024 HapA

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/config.sh"

usage() {
    echo "Usage: $0 <env> <strain> <srr_id> <author_year> [haplotype]"
    echo ""
    echo "Arguments:"
    echo "  env          dev or prod"
    echo "  strain       e.g., C_auris_B8441, C_albicans_SC5314"
    echo "  srr_id       SRA Run ID"
    echo "  author_year  Dataset folder (e.g., Simm_2024)"
    echo "  haplotype    HapA or HapB (for C_albicans only)"
    echo ""
    echo "Examples:"
    echo "  $0 dev C_auris_B8441 SRR14758164 Simm_2024"
    echo "  $0 dev C_albicans_SC5314 SRR27912204 Iracane_2024 HapA"
    exit 1
}

if [ $# -lt 4 ]; then
    usage
fi

ENV="$1"
STRAIN="$2"
SRR_ID="$3"
AUTHOR_YEAR="$4"
HAPLOTYPE="${5:-}"

# Validate environment
case "$ENV" in
    dev)
        TARGET_SERVER="$DEV_SERVER"
        TARGET_USER="$DEV_USER"
        TARGET_KEY="$DEV_KEY"
        ;;
    prod)
        TARGET_SERVER="$PROD_SERVER"
        TARGET_USER="$PROD_USER"
        TARGET_KEY="$PROD_KEY"
        ;;
    *)
        echo -e "${RED}Error: env must be 'dev' or 'prod'${NC}"
        usage
        ;;
esac

# Build paths - handle albicans haplotypes
if [[ "$STRAIN" == "C_albicans_SC5314" ]]; then
    if [[ -z "$HAPLOTYPE" ]]; then
        echo -e "${RED}Error: C_albicans_SC5314 requires haplotype (HapA or HapB)${NC}"
        usage
    fi
    TOOLS_STRAIN="${STRAIN}_${HAPLOTYPE}"
    DEST_SUBPATH="${AUTHOR_YEAR}/${HAPLOTYPE}/${SRR_ID}"
else
    TOOLS_STRAIN="$STRAIN"
    DEST_SUBPATH="${AUTHOR_YEAR}/${SRR_ID}"
fi

TOOLS_PATH="${TOOLS_HTS_PATH}/${TOOLS_STRAIN}/bam/${SRR_ID}"
DEST_PATH="${HTS_DATA_PATH}/${STRAIN}/bam/${DEST_SUBPATH}"
CONF_PATH="${JBROWSE_CONF_PATH}/${STRAIN}"
METADATA_FILE="${STRAIN}_MetaData.csv"
TRACKS_FILE="tracks.conf"

echo -e "${YELLOW}=== Deploy to ${ENV^^} JBrowse ===${NC}"
echo "From:    Tools server (${TOOLS_SERVER})"
echo "To:      ${TARGET_SERVER}"
echo "Strain:  $STRAIN"
echo "SRR ID:  $SRR_ID"
echo "Dest:    $DEST_PATH"
echo ""

# Step 1: Check pipeline completed
echo -e "${YELLOW}[1/4] Checking pipeline output on Tools server...${NC}"
REQUIRED_FILES=("sorted_hits.bam" "sorted_hits.bam.bai" "sorted_hits.bam.bigwig")
for file in "${REQUIRED_FILES[@]}"; do
    if ssh -i "$TOOLS_KEY" "${TOOLS_USER}@${TOOLS_SERVER}" "test -f ${TOOLS_PATH}/${file}" 2>/dev/null; then
        echo -e "  ${GREEN}✓${NC} ${file}"
    else
        echo -e "  ${RED}✗${NC} ${file} NOT FOUND"
        echo ""
        echo "Check pipeline status:"
        echo "  ssh -i \"$TOOLS_KEY\" ${TOOLS_USER}@${TOOLS_SERVER}"
        echo "  less ${TOOLS_PATH}/${SRR_ID}_pipeline_log.txt"
        exit 1
    fi
done

# Step 2: Copy files via local temp directory
echo ""
echo -e "${YELLOW}[2/4] Copying files (Tools → local → ${ENV})...${NC}"
TEMP_DIR="/tmp/rnaseq_deploy_$$"
mkdir -p "$TEMP_DIR"
trap "rm -rf $TEMP_DIR" EXIT

# Download from Tools
echo "  Downloading from Tools server..."
scp -i "$TOOLS_KEY" "${TOOLS_USER}@${TOOLS_SERVER}:${TOOLS_PATH}/sorted_hits.bam*" "$TEMP_DIR/"

# Create dest dir and upload
echo "  Uploading to ${ENV} server..."
ssh -i "$TARGET_KEY" "${TARGET_USER}@${TARGET_SERVER}" "mkdir -p ${DEST_PATH}"
scp -i "$TARGET_KEY" "$TEMP_DIR"/sorted_hits.bam* "${TARGET_USER}@${TARGET_SERVER}:${DEST_PATH}/"
echo -e "  ${GREEN}✓${NC} Files copied"

# Step 3: Show template entries
echo ""
echo -e "${YELLOW}[3/4] Template entries for config files:${NC}"
echo ""
echo -e "${CYAN}--- Add to ${METADATA_FILE} ---${NC}"
echo "${SRR_ID},${SRR_ID} - DESCRIPTION,FULL_DESCRIPTION,CONDITION,expression,RNA-Seq,XYPlot,Candida,${STRAIN},${AUTHOR_YEAR%_*},PMID"
echo ""
echo -e "${CYAN}--- Add to ${TRACKS_FILE} ---${NC}"
cat << EOF
[tracks.${SRR_ID}]
storeClass = JBrowse/Store/SeqFeature/BigWig
urlTemplate = ${HTS_DATA_PATH}/${STRAIN}/bam/${DEST_SUBPATH}/sorted_hits.bam.bigwig
type = JBrowse/View/Track/Wiggle/XYPlot
label = ${SRR_ID}
key = ${SRR_ID} - DESCRIPTION
metadata.category = Expression
metadata.technique = RNA-Seq
metadata.first_author = ${AUTHOR_YEAR%_*}
EOF
echo ""

# Step 4: Backup and edit config files on server
echo -e "${YELLOW}[4/4] Backup and edit config files${NC}"
read -p "Edit config files on ${ENV} server now? [Y/n] " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Nn]$ ]]; then
    # Create backups with timestamp
    BACKUP_TIME=$(date +%Y%m%d_%H%M%S)
    echo "  Creating backups..."
    ssh -i "$TARGET_KEY" "${TARGET_USER}@${TARGET_SERVER}" \
        "cd ${CONF_PATH} && cp ${TRACKS_FILE} ${TRACKS_FILE}.bak.${BACKUP_TIME} && cp ${METADATA_FILE} ${METADATA_FILE}.bak.${BACKUP_TIME}"
    echo -e "  ${GREEN}✓${NC} Backups created: ${TRACKS_FILE}.bak.${BACKUP_TIME}, ${METADATA_FILE}.bak.${BACKUP_TIME}"
    echo ""
    echo "Opening ${TRACKS_FILE}..."
    ssh -i "$TARGET_KEY" -t "${TARGET_USER}@${TARGET_SERVER}" "cd ${CONF_PATH} && nano ${TRACKS_FILE}"
    echo "Opening ${METADATA_FILE}..."
    ssh -i "$TARGET_KEY" -t "${TARGET_USER}@${TARGET_SERVER}" "cd ${CONF_PATH} && nano ${METADATA_FILE}"
fi

echo ""
echo -e "${GREEN}=== Deploy to ${ENV^^} Complete ===${NC}"
echo ""
if [ "$ENV" = "dev" ]; then
    echo "Verify at: https://frontend.dev.candidagenome.org/jbrowse"
    echo ""
    echo "When verified, promote to prod:"
    echo "  ./promote_to_prod.sh ${STRAIN} ${SRR_ID} ${AUTHOR_YEAR}${HAPLOTYPE:+ $HAPLOTYPE}"
else
    echo "Verify at: https://www.candidagenome.org/jbrowse"
    echo ""
    echo "Don't forget to update the PUBLIC WIKI!"
fi
