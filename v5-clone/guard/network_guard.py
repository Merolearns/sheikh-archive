"""Check static HTML, JavaScript and CSS for external URLs."""

import argparse
import re
import sys
from html import unescape
from html.parser import HTMLParser
from pathlib import Path


YOUTUBE_WATCH = re.compile(r"https://www\.youtube\.com/watch\?v=[A-Za-z0-9_-]{11}")
YOUTUBE_EMBED = re.compile(
    r"https://www\.youtube-nocookie\.com/embed/[A-Za-z0-9_-]{11}"
)
YOUTUBE_LIKE = re.compile(r"youtube|youtu\.be", re.IGNORECASE)
URL = re.compile(
    r"""(?<![\w/])(?:[a-z][a-z0-9+.-]*://|(?<!:)//)(?=[\w\[])"""
    r"""[^\s"'<>\x60(){}\\]+""",
    re.IGNORECASE,
)
ABSOLUTE = re.compile(r"^(?:(?:https?|wss?|ftp):|//)", re.IGNORECASE)
ESCAPE = re.compile(r"""\\(?:x([0-9a-fA-F]{2})|u([0-9a-fA-F]{4})|([/\\]))""")
ATTRIBUTE = re.compile(
    r"""\s+([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?"""
)
REQUEST = re.compile(
    r"""\b(?:fetch|import|WebSocket|EventSource|XMLHttpRequest)\s*\(\s*["'`]?$"""
    r"""|\.open\s*\(\s*["'][A-Z]+["']\s*,\s*["'`]?$""",
    re.IGNORECASE,
)
PLAYBACK = re.compile(
    r"""[ \t]*if \(playbackMode === "youtube" && event\.isTrusted && event\.type === "click"\) """
    r"""youtubeFrame\.src = "(?P<url>[^"]+)"; // network-guard: youtube-playback[ \t]*"""
)
# The real playback assignment builds the embed URL from a runtime video ID
# (see app.js setPlayMode): the ID comes from ytIdOf(), which accepts only
# an 11-char [A-Za-z0-9_-] token from the media filename, and the query
# string is the fixed ytQuery built just above it (enablejsapi for the
# IFrame API, captions on in the site language, origin, optional start).
# The statement carries the // network-guard: youtube-playback marker. The
# marker alone allows nothing: the host, the concatenation shape, the
# ytQuery variable, and the exact query construction must all match. Any
# other embed URL form still fails.
PLAYBACK_CONCAT = re.compile(
    r"""frameEl\.src\s*=\s*"https://www\.youtube-nocookie\.com/embed/"\s*\+\s*[A-Za-z_$][\w$]*\s*\+\s*ytQuery;\s*// network-guard: youtube-playback"""
)
PLAYBACK_QUERY = re.compile(
    r"""const ytQuery\s*=\s*"\?rel=0&autoplay=1&enablejsapi=1&cc_load_policy=1&cc_lang_pref="\s*\+\s*\(st\.lang === "ar" \? "ar" : "en"\)\s*\+\s*"&origin="\s*\+\s*encodeURIComponent\(location\.origin\)\s*\+\s*\(startAt > 5 \? "&start=" \+ Math\.floor\(startAt\) : ""\);"""
)
# Hosted-flavor thumbnails (owner order, Nov 21 2026): a still is derived from
# the video ID, exactly this expression. Only runs when the page carries the
# hosted meta tag; the installed app keeps its local thumbnails.
YTIMG_CONCAT = re.compile(
    r'"https://i\.ytimg\.com/vi/"\s*\+\s*encodeURIComponent\([A-Za-z_$][\w$]*\)\s*\+\s*"/hqdefault\.jpg"'
)

