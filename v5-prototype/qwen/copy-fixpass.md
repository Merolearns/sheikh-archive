# V5 prototype — copy fix-pass review (Qwen track, Nov 20–21 2026)

READ-ONLY review. Nothing in `src/`, `books-*.js`, or `books*.html` was edited.
Proposals only — the fix-pass agent applies them.

## Scope and sources

- Reviewed: `src/app.js` locale tables `S.ar` / `S.en` (~250 key pairs, lines 116–730),
  plural tables `PLURALS` / `WORDS` (lines 787–810), `hours()` / `dur()` / `nf()` numeral
  handling, hardcoded Arabic in `src/app.js` (lines 2675, 2835, 2844) and `src/body.html`
  (brand, splash name), `books-app.js` `STR` table (26 key pairs, lines 13–46),
  `books-data.js` blurbs (9 non-null, books 01/02/03/04/26/27/28/29/32),
  `books.html` / `books-preview.html` titles, `render/chunked-render.js` status strings.
- Ground truth for the bio: `../v5/sheikh-bio-source.txt` (the Sheikh's own words, dictated
  by the owner Nov 20, 2026). Nothing beyond that text may be asserted about his life.
- Prior audit: `qwen/copy-audit.md` (14 new `lg_*` / `pb_*` strings; `sh_role` already
  reworded and verified native — no change proposed to `sh_role`).
- Verse / citation on the splash (`body.html:133–134`, Ta Ha 20:114) is Quranic text:
  out of scope for copy review, not touched, not quoted as copy.
- Counts: ~295 distinct user-visible strings/pairs reviewed; **26 flagged**
  (1 bio + 18 app.js + 4 Books UI/blurb + 1 `of` + 2 em-dash titles); **3 new keys proposed**
  for the chunked renderer (§3). `more_cards` was reviewed and is KEPT unchanged.

## Severity key

- **MUST** — factual-fidelity defect (bio only). Must change before the bio ships.
- **SHOULD** — reads as translated English; a native reader notices. Change in the fix pass.
- **POLISH** — small native-speaker smoothing; change with the rest, low risk either way.

---

## 1. BIO SOFT SPOTS — `sh_bio` (`src/app.js:367–368` AR, `:656–657` EN)

### Verdict: MUST CHANGE. Two factual defects + three fidelity softenings.

The bio as rendered is mostly faithful, but it asserts two things the source does not
support, and drops / softens three things the source does say.

