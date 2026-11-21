"""Assemble v5-prototype/build/ from src/ and the reconciled catalog, then verify it.

Prototype track (Qwen) while Claude Code is capped. Same shell as v4, plus:
  - DATA literal from audit/catalog-reconciled.js (Codex track item 1); the
    reconciled DATA is deep-equal to v4's, so output content is unchanged —
    but the wiring must exist so future reconciliations flow through.
  - render/chunked-render.js inlined before app.js (item 10).
  - guard/network_guard.py runs over the assembled build/Preview/ as a
    build step and fails the build on violations (item 9).
  - YouTube nocookie embed host allowlisted in the external-URL guard;
    every other external URL still fails the build.
  - Preview/assets/supabase-config.json ships the archive project's config
    when configured (empty means email sign-in is honestly unavailable);
    the build never overwrites filled values.
  - ATOMIC OUTPUT (Nov 21 2026, owner order, after a quota failure wiped
    build/ mid-write): the build assembles into build.new/ and swaps it into
    build/ only after every verification passes. It NEVER deletes build/
    first and NEVER truncates a live file in place. The previous good build
    is kept at build.old/ as the fallback. A failed build leaves the live
    build untouched; build.new/ is discarded on the next run.
"""

import hashlib
import json
import os
import pathlib
import re
import shutil
import subprocess
import sys

V5P = pathlib.Path(__file__).resolve().parent
V4 = V5P.parent / "v4" / "build"
SRC = V5P / "src"
OUT = V5P / "build"
RECITATION = (
    pathlib.Path.home()
    / "workspace/research_notes/islamic-archive-v4-improvements-20261029-0426/recitation.mp3"
)
PV = OUT / "Preview"
LAUNCHERS = ("Start Archive - Windows.bat", "Start_Archive_-_macOS.command")
# The single external host the prototype may reference: the YouTube
# privacy-enhanced embed used by dual playback (item 13). It is built
# in app.js from this literal prefix plus the video ID.
YT_EMBED_OK = "https://www.youtube-nocookie.com/embed/"

# Unfinished language that must never reach a shipped screen (brief, build action A).
PLACEHOLDERS = (
    "awaiting",
    "to be confirmed",
    "draft",
    "lorem",
    "coming soon",
    "tbd",
    "todo",
    "fixme",
    "بانتظار",
    "قيد التأكيد",
    "مسودة",
    "قريبا",
)


def mp3_frames(b):
    """Count MPEG-1 Layer III frames by walking frame headers, so a truncated or non-audio file fails."""
    i = 10 + int.from_bytes(bytes(c & 0x7F for c in b[6:10]), "big") if b[:3] == b"ID3" else 0
    rates = (0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320)
    srs = (44100, 48000, 32000)
    n = 0
    while i + 4 <= len(b):
        if b[i] != 0xFF or (b[i + 1] & 0xFE) != 0xFA:
            break
        br, sr = rates[b[i + 2] >> 4], srs[(b[i + 2] >> 2) & 3]
        i += 144000 * br // sr + ((b[i + 2] >> 1) & 1)
        n += 1
    return n


def data_literal(html):
    j = html.find("{", html.find("const DATA ="))
    obj, end = json.JSONDecoder().raw_decode(html[j:])
    return obj, html[j : j + end]


def shell(head_extra, data_script):
    css = (SRC / "app.css").read_text(encoding="utf-8")
    body = (SRC / "body.html").read_text(encoding="utf-8")
    app = (SRC / "app.js").read_text(encoding="utf-8")
    renderer = (V5P / "render" / "chunked-render.js").read_text(encoding="utf-8")
    curation = json.dumps(
        json.loads((SRC / "content.json").read_text(encoding="utf-8")),
        ensure_ascii=False,
        separators=(",", ":"),
    )
    return (
        '<!DOCTYPE html>\n<html lang="ar" dir="rtl" data-theme="emerald">\n<head>\n'
        '<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n'
        '<meta name="color-scheme" content="dark light">\n'
        "<title>مكتبة فضيلة الشيخ الدكتور مصطفى كامل</title>\n"
        + head_extra
        + "<style>\n"
        + css
        + "</style>\n</head>\n<body>\n"
        + body
        + data_script
        + "<script>const CURATION = "
        + curation
        + ";</script>\n<script>\n"
        + renderer
        + "\n</script>\n<script>\n"
        + app
        + "</script>\n</body>\n</html>\n"
    )


