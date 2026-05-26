# C. auris Mitochondrial Genome - Production Deployment Guide

## Overview

This document describes the steps to deploy the C. auris mitochondrial genome (GenBank: MT849287.1, PMID: 33193142) to production.

## Pre-requisites

- Curator testing completed on dev
- All code merged to main branch (or deployment branch)

---

## 1. Backend Code Deployment

### 1.1 Merge and Deploy Backend Changes

```bash
# On local machine
cd ~/claude_code/cgd-backend

# Merge to main (or your deployment branch)
git checkout main
git pull origin main
git merge redmine_70_to_75
git push origin main

# SSH to production backend server
ssh cgd-backend-prod

# Pull changes
cd /path/to/cgd-backend
git pull origin main

# Restart the API service
sudo systemctl restart cgd-api
```

### 1.2 Key Backend Changes

| Commit | Description |
|--------|-------------|
| `31748fb` | Fix genome_snapshot_service.py to support multiple current genome versions |
| `6188ce8` | Import script with --add-genes-only flag |

---

## 2. Database Import

### 2.1 Load Mitochondrial Genome Data

```bash
# SSH to production backend server
ssh cgd-backend-prod
cd /path/to/cgd-backend

# First, do a dry run to verify
python3 scripts/load_c_auris_mitochondrial_genome.py --dry-run

# If dry run looks good, run the actual import
python3 scripts/load_c_auris_mitochondrial_genome.py
```

### 2.2 What Gets Created

| Record Type | Details |
|-------------|---------|
| GenomeVersion | `mito-s01-m01-r01` with description referencing GenBank/PMID |
| Chromosome Feature | `MT849287.1_C_auris_B8441_mito` (28,212 bp) |
| Gene Features | 15 ORFs, 23 tRNAs, 2 rRNAs |
| Seq Records | Genomic sequence + protein sequences for CDS |

### 2.3 Verify Import

```bash
# Check the data was loaded
python3 -c "
import os
os.chdir('/path/to/cgd-backend')
from dotenv import load_dotenv
load_dotenv('.env')
from sqlalchemy import create_engine, text
engine = create_engine(os.environ.get('DATABASE_URL'))
with engine.connect() as conn:
    r = conn.execute(text(\"SELECT feature_type, COUNT(*) FROM MULTI.feature WHERE feature_name LIKE :p AND organism_no = 11 GROUP BY feature_type\"), {'p': '%mito%'})
    print('C. auris mito features:')
    for row in r:
        print(f'  {row[0]}: {row[1]}')
"
```

Expected output:
```
C. auris mito features:
  ORF: 15
  chromosome: 1
  rRNA: 2
  tRNA: 23
```

### 2.4 Add ORF Qualifiers

Set the 15 mitochondrial ORFs as "Uncharacterized" (per curator request):

```bash
# SSH to production backend server
ssh cgd-backend-prod
cd /path/to/cgd-backend

# First, do a dry run to verify
python3 scripts/add_c_auris_mito_qualifiers.py --dry-run

# If dry run looks good, run the actual update
python3 scripts/add_c_auris_mito_qualifiers.py
```

Expected dry-run output:
```
Found 15 mitochondrial ORFs without feature_qualifier
ORFs to update:
  - ATP6_mito (ATP6)
  - ATP8_mito (ATP8)
  - ATP9_mito (ATP9)
  - COB_mito (COB)
  - COX1_mito (COX1)
  - COX2_mito (COX2)
  - COX3_mito (COX3)
  - NAD1_mito (NAD1)
  - NAD2_mito (NAD2)
  - NAD3_mito (NAD3)
  - NAD4L_mito (NAD4L)
  - NAD4_mito (NAD4)
  - NAD5_mito (NAD5)
  - NAD6_mito (NAD6)
  - QNR39902_1_mito (no gene name)
[DRY RUN] Would add 'Uncharacterized' qualifier to 15 ORFs
```

---

## 3. JBrowse2 Track Deployment

### 3.1 Files Required

The following files need to be deployed to the JBrowse2 data directory:

| File | Description |
|------|-------------|
| `C_auris_B8441_mito.fasta` | Mitochondrial genome sequence |
| `C_auris_B8441_mito.fasta.fai` | FASTA index |
| `C_auris_mito.gff3.gz` | Gene annotations (sorted, bgzipped) |
| `C_auris_mito.gff3.gz.tbi` | Tabix index |

### 3.2 Deploy JBrowse2 Files

```bash
# SSH to production server
ssh cgd-prod

# Navigate to JBrowse2 data directory
cd /data/jbrowse2/

# Copy files from dev or source location
scp cgd-dev:/data/jbrowse2/C_auris_B8441_mito.* .
scp cgd-dev:/data/jbrowse2/C_auris_mito.gff3.gz* .

# Verify files
ls -la C_auris*mito*
```

