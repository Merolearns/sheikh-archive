# Prototype integration

Apply the integration in the prototype track. The anchors below refer to the
v4 source.

1. Replace the body of [`mountList` at app.js:1022](../../v4/src/app.js#L1022)
   with a wrapper that keeps its `box, list, card` signature and `_stop` lifecycle.
   This also covers [`renderPlaylist` at line 1842](../../v4/src/app.js#L1842) and
   [`renderSaved` at line 2479](../../v4/src/app.js#L2479). The wrapper can take an
   optional fourth argument for the initial cap.

   ```js
   function mountList(box, list, card, cap = 1500) {
     if (box._stop) box._stop();
     const dispose = globalThis.renderChunked({
       container: box,
       items: list,
       renderCard: card,
       cap,
     });
     box._stop = () => {
       dispose();
       box._stop = null;
     };
   }
   ```

2. Keep the [`renderLibrary` video call at line 1732](../../v4/src/app.js#L1732)
   pointed at the wrapper with `(v) => lessonCard(v)`. Its empty branch already
   invokes `grid._stop()` before showing the clear and browse actions. Resolve
   the grid by `#libGrid` when creating the video scaffolding so an existing
   pillar `.grid` cannot be mistaken for the video list.
3. In the same function, replace the [direct series card rendering at line
   1704](../../v4/src/app.js#L1704) with empty grid placeholders. Keep the
   filtered group arrays in the same order as their placeholders. After the
   existing `flip(res, ...)` markup swap, mount each attached grid with its
   group array and `(p) => seriesCard(p)`. Keep that wrapper around
   `seriesCard` because its second argument is the featured flag. Share a
   first-paint budget of 100 across all pillar grids. Start each mount with
   the remaining budget as its cap, then subtract that grid's initial
   `children.length`. A group reached after the budget is spent starts with its
   own Show more button. Leave the existing no-series actions in place.
4. Wire the English button label and live count messages into the prototype's
   existing translation and number-formatting flow. The Show more label can
   reuse `t("more_cards")`. Keep the native button and its controlled-list ID
   when applying locale styling.

## Build placement

In [`build.py`'s `shell()` at line 72](../build.py#L72), read
`render/chunked-render.js` as UTF-8 relative to the build script. Insert it as
a classic inline script after `data_script` and the `CURATION` closing script
tag, immediately before the script containing `app`.

```python
renderer = (Path(__file__).resolve().parent / "render" / "chunked-render.js").read_text(
    encoding="utf-8"
)
```

Replace the transition at [build.py:94](../build.py#L94) with the following
concatenation, leaving the preceding curation literal in place.

```python
+ ";</script>\n<script>\n"
+ renderer
+ "\n</script>\n<script>\n"
+ app
```

Both `archive.html` and `archive-hosted.html` use this shell. Inlining the
renderer keeps the standalone archive usable from disk as a single file. The
hosted archive still loads `Preview/catalog.js` before curation, renderer, and
application scripts.
