"""Assemble v5-clone/build/ from src/ and the reconciled catalog, then verify it.

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
# Hosted flavor only: card stills derived from the video ID (owner order, Nov 21 2026).
YT_THUMB_OK = "https://i.ytimg.com/vi/"
# Live Phase 1 (Nov 21 2026): the "Watch live on YouTube" home button links
# to the channel's /live page. This exact URL only: no other youtube.com
# URL is allowlisted.
YT_LIVE_OK = "https://www.youtube.com/@dr.moustafakamel508/live"

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


def strip_title_en(obj):
    """Deep copy of a catalog with every titleEn dropped.

    English titles are the one field where v5 deliberately differs from v4
    (Nov 22, 2026 translation fix): the v4-equality guard compares the
    catalogs with titleEn stripped, so a filled English title never trips it
    while any other drift still fails loudly.
    """
    if isinstance(obj, dict):
        return {k: strip_title_en(v) for k, v in obj.items() if k != "titleEn"}
    if isinstance(obj, list):
        return [strip_title_en(x) for x in obj]
    return obj


def admin_overrides():
    """The admin page's committed overrides (src/admin-overrides.json)."""
    ov = json.loads((SRC / "admin-overrides.json").read_text(encoding="utf-8"))
    assert set(ov) == {"books", "series", "videos", "settings"}, (
        "admin-overrides.json must have books, series, videos, settings"
    )
    for b_id, o in (ov.get("books") or {}).items():
        assert set(o) <= {
            "pages",
            "title_ar",
            "title_en",
            "hidden",
            "note",
            "status",
        }, f"admin override for {b_id}: unknown key"
        if o.get("pages") is not None:
            assert isinstance(o["pages"], int) and o["pages"] > 0, (
                f"admin override for {b_id}: pages must be a positive number"
            )
    st = ov.get("settings") or {}
    assert set(st) <= {"announcement", "liveEnabled"}, (
        "admin settings allow only announcement and liveEnabled"
    )
    assert isinstance(st.get("announcement", ""), str), (
        "admin announcement must be text"
    )
    assert isinstance(st.get("liveEnabled", True), bool), (
        "admin liveEnabled must be true or false"
    )
    return ov


def held_books():
    """Books held out of the public list (BOOKS_HELD), with their titles,
    so the admin page can show them as held instead of hiding all trace."""
    s = (V5P / "books" / "books-data.js").read_text(encoding="utf-8")
    src = json.loads(s[s.index("{") : s.rindex("}") + 1])["books"]
    out = []
    for b in src:
        if b["id"] in BOOKS_HELD:
            out.append(
                {
                    "id": b["id"],
                    "title_ar": b["title_ar"],
                    "title_en": b["title_en"],
                    "reason": "held: the file is not on GitHub and authorship is not confirmed; needs the Sheikh",
                }
            )
    return out


def shell(head_extra, data_script):
    css = (SRC / "app.css").read_text(encoding="utf-8")
    admin_css = (SRC / "admin.css").read_text(encoding="utf-8")
    admin_js = (SRC / "admin.js").read_text(encoding="utf-8")
    overrides = admin_overrides()
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
        + "\n"
        + admin_css
        + "</style>\n</head>\n<body>\n"
        + body
        + data_script
        + "<script>const BOOKS = "
        + books_literal()[0]
        + ";</script>\n"
        + "<script>const ADMIN_OVERRIDES = "
        + json.dumps(overrides, ensure_ascii=False, separators=(",", ":"))
        + ";</script>\n"
        + "<script>const ADMIN_HELD = "
        + json.dumps(held_books(), ensure_ascii=False, separators=(",", ":"))
        + ";</script>\n"
        + "<script>const CURATION = "
        + curation
        + ";</script>\n<script>\n"
        + renderer
        + "\n</script>\n<script>\n"
        + admin_js
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