def ui_text(text):
    """The text a user can see: everything outside the catalog literal."""
    i = text.find("const DATA =")
    if i < 0:
        return text
    _, lit = data_literal(text)
    j = text.find(lit, i)
    return text[:i] + text[j + len(lit) :]


def main():
    rec_text = (V5P / "audit" / "catalog-reconciled.js").read_text(encoding="utf-8")
    base, literal = data_literal(rec_text)
    v4_html = (V4 / "Preview/archive.html").read_text(encoding="utf-8")
    v4_base, _ = data_literal(v4_html)
    assert base == v4_base, "reconciled DATA is not deep-equal to v4 DATA"
    counts = json.loads((V5P / "audit" / "counts.json").read_text(encoding="utf-8"))
    n_videos = counts["reconciled_video_ids"]["value"]
    n_playlists = counts["reconciled_playlists"]["value"]
    n_entries = counts["reconciled_entries"]["value"]
    version = hashlib.sha256(literal.encode()).hexdigest()[:12]

    # Atomic output (Nov 21 2026, owner order): build into build.new/ and
    # swap it into build/ only after every check below passes. OUT/PV here
    # are locals pointing at the scratch dir; the live build/ is untouched
    # until the swap. A failed build leaves the live build intact.
    live_out = V5P / "build"
    new_out = V5P / "build.new"
    if new_out.exists():
        shutil.rmtree(new_out)
    OUT = new_out
    PV = new_out / "Preview"
    (PV / "docs").mkdir(parents=True)
    shutil.copytree(SRC / "assets", PV / "assets")
    shutil.copy2(V4 / "Preview/archive_server.py", PV / "archive_server.py")
    for f in LAUNCHERS:
        shutil.copy2(V4 / f, OUT / f)
    shutil.copy2(RECITATION, PV / "assets/recitation.mp3")
    shutil.copy2(V5P / "server-contract.md", PV / "docs/server-contract.md")

    catalog = (
        f"/* Archive catalog v5-prototype, version {version}. Generated by build.py; do not edit. */\n"
        f'const CATALOG_VERSION = "{version}";\n'
        "const DATA = " + literal + ";\n"
    )
    (PV / "catalog.js").write_text(catalog, encoding="utf-8")
    single = shell(
        "",
        f'<script>const CATALOG_VERSION = "{version}";\nconst DATA = '
        + literal
        + ";</script>\n",
    )
    hosted = shell(
        f'<meta name="catalog-version" content="{version}">\n<meta name="archive-flavor" content="hosted">\n',
        f'<script src="Preview/catalog.js?v={version}"></script>\n',
    )
    (PV / "archive.html").write_text(single, encoding="utf-8")
    (PV / "archive-hosted.html").write_text(hosted, encoding="utf-8")

    # ---- verify ----
    for name in ("archive.html", "catalog.js"):
        text = (PV / name).read_text(encoding="utf-8")
        built, lit = data_literal(text)
        assert lit == literal, f"{name}: DATA literal is not byte-identical to the reconciled catalog"
        assert built == base, f"{name}: DATA is not deep-equal to the reconciled catalog"
        assert text.count('"media":') == n_videos, (
            f"{name}: {text.count(chr(34) + 'media' + chr(34) + ':')} media entries"
        )
        assert len(built["videos"]) == n_videos and len(built["playlists"]) == n_playlists
        assert sum(len(p["items"]) for p in built["playlists"]) == n_entries
    print(
        f"catalog from audit/catalog-reconciled.js (deep-equal to v4, version {version}): {n_videos} media entries, {n_playlists} playlists, {n_entries} memberships"
    )

    ids = {v["id"] for v in base["videos"]}
    pls = {p["id"] for p in base["playlists"]}
    cur = json.loads((SRC / "content.json").read_text(encoding="utf-8"))
    assert set(cur["pillars"]) == pls, "pillar map must cover exactly the 71 playlists"
    assert len(cur["days"]) == 40 and all(
        i in ids for d in cur["days"] for i in d["ids"]
    )
    assert all(f["id"] in ids and f["pl"] in pls for f in cur["first"].values())
    print(
        "curation resolves: 71 playlists mapped, 40 days, 3 first lessons, all IDs in the catalog"
    )

    for name in ("archive.html", "archive-hosted.html"):
        ui = ui_text((PV / name).read_text(encoding="utf-8"))
        assert "—" not in ui, f"em dash in {name}"
        ext = [
            u
            for u in re.findall(r"https?://[^\s\"'<>)]+", ui)
            if not u.startswith(YT_EMBED_OK)
        ]
        assert not ext, f"external URL in {name}: {ext[:3]}"
        low = ui.lower()
        hits = [
            p
            for p in PLACEHOLDERS
            if re.search(r"(?<![\w-])" + re.escape(p) + r"(?![\w-])", low)
        ]
        assert not hits, f"placeholder language in {name}: {hits}"
    print(
        "shell: no em dash, no external URL except the allowlisted YouTube embed host, no placeholder language (both flavors)"
    )

    for f in LAUNCHERS:
        assert (OUT / f).read_bytes() == (V4 / f).read_bytes(), f"launcher differs: {f}"
    assert (PV / "archive_server.py").read_bytes() == (
        V4 / "Preview/archive_server.py"
    ).read_bytes()
    print("launchers and server byte-identical to v4")

    cfg_path = PV / "assets" / "supabase-config.json"
    if not cfg_path.exists():
        # Only write the empty template when the file is absent. Never
        # overwrite a filled config: Nov 21 2026 regression, a filled
        # config (real project URL + anon key) was clobbered back to
        # empty by the old assert that forbade filled values.
        cfg_path.write_text('{"url": "", "anonKey": ""}', encoding="utf-8")
    cfg = json.loads(cfg_path.read_text(encoding="utf-8"))
    assert set(cfg) == {"url", "anonKey"}, "supabase-config.json must have url + anonKey"
    if cfg["url"] or cfg["anonKey"]:
        # Filled config: both fields must be set and well-formed. A
        # half-filled config fails loudly instead of shipping broken login.
        assert cfg["url"] and cfg["anonKey"], (
            "supabase-config.json is half-filled: url and anonKey must both be set or both be empty"
        )
        assert re.match(r"^https://[a-z0-9-]+\.supabase\.co/?$", cfg["url"]), (
            "supabase-config.json url is not a Supabase project URL"
        )
        assert re.fullmatch(
            r"[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+", cfg["anonKey"]
        ), "supabase-config.json anonKey is not a JWT-shaped key"
        cfg_state = "filled (archive project configured; email sign-in live)"
    else:
        cfg_state = "empty (email sign-in honestly unavailable)"
    portrait = (PV / "assets/img/sheikh-portrait.jpg").read_bytes()
    assert portrait[:3] == b"\xff\xd8\xff", "sheikh-portrait.jpg is not a JPEG"
    print(
        f"sheikh portrait present: {len(portrait)} bytes JPEG; supabase-config.json {cfg_state}"
    )

    mp3 = (PV / "assets/recitation.mp3").read_bytes()
    assert mp3 == RECITATION.read_bytes(), "recitation.mp3 differs from the licensed file"
    frames = mp3_frames(mp3)
    seconds = frames * 1152 / 44100
    assert frames > 100 and 19 < seconds < 23, f"recitation.mp3: {frames} frames, {seconds:.1f}s"
    print(f"recitation.mp3 present: {len(mp3)} bytes, {frames} MPEG frames, about {seconds:.1f}s")

    r = subprocess.run(
        ["node", "--check", str(SRC / "app.js")], capture_output=True, text=True
    )
    if r.returncode:
        sys.exit("JS syntax error:\n" + r.stderr)
    print("node --check app.js OK")

    guard = V5P / "guard" / "network_guard.py"
    r = subprocess.run(
        [sys.executable, str(guard), str(PV)], capture_output=True, text=True
    )
    print(r.stdout.strip())
    if r.stderr.strip():
        print(r.stderr.strip(), file=sys.stderr)
    if r.returncode:
        sys.exit("network guard failed on build/Preview/:\n" + r.stdout)
    print("network guard: zero violations on the assembled Preview/")
    # ---- atomic swap: every check passed, so replace the live build.
    # The previous good build is kept at build.old/ as the fallback.
    old_out = V5P / "build.old"
    if old_out.exists():
        shutil.rmtree(old_out)
    if live_out.exists():
        os.rename(live_out, old_out)
    os.rename(new_out, live_out)
    print("swapped build.new/ -> build/; previous build kept at build.old/")
    for p in sorted(live_out.rglob("*")):
        if p.is_file():
            print(f"  {p.relative_to(live_out)}  {p.stat().st_size} bytes")


if __name__ == "__main__":
    main()