| # | Defect | What the source actually says |
|---|--------|-------------------------------|
| B1 | **Present-continuous teaching claim (the flagged soft spot).** Current AR ends: «…ويعمل منذ ذلك الحين إماماً…، مواصلاً تدريس اللغة العربية والعلوم الشرعية وإلقاء الخطب والدروس.» The circumstantial «مواصلاً…» asserts he is *still, now* teaching Arabic + Sharia sciences and *still* giving sermons/lessons as an ongoing activity attached to the Al-Ansar imamate. The source states teaching only in the past tense and only in the Egypt sequence: «قبل التخرج كنت أخطب وادرس بالمساجد» (before graduation I preached and taught in mosques) and, after the Awqaf administrative transfer, «عملت بتدريس اللغة العربية والعلوم الشرعية» (I worked teaching Arabic and the Islamic sciences — undated, no place given). Nothing in the source says he continues teaching today, or that teaching is part of his current role. The imamate itself *is* current («الي يومنا هذا امام المركز الاسلامي»), the teaching is not stated as current. | Teaching = past-tense, pre-2003, Egypt. Current role = Imam of the Islamic Center only. |
| B2 | **PhD year 2015 is invented.** Current AR/EN: «نال درجة الدكتوراه عام ٢٠١٥م» / «a PhD in 2015». The source gives NO year for the doctorate. The only «2015» in the source file is the verbatim line «العمل2015», which the source file itself instructs: «transcribed verbatim as dictated; do not guess its meaning on the page». The 2015 in the bio is an inference from that unexplained line. It must come out. (Note: the book-01 blurb's «٢٠١٤–٢٠١٥» is a *different* claim — the Graduate Theological Foundation period, presumably from the dissertation title page — and is not evidence for a 2015 PhD award year.) | No PhD year stated anywhere in the verified source. |
| B3 | **Master's scope dropped.** Current: «الماجستير في الفقه المقارن عام ٢٠١٣م». Source: «ماجستير في الفقه المقارن في الزواج برؤية مقاصدية 2013» — the degree was in comparative fiqh **on marriage, from a maqasid perspective**. The subject is part of the verified fact and should be restored. | Master's = comparative fiqh, on marriage, maqasid perspective, 2013. |
| B4 | **«هاجر إلى الولايات المتحدة» overstates the source.** Source: «جئت أمريكا ٢٠٠٣» (I came to America in 2003). «هاجر» adds a hijra/emigration connotation the Sheikh did not use. Use «جاء». | «جاء إلى الولايات المتحدة الأمريكية عام ٢٠٠٣م». |
| B5 | **EN-only insertions / paraphrase.** EN «a comprehensive ijaza in hadith» — the source says only «اجازة في علم الحديث رواية ودراية»; «comprehensive» is added. EN «a dissertation comparing spousal separation laws…» paraphrases the dissertation title; the source gives the exact title «الفرقة بين الزوجين في الشريعة الاسلامية وقانون الاسرة الامريكي في كاليفورنيا», which should be quoted, not paraphrased. AR has the same paraphrase («بأطروحة مقارنة بين أحكام التفريق…»). | Quote the title verbatim (AR); EN gives the title in translation, without a year. |

### Proposed replacement — full `sh_bio` (AR)

> الشيخ الدكتور مصطفى سليمان كامل، حاصل على إجازة في حفظ القرآن الكريم وتجويده برواية حفص عن عاصم، ورواية قالون عن نافع، وإجازة في الحديث رواية ودراية. تخرج في كلية الشريعة والقانون بقسم القانون من جامعة الأزهر الشريف عام ١٩٩٢م، وقد أتم حفظ كتاب الله وهو في الحادية عشرة من عمره. حصل على درجة الماجستير في الفقه المقارن في الزواج برؤية مقاصدية عام ٢٠١٣م، ثم نال درجة الدكتوراه في الفقه المقارن بأطروحة عنوانها «الفرقة بين الزوجين في الشريعة الإسلامية وقانون الأسرة الأمريكي في ولاية كاليفورنيا». خطب ودرّس في المساجد قبل تخرجه، وعمل محاميًا في مصر من عام ١٩٩٢م إلى عام ١٩٩٤م، ثم إمامًا وخطيبًا بوزارة الأوقاف المصرية من عام ١٩٩٤م إلى عام ١٩٩٩م، ثم أُحيل إلى عمل إداري هناك، وعمل بتدريس اللغة العربية والعلوم الشرعية. جاء إلى الولايات المتحدة الأمريكية عام ٢٠٠٣م، وعمل بمسجد الأنصار في كاليفورنيا، وهو إلى يومنا هذا إمام المركز الإسلامي.

### Proposed replacement — full `sh_bio` (EN)

> Sheikh Dr. Moustafa Suleiman Kamel holds ijazas in Quran memorization and tajweed according to the riwaya of Hafs an Asim and Qalun an Nafi, as well as an ijaza in hadith narration and understanding. He graduated from Al-Azhar University in 1992 with a degree in Sharia and Law, having completed his memorization of the Quran at the age of eleven. In 2013, he earned a Master's degree in comparative fiqh on marriage from a maqasid perspective, followed by a PhD in comparative fiqh with a dissertation entitled "Dissolution of Marriage between Spouses in Islamic Sharia and American Family Law in California". Before his graduation he preached and taught in mosques. He worked as a lawyer in Egypt from 1992 to 1994, then served as an Imam and Khatib for the Egyptian Ministry of Awqaf from 1994 to 1999, before being moved to administrative work there, and he taught Arabic language and the Islamic sciences. He came to the United States in 2003 and worked at Masjid Al-Ansar in California, where he remains to this day the Imam of the Islamic Center.

Notes on the proposal: sentence order follows the source's own order (ijazat → graduation →
memorization → Master's → PhD → pre-graduation preaching/teaching → lawyer → Awqaf →
admin transfer → teaching → America 2003 → Imam to this day). «أُحيل إلى عمل إداري»
renders the source's «احالوني الي عمل اداري» (they transferred me) faithfully. Tanwin
is normalized to the pre-alif convention throughout («محاميًا»، «إمامًا»، «خطيبًا») —
orthographic consistency only, not a meaning change. No new biographical fact is added;
the PhD year is removed, not replaced.