# The web host serves one index.html plus files under ./assets/ only. The live
# Nov 21 site kept "Preview/assets/..." paths, so its fonts, girih pattern and
# ornaments all 404ed and it rendered plainer than v4. The bundle below uses
# the v4 preview's layout: every asset path rewritten to assets/, and the
# recitation is shipped, so the server status check is replaced (no server).
STATUS_FETCH = """    fetch("__status", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        status = j;
        avail = !!(j && j.recitation);
        statusKey = avail ? "rec_ready" : "rec_none";
        ui();
        paintDetails();
      })
      .catch(() => {})
      .finally(() => {"""
STATUS_SHIPPED = """    Promise.resolve()
      .then(() => {
        avail = true;
        statusKey = "rec_ready";
        ui();
        paintDetails();
      })
      .finally(() => {"""


def preview_bundle(pv, out):
    html = (pv / "archive-hosted.html").read_text(encoding="utf-8")
    assert html.count(STATUS_FETCH) == 1, "recitation status block not found"
    html = html.replace(STATUS_FETCH, STATUS_SHIPPED)
    html = re.sub(r'src="Preview/catalog\.js\?v=', 'src="assets/catalog.js?v=', html)
    html = html.replace("Preview/assets/", "assets/")
    left = re.findall(r"Preview/[^\s\"')]*", html)
    assert not left, f"preview: unrewritten paths {left[:5]}"
    for ref in set(re.findall(r"assets/[\w./-]+\.(?:woff2|svg|jpg|mp3|json|js)", html)):
        assert (pv / ref.replace("assets/catalog.js", "catalog.js").replace("assets/", "assets/", 1)).exists() or (
            pv / ref
        ).exists(), f"preview: {ref} has no file"
    new = out.with_name(out.name + ".new")
    if new.exists():
        shutil.rmtree(new)
    shutil.copytree(pv / "assets", new / "assets")
    shutil.copy2(pv / "catalog.js", new / "assets/catalog.js")
    (new / "index.html").write_text(html, encoding="utf-8")
    # Books (item 4): the public bundle NEVER ships book PDFs — the share
    # review blocks them as personal details (Nov 21 2026). Book files live
    # on R2 when r2-books-base.txt is set, else in books/ beside the local
    # build; the app shows the installed-app note when a file is not there.
    # Still assert every referenced PDF exists on disk, so a missing download
    # fails the build loudly instead of shipping a dead Read button.
    books_src = V5P.parent / "v5" / "books-from-sheikh"
    _s = (V5P / "books" / "books-data.js").read_text(encoding="utf-8")
    _src_books = json.loads(_s[_s.index("{") : _s.rindex("}") + 1])["books"]
    want = sorted(
        {pathlib.Path(f).name for b in _src_books for f in b["files"] if f.endswith(".pdf")}
    )
    by_name = {p.name: p for p in books_src.rglob("*.pdf")}
    missing = [n for n in want if n not in by_name]
    assert not missing, f"preview: book PDFs missing {missing[:5]}"
    for n in want:
        assert by_name[n].stat().st_size > 0, f"preview: book {n} empty"
    for ref in set(re.findall(r"assets/[\w./-]+\.(?:woff2|svg|jpg|mp3|json|js)", html)):
        assert (new / ref).stat().st_size > 0, f"preview: {ref} missing or empty"
    if out.exists():
        shutil.rmtree(out)
    os.rename(new, out)
    print(f"preview bundle: {out} (index.html + assets/, every referenced asset present and non-empty)")


# Books (item 4): the adjudicated list from the books audit, one entry per
# WORK (volumes and parts nest inside it, so no title is listed twice).
# Held back until the owner rules: everything on books/owner-review-list.json,
# and book-38 (no author stated in the file; listing it here would imply the
# Sheikh wrote it). book-66 is the same series (#17, Nov 23 2026 daily
# fetch): same authorship question, same hold.
BOOKS_HELD = {"book-38", "book-66"}


