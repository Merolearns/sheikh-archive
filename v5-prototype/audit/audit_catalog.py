"""Reconcile the fixed V4 catalog and inventory snapshots without reading media."""

import csv
import errno
import json
import re
import sys
from collections import Counter, defaultdict
from datetime import date
from pathlib import Path

OUTPUT = Path(__file__).resolve().parent
WORKSPACE = OUTPUT.parents[2]
CATALOG = WORKSPACE / "archive-rebuild/v4/build/Preview/catalog.js"
INVENTORY = WORKSPACE / "youtube-archive/metadata/inventory"
BUKHARI = "PLXKSrZvHoN9cf7lGMyZjw0cndaCk004f0"


def read_data(path):
    text = path.read_text(encoding="utf-8")
    assignment = re.search(r"\bconst\s+DATA\s*=\s*", text)
    if assignment is None:
        raise ValueError(f"No const DATA assignment in {path}")
    return json.JSONDecoder().raw_decode(text[assignment.end():])[0]


def load_rows():
    rows_by_playlist = {}
    for path in sorted(INVENTORY.glob("pl_entries_*.tsv")):
        rows = []
        for line, text in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
            index, video_id, title = text.split("\t", 2)
            rows.append((int(index), line, index, video_id, title))
        rows_by_playlist[path.stem.removeprefix("pl_entries_")] = sorted(rows)
    return rows_by_playlist


def occurrence_keys(ids):
    seen = Counter()
    keys = []
    for video_id in ids:
        seen[video_id] += 1
        keys.append((video_id, seen[video_id]))
    return keys


