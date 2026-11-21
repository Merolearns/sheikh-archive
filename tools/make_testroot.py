"""Create testroot/: a stand-in archive folder with sample media named exactly like catalog entries.

Thumbnails are calm generated frames (no text). Three lessons get real playable files, one gets a
corrupt file (to test the decode-failure message); every other lesson has no file (404 path).
"""

import json
import pathlib
import shutil
import subprocess
import sys
from urllib.parse import unquote

from PIL import Image, ImageDraw

ROOT = pathlib.Path(__file__).resolve().parent.parent
TR = ROOT / "testroot"
html = (ROOT / "build/Preview/archive.html").read_text(encoding="utf-8")
i = html.find("const DATA =")
data, _ = json.JSONDecoder().raw_decode(html[html.find("{", i) :])

if TR.exists():
    shutil.rmtree(TR / "Preview", ignore_errors=True)
shutil.copytree(ROOT / "build/Preview", TR / "Preview")
for f in ("Start Archive - Windows.bat", "Start_Archive_-_macOS.command"):
    shutil.copy2(ROOT / "build" / f, TR / f)

PAL = [
    ((20, 60, 46), (201, 162, 39)),
    ((15, 31, 56), (227, 197, 102)),
    ((90, 50, 40), (240, 200, 120)),
    ((60, 40, 80), (232, 201, 106)),
]


def thumb(rel, seed):
    p = TR / unquote(rel)
    if p.exists():
        return
    p.parent.mkdir(parents=True, exist_ok=True)
    bg, fg = PAL[seed % len(PAL)]
    im = Image.new("RGB", (320, 180), bg)
    d = ImageDraw.Draw(im)
    for k in range(180):
        shade = tuple(int(c * (0.7 + 0.3 * k / 180)) for c in bg)
        d.line([(0, k), (320, k)], fill=shade)
    cx, cy, r = 160 + (seed % 7 - 3) * 18, 90, 34
    d.rectangle(
        [cx - r * 0.7, cy - r * 0.7, cx + r * 0.7, cy + r * 0.7], outline=fg, width=2
    )
    d.polygon(
        [(cx, cy - r), (cx + r, cy), (cx, cy + r), (cx - r, cy)], outline=fg, width=2
    )
    im.save(p, quality=60)


for n, v in enumerate(data["videos"]):
    if v["thumbnail"]:
        thumb(v["thumbnail"], n)
for n, p in enumerate(data["playlists"]):
    if p["cover"]:
        thumb(p["cover"], n)

with_subs = next(
    v
    for v in data["videos"]
    if [s and s["lang"] for s in v["subtitles"]] == ["ar", "en"]
)
playable = [with_subs, data["videos"][0], data["videos"][1]]
for n, v in enumerate(playable):
    out = TR / unquote(v["media"])
    out.parent.mkdir(parents=True, exist_ok=True)
    if not out.exists():
        subprocess.run(
            [
                "ffmpeg",
                "-loglevel",
                "error",
                "-y",
                "-f",
                "lavfi",
                "-i",
                f"testsrc2=size=640x360:rate=25:duration=12",
                "-f",
                "lavfi",
                "-i",
                f"sine=frequency={330 + n * 110}:duration=12",
                "-c:v",
                "libx264",
                "-pix_fmt",
                "yuv420p",
                "-c:a",
                "aac",
                "-shortest",
                str(out),
            ],
            check=True,
        )
for s in with_subs["subtitles"]:
    vtt = TR / unquote(s["src"])
    txt = TR / unquote(s["readSrc"])
    txt.parent.mkdir(parents=True, exist_ok=True)
    line = (
        "بسم الله الرحمن الرحيم، هذا نص تجريبي للاختبار."
        if s["lang"] == "ar"
        else "Sample caption text used for testing only."
    )
    vtt.write_text(
        "WEBVTT\n\n00:00:00.500 --> 00:00:05.000\n"
        + line
        + "\n\n00:00:05.500 --> 00:00:11.000\n"
        + line
        + " (2)\n",
        encoding="utf-8",
    )
    txt.write_text((line + "\n") * 6, encoding="utf-8")
corrupt = next(v for v in data["videos"][2:] if v not in playable)
(TR / unquote(corrupt["media"])).write_bytes(b"\x00not a real video file\x00" * 512)

json.dump(
    {
        "with_subs": with_subs["id"],
        "playable": [v["id"] for v in playable],
        "corrupt": corrupt["id"],
        "missing": data["videos"][5]["id"],
    },
    open(TR / "test-ids.json", "w"),
)
print(json.load(open(TR / "test-ids.json")))
sys.exit(0)