### 3.3 Update JBrowse2 Config

The JBrowse2 config.json should already include the mito assembly. If not:

```bash
# Copy updated config from frontend repo
cd /path/to/cgd-frontend
git pull origin main

# The config is at: configs/jbrowse2/config.json
# Deploy to JBrowse2 directory
cp configs/jbrowse2/config.json /data/jbrowse2/config.json
```

### 3.4 JBrowse2 Config Entries

The config should include:

**Assembly:**
```json
{
  "name": "C_auris_B8441_mito",
  "sequence": {
    "type": "ReferenceSequenceTrack",
    "trackId": "C_auris_B8441_mito-ReferenceSequenceTrack",
    "adapter": {
      "type": "IndexedFastaAdapter",
      "fastaLocation": {"uri": "C_auris_B8441_mito.fasta"},
      "faiLocation": {"uri": "C_auris_B8441_mito.fasta.fai"}
    }
  }
}
```

**Features Track:**
```json
{
  "type": "FeatureTrack",
  "trackId": "C_auris_B8441_mito_features",
  "name": "Gene Annotations",
  "assemblyNames": ["C_auris_B8441_mito"],
  "adapter": {
    "type": "Gff3TabixAdapter",
    "gffGzLocation": {"uri": "C_auris_mito.gff3.gz"},
    "index": {"location": {"uri": "C_auris_mito.gff3.gz.tbi"}}
  }
}
```

---

## 4. Frontend Deployment

### 4.1 Deploy Frontend Changes

```bash
# On local machine
cd ~/claude_code/cgd-frontend

# Merge to main
git checkout main
git pull origin main
git merge redmine_70_to_75
git push origin main

# SSH to production frontend server
ssh cgd-frontend-prod
cd /path/to/cgd-frontend
git pull origin main

# Rebuild if needed
npm run build

# Restart frontend service if applicable
sudo systemctl restart cgd-frontend
```

### 4.2 Key Frontend Changes

| File | Change |
|------|--------|
| `src/components/HeaderNav.jsx` | Added "C. auris (mitochondrion)" to JBrowse dropdown |
| `src/pages/GenomeSnapshotPage.jsx` | Multi-PMID support for assembly references |
| `src/pages/GenomeVersionHistoryPage.jsx` | Multi-PMID support for assembly references |

---

## 5. Verification Checklist

After deployment, verify:

- [ ] **Genome Snapshot** (`/genome-snapshot/C_auris_B8441`)
  - [ ] Chromosome Feature Inventory shows "Mito" column
  - [ ] Mito column shows: 15 ORFs, 23 tRNA, 2 rRNA, 28,212 bp
  - [ ] Assembly References show both Nuclear and Mito PMIDs

- [ ] **Genome Version History** (`/genome-version-history?seq_source=C_auris_B8441`)
  - [ ] `mito-s01-m01-r01` appears with Is current: Yes
  - [ ] Description shows GenBank/PMID reference

- [ ] **JBrowse2** (`/jbrowse2/?assembly=C_auris_B8441_mito`)
  - [ ] Mitochondrial assembly loads
  - [ ] Gene annotations track displays
  - [ ] Navigation menu includes "C. auris (mitochondrion)" link

---

## 6. Troubleshooting

### Issue: Only Mito chromosome showing, nuclear chromosomes missing

**Cause:** Backend not updated with fix for multiple current genome versions.

**Fix:** Deploy commit `31748fb` and restart cgd-api service.

### Issue: Import script fails with "seq_type not found in code table"

**Cause:** Using wrong case for seq_type value.

**Fix:** Script already fixed - use `genomic` (lowercase) not `Genomic`.

### Issue: Import script fails with "source not found in code table"

**Cause:** Using wrong source value for Seq records.

**Fix:** Script already fixed - use `C. auris B8441` for Seq source.

### Issue: JBrowse2 shows "not a valid GFF3" error

**Cause:** GFF3 file not sorted before indexing.

**Fix:** Sort the GFF3 before bgzip/tabix:
```bash
grep "^#" input.gff3 > sorted.gff3
grep -v "^#" input.gff3 | sort -k1,1 -k4,4n >> sorted.gff3
bgzip sorted.gff3
tabix -p gff sorted.gff3.gz
```

---

## 7. Rollback Procedure

If issues occur after deployment:

### 7.1 Database Rollback

