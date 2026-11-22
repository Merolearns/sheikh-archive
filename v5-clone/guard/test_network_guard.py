import subprocess
import sys
import unittest
from pathlib import Path

from network_guard import YOUTUBE_EMBED, YOUTUBE_WATCH, scan_text


HERE = Path(__file__).resolve().parent


class NetworkGuardTests(unittest.TestCase):
    def run_fixture(self, name):
        return subprocess.run(
            [sys.executable, str(HERE / "network_guard.py"), str(HERE / "fixtures" / name)],
            capture_output=True,
            text=True,
        )

    def test_remote_assets_fail(self):
        result = self.run_fixture("bad-remote-asset.html")
        self.assertEqual(result.returncode, 1, result.stderr)
        self.assertIn("bad-remote-asset.html:2: REMOTE_ASSET", result.stdout)
        self.assertIn("bad-remote-asset.html:3: REMOTE_ASSET", result.stdout)
        self.assertIn("2 violation(s)", result.stdout)

    def test_malformed_youtube_links_fail(self):
        result = self.run_fixture("bad-malformed-link.html")
        self.assertEqual(result.returncode, 1, result.stderr)
        for line in range(2, 6):
            self.assertIn(f"bad-malformed-link.html:{line}: MALFORMED_YOUTUBE_URL", result.stdout)
        self.assertIn("4 violation(s)", result.stdout)

    def test_local_assets_and_lesson_link_pass(self):
        result = self.run_fixture("good-clean.html")
        self.assertEqual(result.returncode, 0, result.stderr + result.stdout)
        self.assertIn("1 file(s), 0 violation(s)", result.stdout)

    def test_allowlist_requires_exact_https_host_path_and_id(self):
        for pattern, prefix in (
            (YOUTUBE_WATCH, "https://www.youtube.com/watch?v="),
            (YOUTUBE_EMBED, "https://www.youtube-nocookie.com/embed/"),
        ):
            valid = prefix + "AbCdEf123_-"
            self.assertIsNotNone(pattern.fullmatch(valid))
            for invalid in (
                prefix, prefix + "short", valid + "0", valid + "&extra=1",
                valid + "#fragment", valid + "/",
                valid.replace("https:", "http:"),
                valid.replace("www.", ""), valid.replace(".com/", ".com.example/"),
            ):
                with self.subTest(url=invalid):
                    self.assertIsNone(pattern.fullmatch(invalid))

    def test_remote_requests_and_resource_hints_fail(self):
        for call in (
            'fetch("https://cdn.example.org/file")',
            'xhr.open("GET", "https://cdn.example.org/file")',
            'new WebSocket("wss://cdn.example.org/socket")',
            'new EventSource("//cdn.example.org/events")',
            'import("https://cdn.example.org/module.js")',
        ):
            with self.subTest(call=call):
                self.assertEqual(scan_text(call, ".js")[0][1], "REMOTE_REQUEST")
        for rel in ("preconnect", "prefetch", "dns-prefetch", "preload"):
            html = f'<link rel="{rel}" href="//cdn.example.org">'
            self.assertEqual(scan_text(html, ".html")[0][1], "REMOTE_RESOURCE_HINT")

    def test_donation_url_allowlisted_as_catalog_text_only(self):
        from network_guard import DONATION_URL

        text = f'{{"title": "تبرع بصدقة جارية {DONATION_URL}"}}'
        self.assertEqual(scan_text(text, ".js"), [])
        self.assertEqual(scan_text(f"<p>{DONATION_URL}</p>", ".html"), [])
        self.assertEqual(
            scan_text(f'<img src="{DONATION_URL}">', ".html")[0][1],
            "REMOTE_ASSET",
        )
        self.assertEqual(
            scan_text(f'fetch("{DONATION_URL}")', ".js")[0][1],
            "REMOTE_REQUEST",
        )

    def test_live_link_allowlisted_exact_url_only(self):
        from network_guard import YOUTUBE_LIVE_URL

        url = YOUTUBE_LIVE_URL
        self.assertEqual(url, "https://www.youtube.com/@dr.moustafakamel508/live")
        # The exact link, as an anchor and as JS text, passes.
        self.assertEqual(
            scan_text(f'<a href="{url}" target="_blank" rel="noopener">Live</a>', ".html"), []
        )
        self.assertEqual(scan_text(f'const LIVE = "{url}";', ".js"), [])
        # Any other youtube.com URL still fails, even as an anchor.
        for bad in (
            "https://www.youtube.com/@dr.moustafakamel508",
            "https://www.youtube.com/@dr.moustafakamel508/live?x=1",
            "https://www.youtube.com/@other/live",
            "https://www.youtube.com/@dr.moustafakamel508/live/",
        ):
            with self.subTest(url=bad):
                self.assertEqual(
                    scan_text(f'<a href="{bad}">Live</a>', ".html")[0][1],
                    "MALFORMED_YOUTUBE_URL",
                )
        # The exact URL as an asset or a request still fails (link only).
        # A fetch is reported as a malformed YouTube URL: check() re-labels
        # any youtube-like URL it rejects, whatever the original rule was.
        self.assertEqual(
            scan_text(f'<iframe src="{url}"></iframe>', ".html")[0][1],
            "MALFORMED_YOUTUBE_URL",
        )
        self.assertEqual(
            scan_text(f'fetch("{url}")', ".js")[0][1], "MALFORMED_YOUTUBE_URL"
        )

    def test_playback_concat_form_is_allowed_only_when_marked(self):
        statement = (
            'frameEl.src =\n'
            '  "https://www.youtube-nocookie.com/embed/" +\n'
            '  id +\n'
            '  "?rel=0&autoplay=1"; // network-guard: youtube-playback'
        )
        self.assertEqual(scan_text(statement, ".js"), [])
        self.assertTrue(scan_text(statement.replace(" // network-guard: youtube-playback", ""), ".js"))
        self.assertTrue(
            scan_text(statement.replace("youtube-nocookie", "youtube"), ".js")
        )
        self.assertTrue(
            scan_text(statement.replace('id +', '"https://evil.example/x" +'), ".js")
        )

    def test_youtube_exception_is_limited_to_anchors_and_marked_playback(self):
        url = "https://www.youtube-nocookie.com/embed/AbCdEf123_-"
        self.assertEqual(scan_text(f'<a href="{url}">Lesson</a>', ".html"), [])
        self.assertEqual(scan_text(f'<iframe src="{url}"></iframe>', ".html")[0][1],
                         "YOUTUBE_OUTSIDE_ALLOWED_CONTEXT")
        self.assertEqual(scan_text(f'const catalog = "{url}";', ".js")[0][1],
                         "YOUTUBE_OUTSIDE_ALLOWED_CONTEXT")
        statement = (
            'if (playbackMode === "youtube" && event.isTrusted && event.type === "click") '
            f'youtubeFrame.src = "{url}"; // network-guard: youtube-playback'
        )
        self.assertEqual(scan_text(statement, ".js"), [])
        self.assertTrue(scan_text(statement.replace('=== "youtube"', '=== "local"'), ".js"))