def reconcile():
    data = read_data(CATALOG)
    inventory = load_rows()
    videos = {v["id"]: (i, v) for i, v in enumerate(data["videos"], 1)}
    if len(videos) != len(data["videos"]):
        raise ValueError("Duplicate DATA.videos IDs")
    playlists = data["playlists"]
    playlist_ids = {p["id"] for p in playlists}
    if len(playlist_ids) != len(playlists) or playlist_ids != inventory.keys():
        raise ValueError("Playlist file IDs differ from DATA.playlists")
    flat = {}
    for tab in ("videos", "shorts", "streams"):
        path = INVENTORY / f"flat_{tab}.tsv"
        flat[path.name] = {line.split("\t", 1)[0] for line in
                           path.read_text(encoding="utf-8").splitlines()}
    public_ids = set((INVENTORY / "all_ids.txt").read_text().splitlines())
    if public_ids != set().union(*flat.values()):
        raise ValueError("all_ids.txt differs from the public tab union")
    summary = (INVENTORY / "INVENTORY_SUMMARY.md").read_text(encoding="utf-8")
    snapshot = date.fromisoformat(re.search(r"\*\*Inventoried:\*\* (\d{4}-\d\d-\d\d)", summary)[1])
    with (INVENTORY / "unresolved_ids.csv").open(encoding="utf-8-sig", newline="") as source:
        unresolved = {r["video_id"]: (line, r)
                      for line, r in enumerate(csv.DictReader(source), 2)}

    discrepancies = []
    sections = []
    playlist_deltas = []
    reverse = defaultdict(set)
    app_entries = sum(len(p["items"]) for p in playlists)
    app_declared = sum(p["count"] for p in playlists)
    declared_mismatches = sum(p["count"] != len(p["items"]) for p in playlists)
    tsv_entries = sum(map(len, inventory.values()))

    for playlist_number, playlist in enumerate(playlists, 1):
        pid = playlist["id"]
        app_source = f"catalog.js DATA.playlists record {playlist_number}"
        tsv_source = f"pl_entries_{pid}.tsv"
        rows = inventory[pid]
        items = playlist["items"]
        app_ids = [item["id"] for item in items]
        tsv_ids = [row[3] for row in rows]
        app_keys = occurrence_keys(app_ids)
        tsv_keys = occurrence_keys(tsv_ids)
        app_set, tsv_set = set(app_keys), set(tsv_keys)
        if ([key for key in app_keys if key in tsv_set] !=
                [key for key in tsv_keys if key in app_set]):
            raise ValueError(f"{pid}: shared occurrences differ in order")

        if playlist["count"] != len(items) or len(items) != len(rows):
            playlist_deltas.append((pid, app_source, playlist["count"], len(items), len(rows)))
        for key, row in zip(tsv_keys, rows):
            if key in app_set:
                continue
            _, line, index, video_id, title = row
            discrepancies.append(("tsv", pid, video_id, index))
            probe_line, probe = unresolved.get(video_id, (None, {}))
            if video_id in videos or video_id in public_ids or probe.get("action") != "unrecoverable":
                raise ValueError(f"{tsv_source}:{line}: needs a new reconciliation decision")
            positions = [str(i) for i, item_id in enumerate(app_ids, 1) if item_id == video_id]
            duplicate_note = ""
            if probe["reason"] == "duplicate":
                related = [f"`pl_entries_{other}.tsv:{other_row[1]}`"
                           for other, other_rows in inventory.items() for other_row in other_rows
                           if other != pid and other_row[3] == video_id]
                duplicate_note = (
                    " The log labels the ID as a duplicate and supplies no replacement ID. "
                    "The same ID appears in " + ", ".join(related) + "."
                )
            sections.append(
                f"## TSV-only occurrence `{pid}` / `{video_id}` / index `{index}`\n\n"
                f"- TSV row `{tsv_source}:{line}` has title `{title}`. "
                f"This is occurrence {key[1]} of {tsv_ids.count(video_id)} for the ID in that playlist.\n"
                f"- App positions for this ID in {app_source} are "
                f"{', '.join(positions) or 'absent'}. The ID is absent from DATA.videos, "
                "all three public tab TSVs, and all_ids.txt.\n"
                f"- The inventory probe log `unresolved_ids.csv:{probe_line}` records "
                f"`{probe['reason']}` and `{probe['action']}`.{duplicate_note}\n"
                "- Resolution. Exclude this occurrence from the offline catalog.\n"
            )

        reconciled_items = []
        for position, (key, item) in enumerate(zip(app_keys, items), 1):
            video_id = item["id"]
            if video_id not in videos:
                raise ValueError(f"{app_source} item {position}: missing DATA.videos record")
            video_number, video = videos[video_id]
            if key not in tsv_set:
                discrepancies.append(("app", pid, video_id, None))
                if (video_id in public_ids or video_id in tsv_ids or not video.get("media")
                        or pid not in video["playlistIds"]
                        or date.fromisoformat(video["uploadDate"]) <= snapshot):
                    raise ValueError(f"{app_source} item {position}: needs a new reconciliation decision")
                sections.append(
                    f"## App-only occurrence `{pid}` / `{video_id}`\n\n"
                    f"- TSV playlist_index is unavailable. The ID has no row in `{tsv_source}` "
                    "or in the public tab TSVs and all_ids.txt.\n"
                    f"- App item {position} in {app_source} points to DATA.videos record "
                    f"{video_number}, titled `{video['title']}`. The record declares the same "
                    "playlist and has a media path.\n"
                    f"- The app upload date {video['uploadDate']} follows the {snapshot} inventory "
                    "date in INVENTORY_SUMMARY.md. That supports a newer entry as the cause of the "
                    "snapshot difference. The exact playlist insertion date is unavailable.\n"
                    f"- Resolution. Retain the archived record and membership at app item {position}.\n"
                )
            reconciled_items.append(item)
            reverse[video_id].add(pid)
        playlist["items"] = reconciled_items
        playlist["count"] = len(reconciled_items)

    for video_id, (_, video) in videos.items():
        if set(video["playlistIds"]) != reverse[video_id]:
            raise ValueError(f"{video_id}: DATA.videos playlistIds disagree with playlist items")

    counts = {}

    def count(key, value, unit, source):
        counts[key] = {"value": value, "unit": unit, "source": source}

    entries = "playlist occurrences"
    unique = "unique video IDs"
    bukhari = next(p for p in playlists if p["id"] == BUKHARI)
    bukhari_tsv = inventory[BUKHARI]
    count("app_video_ids", len(videos), unique, "catalog.js DATA.videos IDs")
    count("public_video_ids", len(public_ids), unique, "all_ids.txt and union of flat_videos.tsv, flat_shorts.tsv and flat_streams.tsv")
    count("app_video_ids_outside_public_inventory", len(videos.keys() - public_ids), unique,
          "catalog.js DATA.videos IDs absent from all_ids.txt")
    count("app_playlists", len(playlists), "playlists", "catalog.js DATA.playlists IDs")
    count("tsv_playlists", len(inventory), "playlists", "pl_entries_*.tsv filenames")
    count("app_entries", app_entries, entries, "catalog.js DATA.playlists item lists")
    count("app_declared_entries", app_declared, entries, "catalog.js DATA.playlists count fields")
    count("app_declared_count_mismatches", declared_mismatches, "playlists", "catalog.js DATA.playlists count versus item list length")
    count("playlist_count_deltas", len(playlist_deltas), "playlists", "catalog.js item lists and count fields versus pl_entries_*.tsv")
    count("tsv_entries", tsv_entries, entries, "pl_entries_*.tsv rows")
    count("tsv_only_entries", sum(d[0] == "tsv" for d in discrepancies), entries, "ordered occurrence join of catalog.js and pl_entries_*.tsv")
    count("tsv_only_video_ids", len({d[2] for d in discrepancies if d[0] == "tsv"}), unique, "distinct IDs among TSV-only occurrences")
    count("app_only_entries", sum(d[0] == "app" for d in discrepancies), entries, "ordered occurrence join of catalog.js and pl_entries_*.tsv")
    count("bukhari_app_entries", len(bukhari["items"]), entries, f"catalog.js DATA.playlists items for {BUKHARI}")
    count("bukhari_app_video_ids", len({i["id"] for i in bukhari["items"]}), unique, f"catalog.js DATA.playlists item IDs for {BUKHARI}")
    count("bukhari_tsv_entries", len(bukhari_tsv), entries, f"pl_entries_{BUKHARI}.tsv rows")
    count("bukhari_tsv_video_ids", len({r[3] for r in bukhari_tsv}), unique, f"pl_entries_{BUKHARI}.tsv video_id column")
    count("bukhari_reconciled_entries", len(bukhari["items"]), entries, f"catalog-reconciled.json items for {BUKHARI}")
    count("bukhari_reconciled_video_ids", len({i["id"] for i in bukhari["items"]}), unique, f"catalog-reconciled.json item IDs for {BUKHARI}")
    count("reconciled_playlists", len(playlists), "playlists", "catalog-reconciled.json DATA.playlists IDs")
    count("reconciled_video_ids", len(videos), unique, "catalog-reconciled.json DATA.videos IDs")
    count("reconciled_entries", sum(p["count"] for p in playlists), entries, "catalog-reconciled.json DATA.playlists item lists and count fields")

    report = [
        "# Catalog reconciliation audit\n",
        "The audit compares numbered occurrences of each video ID within each playlist "
        "and verifies that the shared occurrences have the same order. TSV rows are "
        "ordered by numeric playlist_index, with physical line number breaking ties. "
        "App positions and DATA record numbers are one-based. TSV references point to "
        f"files in `{INVENTORY}`. App references point to `{CATALOG}`.\n",
        "## Counts\n",
        "| Measure | Count | Unit | Source |",
        "|---|---:|---|---|",
    ]
    for key, metric in counts.items():
        report.append(f"| {key.replace('_', ' ')} | {metric['value']:,} | {metric['unit']} | {metric['source']} |")
    report.extend([
        "",
        "## Playlist count differences\n",
        "| Playlist ID | App source | App count field | App items | TSV rows | TSV − app items |",
        "|---|---|---:|---:|---:|---:|",
    ])
    for pid, source, declared, app, tsv in playlist_deltas:
        report.append(f"| `{pid}` | {source} | {declared:,} | {app:,} | {tsv:,} | {tsv - app:+,} |")
    bukhari_indexes = ", ".join(f"`{index}`" for side, pid, _, index in discrepancies
                               if side == "tsv" and pid == BUKHARI)
    report.extend([
        "",
        "## Bukhari count difference\n",
        f"The additional TSV occurrences are at playlist indexes {bukhari_indexes}. "
        "Their IDs are absent from DATA.videos and the inventory probe log records each as "
        "unrecoverable. The ordered shared occurrences, including repeated IDs, are "
        "preserved in the reconciled catalog.\n",
        "## Reconciled catalog\n",
        f"The reconciled membership total is {tsv_entries:,} TSV occurrences "
        f"minus {counts['tsv_only_entries']['value']} unavailable occurrences "
        f"plus {counts['app_only_entries']['value']} supported app-only occurrence. "
        "Every retained item resolves to DATA.videos, and the reverse playlistIds "
        "agree with the retained memberships. This audit uses catalog metadata for "
        "offline availability and does not inspect media.\n",
        *sections,
    ])
    return data, counts, discrepancies, "\n".join(report)


def write_outputs(directory=OUTPUT):
    data, counts, _, report = reconcile()
    literal = json.dumps(data, ensure_ascii=False, allow_nan=False)
    literal = literal.replace("\u2028", r"\u2028").replace("\u2029", r"\u2029")
    files = {
        "catalog-reconciled.json": literal + "\n",
        "catalog-reconciled.js": f"const DATA = {literal};\n",
        "counts.json": json.dumps(counts, ensure_ascii=False, indent=2) + "\n",
        "AUDIT-REPORT.md": report,
    }
    for name, content in files.items():
        path = directory / name
        path.write_text(content, encoding="utf-8")
    return counts


def main():
    try:
        counts = write_outputs()
    except OSError as error:
        if error.errno == errno.EROFS:
            sys.exit(f"Read-only file system: {error.filename}")
        raise
    for key in ("app_entries", "tsv_entries", "tsv_only_entries", "app_only_entries",
                "reconciled_playlists", "reconciled_video_ids", "reconciled_entries",
                "bukhari_reconciled_entries", "bukhari_reconciled_video_ids"):
        metric = counts[key]
        print(f"{key.replace('_', ' ')} = {metric['value']:,} {metric['unit']}")


if __name__ == "__main__":
    main()