### Bio strings verified native / faithful (no change)

- `sh_role` (app.js:363 / :651–652): «دروسه وخطبه وسلاسله العلمية في مكتبة واحدة.» —
  already the audit's native rewording; keep.
- `sh_bio_t` «سيرته» / «His life and work», `sh_series_t`, `sh_k_years` — native, keep.
- Hardcoded About heading (`app.js:2675` «فضيلة الشيخ الدكتور مصطفى كامل») and splash
  name (`body.html:136`) — native, keep. (Whether «الدكتور» is kept is a title question,
  not a copy question: the doctorate itself is sourced, so the title is supported.)

---

## 2. TRANSLATED-SOUNDING STRINGS

### 2a. `src/app.js` — locale tables

| # | Location | Current AR | Current EN | Issue | Proposed AR | Proposed EN |
|---|----------|------------|------------|-------|-------------|-------------|
| A1 | `src/app.js:374–375` AR / `:663–664` EN — `lg_noconfig` | هذه الميزة غير متاحة حالياً. يرجى استخدام خيار الضيف أو التحقق لاحقاً. | This feature is currently unavailable. Please use the guest option or check back later. | **SHOULD.** «هذه الميزة غير متاحة» + «خيار الضيف» is a word-for-word rendering of the English error string ("this feature… the guest option"). A native notice names the thing that is not set up and tells the reader what to do. | تسجيل الدخول بالبريد الإلكتروني غير مفعّل بعد. يمكنك الدخول كضيف، أو المحاولة لاحقًا. | Email sign-in is not set up yet. You can continue as a guest, or try again later. |
| A2 | `src/app.js:204` AR / `:478` EN — `match_lessons` | عدد الدروس المطابقة لبحثك: {n}. | Lessons matching your search: {n}. | **SHOULD.** «عدد الدروس المطابقة لبحثك» piles a noun («عدد») onto a relative clause; it reads like a translated report line. Drop «عدد». | الدروس المطابقة لبحثك: {n} | (no change) Lessons matching your search: {n}. |
| A3 | `src/app.js:219` AR / `:493` EN — `scope_lib` | يبحث هذا الحقل في المكتبة كلها. | This field searches the whole library. | **SHOULD.** «هذا الحقل يبحث» personifies the input box — a calque of "this field searches". Native UI says what the *search* covers. | البحث هنا يشمل المكتبة كلها. | (no change) This field searches the whole library. |
| A4 | `src/app.js:221` AR / `:495` EN — `scope_pl` | يبحث هذا الحقل في هذه السلسلة. | This field searches this series. | **SHOULD.** Same «الحقل يبحث» calque as A3. | البحث هنا في هذه السلسلة فقط. | (no change) This field searches this series. |
| A5 | `src/app.js:215` AR / `:489` EN — `mark_done` | علّمه كمُشاهَد | Mark as watched | **SHOULD.** «علّمه كمُشاهَد» is a literal "mark it as watched" with a stilted tanwin adjective; no native speaker writes this on a button. | ضع عليه علامة المشاهدة | (no change) Mark as watched |
| A6 | `src/app.js:213` AR / `:487` EN — `nofolder_p` | يمكنك تصفح الفهرس وقراءة النصوص. لمشاهدة الدروس ضع مجلد «videos» بجانب المجلد الرئيسي للمكتبة. | You can browse the catalogue and read the texts. To watch, place the "videos" folder next to the library's main folder. | **POLISH.** «المجلد الرئيسي للمكتبة» ("the library's main folder") is translator's filler; the folder *is* the library folder. Same fix in EN. | يمكنك تصفح الفهرس وقراءة النصوص. لمشاهدة الدروس ضع مجلد «videos» بجانب مجلد المكتبة. | You can browse the catalogue and read the texts. To watch, place the "videos" folder next to the library folder. |
| A7 | `src/app.js:244` AR / `:518–519` EN — `err_where` | يجب أن يكون داخل مجلد «videos» في مجلد مكتبتك: | It should be inside the "videos" folder in your library folder: | **POLISH.** «يجب أن يكون» ("it must/should be") is the English "It should be…" mapped onto a file path. State the place directly. | موضعه مجلد «videos» داخل مجلد مكتبتك: | Its place is the "videos" folder inside your library folder: |
| A8 | `src/app.js:245` AR / `:520–521` EN — `err_nofolder` | لم يُعثر على مجلد «videos» بجانب المجلد الرئيسي للمكتبة. | The "videos" folder was not found next to the library's main folder. | **POLISH.** «لم يُعثر على» is formal passive-voice translationese for "was not found", and «المجلد الرئيسي» repeats A6. Plain negative statement is native. | لا يوجد مجلد «videos» بجانب مجلد المكتبة. | There is no "videos" folder next to the library folder. |
| A9 | `src/app.js:265–266` AR / `:545–546` EN — `d_deeper` | أصول الفقه ومصطلح الحديث وشرح كتب الحديث، ومعها العربية أداةً للعلم. | Legal theory, hadith terminology and hadith commentary, with Arabic as the tool of study. | **POLISH.** «ومعها العربية أداةً للعلم» ("with it, Arabic as a tool of knowledge") is a dangling translated clause. | أصول الفقه ومصطلح الحديث وشرح كتب الحديث، والعربية أداة هذه العلوم. | Legal theory, hadith terminology and hadith commentary, with Arabic as the tool for these sciences. |
| A10 | `src/app.js:277` AR / `:557` EN — `st_first_p` | درس واحد قصير تبدأ به اليوم، اختير لموضوعه ومدته. | One short lesson to begin with today, chosen for its topic and length. | **POLISH.** «اختير لموضوعه ومدته» is passive-voice translationese ("chosen for its topic and length"). Active «اخترناه» is the native register used elsewhere in this file. | درس واحد قصير تبدأ به اليوم، اخترناه لقصره وموضوعه. | (no change) One short lesson to begin with today, chosen for its topic and length. |
| A11 | `src/app.js:300` AR / `:584` EN — `step_total` | مجموع الخطوة: {n} · {h} | Step total: {n} · {h} | **POLISH.** «مجموع الخطوة» ("step total") is a spreadsheet label, not a sentence a reader meets at the foot of a step. `{n}` here is `count("lesson", …)` and `{h}` is `hours(…)` (app.js:2517). | في هذه الخطوة: {n} · {h} | In this step: {n} · {h} |
| A12 | `src/app.js:333–334` AR / `:619–620` EN — `ab_src_p` | …الترجمات والنصوص تظهر للدروس التي تتوفر لها. | …Captions and texts appear only for lessons that have them. | **POLISH.** «تظهر للدروس التي تتوفر لها» ("appear for the lessons that are available for them") is garbled relative-clause translationese. | …وتوجد الترجمات والنصوص للدروس المتوفرة لها فقط. | (no change) …Captions and texts appear only for lessons that have them. |
| A13 | `src/app.js:339–340` AR / `:625–626` EN — `ab_credit_p` | …تلاوة الآية ١١٤ من سورة طه بصوت القارئ عاقب عزيز (Aaqib Azeez)، عن ويكيميديا كومنز، وقد أهداها صاحبها إلى الملك العام بترخيص CC0 1.0. | …Qur'an recitation by Aaqib Azeez, via Wikimedia Commons, dedicated to the public domain under CC0 1.0. | **POLISH.** «عن ويكيميديا كومنز» ("from Wikimedia Commons" with «عن») is the wrong preposition — the recitation comes *from* the Commons, «من». Rest of the sentence is native. | …تلاوة الآية ١١٤ من سورة طه بصوت القارئ عاقب عزيز (Aaqib Azeez)، من ويكيميديا كومنز، وقد أهداها صاحبها إلى الملك العام بترخيص CC0 1.0. | (no change) |
| A14 | `src/app.js:346` AR / `:632` EN — `det_unknown` | لا يمكن التحقق منه حين تُفتح المكتبة بهذه الطريقة | Cannot be checked when the library is opened this way | **POLISH.** «حين تُفتح المكتبة بهذه الطريقة» ("when the library is opened this way") is a literal rendering of the English subordinate clause. | لا يمكن التحقق منه بهذه الطريقة | Cannot be checked in this view |
| A15 | `src/app.js:359` AR / `:645` EN — `mi_how_2` | الترجمات والنصوص موجودة للدروس التي تتوفر لها. | Captions and texts are there for the lessons that have them. | **POLISH.** Same «التي تتوفر لها» awkwardness as A12. | الترجمات والنصوص موجودة حيث توفّرت. | Captions and texts are there where they exist. |
| A16 | `src/app.js:165` AR / `:439` EN — `r_occ_e` | خارج الطريق المتدرج | Outside the graded path | **POLISH.** «الطريق المتدرج» is a calque of "graded path"; no native reader says «طريق متدرج» for a curriculum. «مسار منهجي» is the idiomatic term. | خارج المسار المنهجي | Outside the structured path |
| A17 | `src/app.js:136` AR / `:409` EN — `rec_unmute` | إلغاء الكتم | Unmute | **POLISH.** «إلغاء الكتم» ("cancel the muting") is formal calque for a one-tap control. «إعادة الصوت» is what the button does. | إعادة الصوت | (no change) Unmute |
| A18 | `src/app.js:141` AR / `:414` EN — `rec_blocked` | لم يبدأ التشغيل. اضغط تشغيل مرة أخرى. | Playback did not start. Press play again. | **POLISH.** «اضغط تشغيل» ("press play") is clipped; the verb needs its object. | لم يبدأ التشغيل. اضغط زر التشغيل مرة أخرى. | (no change) Playback did not start. Press play again. |