def books_literal():
    # Books bases for book files, split by type (Nov 21, 2026, verified
    # firsthand): PDFs go through jsDelivr
    # (https://cdn.jsdelivr.net/gh/Merolearns/sheikh-archive@main/books),
    # which serves them as application/pdf so Read opens the book in the
    # browser; raw.githubusercontent serves PDFs as
    # application/octet-stream, which only downloads them. The Word file
    # goes through raw.githubusercontent instead — jsDelivr answers .docx
    # with 403. books-base.txt holds the PDF base, books-base-docx.txt
    # the Word base; when a file is absent the URLs stay local
    # books/... paths. The Word file (book-31) does exist on disk in
    # books-from-sheikh/books/, so it ships to its base like the PDFs
    # (Nov 21, 2026: the earlier "never downloaded" note was wrong —
    # the file serves 200 from the testroot books symlink).
    def _read_base(name):
        f = V5P / name
        return f.read_text(encoding="utf-8").strip().rstrip("/") if f.exists() else ""
    _pdf_base = _read_base("books-base.txt")
    _docx_base = _read_base("books-base-docx.txt")
    def _f(name):
        if name.endswith(".pdf") and _pdf_base:
            return f"{_pdf_base}/{name}"
        if name.endswith(".docx") and _docx_base:
            return f"{_docx_base}/{name}"
        return "books/" + name
    s = (V5P / "books" / "books-data.js").read_text(encoding="utf-8")
    src = json.loads(s[s.index("{") : s.rindex("}") + 1])["books"]
    # Admin overrides (src/admin-overrides.json): a hidden book stays out
    # of the public list; a title or page count override replaces the
    # catalogued value before works are grouped.
    books_ov = admin_overrides().get("books", {})
    unknown = sorted(set(books_ov) - {b["id"] for b in src})
    assert not unknown, f"admin overrides name unknown books: {unknown}"
    works, by_book = [], {}
    for b in src:
        if b["id"] in BOOKS_HELD:
            continue
        o = books_ov.get(b["id"], {})
        if o.get("hidden"):
            continue
        if o.get("title_ar"):
            b["title_ar"] = o["title_ar"]
        if o.get("title_en"):
            b["title_en"] = o["title_en"]
        if o.get("pages"):
            b["pages"] = int(o["pages"])
        key = (b["title_ar"] or b["title_en"], b["language"])
        w = next((w for w in works if w["key"] == key), None)
        if w is None:
            w = {
                "key": key, "id": "b" + b["id"][5:], "ar": b["title_ar"], "en": b["title_en"],
                "lang": b["language"], "author_ar": b["author_ar"], "author_en": b["author_en"],
                "format": b["format"], "blurb": b["blurb"], "cover": None, "parts": [], "companion": b["companion"],
            }
            works.append(w)
        by_book[b["id"]] = w
        if b["cover"] and not w["cover"]:
            w["cover"] = "Preview/assets/img/books/" + pathlib.Path(b["cover"]).name
        if b["parts"]:
            w["parts"] += [{"n": x["part"], "file": _f(x["file"]), "pages": x["pages"]} for x in b["parts"]]
        else:
            w["parts"].append({"n": b["part"], "file": _f(pathlib.Path(b["files"][0]).name), "pages": b["pages"]})
    for w in works:
        c = w.pop("companion")
        w["companion"] = by_book[c]["id"] if c in by_book else None
        w.pop("key")
        w["pages"] = sum(x["pages"] or 0 for x in w["parts"])
        assert len({x["n"] for x in w["parts"]}) == len(w["parts"]), f"{w['id']}: duplicate part numbers"
        if w["cover"]:
            assert (SRC / w["cover"].replace("Preview/", "", 1)).exists(), w["cover"]
    titles = [(w["ar"] or "", w["en"] or "", w["lang"]) for w in works]
    assert len(titles) == len(set(titles)), "a book title is listed twice"
    files = [x["file"] for w in works for x in w["parts"]]
    assert len(files) == len(set(files)), "a book file is listed twice"
    return json.dumps(works, ensure_ascii=False, separators=(",", ":")), len(works), len(files)