# Allowlisted inert catalog text (decided by the team, recorded in
# ../DECISIONS.md, Nov 21 2026): the Sheikh's own masjid donation page,
# part of the ORIGINAL YouTube title of video 02ooBaSzV54
# ("تبرع بصدقة جارية https://us.mohid.co/..."). Catalog titles are
# preserved verbatim, so the URL stays in the DATA literal; the app never
# fetches it, never links it, and never renders it as an anchor. Only the
# plain-text EXTERNAL_URL finding is skipped; the same URL as an asset,
# a request, or a resource hint still fails.
DONATION_URL = "https://us.mohid.co/ca/losangeles/wcis/masjid/online/donation/index/1"
# Live Phase 1 (Nov 21 2026): the exact "Watch live on YouTube" link
# (channel handle /live page). Only the plain-text EXTERNAL_URL finding is
# skipped, exactly like DONATION_URL: the same URL as an asset, a request,
# or a resource hint still fails.
YOUTUBE_LIVE_URL = "https://www.youtube.com/@dr.moustafakamel508/live"
# YouTube IFrame API loader (Nov 26 2026): app.js assigns this URL to a
# dynamically created <script> element so the hosted player can report its
# position. Only the plain-text EXTERNAL_URL finding is skipped, exactly
# like DONATION_URL: the same URL as an asset, a request, or a resource
# hint still fails.
YOUTUBE_IFRAME_API = "https://www.youtube.com/iframe_api"
ASSET_TAGS = {"img", "script", "link", "iframe", "video", "audio", "source", "embed"}
RESOURCE_HINTS = {"preconnect", "prefetch", "dns-prefetch", "preload", "modulepreload"}
SUFFIXES = {".html", ".htm", ".js", ".mjs", ".cjs", ".css"}


def decode_escapes(value):
    def replace(match):
        escaped = match[1] or match[2]
        if escaped:
            char = chr(int(escaped, 16))
            return char if char not in "\r\n" else match[0]
        return match[3]

    return ESCAPE.sub(replace, value)


class Scanner(HTMLParser):
    def __init__(self, allowed_prefixes=()):
        super().__init__(convert_charrefs=False)
        self.allowed_prefixes = tuple(allowed_prefixes)
        self.violations = []
        self.script = False
        self.text = []
        self.text_line = 1

    def check(self, url, line, rule, allowed=False):
        if rule == "EXTERNAL_URL" and url == DONATION_URL:
            return
        if rule == "EXTERNAL_URL" and url == YOUTUBE_LIVE_URL:
            return
        if rule == "EXTERNAL_URL" and url == YOUTUBE_IFRAME_API:
            return
        # Configured book-file origin (e.g. the GitHub raw base): book URLs
        # pointing there are intentional, not leaks. Only the plain-text
        # EXTERNAL_URL finding is skipped; the same URL as an asset, a
        # request, or a resource hint still fails.
        if rule == "EXTERNAL_URL" and any(
            url.startswith(prefix) for prefix in self.allowed_prefixes
        ):
            return
        if YOUTUBE_WATCH.fullmatch(url) or YOUTUBE_EMBED.fullmatch(url):
            if allowed:
                return
            rule = "YOUTUBE_OUTSIDE_ALLOWED_CONTEXT"
        elif YOUTUBE_LIKE.search(url):
            rule = "MALFORMED_YOUTUBE_URL"
        self.violations.append((line, rule, url))

    def scan_chunk(self, value, line, rule="EXTERNAL_URL", javascript=False):
        value = decode_escapes(value)
        allowed_spans = (
            [
                (m.start(), m.end())
                for r in (PLAYBACK_CONCAT, PLAYBACK_QUERY, YTIMG_CONCAT)
                for m in r.finditer(value)
            ]
            if javascript
            else []
        )
        for match in URL.finditer(value):
            start = match.start()
            url = match[0]
            offset = value.count("\n", 0, start)
            if javascript:
                if any(s <= start < e for s, e in allowed_spans):
                    continue
                line_start = value.rfind("\n", 0, start) + 1
                line_end = value.find("\n", start)
                statement = value[
                    line_start : line_end if line_end != -1 else len(value)
                ]
                playback = PLAYBACK.fullmatch(statement)
                if (
                    playback
                    and playback.start("url") == start - line_start
                    and YOUTUBE_EMBED.fullmatch(url)
                ):
                    continue
                if REQUEST.search(value[:start]):
                    self.check(url, line + offset, "REMOTE_REQUEST")
                    continue
            self.check(url, line + offset, rule)

    def flush_text(self):
        if self.text:
            value = "".join(self.text)
            if not self.script:
                value = unescape(value)
            self.scan_chunk(value, self.text_line, javascript=self.script)
            self.text.clear()

    def handle_data(self, data):
        if not self.text:
            self.text_line = self.getpos()[0]
        self.text.append(data)

    def handle_entityref(self, name):
        self.handle_data(f"&{name};")

    def handle_charref(self, name):
        self.handle_data(f"&#{name};")

    def handle_comment(self, data):
        self.flush_text()
        self.scan_chunk(unescape(data), self.getpos()[0])

    def handle_decl(self, decl):
        self.flush_text()
        self.scan_chunk(decl, self.getpos()[0])

    def handle_starttag(self, tag, attrs):
        self.flush_text()
        raw = self.get_starttag_text()
        line = self.getpos()[0]
        rel = (dict(attrs).get("rel") or "").lower().split()
        attr_start = re.match(r"<[^\s/>]+", raw).end()
        attr_matches = list(ATTRIBUTE.finditer(raw, attr_start))
        names = [match[1].lower() for match in attr_matches]
        for match in attr_matches:
            name = match[1].lower()
            group = next((i for i in (2, 3, 4) if match[i] is not None), None)
            if group is None:
                continue
            value = unescape(match[group])
            value_line = line + raw.count("\n", 0, match.start(group))
            if tag == "link" and name == "href" and RESOURCE_HINTS.intersection(rel):
                rule = "REMOTE_RESOURCE_HINT"
            elif tag in ASSET_TAGS and name in {"src", "href", "srcset"}:
                rule = "REMOTE_ASSET"
            else:
                rule = "EXTERNAL_URL"

            stripped = value.strip()
            if name in {"src", "href"} and ABSOLUTE.match(stripped):
                allowed = (
                    tag == "a"
                    and name == "href"
                    and names.count("href") == 1
                    and "ping" not in names
                    and not any(attr.startswith("on") for attr in names)
                )
                self.check(
                    stripped,
                    value_line + value[: len(value) - len(value.lstrip())].count("\n"),
                    rule,
                    allowed,
                )
            else:
                self.scan_chunk(
                    value, value_line, rule, javascript=name.startswith("on")
                )
        self.script = tag == "script" and dict(attrs).get("type") in {
            None,
            "",
            "module",
            "text/javascript",
            "application/javascript",
        }

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        self.script = False

    def handle_endtag(self, tag):
        self.flush_text()
        self.script = False


