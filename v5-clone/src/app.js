(function () {
  "use strict";

  /* ---------- Catalog (DATA comes from catalog.js, verbatim) and the library's curation ---------- */
  const VIDEOS = DATA.videos,
    PLAYLISTS = DATA.playlists;
  const byId = new Map(VIDEOS.map((v) => [v.id, v]));
  const plById = new Map(PLAYLISTS.map((p) => [p.id, p]));
  // Admin overrides (src/admin-overrides.json, injected by build.py):
  // series and video title changes apply here, in memory only, so the
  // catalog literal stays byte-identical to v4 and the build guard holds.
  try {
    if (typeof ADMIN_OVERRIDES !== "undefined" && ADMIN_OVERRIDES) {
      const so = ADMIN_OVERRIDES.series || {},
        vo = ADMIN_OVERRIDES.videos || {};
      for (const p of PLAYLISTS) {
        const o = so[p.id];
        if (!o) continue;
        if (o.title) p.title = o.title;
        if (o.titleEn) p.titleEn = o.titleEn;
      }
      for (const v of VIDEOS) {
        const o = vo[v.id];
        if (o && o.title) v.title = o.title;
      }
    }
  } catch (_) {}
  const IMAD_PL = "PLXKSrZvHoN9dOyWCCK6Qm8AS4blW3Ylwm"; // "Aqeeda by Dr Imad Bayoun"
  // Hosted flavor (archive-hosted.html) carries <meta name="archive-flavor"
  // content="hosted">; the installed app has no such tag. The hosted site
  // has no local files, so YouTube is its automatic default on click
  // (item 13); the installed app plays local first (item 3).
  const HOSTED = !!document.querySelector(
    'meta[name="archive-flavor"][content="hosted"]',
  );
  // Hosted thumbnails: the catalog's thumbnail/cover paths name files from
  // the offline archive (videos/<title> [<video id>].webp) that are not part
  // of this site, so every lesson and playlist card fell back to the empty
  // placeholder. On the hosted build, derive each still from its YouTube
  // video id instead, the same source the player already embeds, so
  // videos and playlists show their real thumbnails. A still that fails to
  // load still falls back to the placeholder via imgTag's onerror.
  if (HOSTED) {
    const ytThumb = (id) =>
      id
        ? "https://i.ytimg.com/vi/" + encodeURIComponent(id) + "/hqdefault.jpg"
        : "";
    VIDEOS.forEach((v) => {
      v.thumbnail = ytThumb(v.id) || v.thumbnail;
    });
    PLAYLISTS.forEach((p) => {
      const firstId = p.items && p.items[0] && p.items[0].id;
      p.cover = ytThumb(firstId) || p.cover;
    });
  }
  const GUEST_PL = "PLXKSrZvHoN9diex2S7vlTJOLQSTLqhnrJ"; // "English Lectures": lectures by other speakers
  const FEATURED = [
    "PLXKSrZvHoN9fz8szdMcBHFh9YGlhQKx7j",
    "PLXKSrZvHoN9cf7lGMyZjw0cndaCk004f0",
    "PLXKSrZvHoN9emB4zgG2yhM0Z3LHPvAn1h",
    "PLXKSrZvHoN9dcyYB5Lj6Hqs3EmxTeVQco",
    "PLXKSrZvHoN9fEH_7KlObTnFl6bosi6hhK",
    "PLXKSrZvHoN9cw5DTXW18ezysEVTW9AFHX",
    "PLXKSrZvHoN9cmAY-O5kHl5JBsujbnpfIU",
    "PLXKSrZvHoN9fms9EcNTJLYIuQZOAtbrDp",
  ];
  // Classical order of learning; "occasions" sits outside the graded path.
  const PILLARS = [
    "quran",
    "beliefs",
    "worship",
    "seerah",
    "character",
    "deeper",
  ];
  const GLYPH = {
    quran: "ق",
    beliefs: "ت",
    worship: "ف",
    seerah: "س",
    character: "خ",
    deeper: "ع",
    occasions: "م",
  };
  const PHASE = {
    Quran: "quran",
    Beliefs: "beliefs",
    Worship: "worship",
    Seerah: "seerah",
    Character: "character",
    "Deeper sciences": "deeper",
  };
  const pillarOf = (id) => (CURATION.pillars[id] || ["occasions", ""])[0];
  const levelOf = (id) => (CURATION.pillars[id] || ["", ""])[1];
  // The six-step path: the library's suggested series per step (content-mapping report, section d).
  const PATH = [
    {
      k: "quran",
      pl: [
        "PLXKSrZvHoN9cmAY-O5kHl5JBsujbnpfIU",
        "PLXKSrZvHoN9fz8szdMcBHFh9YGlhQKx7j",
      ],
    },
    {
      k: "beliefs",
      pl: [
        "PLXKSrZvHoN9dcyYB5Lj6Hqs3EmxTeVQco",
        "PLXKSrZvHoN9e4KqDBpbjQWPNbyfbJJcTJ",
      ],
    },
    {
      k: "worship",
      pl: [
        "PLXKSrZvHoN9fEH_7KlObTnFl6bosi6hhK",
        "PLXKSrZvHoN9dUDuKuf8-f5XgcW_kWYg0F",
      ],
    },
    {
      k: "seerah",
      pl: [
        "PLXKSrZvHoN9emB4zgG2yhM0Z3LHPvAn1h",
        "PLXKSrZvHoN9fms9EcNTJLYIuQZOAtbrDp",
      ],
    },
    {
      k: "character",
      pl: [
        "PLXKSrZvHoN9f0cRApDehj1CezvbQG0CFm",
        "PLXKSrZvHoN9cw5DTXW18ezysEVTW9AFHX",
      ],
    },
    {
      k: "deeper",
      pl: [
        "PLXKSrZvHoN9cRVxTmvl6E_P0i3jwPdatw",
        "PLXKSrZvHoN9ca3_xdOlEaeF3Y7yXs_q-L",
        "PLXKSrZvHoN9cf7lGMyZjw0cndaCk004f0",
      ],
      arabic: "PLXKSrZvHoN9eWkj3NnkCXXZC9ZSJ3njZ2", // grammar (i'rab) is taught inside this memorisation programme
    },
  ];
  const THEMES = [
    "emerald",
    "parchment",
    "midnight",
    "sand",
    "sunset",
    "puredark",
  ];

  /* ---------- Strings (Arabic first; never an em dash; never unfinished language) ---------- */
  const S = {
    ar: {
      skip: "تخطَّ إلى المحتوى",
      brand_sub: "مكتبة دروس تعمل بلا إنترنت",
      nav_home: "الرئيسية",
      nav_library: "المكتبة",
      nav_start: "من أين أبدأ؟",
      nav_saved: "المحفوظات",
      nav_about: "عن المكتبة",
      theme: "الألوان",
      th_emerald: "زمرّدي",
      th_parchment: "رقّ",
      th_midnight: "ليلي",
      th_sand: "رملي",
      th_sunset: "غروب",
      th_puredark: "أسود خالص",
      calm: "حركة هادئة",
      rec_play: "تشغيل التلاوة",
      rec_pause: "إيقاف مؤقت",
      rec_replay: "إعادة من البداية",
      rec_mute: "كتم الصوت",
      rec_unmute: "إلغاء الكتم",
      rec_vol: "مستوى الصوت",
      rec_none: "لا توجد تلاوة مرفقة في هذه النسخة.",
      rec_ready: "تلاوة الآية جاهزة.",
      rec_playing: "تُتلى الآن: سورة طه، الآية ١١٤",
      rec_blocked: "لم يبدأ التشغيل. اضغط تشغيل مرة أخرى.",
      foot_note: "كل شيء هنا يعمل من هذا الجهاز، بلا إنترنت وبلا تتبع.",
      hero_title: "مكتبة فضيلة الشيخ الدكتور مصطفى كامل",
      hero_promise:
        "دروس موثوقة، مرتبة في سلاسل، محفوظة على جهازك وتعمل بلا إنترنت.",
      search_ph: "ابحث في الدروس والسلاسل...",
      search_go: "بحث",
      browse: "تصفح المكتبة",
      go_start: "من أين أبدأ؟",
      live_watch: "شاهد البث المباشر على يوتيوب",
      r_continue_e: "دروسك",
      r_continue: "تابع من حيث توقفت",
      r_begin_e: "البداية",
      r_begin: "درسك الأول",
      r_days_e: "خطة بإيقاع ثابت",
      r_days: "الأساس في أربعين يومًا",
      r_days_p:
        "من عشرين إلى ثلاثين دقيقة كل يوم، بالترتيب الذي سار عليه أهل العلم.",
      see_days: "الأيام الأربعون",
      r_pillars_e: "ستة أبواب",
      r_pillars: "أبواب العلم",
      r_pillars_p:
        "القرآن أولًا، ثم العقيدة، فالعبادة، فالسيرة، فالأخلاق، ثم العلوم المتقدمة.",
      r_featured_e: "مختارات المكتبة",
      r_featured: "سلاسل مختارة",
      r_occ_e: "خارج الطريق المتدرج",
      r_occ_p:
        "خطب الجمعة والدروس العامة والمناسبات، لمن أراد أن يستمع في أي وقت.",
      see_all: "عرض الكل",
      prev: "السابق",
      next: "التالي",
      sheikh_short: "الشيخ مصطفى كامل",
      sheikh_full: "فضيلة الشيخ الدكتور مصطفى كامل",
      imad: "الدكتور عماد بيون",
      guests: "محاضرون ضيوف",
      open_series: "افتح السلسلة",
      play: "شاهد",
      resume: "أكمل",
      save: "احفظ",
      unsave: "أزِل من المحفوظات",
      toast_saved: "حُفظ الدرس في محفوظاتك",
      toast_removed: "أُزيل الدرس من محفوظاتك",
      langs: "اللغات والنصوص",
      published: "نُشر {d}",
      no_series: "خارج السلاسل",
      cat_videos: "الدروس المسجلة",
      cat_streams: "بث مباشر",
      cat_shorts: "مقاطع قصيرة",
      lib_title: "المكتبة",
      lib_series: "كل السلاسل",
      lib_all: "كل الدروس",
      lib_loose: "دروس خارج السلاسل",
      lib_prog: "قيد المشاهدة",
      lib_saved: "المحفوظات",
      all: "الكل",
      sort: "الترتيب",
      s_order: "ترتيب السلسلة",
      s_catalog: "ترتيب المكتبة",
      s_az: "أبجديًا",
      s_most: "الأكثر دروسًا",
      s_new: "الأحدث",
      s_old: "الأقدم",
      s_long: "الأطول",
      s_short: "الأقصر",
      match_lessons: "عدد الدروس المطابقة لبحثك: {n}.",
      show_lessons: "اعرضها",
      search_h: "نتائج البحث",
      nothing: "لا توجد نتائج مطابقة. جرّب كلمة أقصر.",
      none_series: "لا توجد سلاسل مطابقة.",
      show_lessons_btn: "اعرض الدروس المطابقة",
      clear: "امسح البحث",
      more_cards: "اعرض المزيد",
      chunk_none: "لا نتائج مطابقة.",
      chunk_all: "تم عرض كل النتائج.",
      chunk_counts: "{shown} معروضة، و{remaining} متبقية.",
      nofolder_t: "مقاطع الفيديو ليست على هذا الجهاز الآن",
      nofolder_p: "يمكنك تصفح الفهرس وقراءة النصوص. لمشاهدة الدروس ضع مجلد «videos» بجانب المجلد الرئيسي للمكتبة.",
      hide: "إخفاء",
      mark_done: "علّمه كمُشاهَد",
      marked_done: "شاهدتَه",
      days_end: "أنهيت الأيام الأربعين. ابدأ من جديد أو اختر أي سلسلة.",
      days_again: "ابدأ من جديد",
      scope_lib: "يبحث هذا الحقل في المكتبة كلها.",
      scope_to_pl: "ابحث في هذه السلسلة فقط",
      scope_pl: "يبحث هذا الحقل في هذه السلسلة.",
      scope_to_lib: "ابحث في المكتبة كلها",
      pl_start: "ابدأ من أقدم درس",
      pl_resume: "أكمل من حيث توقفت",
      pl_hours: "المدة الإجمالية {h}",
      back_lib: "المكتبة",
      back_series: "عُد إلى السلسلة",
      ls_series: "دروس السلسلة",
      ls_all_series: "افتح صفحة السلسلة",
      ls_prev: "الدرس السابق",
      ls_next: "الدرس التالي",
      ls_resume_at: "أكمل من {t}",
      cap_ar: "ترجمة عربية",
      cap_en: "ترجمة إنجليزية",
      tx_title: "نص الدرس",
      tx_hint: "اضغط على أي سطر لتنتقل إلى تلك اللحظة من الدرس.",
      tx_loading: "جارٍ تحميل النص...",
      tx_fail: "تعذّر فتح نص هذا الدرس.",
      cap_fail:
        "الترجمة غير متاحة لهذا الدرس. ما زال بإمكانك قراءة النص كاملًا.",
      open_file: "افتحه في برنامج آخر",
      err_404: "فيديو هذا الدرس غير موجود على هذا الجهاز.",
      err_details: "التفاصيل",
      err_where: "يجب أن يكون داخل مجلد «videos» في مجلد مكتبتك:",
      err_nofolder: "لم يُعثر على مجلد «videos» بجانب المجلد الرئيسي للمكتبة.",
      err_format: "لم يعمل هذا الفيديو هنا. جرّب برنامج VLC.",
      dlg_captions: "شاهد مع الترجمة",
      dlg_read: "اقرأ مع الدرس",
      lang_ar: "العربية",
      lang_en: "الإنجليزية",
      close: "إغلاق",
      p_quran: "القرآن: تلاوة وفهم",
      p_beliefs: "العقيدة",
      p_worship: "العبادة",
      p_seerah: "السيرة والصحابة",
      p_character: "الأخلاق وتزكية القلب",
      p_deeper: "العلوم المتقدمة",
      p_occasions: "خطب ومناسبات",
      d_quran: "التلاوة الصحيحة أولًا، ثم معاني الآيات وتفسيرها.",
      d_beliefs:
        "ما يؤمن به المسلم، بكلمات بسيطة: الإيمان بالله وأسمائه وصفاته وأركان الإيمان.",
      d_worship: "الطهارة والصلاة والصيام والزكاة والحج، كلٌّ في وقته.",
      d_seerah: "حياة النبي ﷺ وصحابته رضي الله عنهم، وما نتعلمه منها.",
      d_character: "الصدق والرحمة وحسن الخلق، وتطهير القلب من الحسد والكبر.",
      d_deeper:
        "أصول الفقه ومصطلح الحديث وشرح كتب الحديث، ومعها العربية أداةً للعلم.",
      d_occasions: "خطب الجمعة والدروس العامة والمناسبات.",
      lv_beginner: "مبتدئ",
      lv_intermediate: "متوسط",
      lv_advanced: "متقدم",
      st_kicker: "من أين أبدأ؟",
      st_title: "طريق واضح لمن يبدأ",
      st_lede:
        "لا تحتاج أن تختار من آلاف الدروس. ابدأ بجلسة واحدة، ثم اتبع الخطوات بالترتيب.",
      st_first_tag: "جلستك الأولى",
      st_first_t: "ابدأ هنا بدرس واحد",
      st_first_p: "درس واحد قصير تبدأ به اليوم، اختير لموضوعه ومدته.",
      st_watch: "شاهد الآن",
      st_q_t: "أي هذه أقرب إليك؟",
      st_q_p: "اختر سؤالًا واحدًا، وابدأ من الخطوة التي يشير إليها.",
      q_a_t: "جديد على الإسلام، أو عائد إليه؟",
      q_a_p: "ابدأ بالقرآن: كيف تقرؤه، ثم ماذا تعني آياته.",
      q_b_t: "تصلي، وتريد أن تفهم أكثر؟",
      q_b_p: "تعرّف على حياة النبي ﷺ، فهي القدوة في كل ما تعلمته.",
      q_c_t: "تقرأ العربية، وتريد التعمق؟",
      q_c_p: "العلوم المتقدمة وأدواتها، بعد أن تستقر الخطوات الخمس الأولى.",
      sort_from: "ابدأ من الخطوة {n}",
      sort_first: "أول سلسلة:",
      sort_time: "مدة سلاسل هذه الخطوة: {h}",
      st_path_t: "الطريق في ست خطوات",
      st_path_p: "السلاسل التي تقترحها المكتبة لكل خطوة.",
      pre_label: "قبلها:",
      pre_1:
        "لا شيء. معرفة الحروف العربية تعين على التجويد، ودروس التفسير تُفهم وحدها.",
      pre_2: "لا شيء. يكفي أن تريد معرفة ما يؤمن به المسلم.",
      pre_3: "أساسيات العقيدة من الخطوة ٢.",
      pre_4: "الخطوات من ١ إلى ٣ تعين، وليست شرطًا.",
      pre_5: "الخطوات من ١ إلى ٤ تعطيك الأساس.",
      pre_6: "أنهِ الخطوات من ١ إلى ٥ أولًا.",
      step_total: "مجموع الخطوة: {n} · {h}",
      arabic_k: "العربية",
      arabic_v: "قواعد الإعراب تُدرَّس مع الحفظ والتجويد في:",
      done_tick: "أنهيتها",
      days_prog: "أنهيت {d} من {t} يومًا",
      day_n: "اليوم {n}",
      st_skip_t: "ما الذي لا تبدأ به",
      st_skip_p:
        "لا تبدأ بمسائل الخلاف الفقهي الدقيقة، ولا بتفسير القرآن كاملًا من أوله إلى آخره. هذه تأتي لاحقًا.",
      st_stuck_t: "إذا توقفت عند شيء",
      st_stuck_p:
        "أعد مشاهدة الدرس، واقرأ نصه إن وُجد، واسأل معلمًا تثق به في بلدك. هذه المكتبة لا تجيب عن الأسئلة الشخصية.",
      st_rhythm_t: "إيقاع مقترح",
      st_rhythm_p: "درس واحد في اليوم، من عشرين إلى ثلاثين دقيقة.",
      tab_about: "عن المكتبة",
      tab_mission: "رسالتنا",
      tab_sheikh: "عن الشيخ",
      ab_title: "ما هذه المكتبة؟",
      ab_lede: "أرشيف منظم لدروس الشيخ، محفوظ على جهازك ويعمل بلا إنترنت.",
      ab_is_t: "ما هي، وما ليست",
      ab_is_p:
        "مكتبة فيديو تجمع دروس فضيلة الشيخ الدكتور مصطفى كامل في سلاسل مرتبة، لتتعلم بهدوء وبالترتيب.",
      ab_not_p:
        "ليست خدمة فتوى، ولا منصة تواصل، ولا تغني عن معلم حي تتعلم على يديه.",
      ab_why_t: "لماذا وُجدت",
      ab_why_p:
        "الدروس كثيرة ومتفرقة، والروابط قد تختفي، والإنترنت ليس متاحًا دائمًا. هنا تجدها كلها في مكان واحد، بترتيبها.",
      ab_order_t: "كيف رُتّبت",
      ab_order_p:
        "رُتّبت السلاسل على الترتيب الذي سار عليه أهل العلم: القرآن أولًا، ثم العقيدة، فالعبادة، فالسيرة، فالأخلاق، ثم العلوم المتقدمة. وخطب الجمعة والمناسبات في مجموعة مستقلة.",
      ab_src_t: "المصادر والمنهج",
      ab_src_p:
        "عناوين الدروس وتواريخها وترتيبها داخل السلاسل تظهر كما هي في الأرشيف الأصلي، دون إعادة صياغة. الترجمات والنصوص تظهر للدروس التي تتوفر لها.",
      ab_off_t: "كيف تعمل بلا إنترنت",
      ab_off_p:
        "تعمل المكتبة من مجلد على جهازك. لا حساب، ولا إعلانات، ولا تتبع. تقدمك ومحفوظاتك تبقى في هذا المتصفح على هذا الجهاز فقط.",
      ab_credit_t: "شكر وإسناد",
      ab_credit_p:
        "الخطوط المستخدمة مفتوحة الترخيص (SIL Open Font License 1.1): Amiri Quran وAmiri للآية والعناوين، وNoto Sans Arabic للنصوص، وReem Kufi للشعار. تلاوة الآية ١١٤ من سورة طه بصوت القارئ عاقب عزيز (Aaqib Azeez)، عن ويكيميديا كومنز، وقد أهداها صاحبها إلى الملك العام بترخيص CC0 1.0.",
      ab_details: "تفاصيل المكتبة",
      det_lessons: "الدروس في الفهرس",
      det_folder: "مجلد «videos»",
      det_found: "موجود ({n})",
      det_missing: "غير موجود بجانب المكتبة",
      det_unknown: "لا يمكن التحقق منه حين تُفتح المكتبة بهذه الطريقة",
      det_edition: "الإصدار",
      mi_title: "لماذا نحفظ هذه الدروس؟",
      mi_lede:
        "أن يتعلم الطالب دينه من القرآن والسنة أولًا، على يد عالم، بترتيب واضح.",
      p1_t: "تفنيد الشبهات",
      p1_p: "جواب هادئ بالدليل من القرآن والسنة عن الأسئلة والشبهات التي تصل إلى الناس اليوم.",
      p2_t: "ترسيخ اليقين",
      p2_p: "إيمان مبني على الفهم والدليل، يُبنى درسًا بعد درس، لا على التقليد وحده.",
      p3_t: "إلهام العطاء",
      p3_p: "العلم أمانة. من تعلّم شيئًا نافعًا علّمه أهله وجيرانه، وكان عونًا لمن حوله.",
      mi_how_t: "كيف يظهر ذلك في المكتبة",
      mi_how_1: "كل درس يحمل اسم سلسلته وتاريخ نشره.",
      mi_how_2: "الترجمات والنصوص موجودة للدروس التي تتوفر لها.",
      mi_how_3: "لا إعلانات ولا تتبع، ولا شيء يشغلك عن الدرس.",
      mi_how_4: "ترتيب السلاسل محفوظ، لأن الدرس خارج ترتيبه يضيّع الفائدة.",
      sh_en: "Sheikh Dr. Moustafa Kamel",
      sh_role: "دروسه وخطبه وسلاسله العلمية في مكتبة واحدة.",
      sh_series_t: "فهرس سلاسله في هذه المكتبة",
      sh_bio_t: "سيرته",
      sh_bio:
        "الشيخ الدكتور مصطفى سليمان كامل، حاصل على إجازة في حفظ القرآن الكريم وتجويده برواية حفص عن عاصم، ورواية قالون عن نافع، وإجازة في الحديث رواية ودراية. تخرج في كلية الشريعة والقانون بقسم القانون من جامعة الأزهر الشريف عام ١٩٩٢م، وقد أتم حفظ كتاب الله وهو في الحادية عشرة من عمره. حصل على درجة الماجستير في الفقه المقارن في الزواج برؤية مقاصدية عام ٢٠١٣م، ثم نال درجة الدكتوراه في الفقه المقارن بأطروحة عنوانها «الفرقة بين الزوجين في الشريعة الإسلامية وقانون الأسرة الأمريكي في ولاية كاليفورنيا». خطب ودرّس في المساجد قبل تخرجه، وعمل محاميًا في مصر من عام ١٩٩٢م إلى عام ١٩٩٤م، ثم إمامًا وخطيبًا بوزارة الأوقاف المصرية من عام ١٩٩٤م إلى عام ١٩٩٩م، ثم أُحيل إلى عمل إداري هناك، وعمل بتدريس اللغة العربية والعلوم الشرعية. جاء إلى الولايات المتحدة الأمريكية عام ٢٠٠٣م، وعمل بمسجد الأنصار في كاليفورنيا، وهو إلى يومنا هذا إمام المركز الإسلامي.",
      lg_guest: "دخول كضيف",
      lg_signin_btn: "تسجيل الدخول",
      lg_signup_btn: "إنشاء حساب",
      lg_signin_title: "تسجيل الدخول",
      lg_signup_title: "إنشاء حساب جديد",
      lg_back: "رجوع",
      lg_email: "الدخول بالبريد الإلكتروني",
      lg_email_l: "البريد الإلكتروني",
      lg_pass_l: "كلمة المرور",
      lg_submit: "تسجيل الدخول",
      lg_noconfig:
        "هذه الميزة غير متاحة حالياً. يرجى استخدام خيار الضيف أو التحقق لاحقاً.",
      lg_signedin: "مسجل الدخول باسم: {email}",
      lg_signout: "تسجيل الخروج",
      lg_bad: "بيانات الدخول غير صحيحة",
      lg_create: "إنشاء الحساب",
      lg_to_signup: "ليس لديك حساب؟ أنشئ حسابًا",
      lg_to_signin: "لديك حساب؟ سجّل الدخول",
      lg_confirm_l: "تأكيد كلمة المرور",
      lg_mismatch: "كلمتا المرور غير متطابقتين",
      lg_short: "كلمة المرور قصيرة جدًا، ٦ أحرف على الأقل",
      lg_checkmail: "تحقق من بريدك الإلكتروني لتأكيد حسابك",
      lg_unconfirmed:
        "هذا البريد غير مؤكد بعد. تحقق من بريدك أو أعد إرسال رسالة التأكيد.",
      lg_resend: "إعادة إرسال رسالة التأكيد",
      lg_resent: "أُعيد إرسال رسالة التأكيد. تحقق من بريدك.",
      lg_forgot: "نسيت كلمة المرور؟",
      lg_reset_sent:
        "تحقق من بريدك الإلكتروني للحصول على رابط إعادة تعيين كلمة المرور",
      lg_need_email: "أدخل بريدك الإلكتروني أولاً",
      lg_reset_title: "تعيين كلمة مرور جديدة",
      lg_new_pass_l: "كلمة المرور الجديدة",
      lg_new_pass_c_l: "تأكيد كلمة المرور الجديدة",
      lg_reset_submit: "تعيين كلمة المرور",
      lg_reset_done: "تم تحديث كلمة المرور. يمكنك الآن تسجيل الدخول.",
      lg_reset_bad:
        "تعذّر تحديث كلمة المرور. قد يكون الرابط منتهيًا؛ اطلب رابطًا جديدًا من صفحة الدخول.",
      lg_registered: "هذا البريد مسجل بالفعل. جرّب تسجيل الدخول.",
      lg_signup_fail: "تعذّر إنشاء الحساب. تحقق من البيانات وحاول مجددًا",
      pb_yt: "مشاهدة على يوتيوب داخل التطبيق",
      pb_hosted: "النسخة المستضافة",
      pb_local: "الملف المحلي",
      pb_local_no: "الملف المحلي غير متاح",
      pb_yt_no: "يوتيوب غير متاح، جرب الملف المحلي",
      pb_hosted_no: "النسخة المستضافة غير متاحة بعد",
      pb_full: "ملء الشاشة",
      sv_title: "دروسك المحفوظة",
      sv_lede: "كل درس تحفظه يظهر هنا، جاهزًا حين تعود.",
      bk_nav: "الكتب",
      bk_title: "كتب الشيخ",
      bk_lede: "كتب الشيخ ورسائله، كاملة للقراءة.",
      bk_cover_lib: "مكتبة الشيخ مصطفى كامل",
      bk_all: "الكل",
      bk_details: "تفاصيل الكتاب",
      bk_read: "اقرأ",
      bk_open: "افتح الملف",
      bk_part: "الجزء {n}",
      comma: "، ",
      bk_parts: "الأجزاء",
      bk_installed: "متاح في التطبيق المثبت",
      bk_word: "ملف Word، يفتح في برنامج معالجة النصوص على جهازك.",
      bk_missing: "الملف غير موجود في مجلد books على هذا الجهاز.",
      bk_other_en: "متوفر أيضًا بالإنجليزية",
      bk_other_ar: "متوفر أيضًا بالعربية",
      bk_back: "عودة إلى الكتب",
      bk_from_sheikh: "كتبه",
      sv_empty: "لم تحفظ أي درس بعد. اضغط النجمة على أي درس ليظهر هنا.",
    },
    en: {
      skip: "Skip to content",
      brand_sub: "An offline library of lessons",
      nav_home: "Home",
      nav_library: "Library",
      nav_start: "Where to Start",
      nav_saved: "Saved",
      nav_about: "About",
      theme: "Colours",
      th_emerald: "Emerald",
      th_parchment: "Parchment",
      th_midnight: "Midnight",
      th_sand: "Sand",
      th_sunset: "Sunset",
      th_puredark: "True black",
      calm: "Calm motion",
      rec_play: "Play recitation",
      rec_pause: "Pause",
      rec_replay: "Replay from the start",
      rec_mute: "Mute",
      rec_unmute: "Unmute",
      rec_vol: "Volume",
      rec_none: "Recitation is not included in this edition.",
      rec_ready: "The verse recitation is ready.",
      rec_playing: "Now reciting: Ta Ha 20:114",
      rec_blocked: "Playback did not start. Press play again.",
      foot_note:
        "Everything here runs from this computer, with no internet and no tracking.",
      hero_title: "The Library of Sheikh Dr. Moustafa Kamel",
      hero_promise:
        "Trusted lessons, ordered in series, on this computer, working without internet.",
      search_ph: "Search lessons and series...",
      search_go: "Search",
      browse: "Browse the Library",
      go_start: "Where to Start",
      live_watch: "Watch live on YouTube",
      r_continue_e: "Your lessons",
      r_continue: "Continue where you left off",
      r_begin_e: "Begin",
      r_begin: "Your first lesson",
      r_days_e: "A steady pace",
      r_days: "Foundations in 40 days",
      r_days_p:
        "Twenty to thirty minutes a day, in the order scholars have always taught.",
      see_days: "See all 40 days",
      r_pillars_e: "Six pillars",
      r_pillars: "The pillars of learning",
      r_pillars_p:
        "The Qur'an first, then beliefs, worship, the Prophet's life, character, and the deeper sciences.",
      r_featured_e: "Chosen by the library",
      r_featured: "Featured series",
      r_occ_e: "Outside the graded path",
      r_occ_p:
        "Friday sermons, open lessons and occasions, to listen to at any time.",
      see_all: "See all",
      prev: "Previous",
      next: "Next",
      sheikh_short: "Sheikh Moustafa Kamel",
      sheikh_full: "Sheikh Dr. Moustafa Kamel",
      imad: "Dr. Imad Bayoun",
      guests: "Guest speakers",
      open_series: "Open the series",
      play: "Play",
      resume: "Resume",
      save: "Save",
      unsave: "Remove from Saved",
      toast_saved: "Saved to your list",
      toast_removed: "Removed from your list",
      langs: "Languages & Text",
      published: "Published {d}",
      no_series: "Not in a series",
      cat_videos: "Recorded lessons",
      cat_streams: "Live streams",
      cat_shorts: "Shorts",
      lib_title: "Library",
      lib_series: "All series",
      lib_all: "All lessons",
      lib_loose: "Lessons outside a series",
      lib_prog: "In progress",
      lib_saved: "Saved",
      all: "All",
      sort: "Sort",
      s_order: "Series order",
      s_catalog: "Library order",
      s_az: "A to Z",
      s_most: "Most lessons",
      s_new: "Newest",
      s_old: "Oldest",
      s_long: "Longest",
      s_short: "Shortest",
      match_lessons: "Lessons matching your search: {n}.",
      show_lessons: "Show them",
      search_h: "Search results",
      nothing: "Nothing matches. Try a shorter word.",
      none_series: "No series match.",
      show_lessons_btn: "Show the matching lessons",
      clear: "Clear search",
      more_cards: "Show more",
      chunk_none: "No matches.",
      chunk_all: "All matches shown.",
      chunk_counts: "{shown} shown, {remaining} remaining.",
      nofolder_t: "The videos are not on this computer right now",
      nofolder_p: "You can browse the catalogue and read the texts. To watch, place the “videos” folder next to the library's main folder.",
      hide: "Hide",
      mark_done: "Mark as watched",
      marked_done: "Watched",
      days_end: "You finished the forty days. Begin again, or choose any series.",
      days_again: "Start again",
      scope_lib: "This field searches the whole library.",
      scope_to_pl: "Search only this series",
      scope_pl: "This field searches this series.",
      scope_to_lib: "Search the whole library",
      pl_start: "Start with the earliest lesson",
      pl_resume: "Resume where you left off",
      pl_hours: "Total time {h}",
      back_lib: "Library",
      back_series: "Back to the series",
      ls_series: "Lessons in this series",
      ls_all_series: "Open the series page",
      ls_prev: "Previous lesson",
      ls_next: "Next lesson",
      ls_resume_at: "Resume from {t}",
      cap_ar: "Arabic captions",
      cap_en: "English captions",
      tx_title: "Text of the lesson",
      tx_hint: "Tap any line to go to that moment in the lesson.",
      tx_loading: "Loading the text...",
      tx_fail: "The text for this lesson could not be opened.",
      cap_fail:
        "Captions are not available for this lesson. You can still read the full text.",
      open_file: "Open in another player",
      err_404: "This lesson's video is not on this computer.",
      err_details: "Details",
      err_where:
        "It should be inside the “videos” folder in your library folder:",
      err_nofolder:
        "The “videos” folder was not found next to the library's main folder.",
      err_format: "This video did not play here. Try the VLC app.",
      dlg_captions: "Watch with captions",
      dlg_read: "Read along",
      lang_ar: "Arabic",
      lang_en: "English",
      close: "Close",
      p_quran: "Qur'an: Recitation and Understanding",
      p_beliefs: "Beliefs",
      p_worship: "Worship",
      p_seerah: "Seerah and the Companions",
      p_character: "Character and Purification of the Heart",
      p_deeper: "Deeper Sciences",
      p_occasions: "Sermons and occasions",
      d_quran:
        "Correct recitation first, then the meanings and tafsir of the verses.",
      d_beliefs:
        "What a Muslim believes, in plain words: faith in Allah, His names and attributes, and the pillars of faith.",
      d_worship:
        "Purification, prayer, fasting, zakat and hajj, each learned as it arrives.",
      d_seerah:
        "The life of the Prophet ﷺ and his Companions, and what we learn from it.",
      d_character:
        "Honesty, mercy and good manners, and cleansing the heart of envy and pride.",
      d_deeper:
        "Legal theory, hadith terminology and hadith commentary, with Arabic as the tool of study.",
      d_occasions: "Friday sermons, open lessons and occasions.",
      lv_beginner: "Beginner",
      lv_intermediate: "Intermediate",
      lv_advanced: "Advanced",
      st_kicker: "Where to Start",
      st_title: "A clear path for beginners",
      st_lede:
        "You do not need to choose from thousands of lessons. Start with one session, then follow the steps in order.",
      st_first_tag: "Your first session",
      st_first_t: "Start here, with one lesson",
      st_first_p:
        "One short lesson to begin with today, chosen for its topic and length.",
      st_watch: "Watch now",
      st_q_t: "Which one sounds like you?",
      st_q_p: "Pick one question and begin at the step it points to.",
      q_a_t: "New to Islam, or coming back to it?",
      q_a_p:
        "Begin with the Qur'an: how to read it, then what its verses mean.",
      q_b_t: "You pray, and want to understand more?",
      q_b_p:
        "Meet the life of the Prophet ﷺ, the example for everything you have learned.",
      q_c_t: "You read Arabic, and want depth?",
      q_c_p:
        "The deeper sciences and their tools, once the first five steps are settled.",
      sort_from: "Begin at step {n}",
      sort_first: "First series:",
      sort_time: "Time for this step's series: {h}",
      st_path_t: "The path in six steps",
      st_path_p: "The library's suggested series for each step.",
      pre_label: "Before this:",
      pre_1:
        "Nothing. Knowing the Arabic letters helps with tajweed; the tafsir lessons stand on their own.",
      pre_2: "Nothing. You only need the wish to learn what Muslims believe.",
      pre_3: "The basics of belief from step 2.",
      pre_4: "Steps 1 to 3 help, but are not required.",
      pre_5: "Steps 1 to 4 give you the foundation.",
      pre_6: "Finish steps 1 to 5 first.",
      step_total: "Step total: {n} · {h}",
      arabic_k: "Arabic",
      arabic_v:
        "Grammar (i'rab) is taught alongside memorisation and tajweed in:",
      done_tick: "Done",
      days_prog: "{d} of {t} days done",
      day_n: "Day {n}",
      st_skip_t: "What not to start with",
      st_skip_p:
        "Do not start with fine points of disagreement in fiqh, or with a full commentary of the Qur'an from cover to cover. Those come later.",
      st_stuck_t: "If you get stuck",
      st_stuck_p:
        "Watch the lesson again, read its text if there is one, and ask a teacher you trust where you live. This library does not answer personal questions.",
      st_rhythm_t: "A suggested rhythm",
      st_rhythm_p: "One lesson a day, twenty to thirty minutes.",
      tab_about: "About the library",
      tab_mission: "Mission",
      tab_sheikh: "The Sheikh",
      ab_title: "What is this library?",
      ab_lede:
        "An organised archive of the Sheikh's lessons, stored on your computer and working without internet.",
      ab_is_t: "What it is, and what it is not",
      ab_is_p:
        "A video library that gathers the lessons of Sheikh Dr. Moustafa Kamel into ordered series, so you can learn calmly and in order.",
      ab_not_p:
        "It is not a fatwa service, not a social platform, and not a replacement for a living teacher.",
      ab_why_t: "Why it exists",
      ab_why_p:
        "The lessons are many and scattered, links can disappear, and the internet is not always there. Here they are in one place, in their order.",
      ab_order_t: "How it is arranged",
      ab_order_p:
        "The series follow the order scholars have always taught: the Qur'an first, then beliefs, worship, the Prophet's life, character, and the deeper sciences. Friday sermons and occasions have their own collection.",
      ab_src_t: "Sources and method",
      ab_src_p:
        "Lesson titles, dates and their order inside each series are shown exactly as in the original archive, with nothing rewritten. Captions and texts appear only for lessons that have them.",
      ab_off_t: "How it works offline",
      ab_off_p:
        "The library runs from a folder on your computer. No account, no adverts, no tracking. Your progress and saved lessons stay in this browser on this computer only.",
      ab_credit_t: "Credits",
      ab_credit_p:
        "All fonts are openly licensed (SIL Open Font License 1.1): Amiri Quran and Amiri for the verse and headings, Noto Sans Arabic for text, Reem Kufi for the emblem. Qur'an recitation by Aaqib Azeez, via Wikimedia Commons, dedicated to the public domain under CC0 1.0.",
      ab_details: "Library details",
      det_lessons: "Lessons in the catalogue",
      det_folder: "The “videos” folder",
      det_found: "Found ({n})",
      det_missing: "Not found next to the library",
      det_unknown: "Cannot be checked when the library is opened this way",
      det_edition: "Edition",
      mi_title: "Why we keep these lessons",
      mi_lede:
        "So that a student learns the religion from the Qur'an and Sunnah first, through a scholar, in a clear order.",
      p1_t: "Dismantle doubts",
      p1_p: "A calm answer, with evidence from the Qur'an and Sunnah, to the questions and doubts people meet today.",
      p2_t: "Nurture conviction",
      p2_p: "Faith built on understanding and evidence, one lesson at a time, not on imitation alone.",
      p3_t: "Inspire contribution",
      p3_p: "Knowledge is a trust. Whoever learns something beneficial teaches it to family and neighbours, and becomes a help to those around them.",
      mi_how_t: "How this shows in the library",
      mi_how_1: "Every lesson carries its series name and its publishing date.",
      mi_how_2: "Captions and texts are there for the lessons that have them.",
      mi_how_3:
        "No adverts and no tracking, nothing pulling you away from the lesson.",
      mi_how_4:
        "Series order is kept, because a lesson out of order loses its benefit.",
      sh_en: "Sheikh Dr. Moustafa Kamel",
      sh_role:
        "His lessons, sermons and scholarly series, gathered in one library.",
      sh_series_t: "Index of his series in this library",
      sh_bio_t: "His life and work",
      sh_bio:
        "Sheikh Dr. Moustafa Suleiman Kamel holds ijazas in Quran memorization and tajweed according to the riwaya of Hafs an Asim and Qalun an Nafi, as well as an ijaza in hadith narration and understanding. He graduated from Al-Azhar University in 1992 with a degree in Sharia and Law, having completed his memorization of the Quran at the age of eleven. In 2013, he earned a Master's degree in comparative fiqh on marriage from a maqasid perspective, followed by a PhD in comparative fiqh with a dissertation entitled \"Dissolution of Marriage between Spouses in Islamic Sharia and American Family Law in California\". Before his graduation he preached and taught in mosques. He worked as a lawyer in Egypt from 1992 to 1994, then served as an Imam and Khatib for the Egyptian Ministry of Awqaf from 1994 to 1999, before being moved to administrative work there, and he taught Arabic language and the Islamic sciences. He came to the United States in 2003 and worked at Masjid Al-Ansar in California, where he remains to this day the Imam of the Islamic Center.",
      lg_guest: "Enter as Guest",
      lg_signin_btn: "Sign In",
      lg_signup_btn: "Sign Up",
      lg_signin_title: "Sign In",
      lg_signup_title: "Create Your Account",
      lg_back: "Back",
      lg_email: "Sign in with Email",
      lg_email_l: "Email Address",
      lg_pass_l: "Password",
      lg_submit: "Sign In",
      lg_noconfig:
        "This feature is currently unavailable. Please use the guest option or check back later.",
      lg_signedin: "Signed in as: {email}",
      lg_signout: "Sign Out",
      lg_bad: "Incorrect email or password",
      lg_create: "Create Account",
      lg_to_signup: "No account yet? Create one",
      lg_to_signin: "Already have an account? Sign in",
      lg_confirm_l: "Confirm Password",
      lg_mismatch: "Passwords do not match",
      lg_short: "Password is too short, at least 6 characters",
      lg_checkmail: "Check your email to confirm your account",
      lg_unconfirmed:
        "This email is not confirmed yet. Check your inbox or resend the confirmation email.",
      lg_resend: "Resend confirmation email",
      lg_resent: "Confirmation email resent. Check your inbox.",
      lg_forgot: "Forgot your password?",
      lg_reset_sent: "Check your email for the password reset link",
      lg_need_email: "Enter your email address first",
      lg_reset_title: "Set a new password",
      lg_new_pass_l: "New password",
      lg_new_pass_c_l: "Confirm new password",
      lg_reset_submit: "Set New Password",
      lg_reset_done: "Password updated. You can now sign in.",
      lg_reset_bad:
        "Could not update the password. The link may have expired; request a new one from the sign-in page.",
      lg_registered: "This email is already registered. Try signing in.",
      lg_signup_fail:
        "Could not create the account. Check the details and try again",
      pb_yt: "Watch on YouTube in-app",
      pb_hosted: "Hosted Version",
      pb_local: "Local File",
      pb_local_no: "Local file unavailable",
      pb_yt_no: "YouTube unavailable, try local file",
      pb_hosted_no: "Hosted version not available yet",
      pb_full: "Full screen",
      sv_title: "Your saved lessons",
      sv_lede: "Every lesson you save appears here, ready when you return.",
      bk_nav: "Books",
      bk_title: "The Sheikh's books",
      bk_lede: "His books and treatises, complete and ready to read.",
      bk_cover_lib: "Sheikh Moustafa Kamel Library",
      bk_all: "All",
      bk_details: "Book details",
      bk_read: "Read",
      bk_open: "Open file",
      bk_part: "Part {n}",
      comma: ", ",
      bk_parts: "Parts",
      bk_installed: "Available in the installed app",
      bk_word: "A Word file. It opens in the word processor on your computer.",
      bk_missing: "This file is not in the books folder on this computer.",
      bk_other_en: "Also available in English",
      bk_other_ar: "Also available in Arabic",
      bk_back: "Back to books",
      bk_from_sheikh: "His books",
      sv_empty:
        "You have not saved a lesson yet. Press the star on any lesson and it will appear here.",
    },
  };
  // The website opens from a link, not from a folder on this computer
  // (wording from the v4 preview, without its "no account" line: v5 has sign-in).
  if (HOSTED) {
    Object.assign(S.ar, {
      brand_sub: "مكتبة دروس تفتح من هذا الرابط",
      foot_note: "هذه المكتبة تفتح من الرابط مباشرة، بلا إعلانات وبلا تتبع.",
      hero_promise: "دروس موثوقة، مرتبة في سلاسل، تفتحها من هذا الرابط أينما كنت.",
      ab_lede: "أرشيف منظم لدروس الشيخ، يفتح من هذا الرابط.",
      ab_off_t: "كيف تعمل هذه النسخة",
      ab_off_p:
        "تعمل هذه النسخة من المكتبة من هذا الرابط مباشرة. لا إعلانات، ولا تتبع. تقدمك ومحفوظاتك تبقى في هذا المتصفح على هذا الجهاز.",
    });
    Object.assign(S.en, {
      brand_sub: "A library of lessons, open from this link",
      foot_note: "This library opens straight from the link, with no adverts and no tracking.",
      hero_promise: "Trusted lessons, ordered in series, open from this link wherever you are.",
      ab_lede: "An organised archive of the Sheikh's lessons, open from this link.",
      ab_off_t: "How this copy works",
      ab_off_p:
        "This copy of the library runs straight from this link. No adverts, no tracking. Your progress and saved lessons stay in this browser on this device.",
    });
  }

  /* ---------- Storage: one wrapper, every key versioned. v1/v2 keys kept so the owner's data carries over. ---------- */
  const K = {
    fav: "archive-favorites-v4",
    prog: "archive-progress-v4",
    done: "archive-v2-done",
    recent: "archive-v2-recent",
    lang: "archive-v2-lang",
    theme: "archive-v2-theme",
    path: "archive-v2-path",
    tx: "archive-v2-text-cache",
    vol: "archive-v2-rec-vol",
    mute: "archive-v2-rec-mute",
    calm: "archive-v3-calm",
    sort: "archive-v3-sort",
    days: "archive-v3-days",
    acct: "archive-v5-account",
  };
  function load(k, d) {
    try {
      const v = JSON.parse(localStorage.getItem(k));
      return v == null ? d : v;
    } catch (_) {
      return d;
    }
  }
  function store(k, v) {
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch (_) {}
  }
  const st = {
    lang: load(K.lang, "ar") === "en" ? "en" : "ar",
    theme: THEMES.includes(load(K.theme, "")) ? load(K.theme, "") : "emerald",
    fav: load(K.fav, {}),
    prog: load(K.prog, {}),
    done: load(K.done, {}),
    recent: load(K.recent, []),
    path: load(K.path, {}),
    calm: !!load(K.calm, false),
    sort: load(K.sort, {}),
    days: load(K.days, {}),
  };

  /* ---------- Admin: the admin page is visible only to the owner's account.
     The check is a UI gate only: nothing privileged exists in the browser
     (anon key only), and admin edits land only as a committed data file. ---------- */
  const ADMIN_EMAIL = "meroatschool@gmail.com";
  function isAdminSession() {
    const a = load(K.acct, null);
    return !!(
      a &&
      a.mode === "email" &&
      a.access_token &&
      String(a.email || "").toLowerCase() === ADMIN_EMAIL
    );
  }
  function adminSettings() {
    try {
      if (
        typeof ADMIN_OVERRIDES !== "undefined" &&
        ADMIN_OVERRIDES &&
        ADMIN_OVERRIDES.settings
      )
        return ADMIN_OVERRIDES.settings;
    } catch (_) {}
    return {};
  }
  function adminLiveEnabled() {
    return adminSettings().liveEnabled !== false;
  }
  function adminAnnouncement() {
    const a = String(adminSettings().announcement || "").trim();
    if (!a) return "";
    try {
      if (sessionStorage.getItem("archive-v5-ann") === "0") return "";
    } catch (_) {}
    return a;
  }
  function paintAdminLink() {
    const nav = $("#nav");
    if (!nav) return;
    const old = $("#adminLink", nav);
    if (!isAdminSession()) {
      if (old) old.remove();
      return;
    }
    if (old) return;
    const a = document.createElement("a");
    a.id = "adminLink";
    a.href = "#/admin";
    a.dataset.r = "admin";
    a.textContent = st.lang === "en" ? "Admin" : "الإدارة";
    nav.appendChild(a);
  }
  function renderAdmin(arg, q) {
    if (typeof window.__adminRender === "function") {
      window.__adminRender(arg, q);
      return;
    }
    go("#/home");
  }

  /* ---------- Helpers ---------- */
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const ESC = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  const esc = (s) =>
    String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ESC[c]);
  function t(k, vars) {
    let s = (S[st.lang] && S[st.lang][k]) || S.ar[k] || k;
    if (vars) for (const n in vars) s = s.split("{" + n + "}").join(vars[n]);
    return s;
  }
  const L = () =>
    st.lang === "en" ? ' lang="en" dir="ltr"' : ' lang="ar" dir="rtl"';
  const AR = ' lang="ar" dir="rtl"';
  // Display title (Nov 22, 2026 translation fix): in English mode prefer the
  // English title when one exists, otherwise fall back to Arabic. The lang/dir
  // follows the language actually shown, so a held (untranslated) title still
  // renders right-to-left.
  const dTitle = (o) => (st.lang === "en" && o.titleEn ? o.titleEn : o.title);
  const dLang = (o) => (st.lang === "en" && o.titleEn ? L() : AR);
  // Arabic subtitle under an English title on detail pages: the Arabic stays
  // visible so a bad translation is spotted, and Arabic readers keep their title.
  const arSub = (o) =>
    st.lang === "en" && o.titleEn && o.title !== o.titleEn
      ? `<p class="ar-sub"${AR}>${esc(o.title)}</p>`
      : "";
  const nf = (n) =>
    new Intl.NumberFormat(st.lang === "ar" ? "ar-EG" : "en").format(n);
  function dur(sec) {
    const s = Math.max(0, Math.floor(+sec || 0)),
      h = Math.floor(s / 3600),
      m = Math.floor((s % 3600) / 60),
      r = s % 60;
    const out = h
      ? h + ":" + String(m).padStart(2, "0") + ":" + String(r).padStart(2, "0")
      : m + ":" + String(r).padStart(2, "0");
    return st.lang === "ar"
      ? out.replace(/\d/g, (d) => String.fromCharCode(0x660 + +d))
      : out;
  }
  function hours(sec) {
    const h = Math.floor(sec / 3600),
      m = Math.floor((sec % 3600) / 60);
    return st.lang === "ar"
      ? (h ? nf(h) + " س " : "") + nf(m) + " د"
      : (h ? h + "h " : "") + String(m).padStart(h ? 2 : 1, "0") + "m";
  }
  function date(d) {
    if (!d) return "";
    const x = new Date(d + "T12:00:00");
    if (isNaN(x)) return d;
    return new Intl.DateTimeFormat(st.lang === "ar" ? "ar-EG" : "en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(x);
  }
  const icon = (id, cls) =>
    '<svg class="i' +
    (cls ? " " + cls : "") +
    '" aria-hidden="true"><use href="#' +
    id +
    '"/></svg>';
  const kh = (cls) =>
    '<svg class="kh' +
    (cls ? " " + cls : "") +
    '" aria-hidden="true"><use href="#khatam"/></svg>';
  // Counted nouns. Arabic follows the CLDR categories: one, two (dual), few (3 to 10: plural),
  // many (11 to 99: singular accusative), other (100, 101, 102...: singular). Zero uses "other".
  const PLURALS = {
    ar: {
      lesson: ["درس واحد", "درسان", "{n} دروس", "{n} درسًا", "{n} درس"],
      series: ["سلسلة واحدة", "سلسلتان", "{n} سلاسل", "{n} سلسلة", "{n} سلسلة"],
      result: ["نتيجة واحدة", "نتيجتان", "{n} نتائج", "{n} نتيجة", "{n} نتيجة"],
      minute: ["دقيقة واحدة", "دقيقتان", "{n} دقائق", "{n} دقيقة", "{n} دقيقة"],
      file: ["ملف واحد", "ملفان", "{n} ملفات", "{n} ملفًا", "{n} ملف"],
      page: ["صفحة واحدة", "صفحتان", "{n} صفحات", "{n} صفحة", "{n} صفحة"],
      book: ["كتاب واحد", "كتابان", "{n} كتب", "{n} كتابًا", "{n} كتاب"],
    },
    en: {
      lesson: ["1 lesson", "{n} lessons"],
      series: ["1 series", "{n} series"],
      result: ["1 result", "{n} results"],
      minute: ["1 min", "{n} min"],
      file: ["1 file", "{n} files"],
      page: ["1 page", "{n} pages"],
      book: ["1 book", "{n} books"],
    },
  };
  // The bare noun under a big numeral (stat rows, the first-lesson minutes badge).
  const WORDS = {
    ar: {
      lesson: ["درس", "درسان", "دروس", "درسًا", "درس"],
      series: ["سلسلة", "سلسلتان", "سلاسل", "سلسلة", "سلسلة"],
      minute: ["دقيقة", "دقيقتان", "دقائق", "دقيقة", "دقيقة"],
    },
    en: {
      lesson: ["lesson", "lessons"],
      series: ["series", "series"],
      minute: ["minute", "minutes"],
    },
  };
  const PR = { ar: new Intl.PluralRules("ar"), en: new Intl.PluralRules("en") };
  const ORDER = { ar: ["one", "two", "few", "many", "other"], en: ["one", "other"] };
  const form = (table, k, n) => {
    const l = st.lang === "en" ? "en" : "ar",
      i = ORDER[l].indexOf(PR[l].select(n));
    return table[l][k][i < 0 ? ORDER[l].length - 1 : i];
  };
  const count = (k, n) => form(PLURALS, k, n).replace("{n}", nf(n));
  const word = (k, n) => form(WORDS, k, n);
  const lessonsN = (n) => count("lesson", n);
  const medal = (key) =>
    `<div class="medal" data-dl="${key}" aria-hidden="true">` + kh() + "</div>";
  const calm = () =>
    st.calm || matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Arabic-aware search: drop diacritics and tatweel, unify alef/ya/ta-marbuta forms and digits
  function norm(s) {
    return String(s || "")
      .toLowerCase()
      .replace(/[ً-ٰٟۖ-ۭـ]/g, "")
      .replace(/[إأآٱ]/g, "ا")
      .replace(/ى/g, "ي")
      .replace(/ة/g, "ه")
      .replace(/ؤ/g, "و")
      .replace(/ئ/g, "ي")
      .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x660))
      .replace(/\s+/g, " ")
      .trim();
  }
  const vNorm = new Map(
    VIDEOS.map((v) => [v.id, norm(v.title + " " + v.titleEn)]),
  );
  const pNorm = new Map(
    PLAYLISTS.map((p) => [
      p.id,
      norm(
        p.title +
          " " +
          p.titleEn +
          (p.id === IMAD_PL ? " العقيدة " + S.ar.imad + " " + S.en.imad : ""),
      ),
    ]),
  );
  // A playlist's lessons are the items present in this catalogue; counts and times come from these.
  const plItems = new Map(
    PLAYLISTS.map((p) => [
      p.id,
      p.items.map((it) => byId.get(it.id)).filter(Boolean),
    ]),
  );
  const plDur = new Map(
    PLAYLISTS.map((p) => [
      p.id,
      plItems.get(p.id).reduce((a, v) => a + (v.duration || 0), 0),
    ]),
  );
  const plCount = (id) => plItems.get(id).length;
  // playlists keep the channel's own order (mostly newest first), so "earliest" is the oldest upload
  function earliest(p) {
    let best = null,
      bi = -1;
    plItems.get(p.id).forEach((v, i) => {
      if (
        !best ||
        (v.uploadDate || "9") < (best.uploadDate || "9") ||
        (v.uploadDate === best.uploadDate && i > bi)
      ) {
        best = v;
        bi = i;
      }
    });
    return best;
  }
  const notSheikh = (id) => id === IMAD_PL || id === GUEST_PL;
  const sheikhSeries = PLAYLISTS.filter((p) => !notSheikh(p.id));
  const looseVideos = VIDEOS.filter((v) => !v.playlistIds.length);
  const STATS = {
    videos: VIDEOS.length,
    series: PLAYLISTS.length,
  };
  const catCount = (c) =>
    VIDEOS.filter((v) => (v.categories || []).includes(c)).length;
  const CATS = {
    videos: catCount("videos"),
    streams: catCount("streams"),
    shorts: catCount("shorts"),
  };
  const scholarOfPl = (id) =>
    id === IMAD_PL
      ? t("imad")
      : id === GUEST_PL
        ? t("guests")
        : t("sheikh_short");
  const scholarOf = (v) => scholarOfPl(v.playlistIds.find(notSheikh) || "");
  const seriesOf = (v, ctx) =>
    plById.get(ctx && v.playlistIds.includes(ctx) ? ctx : v.playlistIds[0]);
  const isFav = (id) => !!st.fav[id];
  const progOf = (id) => +st.prog[id] || 0;
  const canResume = (v) =>
    progOf(v.id) > 5 &&
    !st.done[v.id] &&
    (!v.duration || progOf(v.id) < v.duration - 10);
  const hasText = (v) =>
    (v.subtitles || []).some(
      (s) => s && (s.lang === "ar" || s.lang === "en") && (s.src || s.readSrc),
    );
  function seriesPct(p) {
    let n = 0;
    const items = plItems.get(p.id);
    for (const v of items) if (st.done[v.id] || progOf(v.id) > 5) n++;
    return items.length ? n / items.length : 0;
  }
  const lessonHref = (v, ctx, extra) =>
    "#/lesson/" +
    encodeURIComponent(v.id) +
    (ctx ? "?pl=" + encodeURIComponent(ctx) : "") +
    (extra ? (ctx ? "&" : "?") + extra : "");

  /* ---------- Motion helpers ---------- */
  // Weak devices get the same choreography with fewer dancers.
  const WEAK =
    (navigator.hardwareConcurrency || 8) <= 4 ||
    (navigator.deviceMemory || 8) <= 4;
  const capN = (n) => (WEAK ? n >> 1 : n);
  function onceKey(k) {
    // draw-ons run once per element per session
    try {
      const seen = JSON.parse(sessionStorage.getItem("archive-v4-drawn") || "[]");
      if (seen.includes(k)) return false;
      seen.push(k);
      sessionStorage.setItem("archive-v4-drawn", JSON.stringify(seen));
    } catch (_) {}
    return true;
  }
  // Entrances bind per element: only what scrolls into view ever animates, once.
  let enterIO = null;
  function enterEach(els, cap) {
    if (calm() || !window.IntersectionObserver || !els.length) return;
    if (!enterIO)
      enterIO = new IntersectionObserver(
        (es) => {
          let i = 0;
          es.filter((e) => e.isIntersecting)
            .sort(
              (a, b) =>
                a.boundingClientRect.top - b.boundingClientRect.top ||
                b.boundingClientRect.left - a.boundingClientRect.left,
            )
            .forEach((e) => {
              const el = e.target;
              enterIO.unobserve(el);
              if (el.dataset.revealed) return;
              el.classList.remove("pend");
              if (i < +el.dataset.ecap) {
                el.style.setProperty("--i", i++);
                el.classList.add("rise");
              }
            });
        },
        { threshold: 0.15 },
      );
    els.forEach((el) => {
      el.dataset.ecap = capN(cap || 8);
      el.classList.add("pend");
      enterIO.observe(el);
    });
    // Safety net: content must never stay invisible because the entrance
    // observer did not fire (a static capture, a stalled scroll, an
    // element resting inside a sideways rail). Anything still pending
    // shortly after registration is revealed plainly, and the observer
    // skips it from then on.
    const batch = els.slice();
    setTimeout(
      () =>
        batch.forEach((el) => {
          if (el.classList.contains("pend")) {
            el.dataset.revealed = "1";
            el.classList.remove("pend");
          }
        }),
      1600,
    );
  }
  // "The Drawn Line": each divider's hairlines grow from the centre, then the medallion draws itself.
  // The draw is NOT spent once per session: an earlier version marked every
  // divider as seen the moment its view rendered (onceKey at filter time),
  // so on any later view the dividers rendered as plain static lines and
  // the scroll-into-view animation never played again. Each render's
  // dividers now draw when they scroll into view, every time. While the
  // opening page covers the screen the draw is held, so it is not spent
  // unseen behind it; enter() releases the ones already on screen.
  let lineIO = null;
  const splashUp = () => {
    const sp = $("#splash");
    return !!sp && !sp.hidden && !sp.classList.contains("gone");
  };
  function drawLines(root) {
    const els = $$(".medal[data-dl]", root).filter(
      (el) => !calm() && window.IntersectionObserver,
    );
    if (!els.length) return;
    if (!lineIO)
      lineIO = new IntersectionObserver(
        (es) =>
          es.forEach((e) => {
            if (!e.isIntersecting || splashUp()) return;
            lineIO.unobserve(e.target);
            e.target.classList.replace("pend", "drawing");
          }),
        { threshold: 0.6 },
      );
    els.forEach((el) => {
      el.classList.add("pend");
      lineIO.observe(el);
    });
  }
  // Called when the opening page closes: dividers already on screen were
  // held by the splash guard and get no new intersection event, so any
  // still-pending divider inside the viewport draws now.
  function drawVisibleLines() {
    $$(".medal.pend").forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.bottom > 0 && r.top < innerHeight) {
        if (lineIO) lineIO.unobserve(el);
        el.classList.replace("pend", "drawing");
      }
    });
  }
  // Section headings: eyebrow, then title, then the rule; the cards follow on their own observer.
  function enterSections(root) {
    enterEach($$(".sec-h", root), 99);
    enterEach($$(".rail > *", root), 8);
  }
  // FLIP: things that stay glide to their new place; newcomers fade and rise (stagger capped at 12)
  function flip(box, mutate) {
    const before = new Map();
    if (!calm())
      $$("[data-k]", box).forEach((el) =>
        before.set(el.dataset.k, el.getBoundingClientRect()),
      );
    mutate();
    if (calm()) return;
    let n = 0;
    const vh = innerHeight,
      later = [];
    $$("[data-k]", box).forEach((el) => {
      const a = before.get(el.dataset.k);
      const b = el.getBoundingClientRect();
      if (b.top > vh) return a || later.push(el);
      if (b.bottom < 0) return;
      if (a) {
        const dx = a.left - b.left,
          dy = a.top - b.top;
        if (dx || dy)
          el.animate(
            [
              { transform: `translate(${dx}px,${dy}px)` },
              { transform: "none" },
            ],
            { duration: 280, easing: "cubic-bezier(.4,0,.2,1)" },
          );
      } else if (n < capN(10)) {
        el.style.setProperty("--i", n++);
        el.classList.add("rise");
      }
    });
    enterEach(later, 8);
  }
  // Long lists render through the shared chunked renderer (render/
  // chunked-render.js, inlined by build.py): the first paint is capped and
  // the rest loads behind an accessible "Show more" button with a live
  // status. The 1,500-card soft cap (brief item 10) is the default cap.
  function mountList(box, list, card, cap = 1500) {
    if (box._stop) box._stop();
    let dispose = null;
    flip(box, () => {
      dispose = globalThis.renderChunked({
        container: box,
        items: list,
        renderCard: card,
        cap,
        labels: {
          more: t("more_cards"),
          none: t("chunk_none"),
          all: t("chunk_all"),
          counts: (shown, remaining) =>
            t("chunk_counts", {
              shown: nf(shown),
              remaining: nf(remaining),
            }),
        },
      });
    });
    box._stop = () => {
      if (dispose) dispose();
      box._stop = null;
    };
  }
  function unpop(el) {
    if (calm() || !el) return;
    el.animate(
      [
        { transform: "scale(1)" },
        { transform: "scale(.85)" },
        { transform: "scale(1)" },
      ],
      { duration: 180, easing: "cubic-bezier(0,0,.2,1)" },
    );
  }
  function pop(el) {
    if (calm() || !el) return;
    el.animate(
      [
        { transform: "scale(1)" },
        { transform: "scale(1.22)" },
        { transform: "scale(1)" },
      ],
      { duration: 240, easing: "cubic-bezier(0,0,.2,1)" },
    );
    const r = el.getBoundingClientRect(),
      cx = r.left + r.width / 2,
      cy = r.top + r.height / 2;
    [0, 90, 180, 270].forEach((deg) => {
      const s = document.createElement("i");
      s.className = "spark";
      s.style.left = cx + "px";
      s.style.top = cy + "px";
      document.body.appendChild(s);
      const a = ((deg + 45) * Math.PI) / 180;
      s.animate(
        [
          {
            transform: "translate(0,0) rotate(45deg) scale(.4)",
            opacity: 0.95,
          },
          {
            transform: `translate(${Math.cos(a) * 16}px,${Math.sin(a) * 16}px) rotate(45deg) scale(.2)`,
            opacity: 0,
          },
        ],
        { duration: 360, easing: "cubic-bezier(0,0,.2,1)" },
      ).onfinish = () => s.remove();
    });
  }
  let toastTimer;
  function toast(msg) {
    const el = $("#toast");
    el.textContent = msg;
    el.setAttribute("lang", st.lang);
    el.setAttribute("dir", st.lang === "ar" ? "rtl" : "ltr");
    el.hidden = false;
    el.style.animation = "none";
    void el.offsetWidth;
    el.style.animation = "";
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (el.hidden = true), 2500);
  }

  /* ---------- Cards ---------- */
  function imgTag(src) {
    return src
      ? '<img src="' +
          esc(src) +
          '" alt="" loading="lazy" decoding="async" onerror="this.parentNode.classList.add(\'noimg\')">'
      : "";
  }
  const CHECK =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.2 4.2L19 7" pathLength="100"/></svg>';
  function starBtn(id, cls) {
    const on = isFav(id);
    return `<button class="star-btn${cls ? " " + cls : ""}" type="button" data-fav="${esc(id)}" aria-pressed="${on}" aria-label="${esc(t(on ? "unsave" : "save"))}"><svg aria-hidden="true"><use href="#i-star"/></svg></button>`;
  }
  function lessonCard(v, ctx) {
    const p = seriesOf(v, ctx),
      pr = progOf(v.id),
      pct = st.done[v.id]
        ? 1
        : v.duration && pr
          ? Math.min(1, pr / v.duration)
          : 0;
    const href = lessonHref(v, ctx),
      res = canResume(v);
    return (
      `<article class="lcard" data-k="${esc(v.id)}"><div class="media">` +
      `<a class="thumb${v.thumbnail ? "" : " noimg"}" href="${href}" tabindex="-1" aria-hidden="true">${imgTag(v.thumbnail)}` +
      `<span class="chip">${esc(dur(v.duration))}</span>` +
      (st.done[v.id]
        ? `<span class="donek" title="${esc(t("marked_done"))}">${CHECK}</span>`
        : "") +
      (pct
        ? `<span class="prog"><i style="--p:${pct.toFixed(3)}"></i></span>`
        : "") +
      `</a>${starBtn(v.id)}</div>` +
      `<div class="lbody"><span class="eyebrow"${p ? dLang(p) : L()}>${esc(p ? dTitle(p) : t("no_series"))}</span>` +
      `<a class="ltitle" href="${href}"${dLang(v)}>${esc(dTitle(v))}</a>` +
      `<div class="lmeta"${L()}><span>${esc(scholarOf(v))}</span><span>${esc(t("published", { d: date(v.uploadDate) }))}</span></div>` +
      `<div class="lacts"${L()}><a class="btn primary" href="${res ? lessonHref(v, ctx, "resume=1") : href}">${icon(res ? "i-resume" : "i-play")}${esc(t(res ? "resume" : "play"))}</a>` +
      (hasText(v)
        ? `<button class="icon-btn" type="button" data-langs="${esc(v.id)}" aria-label="${esc(t("langs"))}" title="${esc(t("langs"))}">${icon("i-text")}</button>`
        : "") +
      "</div></div></article>"
    );
  }
  const lvlPill = (id) =>
    levelOf(id)
      ? `<span class="pill lvl">${esc(t("lv_" + levelOf(id)))}</span>`
      : "";
  function seriesCard(p, featured) {
    const href = "#/playlist/" + encodeURIComponent(p.id);
    return (
      `<article class="scard${featured ? " framed" : ""}" data-k="${esc(p.id)}">` +
      (featured
        ? `<span class="corner a">${kh()}</span><span class="corner b">${kh()}</span>`
        : "") +
      `<a class="arch" href="${href}" tabindex="-1" aria-hidden="true">${p.cover ? imgTag(p.cover) : `<span class="bkart"><span class="bkart-t">${esc(dTitle(p))}</span><span class="bkart-a">${esc(scholarOfPl(p.id))}</span></span>`}</a>` +
      `<div class="sbody"><span class="eyebrow"${L()}>${esc(lessonsN(plCount(p.id)))} · <span class="ltr">${esc(hours(plDur.get(p.id)))}</span></span>` +
      `<a class="stitle" href="${href}"${dLang(p)}>${esc(dTitle(p))}</a>` +
      `<div class="lmeta"${L()}><span>${esc(scholarOfPl(p.id))}</span>${lvlPill(p.id)}</div>` +
      `<div class="sbar"><i style="--p:${seriesPct(p).toFixed(3)}"></i></div>` +
      `<div class="lacts"${L()}><a class="btn" href="${href}">${esc(t("open_series"))}</a></div>` +
      "</div></article>"
    );
  }
  // Empty states: the double-rule frame. Saved draws its medallion once; search wears a small divider.
  function emptyBox(msg, acts, kind) {
    const draw = kind === "saved" && !calm() && onceKey("empty-saved");
    return (
      `<div class="empty framed${kind ? " e-" + kind : ""}"${L()}><span class="corner a">${kh()}</span><span class="corner b">${kh()}</span>` +
      (kind === "saved"
        ? kh("em-kh" + (draw ? " drawing" : ""))
        : `<div class="medal sm" aria-hidden="true">${kh()}</div>`) +
      `<p>${msg}</p>` +
      (acts ? `<div class="acts">${acts}</div>` : "") +
      "</div>"
    );
  }
  const btnA = (href, label, primary) =>
    `<a class="btn small${primary ? " primary" : ""}" href="${href}">${esc(label)}</a>`;
  function secHead(title, opts) {
    const o = opts || {};
    return (
      `<div class="sec-h"><div>${o.eyebrow ? `<span class="sec-eyebrow"${L()}>${esc(o.eyebrow)}</span>` : ""}<h2${L()}>${esc(title)}</h2></div><span class="rule"></span>` +
      (o.more
        ? `<a class="more" href="${o.href}"${L()}>${esc(o.more)}</a>`
        : "") +
      (o.rail
        ? `<div class="rail-nav"><button class="icon-btn" type="button" data-rail="${o.rail}" data-dir="-1" aria-label="${esc(t("prev"))}">${icon("i-chev", "arrow back")}</button>` +
          `<button class="icon-btn" type="button" data-rail="${o.rail}" data-dir="1" aria-label="${esc(t("next"))}">${icon("i-chev")}</button></div>`
        : "") +
      "</div>" +
      (o.promise ? `<p class="sec-promise"${L()}>${esc(o.promise)}</p>` : "")
    );
  }
  // Sort: one quiet disclosure button; the choice is remembered per surface
  function sortMenu(id, opts, cur) {
    return (
      `<div class="sortd" id="${id}"><button type="button" aria-haspopup="true" aria-expanded="false"${L()}>${icon("i-sort")}<span>${esc(t("s_" + cur))}</span>${icon("i-down")}</button>` +
      `<ul role="menu" hidden${L()}><li role="none" class="menu-kh" aria-hidden="true">${kh()}</li>` +
      opts
        .map(
          (s) =>
            `<li><button type="button" role="menuitemradio" aria-checked="${s === cur}" data-sort="${s}">${esc(t("s_" + s))}${icon("i-check")}</button></li>`,
        )
        .join("") +
      "</ul></div>"
    );
  }
  function wireSort(id, onPick) {
    const box = $("#" + id),
      btn = $("button", box),
      ul = $("ul", box);
    btn.addEventListener("click", () => {
      ul.hidden = !ul.hidden;
      if (!ul.hidden && !calm() && onceKey("menu-" + id)) ul.classList.add("drawing");
      btn.setAttribute("aria-expanded", String(!ul.hidden));
      if (!ul.hidden) $('[aria-checked="true"]', ul).focus();
    });
    ul.addEventListener("click", (e) => {
      const b = e.target.closest("[data-sort]");
      if (b) onPick(b.dataset.sort);
    });
    box.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        ul.hidden = true;
        btn.setAttribute("aria-expanded", "false");
        btn.focus();
      }
    });
  }
  const pickSort = (surface, opts, q) => {
    const want = q.get("sort") || st.sort[surface];
    return opts.includes(want) ? want : opts[0];
  };
  const rememberSort = (surface, s) => {
    st.sort[surface] = s;
    store(K.sort, st.sort);
  };

  /* ---------- Router (View Transitions where available, a CSS rise otherwise) ---------- */
  let route = { name: "home", arg: "", q: new URLSearchParams() };
  function parse() {
    const h = location.hash.replace(/^#\/?/, "");
    const [path, qs] = h.split("?");
    const parts = (path || "home").split("/");
    return {
      name: parts[0] || "home",
      arg: decodeURIComponent(parts.slice(1).join("/")),
      q: new URLSearchParams(qs || ""),
    };
  }
  const VIEWS = {
    home: renderHome,
    library: renderLibrary,
    playlist: renderPlaylist,
    lesson: renderLesson,
    start: renderStart,
    saved: renderSaved,
    about: renderAbout,
    books: renderBooks,
    book: renderBook,
    admin: renderAdmin,
  };
  const REDIRECT = { mission: "#/about/mission", sheikh: "#/about/sheikh" };
  function go(hash) {
    if (location.hash === hash) render();
    else location.hash = hash;
  }
  function render(opts) {
    const prev = route;
    route = parse();
    if (REDIRECT[route.name])
      return (
        history.replaceState(null, "", REDIRECT[route.name]),
        render(opts)
      );
    if (!VIEWS[route.name])
      route = { name: "home", arg: "", q: new URLSearchParams() };
    // Admin is a gated view: anyone who is not the admin lands on Home
    // and never sees the admin page, the same rule as the nav link.
    if (route.name === "admin" && !isAdminSession())
      route = { name: "home", arg: "", q: new URLSearchParams() };
    paintAdminLink();
    if (
      prev.name === "lesson" &&
      (route.name !== "lesson" || route.arg !== prev.arg)
    )
      leaveLesson();
    $$(".view").forEach((s) =>
      s.classList.toggle("on", s.id === "v-" + route.name),
    );
    $$("#nav a").forEach((a) => {
      const on =
        a.dataset.r === route.name ||
        (a.dataset.r === "library" &&
          ["playlist", "books", "book"].includes(route.name));
      a.classList.toggle("on", on);
      if (on) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
    VIEWS[route.name](route.arg, route.q, opts || {});
    if (!(opts && opts.keepScroll)) window.scrollTo(0, 0);
  }
  let booted = false;
  function navigate() {
    const sameView = parse().name === route.name && parse().arg === route.arg;
    if (!booted || calm() || sameView) return render();
    if (document.startViewTransition)
      document.startViewTransition(() => render());
    else {
      render();
      const v = $(".view.on");
      v.classList.remove("enter");
      void v.offsetWidth;
      v.classList.add("enter");
    }
  }

  /* ---------- Home ---------- */
  const continueList = () =>
    st.recent
      .map((id) => byId.get(id))
      .filter((v) => v && canResume(v))
      .slice(0, 12);
  const DAYS = CURATION.days.map((d, i) => ({
    n: i + 1,
    k: PHASE[d.phase],
    lessons: d.ids.map((id) => byId.get(id)).filter(Boolean),
  }));
  DAYS.forEach(
    (d) => (d.sec = d.lessons.reduce((a, v) => a + (v.duration || 0), 0)),
  );
  const nextDay = () =>
    DAYS.find((d) => !st.days[d.n]) || DAYS[DAYS.length - 1];
  function dayCard(d, nextN) {
    const done = !!st.days[d.n];
    return (
      `<article class="dcard${d.n === nextN ? " next" : ""}" data-k="d${d.n}"><div class="dn"${L()}><b>${nf(d.n)}</b><span>${esc(t("p_" + d.k))}</span></div><ol>` +
      d.lessons
        .map(
          (v) =>
            `<li><a href="${lessonHref(v, seriesOf(v).id)}"${dLang(v)}>${esc(dTitle(v))}</a></li>`,
        )
        .join("") +
      `</ol><div class="dfoot"${L()}><span>${esc(count("minute", Math.round(d.sec / 60)))}</span>` +
      `<label class="tick"><input type="checkbox" data-day="${d.n}"${done ? " checked" : ""} aria-label="${esc(t("day_n", { n: nf(d.n) }) + ", " + t("done_tick"))}"><span class="box">${'<svg viewBox="0 0 24 24"><path d="M5 12.5l4.2 4.2L19 7" pathLength="100"/></svg>'}</span></label></div></article>`
    );
  }
  function firstBlock(level, withTabs) {
    const f = CURATION.first[level],
      v = byId.get(f.id);
    return (
      `<section class="first framed" id="firstBox"><span class="corner a">${kh()}</span><span class="corner b">${kh()}</span>` +
      `<div class="min"><b>${nf(Math.round(v.duration / 60))}</b><span${L()}>${esc(word("minute", Math.round(v.duration / 60)))}</span></div><div>` +
      (withTabs
        ? `<div class="lvl-tabs" role="tablist"${L()}>` +
          ["beginner", "intermediate", "advanced"]
            .map(
              (l) =>
                `<button type="button" role="tab" aria-selected="${l === level}" data-level="${l}">${esc(t("lv_" + l))}</button>`,
            )
            .join("") +
          "</div>"
        : `<span class="eyebrow"${L()}>${esc(t("st_first_tag"))}</span>`) +
      `<h2${L()}>${esc(t("st_first_t"))}</h2>` +
      `<p class="ttl"${dLang(v)}>${esc(dTitle(v))} <span class="muted ltr">(${esc(dur(v.duration))})</span></p>` +
      `<p${dLang(plById.get(f.pl))} class="muted">${esc(dTitle(plById.get(f.pl)))}</p>` +
      `<p${L()}>${esc(t("st_first_p"))}</p>` +
      `<div class="acts"${L()}><a class="btn primary" href="${lessonHref(v, f.pl)}">${icon("i-play")}${esc(t("st_watch"))}</a>` +
      (withTabs
        ? ""
        : `<a class="btn" href="#/start">${esc(t("go_start"))}</a>`) +
      "</div></div></section>"
    );
  }
  function pillarCard(k, i) {
    const pls = PLAYLISTS.filter((p) => pillarOf(p.id) === k);
    const sec = pls.reduce((a, p) => a + plDur.get(p.id), 0);
    return (
      `<a class="pcard" href="#/library?pillar=${k}"><span class="n">${i ? nf(i) : ""}</span><span class="glyph" aria-hidden="true">${GLYPH[k]}</span>` +
      `<h3${L()}>${esc(t("p_" + k))}</h3><p${L()}>${esc(count("series", pls.length))} · <span class="ltr">${esc(hours(sec))}</span></p></a>`
    );
  }
  function renderHome(_, __, opts) {
    const cont = continueList();
    const feat = FEATURED.map((id) => plById.get(id)).filter(Boolean);
    const occ = PLAYLISTS.filter((p) => pillarOf(p.id) === "occasions");
    const nd = nextDay();
    const days = DAYS.slice(Math.max(0, nd.n - 1), nd.n + 7);
    let drawn = true;
    try {
      drawn = sessionStorage.getItem("archive-v3-hero") === "1";
      sessionStorage.setItem("archive-v3-hero", "1");
    } catch (_) {}
    const ann = adminAnnouncement();
    const liveBtn = adminLiveEnabled()
      ? `<a class="btn live" href="https://www.youtube.com/@dr.moustafakamel508/live" target="_blank" rel="noopener"><span class="live-dot" aria-hidden="true"></span>${esc(t("live_watch"))}</a>`
      : "";
    $("#v-home").innerHTML =
      (ann
        ? `<div class="admin-ann" role="status"><span>${esc(ann)}</span><button type="button" id="annHide" aria-label="${esc(t("hide"))}">×</button></div>`
        : "") +
      '<div class="hero"><span class="girih" aria-hidden="true"></span><span class="girih b" aria-hidden="true"></span><div class="hero-in">' +
      kh("hero-kh" + (drawn ? "" : " drawing")) +
      `<h1${L()}>${esc(t("hero_title"))}</h1><p class="promise"${L()}>${esc(t("hero_promise"))}</p>` +
      `<form class="search" role="search" id="heroSearch">${icon("i-search")}<input type="search" name="q" dir="auto" placeholder="${esc(t("search_ph"))}" aria-label="${esc(t("search_ph"))}">` +
      `<button class="btn primary small" type="submit"${L()}>${esc(t("search_go"))}</button></form>` +
      `<div class="hero-btns"${L()}><a class="btn primary" href="#/library">${esc(t("browse"))}</a><a class="btn" href="#/start">${esc(t("go_start"))}</a>${liveBtn}</div>` +
      '</div></div><div class="wrap">' +
      (cont.length
        ? '<section class="block">' +
          secHead(t("r_continue"), {
            eyebrow: t("r_continue_e"),
            rail: cont.length > 4 ? "rc" : "",
          }) +
          '<div class="rail" id="rc">' +
          cont.map((v) => lessonCard(v)).join("") +
          "</div></section>"
        : '<section class="block">' +
          secHead(t("r_begin"), { eyebrow: t("r_begin_e") }) +
          firstBlock("beginner", false) +
          "</section>") +
      medal("home-1") +
      '<section class="block">' +
      secHead(t("r_days"), {
        eyebrow: t("r_days_e"),
        more: t("see_days"),
        href: "#/start?at=days",
        rail: "rd",
        promise: t("r_days_p"),
      }) +
      '<div class="rail" id="rd">' +
      days.map((d) => dayCard(d, nd.n)).join("") +
      "</div>" +
      `<div class="days-slot">${daysEnd()}</div>` +
      "</section>" +
      medal("home-2") +
      '<section class="block">' +
      secHead(t("r_pillars"), {
        eyebrow: t("r_pillars_e"),
        more: t("see_all"),
        href: "#/library",
        promise: t("r_pillars_p"),
      }) +
      '<div class="rail r5" id="rp">' +
      PILLARS.map((k, i) => pillarCard(k, i + 1)).join("") +
      "</div></section>" +
      medal("home-3") +
      '<section class="block">' +
      secHead(t("r_featured"), {
        eyebrow: t("r_featured_e"),
        more: t("see_all"),
        href: "#/library",
        rail: "rf",
      }) +
      '<div class="rail" id="rf">' +
      feat.map((p) => seriesCard(p, true)).join("") +
      "</div></section>" +
      medal("home-4") +
      '<section class="block">' +
      secHead(t("p_occasions"), {
        eyebrow: t("r_occ_e"),
        more: t("see_all"),
        href: "#/library?pillar=occasions",
        rail: "ro",
        promise: t("r_occ_p"),
      }) +
      '<div class="rail" id="ro">' +
      occ.map((p) => seriesCard(p)).join("") +
      "</div></section></div>";
    $("#heroSearch").addEventListener("submit", (e) => {
      e.preventDefault();
      const q = e.target.q.value.trim();
      go("#/library?scope=all" + (q ? "&q=" + encodeURIComponent(q) : ""));
    });
    const annBtn = $("#annHide");
    if (annBtn)
      annBtn.addEventListener("click", () => {
        try {
          sessionStorage.setItem("archive-v5-ann", "0");
        } catch (_) {}
        const n = $(".admin-ann");
        if (n) n.remove();
      });
    wireFirst();
    if (!opts.keepPage) enterSections($("#v-home"));
    drawLines($("#v-home"));
  }
  // The quiet terminus of the forty days: one line, one way to begin again. No badge.
  const daysEnd = () =>
    DAYS.every((d) => st.days[d.n])
      ? `<p class="days-end"${L()}><span>${esc(t("days_end"))}</span><button class="btn small" type="button" data-days-reset>${esc(t("days_again"))}</button></p>`
      : "";
  function wireFirst() {
    $$("[data-level]").forEach((b) =>
      b.addEventListener("click", () => {
        const box = $("#firstBox");
        box.outerHTML = firstBlock(b.dataset.level, true);
        wireFirst();
        const nb = $(`[data-level="${b.dataset.level}"]`);
        if (nb) nb.focus();
        if (!calm())
          $("#firstBox").animate([{ opacity: 0.4 }, { opacity: 1 }], {
            duration: 250,
            easing: "cubic-bezier(0,0,.2,1)",
          });
      }),
    );
  }

  /* ---------- Library ---------- */
  const LIB_SCOPES = [
    "series",
    "all",
    "videos",
    "streams",
    "shorts",
    "loose",
    "progress",
    "saved",
  ];
  function sortVideos(list, sort) {
    const a = list.slice(),
      col = new Intl.Collator(st.lang === "en" ? "en" : "ar", { numeric: true, sensitivity: "base" });
    if (sort === "new")
      a.sort((x, y) => (y.uploadDate || "").localeCompare(x.uploadDate || ""));
    else if (sort === "old")
      a.sort((x, y) => (x.uploadDate || "").localeCompare(y.uploadDate || ""));
    else if (sort === "long")
      a.sort((x, y) => (y.duration || 0) - (x.duration || 0));
    else if (sort === "short")
      a.sort((x, y) => (x.duration || 0) - (y.duration || 0));
    else if (sort === "az") a.sort((x, y) => col.compare(dTitle(x), dTitle(y)));
    return a;
  }
  function libVideos(scope) {
    if (scope === "videos" || scope === "streams" || scope === "shorts")
      return VIDEOS.filter((v) => (v.categories || []).includes(scope));
    if (scope === "loose") return looseVideos;
    if (scope === "progress")
      return st.recent
        .map((id) => byId.get(id))
        .filter((v) => v && canResume(v));
    if (scope === "saved")
      return Object.keys(st.fav)
        .map((id) => byId.get(id))
        .filter(Boolean);
    return VIDEOS;
  }
  const LABEL = {
    series: "lib_series",
    all: "lib_all",
    videos: "cat_videos",
    streams: "cat_streams",
    shorts: "cat_shorts",
    loose: "lib_loose",
    progress: "lib_prog",
    saved: "lib_saved",
  };
  function renderLibrary(_, q, opts) {
    const scope = LIB_SCOPES.includes(q.get("scope"))
      ? q.get("scope")
      : "series";
    const pillar =
      PILLARS.includes(q.get("pillar")) || q.get("pillar") === "occasions"
        ? q.get("pillar")
        : "";
    const counts = {
      series: PLAYLISTS.length,
      all: VIDEOS.length,
      videos: CATS.videos,
      streams: CATS.streams,
      shorts: CATS.shorts,
      loose: looseVideos.length,
      progress: libVideos("progress").length,
      saved: libVideos("saved").length,
    };
    const isSeries = scope === "series";
    const surface = isSeries ? "series" : "lessons";
    const sorts = isSeries
      ? ["az", "catalog", "most", "new"]
      : ["new", "old", "long", "short", "az"];
    let sort = pickSort(surface, sorts, q);
    const keepInput =
      opts.keepPage && $("#libSearch input")
        ? $("#libSearch input").value
        : null;
    $("#v-library").innerHTML =
      '<div class="wrap lib">' +
      `<aside class="side" aria-label="${esc(t("lib_title"))}"><div class="side-h">${kh()}<span${L()}>${esc(t("lib_title"))}</span></div>` +
      LIB_SCOPES.map(
        (s) =>
          `<a href="#/library?scope=${s}"${s === scope ? ' class="on" aria-current="true"' : ""}><span${L()}>${esc(t(LABEL[s]))}</span><b>${nf(counts[s])}</b></a>`,
      ).join("") +
      `<a href="#/books" class="side-books"><span${L()}>${esc(t("bk_nav"))}</span><b>${nf(BOOKS.length)}</b></a>` +
      "</aside>" +
      '<div class="lib-main"><div id="libBanner"></div>' +
      `<div class="lib-bar"><form class="search" role="search" id="libSearch">${icon("i-search")}<input type="search" name="q" dir="auto" value="${esc(keepInput != null ? keepInput : q.get("q") || "")}" placeholder="${esc(t("search_ph"))}" aria-label="${esc(t("search_ph"))}"></form>` +
      sortMenu("libSort", sorts, sort) +
      "</div>" +
      (isSeries
        ? `<div class="chips" role="group"${L()}><a class="chipf${pillar ? "" : " on"}" href="#/library">${esc(t("all"))}</a>` +
          PILLARS.concat("occasions")
            .map(
              (k) =>
                `<a class="chipf${pillar === k ? " on" : ""}" href="#/library?pillar=${k}"><b aria-hidden="true">${GLYPH[k]}</b>${esc(t("p_" + k))}</a>`,
            )
            .join("") +
          "</div>"
        : "") +
      '<div id="libRes"></div></div></div>';
    const input = $("#libSearch input");
    const paint = () => {
      const qq = norm(input.value);
      const res = $("#libRes");
      if (isSeries) {
        let list = PLAYLISTS.filter(
          (p) =>
            (!qq || pNorm.get(p.id).includes(qq)) &&
            (!pillar || pillarOf(p.id) === pillar),
        );
        const col = new Intl.Collator(st.lang === "en" ? "en" : "ar", {
          numeric: true,
          sensitivity: "base",
        });
        if (sort === "az")
          list = list.slice().sort((a, b) => col.compare(dTitle(a), dTitle(b)));
        if (sort === "most")
          list = list.slice().sort((a, b) => plCount(b.id) - plCount(a.id));
        if (sort === "new") {
          const last = (p) =>
            plItems
              .get(p.id)
              .reduce(
                (m, v) => ((v.uploadDate || "") > m ? v.uploadDate : m),
                "",
              );
          list = list.slice().sort((a, b) => last(b).localeCompare(last(a)));
        }
        const hits = qq
          ? VIDEOS.filter((v) => vNorm.get(v.id).includes(qq)).length
          : 0;
        const lessonsHref =
          "#/library?scope=all&q=" + encodeURIComponent(input.value.trim());
        const head =
          `<div class="lib-h"><h1${L()}>${esc(qq ? t("search_h") : pillar ? t("p_" + pillar) : t("lib_series"))}</h1>${list.length ? `<span class="muted cnt"${L()}>${esc(count("result", list.length))}</span>` : ""}</div>` +
          (qq && hits && list.length
            ? `<p class="scope"${L()}>${esc(t("match_lessons", { n: nf(hits) }))} <a class="link" href="${lessonsHref}">${esc(t("show_lessons"))}</a></p>`
            : "");
        // default view: grouped by pillar in the classical order, occasions last
        const grouped = sort === "catalog" && !qq;
        const groups = grouped
          ? PILLARS.concat("occasions").filter((k) => !pillar || k === pillar)
          : [null];
        // Series cards render through the shared chunked renderer (item 10):
        // each pillar grid starts as an empty placeholder and is mounted
        // after the flip, sharing one first-paint budget of 100 cards.
        const groupData = groups
          .map((k) => ({
            k,
            ls: k ? list.filter((p) => pillarOf(p.id) === k) : list,
          }))
          .filter((g) => g.ls.length);
        // no series but matching lessons: say exactly that, and make the lessons the primary way on
        const body = !list.length
          ? hits
            ? emptyBox(
                esc(t("none_series")) +
                  "<br>" +
                  esc(t("match_lessons", { n: nf(hits) })),
                btnA(lessonsHref, t("show_lessons_btn"), true) +
                  btnA("#/library", t("browse")),
                "search",
              )
            : emptyBox(
                esc(t("nothing")),
                btnA(
                  "#/library" + (pillar ? "?pillar=" + pillar : ""),
                  t("clear"),
                  true,
                ) + btnA("#/library", t("browse")),
                "search",
              )
          : groupData
              .map((g) => {
                return (
                  '<section class="pgroup">' +
                  (g.k && !pillar
                    ? `<div class="pgroup-h"><span class="glyph" aria-hidden="true">${GLYPH[g.k]}</span><div><h2${L()}>${esc(t("p_" + g.k))}</h2><p${L()}>${esc(t("d_" + g.k))}</p></div><span class="rule"></span></div>`
                    : "") +
                  '<div class="grid"></div></section>'
                );
              })
              .join("");
        flip(res, () => (res.innerHTML = head + body));
        if (list.length) {
          let budget = 100;
          $$(".pgroup .grid", res).forEach((grid, gi) => {
            mountList(grid, groupData[gi].ls, (p) => seriesCard(p), budget);
            budget = Math.max(0, budget - grid.children.length);
          });
        }
      } else {
        const list = sortVideos(
          libVideos(scope).filter((v) => !qq || vNorm.get(v.id).includes(qq)),
          sort,
        );
        if (!$(".grid", res))
          res.innerHTML =
            '<div class="lib-h"></div><div class="grid" id="libGrid"></div>';
        $(".lib-h", res).innerHTML =
          `<h1${L()}>${esc(qq ? t("search_h") : t(LABEL[scope]))}</h1><span class="muted cnt"${L()}>${esc(count("result", list.length))}</span>`;
        const grid = $("#libGrid");
        if (!list.length) {
          if (grid._stop) grid._stop();
          grid.innerHTML =
            '<div style="grid-column:1/-1">' +
            emptyBox(
              esc(t("nothing")),
              btnA("#/library?scope=" + scope, t("clear"), true) +
                btnA("#/library", t("browse")),
              "search",
            ) +
            "</div>";
        } else mountList(grid, list, (v) => lessonCard(v));
      }
    };
    paint();
    paintBanner();
    let timer;
    const commit = () => {
      paint();
      sync();
      if (calm()) return;
      $("#libSearch svg").animate(
        [{ transform: "scale(1)" }, { transform: "scale(1.15)" }, { transform: "scale(1)" }],
        { duration: 240, easing: "cubic-bezier(.4,0,.2,1)" },
      );
      const c = $("#libRes .cnt");
      if (c) c.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, easing: "cubic-bezier(0,0,.2,1)" });
    };
    const sync = () => {
      const p = new URLSearchParams({ scope });
      if (pillar) p.set("pillar", pillar);
      if (input.value.trim()) p.set("q", input.value.trim());
      if (q.get("sort")) p.set("sort", sort);
      history.replaceState(null, "", "#/library?" + p.toString());
      route.q = p;
    };
    input.addEventListener("input", () => {
      clearTimeout(timer);
      timer = setTimeout(commit, 200);
    });
    $("#libSearch").addEventListener("submit", (e) => {
      e.preventDefault();
      clearTimeout(timer);
      commit();
    });
    const onSort = (s) => {
      rememberSort(surface, s);
      sort = s;
      $("#libSort").outerHTML = sortMenu("libSort", sorts, sort);
      wireSort("libSort", onSort);
      paint();
    };
    wireSort("libSort", onSort);
  }

  // A missing videos folder is said once, calmly, on the Library page; never lesson by lesson.
  function paintBanner() {
    const box = $("#libBanner");
    let hidden = false;
    try {
      hidden = sessionStorage.getItem("archive-v4-banner") === "0";
    } catch (_) {}
    if (!box || hidden || !status || status.videos_exists !== false)
      return box && (box.innerHTML = "");
    box.innerHTML =
      `<div class="banner"${L()}>${kh()}<div><b>${esc(t("nofolder_t"))}</b><p>${esc(t("nofolder_p"))}</p></div>` +
      `<button class="link" type="button" id="bannerHide">${esc(t("hide"))}</button></div>`;
    $("#bannerHide").addEventListener("click", () => {
      try {
        sessionStorage.setItem("archive-v4-banner", "0");
      } catch (_) {}
      box.innerHTML = "";
    });
  }

  /* ---------- Playlist ---------- */
  function renderPlaylist(id, q, opts) {
    const p = plById.get(id);
    if (!p) return go("#/library");
    const items = plItems.get(p.id);
    const firstResume = items.find((v) => canResume(v));
    const sorts = ["order", "new", "old", "long", "short", "az"];
    let sort = pickSort("playlist", sorts, q);
    let inSeries = q.get("in") === "1";
    const first = earliest(p);
    $("#v-playlist").innerHTML =
      `<div class="wrap${opts.keepPage ? "" : " intro"}"><div class="pl-band" aria-hidden="true"></div>` +
      `<nav class="crumb"${L()}><a href="#/library">${esc(t("back_lib"))}</a>${icon("i-chev", "arrow fwd")}<span${dLang(p)}>${esc(dTitle(p))}</span></nav>` +
      `<header class="ph"><div class="cover framed scard" id="phCover"><span class="corner a">${kh()}</span><span class="corner b">${kh()}</span><span class="arch">${p.cover ? imgTag(p.cover) : `<span class="bkart"><span class="bkart-t">${esc(dTitle(p))}</span><span class="bkart-a">${esc(scholarOfPl(p.id))}</span></span>`}</span></div>` +
      `<div>${kh("ph-kh")}<span class="eyebrow"${L()}>${esc(notSheikh(p.id) ? scholarOfPl(p.id) : t("sheikh_full"))}</span><h1${dLang(p)}>${esc(dTitle(p))}</h1>${arSub(p)}` +
      `<div class="facts"${L()}><span class="pill">${esc(t("p_" + pillarOf(p.id)))}</span>${lvlPill(p.id)}<span class="pill">${esc(lessonsN(items.length))}</span><span class="pill">${esc(t("pl_hours", { h: hours(plDur.get(p.id)) }))}</span></div>` +
      `<div class="acts"${L()}>` +
      (firstResume
        ? `<a class="btn primary" href="${lessonHref(firstResume, p.id, "resume=1")}">${icon("i-resume")}${esc(t("pl_resume"))}</a>` +
          (first
            ? `<a class="btn" href="${lessonHref(first, p.id)}">${esc(t("pl_start"))}</a>`
            : "")
        : first
          ? `<a class="btn primary" href="${lessonHref(first, p.id)}">${icon("i-play")}${esc(t("pl_start"))}</a>`
          : "") +
      "</div>" +
      `<div class="sbar" style="max-width:360px;margin-top:16px"><i style="--p:${seriesPct(p).toFixed(3)}"></i></div></div></header>` +
      `<div class="lib-bar"><form class="search" role="search" id="plSearch">${icon("i-search")}<input type="search" name="q" dir="auto" value="${esc(q.get("q") || "")}" placeholder="${esc(t("search_ph"))}" aria-label="${esc(t("search_ph"))}"></form>` +
      sortMenu("plSort", sorts, sort) +
      `</div><p class="scope" id="plScope"${L()}></p><div class="grid" id="plGrid"></div></div>`;
    const input = $("#plSearch input");
    const scopeLine = () => {
      $("#plScope").innerHTML =
        `<span>${esc(t(inSeries ? "scope_pl" : "scope_lib"))}</span><button class="link" type="button" id="plScopeBtn">${esc(t(inSeries ? "scope_to_lib" : "scope_to_pl"))}</button>`;
      $("#plScopeBtn").addEventListener("click", () => {
        inSeries = !inSeries;
        scopeLine();
        paint();
        input.focus();
      });
    };
    const paint = () => {
      const qq = inSeries ? norm(input.value) : "";
      const hit = items.filter((v) => !qq || vNorm.get(v.id).includes(qq));
      const list = sort === "order" ? hit : sortVideos(hit, sort);
      const grid = $("#plGrid");
      if (list.length) mountList(grid, list, (v) => lessonCard(v, p.id));
      else {
        if (grid._stop) grid._stop();
        grid.innerHTML =
          '<div style="grid-column:1/-1">' +
          emptyBox(
            esc(t("nothing")),
            btnA(`#/playlist/${encodeURIComponent(p.id)}?in=1`, t("clear"), true) +
              btnA("#/library", t("browse")),
            "search",
          ) +
          "</div>";
      }
    };
    scopeLine();
    paint();
    let timer;
    input.addEventListener("input", () => {
      if (!inSeries) return;
      clearTimeout(timer);
      timer = setTimeout(paint, 200);
    });
    $("#plSearch").addEventListener("submit", (e) => {
      e.preventDefault();
      const v = input.value.trim();
      if (inSeries) return paint();
      go("#/library?scope=all" + (v ? "&q=" + encodeURIComponent(v) : ""));
    });
    const onSort = (s) => {
      rememberSort("playlist", s);
      sort = s;
      $("#plSort").outerHTML = sortMenu("plSort", sorts, sort);
      wireSort("plSort", onSort);
      paint();
    };
    wireSort("plSort", onSort);
  }

  /* ---------- Captions and transcripts (fetched on demand, small persisted cache) ---------- */
  const capCache = new Map();
  function subFor(v, lang) {
    const subs = (v.subtitles || []).filter((s) => s && s.lang === lang);
    return subs.find((s) => !/-orig\./.test(s.src || "")) || subs[0] || null;
  }
  function parseVtt(raw) {
    const re =
      /^\s*((?:\d+:)?\d{2}:\d{2}\.\d{3})\s+-->\s+((?:\d+:)?\d{2}:\d{2}\.\d{3})/;
    const sec = (s) => s.split(":").reduce((a, x) => a * 60 + parseFloat(x), 0);
    const lines = String(raw || "")
        .replace(/^﻿/, "")
        .replace(/\r/g, "")
        .split("\n"),
      cues = [];
    for (let i = 0; i < lines.length; i++) {
      const m = lines[i].match(re);
      if (!m) continue;
      const txt = [];
      let j = i + 1;
      while (j < lines.length && lines[j].trim() && !re.test(lines[j]))
        txt.push(lines[j++]);
      const box = document.createElement("textarea");
      box.innerHTML = txt
        .join(" ")
        .replace(/<[^>]*>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      if (box.value) cues.push({ a: sec(m[1]), b: sec(m[2]), x: box.value });
      i = j - 1;
    }
    return cues;
  }
  async function getCaptions(src) {
    if (capCache.has(src)) return capCache.get(src);
    const r = await fetch(src);
    if (!r.ok) throw new Error(r.status);
    const cues = parseVtt(await r.text());
    capCache.set(src, cues);
    while (capCache.size > 4) capCache.delete(capCache.keys().next().value);
    return cues;
  }
  async function getText(src) {
    const cache = load(K.tx, { order: [], items: {} });
    if (cache.items[src] != null) {
      cache.order = [src].concat(cache.order.filter((x) => x !== src));
      store(K.tx, cache);
      return cache.items[src];
    }
    const r = await fetch(src);
    if (!r.ok) throw new Error(r.status);
    const txt = await r.text();
    if (txt.length < 250000) {
      // keep the persisted cache small: at most 6 texts
      cache.items[src] = txt;
      cache.order = [src].concat(cache.order.filter((x) => x !== src));
      while (cache.order.length > 6) delete cache.items[cache.order.pop()];
      store(K.tx, cache);
    }
    return txt;
  }
  // transcript lines: one per spoken cue, rolling duplicates from auto captions dropped
  function txLines(cues) {
    const out = [];
    for (const c of cues) {
      const prev = out[out.length - 1];
      if (prev && (prev.x === c.x || prev.x.endsWith(c.x))) {
        prev.b = c.b;
        continue;
      }
      out.push({ a: c.a, b: c.b, x: c.x });
    }
    return out;
  }
  function cueAt(cues, now) {
    let lo = 0,
      hi = cues.length - 1,
      best = -1;
    while (lo <= hi) {
      const m = (lo + hi) >> 1;
      if (cues[m].a <= now) {
        best = m;
        lo = m + 1;
      } else hi = m - 1;
    }
    return best;
  }

  /* ---------- Lesson / player ---------- */
  let cur = null; // { v, video, cues, capLang, lastSave, tx }
  function saveProgress() {
    if (!cur || !cur.video) return;
    const tm = Math.floor(cur.video.currentTime || 0);
    if (tm > 5) {
      st.prog[cur.v.id] = tm;
      store(K.prog, st.prog);
    }
  }
  function leaveLesson() {
    if (!cur) return;
    saveProgress();
    try {
      cur.video.pause();
      cur.video.removeAttribute("src");
      cur.video.load();
    } catch (_) {}
    cur = null;
  }
  function markRecent(id) {
    st.recent = [id].concat(st.recent.filter((x) => x !== id)).slice(0, 40);
    store(K.recent, st.recent);
  }
  function renderLesson(id, q, opts) {
    const v = byId.get(id);
    if (!v) return go("#/library?scope=all");
    const ctx =
      q.get("pl") && v.playlistIds.includes(q.get("pl"))
        ? q.get("pl")
        : v.playlistIds[0];
    const p = ctx ? plById.get(ctx) : null;
    const keep = opts.keepStage && cur && cur.v.id === id;
    if (!keep) {
      // the player frame draws itself once per session, then stays still for the whole lesson
      const drawFrame = !calm() && onceKey("player-frame");
      $("#v-lesson").innerHTML =
        `<div class="wrap ls${opts.keepPage ? "" : " intro"}"><div class="ls-main">` +
        `<div class="pframe${drawFrame ? " drawing" : ""}" id="pframe"><svg class="pf-line" aria-hidden="true"><rect pathLength="100" rx="17"/></svg><span class="corner a">${kh()}</span><span class="corner b">${kh()}</span>` +
        `<div class="stage" dir="ltr"><video id="vid" controls playsinline preload="metadata"></video><iframe id="ytFrame" title="${esc(t("pb_yt"))}" style="display:none" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe><div class="cap" id="cap" hidden></div><div class="buf" id="buf" aria-hidden="true">${kh()}</div>` +
        `<div class="stage-empty" id="stageEmpty" role="alert">${kh("se-kh")}<div class="se-msg" id="stageMsg"></div></div></div></div>` +
        '<div class="notice" id="notice" role="status" hidden></div><div id="lsInfo"></div><div class="panel tx" id="txPanel" hidden></div></div><aside id="lsSide"></aside></div>';
      const video = $("#vid");
      const ytFrame = $("#ytFrame");
      cur = {
        v,
        video,
        ytFrame,
        cues: [],
        capLang: "",
        lastSave: 0,
        tx: null,
        txLang: q.get("tx") || "",
        mode: "local",
      };
      markRecent(v.id);
      const buf = $("#buf");
      video.addEventListener("waiting", () => buf.classList.add("on"));
      ["playing", "canplay", "pause", "error"].forEach((ev) =>
        video.addEventListener(ev, () => buf.classList.remove("on")),
      );
      video.addEventListener("play", () => Rec.stop());
      video.addEventListener("timeupdate", () => {
        paintCap();
        syncTx();
        const now = Date.now();
        if (now - cur.lastSave > 4000) {
          cur.lastSave = now;
          saveProgress();
        }
      });
      video.addEventListener("seeked", () => {
        paintCap();
        syncTx(true);
      });
      video.addEventListener("pause", saveProgress);
      video.addEventListener("ended", () => setDone(v.id, true));
      video.addEventListener("error", () => {
        // the dead player is never shown: the designed empty state takes the player's place at once
        $("#pframe").classList.add("err");
        probeError(v, p);
      });
      const from = q.get("resume") ? progOf(v.id) : 0;
      if (from > 5)
        video.addEventListener(
          "loadedmetadata",
          () => {
            if (!video.duration || from < video.duration - 2)
              video.currentTime = from;
          },
          { once: true },
        );
      if (!HOSTED) video.src = v.media;
      const cc = q.get("cc");
      if (!HOSTED && (cc === "ar" || cc === "en")) setCaptions(cc);
      Rec.stop();
      if (HOSTED) setPlayMode("yt");
      else {
        cur.mode = "local";
        const pr = video.play();
        if (pr && pr.catch) pr.catch(() => {});
      }
    }
    const items = p ? plItems.get(p.id) : [];
    const idx = items.findIndex((x) => x.id === v.id);
    const prev = idx > 0 ? items[idx - 1] : null,
      next = idx >= 0 && idx < items.length - 1 ? items[idx + 1] : null;
    const lk = (x) => lessonHref(x, p && p.id);
    const capBtn = (lang) => {
      if (HOSTED) return "";
      const s = subFor(v, lang);
      return s && s.src
        ? `<button class="btn small" type="button" data-cap="${lang}" aria-pressed="${cur.capLang === lang}">${esc(t("cap_" + lang))}</button>`
        : "";
    };
    $("#lsInfo").innerHTML =
      `<h1${dLang(v)}>${esc(dTitle(v))}</h1>${arSub(v)}<div class="ls-meta"${L()}>` +
      (p
        ? `<a class="pill" href="#/playlist/${encodeURIComponent(p.id)}"${dLang(p)}>${esc(dTitle(p))}</a>`
        : `<span class="pill">${esc(t("no_series"))}</span>`) +
      `<span class="pill">${esc(scholarOf(v))}</span><span class="pill ltr">${esc(dur(v.duration))}</span><span class="pill">${esc(t("published", { d: date(v.uploadDate) }))}</span></div>` +
      `<div class="ls-acts"${L()}>${starBtn(v.id, "lg")}${doneBtn(v.id)}` +
      (canResume(v) && !q.get("resume")
        ? `<button class="btn small" type="button" id="lsResume">${icon("i-resume")}${esc(t("ls_resume_at", { t: dur(progOf(v.id)) }))}</button>`
        : "") +
      `<button class="btn" type="button" data-mode="yt" aria-pressed="${cur.mode === "yt"}">${esc(t("pb_yt"))}</button>` +
      (HOSTED
        ? ""
        : `<button class="btn" type="button" data-mode="hosted" aria-pressed="${cur.mode === "hosted"}">${esc(t("pb_hosted"))}</button>`) +
      `<button class="btn" type="button" id="lsFull">⛶ ${esc(t("pb_full"))}</button>` +
      (HOSTED
        ? `<span class="muted">${esc(t("pb_local_no"))}</span>`
        : `<button class="btn" type="button" data-mode="local" aria-pressed="${cur.mode === "local"}">${esc(t("pb_local"))}</button>`) +
      `<span id="capWrap">${capBtn("ar")}${capBtn("en")}</span>` +
      "</div>" +
      (prev || next
        ? `<div class="nextprev"${L()}>` +
          (prev
            ? `<a class="framed" href="${lk(prev)}">${corners()}${icon("i-chev", "arrow back")}<span class="t"><small>${esc(t("ls_prev"))}</small><span${dLang(prev)}>${esc(dTitle(prev))}</span></span></a>`
            : "") +
          (next
            ? `<a class="framed" href="${lk(next)}">${corners()}<span class="t"><small>${esc(t("ls_next"))}</small><span${dLang(next)}>${esc(dTitle(next))}</span></span>${icon("i-chev", "arrow fwd")}</a>`
            : "") +
          "</div>"
        : "");
    const fullBtn = $("#lsFull");
    if (fullBtn)
      fullBtn.addEventListener("click", () => {
        const el = $("#pframe");
        if (!el) return;
        if (document.fullscreenElement) document.exitFullscreen();
        else if (el.requestFullscreen) el.requestFullscreen();
        else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
      });
    // series list: a window around the current lesson keeps very long series light
    const lo = Math.max(0, idx - 20),
      hi = Math.min(items.length, Math.max(idx, 0) + 40);
    $("#lsSide").innerHTML = p
      ? `<div class="panel"><h2${L()}>${esc(t("ls_series"))}</h2><div class="ulist">` +
        items
          .slice(lo, hi)
          .map(
            (x) =>
              `<a href="${lk(x)}"${x.id === v.id ? ' class="cur" aria-current="true"' : ""}>` +
              `<span class="thumb${x.thumbnail ? "" : " noimg"}">${imgTag(x.thumbnail)}</span><span class="tt"${dLang(x)}>${esc(dTitle(x))}</span></a>`,
          )
          .join("") +
        `</div><div style="margin-top:12px"${L()}><a class="btn small" href="#/playlist/${encodeURIComponent(p.id)}">${esc(t("ls_all_series"))}</a></div></div>`
      : "";
    const curRow = $("#lsSide .cur");
    if (curRow) curRow.parentNode.scrollTop = curRow.offsetTop - 80;
    const rb = $("#lsResume");
    if (rb)
      rb.addEventListener("click", () => {
        cur.video.currentTime = progOf(v.id);
        cur.video.play().catch(() => {});
        rb.remove();
      });
    showTranscript(v, keep && cur.tx ? cur.tx.lang : cur.txLang);
  }
  const corners = () =>
    `<span class="corner a">${kh()}</span><span class="corner b">${kh()}</span>`;
  // Manual "mark as watched", for lessons finished elsewhere or closed near the end.
  const doneBtn = (id) =>
    `<button class="btn small watch" type="button" data-done="${esc(id)}" aria-pressed="${!!st.done[id]}"><span class="ck">${CHECK}</span><span>${esc(t(st.done[id] ? "marked_done" : "mark_done"))}</span></button>`;
  function setDone(id, on) {
    if (on) {
      st.done[id] = 1;
      delete st.prog[id];
    } else delete st.done[id];
    store(K.done, st.done);
    store(K.prog, st.prog);
    $$('[data-done="' + CSS.escape(id) + '"]').forEach(
      (b) => (b.outerHTML = doneBtn(id)),
    );
    const rb = $("#lsResume");
    if (on && rb) rb.remove();
  }
  function paintCap() {
    const box = $("#cap");
    if (!box || !cur || cur.mode === "yt") return;
    const now = cur.video.currentTime || 0;
    const i = cueAt(cur.cues, now);
    const c = i >= 0 ? cur.cues[i] : null;
    if (cur.capLang && c && now < c.b) {
      box.textContent = c.x;
      box.lang = cur.capLang;
      box.dir = cur.capLang === "ar" ? "rtl" : "ltr";
      box.hidden = false;
    } else box.hidden = true;
  }
  async function setCaptions(lang) {
    if (!cur) return;
    cur.capLang = cur.capLang === lang ? "" : lang;
    cur.cues = [];
    $$("[data-cap]").forEach((b) =>
      b.setAttribute("aria-pressed", String(b.dataset.cap === cur.capLang)),
    );
    paintCap();
    if (!cur.capLang) return;
    const s = subFor(cur.v, lang),
      want = cur.capLang,
      vid = cur.v.id;
    try {
      const cues = await getCaptions(s.src);
      if (cur && cur.v.id === vid && cur.capLang === want) {
        cur.cues = cues;
        paintCap();
      }
    } catch (_) {
      showNotice(`<p${L()}>${esc(t("cap_fail"))}</p>`);
    }
  }
  // The in-page text. Timed captions become tappable lines that follow the lesson; plain text otherwise.
  async function showTranscript(v, want) {
    const box = $("#txPanel");
    if (!box || !cur) return;
    const langs = ["ar", "en"].filter((l) => {
      const s = subFor(v, l);
      return s && (s.src || s.readSrc);
    });
    if (!langs.length) return (box.hidden = true);
    const lang = langs.includes(want)
      ? want
      : langs.includes(st.lang)
        ? st.lang
        : langs[0];
    const s = subFor(v, lang);
    box.hidden = false;
    box.innerHTML =
      `<div class="tx-orn" aria-hidden="true">${kh()}</div><div class="tx-h"${L()}><h2>${esc(t("tx_title"))}</h2>` +
      (langs.length > 1
        ? '<div class="tx-tabs">' +
          langs
            .map(
              (l) =>
                `<button class="btn small" type="button" data-tx="${l}" aria-pressed="${l === lang}">${esc(t("lang_" + l))}</button>`,
            )
            .join("") +
          "</div>"
        : "") +
      `</div><p class="tx-hint" id="txHint"${L()} hidden>${esc(t("tx_hint"))}</p>` +
      `<div class="tx-body" id="txBody" lang="${lang}" dir="${lang === "ar" ? "rtl" : "ltr"}"><span${L()}>${esc(t("tx_loading"))}</span></div>`;
    const vid = v.id;
    cur.tx = { lang, lines: [], idx: -1, quiet: 0 };
    const body = $("#txBody");
    const hush = () => cur && cur.tx && (cur.tx.quiet = Date.now());
    body.addEventListener("wheel", hush, { passive: true });
    body.addEventListener("touchmove", hush, { passive: true });
    body.addEventListener("pointerdown", hush, { passive: true });
    let lines = null;
    if (s.src) {
      try {
        lines = txLines(await getCaptions(s.src));
      } catch (_) {}
    }
    if (!cur || cur.v.id !== vid || cur.tx.lang !== lang) return;
    if (lines && lines.length) {
      cur.tx.lines = lines;
      body.innerHTML = lines
        .map(
          (c, i) =>
            `<button class="tx-line" type="button" data-cue="${i}"><span class="ts">${dur(c.a)}</span>${esc(c.x)}</button>`,
        )
        .join("") + '<i class="tx-bar" aria-hidden="true"></i>';
      $("#txHint").hidden = false;
      syncTx(true);
      return;
    }
    try {
      const txt = await getText(s.readSrc);
      if (cur && cur.v.id === vid && cur.tx.lang === lang) {
        body.classList.add("plain");
        body.textContent = txt;
      }
    } catch (_) {
      // No text file ships with the hosted preview: hide the panel instead
      // of leaving an error on the page. The installed app shows its text.
      if (cur && cur.v.id === vid) box.hidden = true;
    }
  }
  function syncTx(force) {
    if (!cur || cur.mode === "yt" || !cur.tx || !cur.tx.lines.length) return;
    const i = cueAt(cur.tx.lines, (cur.video.currentTime || 0) + 0.05);
    if (i === cur.tx.idx && !force) return;
    const body = $("#txBody");
    if (!body) return;
    const old = body.querySelector(".now");
    if (old) old.classList.remove("now");
    cur.tx.idx = i;
    if (i < 0) return;
    const el = body.children[i];
    el.classList.add("now");
    // "The Golden Thread": one gold edge bar glides from line to line (jumps under calm)
    const bar = $(".tx-bar", body);
    bar.style.transform = `translateY(${el.offsetTop}px)`;
    bar.style.height = el.offsetHeight + "px";
    if (!bar.classList.contains("on")) requestAnimationFrame(() => bar.classList.add("on"));
    if (Date.now() - cur.tx.quiet > 5000)
      body.scrollTo({
        top: el.offsetTop - body.clientHeight * 0.35,
        behavior: calm() ? "auto" : "smooth",
      });
  }
  function showError(html) {
    const m = $("#stageMsg");
    if (!m) return;
    $("#pframe").classList.add("err");
    m.innerHTML = html;
  }
  function showNotice(html) {
    const n = $("#notice");
    if (!n) return;
    n.innerHTML = html;
    n.hidden = false;
  }
  // On a playback error, ask the server whether the file exists before blaming the format.
  async function probeError(v, p) {
    let code = 0;
    try {
      code = (await fetch(v.media, { method: "HEAD", cache: "no-store" }))
        .status;
    } catch (_) {}
    if (!cur || cur.v.id !== v.id) return;
    if (code === 404) {
      let folder = null;
      try {
        folder = await (await fetch("__status", { cache: "no-store" })).json();
      } catch (_) {}
      let rel = v.media;
      try {
        rel = decodeURIComponent(v.media);
      } catch (_) {}
      showError(
        `<p${L()}><b>${esc(t("err_404"))}</b></p>` +
          `<div class="acts"${L()}><a class="btn small" href="${p ? "#/playlist/" + encodeURIComponent(p.id) : "#/library"}">${esc(t(p ? "back_series" : "back_lib"))}</a></div>` +
          `<details${L()}><summary>${esc(t("err_details"))}</summary><p style="margin-top:8px">${esc(t("err_where"))}</p><code>${esc(rel)}</code>` +
          (folder && folder.videos_exists === false
            ? `<p style="margin-top:8px">${esc(t("err_nofolder"))}</p>`
            : "") +
          "</details>",
      );
      const wrap = $("#lsInfo");
      const b = wrap && wrap.querySelector('[data-mode="local"]');
      if (b) {
        const s = document.createElement("span");
        s.className = "muted";
        s.textContent = t("pb_local_no");
        b.replaceWith(s);
      }
      // Item 3: a confirmed missing file keeps the calm error treatment;
      // YouTube becomes the primary ACTION (its button stays in the action
      // area), never an auto-switch. No auto-opening YouTube on local error.
    } else {
      showError(
        `<p${L()}><b>${esc(t("err_format"))}</b></p><div class="acts"${L()}><a class="btn small" href="${esc(v.media)}" target="_blank" rel="noopener">${esc(t("open_file"))}</a></div>`,
      );
    }
  }

  // Extract the 11-char YouTube ID from a media path (e.g. "[V1nx_qy87FM].mkv").
  function ytIdOf(p) {
    const raw = String(p || "");
    let s = "";
    try {
      s = decodeURIComponent(raw);
    } catch (_) {
      s = raw;
    }
    const m = s.match(/\[([A-Za-z0-9_-]{11})\]/);
    return m ? m[1] : "";
  }

  // Dual playback (items 3+13). Local first when the file exists; YouTube
  // plays inside the same tab. Activating YouTube pauses the local file,
  // saves its position, and stops the recitation.
  function setPlayMode(mode) {
    if (!cur) return;
    cur.mode = mode;
    const video = cur.video;
    const frameEl = cur.ytFrame || $("#ytFrame");
    const capWrap = $("#capWrap");
    if (!video || !frameEl) return;
    if (mode === "yt") {
      video.pause();
      saveProgress();
      Rec.stop();
      const id = ytIdOf(cur.v.media);
      if (!id) {
        showNotice(`<p>${esc(t("pb_yt_no"))}</p>`);
        return;
      }
      $("#pframe").classList.remove("err");
      frameEl.src =
        "https://www.youtube-nocookie.com/embed/" +
        id +
        "?rel=0&autoplay=1"; // network-guard: youtube-playback
      frameEl.style.display = "block";
      video.style.display = "none";
      if (capWrap) capWrap.style.display = "none";
    } else if (mode === "hosted") {
      video.pause();
      saveProgress();
      Rec.stop();
      showNotice(`<p>${esc(t("pb_hosted_no"))}</p>`);
      if (capWrap) capWrap.style.display = "none";
    } else {
      frameEl.src = "";
      frameEl.style.display = "none";
      video.style.display = "";
      if (capWrap) capWrap.style.display = "";
      const pr = video.play();
      if (pr && pr.catch) pr.catch(() => {});
    }
    $$('[data-mode]').forEach((b) =>
      b.setAttribute("aria-pressed", String(b.dataset.mode === mode)),
    );
  }

  /* ---------- Languages & Text dialog (offered only when the lesson has them) ---------- */
  function openLangs(id) {
    const v = byId.get(id);
    if (!v) return;
    const dlg = $("#dlg");
    $("#dlgTitle").textContent = t("langs");
    $("#dlgTitle").setAttribute("lang", st.lang);
    $("#dlgTitle").setAttribute("dir", st.lang === "ar" ? "rtl" : "ltr");
    const rows = ["ar", "en"]
      .map((lang) => {
        const s = subFor(v, lang);
        if (!s || !(s.src || s.readSrc)) return "";
        return (
          `<div class="dlg-row"${L()}><b>${esc(t("lang_" + lang))}</b><div class="btns">` +
          (s.src
            ? `<a class="btn small" href="${lessonHref(v, "", "cc=" + lang)}">${esc(t("dlg_captions"))}</a>`
            : "") +
          `<a class="btn small" href="${lessonHref(v, "", "tx=" + lang)}">${icon("i-text")}${esc(t("dlg_read"))}</a></div></div>`
        );
      })
      .join("");
    $("#dlgBody").innerHTML =
      `<p${dLang(v)} style="font-weight:500">${esc(dTitle(v))}</p>` + rows;
    $$("a", dlg).forEach((a) => a.addEventListener("click", () => dlg.close()));
    if (!dlg.open) dlg.showModal();
  }

  /* ---------- Where to Start ---------- */
  function renderStart(_, q) {
    const stepTime = (s) => s.pl.reduce((a, id) => a + (plDur.get(id) || 0), 0);
    const stepCount = (s) => s.pl.reduce((a, id) => a + plCount(id), 0);
    const doneDays = DAYS.filter((d) => st.days[d.n]).length;
    const nd = nextDay();
    const qs = [
      ["a", 0],
      ["b", 3],
      ["c", 5],
    ];
    $("#v-start").innerHTML =
      '<div class="page">' +
      `<header class="page-h">${kh()}<span class="eyebrow"${L()}>${esc(t("st_kicker"))}</span><h1${L()}>${esc(t("st_title"))}</h1><p${L()}>${esc(t("st_lede"))}</p></header>` +
      firstBlock("beginner", true) +
      secHead(t("st_q_t"), { promise: t("st_q_p") }) +
      '<div class="cards3">' +
      qs
        .map(([k, si]) => {
          const s = PATH[si],
            f = plById.get(s.pl[0]);
          return (
            `<a class="card" href="#step-${si + 1}" data-step="${si + 1}"><span class="q" aria-hidden="true">${GLYPH[s.k]}</span><h3${L()}>${esc(t("q_" + k + "_t"))}</h3><p${L()}>${esc(t("q_" + k + "_p"))}</p>` +
            `<div class="foot"><span class="pill lvl" style="align-self:flex-start"${L()}>${esc(t("sort_from", { n: nf(si + 1) }))}</span>` +
            `<p${L()}>${esc(t("sort_first"))} <span${dLang(f)}>${esc(dTitle(f))}</span></p><p class="muted"${L()}>${esc(t("sort_time", { h: hours(stepTime(s)) }))}</p></div></a>`
          );
        })
        .join("") +
      "</div>" +
      medal("st-1") +
      secHead(t("st_path_t"), { promise: t("st_path_p") }) +
      '<ol class="steps">' +
      PATH.map((s, i) => {
        const done = !!st.path[s.k];
        return (
          `<li class="step${done ? " done" : ""}" id="step-${i + 1}"><span class="num" aria-hidden="true">${kh()}<b>${nf(i + 1)}</b></span><div>` +
          `<h3${L()}>${esc(t("p_" + s.k))}</h3>` +
          `<div class="pills"${L()}>${[...new Set(s.pl.map(levelOf))].map((l) => `<span class="pill lvl">${esc(t("lv_" + l))}</span>`).join("")}</div>` +
          `<p${L()}>${esc(t("d_" + s.k))}</p>` +
          `<p${L()} style="margin-top:6px"><b>${esc(t("pre_label"))}</b> ${esc(t("pre_" + (i + 1)))}</p>` +
          `<ul class="sr-list"${L()}>` +
          s.pl
            .map((id) => plById.get(id))
            .map(
              (p) =>
                `<li><a href="#/playlist/${encodeURIComponent(p.id)}"${dLang(p)}>${esc(dTitle(p))}</a><span class="m lv">${esc(t("lv_" + levelOf(p.id)))}</span><span class="m">${esc(lessonsN(plCount(p.id)))} · <span class="ltr">${esc(hours(plDur.get(p.id)))}</span></span></li>`,
            )
            .join("") +
          (s.arabic
            ? `<li class="sub"><span class="k">${esc(t("arabic_k"))}</span><span>${esc(t("arabic_v"))} <a href="#/playlist/${encodeURIComponent(s.arabic)}"${dLang(plById.get(s.arabic))}>${esc(dTitle(plById.get(s.arabic)))}</a></span></li>`
            : "") +
          `<li class="tot">${esc(t("step_total", { n: lessonsN(stepCount(s)), h: hours(stepTime(s)) }))}</li></ul></div>` +
          `<label class="tick"${L()}><input type="checkbox" data-tick="${s.k}"${done ? " checked" : ""}><span class="box"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.2 4.2L19 7" pathLength="100"/></svg></span>${esc(t("done_tick"))}</label></li>`
        );
      }).join("") +
      "</ol>" +
      medal("st-2") +
      `<section id="days" class="block">` +
      secHead(t("r_days"), { eyebrow: t("r_days_e"), promise: t("r_days_p") }) +
      `<p class="muted" id="daysProg"${L()}>${esc(t("days_prog", { d: nf(doneDays), t: nf(DAYS.length) }))}</p><div class="bar" style="max-width:420px;margin:6px 0 4px"><i id="daysBar" style="--p:${(doneDays / DAYS.length).toFixed(3)}"></i></div>` +
      PILLARS.map(
        (k) =>
          `<div class="phase"><h3${L()}>${esc(t("p_" + k))}</h3><span class="rule"></span></div><div class="days">` +
          DAYS.filter((d) => d.k === k)
            .map((d) => dayCard(d, nd.n))
            .join("") +
          "</div>",
      ).join("") +
      `<div class="days-slot">${daysEnd()}</div>` +
      "</section>" +
      '<div class="notes">' +
      ["skip", "rhythm", "stuck"]
        .map(
          (k) =>
            `<div class="note"><h3${L()}>${esc(t("st_" + k + "_t"))}</h3><p${L()}>${esc(t("st_" + k + "_p"))}</p></div>`,
        )
        .join("") +
      "</div></div>";
    $$("[data-tick]").forEach((c) =>
      c.addEventListener("change", () => {
        st.path[c.dataset.tick] = c.checked ? 1 : 0;
        store(K.path, st.path);
        c.closest(".step").classList.toggle("done", c.checked);
      }),
    );
    $$("[data-step]").forEach((a) =>
      a.addEventListener("click", (e) => {
        e.preventDefault();
        $("#step-" + a.dataset.step).scrollIntoView({
          behavior: calm() ? "auto" : "smooth",
          block: "center",
        });
      }),
    );
    wireFirst();
    drawLines($("#v-start"));
    if (q.get("at") === "days")
      requestAnimationFrame(() =>
        $("#days").scrollIntoView({ block: "start" }),
      );
  }
  function onDayTick(c) {
    const n = +c.dataset.day;
    if (c.checked) st.days[n] = 1;
    else delete st.days[n];
    store(K.days, st.days);
    const done = DAYS.filter((d) => st.days[d.n]).length;
    const nd = nextDay().n;
    $$(".dcard").forEach((el) =>
      el.classList.toggle("next", el.dataset.k === "d" + nd),
    );
    if ($("#daysProg")) {
      $("#daysProg").textContent = t("days_prog", {
        d: nf(done),
        t: nf(DAYS.length),
      });
      $("#daysBar").style.setProperty("--p", (done / DAYS.length).toFixed(3));
    }
    $$(".days-slot").forEach((el) => (el.innerHTML = daysEnd()));
  }
  function resetDays() {
    st.days = {};
    store(K.days, st.days);
    const y = window.scrollY;
    render({ keepScroll: true, keepPage: true });
    window.scrollTo(0, y);
  }

  /* ---------- Saved ---------- */
  function renderSaved() {
    const list = Object.keys(st.fav)
      .map((id) => byId.get(id))
      .filter(Boolean);
    $("#v-saved").innerHTML =
      '<div class="wrap" style="padding:40px 24px 50px">' +
      `<header class="page-h">${kh()}<h1${L()}>${esc(t("sv_title"))}</h1><p${L()}>${esc(t("sv_lede"))}</p></header>` +
      (list.length
        ? '<div class="grid" id="svGrid"></div>'
        : emptyBox(esc(t("sv_empty")), btnA("#/library", t("browse"), true), "saved")) +
      "</div>";
    if (list.length) mountList($("#svGrid"), list, (v) => lessonCard(v));
  }

  /* ---------- Books (item 4): list, detail, native reader ---------- */
  // Book files live on R2 when the build sets an R2 base (see build.py
  // r2-books-base.txt), else in books/ beside the site; Read opens them in
  // the browser either way, and a part whose file is not there shows the
  // installed-app note on the hosted site instead of a dead button.
  const bookById = new Map(BOOKS.map((b) => [b.id, b]));
  // Display title (Nov 24, 2026 bilingual fix): in English mode a book
  // shows its English title when one exists, so bilingual (ar-en) books
  // read in English like the series and videos do; otherwise Arabic.
  // Arabic mode is unchanged: a book shows the title in its own language,
  // so an English book keeps its English title there.
  const bookShown = (b) =>
    st.lang === "en"
      ? b.en || b.ar
      : b.lang === "en" && b.en
        ? b.en
        : b.ar;
  const bookShownEn = (b) =>
    st.lang === "en" ? !!b.en : b.lang === "en" && !!b.en;
  const bookTitle = (b) =>
    bookShownEn(b)
      ? `<span lang="en" dir="ltr">${esc(bookShown(b))}</span>`
      : `<span lang="ar" dir="rtl">${esc(bookShown(b))}</span>`;
  // Arabic subtitle under a displayed English title on the detail page,
  // matching the series pattern: the Arabic stays visible so a bad
  // translation is spotted. Shown whenever the title on display is
  // English, in either site language.
  const bookArSub = (b) =>
    bookShownEn(b) && b.ar && bookShown(b) !== b.ar
      ? `<p lang="ar" dir="rtl">${esc(b.ar)}</p>`
      : "";
  const bookAuthor = (b) =>
    st.lang === "en" ? b.author_en || "" : b.author_ar || "";
  const langPill = (b) =>
    `<span class="pill">${
      b.lang === "ar-en"
        ? '<span lang="ar">العربية</span> · <span lang="en" dir="ltr">English</span>'
        : b.lang === "en"
          ? '<span lang="en" dir="ltr">English</span>'
          : '<span lang="ar">العربية</span>'
    }</span>`;
  // Designed cover for books with no cover image: the Q&A cover in miniature
  // (assessment §3-§5) - dark green panel, double gold frame with corner
  // stars, gold Ruqaa title, cream author line. No personal credit is put
  // on any cover: the compiler credit line belongs to the Q&A volumes only,
  // and those have real covers, so this art never carries it.
  const bookCoverArt = (b) =>
    `<span class="bkart"><span class="bkart-c c-tl" aria-hidden="true">✦</span><span class="bkart-c c-tr" aria-hidden="true">✦</span><span class="bkart-c c-bl" aria-hidden="true">✦</span><span class="bkart-c c-br" aria-hidden="true">✦</span><span class="bkart-eyebrow"${L()}>${esc(t("bk_cover_lib"))}</span><span class="bkart-t">${bookTitle(b)}</span><span class="bkart-d" aria-hidden="true">✦ ✦ ✦</span><span class="bkart-a">${esc(bookAuthor(b))}</span></span>`;
  function bookCard(b) {
    const href = "#/book/" + b.id;
    return (
      `<article class="scard bk-card" data-k="${b.id}">` +
      `<a class="arch" href="${href}" tabindex="-1" aria-hidden="true">${b.cover ? imgTag(b.cover) : bookCoverArt(b)}</a>` +
      `<div class="sbody"><span class="eyebrow"${L()}>${esc(count("page", b.pages))}${b.parts.length > 1 ? " · " + esc(t("bk_parts")) + " " + nf(b.parts.length) : ""}</span>` +
      `<a class="stitle" href="${href}">${bookTitle(b)}</a>` +
      `<div class="lmeta"${L()}><span>${esc(bookAuthor(b))}</span>${langPill(b)}</div>` +
      `<div class="lacts"${L()}><a class="btn" href="${href}">${esc(t("bk_details"))}</a></div>` +
      "</div></article>"
    );
  }
  function renderBooks(_, q) {
    const lang = ["ar", "en"].includes(q.get("lang")) ? q.get("lang") : "";
    // Books list in alphabetical order, so the order is plain to see.
    const bcol = new Intl.Collator("ar", { numeric: true, sensitivity: "base" });
    // The English tab lists every book that has an English title (the
    // English books and the bilingual ar-en editions); the Arabic tab
    // lists the Arabic and bilingual editions. One Arabic work (b03, the
    // Q and A book) also carries an English title in the data, so it
    // appears on the English tab too.
    const list = BOOKS.filter(
      (b) =>
        !lang ||
        (lang === "en" ? !!b.en : b.lang === "ar" || b.lang === "ar-en"),
    ).sort((a, b) =>
      // Sort by the title actually shown on the card, so a translated book
      // sits with the other books in its own language, not beside its twin.
      bcol.compare(bookShown(a) || "", bookShown(b) || ""),
    );
    const chip = (k, label) =>
      `<a class="chipf${k === lang ? " on" : ""}" href="#/books${k ? "?lang=" + k : ""}"${k === lang ? ' aria-current="true"' : ""}>${label}</a>`;
    $("#v-books").innerHTML =
      '<div class="wrap" style="padding:40px 24px 50px">' +
      `<header class="page-h">${kh()}<h1${L()}>${esc(t("bk_title"))}</h1><p${L()}>${esc(t("bk_lede"))}</p></header>` +
      `<div class="chips bk-chips" role="group" aria-label="${esc(t("bk_nav"))}">` +
      chip("", `<span${L()}>${esc(t("bk_all"))}</span>`) +
      chip("ar", '<span lang="ar">العربية</span>') +
      chip("en", '<span lang="en" dir="ltr">English</span>') +
      `</div><p class="muted cnt"${L()}>${esc(count("book", list.length))}</p>` +
      '<div class="grid" id="bkGrid"></div></div>';
    mountList($("#bkGrid"), list, bookCard);
  }
  function renderBook(id) {
    const b = bookById.get(id);
    if (!b) return go("#/books");
    const other = b.companion && bookById.get(b.companion);
    const isWord = b.format === "docx";
    const parts = b.parts
      .map((x, i) => {
        const label =
          b.parts.length > 1
            ? esc(t("bk_part", { n: nf(x.n || i + 1) })) + t("comma")
            : "";
        const acts =
          (isWord
            ? ""
            : `<a class="btn primary" href="${esc(x.file)}" target="_blank" rel="noopener">${esc(t("bk_read"))}</a>`) +
          `<a class="btn" href="${esc(x.file)}" download>${esc(t("bk_open"))}</a>`;
        return `<li class="bk-part" data-file="${esc(x.file)}"><span${L()}>${label}${esc(count("page", x.pages))}</span><span class="bk-acts"${L()}>${acts}</span></li>`;
      })
      .join("");
    $("#v-book").innerHTML =
      '<div class="wrap" style="padding:40px 24px 50px">' +
      `<p${L()}><a class="btn small" href="#/books">${esc(t("bk_back"))}</a></p>` +
      `<header class="page-h bk-h">` +
      (b.cover
        ? `<div class="bk-cover"><img src="${esc(b.cover)}" alt=""></div>`
        : `<div class="bk-cover bk-cover-css">${bookCoverArt(b)}</div>`) +
      `<h1>${bookTitle(b)}</h1>` +
      bookArSub(b) +
      `<p${L()}>${esc(bookAuthor(b))}</p>` +
      (b.blurb
        ? `<p${L()}>${esc(st.lang === "en" ? b.blurb.en : b.blurb.ar)}</p>`
        : "") +
      `<div class="facts"${L()}>${langPill(b)}<span class="pill">${esc(count("page", b.pages))}</span></div></header>` +
      medal("bk-" + b.id) +
      (isWord ? `<p class="muted bk-note"${L()}>${esc(t("bk_word"))}</p>` : "") +
      `<ul class="bk-parts">${parts}</ul>` +
      (other
        ? `<p class="bk-note"${L()}><a class="btn small" href="#/book/${other.id}">${esc(t(other.lang === "en" ? "bk_other_en" : "bk_other_ar"))}</a></p>`
        : "") +
      "</div>";
    drawLines($("#v-book"));
    // Clear missing-file state: one same-origin HEAD per part, nothing remote.
    // A remote (R2) file is never HEAD-checked: a public bucket answers
    // without CORS, so the check would wrongly hide a file that is there.
    $$(".bk-part", $("#v-book")).forEach((li) => {
      if (/^https?:\/\//.test(li.dataset.file)) return;
      fetch(li.dataset.file, { method: "HEAD", cache: "no-store" })
        .then((r) => {
          // The share host answers missing files with HTTP 200 + a plain-text
          // "unauthorized" body, so r.ok alone is not proof the file is
          // there: a real book comes back as application/pdf (or a Word
          // document type), never as text/*.
          if (!r.ok) return false;
          const ct = (r.headers.get("content-type") || "").toLowerCase();
          return !ct.startsWith("text/");
        })
        .catch(() => false)
        .then((ok) => {
          if (ok || !li.isConnected) return;
          $(".bk-acts", li).innerHTML =
            `<span class="muted">${esc(t(HOSTED ? "bk_installed" : "bk_missing"))}</span>`;
        });
    });
  }

  /* ---------- About hub: About the library, Mission, The Sheikh ---------- */
  const sheikhLessons = () =>
    VIDEOS.filter((v) => !v.playlistIds.some(notSheikh));
  let status = null;
  function statsRow(cells) {
    return (
      `<div class="stats"${L()}><span class="girih" aria-hidden="true"></span>` +
      cells
        .map(
          ([n, k]) =>
            `<div class="stat"><b>${n}</b><span>${esc(k)}</span></div>`,
        )
        .join("") +
      "</div>"
    );
  }
  function renderAbout(tab) {
    tab = tab === "mission" || tab === "sheikh" ? tab : "about";
    const tabs =
      `<nav class="tabs" role="tablist" id="abTabs"${L()}>` +
      ["about", "mission", "sheikh"]
        .map(
          (k) =>
            `<a role="tab" href="#/about${k === "about" ? "" : "/" + k}" aria-selected="${k === tab}">${esc(t("tab_" + k))}</a>`,
        )
        .join("") +
      '<span class="ink" aria-hidden="true"></span></nav>';
    let html = "";
    if (tab === "about") {
      html =
        `<header class="page-h">${kh()}<h1${L()}>${esc(t("ab_title"))}</h1><p${L()}>${esc(t("ab_lede"))}</p></header>` +
        statsRow([
          [nf(STATS.videos), word("lesson", STATS.videos)],
          [nf(STATS.series), word("series", STATS.series)],
        ]) +
        // Brief item 5: hours and years of publishing stay off until verified with a source.
        `<div class="prose"${L()}>` +
        ["is", "why", "order", "src", "off", "credit"]
          .map(
            (k) =>
              `<h2>${esc(t("ab_" + k + "_t"))}</h2><p>${esc(t("ab_" + k + "_p"))}</p>` +
              (k === "is" ? `<p>${esc(t("ab_not_p"))}</p>` : ""),
          )
          .join("") +
        `<details id="abDetails"><summary>${esc(t("ab_details"))}</summary><div class="facts-l" id="abDet"></div></details></div>`;
    } else if (tab === "mission") {
      html =
        `<header class="page-h">${kh()}<h1${L()}>${esc(t("mi_title"))}</h1><p${L()}>${esc(t("mi_lede"))}</p></header>` +
        '<div class="cards3">' +
        [1, 2, 3]
          .map(
            (i) =>
              `<div class="card pillar">${kh()}<h3${L()}>${esc(t("p" + i + "_t"))}</h3><p${L()}>${esc(t("p" + i + "_p"))}</p></div>`,
          )
          .join("") +
        `</div><div class="prose"${L()}><h2>${esc(t("mi_how_t"))}</h2><ul>` +
        [1, 2, 3, 4].map((i) => `<li>${esc(t("mi_how_" + i))}</li>`).join("") +
        "</ul></div>";
    } else {
      const own = sheikhLessons();
      html =
        `<header class="page-h"><div class="sheikh-photo"><img src="Preview/assets/img/sheikh-portrait.jpg" alt="${esc(t("sh_en"))}"></div>` +
        `<h1${AR}>فضيلة الشيخ الدكتور مصطفى كامل</h1><p lang="en" dir="ltr" style="font-family:var(--font-lat-head);font-size:20px">${esc(t("sh_en"))}</p>` +
        `<p class="role"${L()}>${esc(t("sh_role"))}</p></header>` +
        statsRow([
          [nf(own.length), word("lesson", own.length)],
          [nf(sheikhSeries.length), word("series", sheikhSeries.length)],
        ]) +
        `<div class="prose"${L()}><h2>${esc(t("sh_bio_t"))}</h2><p>${esc(t("sh_bio"))}</p>` +
        (BOOKS.length
          ? `<h2>${esc(t("bk_from_sheikh"))}</h2><p><a class="btn small" href="#/books">${esc(t("bk_title"))} · ${esc(count("book", BOOKS.length))}</a></p>`
          : "") +
        `<h2>${esc(t("sh_series_t"))}</h2>` +
        PILLARS.concat("occasions")
          .map((k) => {
            const ls = sheikhSeries.filter((p) => pillarOf(p.id) === k);
            return ls.length
              ? `<h3 class="idx-h">${esc(t("p_" + k))}</h3><ul class="idx">` +
                  ls
                    .map(
                      (p) =>
                        `<li><a href="#/playlist/${encodeURIComponent(p.id)}"${dLang(p)}>${esc(dTitle(p))}</a><span class="m">${esc(lessonsN(plCount(p.id)))} · <span class="ltr">${esc(hours(plDur.get(p.id)))}</span></span></li>`,
                    )
                    .join("") +
                  "</ul>"
              : "";
          })
          .join("") +
        "</div>";
    }
    $("#v-about").innerHTML = '<div class="page">' + tabs + html + "</div>";
    inkTabs();
    if (tab === "about") paintDetails();
  }
  function inkTabs() {
    const nav = $("#abTabs");
    if (!nav) return;
    const a = $('[aria-selected="true"]', nav),
      ink = $(".ink", nav);
    ink.style.transform = `translateX(${a.offsetLeft}px) scaleX(${a.offsetWidth})`;
  }
  function paintDetails() {
    const box = $("#abDet");
    if (!box) return;
    const folder = !status
      ? t("det_unknown")
      : status.videos_exists
        ? t("det_found", { n: count("file", status.videos_count) })
        : t("det_missing");
    const row = (k, v) =>
      `<div class="row" style="display:grid;grid-template-columns:200px 1fr;gap:14px;padding:10px 0;border-bottom:1px solid var(--line-soft)"><span class="muted">${esc(t(k))}</span><span>${v}</span></div>`;
    box.innerHTML =
      row("det_lessons", esc(nf(VIDEOS.length))) +
      row("det_folder", esc(folder)) +
      row(
        "det_edition",
        '<span class="ltr">v4 · ' + esc(CATALOG_VERSION) + "</span>",
      );
  }

  /* ---------- Recitation slot: silent by default, one audio manager ---------- */
  const Rec = (() => {
    const a = $("#recAudio");
    const SRC = "Preview/assets/recitation.mp3";
    let avail = false,
      known = false,
      wanted = false,
      statusKey = "rec_none";
    a.volume = +load(K.vol, 0.8);
    a.muted = !!load(K.mute, false);
    function ui() {
      // never offer what does not exist: the controls appear only when a recording is present
      $("#recCtl").hidden = !avail;
      $("#recPlay").innerHTML = icon(a.paused ? "i-play" : "i-pause");
      $("#recPlay").setAttribute(
        "aria-label",
        t(a.paused ? "rec_play" : "rec_pause"),
      );
      $("#recReplay").setAttribute("aria-label", t("rec_replay"));
      $("#recMute").innerHTML = icon(a.muted ? "i-mute" : "i-vol");
      $("#recMute").setAttribute(
        "aria-label",
        t(a.muted ? "rec_unmute" : "rec_mute"),
      );
      $("#recVol").setAttribute("aria-label", t("rec_vol"));
      $("#recVol").value = a.volume;
      const s = $("#recStatus");
      s.textContent = t(avail && !a.paused ? "rec_playing" : statusKey);
      s.setAttribute("lang", st.lang);
      s.setAttribute("dir", st.lang === "ar" ? "rtl" : "ltr");
    }
    function play(fromStart) {
      // Enter pressed before the status answer arrived: play as soon as it does
      if (!known) wanted = true;
      if (!avail) return;
      if (cur && cur.video) cur.video.pause(); // never overlap lesson audio
      if (!a.getAttribute("src")) a.src = SRC;
      if (fromStart) a.currentTime = 0;
      const pr = a.play();
      if (pr && pr.catch)
        pr.catch(() => {
          statusKey = "rec_blocked";
          ui();
        });
    }
    function stop() {
      wanted = false;
      if (!a.paused) a.pause();
      try {
        a.currentTime = 0;
      } catch (_) {}
      ui();
    }
    a.addEventListener("play", ui);
    a.addEventListener("pause", ui);
    a.addEventListener("ended", ui);
    $("#recPlay").addEventListener("click", () =>
      a.paused ? play(false) : a.pause(),
    );
    $("#recReplay").addEventListener("click", () => play(true));
    $("#recMute").addEventListener("click", () => {
      a.muted = !a.muted;
      store(K.mute, a.muted);
      ui();
    });
    $("#recVol").addEventListener("input", (e) => {
      a.volume = +e.target.value;
      store(K.vol, a.volume);
    });
    // the server reports whether a licensed file is present, so a missing file never shows as an error
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
      });
    return { play, stop, ui };
  })();

  /* ---------- Chrome: language, theme, calm motion ---------- */
  function paintChrome() {
    const ar = st.lang === "ar";
    $$("[data-t]").forEach((el) => {
      el.textContent = t(el.dataset.t);
      el.setAttribute("lang", st.lang);
      el.setAttribute("dir", ar ? "rtl" : "ltr");
    });
    const seg = $("#langSeg");
    seg.dataset.on = st.lang;
    $$("button", seg).forEach((b) =>
      b.setAttribute("aria-pressed", String(b.dataset.lang === st.lang)),
    );
    $("#themeBtn").setAttribute("aria-label", t("theme"));
    $("#nav").setAttribute("aria-label", ar ? "القائمة الرئيسية" : "Main");
    $("#swGrid").innerHTML = THEMES.map(
      (th) =>
        `<button class="sw" type="button" data-theme="${th}" data-th="${th}" aria-pressed="${th === st.theme}"><span class="pv" aria-hidden="true"><b></b><i></i></span><span${L()}>${esc(t("th_" + th))}</span></button>`,
    ).join("");
    $("#themePop").setAttribute("aria-label", t("theme"));
    $("#calmBox").checked = st.calm;
    $("#dlgClose").setAttribute("aria-label", t("close"));
    document.title = ar
      ? "مكتبة فضيلة الشيخ الدكتور مصطفى كامل"
      : "The Library of Sheikh Dr. Moustafa Kamel";
    Rec.ui();
  }
  function setLang(l) {
    if (l === st.lang) return;
    st.lang = l;
    store(K.lang, l);
    paintChrome();
    const y = window.scrollY;
    render({ keepScroll: true, keepStage: true, keepPage: true });
    window.scrollTo(0, y);
    // the content fades back in its new direction; the chrome never moves
    if (!calm())
      $("#main").animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: 200,
        easing: "cubic-bezier(0,0,.2,1)",
      });
  }
  function setTheme(th) {
    const apply = () => {
      st.theme = th;
      store(K.theme, th);
      document.documentElement.dataset.theme = th;
      $$("#swGrid .sw").forEach((b) =>
        b.setAttribute("aria-pressed", String(b.dataset.th === th)),
      );
    };
    if (th === st.theme) return;
    if (!document.startViewTransition || calm()) return apply();
    const root = document.documentElement;
    root.classList.add("vt-theme");
    document
      .startViewTransition(apply)
      .finished.finally(() => root.classList.remove("vt-theme"));
  }
  function setCalm(on) {
    st.calm = on;
    store(K.calm, on);
    document.documentElement.classList.toggle("calm", on);
  }

  /* ---------- Global events ---------- */
  document.addEventListener("click", (e) => {
    if (e.target.closest("a.sr")) {
      e.preventDefault();
      $("#main").focus();
      return;
    }
    const fav = e.target.closest("[data-fav]");
    if (fav) {
      const id = fav.dataset.fav;
      if (st.fav[id]) delete st.fav[id];
      else st.fav[id] = true;
      store(K.fav, st.fav);
      $$('[data-fav="' + CSS.escape(id) + '"]').forEach((b) => {
        b.setAttribute("aria-pressed", String(!!st.fav[id]));
        b.setAttribute("aria-label", t(st.fav[id] ? "unsave" : "save"));
      });
      if (st.fav[id]) pop(fav);
      else unpop(fav);
      toast(t(st.fav[id] ? "toast_saved" : "toast_removed"));
      return;
    }
    const dn = e.target.closest("[data-done]");
    if (dn) return setDone(dn.dataset.done, !st.done[dn.dataset.done]);
    if (e.target.closest("[data-days-reset]")) return resetDays();
    const lg = e.target.closest("[data-langs]");
    if (lg) return openLangs(lg.dataset.langs);
    const cap = e.target.closest("[data-cap]");
    if (cap) return setCaptions(cap.dataset.cap);
    const md = e.target.closest("[data-mode]");
    if (md && cur) return setPlayMode(md.dataset.mode);
    const tx = e.target.closest("[data-tx]");
    if (tx && cur) return showTranscript(cur.v, tx.dataset.tx);
    const cue = e.target.closest("[data-cue]");
    if (cue && cur && cur.tx) {
      const c = cur.tx.lines[+cue.dataset.cue];
      cur.tx.quiet = 0;
      if (!calm()) {
        cue.classList.remove("wash");
        void cue.offsetWidth;
        cue.classList.add("wash");
      }
      if (cur.mode !== "yt") {
        cur.video.currentTime = c.a + 0.01;
        const pr = cur.video.play();
        if (pr && pr.catch) pr.catch(() => {});
      }
      syncTx(true);
      return;
    }
    const rail = e.target.closest("[data-rail]");
    if (rail) {
      const r = $("#" + rail.dataset.rail);
      // the rail lives in the RTL chrome, so "next" scrolls toward the left
      if (r)
        r.scrollBy({
          left: -rail.dataset.dir * r.clientWidth * 0.9,
          behavior: calm() ? "auto" : "smooth",
        });
      return;
    }
    const sw = e.target.closest("[data-th]");
    if (sw) return setTheme(sw.dataset.th);
    const pop_ = $("#themePop");
    if (e.target.closest("#themeBtn")) {
      pop_.hidden = !pop_.hidden;
      $("#themeBtn").setAttribute("aria-expanded", String(!pop_.hidden));
    } else if (!e.target.closest("#themePop")) {
      pop_.hidden = true;
      $("#themeBtn").setAttribute("aria-expanded", "false");
    }
    if (!e.target.closest(".sortd"))
      $$(".sortd ul").forEach((u) => {
        u.hidden = true;
        u.previousElementSibling.setAttribute("aria-expanded", "false");
      });
  });
  document.addEventListener("change", (e) => {
    if (e.target.matches("[data-day]")) onDayTick(e.target);
  });
  $$("#langSeg button").forEach((b) =>
    b.addEventListener("click", () => setLang(b.dataset.lang)),
  );
  $("#calmBox").addEventListener("change", (e) => setCalm(e.target.checked));
  $("#dlgClose").addEventListener("click", () => $("#dlg").close());
  window.addEventListener("hashchange", navigate);
  window.addEventListener("pagehide", saveProgress);
  window.addEventListener("resize", inkTabs);

  /* ---------- Opening: The Illuminated Page ---------- */
  // An articulated bird, heading right: bean body with heavy chest, tucked head and beak wedge, forked tail;
  // each wing is an arm blade pivoting at the shoulder and a hand pivoting at the wrist, with four primary notches.
  const WING =
    '<path d="M-3,1 C-6,-6 -8,-13 -8,-20 L-1,-21 C0,-13 3,-6 5,0 Z"/>' +
    '<g transform="translate(-5 -20)"><g class="hand"><path d="M4,-1 C3,-15 -3,-32 -13,-48 L-14,-41 L-17.5,-40 L-16.5,-33 L-20,-32 L-18,-25 L-21.5,-24 L-17,-15 C-13,-8 -9,-3 -4,0 Z"/></g></g>';
  const birdSvg = () =>
    '<svg viewBox="-50 -78 82 132"><g class="bd">' +
    `<g transform="translate(6 -5) scale(.86)" opacity=".62"><g class="wf">${WING}</g></g>` +
    '<path d="M17,-1 C15,-5.5 9,-7 2,-6.4 C-6,-5.8 -12,-3.4 -17,-1.2 L-25,-4.6 L-21.6,.4 L-26,4.8 L-16.4,2.4 C-10,4.4 -3,5.8 4,5.2 C10.5,4.8 15,2.8 17,-1 Z"/>' +
    '<circle cx="17.6" cy="-3.2" r="3.8"/><path d="M20.6,-4.6 L26.4,-2.8 L20.8,-1.4 Z"/>' +
    `<g transform="translate(3 -4)"><g class="wn">${WING}</g></g></g></svg>`;
  const BIRDS = [
    // width, travel s, delay s, opacity, colour, flap s, bob s, height of path (fraction), drift, reduced-motion stop, glide
    [26, 46, -12, 0.55, "#3a2a55", 0.8, 5, 0.2, 40, "22%", true],
    [36, 36, -20, 0.8, "#24183a", 0.86, 4.2, 0.3, 60, "70%", false],
    [22, 54, -38, 0.45, "#4a3560", 0.74, 5.6, 0.13, 30, "48%", false],
    [66, 24, 2.3, 0.94, "#140d24", 0.62, 3.4, 0.36, 90, "84%", false], // the near bird crosses behind the arch
  ];
  function flightPath(b) {
    const w = innerWidth,
      h = innerHeight,
      y = h * b[7],
      a = b[8];
    return `path("M ${-120} ${y} C ${w * 0.3} ${y - a}, ${w * 0.62} ${y + a}, ${w + 120} ${y - a * 0.4}")`;
  }
  function splash() {
    const sp = $("#splash");
    // One-shot recovery credential from a password-reset email link.
    // It lives only in this closure: never stored as a login session
    // (no K.acct write) and dropped the moment the reset completes.
    let recoveryToken = "";
    let force = false,
      skip = false;
    try {
      const qs = new URLSearchParams(location.search);
      force = qs.get("splash") === "1";
      // The opening page shows on every visit. It used to be skipped once
      // "archive-v3-entered" was set in sessionStorage, so the first open
      // of a browser session stopped at the sign-in/guest page while
      // later opens went straight to the library, the site behaved
      // differently from visit to visit. Nothing is remembered now:
      // every open starts at the same page, the same way.
      // (?splash=0 remains an explicit opt-out for link targets.)
      skip = qs.get("splash") === "0";
    } catch (_) {}
    // A password-reset email lands here with #access_token=...&type=recovery.
    // checkRecoveryHash() reads the token, then clears it from the URL at
    // once so it never lingers in the address bar or history. A recovery
    // landing always shows the set-new-password form, even with ?splash=0.
    const isRecovery = checkRecoveryHash();
    if (skip && !force && !isRecovery) {
      const acct = load(K.acct, null);
      if (acct && acct.mode === "email" && acct.access_token)
        showAcctChip(acct.email);
      return;
    }
    const sky = $("#sky");
    sky.innerHTML = BIRDS.map(
      (b) =>
        `<div class="bird${b[10] ? " glide" : ""}" style="--w:${b[0]}px;--d:${b[1]}s;--dl:${b[2]}s;--o:${b[3]};--c:${b[4]};--f:${b[5]}s;--b:${b[6]}s;--sx:${b[9]}"><div class="bob">${birdSvg()}</div></div>`,
    ).join("");
    const birds = $$(".bird", sky);
    const lay = () =>
      birds.forEach((el, i) => (el.style.offsetPath = flightPath(BIRDS[i])));
    lay();
    window.addEventListener("resize", lay);
    sp.hidden = false;
    document.body.style.overflow = "hidden";
    const anims = [];
    const A = (sel, kf, delay, duration, easing) => {
      $$(sel, sp).forEach((el) =>
        anims.push(
          el.animate(kf, {
            delay,
            duration,
            easing: easing || "cubic-bezier(.45,0,.2,1)",
            fill: "both",
          }),
        ),
      );
    };
    const draw = [{ strokeDashoffset: 100 }, { strokeDashoffset: 0 }];
    const fade = [{ opacity: 0 }, { opacity: 1 }];
    if (!calm()) {
      A(
        ".art",
        [{ opacity: 0.55 }, { opacity: 1 }],
        0,
        900,
        "cubic-bezier(0,0,.2,1)",
      );
      A(".scrim", [{ opacity: 0.32 }, { opacity: 0 }], 1500, 700);
      A(".arch-l,.arch-r", draw, 300, 900);
      A(".arch-il,.arch-ir", draw, 460, 900);
      A(".base", draw, 300, 700);
      A(".sq1", draw, 1200, 400);
      A(".sq2", draw, 1400, 400);
      A(".ring", draw, 1300, 500);
      A(".dot", fade, 1700, 200);
      A(".fl-l,.fl-r", draw, 1250, 650);
      // the one allowed motion of the verse: a single fade and rise inside the finished frame
      A(
        "#spVerse",
        [
          { opacity: 0, transform: "translateY(14px)" },
          { opacity: 1, transform: "none" },
        ],
        1800,
        750,
        "cubic-bezier(0,0,.2,1)",
      );
      A("#spCite", fade, 2150, 400, "cubic-bezier(0,0,.2,1)");
      A("#spOrn", fade, 2200, 400, "cubic-bezier(0,0,.2,1)");
      A(
        "#spName",
        [
          { opacity: 0, transform: "translateY(8px)" },
          { opacity: 1, transform: "none" },
        ],
        2300,
        500,
        "cubic-bezier(0,0,.2,1)",
      );
      A(".sp-bf .d", draw, 2700, 500);
      A(".sp-lbl", fade, 2850, 350, "cubic-bezier(0,0,.2,1)");
      A(".sp-fill", fade, 3150, 250, "cubic-bezier(0,0,.2,1)");
      birds.forEach((el) => el.classList.add("go"));
      Promise.all(anims.map((a) => a.finished))
        .then(() => $(".sp-gold", sp).classList.add("sheen"))
        .catch(() => {});
    }
    const enter = (withVerse) => {
      // nobody waits on the choreography: jump to the final frame, then enter
      anims.forEach((a) => {
        try {
          a.finish();
        } catch (_) {}
      });
      sp.classList.add("gone");
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", lay);
      setTimeout(
        () => {
          sp.hidden = true;
          sky.innerHTML = "";
          drawVisibleLines();
        },
        calm() ? 0 : 520,
      );
      if (withVerse) Rec.play(true);
      else Rec.stop();
      $("#main").focus({ preventScroll: true });
    };
    const onKey = (e) => {
      if (e.key === "Escape") enter(false);
    };
    document.addEventListener("keydown", onKey);
    $("#enterBtn").addEventListener("click", () => enter(true));
    // Three explicit choices on the opening page: Sign In, Sign Up, Guest.
    // Each account button opens the form in ITS mode, set fresh on every
    // click, so the form can never reopen stuck in the other mode.
    const setChoiceBtns = (hidden) => {
      $("#enterBtn").hidden = hidden;
      $("#signinBtn").hidden = hidden;
      $("#signupBtn").hidden = hidden;
    };
    const openLgForm = (mode) => {
      setLgMode(mode);
      sp.classList.add("lg-open");
      setChoiceBtns(true);
      $("#lgForm").hidden = false;
      $("#lgEmail").focus({ preventScroll: true });
    };
    $("#signinBtn").addEventListener("click", () => openLgForm("signin"));
    $("#signupBtn").addEventListener("click", () => openLgForm("signup"));
    $("#lgBack").addEventListener("click", () => {
      sp.classList.remove("lg-open");
      setChoiceBtns(false);
      $("#lgForm").hidden = true;
      $("#signinBtn").focus({ preventScroll: true });
    });
    $("#lgSubmit").addEventListener("click", onLgSubmit);
    const lgEnter = (e) => {
      if (e.key === "Enter") onLgSubmit();
    };
    $("#lgEmail").addEventListener("keydown", lgEnter);
    $("#lgPass").addEventListener("keydown", lgEnter);
    $("#lgConfirm").addEventListener("keydown", lgEnter);
    $("#lgModeToggle").addEventListener("click", () =>
      setLgMode(lgMode === "signup" ? "signin" : "signup"),
    );
    $("#lgForgot").addEventListener("click", forgotPass);
    $("#lgResend").addEventListener("click", resendConfirm);
    // Password-reset landing (see the checkRecoveryHash call at the top
    // of splash()). Only a #access_token=...&type=recovery hash triggers
    // this; normal boot and guest/sign-in flows never reach it.
    function checkRecoveryHash() {
      let hash = "";
      try {
        hash = location.hash.slice(1);
      } catch (_) {}
      const p = new URLSearchParams(hash);
      if (p.get("type") !== "recovery" || !p.get("access_token"))
        return false;
      recoveryToken = p.get("access_token");
      try {
        history.replaceState(null, "", location.pathname + location.search);
      } catch (_) {}
      return true;
    }
    function lgResetShow(msgKey) {
      const n = $("#lgResetNotice");
      n.textContent = t(msgKey);
      n.hidden = false;
    }
    function showResetForm() {
      sp.classList.add("lg-open");
      setChoiceBtns(true);
      $("#lgForm").hidden = true;
      $("#lgResetForm").hidden = false;
      $("#lgNewPass").value = "";
      $("#lgNewConfirm").value = "";
      $("#lgResetNotice").hidden = true;
      $("#lgNewPass").focus({ preventScroll: true });
    }
    async function resetPass() {
      const pass = $("#lgNewPass").value;
      const conf = $("#lgNewConfirm").value;
      if (!pass) return;
      if (pass.length < 6) {
        lgResetShow("lg_short");
        $("#lgNewPass").focus({ preventScroll: true });
        return;
      }
      if (pass !== conf) {
        lgResetShow("lg_mismatch");
        $("#lgNewConfirm").value = "";
        $("#lgNewConfirm").focus({ preventScroll: true });
        return;
      }
      const cfg = await supaCfg(lgResetShow);
      if (!cfg) return;
      try {
        const res = await fetch(
          String(cfg.url).replace(/\/$/, "") + "/auth/v1/user",
          {
            method: "PUT",
            headers: {
              Authorization: "Bearer " + recoveryToken,
              apikey: cfg.anonKey,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ password: pass }),
          },
        );
        if (res.ok) {
          // Recovery done: drop the one-shot token and return to the
          // sign-in form, where the new password works immediately.
          recoveryToken = "";
          $("#lgResetForm").hidden = true;
          setLgMode("signin");
          $("#lgForm").hidden = false;
          lgShow("lg_reset_done");
          $("#lgPass").value = "";
          $("#lgEmail").focus({ preventScroll: true });
          return;
        }
        lgResetShow("lg_reset_bad");
        $("#lgNewPass").value = "";
        $("#lgNewConfirm").value = "";
        $("#lgNewPass").focus({ preventScroll: true });
      } catch (_) {
        lgResetShow("lg_reset_bad");
      }
    }
    $("#lgResetSubmit").addEventListener("click", resetPass);
    const lgResetEnter = (e) => {
      if (e.key === "Enter") resetPass();
    };
    $("#lgNewPass").addEventListener("keydown", lgResetEnter);
    $("#lgNewConfirm").addEventListener("keydown", lgResetEnter);
    if (isRecovery) showResetForm();
    // Sign-up lives on the same form: one mode flag, the same inputs
    // plus a confirm-password field, and the same hand-rolled fetch
    // calls as sign-in (no Supabase JS SDK anywhere in the build).
    let lgMode = "signin";
    function lgShow(msgKey) {
      const n = $("#lgNotice");
      n.textContent = t(msgKey);
      n.hidden = false;
    }
    function lgHideNotice() {
      const n = $("#lgNotice");
      n.textContent = "";
      n.hidden = true;
      $("#lgResend").hidden = true;
    }
    function setLgMode(mode) {
      lgMode = mode;
      const up = mode === "signup";
      const title = $("#lgTitle");
      title.dataset.t = up ? "lg_signup_title" : "lg_signin_title";
      title.textContent = t(title.dataset.t);
      $("#lgConfirmL").hidden = !up;
      $("#lgConfirm").hidden = !up;
      $("#lgForgot").hidden = up;
      $("#lgPass").autocomplete = up ? "new-password" : "current-password";
      const submitLbl = $("#lgSubmit .sp-lbl");
      submitLbl.dataset.t = up ? "lg_create" : "lg_submit";
      submitLbl.textContent = t(submitLbl.dataset.t);
      const tog = $("#lgModeToggle");
      tog.dataset.t = up ? "lg_to_signin" : "lg_to_signup";
      tog.textContent = t(tog.dataset.t);
      lgHideNotice();
      if (up) $("#lgConfirm").value = "";
    }
    function onLgSubmit() {
      if (lgMode === "signup") signUpEmail();
      else signInEmail();
    }
    // showFn lets the reset form report a missing config in its own
    // notice instead of the (hidden) sign-in notice; defaults to lgShow.
    // The settings file ships in the published build at
    // data:application/json;base64,eyJhbm9uS2V5IjoiZXlKaGJHY2lPaUpJVXpJMU5pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SnBjM01pT2lKemRYQmhZbUZ6WlNJc0luSmxaaUk2SW1wb2VtVnFkbWgzZG1GdllYZG5ZMk4wYUdGeklpd2ljbTlzWlNJNkltRnViMjRpTENKcFlYUWlPakUzT1RVeU1qZ3lPRGtzSW1WNGNDSTZNakV4TURnd05ESTRPWDAuQURZckpiR2k3aGdXa1RTeURycXI0dWZ4QjMtVDZ0UDBoaEgySV9oZXZ0MCIsInVybCI6Imh0dHBzOi8vamh6ZWp2aHd2YW9hd2djY3RoYXMuc3VwYWJhc2UuY28ifQ== Load it from there first. The
    // Preview/assets/... path is kept only as a fallback for the
    // preview layout, where the page is served from inside a Preview
    // folder and the plain assets/ path does not resolve. A
    // candidate only counts if it parses as JSON with both fields:
    // a missing file can come back as an HTML fallback page, which
    // must not be mistaken for a valid config.
    // The config must point at the archive's OWN Supabase project,
    // never SLATE's project URL, tables, or keys.
    async function supaCfg(showFn) {
      const paths = [
        "data:application/json;base64,eyJhbm9uS2V5IjoiZXlKaGJHY2lPaUpJVXpJMU5pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SnBjM01pT2lKemRYQmhZbUZ6WlNJc0luSmxaaUk2SW1wb2VtVnFkbWgzZG1GdllYZG5ZMk4wYUdGeklpd2ljbTlzWlNJNkltRnViMjRpTENKcFlYUWlPakUzT1RVeU1qZ3lPRGtzSW1WNGNDSTZNakV4TURnd05ESTRPWDAuQURZckpiR2k3aGdXa1RTeURycXI0dWZ4QjMtVDZ0UDBoaEgySV9oZXZ0MCIsInVybCI6Imh0dHBzOi8vamh6ZWp2aHd2YW9hd2djY3RoYXMuc3VwYWJhc2UuY28ifQ==",
        "Preview/assets/supabase-config.json",
      ];
      for (const path of paths) {
        try {
          const r = await fetch(path, { cache: "no-store" });
          if (!r.ok) continue;
          const cfg = await r.json();
          if (cfg && cfg.url && cfg.anonKey) return cfg;
        } catch (_) {}
      }
      (showFn || lgShow)("lg_noconfig");
      return null;
    }
    // Admin Users list (see src/admin-profiles.sql): the anon key can
    // never list Auth users, so each sign-up and sign-in writes one
    // profile row for its own account. Best effort only: a failed
    // write never blocks the sign-in, and nothing here reads the list.
    function recordProfile(cfg, d, email) {
      try {
        if (!d || !d.user || !d.user.id || !d.access_token) return;
        fetch(String(cfg.url).replace(/\/$/, "") + "/rest/v1/profiles", {
          method: "POST",
          headers: {
            apikey: cfg.anonKey,
            Authorization: "Bearer " + d.access_token,
            "Content-Type": "application/json",
            Prefer: "resolution=merge-duplicates,return=minimal",
          },
          body: JSON.stringify({ id: d.user.id, email: email }),
        }).catch(function () {});
      } catch (_) {}
    }
    async function signUpEmail() {
      const email = $("#lgEmail").value.trim();
      const pass = $("#lgPass").value;
      const conf = $("#lgConfirm").value;
      if (!email || !pass) return;
      if (pass.length < 6) {
        lgShow("lg_short");
        $("#lgPass").focus({ preventScroll: true });
        return;
      }
      if (pass !== conf) {
        lgShow("lg_mismatch");
        $("#lgConfirm").value = "";
        $("#lgConfirm").focus({ preventScroll: true });
        return;
      }
      const cfg = await supaCfg();
      if (!cfg) return;
      try {
        const res = await fetch(
          String(cfg.url).replace(/\/$/, "") + "/auth/v1/signup",
          {
            method: "POST",
            headers: {
              apikey: cfg.anonKey,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email,
              password: pass,
              emailRedirectTo: location.origin,
            }),
          },
        );
        if (res.ok) {
          const d = await res.json();
          if (d.access_token) {
            // Confirm-email is off: the sign-up already returned a
            // session, so log straight in exactly like sign-in does.
            store(K.acct, {
              mode: "email",
              email,
              access_token: d.access_token,
              refresh_token: d.refresh_token || "",
              expires_at: Math.floor(Date.now() / 1000) + (d.expires_in || 0),
            });
            recordProfile(cfg, d, email);
            enter(true);
            return;
          }
          // Default "Confirm email" on: a user object and NO usable
          // session. Say so plainly, never the generic bad-login line.
          lgShow("lg_checkmail");
          $("#lgPass").value = "";
          $("#lgConfirm").value = "";
          return;
        }
        let d = {};
        try {
          d = await res.json();
        } catch (_) {}
        const msg = String(
          (d && (d.error_description || d.msg || d.message || d.error)) ||
            "",
        );
        if (/already registered|already exists/i.test(msg)) {
          lgShow("lg_registered");
        } else {
          lgShow("lg_signup_fail");
        }
        $("#lgPass").value = "";
        $("#lgConfirm").value = "";
        $("#lgPass").focus({ preventScroll: true });
      } catch (_) {
        lgShow("lg_signup_fail");
      }
    }
    async function resendConfirm() {
      const email = $("#lgEmail").value.trim();
      if (!email) return;
      const cfg = await supaCfg();
      if (!cfg) return;
      try {
        const res = await fetch(
          String(cfg.url).replace(/\/$/, "") + "/auth/v1/resend",
          {
            method: "POST",
            headers: {
              apikey: cfg.anonKey,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ type: "signup", email }),
          },
        );
        if (res.ok) {
          lgShow("lg_resent");
          $("#lgResend").hidden = true;
        } else {
          lgShow("lg_bad");
        }
      } catch (_) {
        lgShow("lg_bad");
      }
    }
    async function forgotPass() {
      const email = $("#lgEmail").value.trim();
      if (!email) {
        lgShow("lg_need_email");
        $("#lgEmail").focus({ preventScroll: true });
        return;
      }
      const cfg = await supaCfg();
      if (!cfg) return;
      try {
        const res = await fetch(
          String(cfg.url).replace(/\/$/, "") + "/auth/v1/recover",
          {
            method: "POST",
            headers: {
              apikey: cfg.anonKey,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, redirect_to: location.origin }),
          },
        );
        if (res.ok) {
          lgShow("lg_reset_sent");
          $("#lgResend").hidden = true;
        } else {
          lgShow("lg_bad");
        }
      } catch (_) {
        lgShow("lg_bad");
      }
    }
    async function signInEmail() {
      const email = $("#lgEmail").value.trim();
      const pass = $("#lgPass").value;
      if (!email || !pass) return;
      // Same loader as sign-up: data:application/json;base64,eyJhbm9uS2V5IjoiZXlKaGJHY2lPaUpJVXpJMU5pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SnBjM01pT2lKemRYQmhZbUZ6WlNJc0luSmxaaUk2SW1wb2VtVnFkbWgzZG1GdllYZG5ZMk4wYUdGeklpd2ljbTlzWlNJNkltRnViMjRpTENKcFlYUWlPakUzT1RVeU1qZ3lPRGtzSW1WNGNDSTZNakV4TURnd05ESTRPWDAuQURZckpiR2k3aGdXa1RTeURycXI0dWZ4QjMtVDZ0UDBoaEgySV9oZXZ0MCIsInVybCI6Imh0dHBzOi8vamh6ZWp2aHd2YW9hd2djY3RoYXMuc3VwYWJhc2UuY28ifQ== first,
      // Preview/assets/supabase-config.json as fallback. supaCfg
      // shows the lg_noconfig notice itself when neither loads.
      const cfg = await supaCfg();
      if (!cfg) return;
      try {
        const res = await fetch(
          String(cfg.url).replace(/\/$/, "") +
            "/auth/v1/token?grant_type=password",
          {
            method: "POST",
            headers: {
              apikey: cfg.anonKey,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password: pass }),
          },
        );
        if (res.ok) {
          const d = await res.json();
          if (d.access_token) {
            store(K.acct, {
              mode: "email",
              email,
              access_token: d.access_token,
              refresh_token: d.refresh_token || "",
              expires_at: Math.floor(Date.now() / 1000) + (d.expires_in || 0),
            });
            recordProfile(cfg, d, email);
            enter(true);
            return;
          }
        } else {
          // An unconfirmed email is a different problem from a wrong
          // password: say so, and offer to resend the confirmation.
          let d = {};
          try {
            d = await res.json();
          } catch (_) {}
          const msg = String(
            (d && (d.error_description || d.msg || d.message || d.error)) ||
              "",
          );
          const code = String((d && (d.error_code || d.code)) || "");
          if (
            code === "email_not_confirmed" ||
            /email_not_confirmed/i.test(code + " " + msg) ||
            /email not confirmed/i.test(msg)
          ) {
            const n = $("#lgNotice");
            n.textContent = t("lg_unconfirmed");
            n.hidden = false;
            $("#lgResend").hidden = false;
            $("#lgPass").value = "";
            $("#lgPass").focus({ preventScroll: true });
            return;
          }
        }
      } catch (_) {}
      const n = $("#lgNotice");
      n.textContent = t("lg_bad");
      n.hidden = false;
      $("#lgPass").value = "";
      $("#lgPass").focus({ preventScroll: true });
    }
    function syncAccountProgress() {
      // stub: no-op while no archive Supabase project is configured; no network call.
    }
    function showAcctChip(email) {
      const tools = $(".tools");
      if (!tools || $(".acct-chip", tools)) return;
      const chip = document.createElement("span");
      chip.className = "acct-chip";
      const who = document.createElement("span");
      who.textContent = t("lg_signedin", { email });
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn small";
      btn.textContent = t("lg_signout");
      btn.addEventListener("click", () => {
        store(K.acct, null);
        location.reload();
      });
      chip.append(who, btn);
      tools.appendChild(chip);
    }
    setTimeout(() => $("#signinBtn").focus({ preventScroll: true }), 50);
  }

  /* ---------- Boot ---------- */
  (function boot() {
    const qs = new URLSearchParams(location.search);
    if (THEMES.includes(qs.get("theme"))) st.theme = qs.get("theme");
    if (qs.get("lang") === "en" || qs.get("lang") === "ar")
      st.lang = qs.get("lang");
    if (qs.get("calm") === "1") st.calm = true;
    document.documentElement.dataset.theme = st.theme;
    document.documentElement.classList.toggle("calm", st.calm);
    paintChrome();
    render();
    booted = true;
    splash();
  })();
})();
