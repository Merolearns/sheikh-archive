#!/usr/bin/env python3
"""Merge English titles into audit/catalog-reconciled.js (idempotent).

Sources (all human-reviewable):
  audit/series-en.tsv      hand-translated series titles (Arabic title -> English)
  audit/verse-titles-en.tsv hand-translated verse-fragment video titles (id -> English)
  audit/video-en-mt.json   machine-translated video titles (Arabic title -> English)
  audit/held-en.tsv        held-for-review titles (no titleEn written)

Rules:
  - Every playlist must end up exactly one of: translated (TSV), copied
    (already Latin script: titleEn = title), or held.
  - Every video must end up exactly one of: hand (verse TSV), machine
    (video-en-mt.json), copied (no Arabic script), or held.
  - Arabic `title` fields are NEVER altered (asserted).
  - titleEn must contain no Arabic-script characters except the ﷺ ligature,
    and no Arabic-Indic digits (asserted).
  - The reconciled file is rewritten byte-stably: json.dumps with the same
    separators as the original (verified round-trip identical), so the diff
    shows only the filled titleEn values.
  - Also writes audit/translations-en.json, the keyed-by-id record.

Usage: python3 tools/merge_translations.py [--check]  (--check: dry run)
"""
import json
import re
import sys
from pathlib import Path

V5P = Path(__file__).resolve().parent.parent
REC = V5P / "audit" / "catalog-reconciled.js"
SERIES_TSV = V5P / "audit" / "series-en.tsv"
VERSE_TSV = V5P / "audit" / "verse-titles-en.tsv"
MT_JSON = V5P / "audit" / "video-en-mt.json"
HELD_TSV = V5P / "audit" / "held-en.tsv"
RECORD = V5P / "audit" / "translations-en.json"

AR = re.compile(r"[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]")
AR_DIGITS = re.compile(r"[٠-٩]")


def norm_ws(s):
    return re.sub(r"\s+", " ", s).strip()


def load_tsv(path):
    rows = []
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.rstrip("\n")
        if not line or line.startswith("#"):
            continue
        parts = line.split("\t")
        assert len(parts) == 2, f"{path}: bad row: {line!r}"
        rows.append((parts[0], parts[1]))
    return rows


def check_en(text, where):
    assert text and text.strip(), f"{where}: empty English title"
    bad = [ch for ch in text if AR.search(ch) and ch != "ﷺ"]
    assert not bad, f"{where}: Arabic left in English title: {text!r}"
    assert not AR_DIGITS.search(text), f"{where}: Arabic-Indic digits: {text!r}"


