"""v3 live HTTP checks (v2's 16 plus catalog.js, hosted flavor, recitation flag).
Live HTTP checks against a running archive server. Usage: python3 http_tests.py http://127.0.0.1:8765"""

import json
import pathlib
import sys
import urllib.error
import urllib.request

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
    s == 200 and h["Content-Type"] == "text/javascript; charset=utf-8" and b == cat
    and b.count(b'"media":') == 3977,
    f"{s} {h['Content-Type']} {len(b)} bytes, {b.count(b'\"media\":')} media entries",
)
hosted = (TR / "Preview/archive-hosted.html").read_bytes()
ver = hosted.split(b'name="catalog-version" content="')[1].split(b'"')[0]
s, h, b = req("/Preview/catalog.js?v=" + ver.decode())
check("GET versioned catalog.js?v=", s == 200 and b == cat and ver in cat[:120], f"{s} version {ver.decode()}")
s, h, b = req("/Preview/archive-hosted.html")
check("GET hosted flavor", s == 200 and b == hosted and b"const DATA =" not in b, f"{s} {len(b)} bytes, no inlined DATA")
check("/__status recitation boolean", j.get("recitation") is False, f"recitation={j.get('recitation')!r}")
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

print("FAILURES:", fails)
sys.exit(1 if fails else 0)
