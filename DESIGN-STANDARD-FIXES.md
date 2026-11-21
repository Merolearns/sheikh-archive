# DESIGN-STANDARD-FIXES.md — problems found in the design standard while building

(For Noor to apply to the living standard page. Do not edit the standard here.)

1. **"Default sort: series order" assumes playlists are in teaching order.** In this catalog most playlists are newest-first (for example al-Fiqh al-Amm starts at lesson ١٦; Fiqh al-Ibadat starts with "the last lecture"). Series order and teaching order are different things here. Proposed fix: the standard should say that teaching order must be confirmed per series by the owner. Until then, use playlist order plus an "earliest lesson" start.
2. **"One 20-minute first session"** has no confirmed lesson behind it. The best real candidate (lesson 1 of Asma al-Husna) is 13 minutes. Proposed fix: say "one short first session (about 15 to 25 minutes, confirmed by the owner)" and show the real length.
3. **"Each self-sort card names its first lesson":** picking a lesson automatically from catalog data gave poor results (a 2012 short clip, a women's-fiqh episode filed in Usul al-Fiqh). Cards now name the first suggested series. Proposed fix: first lessons per path must be chosen by the owner.
4. **Reem Kufi for "emblems and short labels":** the bundled subset (123 glyphs) renders a full phrase like the library name cramped. It works for two-letter monograms only. Proposed fix: limit Kufi to monograms; use Amiri Bold for the wordmark.
5. **Listen control placement** is not specified, and the opening allows only one button. Built as a site-wide footer control. The standard should name its home.
6. **Mixed-script inline citations:** "سورة طه، الآية ١١٤" followed directly by "Ta Ha 20:114" collides under the bidi algorithm. The standard should require a separator and an isolated Latin span.
7. **Year ranges in Arabic** must be written with a word ("٢٠١٢ إلى ٢٠٢٦"), not an LTR-isolated "2012 · 2026", which reads backwards to an Arabic reader.
