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
                "description": f"log2 ratio of {row['Condition_Label']} vs matched control",
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
