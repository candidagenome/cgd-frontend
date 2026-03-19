#!/bin/bash
#
# JBrowse2 Production Deployment Script
# Usage: ./deploy_jbrowse2.sh <target_host>
# Example: ./deploy_jbrowse2.sh cgd-frontend-prod
#

set -e

TARGET_HOST="${1:-}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
JBROWSE2_DIR="/var/www/jbrowse2"
SOURCE_HOST="cgd-frontend-dev"

if [ -z "$TARGET_HOST" ]; then
    echo "Usage: $0 <target_host>"
    echo "Example: $0 cgd-frontend-prod"
    exit 1
fi

echo "============================================"
echo "JBrowse2 Deployment to $TARGET_HOST"
echo "============================================"
echo ""

# Step 1: Create target directory
echo "[Step 1/5] Creating target directory..."
ssh "$TARGET_HOST" "sudo mkdir -p $JBROWSE2_DIR && sudo chown \$(whoami):\$(whoami) $JBROWSE2_DIR"

# Step 2: Sync JBrowse2 app files from dev
echo "[Step 2/5] Syncing JBrowse2 app files from $SOURCE_HOST..."
ssh "$SOURCE_HOST" "tar -czf - -C /var/www/jbrowse2 static manifest.json favicon.ico 2>/dev/null || tar -czf - -C /var/www/jbrowse2 static manifest.json" | \
    ssh "$TARGET_HOST" "tar -xzf - -C $JBROWSE2_DIR"

# Step 3: Copy config files from repo
echo "[Step 3/5] Copying config files..."
scp "$SCRIPT_DIR/index.html" "$TARGET_HOST:$JBROWSE2_DIR/"
scp "$SCRIPT_DIR/config.json" "$TARGET_HOST:$JBROWSE2_DIR/"

# Step 4: Create symlinks
echo "[Step 4/5] Creating data symlinks (715 symlinks)..."
scp "$SCRIPT_DIR/create_symlinks.sh" "$TARGET_HOST:/tmp/"
ssh "$TARGET_HOST" "bash /tmp/create_symlinks.sh && rm /tmp/create_symlinks.sh"

# Step 5: Verify deployment
echo "[Step 5/5] Verifying deployment..."
ssh "$TARGET_HOST" "ls -la $JBROWSE2_DIR/*.html $JBROWSE2_DIR/*.json $JBROWSE2_DIR/static/ | head -15"
SYMLINK_COUNT=$(ssh "$TARGET_HOST" "ls -la $JBROWSE2_DIR/ | grep '^l' | wc -l")
echo ""
echo "Symlinks created: $SYMLINK_COUNT"

echo ""
echo "============================================"
echo "Deployment complete!"
echo "============================================"
echo ""
echo "Next steps:"
echo "1. Ensure nginx is configured with JBrowse2 location block"
echo "2. Test at: https://$TARGET_HOST/jbrowse2/"
echo ""
echo "Sample nginx config:"
echo "  location /jbrowse2/ {"
echo "      alias /var/www/jbrowse2/;"
echo "      try_files \$uri \$uri/ /jbrowse2/index.html;"
echo "  }"