### 2b. Books UI — `books-app.js`, `books-data.js`, `books.html`, `books-preview.html`

| # | Location | Current AR | Current EN | Issue | Proposed AR | Proposed EN |
|---|----------|------------|------------|-------|-------------|-------------|
| B-K1 | `books.html:6` — `<title>` | الكتب — مكتبة الشيخ مصطفى كامل | — (same title element) | **SHOULD — EM DASH.** An em dash in UI copy; DECISIONS.md states there must be none. (Also `books-app.js:1` and `books-data.js:1` header comments contain an em dash — comments, not UI copy; fix opportunistically, not required.) | الكتب \| مكتبة الشيخ مصطفى كامل | — |
| B-K2 | `books-preview.html:6` — `<title>` | الكتب (معاينة) — مكتبة الشيخ مصطفى كامل | — | **SHOULD — EM DASH.** Same as B-K1. | الكتب (معاينة) \| مكتبة الشيخ مصطفى كامل | — |
| B-K3 | `books-app.js:25` — `wordBody` | هذا الكتاب ملف Word، يفتح في برنامج معالجة الكلمات على جهازك. | This book is a Word document. It opens in your word processor. | **POLISH.** «يفتح في برنامج معالجة الكلمات» ("it opens in a word-processing program") is a literal "It opens in your word processor". Tell the reader to open it. | هذا الكتاب ملف Word، افتحه ببرنامج Word أو أي برنامج لمعالجة الكلمات على جهازك. | (no change) This book is a Word document. It opens in your word processor. |
| B-K4 | `books-app.js:19` — `of` | من | of | **POLISH.** Filtered count renders as «٥ من ٣٨ كتابًا» (`books-app.js:119–121`). Bare «من» is understandable but clipped; «من أصل» is the idiomatic "of / out of" for a filtered total. Applies to the filtered-count line only. | من أصل | (no change) of |
| B-K5 | `books-data.js:53–56` — book-01 blurb (PhD book) | كتاب الدكتوراه للشيخ: رسالة دكتوراه في الفقه المقارن، مؤسسة الدراسات اللاهوتية للخريجين ٢٠١٤-٢٠١٥، بإشراف د. صلاح الصاوي | The Sheikh's PhD book: a dissertation in comparative fiqh, Graduate Theological Foundation 2014-2015, supervised by Dr. Salah al-Sawi | **SHOULD.** (a) «مؤسسة الدراسات اللاهوتية للخريجين» is a word-for-word calque of "Graduate Theological Foundation" — the institution has no Arabic name; native practice keeps the proper name in English. (b) «رسالة دكتوراه في الفقه المقارن، مؤسسة…» strings nouns without a verb. (c) Hyphen-minus between Eastern-Arabic years («٢٠١٤-٢٠١٥») is typographically inconsistent with the `num()` Eastern-numeral grouping used everywhere else in the Books UI. (d) EN «PhD book» is awkward. — **Fix location:** `books-data.js` is generated («Do not hand-edit: regenerate with books-audit/build-books-data.py», line 1–2). Apply this fix at the inventory source, then regenerate; do not hand-edit the generated file. | كتاب الدكتوراه للشيخ: رسالة في الفقه المقارن قدّمها إلى مؤسسة Graduate Theological Foundation في عامَي ٢٠١٤ و٢٠١٥، بإشراف د. صلاح الصاوي | The Sheikh's doctoral dissertation in comparative fiqh, submitted to the Graduate Theological Foundation in the 2014–2015 academic year, supervised by Dr. Salah al-Sawi |
| B-K6 | `books-data.js:74–77` — book-02 blurb (Fatiha illuminations) | خواطر العشاء | Dinner reflections | **POLISH.** «خواطر العشاء» reads as "dinner's thoughts"; the file's own phrase is reflections *after* dinner. (Same fix at the inventory source as B-K5.) | خواطر بعد العشاء | After-dinner reflections |
| B-K7 | `books-data.js:515–518` — book-26 blurb (MAS LA conference) | دروس المؤتمر: العزم والتوكل، قيادة تلهم، الهجرة | Conference lessons: resolve and reliance, inspiring leadership, the Hijra | **POLISH.** «قيادة تلهم» ("leadership [that] inspires" — no object) is a fragment calque of "inspiring leadership". The adjective «ملهمة» is the native form. (Same fix at the inventory source as B-K5.) | دروس المؤتمر: العزم والتوكل، القيادة الملهمة، الهجرة | (no change) Conference lessons: resolve and reliance, inspiring leadership, the Hijra |