def scan_text(source, suffix, allowed_prefixes=()):
    scanner = Scanner(allowed_prefixes)
    if suffix in {".html", ".htm"}:
        scanner.feed(source)
        scanner.close()
        scanner.flush_text()
    else:
        scanner.scan_chunk(source, 1, javascript=suffix in {".js", ".mjs", ".cjs"})
    return sorted(scanner.violations, key=lambda violation: violation[0])


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("target", type=Path, help="source file or directory")
    parser.add_argument(
        "--allow-prefix",
        action="append",
        default=[],
        help="URL prefix exempt from EXTERNAL_URL findings (repeatable)",
    )
    args = parser.parse_args()
    target = args.target
    try:
        if target.is_dir():
            files = sorted(
                path
                for path in target.rglob("*")
                if path.suffix.lower() in SUFFIXES and path.is_file()
            )
        elif target.is_file() and target.suffix.lower() in SUFFIXES:
            files = [target]
        else:
            files = []
        if not files:
            parser.error(f"{target}: NO_SOURCE_FILES")
        count = 0
        for path in files:
            for line, rule, url in scan_text(
                path.read_text(encoding="utf-8-sig"),
                path.suffix.lower(),
                args.allow_prefix,
            ):
                print(f"{path}:{line}: {rule}: {url}")
                count += 1
    except (OSError, UnicodeError) as error:
        print(f"SCAN_ERROR: {error}", file=sys.stderr)
        return 2
    print(f"Scanned {len(files)} file(s), {count} violation(s)")
    return int(count > 0)


if __name__ == "__main__":
    sys.exit(main())