```sql
-- Remove mito features (run in order due to foreign keys)
DELETE FROM MULTI.feat_location WHERE feature_no IN (
  SELECT feature_no FROM MULTI.feature
  WHERE feature_name LIKE '%mito%' AND organism_no = 11
);
DELETE FROM MULTI.seq WHERE feature_no IN (
  SELECT feature_no FROM MULTI.feature
  WHERE feature_name LIKE '%mito%' AND organism_no = 11
);
DELETE FROM MULTI.feature WHERE feature_name LIKE '%mito%' AND organism_no = 11;
DELETE FROM MULTI.genome_version WHERE genome_version = 'mito-s01-m01-r01';
COMMIT;
```

### 7.2 Code Rollback

```bash
# Revert to previous commit
git revert <commit-hash>
git push origin main

# Restart services
sudo systemctl restart cgd-api
```

---

## 8. JBrowse2 Track Maintenance

### 8.1 Issue: Missing Tracks or Metadata

If JBrowse2 is missing tracks (data files exist in `/data/jbrowse2/` but don't appear in the browser), or tracks are missing metadata, use the update script.

**Symptoms:**
- Species like C. auris show very few tracks despite having data files
- Tracks display with only author/year/SRR but no descriptive metadata
- Data symlinks exist in `/data/jbrowse2/` but aren't in `config.json`

### 8.2 Run the Track Update Script

```bash
# SSH to server (dev or prod)
ssh cgd-frontend-dev  # or cgd-frontend-prod

# Copy or download the script
# Script location: cgd-frontend/scripts/update_jbrowse2_tracks.py

# First, do a dry run to see what would be added
python3 /path/to/update_jbrowse2_tracks.py --dry-run

# If dry run looks good, run the actual update
python3 /path/to/update_jbrowse2_tracks.py

# The script creates config.json.new - review it then deploy
cat /data/jbrowse2/config.json.new | python3 -c "import json,sys; d=json.load(sys.stdin); print('Total tracks:', len(d.get('tracks', [])))"

# Backup old config and deploy new one
cp /data/jbrowse2/config.json /data/jbrowse2/config.json.backup
mv /data/jbrowse2/config.json.new /data/jbrowse2/config.json
```

### 8.3 What the Script Does

1. **Reads existing config** - Finds which tracks already exist
2. **Scans `/data/jbrowse2/`** - Finds all data files (bigwig, BAM, VCF)
3. **Determines species** - From symlink target paths (e.g., `/data/HTS/C_auris_B8441/...`)
4. **Loads metadata** - From old JBrowse1 CSV files in `/data/jbrowse/*/`
5. **Creates track entries** - With proper category, name, and metadata
6. **Outputs new config** - As `config.json.new` for review

### 8.4 Script Options

```bash
# Only add coverage tracks (default - skips BAM alignments)
python3 update_jbrowse2_tracks.py

# Also include BAM alignment tracks
python3 update_jbrowse2_tracks.py --include-bam

# Dry run - show what would be done
python3 update_jbrowse2_tracks.py --dry-run
```

### 8.5 Metadata Source Files

The script reads metadata from these CSV files:

| Species | Metadata File |
|---------|--------------|
| C. albicans SC5314 | `/data/jbrowse/C_albicans_SC5314/C_albicans_SC5314_MetaData.csv` |
| C. auris B8441 | `/data/jbrowse/C_auris_B8441/C_auris_B8441_MetaData.csv` |
| C. dubliniensis CD36 | `/data/jbrowse/C_dubliniensis_CD36/C_dubliniensis_CD36_MetaData.csv` |
| C. glabrata CBS138 | `/data/jbrowse/C_glabrata_CBS138/C_glabrata_CBS138_MetaData.csv` |
| C. parapsilosis CDC317 | `/data/jbrowse/C_parapsilosis_CDC317/C_parapsilosis_CDC317_MetaData.csv` |

These CSVs contain fields: `label, key, description, condition, category, technique, track_type, organism, strain, haplotype, first_author, pubmed_id`

### 8.6 Verify After Update

```bash
# Check track counts by species
cat /data/jbrowse2/config.json | python3 -c "
import json, sys
from collections import Counter
d = json.load(sys.stdin)
species_counts = Counter()
for t in d.get('tracks', []):
    for sp in t.get('assemblyNames', []):
        species_counts[sp] += 1
for sp, count in sorted(species_counts.items()):
    print(f'  {sp}: {count} tracks')
"
```

---

## References

- GenBank: [MT849287.1](https://www.ncbi.nlm.nih.gov/nuccore/MT849287.1)
- PubMed: [33193142](https://pubmed.ncbi.nlm.nih.gov/33193142/) (Misas et al.)
- Documentation: `docs/backend-tasks/c_auris_mitochondrial_genome_import.md`
- Import Script: `scripts/load_c_auris_mitochondrial_genome.py`
- ORF Qualifier Script: `scripts/add_c_auris_mito_qualifiers.py`