def main():
    check_only = "--check" in sys.argv
    raw = REC.read_text(encoding="utf-8")
    data = json.loads(re.match(r"const DATA = (.*);\s*$", raw, re.S).group(1))
    orig_titles = {p["id"]: p["title"] for p in data["playlists"]}
    orig_titles.update({v["id"]: v["title"] for v in data["videos"]})

    # --- held ---
    held = {}  # id -> reason
    held_series_reasons = {}  # normalised Arabic title -> reason
    for line in HELD_TSV.read_text(encoding="utf-8").splitlines():
        if not line or line.startswith("#"):
            continue
        parts = line.split("\t")
        assert len(parts) == 3, f"held: bad row: {line!r}"
        kind, key, reason = parts
        if kind == "playlist":
            held_series_reasons[norm_ws(key)] = reason
        elif kind == "video":
            held[key] = reason
        else:
            raise AssertionError(f"held: unknown kind {kind!r}")

    # --- series ---
    by_norm = {norm_ws(p["title"]): p for p in data["playlists"]}
    assert len(by_norm) == len(data["playlists"]), "duplicate playlist titles"
    series_en = {}
    for ar, en in load_tsv(SERIES_TSV):
        key = norm_ws(ar)
        assert key in by_norm, f"series TSV: no playlist titled {ar!r}"
        pid = by_norm[key]["id"]
        assert pid not in series_en, f"series TSV: duplicate {ar!r}"
        check_en(en, f"series {pid}")
        series_en[pid] = en
    held_pl_ids = set()
    for t, reason in held_series_reasons.items():
        assert t in by_norm, f"held: no playlist titled {t!r}"
        pid = by_norm[t]["id"]
        held_pl_ids.add(pid)
        held[pid] = reason
    copied_pl = {}
    for p in data["playlists"]:
        if not AR.search(p["title"]):
            copied_pl[p["id"]] = p["title"]
    covered = set(series_en) | set(copied_pl) | held_pl_ids
    assert covered == set(orig_titles) - {v["id"] for v in data["videos"]}, (
        f"playlists not fully covered: missing="
        f"{set(p['id'] for p in data['playlists']) - covered}"
    )
    assert not (set(series_en) & set(copied_pl)), "series in both translated and copied"
    assert not (set(series_en) & held_pl_ids), "series in both translated and held"

    # --- videos: hand (verse) + machine + copied ---
    video_en = {}
    for vid, en in load_tsv(VERSE_TSV):
        assert vid in orig_titles, f"verse TSV: unknown video {vid!r}"
        assert vid not in video_en, f"verse TSV: duplicate {vid!r}"
        check_en(en, f"video {vid}")
        video_en[vid] = en
    mt = {}
    if MT_JSON.exists():
        mt = json.loads(MT_JSON.read_text(encoding="utf-8"))
    title_to_ids = {}
    for v in data["videos"]:
        title_to_ids.setdefault(v["title"], []).append(v["id"])
    mt_applied = {}
    for ar_title, en in mt.items():
        assert ar_title in title_to_ids, f"MT: unknown title {ar_title!r}"
        check_en(en, f"MT title {ar_title[:40]!r}")
        for vid in title_to_ids[ar_title]:
            assert vid not in video_en, f"video {vid}: both hand and MT"
            mt_applied[vid] = en
    video_en.update(mt_applied)
    copied_v = {}
    for v in data["videos"]:
        if not AR.search(v["title"]):
            copied_v[v["id"]] = v["title"]
    held_v_ids = {k for k in held if k in orig_titles and k in {v["id"] for v in data["videos"]}}
    # Held-ness is per title: every copy of a held video's Arabic title is held.
    held_titles = {orig_titles[vid] for vid in held_v_ids}
    held_v_ids |= {v["id"] for v in data["videos"] if v["title"] in held_titles}
    v_all = {v["id"] for v in data["videos"]}
    covered_v = set(video_en) | set(copied_v) | held_v_ids
    assert covered_v == v_all, (
        f"videos not fully covered: missing={len(v_all - covered_v)} "
        f"sample={sorted(v_all - covered_v)[:5]}"
    )
    assert not (set(video_en) & set(copied_v)), "video in both translated and copied"
    assert not (set(video_en) & held_v_ids), "video in both translated and held"

    # --- apply ---
    for p in data["playlists"]:
        if p["id"] in series_en:
            p["titleEn"] = series_en[p["id"]]
        elif p["id"] in copied_pl:
            p["titleEn"] = copied_pl[p["id"]]
        else:
            p["titleEn"] = ""
    for v in data["videos"]:
        if v["id"] in video_en:
            v["titleEn"] = video_en[v["id"]]
        elif v["id"] in copied_v:
            v["titleEn"] = copied_v[v["id"]]
        else:
            v["titleEn"] = ""
    # Arabic titles untouched
    for p in data["playlists"]:
        assert p["title"] == orig_titles[p["id"]], f"playlist {p['id']} title altered"
    for v in data["videos"]:
        assert v["title"] == orig_titles[v["id"]], f"video {v['id']} title altered"

    record = {
        "meta": {
            "series_hand": len(series_en),
            "series_copied": len(copied_pl),
            "series_held": sorted(held_pl_ids),
            "videos_hand": len([k for k in load_tsv(VERSE_TSV)]),
            "videos_mt": len(mt_applied),
            "videos_copied": len(copied_v),
            "videos_held": sorted(held_v_ids),
        },
        "playlists": {**series_en, **copied_pl},
        "videos": {**video_en, **copied_v},
        "held": held,
    }
    if check_only:
        print("CHECK OK")
    else:
        REC.write_text("const DATA = " + json.dumps(data, ensure_ascii=False) + ";\n", encoding="utf-8")
        RECORD.write_text(json.dumps(record, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(
        f"playlists: hand={len(series_en)} copied={len(copied_pl)} held={len(held_pl_ids)} | "
        f"videos: hand={record['meta']['videos_hand']} mt={len(mt_applied)} "
        f"copied={len(copied_v)} held={len(held_v_ids)}"
    )


if __name__ == "__main__":
    main()
