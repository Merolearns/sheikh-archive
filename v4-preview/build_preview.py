import base64, re, sys

SRC = 'Preview/archive.html'
OUT = 'sheikh-library-v4-preview.html'
ASSETS = 'Preview/assets'

def b64(path, mime):
    with open(path, 'rb') as f:
        return f'data:{mime};base64,' + base64.b64encode(f.read()).decode()

html = open(SRC, encoding='utf-8').read()
n = 0

# 1. Fonts
for fname in ['amiri-400.woff2','amiri-700.woff2','amiri-quran-400.woff2',
              'noto-sans-arabic-400.woff2','noto-sans-arabic-500.woff2',
              'noto-sans-arabic-700.woff2','reem-kufi-400.woff2']:
    old = f"url('Preview/assets/fonts/{fname}')"
    assert old in html, f'missing font ref {fname}'
    html = html.replace(old, f"url({b64(f'{ASSETS}/fonts/{fname}', 'font/woff2')})")
    n += 1

# 2. SVGs in CSS url() and in src=
for fname in ['girih.svg','ornament.svg','sunset.svg']:
    uri = b64(f'{ASSETS}/img/{fname}', 'image/svg+xml')
    old1 = f"url('Preview/assets/img/{fname}')"
    old2 = f'src="Preview/assets/img/{fname}"'
    c = html.count(old1) + html.count(old2)
    assert c > 0, f'missing svg ref {fname}'
    html = html.replace(old1, f'url({uri})').replace(old2, f'src="{uri}"')
    n += c

# 3. Recitation: embed mp3, bypass server status check
mp3 = b64(f'{ASSETS}/recitation.mp3', 'audio/mpeg')
old_src = 'const SRC = "Preview/assets/recitation.mp3";'
assert old_src in html
html = html.replace(old_src, f'const SRC = "{mp3}";')
n += 1

old_fetch = '''    // the server reports whether a licensed file is present, so a missing file never shows as an error
    fetch("__status", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        status = j;
        avail = !!(j && j.recitation);
        statusKey = avail ? "rec_ready" : "rec_none";
        ui();
        paintDetails();
      })
      .catch(() => {})
      .finally(() => {
        known = true;
        if (wanted && avail) play(true);
        wanted = false;
        ui();
        paintBanner();
      });'''
assert old_fetch in html, 'status fetch block not found'
new_fetch = '''    // PREVIEW BUILD: recitation is embedded in this file, so no server check
    avail = true;
    known = true;
    statusKey = "rec_ready";
    ui();
    paintDetails();
    if (wanted) play(true);
    wanted = false;
    paintBanner();'''
html = html.replace(old_fetch, new_fetch)
n += 1

# 4. No external asset refs may remain
left = re.findall(r'Preview/assets[^"\')\s]*', html)
assert not left, f'remaining asset refs: {left[:5]}'

open(OUT, 'w', encoding='utf-8').write(html)
print(f'OK {n} replacements, {len(html)} bytes -> {OUT}')
