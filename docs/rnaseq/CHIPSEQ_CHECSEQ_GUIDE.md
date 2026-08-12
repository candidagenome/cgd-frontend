# ChIP-seq / ChEC-seq Dataset Guide

How to add protein–DNA binding datasets (ChIP-seq, ChEC-seq) to CGD's genome
browser. Companion to `CURATOR_GUIDE.md` (RNA-seq); this guide covers only
what is *different* for binding data.

## Why binding data needs its own process

A raw ChIP/ChEC coverage track is mostly background chromatin: signal appears
genome-wide with binding sites poking only a few fold above it, which reads as
wall-to-wall noise in the browser (this is why the original Lohse_2016 raw
coverage tracks "never looked right"). Binding is only interpretable as a
**ratio of the IP sample to its matched control**:

| Assay | IP / signal sample | Control (denominator) |
|-------|--------------------|------------------------|
| ChIP-seq (tagged protein) | tagged-strain IP | untagged-strain IP, or input chromatin |
| ChIP-seq (antibody)       | IP              | input (pre-IP chromatin) or mock IP |
| ChEC-seq                  | protein–MNase fusion cleavage | free MNase control |

The pipeline therefore produces **log2(IP/control) ratio bigwigs** as the
primary browser track (positive = enrichment/binding, negative = depletion,
0 = background). Per-sample CPM coverage bigwigs are still generated for QC
but are not normally displayed.

One exception to keep in mind: **histone-mark ChIP** (H3K9ac etc.) genuinely
covers most of the genome — continuous signal there is biology, not artifact.
Ratio display still works but do not expect sharp peaks.

## Metadata sheet

Template: `ChIPseq_ChECseq_metadata_template.tsv`. One row per SRR. Columns
beyond the RNA-seq sheet:

| Column | Values | Notes |
|--------|--------|-------|
| Assay_Type | `ChIP-seq` or `ChEC-seq` | drives the JBrowse category |
| Role | `IP` or `control` | controls get no ratio track of their own |
| Target | gene name of the bound protein (e.g. `WOR4`, `HFL1`) | empty for controls |
| Control_SRR | SRR(s) of this IP's control, comma-separated | **the curatorial call that matters most.** Multiple SRRs are merged (pooled) into one denominator — e.g. 3 untagged-control reps |

Pairing rules of thumb:
- Pair within the same strain/condition (tagged vs untagged of the *same*
  cell type; IP vs input from the *same* culture).
- If the study has replicate controls, pool them (list all in Control_SRR)
  rather than arbitrarily picking one.
- If you cannot identify a control sample in SRA/GEO, stop and check the
  paper's methods — a ChIP dataset without any control cannot be displayed
  honestly as binding.

## Running the pipeline

On `cgd-frontend-dev`:

```bash
cd ~/work/cgd-frontend/docs/rnaseq/scripts
nohup ./run_chipseq_pipeline.sh <Study_ID> <organism> <metadata.tsv> \
    > <Study_ID>.pipeline.log 2>&1 &
```

Differences from the RNA-seq pipeline (`run_rnaseq_pipeline.sh`):
- HISAT2 runs with `--no-spliced-alignment` (genomic DNA fragments)
- PCR duplicates are removed (`samtools markdup -r`) — duplicates inflate
  false peaks in ChIP far more than in RNA-seq
- low-MAPQ reads are dropped (`-q 10`) so repeat regions don't fake peaks
- BAMs are kept until the ratio step, then can be deleted (only bigwigs
  are staged long-term, as with RNA-seq)
- single-end reads are extended to a 200 bp fragment estimate in the
  ratio step; paired-end uses actual fragment sizes

Output layout:

```
/data/HTS/<organism>/chipseq/<Study>/
    <SRR>/<SRR>_dedup.bam            (deletable after ratios are built)
    <SRR>/<SRR>_coverage.bigwig      (QC)
    ratios/<Study>_<SRR>_log2ratio.bigwig   (display tracks)
    <Study>_alignment_summary.tsv
```

The same ≥85% alignment threshold applies as for RNA-seq; check the summary
TSV before deploying.

### ChEC-seq notes (e.g. Mantilla_2026, PMID 42321418)

Processing is identical; the control is the **free-MNase** sample. Two
curatorial cautions: (1) ChEC signal is cleavage frequency around binding
sites, not occupancy — peaks are sharper and can flank the motif; (2) some
ChEC studies use very short digestion times as the signal and long ones as
background — read the methods when picking Control_SRR.

## JBrowse2 tracks

Ratio tracks are QuantitativeTracks with a **bicolor pivot at zero** so
enrichment and depletion read at a glance (the SGD Sun_2015 style):

```json
{
  "type": "QuantitativeTrack",
  "trackId": "<Study>_<SRR>_log2ratio",
  "name": "<Condition_Label> log2(IP/control)",
  "adapter": {"type": "BigWigAdapter",
              "bigWigLocation": {"uri": "<Study>_<SRR>_log2ratio.bigwig",
                                 "locationType": "UriLocation"}},
  "assemblyNames": ["<organism>"],
  "category": ["ChIP-Seq", "<Study>"],
  "displays": [{
    "type": "LinearWiggleDisplay",
    "displayId": "<trackId>_display",
    "minScore": -4,
    "maxScore": 4,
    "renderers": {"XYPlotRenderer": {"type": "XYPlotRenderer",
      "bicolorPivot": "numeric", "bicolorPivotValue": 0,
      "posColor": "rgb(200,40,40)", "negColor": "rgb(60,80,200)"}}
  }],
  "metadata": {"Publication": "https://www.candidagenome.org/reference/<PMID>",
               "target": "<Target>", "assay": "ChIP-seq"}
}
```

Generate these with `scripts/make_chip_tracks.py <Study> <organism> <metadata.tsv>
<PMID> "<Author Year>"`. Display conventions: keep the name short (the
condition label — the study is already the selector folder), and use a
**fixed −4..+4 y-scale** on every ratio track in a study so replicates are
visually comparable and background noise isn't auto-stretched to fill the
track.

Use category `["ChEC-Seq", "<Study>"]` for ChEC studies. Symlink naming
follows the study's organism convention, same as RNA-seq.

Binding datasets do **not** go to the Expression tab (that is transcript
abundance only).

## Known datasets

| Study | PMID | BioProject | Assay | Target | Status |
|-------|------|------------|-------|--------|--------|
| Lohse_2016 | 26772749 | SRP066491 / GSE75124 | ChIP-seq | Wor4 | reprocessing (old raw-coverage tracks to be retired) |
| She_2024 | 39370643 | PRJNA1057507 | ChIP-seq | Hfl1 | pilot |
| Mantilla_2026 | 42321418 | PRJNA1390763 | ChEC-seq | (TBD) | pending |

Lohse_2016 correction: the data is the **Wor4** ChIP from PMID 26772749
(GSE75124), not Wor1; the old tracks' publication link (27280690) points to
the wrong Lohse paper, and `wt`/`op` in the old names mean white/opaque cells,
not wild-type. Fix both when the new tracks replace the old ones.
