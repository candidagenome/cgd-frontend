# C. auris Mitochondrial Genome Database Import

## Overview

Import the *Candida auris* B8441 mitochondrial genome into the CGD database so it appears in:
1. **Genome Snapshot** - Chromosome Feature Inventory table (as "Mito" column)
2. **Genome Version History** - Version record for the mitochondrial genome

## Source Data

| Field | Value |
|-------|-------|
| GenBank Accession | MT849287.1 |
| Organism | *Candidozyma auris* (Candida auris) |
| Strain | B8441 |
| Sequence Length | 28,212 bp |
| Topology | Circular |
| Submission Date | 2020-08-05 |
| PMID | 33193142 |
| Reference | Misas et al. "Mitochondrial genome sequences of the emerging fungal pathogen Candida auris" |

## JBrowse2 Status

The mitochondrial genome is already configured in JBrowse2:
- Assembly: `C_auris_B8441_mito`
- Sequence ID: `MT849287.1_C_auris_B8441_mito`
- Features track: `C_auris_B8441_mito_features`
- Files deployed to `/data/jbrowse2/` on dev server

## Database Records Needed

### 1. Chromosome/Contig Record

Add a chromosome record for the mitochondrial genome:

| Field | Value |
|-------|-------|
| feature_name | `MT849287.1_C_auris_B8441_mito` |
| feature_type | `chromosome` or `mitochondrion` |
| organism | C. auris B8441 |
| seq_source | (same as nuclear or separate mito seq_source) |
| length | 28,212 |
| display_name | `Mito` |

### 2. Feature Records

The mitochondrial genome contains the following features to be loaded:

#### Protein-Coding Genes (CDS) - 19 total

| Gene | Product | Coordinates | Protein ID |
|------|---------|-------------|------------|
| COX2 | Cytochrome oxidase subunit 2 | 335..1066 | QNR39896.1 |
| NAD6 | NADH dehydrogenase subunit 6 | 1410..1850 | QNR39897.1 |
| NAD1 | NADH dehydrogenase subunit 1 | 1856..2806 | QNR39898.1 |
| NAD4L | NADH dehydrogenase subunit 4L | 3052..3306 | QNR39899.1 |
| NAD5 | NADH dehydrogenase subunit 5 | 3306..3887, 4961..5167, 6579..7445 (spliced) | QNR39900.1 |
| ATP9 | ATPase subunit 9 | 7845..8075 | QNR39901.1 |
| (hypothetical) | Hypothetical protein | 8024..9556 | QNR39902.1 |
| COB | Cytochrome b | 9748..10140, 11557..12315 (spliced) | QNR39903.1 |
| NAD2 | NADH dehydrogenase subunit 2 | 12381..13784 | QNR39904.1 |
| NAD3 | NADH dehydrogenase subunit 3 | 13786..14172 | QNR39905.1 |
| NAD4 | NADH dehydrogenase subunit 4 | 14616..15986 | QNR39906.1 |
| ATP8 | ATPase subunit 8 | 16770..16916 | QNR39907.1 |
| ATP6 | ATPase subunit 6 | 16913..17611 | QNR39908.1 |
| COX3 | Cytochrome oxidase subunit 3 | 17616..18404 | QNR39909.1 |
| COX1 | Cytochrome oxidase subunit 1 | 19192..20736, 21856..22261 (spliced) | QNR39910.1 |
| (additional CDS as needed from GenBank) | | | |

#### tRNA Genes - 23 total

| tRNA | Product | Coordinates |
|------|---------|-------------|
| tRNA-Ala | tRNA-Ala | 220..291 |
| tRNA-Asn | tRNA-Asn | 1273..1343 |
| tRNA-Ser | tRNA-Ser | 14375..14459 |
| tRNA-Leu | tRNA-Leu | 14506..14587 |
| (additional tRNAs) | Various | (see GenBank record) |

#### rRNA Genes - 3 regions

| rRNA | Product | Coordinates |
|------|---------|-------------|
| rnl | Large subunit ribosomal RNA | 25815..28185, 1..219 (wraps around) |
| rns | Small subunit ribosomal RNA | (coordinates from GenBank) |

### 3. Genome Version Record

Add a version record for the mitochondrial genome:

| Field | Value |
|-------|-------|
| seq_source | `C_auris_B8441` (or separate `C_auris_B8441_mito`) |
| genome_version | `MT849287.1` or `mito-1.0` |
| strain_name | `Candida auris B8441 (mitochondrion)` |
| is_current | Yes |
| is_major_version | Yes |
| date_created | 2020-08-05 |
| description | `Mitochondrial genome sequence (GenBank: MT849287.1, PMID: 33193142)` |

## Chromosome Inventory Counts

For the Genome Snapshot chromosome table, the "Mito" column should show:

| Feature Type | Count |
|--------------|-------|
| Total ORFs | 19 |
| Verified ORFs | 0 (or 19 if treating mito genes as verified) |
| Uncharacterized ORFs | 19 (or 0) |
| Dubious ORFs | 0 |
| tRNA | 23 |
| rRNA | 3 |
| Other features | 0 |

## GenBank Record

Full GenBank record available at:
- https://www.ncbi.nlm.nih.gov/nuccore/MT849287.1

To download:
```bash
# FASTA
curl "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=nuccore&id=MT849287.1&rettype=fasta" > MT849287.fasta

# GenBank format (with all annotations)
curl "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=nuccore&id=MT849287.1&rettype=gb" > MT849287.gb
```

## Notes

1. The mitochondrial PMID (33193142) is already added to the Genome Snapshot and Genome Version pages alongside the nuclear genome PMID (39177371)

2. JBrowse2 files are already deployed:
   - `/data/jbrowse2/C_auris_B8441_mito.fasta`
   - `/data/jbrowse2/C_auris_B8441_mito.fasta.fai`
   - `/data/jbrowse2/C_auris_mito.gff3.gz`
   - `/data/jbrowse2/C_auris_mito.gff3.gz.tbi`

3. Navigation menu already includes "C. auris (mitochondrion)" link to JBrowse2

## Related Commits

- `32f15ed` - feat(jbrowse2): add C. auris mitochondrial genome assembly
