#!/bin/bash
#
# promote_to_prod.sh
# Copies verified RNA-Seq data and config from dev to prod
#
# Usage: ./promote_to_prod.sh <strain> <srr_id> <author_year> [haplotype]
#
# Example:
#   ./promote_to_prod.sh C_auris_B8441 SRR14758164 Simm_2024

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/config.sh"

usage() {
    echo "Usage: $0 <strain> <srr_id> <author_year> [haplotype]"
    echo ""
    echo "Run this AFTER verifying tracks on dev JBrowse."
    exit 1
}

if [ $# -lt 3 ]; then
    usage
fi

STRAIN="$1"
SRR_ID="$2"
AUTHOR_YEAR="$3"
HAPLOTYPE="${4:-}"

# Build paths
if [[ "$STRAIN" == "C_albicans_SC5314" && -n "$HAPLOTYPE" ]]; then
    DEST_SUBPATH="${AUTHOR_YEAR}/${HAPLOTYPE}/${SRR_ID}"
else
    DEST_SUBPATH="${AUTHOR_YEAR}/${SRR_ID}"
fi

DATA_PATH="${HTS_DATA_PATH}/${STRAIN}/bam/${DEST_SUBPATH}"
CONF_PATH="${JBROWSE_CONF_PATH}/${STRAIN}"
METADATA_FILE="${STRAIN}_MetaData.csv"
TRACKS_FILE="tracks.conf"

echo -e "${YELLOW}=== Promote to Production ===${NC}"
echo "From:    ${DEV_SERVER}"
echo "To:      ${PROD_SERVER}"
echo "Strain:  $STRAIN"
echo "SRR ID:  $SRR_ID"
echo ""

read -p "Continue? [y/N] " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 0
fi

TEMP_DIR="/tmp/rnaseq_promote_$$"
mkdir -p "$TEMP_DIR"
trap "rm -rf $TEMP_DIR" EXIT

# Step 1: Copy data files
echo ""
echo -e "${YELLOW}[1/3] Copying data files...${NC}"
scp -i "$DEV_KEY" "${DEV_USER}@${DEV_SERVER}:${DATA_PATH}/sorted_hits.bam*" "$TEMP_DIR/"
ssh -i "$PROD_KEY" "${PROD_USER}@${PROD_SERVER}" "mkdir -p ${DATA_PATH}"
scp -i "$PROD_KEY" "$TEMP_DIR"/sorted_hits.bam* "${PROD_USER}@${PROD_SERVER}:${DATA_PATH}/"
echo -e "  ${GREEN}✓${NC} Data files copied"

# Step 2: Backup and copy config files
echo ""
echo -e "${YELLOW}[2/3] Backup and copy config files...${NC}"

# Backup prod config files before overwriting
BACKUP_TIME=$(date +%Y%m%d_%H%M%S)
echo "  Creating backups on prod..."
ssh -i "$PROD_KEY" "${PROD_USER}@${PROD_SERVER}" \
    "cd ${CONF_PATH} && cp ${TRACKS_FILE} ${TRACKS_FILE}.bak.${BACKUP_TIME} && cp ${METADATA_FILE} ${METADATA_FILE}.bak.${BACKUP_TIME}"
echo -e "  ${GREEN}✓${NC} Backups created"

# Copy from dev to prod
scp -i "$DEV_KEY" "${DEV_USER}@${DEV_SERVER}:${CONF_PATH}/${TRACKS_FILE}" "$TEMP_DIR/"
scp -i "$DEV_KEY" "${DEV_USER}@${DEV_SERVER}:${CONF_PATH}/${METADATA_FILE}" "$TEMP_DIR/"
scp -i "$PROD_KEY" "$TEMP_DIR/${TRACKS_FILE}" "${PROD_USER}@${PROD_SERVER}:${CONF_PATH}/"
scp -i "$PROD_KEY" "$TEMP_DIR/${METADATA_FILE}" "${PROD_USER}@${PROD_SERVER}:${CONF_PATH}/"
echo -e "  ${GREEN}✓${NC} Config files copied"

# Step 3: Verify
echo ""
echo -e "${YELLOW}[3/3] Verify${NC}"
echo "Verify at: https://www.candidagenome.org/jbrowse"

echo ""
echo -e "${GREEN}=== Promotion Complete ===${NC}"
echo ""
echo "Don't forget to update the PUBLIC WIKI!"
