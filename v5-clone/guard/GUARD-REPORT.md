# Network guard report

Run `python3 network_guard.py TARGET` from this directory. The target can be a single source file or a directory. The guard scans HTML, JavaScript, and CSS recursively. Exit 0 means zero violations, exit 1 means policy violations, and exit 2 means the target could not be scanned. Each violation names its rule and source line.

## Allowlist

Both URL forms require HTTPS, the exact host and path shown, and an ID of exactly 11 characters from `[A-Za-z0-9_-]`. Extra parameters, fragments, or trailing slashes fail.

| Rule | Allowed use |
| --- | --- |
| `YOUTUBE_LESSON_ANCHOR` | Plain `<a href>` lesson links to `https://www.youtube.com/watch?v=<ID>` or `https://www.youtube-nocookie.com/embed/<ID>`. The anchor must have a single `href` and no inline event handlers or `ping` attribute. |
| `YOUTUBE_PLAYBACK` | An exact nocookie embed URL in the marked JavaScript iframe assignment shown below. |

## Violation rules

| Rule | Trigger |
| --- | --- |
| `REMOTE_ASSET` | External `src`, `href`, or `srcset` on `img`, `script`, `link`, `iframe`, `video`, `audio`, `source`, or `embed`. |
| `REMOTE_RESOURCE_HINT` | External `href` on a link with `preconnect`, `prefetch`, `dns-prefetch`, `preload`, or `modulepreload`. |
| `REMOTE_REQUEST` | External URL literal passed to `fetch()`, `XMLHttpRequest()` or its usual `.open(method, url)` form, `WebSocket()`, `EventSource()`, or dynamic `import()`. A URL stored in a variable can be flagged at the literal's declaration. |
| `EXTERNAL_URL` | Other external URL literals, including those in catalog data, HTML text, and CSS. Absolute origins, including explicitly written loopback hosts, and protocol-relative destinations are flagged. Relative paths and root-relative paths are permitted. |
| `MALFORMED_YOUTUBE_URL` | A YouTube-like URL outside the exact HTTPS forms above, including the wrong host or an invalid or missing ID. |
| `YOUTUBE_OUTSIDE_ALLOWED_CONTEXT` | An exact YouTube URL used outside the two allowlist rules. |

This is a static source check. It does not resolve runtime-computed destinations, follow redirects, or observe browser requests.

## Fixture and test results

| Fixture | Exit | Result |
| --- | ---: | --- |
| [bad-remote-asset.html](fixtures/bad-remote-asset.html) | 1 | Two `REMOTE_ASSET` violations on lines 2 and 3. |
| [bad-malformed-link.html](fixtures/bad-malformed-link.html) | 1 | Four `MALFORMED_YOUTUBE_URL` violations on lines 2–5. |
| [good-clean.html](fixtures/good-clean.html) | 0 | Zero violations. Local assets and the lesson anchor passed. |

`python3 -m unittest test_network_guard.py` passed all six tests.

## v4 Preview scan

Target `/home/hatch/workspace/archive-rebuild/v4/build/Preview/`. The guard scanned three files and returned exit 1 with two violations. Both occurrences contain `https://us.mohid.co/ca/losangeles/wcis/masjid/online/donation/index/1`.

| File and line | Rule | Disposition |
| --- | --- | --- |
| `archive.html:965` | `EXTERNAL_URL` | **Allowlisted Nov 21 2026** (see below): the Sheikh's own masjid donation page, part of the original title of video 02ooBaSzV54. Catalog titles are preserved verbatim; the app never fetches or links it. Guard skips this exact URL as plain text only. |
| `catalog.js:3` | `EXTERNAL_URL` | Same as above. |

### Fetch verdicts

The line numbers apply to both `archive.html` and `archive-hosted.html`. The former uses its inline catalog and the latter loads `catalog.js`. In each catalog, the 4,384 subtitle `src` values and 3,977 media values are relative paths under `videos/`. The 4,382 subtitle `readSrc` values are relative paths under `transcripts-readable-v7/`.

| Line in both files | Source | Verdict |
| ---: | --- | --- |
| 2882 | `fetch(src)` in `getCaptions`, called with subtitle `s.src` | Same-origin caption read |
| 2896 | `fetch(src)` in `getText`, called with subtitle `s.readSrc` | Same-origin transcript read |
| 3250 | `fetch(v.media, { method: "HEAD", ... })` | Same-origin media probe |
| 3257 | `fetch("__status", ...)` | Same-origin local server status lookup for playback errors |
| 3641 | `fetch("__status", ...)` | Same-origin local server status lookup for recitation availability |

## Item 13 playback scope

v4 Preview has no YouTube player embed. The guard recognizes this exact marked statement form in JavaScript, with the lesson ID substituted:

```js
if (playbackMode === "youtube" && event.isTrusted && event.type === "click") youtubeFrame.src = "https://www.youtube-nocookie.com/embed/AbCdEf123_-"; // network-guard: youtube-playback
```

This exception is for the iframe assignment inside the user-initiated YouTube playback handler. A static iframe source, a preload, and an unguarded assignment all fail. Local mode requires zero external requests. Browser verification of that behavior belongs with the Item 13 player integration.

The real playback code (`app.js` `setPlayMode`) builds the embed URL from a runtime video ID, so the literal form above cannot appear in source. The guard also accepts the exact concatenation form the code uses, recognized by `PLAYBACK_CONCAT` in `network_guard.py`: `frameEl.src = "https://www.youtube-nocookie.com/embed/" + <id> + ytQuery; // network-guard: youtube-playback`, where `<id>` is a plain identifier holding the `ytIdOf()` result (11-char `[A-Za-z0-9_-]` token from the media filename) and `ytQuery` is the fixed query built just above it (`PLAYBACK_QUERY`: `?rel=0&autoplay=1&enablejsapi=1&cc_load_policy=1&cc_lang_pref=` + site language + `&origin=` + `encodeURIComponent(location.origin)` + optional `&start=` + floored seconds). The marker alone allows nothing: the host, the concatenation shape, the `ytQuery` variable, and the exact query construction must all match, and the statement without the marker still fails. Verified by `test_playback_concat_form_is_allowed_only_when_marked` (10 guard tests pass).