### 2c. Verified native — spot-checked, no change (for the record)

- `src/app.js` — `skip` «تخطَّ إلى المحتوى», `brand_sub`, `hero_promise`, `r_days_p`,
  `r_pillars_p`, `r_occ_p`, `toast_saved` / `toast_removed`, `lib_prog` «قيد المشاهدة»,
  `nothing` «لا توجد نتائج مطابقة. جرّب كلمة أقصر.», `clear` «امسح البحث»,
  `st_lede`, `st_stuck_p`, `ab_not_p`, `ab_why_p`, `ab_order_p`, `mi_how_4`,
  `sv_empty`, all `pb_*` playback strings, all `lg_*` except A1, all pillar `p_*` / `d_*`
  except A9, all `q_*` / `pre_*`.
- `books-app.js` — `subtitle` «كتب فضيلة الشيخ الدكتور مصطفى كامل», `searchPh`,
  `back` «عودة إلى الكتب», `alsoIn` «متوفر أيضًا باللغة», `readerNote`,
  `previewBanner`, `authorBy` «تأليف», `noResults`.
- `books-data.js` blurbs verified native and numerically correct: book-03/04
  «٤٠٥ / ٣٠٣ مسائل شرعية في ١٥ بابًا» (405/303 → units digit 5/3 → plural «مسائل» ✓;
  15 → «بابًا» ✓), book-27 «دروس الشيخ على كتاب الفضيلة للمنفلوطي»,
  book-28 «نحو أسرة مسلمة سعيدة», book-29 «الكتاب الكامل», book-32 «نص خطبة الجمعة».
