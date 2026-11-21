"""Assemble build/Preview/archive.html from src/ and the baseline catalog, then verify it.

The DATA literal is copied byte for byte from the baseline page, then parsed back out of the
output and deep-compared, so the catalog can never drift.
"""

import json
import pathlib
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parent
BASE = pathlib.Path.home() / "workspace/archive-baseline/working/Preview/archive.html"
OUT = ROOT / "build/Preview/archive.html"


def data_literal(html):
    i = html.find("const DATA =")
    j = html.find("{", i)
    obj, end = json.JSONDecoder().raw_decode(html[j:])
    return obj, html[j : j + end]


def main():
    src = {
        n: (ROOT / "src" / n).read_text(encoding="utf-8")
        for n in ("app.css", "body.html", "app.js")
    }
    for name, text in src.items():
        assert "—" not in text, f"em dash found in src/{name}"
        assert "http://" not in text and "https://" not in text, (
            f"external URL in src/{name}"
        )

    base, literal = data_literal(BASE.read_text(encoding="utf-8"))
    page = (
        '<!DOCTYPE html>\n<html lang="ar" dir="rtl" data-theme="emerald">\n<head>\n'
        '<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n'
        '<meta name="color-scheme" content="dark light">\n'
        "<title>مكتبة فضيلة الشيخ الدكتور مصطفى كامل</title>\n"
        "<style>\n"
        + src["app.css"]
        + "</style>\n</head>\n<body>\n"
        + src["body.html"]
        + "<script>const DATA = "
        + literal
        + ";</script>\n<script>\n"
        + src["app.js"]
        + "</script>\n</body>\n</html>\n"
    )
    OUT.write_text(page, encoding="utf-8")

    built, _ = data_literal(OUT.read_text(encoding="utf-8"))
    assert len(built["videos"]) == 3977, len(built["videos"])
    assert len(built["playlists"]) == 71, len(built["playlists"])
    assert sum(len(p["items"]) for p in built["playlists"]) == 4320
    assert [v["id"] for v in built["videos"]] == [v["id"] for v in base["videos"]], (
        "video order differs"
    )
    assert [p["id"] for p in built["playlists"]] == [
        p["id"] for p in base["playlists"]
    ], "playlist order differs"
    assert built == base, "DATA is not deep-equal to the baseline"
    print(
        "catalog deep-equal OK: 3977 videos, 71 playlists, 4320 memberships, same IDs and order"
    )

    js = ROOT / "build/.check.js"
    js.write_text(src["app.js"], encoding="utf-8")
    r = subprocess.run(["node", "--check", str(js)], capture_output=True, text=True)
    js.unlink()
    if r.returncode:
        sys.exit("JS syntax error:\n" + r.stderr)
    print("node --check app.js OK")
    print("wrote", OUT, OUT.stat().st_size, "bytes")


if __name__ == "__main__":
    main()
