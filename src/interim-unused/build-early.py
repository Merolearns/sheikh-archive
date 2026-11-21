"""Assemble EARLY visual build (not final). 01_head + early.css + early.html + verbatim DATA + early.js"""
import json, os
ROOT = os.path.dirname(os.path.abspath(__file__))
BASE = '/home/hatch/workspace/archive-baseline/working/Preview/archive.html'
s = open(BASE, encoding='utf-8').read()
i = s.find('const DATA ='); j = s.find('{', i)
data, end = json.JSONDecoder().raw_decode(s[j:])
data_literal = s[j:j+end]
head = open(os.path.join(ROOT, 'src/01_head.html'), encoding='utf-8').read()
css = open(os.path.join(ROOT, 'src/early/early.css'), encoding='utf-8').read()
html = open(os.path.join(ROOT, 'src/early/early.html'), encoding='utf-8').read()
js = open(os.path.join(ROOT, 'src/early/early.js'), encoding='utf-8').read()
out = (head + '\n' + css + '\n</style>\n</head>\n<body>\n' + html
       + '\n<script>const DATA = ' + data_literal + ';</script>\n<script>\n' + js + '\n</script>\n</body>\n</html>')
outp = os.path.join(ROOT, 'build/Preview/archive.html')
open(outp, 'w', encoding='utf-8').write(out)
# deep-equal verification
s2 = open(outp, encoding='utf-8').read()
i2 = s2.find('const DATA ='); j2 = s2.find('{', i2)
d2 = json.JSONDecoder().raw_decode(s2[j2:])[0]
assert len(d2['videos']) == 3977, len(d2['videos'])
assert len(d2['playlists']) == 71, len(d2['playlists'])
assert sum(len(p['items']) for p in d2['playlists']) == 4320
assert [v['id'] for v in d2['videos']] == [v['id'] for v in data['videos']], "video order mismatch"
assert [p['id'] for p in d2['playlists']] == [p['id'] for p in data['playlists']], "playlist order mismatch"
assert d2 == data, "DATA not deep-equal"
print("EARLY BUILD OK: deep-equal 3977 videos / 71 playlists / 4320 memberships; bytes:", len(out))