- `body.html:40,43` brand strings, `body.html:136` splash name — native, keep.

### 2d. Em-dash audit (whole sweep)

- `src/app.js`: **0** em dashes, **0** en dashes. ✓
- `src/body.html`: **0** em dashes. ✓
- `render/chunked-render.js`: **0** em dashes. ✓
- `books-app.js` / `books-data.js`: 1 em dash each, both in line-1 header **comments only**,
  not UI copy — note, don't ship a fix for comments alone.
- **FAIL — UI copy: `books.html:6` and `books-preview.html:6` `<title>` elements**
  (B-K1, B-K2 above). These are the only em dashes in user-visible copy.

---

## 3. NEW STRINGS FROM THE FIX PASS — chunked renderer

### 3a. `more_cards` — EXISTS, reviewed, KEEP

- `src/app.js:211` AR «اعرض المزيد» / `:485` EN «Show more» — native and standard.
  No change. The app's own `mountList` (`src/app.js:1114`) already wires it correctly
  with `t("more_cards")`.

### 3b. The chunked renderer has NO locale wiring today

`render/chunked-render.js` hardcodes English-only UI (lines 36, 38, 40, 51):

- `:36` `shown + " shown, " + remaining + " remaining."`
- `:38` `"No matches. " + counts`
- `:40` `"All matches shown. " + counts`
- `:51` button `textContent = "Show more"`

