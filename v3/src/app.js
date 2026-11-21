(function () {
  "use strict";

  /* ---------- Catalog (DATA comes from catalog.js, verbatim) and the library's curation ---------- */
  const VIDEOS = DATA.videos,
    PLAYLISTS = DATA.playlists;
  const byId = new Map(VIDEOS.map((v) => [v.id, v]));
  const plById = new Map(PLAYLISTS.map((p) => [p.id, p]));
  const IMAD_PL = "PLXKSrZvHoN9dOyWCCK6Qm8AS4blW3Ylwm"; // "Aqeeda by Dr Imad Bayoun"
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
  const FIRST_N = 24,
    CHUNK = 36;

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
      rec_playing: "تُتلى الآن",
      rec_blocked: "لم يبدأ التشغيل. اضغط تشغيل مرة أخرى.",
      foot_note: "كل شيء هنا يعمل من هذا الجهاز، بلا إنترنت وبلا تتبع.",
      hero_title: "مكتبة فضيلة الشيخ الدكتور مصطفى كامل",
      hero_promise:
        "دروس موثوقة، مرتبة في سلاسل، محفوظة على جهازك وتعمل بلا إنترنت.",
      search_ph: "ابحث في الدروس والسلاسل...",
      search_go: "بحث",
      browse: "تصفح المكتبة",
      go_start: "من أين أبدأ؟",
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
      r_scholars: "العلماء",
      see_all: "عرض الكل",
      prev: "السابق",
      next: "التالي",
      sheikh_short: "الشيخ مصطفى كامل",
      sheikh_full: "فضيلة الشيخ الدكتور مصطفى كامل",
      imad: "الدكتور عماد بيون",
      guests: "محاضرون ضيوف",
      sch_lessons: "{n} درسًا في {s} سلسلة",
      sch_open: "عن الشيخ",
      sch_series: "افتح السلسلة",
      open_series: "افتح السلسلة",
      play: "شاهد",
      resume: "أكمل",
      save: "احفظ",
      unsave: "أزِل من المحفوظات",
      toast_saved: "حُفظ الدرس في محفوظاتك",
      toast_removed: "أُزيل الدرس من محفوظاتك",
      langs: "اللغات والنصوص",
      lessons_n: "{n} درسًا",
      lesson_1: "درس واحد",
      series_n: "{n} سلسلة",
      published: "نُشر {d}",
      no_series: "خارج السلاسل",
      cat_videos: "دروس",
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
      results: "{n} نتيجة",
      match_lessons: "وُجد {n} درسًا يطابق بحثك.",
      show_lessons: "اعرضها",
      nothing: "لا توجد نتائج مطابقة. جرّب كلمة أقصر أو تصفح السلاسل.",
      clear: "امسح البحث",
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
      st_min: "دقيقة",
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
      day_min: "{m} دقيقة",
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
      st_videos: "درسًا",
      st_series: "سلسلة",
      st_hours: "ساعة تقريبًا",
      st_years: "سنوات النشر",
      ab_src_t: "المصادر والمنهج",
      ab_src_p:
        "عناوين الدروس وتواريخها وترتيبها داخل السلاسل تظهر كما هي في الأرشيف الأصلي، دون إعادة صياغة. الترجمات والنصوص تظهر للدروس التي تتوفر لها.",
      ab_off_t: "كيف تعمل بلا إنترنت",
      ab_off_p:
        "تعمل المكتبة من مجلد على جهازك. لا حساب، ولا إعلانات، ولا تتبع. تقدمك ومحفوظاتك تبقى في هذا المتصفح على هذا الجهاز فقط.",
      ab_credit_t: "شكر وإسناد",
      ab_credit_p:
        "الخطوط المستخدمة مفتوحة الترخيص (SIL Open Font License 1.1): Amiri Quran وAmiri للآية والعناوين، وNoto Sans Arabic للنصوص، وReem Kufi للشعار. التلاوة: لا يوجد تسجيل مرفق في هذه النسخة.",
      ab_details: "تفاصيل المكتبة",
      det_lessons: "الدروس في الفهرس",
      det_folder: "مجلد «videos»",
      det_found: "موجود ({n} ملفًا)",
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
      sh_role: "دروس وخطب وسلاسل من تعليمه، مجموعة في مكتبة واحدة.",
      sh_k_lessons: "درسًا",
      sh_k_series: "سلسلة",
      sh_k_hours: "ساعة",
      sh_k_years: "سنوات النشر",
      sh_series_t: "فهرس سلاسله في هذه المكتبة",
      sv_title: "دروسك المحفوظة",
      sv_lede: "كل درس تحفظه يظهر هنا، جاهزًا حين تعود.",
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
      rec_playing: "Playing",
      rec_blocked: "Playback did not start. Press play again.",
      foot_note:
        "Everything here runs from this computer, with no internet and no tracking.",
      hero_title: "The Library of Sheikh Dr. Moustafa Kamel",
      hero_promise:
        "Trusted lessons, ordered in series, stored on your computer and working without internet.",
      search_ph: "Search lessons and series...",
      search_go: "Search",
      browse: "Browse the Library",
      go_start: "Where to Start",
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
      r_scholars: "Scholars",
      see_all: "See all",
      prev: "Previous",
      next: "Next",
      sheikh_short: "Sheikh Moustafa Kamel",
      sheikh_full: "Sheikh Dr. Moustafa Kamel",
      imad: "Dr. Imad Bayoun",
      guests: "Guest speakers",
      sch_lessons: "{n} lessons in {s} series",
      sch_open: "About the Sheikh",
      sch_series: "Open the series",
      open_series: "Open the series",
      play: "Play",
      resume: "Resume",
      save: "Save",
      unsave: "Remove from Saved",
      toast_saved: "Saved to your list",
      toast_removed: "Removed from your list",
      langs: "Languages & Text",
      lessons_n: "{n} lessons",
      lesson_1: "1 lesson",
      series_n: "{n} series",
      published: "Published {d}",
      no_series: "Not in a series",
      cat_videos: "Lectures",
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
      results: "{n} results",
      match_lessons: "{n} lessons match your search.",
      show_lessons: "Show them",
      nothing: "Nothing matches yet. Try a shorter word, or browse the series.",
      clear: "Clear search",
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
      st_min: "minutes",
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
      day_min: "{m} min",
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
      st_videos: "lessons",
      st_series: "series",
      st_hours: "hours, roughly",
      st_years: "years of publishing",
      ab_src_t: "Sources and method",
      ab_src_p:
        "Lesson titles, dates and their order inside each series are shown exactly as in the original archive, with nothing rewritten. Captions and texts appear only for lessons that have them.",
      ab_off_t: "How it works offline",
      ab_off_p:
        "The library runs from a folder on your computer. No account, no adverts, no tracking. Your progress and saved lessons stay in this browser on this computer only.",
      ab_credit_t: "Credits",
      ab_credit_p:
        "All fonts are openly licensed (SIL Open Font License 1.1): Amiri Quran and Amiri for the verse and headings, Noto Sans Arabic for text, Reem Kufi for the emblem. Recitation: no recording is included in this edition.",
      ab_details: "Library details",
      det_lessons: "Lessons in the catalogue",
      det_folder: "The “videos” folder",
      det_found: "Found ({n} files)",
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
        "Lessons, sermons and series from his teaching, gathered in one library.",
      sh_k_lessons: "lessons",
      sh_k_series: "series",
      sh_k_hours: "hours",
      sh_k_years: "years of publishing",
      sh_series_t: "Index of his series in this library",
      sv_title: "Your saved lessons",
      sv_lede: "Every lesson you save appears here, ready when you return.",
      sv_empty:
        "You have not saved a lesson yet. Press the star on any lesson and it will appear here.",
    },
  };

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
  const nf = (n) =>
    new Intl.NumberFormat(st.lang === "ar" ? "ar-EG" : "en").format(n);
  function dur(sec) {
    const s = Math.max(0, Math.floor(+sec || 0)),
      h = Math.floor(s / 3600),
      m = Math.floor((s % 3600) / 60),
      r = s % 60;
    return h
      ? h + ":" + String(m).padStart(2, "0") + ":" + String(r).padStart(2, "0")
      : m + ":" + String(r).padStart(2, "0");
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
  const lessonsN = (n) =>
    n === 1 ? t("lesson_1") : t("lessons_n", { n: nf(n) });
  const medal = () =>
    '<div class="medal" aria-hidden="true">' + kh() + "</div>";
  const calm = () =>
    st.calm || matchMedia("(prefers-reduced-motion: reduce)").matches;
  const idle = window.requestIdleCallback
    ? (f) => requestIdleCallback(f, { timeout: 250 })
    : (f) => setTimeout(f, 16);

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
    PLAYLISTS.map((p) => [p.id, norm(p.title + " " + p.titleEn)]),
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
  const yearsOf = (list) => {
    const ds = list
      .map((v) => v.uploadDate)
      .filter(Boolean)
      .sort();
    return [ds[0].slice(0, 4), ds[ds.length - 1].slice(0, 4)];
  };
  const STATS = {
    videos: VIDEOS.length,
    series: PLAYLISTS.length,
    hours: Math.round(VIDEOS.reduce((a, v) => a + (v.duration || 0), 0) / 3600),
    years: yearsOf(VIDEOS),
  };
  const yearsRange = (y) => {
    const f = (x) =>
      new Intl.NumberFormat(st.lang === "ar" ? "ar-EG" : "en", {
        useGrouping: false,
      }).format(+x);
    return f(y[0]) + (st.lang === "ar" ? " إلى " : " to ") + f(y[1]);
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
    const vh = innerHeight;
    $$("[data-k]", box).forEach((el) => {
      const a = before.get(el.dataset.k);
      const b = el.getBoundingClientRect();
      if (b.top > vh || b.bottom < 0) return;
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
      } else if (n < 12) {
        el.style.setProperty("--i", n++);
        el.classList.add("rise");
      }
    });
  }
  const SKEL =
    '<article class="lcard skel" aria-hidden="true"><div class="media"><span class="thumb"></span></div><div class="lbody"><span class="sk s"></span><span class="sk t"></span><span class="sk"></span><span class="sk b"></span></div></article>';
  // Long lists: the first viewport renders now, the rest in idle-time chunks as the reader nears the end.
  function mountList(box, list, card) {
    if (box._stop) box._stop();
    let i = 0;
    const add = (n) => {
      const end = Math.min(list.length, i + n);
      box.insertAdjacentHTML(
        "beforeend",
        list.slice(i, end).map(card).join(""),
      );
      i = end;
    };
    flip(box, () => {
      box.innerHTML = "";
      add(FIRST_N);
    });
    if (i >= list.length) return;
    const skels = () => box.insertAdjacentHTML("beforeend", SKEL.repeat(4));
    skels();
    const sent = document.createElement("div");
    sent.className = "sentinel";
    box.after(sent);
    let busy = false;
    const io = new IntersectionObserver(
      (es) => {
        if (!es[0].isIntersecting || busy) return;
        busy = true;
        idle(() => {
          $$(".skel", box).forEach((s) => s.remove());
          add(CHUNK);
          busy = false;
          if (i < list.length) {
            skels();
            io.unobserve(sent);
            io.observe(sent);
          } else box._stop();
        });
      },
      { rootMargin: "1400px 0px" },
    );
    io.observe(sent);
    box._stop = () => {
      io.disconnect();
      sent.remove();
      box._stop = null;
    };
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
    toastTimer = setTimeout(() => (el.hidden = true), 2200);
  }

  /* ---------- Cards ---------- */
  function imgTag(src) {
    return src
      ? '<img src="' +
          esc(src) +
          '" alt="" loading="lazy" decoding="async" onerror="this.parentNode.classList.add(\'noimg\')">'
      : "";
  }
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
      (pct
        ? `<span class="prog"><i style="--p:${pct.toFixed(3)}"></i></span>`
        : "") +
      `</a>${starBtn(v.id)}</div>` +
      `<div class="lbody"><span class="eyebrow"${p ? AR : L()}>${esc(p ? p.title : t("no_series"))}</span>` +
      `<a class="ltitle" href="${href}"${AR}>${esc(v.title)}</a>` +
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
      `<a class="arch${p.cover ? "" : " noimg"}" href="${href}" tabindex="-1" aria-hidden="true">${imgTag(p.cover)}</a>` +
      `<div class="sbody"><span class="eyebrow"${L()}>${esc(lessonsN(plCount(p.id)))} · <span class="ltr">${esc(hours(plDur.get(p.id)))}</span></span>` +
      `<a class="stitle" href="${href}"${AR}>${esc(p.title)}</a>` +
      `<div class="lmeta"${L()}><span>${esc(scholarOfPl(p.id))}</span>${lvlPill(p.id)}</div>` +
      `<div class="sbar"><i style="--p:${seriesPct(p).toFixed(3)}"></i></div>` +
      `<div class="lacts"${L()}><a class="btn" href="${href}">${esc(t("open_series"))}</a></div>` +
      "</div></article>"
    );
  }
  function emptyBox(msg, link, label) {
    return (
      `<div class="empty"${L()}>${kh()}<p>${esc(msg)}</p>` +
      (link ? `<a class="btn small" href="${link}">${esc(label)}</a>` : "") +
      "</div>"
    );
  }
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
      `<ul role="menu" hidden${L()}>` +
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
        (a.dataset.r === "library" && route.name === "playlist");
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
            `<li><a href="${lessonHref(v, seriesOf(v).id)}"${AR}>${esc(v.title)}</a></li>`,
        )
        .join("") +
      `</ol><div class="dfoot"${L()}><span>${esc(t("day_min", { m: nf(Math.round(d.sec / 60)) }))}</span>` +
      `<label class="tick"><input type="checkbox" data-day="${d.n}"${done ? " checked" : ""} aria-label="${esc(t("day_n", { n: nf(d.n) }) + ", " + t("done_tick"))}"><span class="box">${'<svg viewBox="0 0 24 24"><path d="M5 12.5l4.2 4.2L19 7" pathLength="100"/></svg>'}</span></label></div></article>`
    );
  }
  function firstBlock(level, withTabs) {
    const f = CURATION.first[level],
      v = byId.get(f.id);
    return (
      `<section class="first framed" id="firstBox"><span class="corner a">${kh()}</span><span class="corner b">${kh()}</span>` +
      `<div class="min"><b>${nf(Math.round(v.duration / 60))}</b><span${L()}>${esc(t("st_min"))}</span></div><div>` +
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
      `<p class="ttl"${AR}>${esc(v.title)} <span class="muted ltr">(${esc(dur(v.duration))})</span></p>` +
      `<p${AR} class="muted">${esc(plById.get(f.pl).title)}</p>` +
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
      `<h3${L()}>${esc(t("p_" + k))}</h3><p${L()}>${esc(t("series_n", { n: nf(pls.length) }))} · <span class="ltr">${esc(hours(sec))}</span></p></a>`
    );
  }
  function renderHome() {
    const cont = continueList();
    const feat = FEATURED.map((id) => plById.get(id)).filter(Boolean);
    const occ = PLAYLISTS.filter((p) => pillarOf(p.id) === "occasions");
    const nd = nextDay();
    const days = DAYS.slice(Math.max(0, nd.n - 1), nd.n + 7);
    const imad = plById.get(IMAD_PL);
    let drawn = true;
    try {
      drawn = sessionStorage.getItem("archive-v3-hero") === "1";
      sessionStorage.setItem("archive-v3-hero", "1");
    } catch (_) {}
    $("#v-home").innerHTML =
      '<div class="hero"><span class="girih" aria-hidden="true"></span><span class="girih b" aria-hidden="true"></span><div class="hero-in">' +
      kh("hero-kh" + (drawn ? "" : " drawing")) +
      `<h1${L()}>${esc(t("hero_title"))}</h1><p class="promise"${L()}>${esc(t("hero_promise"))}</p>` +
      `<form class="search" role="search" id="heroSearch">${icon("i-search")}<input type="search" name="q" dir="auto" placeholder="${esc(t("search_ph"))}" aria-label="${esc(t("search_ph"))}">` +
      `<button class="btn primary small" type="submit"${L()}>${esc(t("search_go"))}</button></form>` +
      `<div class="hero-btns"${L()}><a class="btn primary" href="#/library">${esc(t("browse"))}</a><a class="btn" href="#/start">${esc(t("go_start"))}</a></div>` +
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
      medal() +
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
      "</div></section>" +
      medal() +
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
      medal() +
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
      medal() +
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
      "</div></section>" +
      medal() +
      '<section class="block">' +
      secHead(t("r_scholars")) +
      '<div class="rail" id="rs">' +
      `<article class="scard sch"><div class="mono" aria-hidden="true"><span>م ك</span></div><h3${L()} style="font-size:20px">${esc(t("sheikh_full"))}</h3>` +
      `<p class="lmeta"${L()}>${esc(t("sch_lessons", { n: nf(sheikhLessons().length), s: nf(sheikhSeries.length) }))}</p>` +
      `<div class="lacts"${L()}><a class="btn" href="#/about/sheikh">${esc(t("sch_open"))}</a></div></article>` +
      (imad
        ? `<article class="scard sch"><div class="mono" aria-hidden="true"><span>ع ب</span></div><h3${L()} style="font-size:20px">${esc(t("imad"))}</h3>` +
          `<p class="lmeta"${L()}>${esc(t("sch_lessons", { n: nf(plCount(IMAD_PL)), s: nf(1) }))}</p>` +
          `<div class="lacts"${L()}><a class="btn" href="#/playlist/${encodeURIComponent(IMAD_PL)}">${esc(t("sch_series"))}</a></div></article>`
        : "") +
      "</div></section></div>";
    $("#heroSearch").addEventListener("submit", (e) => {
      e.preventDefault();
      const q = e.target.q.value.trim();
      go("#/library?scope=all" + (q ? "&q=" + encodeURIComponent(q) : ""));
    });
    wireFirst();
  }
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
      col = new Intl.Collator("ar", { numeric: true, sensitivity: "base" });
    if (sort === "new")
      a.sort((x, y) => (y.uploadDate || "").localeCompare(x.uploadDate || ""));
    else if (sort === "old")
      a.sort((x, y) => (x.uploadDate || "").localeCompare(y.uploadDate || ""));
    else if (sort === "long")
      a.sort((x, y) => (y.duration || 0) - (x.duration || 0));
    else if (sort === "short")
      a.sort((x, y) => (x.duration || 0) - (y.duration || 0));
    else if (sort === "az") a.sort((x, y) => col.compare(x.title, y.title));
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
      ? ["catalog", "az", "most", "new"]
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
      "</aside>" +
      '<div class="lib-main">' +
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
        const col = new Intl.Collator("ar", {
          numeric: true,
          sensitivity: "base",
        });
        if (sort === "az")
          list = list.slice().sort((a, b) => col.compare(a.title, b.title));
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
        const head =
          `<div class="lib-h"><h1${L()}>${esc(pillar ? t("p_" + pillar) : t("lib_series"))}</h1><span class="muted"${L()}>${esc(t("results", { n: nf(list.length) }))}</span></div>` +
          (qq && hits
            ? `<p class="scope"${L()}>${esc(t("match_lessons", { n: nf(hits) }))} <a class="link" href="#/library?scope=all&q=${encodeURIComponent(input.value.trim())}">${esc(t("show_lessons"))}</a></p>`
            : "");
        // default view: grouped by pillar in the classical order, occasions last
        const grouped = sort === "catalog" && !qq;
        const groups = grouped
          ? PILLARS.concat("occasions").filter((k) => !pillar || k === pillar)
          : [null];
        const body = !list.length
          ? emptyBox(t("nothing"), "#/library", t("clear"))
          : groups
              .map((k) => {
                const ls = k ? list.filter((p) => pillarOf(p.id) === k) : list;
                if (!ls.length) return "";
                return (
                  '<section class="pgroup">' +
                  (k && !pillar
                    ? `<div class="pgroup-h"><span class="glyph" aria-hidden="true">${GLYPH[k]}</span><div><h2${L()}>${esc(t("p_" + k))}</h2><p${L()}>${esc(t("d_" + k))}</p></div><span class="rule"></span></div>`
                    : "") +
                  '<div class="grid">' +
                  ls.map((p) => seriesCard(p)).join("") +
                  "</div></section>"
                );
              })
              .join("");
        flip(res, () => (res.innerHTML = head + body));
      } else {
        const list = sortVideos(
          libVideos(scope).filter((v) => !qq || vNorm.get(v.id).includes(qq)),
          sort,
        );
        if (!$(".grid", res))
          res.innerHTML =
            '<div class="lib-h"></div><div class="grid" id="libGrid"></div>';
        $(".lib-h", res).innerHTML =
          `<h1${L()}>${esc(t(LABEL[scope]))}</h1><span class="muted"${L()}>${esc(t("results", { n: nf(list.length) }))}</span>`;
        const grid = $("#libGrid");
        if (!list.length) {
          if (grid._stop) grid._stop();
          grid.innerHTML = "";
          grid.insertAdjacentHTML("afterend", "");
          grid.innerHTML =
            '<div style="grid-column:1/-1">' +
            emptyBox(t("nothing"), "#/library?scope=" + scope, t("clear")) +
            "</div>";
        } else mountList(grid, list, (v) => lessonCard(v));
      }
    };
    paint();
    let timer;
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
      timer = setTimeout(() => {
        paint();
        sync();
      }, 160);
    });
    $("#libSearch").addEventListener("submit", (e) => {
      e.preventDefault();
      clearTimeout(timer);
      paint();
      sync();
    });
    wireSort("libSort", (s) => {
      rememberSort(surface, s);
      sort = s;
      $("#libSort").outerHTML = sortMenu("libSort", sorts, sort);
      wireSort("libSort", arguments.callee);
      paint();
    });
  }

  /* ---------- Playlist ---------- */
  function renderPlaylist(id, q) {
    const p = plById.get(id);
    if (!p) return go("#/library");
    const items = plItems.get(p.id);
    const firstResume = items.find((v) => canResume(v));
    const sorts = ["order", "new", "old", "long", "short", "az"];
    let sort = pickSort("playlist", sorts, q);
    let inSeries = q.get("in") === "1";
    const first = earliest(p);
    $("#v-playlist").innerHTML =
      '<div class="wrap"><div class="pl-band" aria-hidden="true"></div>' +
      `<nav class="crumb"${L()}><a href="#/library">${esc(t("back_lib"))}</a>${icon("i-chev", "arrow fwd")}<span${AR}>${esc(p.title)}</span></nav>` +
      `<header class="ph"><div class="cover framed scard"><span class="corner a">${kh()}</span><span class="corner b">${kh()}</span><span class="arch${p.cover ? "" : " noimg"}">${imgTag(p.cover)}</span></div>` +
      `<div>${kh("ph-kh")}<span class="eyebrow"${L()}>${esc(notSheikh(p.id) ? scholarOfPl(p.id) : t("sheikh_full"))}</span><h1${AR}>${esc(p.title)}</h1>` +
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
          '<div style="grid-column:1/-1">' + emptyBox(t("nothing")) + "</div>";
      }
    };
    scopeLine();
    paint();
    let timer;
    input.addEventListener("input", () => {
      if (!inSeries) return;
      clearTimeout(timer);
      timer = setTimeout(paint, 160);
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
      $("#v-lesson").innerHTML =
        '<div class="wrap ls"><div class="ls-main">' +
        `<div class="stage" dir="ltr"><video id="vid" controls playsinline preload="metadata"></video><div class="cap" id="cap" hidden></div><div class="buf" id="buf" aria-hidden="true">${kh()}</div></div>` +
        '<div class="notice" id="notice" role="alert" hidden></div><div id="lsInfo"></div><div class="panel tx" id="txPanel" hidden></div></div><aside id="lsSide"></aside></div>';
      const video = $("#vid");
      cur = {
        v,
        video,
        cues: [],
        capLang: "",
        lastSave: 0,
        tx: null,
        txLang: q.get("tx") || "",
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
      video.addEventListener("ended", () => {
        st.done[v.id] = 1;
        delete st.prog[v.id];
        store(K.done, st.done);
        store(K.prog, st.prog);
      });
      video.addEventListener("error", () => probeError(v, p));
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
      video.src = v.media;
      const cc = q.get("cc");
      if (cc === "ar" || cc === "en") setCaptions(cc);
      Rec.stop();
      const pr = video.play();
      if (pr && pr.catch) pr.catch(() => {});
    }
    const items = p ? plItems.get(p.id) : [];
    const idx = items.findIndex((x) => x.id === v.id);
    const prev = idx > 0 ? items[idx - 1] : null,
      next = idx >= 0 && idx < items.length - 1 ? items[idx + 1] : null;
    const lk = (x) => lessonHref(x, p && p.id);
    const capBtn = (lang) => {
      const s = subFor(v, lang);
      return s && s.src
        ? `<button class="btn small" type="button" data-cap="${lang}" aria-pressed="${cur.capLang === lang}">${esc(t("cap_" + lang))}</button>`
        : "";
    };
    $("#lsInfo").innerHTML =
      `<h1${AR}>${esc(v.title)}</h1><div class="ls-meta"${L()}>` +
      (p
        ? `<a class="pill" href="#/playlist/${encodeURIComponent(p.id)}"${AR}>${esc(p.title)}</a>`
        : `<span class="pill">${esc(t("no_series"))}</span>`) +
      `<span class="pill">${esc(scholarOf(v))}</span><span class="pill ltr">${esc(dur(v.duration))}</span><span class="pill">${esc(t("published", { d: date(v.uploadDate) }))}</span></div>` +
      `<div class="ls-acts"${L()}>${starBtn(v.id, "lg")}` +
      (canResume(v) && !q.get("resume")
        ? `<button class="btn small" type="button" id="lsResume">${icon("i-resume")}${esc(t("ls_resume_at", { t: dur(progOf(v.id)) }))}</button>`
        : "") +
      capBtn("ar") +
      capBtn("en") +
      "</div>" +
      (prev || next
        ? `<div class="nextprev"${L()}>` +
          (prev
            ? `<a href="${lk(prev)}">${icon("i-chev", "arrow back")}<span class="t"><small>${esc(t("ls_prev"))}</small><span${AR}>${esc(prev.title)}</span></span></a>`
            : "") +
          (next
            ? `<a href="${lk(next)}"><span class="t"><small>${esc(t("ls_next"))}</small><span${AR}>${esc(next.title)}</span></span>${icon("i-chev", "arrow fwd")}</a>`
            : "") +
          "</div>"
        : "");
    // series list: a window around the current lesson keeps very long series light
    const lo = Math.max(0, idx - 20),
      hi = Math.min(items.length, Math.max(idx, 0) + 40);
    $("#lsSide").innerHTML = p
      ? `<div class="panel"><h2${L()}>${esc(t("ls_series"))}</h2><div class="ulist">` +
        items
          .slice(lo, hi)
          .map(
            (x, i) =>
              `<a href="${lk(x)}"${x.id === v.id ? ' class="cur" aria-current="true"' : ""}><span class="n">${lo + i + 1}</span>` +
              `<span class="thumb${x.thumbnail ? "" : " noimg"}">${imgTag(x.thumbnail)}</span><span class="tt"${AR}>${esc(x.title)}</span></a>`,
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
  function paintCap() {
    const box = $("#cap");
    if (!box || !cur) return;
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
      `<div class="tx-h"${L()}><h2>${esc(t("tx_title"))}</h2>` +
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
        .join("");
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
      if (cur && cur.v.id === vid)
        body.innerHTML = `<span${L()}>${esc(t("tx_fail"))}</span>`;
    }
  }
  function syncTx(force) {
    if (!cur || !cur.tx || !cur.tx.lines.length) return;
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
    if (Date.now() - cur.tx.quiet > 4000)
      body.scrollTo({
        top: el.offsetTop - body.clientHeight * 0.35,
        behavior: calm() ? "auto" : "smooth",
      });
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
      showNotice(
        `<p${L()}><b>${esc(t("err_404"))}</b></p>` +
          `<div class="acts"${L()}><a class="btn small" href="${p ? "#/playlist/" + encodeURIComponent(p.id) : "#/library"}">${esc(t(p ? "back_series" : "back_lib"))}</a></div>` +
          `<details${L()}><summary>${esc(t("err_details"))}</summary><p style="margin-top:8px">${esc(t("err_where"))}</p><code>${esc(rel)}</code>` +
          (folder && folder.videos_exists === false
            ? `<p style="margin-top:8px">${esc(t("err_nofolder"))}</p>`
            : "") +
          "</details>",
      );
    } else {
      showNotice(
        `<p${L()}>${esc(t("err_format"))}</p><div class="acts"${L()}><a class="btn small" href="${esc(v.media)}" target="_blank" rel="noopener">${esc(t("open_file"))}</a></div>`,
      );
    }
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
      `<p${AR} style="font-weight:500">${esc(v.title)}</p>` + rows;
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
            `<p${L()}>${esc(t("sort_first"))} <span${AR}>${esc(f.title)}</span></p><p class="muted"${L()}>${esc(t("sort_time", { h: hours(stepTime(s)) }))}</p></div></a>`
          );
        })
        .join("") +
      "</div>" +
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
                `<li><a href="#/playlist/${encodeURIComponent(p.id)}"${AR}>${esc(p.title)}</a><span class="m lv">${esc(t("lv_" + levelOf(p.id)))}</span><span class="m">${esc(lessonsN(plCount(p.id)))} · <span class="ltr">${esc(hours(plDur.get(p.id)))}</span></span></li>`,
            )
            .join("") +
          (s.arabic
            ? `<li class="sub"><span class="k">${esc(t("arabic_k"))}</span><span>${esc(t("arabic_v"))} <a href="#/playlist/${encodeURIComponent(s.arabic)}"${AR}>${esc(plById.get(s.arabic).title)}</a></span></li>`
            : "") +
          `<li class="tot">${esc(t("step_total", { n: lessonsN(stepCount(s)), h: hours(stepTime(s)) }))}</li></ul></div>` +
          `<label class="tick"${L()}><input type="checkbox" data-tick="${s.k}"${done ? " checked" : ""}><span class="box"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.2 4.2L19 7" pathLength="100"/></svg></span>${esc(t("done_tick"))}</label></li>`
        );
      }).join("") +
      "</ol>" +
      medal() +
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
        : emptyBox(t("sv_empty"), "#/library", t("browse"))) +
      "</div>";
    if (list.length) mountList($("#svGrid"), list, (v) => lessonCard(v));
  }

  /* ---------- About hub: About the library, Mission, The Sheikh ---------- */
  const sheikhLessons = () =>
    VIDEOS.filter((v) => !v.playlistIds.some(notSheikh));
  let status = null;
  function statsRow(cells) {
    return (
      `<div class="stats"${L()}>` +
      cells
        .map(
          ([n, k]) =>
            `<div class="stat"><b>${n}</b><span>${esc(t(k))}</span></div>`,
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
          [nf(STATS.videos), "st_videos"],
          [nf(STATS.series), "st_series"],
          [nf(STATS.hours), "st_hours"],
          [yearsRange(STATS.years), "st_years"],
        ]) +
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
      const hrs = Math.round(
        own.reduce((a, v) => a + (v.duration || 0), 0) / 3600,
      );
      html =
        `<header class="page-h"><div class="sheikh-mono" role="img" aria-label="${esc(t("sheikh_full"))}">${kh()}<span>م ك</span></div>` +
        `<h1${AR}>فضيلة الشيخ الدكتور مصطفى كامل</h1><p lang="en" dir="ltr" style="font-family:var(--font-lat-head);font-size:20px">${esc(t("sh_en"))}</p>` +
        `<p class="role"${L()}>${esc(t("sh_role"))}</p></header>` +
        statsRow([
          [nf(own.length), "sh_k_lessons"],
          [nf(sheikhSeries.length), "sh_k_series"],
          [nf(hrs), "sh_k_hours"],
          [yearsRange(yearsOf(own)), "sh_k_years"],
        ]) +
        `<div class="prose"${L()}><h2>${esc(t("sh_series_t"))}</h2>` +
        PILLARS.concat("occasions")
          .map((k) => {
            const ls = sheikhSeries.filter((p) => pillarOf(p.id) === k);
            return ls.length
              ? `<h3 class="idx-h">${esc(t("p_" + k))}</h3><ul class="idx">` +
                  ls
                    .map(
                      (p) =>
                        `<li><a href="#/playlist/${encodeURIComponent(p.id)}"${AR}>${esc(p.title)}</a><span class="m">${esc(lessonsN(plCount(p.id)))} · <span class="ltr">${esc(hours(plDur.get(p.id)))}</span></span></li>`,
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
        ? t("det_found", { n: nf(status.videos_count) })
        : t("det_missing");
    const row = (k, v) =>
      `<div class="row" style="display:grid;grid-template-columns:200px 1fr;gap:14px;padding:10px 0;border-bottom:1px solid var(--line-soft)"><span class="muted">${esc(t(k))}</span><span>${v}</span></div>`;
    box.innerHTML =
      row("det_lessons", esc(nf(VIDEOS.length))) +
      row("det_folder", esc(folder)) +
      row(
        "det_edition",
        '<span class="ltr">v3 · ' + esc(CATALOG_VERSION) + "</span>",
      );
  }

  /* ---------- Recitation slot: silent by default, one audio manager ---------- */
  const Rec = (() => {
    const a = $("#recAudio");
    const SRC = "Preview/assets/recitation.mp3";
    let avail = false,
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
      .catch(ui);
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
      toast(t(st.fav[id] ? "toast_saved" : "toast_removed"));
      return;
    }
    const lg = e.target.closest("[data-langs]");
    if (lg) return openLangs(lg.dataset.langs);
    const cap = e.target.closest("[data-cap]");
    if (cap) return setCaptions(cap.dataset.cap);
    const tx = e.target.closest("[data-tx]");
    if (tx && cur) return showTranscript(cur.v, tx.dataset.tx);
    const cue = e.target.closest("[data-cue]");
    if (cue && cur && cur.tx) {
      const c = cur.tx.lines[+cue.dataset.cue];
      cur.tx.quiet = 0;
      cur.video.currentTime = c.a + 0.01;
      const pr = cur.video.play();
      if (pr && pr.catch) pr.catch(() => {});
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
    let force = false,
      skip = false;
    try {
      const qs = new URLSearchParams(location.search);
      force = qs.get("splash") === "1";
      skip =
        sessionStorage.getItem("archive-v3-entered") === "1" ||
        qs.get("splash") === "0";
    } catch (_) {}
    if (skip && !force) return;
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
      try {
        sessionStorage.setItem("archive-v3-entered", "1");
      } catch (_) {}
      sp.classList.add("gone");
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", lay);
      setTimeout(
        () => {
          sp.hidden = true;
          sky.innerHTML = "";
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
    setTimeout(() => $("#enterBtn").focus({ preventScroll: true }), 50);
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
