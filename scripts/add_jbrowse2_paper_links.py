#!/usr/bin/env python3
"""Add a 'Publication' link to each JBrowse2 track's metadata so the paper
shows up (as a clickable link to its CGD reference page) in JBrowse's built-in
"About track" dialog.

JBrowse Web's About dialog renders the track config table and auto-linkifies any
value that looks like a URL (the same way it already linkifies adapter locations).
Adding metadata.Publication = "https://www.candidagenome.org/reference/<PMID>"
therefore surfaces a clickable paper link with no JBrowse code changes.

PMIDs are sourced from the backend's authoritative EXPRESSION_STUDIES map
(cgd-backend/cgd/api/services/expression_service.py) -- NOT from the docs, which
have drifted (e.g. they list the wrong PMID for Lohse_2016).

A track is joined to its study by resolving its data-file symlink to
/data/HTS/<organism>/bam/<STUDY>/..., where <STUDY> is exactly an
EXPRESSION_STUDIES key. This is robust against the JBrowse config's drifted
category names (e.g. category says "Balla_2020" while the data is Balla_2023).
The symlink map is supplied as a TSV (filename<TAB>target) captured from the
server, since JBrowse data symlinks only exist there.

Idempotent: re-running just refreshes the Publication value.

Usage:
    # capture the symlink map on the server first:
    #   ssh <host> 'cd /data/jbrowse2 && for f in *; do [ -L "$f" ] && \
    #       printf "%s\t%s\n" "$f" "$(readlink "$f")"; done' > symlinks.tsv

    python3 scripts/add_jbrowse2_paper_links.py \
        --config /tmp/dev_config.json \
        --symlinks /tmp/jb_symlinks.tsv \
        --expression ../cgd-backend/cgd/api/services/expression_service.py \
        [--out /tmp/dev_config.stamped.json]   # omit for dry run
"""

import argparse
import ast
import json
import sys
from collections import Counter
from pathlib import Path

CGD_REF_BASE = "https://www.candidagenome.org/reference/"
PUBLICATION_KEY = "Publication"


def load_study_pmids(expression_path):
    """Parse EXPRESSION_STUDIES from the backend file -> {study_id: pmid|None}."""
    src = Path(expression_path).read_text()
    es = None
    for node in ast.parse(src).body:
        if isinstance(node, ast.Assign) and any(
            getattr(t, "id", None) == "EXPRESSION_STUDIES" for t in node.targets
        ):
            es = ast.literal_eval(node.value)
            break
    if es is None:
        sys.exit(f"EXPRESSION_STUDIES not found in {expression_path}")
    study_pmid = {}
    for studies in es.values():
        for sid, info in studies.items():
            study_pmid[sid] = info.get("pmid")
    return study_pmid


def load_symlinks(symlinks_path):
    """filename -> target path."""
    link = {}
    for line in Path(symlinks_path).read_text().splitlines():
        parts = line.split("\t")
        if len(parts) == 2:
            link[parts[0]] = parts[1]
    return link


def study_from_target(target):
    """/data/HTS/<org>/bam/<STUDY>/... -> <STUDY> (else None)."""
    if "/bam/" not in target:
        return None
    return target.split("/bam/", 1)[1].split("/", 1)[0]


def track_uri(track):
    adapter = track.get("adapter", {})
    for value in adapter.values():
        if isinstance(value, dict) and "uri" in value:
            return value["uri"]
    return None


def resolve_pmid(study, study_pmid):
    """Exact match, else unique '<study>_*' variant with a shared pmid.

    The variant fallback handles e.g. a bare 'Iracane_2024' track when the map
    only has 'Iracane_2024_longRNA'/'_sRNA' (both the same paper).
    """
    if study in study_pmid:
        return study_pmid[study]
    variants = {p for sid, p in study_pmid.items()
                if sid.startswith(study + "_") and p}
    if len(variants) == 1:
        return next(iter(variants))
    return None


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--config", required=True, help="JBrowse2 config.json to stamp")
    parser.add_argument("--symlinks", required=True, help="TSV: filename<TAB>target")
    parser.add_argument("--expression", required=True,
                        help="path to backend expression_service.py")
    parser.add_argument("--out", help="write stamped config here (omit for dry run)")
    args = parser.parse_args()

    study_pmid = load_study_pmids(args.expression)
    link = load_symlinks(args.symlinks)
    config = json.loads(Path(args.config).read_text())
    tracks = config.get("tracks", [])

    stamped = 0
    no_pmid = Counter()       # study present but pmid None
    unknown_study = Counter()  # study folder not in EXPRESSION_STUDIES
    no_data = 0               # no adapter file / not a /bam/ track

    for track in tracks:
        uri = track_uri(track)
        target = link.get(uri) if uri else None
        study = study_from_target(target) if target else None
        if study is None:
            no_data += 1
            continue
        pmid = resolve_pmid(study, study_pmid)
        if pmid is None:
            if study in study_pmid:
                no_pmid[study] += 1
            else:
                unknown_study[study] += 1
            continue
        url = CGD_REF_BASE + pmid
        meta = track.setdefault("metadata", {})
        if meta.get(PUBLICATION_KEY) != url:
            meta[PUBLICATION_KEY] = url
        stamped += 1

    print(f"Tracks total:                 {len(tracks)}")
    print(f"Publication links stamped:    {stamped}")
    print(f"Non-dataset / no data file:   {no_data}")
    if unknown_study:
        print("\nStudy folders NOT in EXPRESSION_STUDIES (skipped, no link):")
        for s, n in unknown_study.most_common():
            print(f"  {s}: {n} track(s)")
    if no_pmid:
        print("\nStudies in EXPRESSION_STUDIES but pmid is None (skipped):")
        for s, n in no_pmid.most_common():
            print(f"  {s}: {n} track(s)")

    if args.out:
        Path(args.out).write_text(json.dumps(config, indent=2) + "\n")
        print(f"\nWrote {args.out}")
    else:
        print("\nDry run only. Pass --out <path> to write the stamped config.")


if __name__ == "__main__":
    sys.exit(main())