It is used today only by its own test page (`render/test-chunked-render.html`), not by
`src/app.js` (`mountList` is the live path). When the fix-pass agent wires it into locale
handling, it must **reuse `more_cards` for the button** and add three new keys below —
same style as the existing strings (short, plain, no em dash, `{var}` placeholders,
counts passed through `nf()` so AR renders Eastern Arabic numerals, never raw Western
digits — see §4).

| Key (proposed) | Proposed AR | Proposed EN | Notes |
|---|---|---|---|
| `more_status` | عُرض {shown} من أصل {total}، وتبقّى {remaining}. | {shown} of {total} shown, {remaining} remaining. | Partial state. Replaces the current bare «100 shown, 3877 remaining.» — the «من أصل {total}» gives the reader the denominator the current string withholds. |
| `more_status_all` | عُرضت كل النتائج: {shown} من {total}. | All matches shown: {shown} of {total}. | Final state. Replaces «All matches shown. 3977 shown, 0 remaining.» — the current form repeats the count and appends a redundant «0 remaining». |
| `more_status_none` | لا توجد نتائج مطابقة. | No matches. | Empty state. Replaces «No matches. 0 shown, 0 remaining.» — the zero counts add nothing once the sentence says there are no matches. |

Implementation notes for the fix-pass agent (not copy, but the copy depends on them):

1. Pass counts as `{shown: nf(shown), remaining: nf(remaining), total: nf(total)}` through
   `t()` — do not interpolate raw numbers, or AR will show Western digits (see §4).
2. The button must reuse `t("more_cards")` (already exists) and carry the same `lang`/`dir`
   attributes `mountList` applies via `L()`.
3. `render/test-chunked-render.html:54,62–66,70,77` asserts the OLD English strings
   («100 shown, 3877 remaining», «All matches shown», «0 shown, 0 remaining»).
   Those assertions must be updated to the new keys when the strings change, or the
   test will fail on correct copy. The test file is test-only; its strings are not UI copy.

---

## 4. PLURAL / NUMERAL CONSISTENCY

### Verified correct

- `src/app.js` `PLURALS` / `WORDS` (lines 787–810) follow CLDR Arabic categories
  (one / two / few 3–10 / many 11–99 / other 100+): «درس واحد / درسان / {n} دروس /
  {n} درسًا / {n} درس» etc. Spot-checked against `Intl.PluralRules("ar")`:
  0 → `zero` → falls back to `other` (singular «درس») — correct for «٠ درس».
  1057 → `many` → «١٬٠٥٧ صفحة» ✓. 3977 → `many` ✓.
- `nf()` (`ar-EG`) and `dur()` (Eastern-digit conversion) are used for every count
  display in `app.js`; `date()` uses `ar-EG`. Eastern numerals are consistent in AR UI.
- `books-app.js` `arCount()` (lines 62–69) implements the same CLDR rule for books/pages:
  1 → bare «كتاب واحد» / «صفحة واحدة», 2 → «كتابان» / «صفحتان», 3–10 → numeral + plural,
  11+ → numeral + singular. Live values check out: 38 → «٣٨ كتابًا», 50 pages → «٥٠ صفحة»,
  1057 pages → «١٬٠٥٧ صفحة», 5 pages → «٥ صفحات».
