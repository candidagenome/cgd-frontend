# SSH Keys

SSH keys should be stored in `~/.cgd-keys/` (not in this repo).

## Setup

```bash
mkdir -p ~/.cgd-keys
# Copy keys from admin to ~/.cgd-keys/
chmod 600 ~/.cgd-keys/*.pem
```

## Required Keys

| File | Server | Purpose |
|------|--------|---------|
| `cgd-tools.pem` | Tools server | Run RNA-Seq pipeline |
| `cgd-dev.pem` | Dev server | Testing |
| `cgd-prod.pem` | Prod server | Live site |

Get the keys from admin.
