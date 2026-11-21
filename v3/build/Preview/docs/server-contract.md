# Server contract

What any server must provide for the archive page to work, whether it is the bundled
`archive_server.py` on a laptop or a static host later. Every URL the page uses is relative
to the archive root, the folder that holds `Preview/`, `videos/` and the text folders.

## Pages

| URL                                          | Serves                                                                                                                                                                                                          |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`                                          | `Preview/archive.html` (single file, catalog inlined). The browser URL must stay `/` so relative paths resolve from the archive root.                                                                           |
| `/Preview/archive-hosted.html` served as `/` | Hosted flavor. Same page, loads the catalog from `Preview/catalog.js?v=<version>`. The version is in the `catalog-version` meta tag and the first line of `catalog.js`; cache `catalog.js` forever per version. |

## Files the page requests

| Path                            | Type                                          | Notes                                                                                                                                                                      |
| ------------------------------- | --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Preview/assets/fonts/*.woff2`  | `font/woff2`                                  | Bundled, SIL Open Font License 1.1.                                                                                                                                        |
| `Preview/assets/img/*.svg`      | `image/svg+xml`                               | Painted dusk scene and pattern tiles.                                                                                                                                      |
| `Preview/catalog.js`            | `text/javascript; charset=utf-8`              | Hosted flavor only.                                                                                                                                                        |
| each lesson's `media` path      | `video/x-matroska`, `video/mp4`, `video/webm` | Must answer `HEAD` and byte `Range` requests (`206`, `416` past the end). A missing file must return `404`; the page then shows a plain message with a Details disclosure. |
| each lesson's `thumbnail`       | image                                         | Optional. A missing thumbnail falls back to a drawn cover.                                                                                                                 |
| subtitle `src`                  | `text/vtt; charset=utf-8`                     | Fetched only when the lesson is opened.                                                                                                                                    |
| subtitle `readSrc`              | `text/plain; charset=utf-8`                   | The in-page text. Serve bytes unchanged.                                                                                                                                   |
| `Preview/assets/recitation.mp3` | `audio/mpeg`                                  | Optional. Not included in this edition.                                                                                                                                    |

## `GET /__status`

JSON, `Cache-Control` not required (the page requests it with `cache: no-store`):

```json
{ "videos_exists": true, "videos_count": 3977, "recitation": false }
```

- `videos_exists` / `videos_count`: lets the missing-file message say whether the whole library
  folder is missing or only one lesson.
- `recitation`: `true` only when `Preview/assets/recitation.mp3` exists. The page never offers
  playback otherwise.

A static host without this endpoint still works: the page treats a failed request as
"folder state unknown, no recitation", and the missing-file message simply omits the folder hint.

## What the page never does

- No request leaves the archive's own origin. No fonts, scripts, analytics or images from the web.
- No writes to the server. Favorites, progress and settings live in the browser's
  `localStorage` under versioned keys (`archive-favorites-v4`, `archive-progress-v4`, ...).