- `books-app.js` `num()` uses `ar-EG` grouping («١٬٠٥٧») — consistent with `app.js` `nf()`.

### Inconsistencies flagged

| # | Location | Issue | Fix (copy-level) |
|---|---|---|---|
| P1 | `books-app.js:62–69` `arCount`, zero case | `arCount(0, …)` returns «٠ كتابًا» / «٠ صفحة». Native zero is not a counted singular — «لا كتب» / «لا توجد كتب». Unreachable for the total (38 books) but reachable for a filtered count of 0 if the empty state ever renders a count. | Guard in the count line (`books-app.js:119–121`): when the filtered list is empty, render `t("noResults")` only (already the behaviour for the grid) and no «٠ من…» count. No new string needed. |
| P2 | `books-app.js:119–121` filtered count | Renders a bare numeral with no unit for the filtered number: «٥ من ٣٨ كتابًا» — the «٥» has no counted noun. | Same fix as B-K4: «٥ من أصل ٣٨ كتابًا» («من أصل» carries the part-of reading). |
| P3 | `books-data.js:54` book-01 blurb | Hardcoded «٢٠١٤-٢٠١٥» (hyphen-minus between Eastern years) vs the `num()` Eastern grouping («١٬٠٥٧») used for every other number in the Books UI. | Covered by B-K5 («في عامَي ٢٠١٤ و٢٠١٥» — no dash at all). |
| P4 | `src/app.js:2643` + `word()` (lines 805–810) — latent, not live | `statsRow` pairs `nf(n)` with `word(k, n)`. For n = 2 this renders numeral + dual («٢ درسان» / «٢ ساعتان»), which is ungrammatical — the dual stands alone without a numeral («درسان»). Live values (total lessons / hours) are in the hundreds, so this never renders today; flagging so a future small-library reuse does not ship it. | When wiring counts, use `count()` (which returns the bare dual with no numeral for n = 2) instead of `nf(n) + word(…)` for small n; or special-case n = 2. No string change proposed. |
| P5 | `books-app.js:180` `part` fallback — latent, not live | `t("part")[p.part - 1] || (t("part") + " " + num(p.part))` — the fallback coerces the whole `part` array to a comma-joined string. Max part in data is 4, so unreachable today. | Not a copy issue; noted for the fix-pass agent (use a singular «الجزء» + numeral fallback). No string change proposed. |

### Numeral note for the chunked-renderer wiring (§3)

The current chunked status strings interpolate raw Western digits (`shown + " shown, …"`).
When the §3 keys are wired, counts MUST go through `nf()` / `ar-EG` formatting in AR —
a live-count line showing «100 shown, 3877 remaining» in the Arabic UI would be the
only Western-numeral count in the app.

---

## Handoff notes for the fix-pass agent

1. **Bio first.** `sh_bio` is the only MUST. Apply the §1 full replacements verbatim
   (AR + EN). Do not re-add a PhD year from any other source without the owner verifying it;
   the «العمل2015» line is explicitly do-not-guess.
2. **Blurb fixes go through the generator.** `books-data.js` header: «Do not hand-edit:
   regenerate with books-audit/build-books-data.py». Apply B-K5/B-K6/B-K7 to the inventory
   source and regenerate; verify the regenerated file byte-matches except the three blurbs.
3. **Em dashes:** only the two `<title>` elements (B-K1/B-K2). `src/app.js` and
   `src/body.html` are already clean; do not introduce an em dash in any proposed string
   (none of the proposals above contains one).
4. **Chunked renderer:** reuse `more_cards`; add the three `more_status*` keys; update
   `render/test-chunked-render.html` assertions to match; pass counts via `nf()`.
5. **Out of scope for this review (not copy):** the `part`-fallback array coercion (P5),
   the `word()`+`nf()` dual edge (P4), Books missing-file detection, and the
   `books.html` detail-view English-subtitle alignment noted in DECISIONS.md.
