"""v4 live HTTP checks (v3's 23 plus the bundled recitation: flag true, MIME, bytes, Range).
Live HTTP checks against a running archive server. Usage: python3 http_tests.py http://127.0.0.1:8765"""

import json
import pathlib
import sys
import urllib.error
import urllib.request
import urllib.parse

BASE = sys.argv[1].rstrip("/")
TR = pathlib.Path(__file__).resolve().parent.parent / "testroot"
ids = json.load(open(TR / "test-ids.json"))
html = (TR / "Preview/archive.html").read_text(encoding="utf-8")
data, _ = json.JSONDecoder().raw_decode(
    html[html.find("{", html.find("const DATA =")) :]
)
vid = {v["id"]: v for v in data["videos"]}
fails = 0


def req(path, method="GET", headers=None):
    r = urllib.request.Request(BASE + path, method=method, headers=headers or {})
    try:
        with urllib.request.urlopen(r) as resp:
            return resp.status, dict(resp.headers), resp.read()
    except urllib.error.HTTPError as e:
        return e.code, dict(e.headers), e.read()


def check(name, ok, detail):
    global fails
    fails += not ok
    print(("PASS " if ok else "FAIL ") + name + " :: " + detail)


s, h, b = req("/")
check(
    "GET / full page",
    s == 200
    and h["Content-Type"].startswith("text/html")
    and len(b) == len(html.encode())
    and b"const DATA =" in b,
    f"{s} {h['Content-Type']} {len(b)} bytes (file {len(html.encode())})",
)

media = "/" + vid[ids["with_subs"]]["media"]
size = (TR / urllib.request.url2pathname(media.lstrip("/"))).stat().st_size
s, h, b = req(media)
check(
    "GET Arabic URL-encoded .mkv",
    s == 200 and h["Content-Type"] == "video/x-matroska" and len(b) == size,
    f"{s} {h['Content-Type']} {len(b)} bytes, Accept-Ranges={h.get('Accept-Ranges')}",
)

s, h, b = req(media, headers={"Range": "bytes=0-99"})
check(
    "Range bytes=0-99",
    s == 206 and h["Content-Range"] == f"bytes 0-99/{size}" and len(b) == 100,
    f"{s} Content-Range={h.get('Content-Range')} len={len(b)}",
)
s, h, b = req(media, headers={"Range": "bytes=-50"})
check(
    "Range suffix bytes=-50",
    s == 206
    and h["Content-Range"] == f"bytes {size - 50}-{size - 1}/{size}"
    and len(b) == 50,
    f"{s} Content-Range={h.get('Content-Range')}",
)
s, h, b = req(media, headers={"Range": f"bytes={size + 10}-"})
check("Range past end -> 416", s == 416, f"{s} Content-Range={h.get('Content-Range')}")

s, h, b = req("/__status")
j = json.loads(b)
check(
    "/__status JSON",
    s == 200
    and h["Content-Type"].startswith("application/json")
    and j["videos_exists"] is True
    and j["videos_count"] > 0,
    f"{s} {b.decode()}",
)

missing = "/" + vid[ids["missing"]]["media"]
s, h, b = req(missing)
check("GET missing media -> 404", s == 404, str(s))
s, h, b = req(missing, method="HEAD")
check("HEAD missing media -> 404", s == 404, str(s))
s, h, b = req(media, method="HEAD")
check(
    "HEAD existing media -> 200",
    s == 200 and h["Content-Length"] == str(size) and b == b"",
    f"{s} Content-Length={h.get('Content-Length')}",
)
s, h, b = req("/", method="HEAD")
check("HEAD / -> 200", s == 200, f"{s} {h.get('Content-Type')}")

