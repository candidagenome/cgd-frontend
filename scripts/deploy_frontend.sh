#!/usr/bin/env bash
set -euo pipefail

SERVICE="${FRONTEND_SERVICE:-cgd-frontend-vite}"
REPO_DIR="${FRONTEND_DIR:-/home/ec2-user/work/cgd-frontend}"
FRONTEND_URL="${FRONTEND_URL:-https://frontend.dev.candidagenome.org}"
HEALTH_PATH="${FRONTEND_HEALTH_PATH:-/locus/act1}"

log() { printf "\n==> %s\n" "$*"; }
warn() { printf "WARNING: %s\n" "$*" >&2; }

log "Deploying CGD frontend (dev)"
log "Repo:    $REPO_DIR"
log "Service: $SERVICE"
log "Check:   ${FRONTEND_URL}${HEALTH_PATH}"

cd "$REPO_DIR"

log "Git status (before)"
git status -sb || true

log "Pull latest code"
git pull

# Install deps only if lockfiles changed between previous HEAD and current HEAD.
need_install="no"
if git rev-parse --verify -q HEAD@{1} >/dev/null 2>&1; then
  if git diff --name-only HEAD@{1} HEAD | grep -qE '(^|/)(package\.json|package-lock\.json|npm-shrinkwrap\.json)$'; then
    need_install="yes"
  fi
else
  warn "No previous HEAD found; running npm install to be safe."
  need_install="yes"
fi

if [ "$need_install" = "yes" ]; then
  log "Dependency files changed → npm install"
  npm install
else
  log "No dependency changes detected → skipping npm install"
fi

log "Restart Vite systemd service"
sudo systemctl restart "$SERVICE"

log "Service status"
systemctl status "$SERVICE" --no-pager || true

log "Recent service logs"
sudo journalctl -u "$SERVICE" -n 60 --no-pager || true

log "Ports (80/443/5173)"
ss -lntp | egrep ':(80|443|5173)\b' || true

log "Local Vite check"
curl -sS -I http://127.0.0.1:5173/ | head -n 20 || true

log "End-to-end HTTPS check"
curl -sS -I "${FRONTEND_URL}${HEALTH_PATH}" | head -n 20 || true

log "Done ✅"