def main():
    rec_text = (V5P / "audit" / "catalog-reconciled.js").read_text(encoding="utf-8")
    base, literal = data_literal(rec_text)
    v4_html = (V4 / "Preview/archive.html").read_text(encoding="utf-8")
    v4_base, _ = data_literal(v4_html)
    assert strip_title_en(base) == strip_title_en(v4_base), (
        "reconciled DATA differs from v4 DATA outside titleEn"
    )
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
        f"/* Archive catalog v5,  version {version}. Generated by build.py; do not edit. */\n"
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
        f"catalog from audit/catalog-reconciled.js (deep-equal to v4 except titleEn, version {version}): {n_videos} media entries, {n_playlists} playlists, {n_entries} memberships"
    )

    ids = {v["id"] for v in base["videos"]}
    pls = {p["id"] for p in base["playlists"]}
    cur = json.loads((SRC / "content.json").read_text(encoding="utf-8"))
    assert set(cur["pillars"]) == pls, "pillar map must cover exactly the 71 playlists"
    assert len(cur["days"]) == 40 and all(
        i in ids for d in cur["days"] for i in d["ids"]
    )
    assert all(f["id"] in ids and f["pl"] in pls for f in cur["first"].values())
    _, n_works, n_files = books_literal()
    print(f"books: {n_works} works, {n_files} files, no title or file listed twice; held for owner: {sorted(BOOKS_HELD)}")
    ov = admin_overrides()
    bad_series = sorted(set(ov.get("series", {})) - {p["id"] for p in base["playlists"]})
    bad_videos = sorted(set(ov.get("videos", {})) - {v["id"] for v in base["videos"]})
    assert not bad_series, f"admin overrides name unknown series: {bad_series}"
    assert not bad_videos, f"admin overrides name unknown videos: {bad_videos}"
    print(
        f"admin overrides: {len(ov.get('books', {}))} book entries, "
        f"{len(ov.get('series', {}))} series, {len(ov.get('videos', {}))} videos; "
        f"announcement {'set' if (ov.get('settings', {}).get('announcement')) else 'empty'}, "
        f"live {'on' if ov.get('settings', {}).get('liveEnabled', True) else 'off'}"
    )
    print(
        "curation resolves: 71 playlists mapped, 40 days, 3 first lessons, all IDs in the catalog"
    )

    # The configured books bases are intentional external origins for
    # book files (see books_literal); they are exempt from the
    # no-external-URL guard exactly like the YouTube embed/thumb origins.
    def _read_base(name):
        f = V5P / name
        return f.read_text(encoding="utf-8").strip().rstrip("/") if f.exists() else ""
    _books_bases = [b for b in (_read_base("books-base.txt"), _read_base("books-base-docx.txt")) if b]
    for name in ("archive.html", "archive-hosted.html"):
        ui = ui_text((PV / name).read_text(encoding="utf-8"))
        assert "—" not in ui, f"em dash in {name}"
        ext = [
            u
            for u in re.findall(r"https?://[^\s\"'<>)]+", ui)
            if not u.startswith(YT_EMBED_OK)
            and not u.startswith(YT_THUMB_OK)
            and not u.startswith(YT_LIVE_OK)
            and not any(u.startswith(b) for b in _books_bases)
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

    r = subprocess.run(
        ["node", "--check", str(SRC / "admin.js")], capture_output=True, text=True
    )
    if r.returncode:
        sys.exit("JS syntax error in admin.js:\n" + r.stderr)
    print("node --check admin.js OK")

    guard = V5P / "guard" / "network_guard.py"
    guard_cmd = [sys.executable, str(guard), str(PV)]
    for _b in _books_bases:
        # Book files live on the configured books bases (see
        # books_literal); their URLs are intentional, not leaks.
        guard_cmd += ["--allow-prefix", _b]
    r = subprocess.run(guard_cmd, capture_output=True, text=True)
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
    preview_bundle(live_out / "Preview", V5P / "preview")


if __name__ == "__main__":
    main()