sub = vid[ids["with_subs"]]["subtitles"][0]
s, h, b = req("/" + sub["src"])
check(
    "GET .vtt MIME",
    s == 200 and h["Content-Type"] == "text/vtt; charset=utf-8",
    f"{s} {h['Content-Type']}",
)
s, h, b = req("/" + sub["readSrc"])
check(
    "GET .txt UTF-8",
    s == 200
    and h["Content-Type"] == "text/plain; charset=utf-8"
    and "بسم".encode() in b,
    f"{s} {h['Content-Type']}",
)
cat = (TR / "Preview/catalog.js").read_bytes()
s, h, b = req("/Preview/catalog.js")
check(
    "GET catalog.js",
    s == 200
    and h["Content-Type"] == "text/javascript; charset=utf-8"
    and b == cat
    and b.count(b'"media":') == 3977,
    f"{s} {h['Content-Type']} {len(b)} bytes, {b.count(b'"media":')} media entries",
)
hosted = (TR / "Preview/archive-hosted.html").read_bytes()
ver = hosted.split(b'name="catalog-version" content="')[1].split(b'"')[0]
s, h, b = req("/Preview/catalog.js?v=" + ver.decode())
check(
    "GET versioned catalog.js?v=",
    s == 200 and b == cat and ver in cat[:120],
    f"{s} version {ver.decode()}",
)
s, h, b = req("/Preview/archive-hosted.html")
check(
    "GET hosted flavor",
    s == 200 and b == hosted and b"const DATA =" not in b,
    f"{s} {len(b)} bytes, no inlined DATA",
)
check(
    "/__status recitation: true",
    j.get("recitation") is True,
    f"recitation={j.get('recitation')!r}",
)
mp3 = (TR / "Preview/assets/recitation.mp3").read_bytes()
s, h, b = req("/Preview/assets/recitation.mp3")
check(
    "GET recitation.mp3 audio/mpeg, exact bytes",
    s == 200 and h["Content-Type"].startswith("audio/mpeg") and b == mp3,
    f"{s} {h.get('Content-Type')} {len(b)} bytes (file {len(mp3)})",
)
s, h, b = req("/Preview/assets/recitation.mp3", headers={"Range": "bytes=1000-1999"})
check(
    "Range on recitation.mp3 -> 206",
    s == 206 and b == mp3[1000:2000],
    f"{s} {h.get('Content-Range')} {len(b)} bytes",
)
s, h, b = req("/")
check(
    "page carries the v4 edition and CATALOG_VERSION",
    b"v4 \xc2\xb7 " in b and b'const CATALOG_VERSION = "' in b,
    f"{len(b)} bytes",
)
# Admin page (V5): the view, the committed overrides and the admin
# script ship in the page; no privileged key ever appears in it.
check(
    "admin: view + overrides + held book present, no service key",
    'id="v-admin"' in html
    and "const ADMIN_OVERRIDES =" in html
    and '"book-06"' in html
    and "Proud To Be Muslims" in html
    and "window.__adminRender" in html
    and "service_role" not in html
    and "service-role" not in html,
    "v-admin + ADMIN_OVERRIDES + ADMIN_HELD in archive.html",
)
for a in (
    "Preview/docs/server-contract.md",
    "Preview/assets/img/sunset.svg",
    "Preview/assets/img/ornament.svg",
    "Preview/assets/img/girih.svg",
    "Preview/assets/fonts/amiri-quran-400.woff2",
    "Preview/assets/fonts/noto-sans-arabic-400.woff2",
    "Preview/assets/fonts/reem-kufi-400.woff2",
):
    s, h, b = req("/" + a)
    check(
        "asset " + a,
        s == 200 and len(b) > 0,
        f"{s} {h.get('Content-Type')} {len(b)} bytes",
    )

# Books (item 4): every listed part file is served from books/ with ranges.
# A part URL may be absolute (remote base: jsDelivr for PDFs, raw GitHub
# for the Word file) — those are fetched directly, not through the local
# server, which would 404 any absolute path (Nov 21, 2026: the old code
# prepended the local BASE to absolute URLs, so the check failed in
# remote mode even when every remote file served fine).
books = json.loads(
    html[
        html.find("[", html.find("const BOOKS =")) : html.find(
            ";</script>", html.find("const BOOKS =")
        )
    ]
)
files = [x["file"] for b in books for x in b["parts"]]
bad = []
for f in files:
    if f.startswith("http"):
        r = urllib.request.Request(f, method="HEAD")
        try:
            with urllib.request.urlopen(r) as resp:
                s, h, b = resp.status, dict(resp.headers), resp.read()
        except urllib.error.HTTPError as e:
            s, h, b = e.code, dict(e.headers), e.read()
    else:
        s, h, b = req("/" + urllib.parse.quote(f), method="HEAD")
    if s != 200:
        bad.append(f"{s} {f}")
check(
    "books: every listed part file is served",
    not bad,
    f"{len(files)} files, bad={bad[:3]}",
)
s, h, b = req("/books/Part1_Interior_256pp.pdf", headers={"Range": "bytes=0-4"})
check(
    "books: PDF served with byte ranges",
    s == 206 and b == b"%PDF-" and h.get("Content-Type") == "application/pdf",
    f"{s} {h.get('Content-Type')} {b!r}",
)

print("FAILURES:", fails)
sys.exit(1 if fails else 0)
