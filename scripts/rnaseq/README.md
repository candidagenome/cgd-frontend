# RNA-Seq Import Scripts

Simplified workflow for importing RNA-Seq datasets into JBrowse.

## Workflow

```
Tools Server        Dev JBrowse         Prod JBrowse
(run pipeline)  →   (test tracks)   →   (live)
```

## Quick Start

```bash
cd ~/cgd-frontend/scripts/rnaseq

./run_pipeline.sh C_auris_B8441 SRR14758164                   # Start on Tools
./check_pipeline.sh C_auris_B8441 SRR14758164                 # Check progress
./deploy_jbrowse.sh dev C_auris_B8441 SRR14758164 Simm_2024   # Deploy to dev
./promote_to_prod.sh C_auris_B8441 SRR14758164 Simm_2024      # Promote to prod
```

## Setup

1. Copy the sample config and fill in server IPs:
   ```bash
   cp config.sh.sample config.sh
   # Edit config.sh with actual server IPs (get from Shuai)
   ```

2. Place SSH keys in the `keys/` directory:
   - `jodi_tools.pem` - Tools server
   - `cgdadmin.pem` - Dev server
   - `Cdev_key.pem` - Prod server

3. Set correct permissions:
   ```bash
   chmod 600 keys/*.pem
   ```

## Scripts

| Script | Purpose |
|--------|---------|
| `config.sh` | Server hostnames and paths |
| `run_pipeline.sh` | Start alignment on Tools server |
| `check_pipeline.sh` | Check pipeline progress |
| `deploy_jbrowse.sh` | Copy files + deploy to dev or prod |
| `promote_to_prod.sh` | Promote verified data from dev → prod |

## For C. albicans (Haplotypes)

C. albicans requires specifying the haplotype:

```bash
./run_pipeline.sh C_albicans_SC5314_HapA SRR27912204
./check_pipeline.sh C_albicans_SC5314_HapA SRR27912204
./deploy_jbrowse.sh dev C_albicans_SC5314 SRR27912204 Iracane_2024 HapA
./promote_to_prod.sh C_albicans_SC5314 SRR27912204 Iracane_2024 HapA
```

## Valid Strains

| Strain | Notes |
|--------|-------|
| `C_auris_B8441` | |
| `C_albicans_SC5314_HapA` | Use HapA or HapB for pipeline |
| `C_albicans_SC5314_HapB` | |
| `C_glabrata_CBS138` | |
| `C_dubliniensis_CD36` | |
| `C_parapsilosis_CDC317` | |

## Troubleshooting

### Pipeline not completing
```bash
./check_pipeline.sh <strain> <srr_id>
```

### Tracks not showing in JBrowse
- Clear browser cache
- Check `urlTemplate` path in tracks.conf
- Verify files exist on server:
  ```bash
  ls /data/HTS/<STRAIN>/bam/<AUTHOR_YEAR>/<SRR_ID>/
  ```

## After Deployment

Update the PUBLIC WIKI with the new dataset reference.
