#!/bin/bash
#
# upload_dataset.sh
# Uploads supplemental dataset files to CGD for download
#
# Usage: ./upload_dataset.sh <author_year> <local_files_path>
#
# Examples:
#   ./upload_dataset.sh Shinohara_2025 ~/Downloads/Shinohara_data/
#   ./upload_dataset.sh Smith_2024 ~/Downloads/dataset.xlsx

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../config.sh"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

usage() {
    echo "Usage: $0 <author_year> <local_files_path>"
    echo ""
    echo "Arguments:"
    echo "  author_year       Directory name (e.g., Shinohara_2025)"
    echo "  local_files_path  Path to file(s) to upload (file or directory)"
    echo ""
    echo "Examples:"
    echo "  $0 Shinohara_2025 ~/Downloads/Shinohara_data/"
    echo "  $0 Smith_2024 ~/Downloads/dataset.xlsx"
    exit 1
}

if [ $# -lt 2 ]; then
    usage
fi

AUTHOR_YEAR="$1"
LOCAL_PATH="$2"

# Validate local path exists
if [ ! -e "$LOCAL_PATH" ]; then
    echo -e "${RED}Error: $LOCAL_PATH does not exist${NC}"
    exit 1
fi

DEST_PATH="${DATASETS_PATH}/${AUTHOR_YEAR}"

echo -e "${YELLOW}=== Upload Dataset ===${NC}"
echo "Author/Year: $AUTHOR_YEAR"
echo "Source:      $LOCAL_PATH"
echo "Destination: ${PROD_SERVER}:${DEST_PATH}"
echo ""

# Step 1: Check if directory already exists
echo -e "${YELLOW}[1/3] Checking destination...${NC}"
if ssh -i "$PROD_KEY" "${PROD_USER}@${PROD_SERVER}" "test -d ${DEST_PATH}" 2>/dev/null; then
    echo -e "  ${YELLOW}!${NC} Directory ${AUTHOR_YEAR} already exists"
    read -p "  Overwrite? [y/N] " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Aborted."
        exit 0
    fi
else
    echo -e "  ${GREEN}✓${NC} Directory will be created"
fi

# Step 2: Create directory and upload files
echo ""
echo -e "${YELLOW}[2/3] Uploading files...${NC}"
ssh -i "$PROD_KEY" "${PROD_USER}@${PROD_SERVER}" "mkdir -p ${DEST_PATH}"

if [ -d "$LOCAL_PATH" ]; then
    # Upload directory contents
    scp -i "$PROD_KEY" -r "${LOCAL_PATH}"/* "${PROD_USER}@${PROD_SERVER}:${DEST_PATH}/"
else
    # Upload single file
    scp -i "$PROD_KEY" "${LOCAL_PATH}" "${PROD_USER}@${PROD_SERVER}:${DEST_PATH}/"
fi
echo -e "  ${GREEN}✓${NC} Files uploaded"

# Step 3: Verify and show next steps
echo ""
echo -e "${YELLOW}[3/3] Verifying...${NC}"
ssh -i "$PROD_KEY" "${PROD_USER}@${PROD_SERVER}" "ls -la ${DEST_PATH}/"

echo ""
echo -e "${GREEN}=== Upload Complete ===${NC}"
echo ""
echo -e "${CYAN}Next steps in CGD Curator Central:${NC}"
echo ""
echo "1. Link dataset to reference:"
echo "   a. Go to 'Edit or delete an existing reference'"
echo "   b. Search by PMID"
echo "   c. Click 'Edit reference information'"
echo "   d. At bottom, 'Add a new reference URL':"
echo "      - Source: Author"
echo "      - URL_type: reference data"
echo "      - URL: /download/systematic_results/${AUTHOR_YEAR}"
echo "   e. Submit"
echo ""
echo "2. Link to publisher supplement:"
echo "   a. Add another URL:"
echo "      - Source: Publisher"
echo "      - URL_type: reference supplement"
echo "      - URL: [paste publisher supplemental data URL]"
echo "   b. Submit"
echo ""
echo "3. Verify dataset appears in Download menu with icons"
