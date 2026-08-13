#!/usr/bin/env python3
"""Generate JBrowse2 track JSON for ChIP/ChEC log2-ratio bigwigs.

Reads the study's chipseq metadata TSV, emits one bicolor-pivot
QuantitativeTrack per IP sample. Run on cgd-frontend-dev.

Usage: make_chip_tracks.py <Study> <organism> <metadata.tsv> <pmid> <author_year_label>
e.g.:  make_chip_tracks.py Lohse_2016 C_albicans_SC5314 ../Lohse_2016.chipseq.tsv 26772749 "Lohse 2016"
"""
import csv
import json
import sys

study, organism, meta_path, pmid, label = sys.argv[1:6]


def interpretation_text(assay, target):
    """One-line reading guide shown in JBrowse's About-track dialog.

    Blue means different things by assay: ChIP controls (input/untagged)
    make it plain background, while ChEC's free-MNase control preferentially
    cuts open chromatin, so blue marks accessible-but-unbound DNA.
    """
    name = target.capitalize() if target else "the tagged protein"
    if assay.strip().lower().startswith("chec"):
        return (
            f"Red (positive) = more cleavage by {name}-MNase than the "
            f"free-MNase control - candidate {name} sites; blue (negative) = "
            "regions the free-MNase control cuts more (open chromatin not "
            f"occupied by {name}). Colors do not indicate strand; "
            "fixed +/-4 log2 scale."
        )
    return (
        f"Red (positive) = enrichment in the IP over control - candidate "
        f"{name} binding; blue (negative) = control excess (normalization "
        "background, not binding). Colors do not indicate strand; "
        "fixed +/-4 log2 scale."
    )

tracks = []
with open(meta_path) as f:
    for row in csv.DictReader(f, delimiter="\t"):
        if row["Role"].strip().lower() != "ip":
            continue
        srr = row["SRR_ID"].strip()
        track_id = f"{study}_{srr}_log2ratio"
        tracks.append({
            "type": "QuantitativeTrack",
            "trackId": track_id,
            "name": f"{row['Condition_Label']} log2(IP/control)",
            "adapter": {
                "type": "BigWigAdapter",
                "bigWigLocation": {
                    "uri": f"{study}_{srr}_log2ratio.bigwig",
                    "locationType": "UriLocation",
                },
            },
            "assemblyNames": [organism],
            "category": [row["Assay_Type"].replace("-seq", "-Seq"), study],
            "displays": [{
                "type": "LinearWiggleDisplay",
                "displayId": f"{track_id}_display",
                "minScore": -4,
                "maxScore": 4,
                "renderers": {
                    "XYPlotRenderer": {
                        "type": "XYPlotRenderer",
                        "bicolorPivot": "numeric",
                        "bicolorPivotValue": 0,
                        "posColor": "rgb(200,40,40)",
                        "negColor": "rgb(60,80,200)",
                    }
                },
            }],
            "metadata": {
                "description": (
                    f"log2 ratio of {row['Condition_Label']} vs matched control. "
                    + interpretation_text(row["Assay_Type"], row["Target"])
                ),
                "target": row["Target"],
                "assay": row["Assay_Type"],
                "technique": row["Assay_Type"],
                "pubmed_id": pmid,
                "Publication": f"https://www.candidagenome.org/reference/{pmid}",
            },
        })

out = f"{study}_chip_tracks.json"
with open(out, "w") as f:
    json.dump(tracks, f, indent=2)
print(f"wrote {len(tracks)} tracks to {out}")
