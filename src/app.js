(function () {
  "use strict";

  /* ---------- Catalog ---------- */
  const VIDEOS = DATA.videos,
    PLAYLISTS = DATA.playlists;
  const byId = new Map(VIDEOS.map((v) => [v.id, v]));
  const plById = new Map(PLAYLISTS.map((p) => [p.id, p]));
  const IMAD_PL = "PLXKSrZvHoN9dOyWCCK6Qm8AS4blW3Ylwm"; // "Aqeeda by Dr Imad Bayoun": the one series by another teacher
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
  // Where to Start: series matched to each step by title. The match is the archive's suggestion, shown as "to be confirmed".
  const PATH = [
    {
      k: "beliefs",
      lvl: 1,
      pl: [
        "PLXKSrZvHoN9dcyYB5Lj6Hqs3EmxTeVQco",
        "PLXKSrZvHoN9e4KqDBpbjQWPNbyfbJJcTJ",
      ],
    },
    {
      k: "worship",
      lvl: 1,
      pl: [
        "PLXKSrZvHoN9fEH_7KlObTnFl6bosi6hhK",
        "PLXKSrZvHoN9dUDuKuf8-f5XgcW_kWYg0F",
      ],
    },
    {
      k: "seerah",
      lvl: 1,
      pl: [
        "PLXKSrZvHoN9emB4zgG2yhM0Z3LHPvAn1h",
        "PLXKSrZvHoN9fms9EcNTJLYIuQZOAtbrDp",
      ],
    },
    {
      k: "quran",
      lvl: 2,
      pl: [
        "PLXKSrZvHoN9cmAY-O5kHl5JBsujbnpfIU",
        "PLXKSrZvHoN9fz8szdMcBHFh9YGlhQKx7j",
      ],
    },
    {
      k: "character",
      lvl: 2,
      pl: [
        "PLXKSrZvHoN9f0cRApDehj1CezvbQG0CFm",
        "PLXKSrZvHoN9cw5DTXW18ezysEVTW9AFHX",
      ],
    },
    {
      k: "deeper",
      lvl: 3,
      pl: [
        "PLXKSrZvHoN9cRVxTmvl6E_P0i3jwPdatw",
        "PLXKSrZvHoN9ca3_xdOlEaeF3Y7yXs_q-L",
        "PLXKSrZvHoN9cf7lGMyZjw0cndaCk004f0",
      ],
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
  const PAGE = 36;

  /* ---------- Strings (Arabic first; never an em dash) ---------- */
  const S = {
    ar: {
      skip: "تخطَّ إلى المحتوى",
      brand_sub: "مكتبة دروس تعمل بلا إنترنت",
      nav_home: "الرئيسية",
      nav_library: "المكتبة",
      nav_start: "من أين أبدأ؟",
      nav_saved: "المحفوظات",
      nav_about: "عن المكتبة",
      nav_mission: "رسالتنا",
      nav_sheikh: "عن الشيخ",
      theme: "الألوان",
      th_emerald: "زمرّدي",
      th_parchment: "رقّ",
      th_midnight: "ليلي",
      th_sand: "رملي",
      th_sunset: "غروب",
      th_puredark: "داكن تام",
      rec_label: "تلاوة الآية",
      rec_play: "تشغيل التلاوة",
      rec_pause: "إيقاف مؤقت",
      rec_replay: "إعادة من البداية",
      rec_mute: "كتم الصوت",
      rec_unmute: "إلغاء الكتم",
      rec_vol: "مستوى الصوت",
      rec_none: "التلاوة بانتظار الترخيص، ولا يوجد تسجيل مرفق.",
      rec_ready: "التلاوة جاهزة. اضغط تشغيل للاستماع.",
      rec_playing: "تُتلى الآن",
      rec_blocked: "لم يسمح المتصفح بالتشغيل. اضغط تشغيل مرة أخرى.",
      foot_note: "كل شيء هنا يعمل من هذا الجهاز، بلا إنترنت وبلا تتبع.",
      hero_title: "مكتبة فضيلة الشيخ الدكتور مصطفى كامل",
      hero_promise:
        "دروس موثوقة، مرتبة في سلاسل، محفوظة على جهازك وتعمل بلا إنترنت.",
      search_ph: "ابحث في الدروس والسلاسل...",
      search_go: "بحث",
      browse: "تصفح المكتبة",
      continue: "تابع المشاهدة",
      r_continue: "تابع من حيث توقفت",
      r_featured: "سلاسل مختارة",
      r_scholars: "العلماء",
      see_all: "عرض الكل",
      cont_empty:
        "لم تبدأ أي درس بعد. إن لم تعرف من أين تبدأ، فهذه الصفحة ترشدك خطوة بخطوة.",
      go_start: "من أين أبدأ؟",
      prev: "السابق",
      next: "التالي",
      sheikh_short: "الشيخ مصطفى كامل",
      sheikh_full: "فضيلة الشيخ الدكتور مصطفى كامل",
      imad: "الدكتور عماد بيون",
      sch_lessons: "{n} درسًا في {s} سلسلة",
      sch_open: "صفحة الشيخ",
      sch_series: "افتح السلسلة",
      open: "افتح",
      save: "احفظ",
      saved: "محفوظ",
      resume: "أكمل",
      langs: "اللغات والنصوص",
      offline: "محفوظ على هذا الجهاز",
      lessons_n: "{n} درسًا",
      lesson_1: "درس واحد",
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
      sort: "الترتيب",
      s_order: "ترتيب القائمة",
      s_catalog: "ترتيب الفهرس",
      s_az: "أبجديًا",
      s_most: "الأكثر دروسًا",
      s_new: "الأحدث",
      s_old: "الأقدم",
      s_long: "الأطول",
      s_short: "الأقصر",
      results: "{n} نتيجة",
      show_more: "عرض المزيد",
      match_lessons: "وُجد {n} درسًا يطابق بحثك.",
      show_lessons: "اعرضها",
      nothing: "لا توجد نتائج مطابقة. جرّب كلمة أقصر أو تصفح السلاسل.",
      clear: "امسح البحث",
      scope_in: "البحث داخل هذه السلسلة فقط.",
      scope_all: "ابحث في المكتبة كلها",
      pl_start: "ابدأ من أقدم درس",
      pl_resume: "أكمل من حيث توقفت",
      pl_hours: "المدة الإجمالية {h}",
      back_lib: "المكتبة",
      ls_series: "دروس السلسلة",
      ls_all_series: "افتح صفحة السلسلة",
      ls_prev: "الدرس السابق",
      ls_next: "الدرس التالي",
      ls_resume_at: "أكمل من {t}",
      cap_ar: "ترجمة عربية",
      cap_en: "ترجمة إنجليزية",
      cap_off: "إخفاء الترجمة",
      tx_ar: "النص العربي",
      tx_en: "النص الإنجليزي",
      tx_loading: "جارٍ تحميل النص...",
      tx_fail: "تعذّر فتح ملف النص على هذا الجهاز.",
      cap_loading: "جارٍ تحميل الترجمة...",
      cap_fail: "تعذّر تحميل ملف الترجمة. ما زال بإمكانك قراءة النص الكامل.",
      open_file: "افتح الملف مباشرة",
      err_404: "ملف الفيديو غير موجود على هذا الجهاز.",
      err_where:
        "المكان المتوقع داخل مجلد الأرشيف (المجلد الذي يضم مجلد Preview):",
      err_nofolder: "ولم يُعثر على مجلد videos نفسه بجانب مجلد Preview.",
      err_format:
        "هذا المتصفح لا يستطيع تشغيل صيغة هذا الملف. افتحه ببرنامج تشغيل مثل VLC.",
      dlg_none: "لا توجد ترجمات أو نصوص لهذا الدرس.",
      dlg_captions: "شاهد مع الترجمة",
      dlg_read: "اقرأ النص",
      lang_ar: "العربية",
      lang_en: "الإنجليزية",
      tbc: "بانتظار التأكيد",
      st_kicker: "من أين أبدأ؟",
      st_title: "طريق واضح لمن يبدأ",
      st_lede:
        "لا تحتاج أن تختار من آلاف الدروس. ابدأ بجلسة واحدة، ثم اتبع الخطوات بالترتيب.",
      st_first_tag: "جلستك الأولى",
      st_first_t: "ابدأ هنا بدرس واحد قصير",
      st_first_p:
        "درس واحد قصير تبدأ به اليوم. اختارته المكتبة حسب الموضوع والمدة، وما زال بانتظار تأكيد فريق الشيخ.",
      st_watch: "شاهد الآن",
      st_min: "دقيقة",
      st_sort_t: "أي هذه أقرب إليك؟",
      st_sort_p: "اختر بطاقة واحدة، وابدأ من الخطوة التي تشير إليها.",
      sort_a_t: "جديد على الإسلام أو عائد إليه",
      sort_a_p: "ابدأ بالأساس: ماذا نؤمن به، ثم كيف نصلي.",
      sort_b_t: "أصلي، وأريد فهمًا أعمق",
      sort_b_p: "تعرّف على حياة النبي ﷺ، ثم اقترب من القرآن.",
      sort_c_t: "أقرأ العربية وأريد التعمق",
      sort_c_p: "العلوم المتقدمة، بعد التأكد من الخطوات الخمس الأولى.",
      sort_from: "ابدأ من الخطوة {n}",
      sort_first: "أول سلسلة: {t}",
      sort_time: "مدة سلاسل هذه الخطوة: {h}",
      st_path_t: "الطريق في ست خطوات",
      st_path_p:
        "كل خطوة تبني على ما قبلها. لا تستعجل، وعلّم الخطوة حين تنهيها.",
      step_beliefs: "العقيدة",
      step_worship: "العبادة",
      step_seerah: "السيرة النبوية",
      step_quran: "القرآن",
      step_character: "الأخلاق والتزكية",
      step_deeper: "العلوم المتقدمة",
      d_beliefs:
        "ما يؤمن به المسلم، بكلمات بسيطة: الإيمان بالله وأسمائه وصفاته وأركان الإيمان.",
      d_worship: "الطهارة والصلاة خطوة بخطوة، ثم بقية العبادات.",
      d_seerah: "حياة النبي ﷺ، وكيف كان القدوة في العقيدة والعبادة.",
      d_quran: "التلاوة الصحيحة أولًا، ثم معاني السور وتفسيرها.",
      d_character: "الأخلاق في البيت والعمل والتعامل مع الناس، وتزكية النفس.",
      d_deeper:
        "أصول الفقه، ومصطلح الحديث، وشرح كتب الحديث. فقط بعد الخطوات من ١ إلى ٥.",
      lvl1: "مستوى: مبتدئ",
      lvl2: "مستوى: متوسط",
      lvl3: "مستوى: متقدم",
      pre_none: "لا يحتاج إلى سابق",
      pre_step: "بعد الخطوة {n}",
      pre_all: "بعد الخطوات ١ إلى ٥",
      step_series: "سلاسل مقترحة:",
      done_tick: "أنهيتها",
      st_skip_t: "ما الذي لا تبدأ به",
      st_skip_p:
        "لا تبدأ بمسائل الخلاف الفقهي الدقيقة، ولا بتفسير القرآن كاملًا من أوله إلى آخره. هذه تأتي لاحقًا.",
      st_stuck_t: "إذا توقفت عند شيء",
      st_stuck_p:
        "أعد مشاهدة الدرس، واقرأ نصه إن وُجد، واسأل معلمًا تثق به في بلدك. هذه المكتبة لا تجيب عن الأسئلة الشخصية.",
      st_rhythm_t: "إيقاع مقترح",
      st_rhythm_p:
        "درس واحد في اليوم، من عشرين إلى ثلاثين دقيقة. المدد الدقيقة لكل مسار بانتظار التأكيد.",
      ab_kicker: "عن المكتبة",
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
      ab_scope_t: "المكتبة بالأرقام",
      st_videos: "درسًا",
      st_series: "سلسلة",
      st_hours: "ساعة تقريبًا",
      st_years: "سنوات النشر",
      ab_src_t: "المصادر والمنهج",
      ab_src_p:
        "عناوين الدروس وتواريخها وترتيبها داخل السلاسل تظهر كما هي في فهرس الأرشيف، دون إعادة صياغة. الترجمات والنصوص تظهر فقط حيث توجد ملفاتها.",
      ab_off_t: "كيف تعمل بلا إنترنت",
      ab_off_p:
        "تعمل المكتبة من مجلد على جهازك. لا حساب، ولا إعلانات، ولا تتبع. تقدمك ومحفوظاتك تبقى في هذا المتصفح على هذا الجهاز فقط.",
      ab_fix_t: "التصحيحات والتواصل",
      ab_fix_p: "طريقة الإبلاغ عن خطأ:",
      ab_credit_t: "شكر وإسناد",
      ab_credit_p:
        "الخطوط المستخدمة مفتوحة الترخيص (SIL Open Font License 1.1): Amiri Quran وAmiri للآية والعناوين، وNoto Sans Arabic للنصوص، وReem Kufi للشعار. التلاوة: لا يوجد تسجيل مرفق حتى يُحصل على ترخيص مكتوب.",
      mi_kicker: "رسالتنا",
      mi_title: "لماذا نحفظ هذه الدروس؟",
      mi_lede:
        "أن يتعلم الطالب دينه من القرآن والسنة أولًا، على يد عالم، بترتيب واضح.",
      mi_draft: "الصياغة مسودة، بانتظار تأكيد فريق الشيخ.",
      p1_t: "تفنيد الشبهات",
      p1_p: "جواب هادئ بالدليل من القرآن والسنة عن الأسئلة والشبهات التي تصل إلى الناس اليوم.",
      p2_t: "ترسيخ اليقين",
      p2_p: "إيمان مبني على الفهم والدليل، يُبنى درسًا بعد درس، لا على التقليد وحده.",
      p3_t: "إلهام العطاء",
      p3_p: "العلم أمانة. من تعلّم شيئًا نافعًا علّمه أهله وجيرانه، وكان عونًا لمن حوله.",
      mi_how_t: "كيف يظهر ذلك في المكتبة",
      mi_how_1: "كل درس يحمل اسم سلسلته وتاريخ نشره.",
      mi_how_2: "الترجمات والنصوص متاحة حيث توجد ملفاتها.",
      mi_how_3: "لا إعلانات ولا تتبع، ولا شيء يشغلك عن الدرس.",
      mi_how_4: "ترتيب السلاسل محفوظ، لأن الدرس خارج ترتيبه يضيّع الفائدة.",
      sh_kicker: "عن الشيخ",
      sh_en: "Sheikh Dr. Moustafa Kamel",
      sh_known_t: "ما نعرفه من هذا الأرشيف",
      sh_src: "المصدر: فهرس هذا الأرشيف نفسه. لا شيء هنا مختلق.",
      sh_k_lessons: "الدروس في المكتبة",
      sh_k_series: "السلاسل",
      sh_k_years: "سنوات النشر",
      sh_k_hours: "مجموع الساعات",
      sh_k_lang: "لغة الدروس",
      sh_lang_v: "العربية، وسلسلة دروس بالإنجليزية",
      sh_tbc_t: "سيرة تحتاج إلى تأكيد",
      sh_tbc_p:
        "لن يُكتب هنا شيء عن الشيوخ والإجازات والمناصب إلا من مصدر موثوق.",
      sh_k_kunya: "الكنية",
      sh_k_edu: "الدراسة والشهادات",
      sh_k_teachers: "شيوخه",
      sh_k_ijazat: "الإجازات",
      sh_k_posts: "التدريس والمناصب",
      sh_k_works: "المؤلفات",
      sh_k_method: "منهجه في التدريس كما يصفه",
      sh_series_t: "سلاسل الشيخ في هذه المكتبة",
      sv_title: "دروسك المحفوظة",
      sv_lede: "كل درس تحفظه يظهر هنا، جاهزًا حين تعود.",
      sv_empty: "لم تحفظ أي درس بعد. اضغط «احفظ» على أي درس ليظهر هنا.",
    },
    en: {
      skip: "Skip to content",
      brand_sub: "An offline library of lessons",
      nav_home: "Home",
      nav_library: "Library",
      nav_start: "Where to Start",
      nav_saved: "Saved",
      nav_about: "About",
      nav_mission: "Mission",
      nav_sheikh: "The Sheikh",
      theme: "Colours",
      th_emerald: "Emerald",
      th_parchment: "Parchment",
      th_midnight: "Midnight",
      th_sand: "Sand",
      th_sunset: "Sunset",
      th_puredark: "Pure dark",
      rec_label: "Verse recitation",
      rec_play: "Play recitation",
      rec_pause: "Pause",
      rec_replay: "Replay from the start",
      rec_mute: "Mute",
      rec_unmute: "Unmute",
      rec_vol: "Volume",
      rec_none: "Recitation licence pending, no recording bundled.",
      rec_ready: "Recitation ready. Press play to listen.",
      rec_playing: "Playing",
      rec_blocked: "The browser blocked playback. Press play again.",
      foot_note:
        "Everything here runs from this computer, with no internet and no tracking.",
      hero_title: "The Library of Sheikh Dr. Moustafa Kamel",
      hero_promise:
        "Trusted lessons, ordered in series, stored on your computer and working without internet.",
      search_ph: "Search lessons and series...",
      search_go: "Search",
      browse: "Browse Library",
      continue: "Continue Watching",
      r_continue: "Continue where you left off",
      r_featured: "Featured Series",
      r_scholars: "Scholars",
      see_all: "See all",
      cont_empty:
        "You have not started a lesson yet. If you are not sure where to begin, this page guides you step by step.",
      go_start: "Where to Start",
      prev: "Previous",
      next: "Next",
      sheikh_short: "Sheikh Moustafa Kamel",
      sheikh_full: "Sheikh Dr. Moustafa Kamel",
      imad: "Dr. Imad Bayoun",
      sch_lessons: "{n} lessons in {s} series",
      sch_open: "About the Sheikh",
      sch_series: "Open the series",
      open: "Open",
      save: "Save",
      saved: "Saved",
      resume: "Resume",
      langs: "Languages & Text",
      offline: "Stored on this computer",
      lessons_n: "{n} lessons",
      lesson_1: "1 lesson",
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
      sort: "Sort",
      s_order: "Playlist order",
      s_catalog: "Catalogue order",
      s_az: "A to Z",
      s_most: "Most lessons",
      s_new: "Newest",
      s_old: "Oldest",
      s_long: "Longest",
      s_short: "Shortest",
      results: "{n} results",
      show_more: "Show more",
      match_lessons: "{n} lessons match your search.",
      show_lessons: "Show them",
      nothing: "Nothing matches yet. Try a shorter word, or browse the series.",
      clear: "Clear search",
      scope_in: "Searching inside this series only.",
      scope_all: "Search the whole library",
      pl_start: "Start with the earliest lesson",
      pl_resume: "Resume where you left off",
      pl_hours: "Total time {h}",
      back_lib: "Library",
      ls_series: "Lessons in this series",
      ls_all_series: "Open the series page",
      ls_prev: "Previous lesson",
      ls_next: "Next lesson",
      ls_resume_at: "Resume from {t}",
      cap_ar: "Arabic captions",
      cap_en: "English captions",
      cap_off: "Hide captions",
      tx_ar: "Arabic transcript",
      tx_en: "English transcript",
      tx_loading: "Loading the text...",
      tx_fail: "The transcript file could not be opened on this computer.",
      cap_loading: "Loading captions...",
      cap_fail:
        "The caption file could not be loaded. You can still read the full transcript.",
      open_file: "Open the file directly",
      err_404: "Video file not found on this computer.",
      err_where:
        "Expected location, inside the archive folder (the folder that holds Preview):",
      err_nofolder:
        "The videos folder itself was not found next to the Preview folder.",
      err_format:
        "This browser cannot play this file format. Open it in a player such as VLC.",
      dlg_none: "No captions or transcripts for this lesson.",
      dlg_captions: "Watch with captions",
      dlg_read: "Read the text",
      lang_ar: "Arabic",
      lang_en: "English",
      tbc: "to be confirmed",
      st_kicker: "Where to Start",
      st_title: "A clear path for beginners",
      st_lede:
        "You do not need to choose from thousands of lessons. Start with one session, then follow the steps in order.",
      st_first_tag: "Your first session",
      st_first_t: "Start here, with one short lesson",
      st_first_p:
        "One short lesson to begin with today. The library chose it by topic and length; the choice still awaits confirmation by the Sheikh's team.",
      st_watch: "Watch now",
      st_min: "minutes",
      st_sort_t: "Which one sounds like you?",
      st_sort_p: "Pick one card and begin at the step it points to.",
      sort_a_t: "New to Islam, or coming back",
      sort_a_p: "Start with the foundation: what we believe, then how to pray.",
      sort_b_t: "I pray, and want to understand more",
      sort_b_p:
        "Get to know the life of the Prophet ﷺ, then come closer to the Qur'an.",
      sort_c_t: "I read Arabic and want depth",
      sort_c_p: "The deeper sciences, once the first five steps are settled.",
      sort_from: "Begin at step {n}",
      sort_first: "First series: {t}",
      sort_time: "Time for this step's series: {h}",
      st_path_t: "The path in six steps",
      st_path_p:
        "Each step builds on the one before. Take your time, and tick a step when you finish it.",
      step_beliefs: "Beliefs",
      step_worship: "Worship",
      step_seerah: "The Prophet's life (Seerah)",
      step_quran: "The Qur'an",
      step_character: "Character and purification",
      step_deeper: "Deeper sciences",
      d_beliefs:
        "What a Muslim believes, in plain words: faith in Allah, His names and attributes, and the pillars of faith.",
      d_worship:
        "Purification and prayer step by step, then the other acts of worship.",
      d_seerah:
        "The life of the Prophet ﷺ, and how he is the example in belief and worship.",
      d_quran:
        "Correct recitation first, then the meanings and tafsir of the surahs.",
      d_character:
        "Character at home, at work and with people, and purifying the soul.",
      d_deeper:
        "Principles of fiqh, hadith terminology, and commentary on hadith collections. Only after steps 1 to 5.",
      lvl1: "Level: Beginner",
      lvl2: "Level: Intermediate",
      lvl3: "Level: Advanced",
      pre_none: "No prerequisite",
      pre_step: "After step {n}",
      pre_all: "After steps 1 to 5",
      step_series: "Suggested series:",
      done_tick: "Done",
      st_skip_t: "What not to start with",
      st_skip_p:
        "Do not start with fine points of disagreement in fiqh, or with a full commentary of the Qur'an from cover to cover. Those come later.",
      st_stuck_t: "If you get stuck",
      st_stuck_p:
        "Watch the lesson again, read its transcript if there is one, and ask a teacher you trust where you live. This library does not answer personal questions.",
      st_rhythm_t: "A suggested rhythm",
      st_rhythm_p:
        "One lesson a day, twenty to thirty minutes. Exact times for each path are still to be confirmed.",
      ab_kicker: "About",
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
      ab_scope_t: "The library in numbers",
      st_videos: "lessons",
      st_series: "series",
      st_hours: "hours, roughly",
      st_years: "years of publishing",
      ab_src_t: "Sources and method",
      ab_src_p:
        "Lesson titles, dates and their order inside each series appear exactly as they are in the archive's catalogue, with nothing rewritten. Captions and transcripts appear only where their files exist.",
      ab_off_t: "How it works offline",
      ab_off_p:
        "The library runs from a folder on your computer. No account, no adverts, no tracking. Your progress and saved lessons stay in this browser on this computer only.",
      ab_fix_t: "Corrections and contact",
      ab_fix_p: "How to report a mistake:",
      ab_credit_t: "Credits",
      ab_credit_p:
        "All fonts are openly licensed (SIL Open Font License 1.1): Amiri Quran and Amiri for the verse and headings, Noto Sans Arabic for text, Reem Kufi for the emblem. Recitation: no recording is bundled until a written licence is in place.",
      mi_kicker: "Mission",
      mi_title: "Why we keep these lessons",
      mi_lede:
        "So that a student learns the religion from the Qur'an and Sunnah first, through a scholar, in a clear order.",
      mi_draft:
        "This wording is a draft, awaiting confirmation by the Sheikh's team.",
      p1_t: "Dismantle doubts",
      p1_p: "A calm answer, with evidence from the Qur'an and Sunnah, to the questions and doubts people meet today.",
      p2_t: "Nurture conviction",
      p2_p: "Faith built on understanding and evidence, one lesson at a time, not on imitation alone.",
      p3_t: "Inspire contribution",
      p3_p: "Knowledge is a trust. Whoever learns something beneficial teaches it to family and neighbours, and becomes a help to those around them.",
      mi_how_t: "How this shows in the library",
      mi_how_1: "Every lesson carries its series name and its publishing date.",
      mi_how_2:
        "Captions and transcripts are there wherever their files exist.",
      mi_how_3:
        "No adverts and no tracking, nothing pulling you away from the lesson.",
      mi_how_4:
        "Series order is kept, because a lesson out of order loses its benefit.",
      sh_kicker: "About the Sheikh",
      sh_en: "Sheikh Dr. Moustafa Kamel",
      sh_known_t: "What this archive shows",
      sh_src: "Source: this archive's own catalogue. Nothing here is invented.",
      sh_k_lessons: "Lessons in the library",
      sh_k_series: "Series",
      sh_k_years: "Years of publishing",
      sh_k_hours: "Total hours",
      sh_k_lang: "Language of the lessons",
      sh_lang_v: "Arabic, plus one series of lectures in English",
      sh_tbc_t: "Biography awaiting confirmation",
      sh_tbc_p:
        "Nothing will be written here about his teachers, ijazat or posts except from a trusted source.",
      sh_k_kunya: "Kunya",
      sh_k_edu: "Studies and degrees",
      sh_k_teachers: "His teachers",
      sh_k_ijazat: "Ijazat",
      sh_k_posts: "Teaching and posts",
      sh_k_works: "Written works",
      sh_k_method: "His teaching method, in his words",
      sh_series_t: "The Sheikh's series in this library",
      sv_title: "Your saved lessons",
      sv_lede: "Every lesson you save appears here, ready when you return.",
      sv_empty:
        'You have not saved a lesson yet. Press "Save" on any lesson and it will appear here.',
    },
  };

  /* ---------- Storage (keys shared with the v1 page so progress carries over) ---------- */
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
      m = Math.round((sec % 3600) / 60);
    return st.lang === "ar"
      ? (h ? nf(h) + " س " : "") + nf(m) + " د"
      : (h ? h + "h " : "") + m + "m";
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
  const tbc = () =>
    '<span class="pill tbc"' + L() + ">[" + esc(t("tbc")) + "]</span>";
  const lessonsN = (n) =>
    n === 1 ? t("lesson_1") : t("lessons_n", { n: nf(n) });

  // Arabic-aware search: drop diacritics and tatweel, unify alef/ya/ta-marbuta forms and digits
  function norm(s) {
    return String(s || "")
      .toLowerCase()
      .replace(/[ً-ٰٟۖ-ۭـ]/g, "")
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
  const plDur = new Map(
    PLAYLISTS.map((p) => [
      p.id,
      p.items.reduce((a, it) => a + ((byId.get(it.id) || {}).duration || 0), 0),
    ]),
  );
  // playlists keep the channel's own order (mostly newest first), so "earliest" is the oldest upload
  function earliest(p) {
    let best = null;
    p.items.forEach((it, i) => {
      const v = byId.get(it.id);
      if (v && (!best || (v.uploadDate || "9") < (best.uploadDate || "9") || (v.uploadDate === best.uploadDate && i > best.i)))
        best = Object.assign({ i }, v);
    });
    return best ? byId.get(best.id) : null;
  }
  const sheikhSeries = PLAYLISTS.filter((p) => p.id !== IMAD_PL);
  const looseVideos = VIDEOS.filter((v) => !v.playlistIds.length);
  const STATS = (() => {
    const ds = VIDEOS.map((v) => v.uploadDate)
      .filter(Boolean)
      .sort();
    return {
      videos: VIDEOS.length,
      series: PLAYLISTS.length,
      hours: Math.round(
        VIDEOS.reduce((a, v) => a + (v.duration || 0), 0) / 3600,
      ),
      y0: ds[0].slice(0, 4),
      y1: ds[ds.length - 1].slice(0, 4),
    };
  })();
  const yearsRange = () => { const f = (y) => new Intl.NumberFormat(st.lang === "ar" ? "ar-EG" : "en", { useGrouping: false }).format(+y); return f(STATS.y0) + (st.lang === "ar" ? " إلى " : " to ") + f(STATS.y1); };
  const catCount = (c) =>
    VIDEOS.filter((v) => (v.categories || []).includes(c)).length;
  const CATS = {
    videos: catCount("videos"),
    streams: catCount("streams"),
    shorts: catCount("shorts"),
  };

  const scholarOf = (v) =>
    v.playlistIds.includes(IMAD_PL) ? t("imad") : t("sheikh_short");
  const seriesOf = (v, ctx) =>
    plById.get(ctx && v.playlistIds.includes(ctx) ? ctx : v.playlistIds[0]);
  const isFav = (id) => !!st.fav[id];
  const progOf = (id) => +st.prog[id] || 0;
  const canResume = (v) =>
    progOf(v.id) > 5 &&
    !st.done[v.id] &&
    (!v.duration || progOf(v.id) < v.duration - 10);
  function seriesPct(p) {
    let n = 0;
    for (const it of p.items) if (st.done[it.id] || progOf(it.id) > 5) n++;
    return p.items.length ? n / p.items.length : 0;
  }

  /* ---------- Cards ---------- */
  function imgTag(src) {
    return src
      ? '<img src="' +
          esc(src) +
          '" alt="" loading="lazy" decoding="async" onerror="this.parentNode.classList.add(\'noimg\')">'
      : "";
  }
  function lessonCard(v, ctx) {
    const p = seriesOf(v, ctx),
      pr = progOf(v.id),
      pct = st.done[v.id]
        ? 100
        : v.duration && pr
          ? Math.min(100, (pr / v.duration) * 100)
          : 0;
    const hasText = (v.subtitles || []).some(
      (s) => s && (s.lang === "ar" || s.lang === "en"),
    );
    const href =
      "#/lesson/" +
      encodeURIComponent(v.id) +
      (ctx ? "?pl=" + encodeURIComponent(ctx) : "");
    return (
      '<article class="lcard">' +
      '<a class="thumb' +
      (v.thumbnail ? "" : " noimg") +
      '" href="' +
      href +
      '" tabindex="-1" aria-hidden="true">' +
      imgTag(v.thumbnail) +
      '<span class="chip">' +
      esc(dur(v.duration)) +
      "</span>" +
      '<span class="off" title="' +
      esc(t("offline")) +
      '">' +
      icon("i-off") +
      "</span>" +
      (pct
        ? '<span class="prog"><i style="width:' +
          pct.toFixed(1) +
          '%"></i></span>'
        : "") +
      "</a>" +
      '<div class="lbody">' +
      '<span class="eyebrow"' +
      (p ? AR : L()) +
      ">" +
      esc(p ? p.title : t("no_series")) +
      "</span>" +
      '<a class="ltitle" href="' +
      href +
      '"' +
      AR +
      ">" +
      esc(v.title) +
      "</a>" +
      '<div class="lmeta"' +
      L() +
      "><span>" +
      esc(scholarOf(v)) +
      '</span><span class="ltr">' +
      esc(dur(v.duration)) +
      "</span><span>" +
      esc(t("published", { d: date(v.uploadDate) })) +
      "</span></div>" +
      '<div class="lacts"' +
      L() +
      ">" +
      '<a class="btn open" href="' +
      href +
      '">' +
      icon("i-play") +
      esc(t("open")) +
      "</a>" +
      '<button class="btn" type="button" data-fav="' +
      esc(v.id) +
      '" aria-pressed="' +
      isFav(v.id) +
      '">' +
      icon(isFav(v.id) ? "i-saved" : "i-save") +
      "<span>" +
      esc(t(isFav(v.id) ? "saved" : "save")) +
      "</span></button>" +
      (canResume(v)
        ? '<a class="btn" href="' +
          href +
          (ctx ? "&" : "?") +
          'resume=1">' +
          icon("i-resume") +
          esc(t("resume")) +
          "</a>"
        : "") +
      (hasText
        ? '<button class="btn" type="button" data-langs="' +
          esc(v.id) +
          '">' +
          icon("i-text") +
          esc(t("langs")) +
          "</button>"
        : "") +
      "</div></div></article>"
    );
  }
  function seriesCard(p) {
    const pct = seriesPct(p) * 100,
      href = "#/playlist/" + encodeURIComponent(p.id);
    return (
      '<article class="scard">' +
      '<a class="arch' +
      (p.cover ? "" : " noimg") +
      '" href="' +
      href +
      '" tabindex="-1" aria-hidden="true">' +
      imgTag(p.cover) +
      "</a>" +
      '<div class="sbody">' +
      '<span class="eyebrow"' +
      L() +
      ">" +
      esc(lessonsN(p.count)) +
      ' · <span class="ltr">' +
      esc(hours(plDur.get(p.id))) +
      "</span></span>" +
      '<a class="stitle" href="' +
      href +
      '"' +
      AR +
      ">" +
      esc(p.title) +
      "</a>" +
      '<div class="lmeta"' +
      L() +
      "><span>" +
      esc(p.id === IMAD_PL ? t("imad") : t("sheikh_short")) +
      '</span><span title="' +
      esc(t("offline")) +
      '">' +
      icon("i-off") +
      "</span></div>" +
      '<div class="sbar"><i style="width:' +
      pct.toFixed(1) +
      '%"></i></div>' +
      '<div class="lacts"' +
      L() +
      '><a class="btn open" href="' +
      href +
      '">' +
      icon("i-play") +
      esc(t("open")) +
      "</a></div>" +
      "</div></article>"
    );
  }
  function emptyBox(msg, link, label) {
    return (
      '<div class="empty"' +
      L() +
      '><span class="star" aria-hidden="true"></span><p>' +
      esc(msg) +
      "</p>" +
      (link
        ? '<a class="btn small" href="' + link + '">' + esc(label) + "</a>"
        : "") +
      "</div>"
    );
  }
  function secHead(title, more, moreHref, railId) {
    return (
      '<div class="sec-h"><h2' +
      L() +
      ">" +
      esc(title) +
      '</h2><span class="rule"></span>' +
      (more
        ? '<a class="more" href="' +
          moreHref +
          '"' +
          L() +
          ">" +
          esc(more) +
          "</a>"
        : "") +
      (railId
        ? '<div class="rail-nav"><button class="icon-btn" type="button" data-rail="' +
          railId +
          '" data-dir="-1" aria-label="' +
          esc(t("prev")) +
          '">' +
          icon("i-chev", "arrow back") +
          "</button>" +
          '<button class="icon-btn" type="button" data-rail="' +
          railId +
          '" data-dir="1" aria-label="' +
          esc(t("next")) +
          '">' +
          icon("i-chev") +
          "</button></div>"
        : "") +
      "</div>"
    );
  }

  /* ---------- Router ---------- */
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
    mission: renderMission,
    sheikh: renderSheikh,
  };
  function go(hash) {
    if (location.hash === hash) render();
    else location.hash = hash;
  }
  function render(opts) {
    const prev = route;
    route = parse();
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

  /* ---------- Home ---------- */
  function continueList() {
    return st.recent
      .map((id) => byId.get(id))
      .filter((v) => v && canResume(v))
      .slice(0, 12);
  }
  function renderHome() {
    const cont = continueList();
    const feat = FEATURED.map((id) => plById.get(id)).filter(Boolean);
    const imad = plById.get(IMAD_PL);
    $("#v-home").innerHTML =
      '<div class="hero"><span class="girih" aria-hidden="true"></span><span class="wm" aria-hidden="true">مصطفى كامل</span>' +
      '<div class="hero-in">' +
      "<h1" +
      L() +
      ">" +
      esc(t("hero_title")) +
      "</h1>" +
      '<p class="promise"' +
      L() +
      ">" +
      esc(t("hero_promise")) +
      "</p>" +
      '<form class="search" role="search" id="heroSearch">' +
      icon("i-search") +
      '<input type="search" name="q" dir="auto" placeholder="' +
      esc(t("search_ph")) +
      '" aria-label="' +
      esc(t("search_ph")) +
      '">' +
      '<button class="btn primary small" type="submit"' +
      L() +
      ">" +
      esc(t("search_go")) +
      "</button></form>" +
      '<div class="hero-btns"' +
      L() +
      '><a class="btn primary" href="#/library">' +
      esc(t("browse")) +
      "</a>" +
      '<a class="btn" href="' +
      (cont.length
        ? "#/lesson/" + encodeURIComponent(cont[0].id) + "?resume=1"
        : "#continue") +
      '" id="contBtn">' +
      icon("i-resume") +
      esc(t("continue")) +
      "</a></div>" +
      "</div></div>" +
      '<div class="wrap">' +
      '<section class="block" id="continue">' +
      secHead(t("r_continue"), null, null, cont.length > 4 ? "rc" : null) +
      (cont.length
        ? '<div class="rail" id="rc">' +
          cont.map((v) => lessonCard(v)).join("") +
          "</div>"
        : emptyBox(t("cont_empty"), "#/start", t("go_start"))) +
      "</section>" +
      '<section class="block">' +
      secHead(t("r_featured"), t("see_all"), "#/library", "rf") +
      '<div class="rail" id="rf">' +
      feat.map(seriesCard).join("") +
      "</div></section>" +
      '<section class="block">' +
      secHead(t("r_scholars")) +
      '<div class="rail" id="rs">' +
      '<article class="scard sch"><div class="mono" aria-hidden="true"><span>م ك</span></div>' +
      "<h3" +
      L() +
      ' style="font-size:20px">' +
      esc(t("sheikh_full")) +
      "</h3>" +
      '<p class="lmeta"' +
      L() +
      ">" +
      esc(
        t("sch_lessons", {
          n: nf(VIDEOS.length - (imad ? imad.count : 0)),
          s: nf(sheikhSeries.length),
        }),
      ) +
      "</p>" +
      '<div class="lacts"' +
      L() +
      '><a class="btn open" href="#/sheikh">' +
      esc(t("sch_open")) +
      "</a></div></article>" +
      (imad
        ? '<article class="scard sch"><div class="mono" aria-hidden="true"><span>ع ب</span></div>' +
          "<h3" +
          L() +
          ' style="font-size:20px">' +
          esc(t("imad")) +
          "</h3>" +
          '<p class="lmeta"' +
          L() +
          ">" +
          esc(t("sch_lessons", { n: nf(imad.count), s: nf(1) })) +
          "</p>" +
          '<div class="lacts"' +
          L() +
          '><a class="btn open" href="#/playlist/' +
          encodeURIComponent(IMAD_PL) +
          '">' +
          esc(t("sch_series")) +
          "</a></div></article>"
        : "") +
      "</div></section>" +
      "</div>";
    $("#heroSearch").addEventListener("submit", (e) => {
      e.preventDefault();
      const q = e.target.q.value.trim();
      go("#/library?scope=all" + (q ? "&q=" + encodeURIComponent(q) : ""));
    });
    if (!cont.length)
      $("#contBtn").addEventListener("click", (e) => {
        e.preventDefault();
        $("#continue").scrollIntoView({ behavior: "smooth" });
      });
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
  let libShown = PAGE;
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
  function renderLibrary(_, q, opts) {
    const scope = LIB_SCOPES.includes(q.get("scope"))
      ? q.get("scope")
      : "series";
    const query = q.get("q") || "";
    if (!opts.keepPage) libShown = PAGE;
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
    const label = {
      series: "lib_series",
      all: "lib_all",
      videos: "cat_videos",
      streams: "cat_streams",
      shorts: "cat_shorts",
      loose: "lib_loose",
      progress: "lib_prog",
      saved: "lib_saved",
    };
    const isSeries = scope === "series";
    const sorts = isSeries
      ? ["catalog", "az", "most", "new"]
      : ["new", "old", "long", "short", "az"];
    const sort = sorts.includes(q.get("sort")) ? q.get("sort") : sorts[0];
    $("#v-library").innerHTML =
      '<div class="wrap lib">' +
      '<aside class="side" aria-label="' +
      esc(t("lib_title")) +
      '"><div class="side-h"><span class="star" aria-hidden="true"></span><span' +
      L() +
      ">" +
      esc(t("lib_title")) +
      "</span></div>" +
      LIB_SCOPES.map(
        (s) =>
          '<a href="#/library?scope=' +
          s +
          '"' +
          (s === scope ? ' class="on" aria-current="true"' : "") +
          "><span" +
          L() +
          ">" +
          esc(t(label[s])) +
          "</span><b>" +
          nf(counts[s]) +
          "</b></a>",
      ).join("") +
      "</aside>" +
      '<div class="lib-main">' +
      '<div class="lib-bar"><form class="search" role="search" id="libSearch">' +
      icon("i-search") +
      '<input type="search" name="q" dir="auto" value="' +
      esc(query) +
      '" placeholder="' +
      esc(t("search_ph")) +
      '" aria-label="' +
      esc(t("search_ph")) +
      '"></form>' +
      '<select id="libSort" aria-label="' +
      esc(t("sort")) +
      '"' +
      L() +
      ">" +
      sorts
        .map(
          (s) =>
            '<option value="' +
            s +
            '"' +
            (s === sort ? " selected" : "") +
            ">" +
            esc(t("s_" + s)) +
            "</option>",
        )
        .join("") +
      "</select></div>" +
      '<div id="libRes"></div>' +
      "</div></div>";
    const paint = () => {
      const qq = norm($("#libSearch input").value);
      let html = "";
      if (isSeries) {
        let list = PLAYLISTS.filter((p) => !qq || pNorm.get(p.id).includes(qq));
        const col = new Intl.Collator("ar", {
          numeric: true,
          sensitivity: "base",
        });
        if (sort === "az")
          list = list.slice().sort((a, b) => col.compare(a.title, b.title));
        if (sort === "most")
          list = list.slice().sort((a, b) => b.count - a.count);
        if (sort === "new") {
          const last = (p) =>
            p.items.reduce((m, it) => {
              const d = (byId.get(it.id) || {}).uploadDate || "";
              return d > m ? d : m;
            }, "");
          list = list.slice().sort((a, b) => last(b).localeCompare(last(a)));
        }
        const lessonHits = qq
          ? VIDEOS.filter((v) => vNorm.get(v.id).includes(qq)).length
          : 0;
        html +=
          '<div class="lib-h"><h1' +
          L() +
          ">" +
          esc(t("lib_series")) +
          '</h1><span class="muted"' +
          L() +
          ">" +
          esc(t("results", { n: nf(list.length) })) +
          "</span></div>";
        if (qq && lessonHits)
          html +=
            '<p class="scope-note"' +
            L() +
            ">" +
            esc(t("match_lessons", { n: nf(lessonHits) })) +
            ' <a href="#/library?scope=all&q=' +
            encodeURIComponent($("#libSearch input").value.trim()) +
            '">' +
            esc(t("show_lessons")) +
            "</a></p>";
        html += list.length
          ? '<div class="grid">' + list.map(seriesCard).join("") + "</div>"
          : emptyBox(t("nothing"), "#/library", t("clear"));
      } else {
        const list = sortVideos(
          libVideos(scope).filter((v) => !qq || vNorm.get(v.id).includes(qq)),
          sort,
        );
        html +=
          '<div class="lib-h"><h1' +
          L() +
          ">" +
          esc(t(label[scope])) +
          '</h1><span class="muted"' +
          L() +
          ">" +
          esc(t("results", { n: nf(list.length) })) +
          "</span></div>";
        html += list.length
          ? '<div class="grid">' +
            list
              .slice(0, libShown)
              .map((v) => lessonCard(v))
              .join("") +
            "</div>" +
            (list.length > libShown
              ? '<div class="more-row"><button class="btn" type="button" id="libMore"' +
                L() +
                ">" +
                esc(t("show_more")) +
                "</button></div>"
              : "")
          : emptyBox(t("nothing"), "#/library?scope=" + scope, t("clear"));
      }
      $("#libRes").innerHTML = html;
      const more = $("#libMore");
      if (more)
        more.addEventListener("click", () => {
          libShown += PAGE;
          const y = window.scrollY;
          paint();
          window.scrollTo(0, y);
        });
    };
    paint();
    const input = $("#libSearch input");
    let timer;
    const sync = () => {
      const p = new URLSearchParams({ scope });
      if (input.value.trim()) p.set("q", input.value.trim());
      if (sort !== sorts[0]) p.set("sort", sort);
      history.replaceState(null, "", "#/library?" + p.toString());
    };
    input.addEventListener("input", () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        libShown = PAGE;
        paint();
        sync();
      }, 160);
    });
    $("#libSearch").addEventListener("submit", (e) => {
      e.preventDefault();
      clearTimeout(timer);
      libShown = PAGE;
      paint();
      sync();
    });
    $("#libSort").addEventListener("change", (e) => {
      const p = new URLSearchParams({ scope, sort: e.target.value });
      if (input.value.trim()) p.set("q", input.value.trim());
      go("#/library?" + p.toString());
    });
  }

  /* ---------- Playlist ---------- */
  function renderPlaylist(id, q) {
    const p = plById.get(id);
    if (!p) return go("#/library");
    const items = p.items.map((it) => byId.get(it.id)).filter(Boolean);
    const firstResume = items.find((v) => canResume(v));
    const sorts = ["order", "new", "old", "long", "short", "az"];
    const sort = sorts.includes(q.get("sort")) ? q.get("sort") : "order";
    const query = q.get("q") || "";
    $("#v-playlist").innerHTML =
      '<div class="wrap">' +
      '<nav class="crumb"' +
      L() +
      '><a href="#/library">' +
      esc(t("back_lib")) +
      "</a>" +
      icon("i-chev", "arrow fwd") +
      "<span" +
      AR +
      ">" +
      esc(p.title) +
      "</span></nav>" +
      '<header class="ph"><span class="arch' +
      (p.cover ? "" : " noimg") +
      '">' +
      imgTag(p.cover) +
      "</span>" +
      '<div><span class="eyebrow"' +
      L() +
      ">" +
      esc(p.id === IMAD_PL ? t("imad") : t("sheikh_full")) +
      "</span>" +
      "<h1" +
      AR +
      ">" +
      esc(p.title) +
      "</h1>" +
      '<div class="facts"' +
      L() +
      '><span class="pill">' +
      esc(lessonsN(p.count)) +
      '</span><span class="pill">' +
      esc(t("pl_hours", { h: hours(plDur.get(p.id)) })) +
      '</span><span class="pill">' +
      icon("i-off") +
      esc(t("offline")) +
      "</span></div>" +
      '<div class="acts"' +
      L() +
      ">" +
      (earliest(p)
        ? '<a class="btn primary" href="#/lesson/' +
          encodeURIComponent(earliest(p).id) +
          "?pl=" +
          encodeURIComponent(p.id) +
          '">' +
          icon("i-play") +
          esc(t("pl_start")) +
          "</a>"
        : "") +
      (firstResume
        ? '<a class="btn" href="#/lesson/' +
          encodeURIComponent(firstResume.id) +
          "?pl=" +
          encodeURIComponent(p.id) +
          '&resume=1">' +
          icon("i-resume") +
          esc(t("pl_resume")) +
          "</a>"
        : "") +
      "</div>" +
      '<div class="sbar" style="max-width:360px;margin-top:16px"><i style="width:' +
      (seriesPct(p) * 100).toFixed(1) +
      '%"></i></div>' +
      "</div></header>" +
      '<div class="lib-bar"><form class="search" role="search" id="plSearch">' +
      icon("i-search") +
      '<input type="search" name="q" dir="auto" value="' +
      esc(query) +
      '" placeholder="' +
      esc(t("search_ph")) +
      '" aria-label="' +
      esc(t("search_ph")) +
      '"></form>' +
      '<select id="plSort" aria-label="' +
      esc(t("sort")) +
      '"' +
      L() +
      ">" +
      sorts
        .map(
          (s) =>
            '<option value="' +
            s +
            '"' +
            (s === sort ? " selected" : "") +
            ">" +
            esc(t("s_" + s)) +
            "</option>",
        )
        .join("") +
      "</select></div>" +
      '<p class="scope-note"' +
      L() +
      ">" +
      esc(t("scope_in")) +
      ' <a href="#" id="plAll">' +
      esc(t("scope_all")) +
      "</a></p>" +
      '<div id="plRes"></div></div>';
    let shown = PAGE;
    const paint = () => {
      const qq = norm($("#plSearch input").value);
      const list =
        sort === "order"
          ? items.filter((v) => !qq || vNorm.get(v.id).includes(qq))
          : sortVideos(
              items.filter((v) => !qq || vNorm.get(v.id).includes(qq)),
              sort,
            );
      $("#plRes").innerHTML = list.length
        ? '<div class="grid">' +
          list
            .slice(0, shown)
            .map((v) => lessonCard(v, p.id))
            .join("") +
          "</div>" +
          (list.length > shown
            ? '<div class="more-row"><button class="btn" type="button" id="plMore"' +
              L() +
              ">" +
              esc(t("show_more")) +
              "</button></div>"
            : "")
        : emptyBox(t("nothing"));
      const more = $("#plMore");
      if (more)
        more.addEventListener("click", () => {
          shown += PAGE;
          const y = window.scrollY;
          paint();
          window.scrollTo(0, y);
        });
    };
    paint();
    const input = $("#plSearch input");
    let timer;
    input.addEventListener("input", () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        shown = PAGE;
        paint();
      }, 160);
    });
    $("#plSearch").addEventListener("submit", (e) => {
      e.preventDefault();
      shown = PAGE;
      paint();
    });
    $("#plSort").addEventListener("change", (e) =>
      go(
        "#/playlist/" +
          encodeURIComponent(p.id) +
          "?sort=" +
          e.target.value +
          (input.value.trim()
            ? "&q=" + encodeURIComponent(input.value.trim())
            : ""),
      ),
    );
    $("#plAll").addEventListener("click", (e) => {
      e.preventDefault();
      go(
        "#/library?scope=all" +
          (input.value.trim()
            ? "&q=" + encodeURIComponent(input.value.trim())
            : ""),
      );
    });
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

  /* ---------- Lesson / player ---------- */
  let cur = null; // { v, video, cues, capLang, saveTick }
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
        '<div class="stage" dir="ltr"><video id="vid" controls playsinline preload="metadata"></video><div class="cap" id="cap" hidden></div></div>' +
        '<div class="notice" id="notice" role="alert" hidden></div><div id="lsInfo"></div></div><aside id="lsSide"></aside></div>';
      const video = $("#vid");
      cur = { v, video, cues: [], capLang: "", lastSave: 0 };
      markRecent(v.id);
      video.addEventListener("play", () => Rec.stop());
      video.addEventListener("timeupdate", () => {
        paintCap();
        const now = Date.now();
        if (now - cur.lastSave > 4000) {
          cur.lastSave = now;
          saveProgress();
        }
      });
      video.addEventListener("seeked", paintCap);
      video.addEventListener("pause", saveProgress);
      video.addEventListener("ended", () => {
        st.done[v.id] = 1;
        delete st.prog[v.id];
        store(K.done, st.done);
        store(K.prog, st.prog);
      });
      video.addEventListener("error", () => probeError(v));
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
    const subsAr = subFor(v, "ar"),
      subsEn = subFor(v, "en");
    const items = p ? p.items.map((it) => byId.get(it.id)).filter(Boolean) : [];
    const idx = items.findIndex((x) => x.id === v.id);
    const prev = idx > 0 ? items[idx - 1] : null,
      next = idx >= 0 && idx < items.length - 1 ? items[idx + 1] : null;
    const lk = (x) =>
      "#/lesson/" +
      encodeURIComponent(x.id) +
      (p ? "?pl=" + encodeURIComponent(p.id) : "");
    const capBtn = (lang, s) =>
      s && s.src
        ? '<button class="btn small" type="button" data-cap="' +
          lang +
          '" aria-pressed="' +
          (cur.capLang === lang) +
          '">' +
          esc(t("cap_" + lang)) +
          "</button>"
        : "";
    const txBtn = (lang, s) =>
      s && s.readSrc
        ? '<button class="btn small" type="button" data-tx="' +
          lang +
          '">' +
          icon("i-text") +
          esc(t("tx_" + lang)) +
          "</button>"
        : "";
    $("#lsInfo").innerHTML =
      "<h1" +
      AR +
      ">" +
      esc(v.title) +
      "</h1>" +
      '<div class="ls-meta"' +
      L() +
      ">" +
      (p
        ? '<a class="pill" href="#/playlist/' +
          encodeURIComponent(p.id) +
          '"' +
          AR +
          ">" +
          esc(p.title) +
          "</a>"
        : '<span class="pill">' + esc(t("no_series")) + "</span>") +
      '<span class="pill">' +
      esc(scholarOf(v)) +
      '</span><span class="pill ltr">' +
      esc(dur(v.duration)) +
      '</span><span class="pill">' +
      esc(t("published", { d: date(v.uploadDate) })) +
      "</span></div>" +
      '<div class="ls-acts"' +
      L() +
      ">" +
      '<button class="btn small" type="button" data-fav="' +
      esc(v.id) +
      '" aria-pressed="' +
      isFav(v.id) +
      '">' +
      icon(isFav(v.id) ? "i-saved" : "i-save") +
      "<span>" +
      esc(t(isFav(v.id) ? "saved" : "save")) +
      "</span></button>" +
      (canResume(v) && !q.get("resume")
        ? '<button class="btn small" type="button" id="lsResume">' +
          icon("i-resume") +
          esc(t("ls_resume_at", { t: dur(progOf(v.id)) })) +
          "</button>"
        : "") +
      capBtn("ar", subsAr) +
      capBtn("en", subsEn) +
      txBtn("ar", subsAr) +
      txBtn("en", subsEn) +
      '<a class="btn small" href="' +
      esc(v.media) +
      '" target="_blank" rel="noopener">' +
      esc(t("open_file")) +
      "</a>" +
      "</div>" +
      (prev || next
        ? '<div class="nextprev"' +
          L() +
          ">" +
          (prev
            ? '<a href="' +
              lk(prev) +
              '">' +
              icon("i-chev", "arrow back") +
              '<span class="t"><small>' +
              esc(t("ls_prev")) +
              "</small><span" +
              AR +
              ">" +
              esc(prev.title) +
              "</span></span></a>"
            : "") +
          (next
            ? '<a href="' +
              lk(next) +
              '"><span class="t"><small>' +
              esc(t("ls_next")) +
              "</small><span" +
              AR +
              ">" +
              esc(next.title) +
              "</span></span>" +
              icon("i-chev", "arrow fwd") +
              "</a>"
            : "") +
          "</div>"
        : "") +
      '<div class="panel tx" id="txPanel" hidden></div>';
    // series list: a window around the current lesson keeps very long series light
    const lo = Math.max(0, idx - 20),
      hi = Math.min(items.length, Math.max(idx, 0) + 40);
    $("#lsSide").innerHTML = p
      ? '<div class="panel"><h2' +
        L() +
        ">" +
        esc(t("ls_series")) +
        "</h2>" +
        '<div class="ulist">' +
        items
          .slice(lo, hi)
          .map(
            (x, i) =>
              '<a href="' +
              lk(x) +
              '"' +
              (x.id === v.id ? ' class="cur" aria-current="true"' : "") +
              '><span class="n">' +
              (lo + i + 1) +
              "</span>" +
              '<span class="thumb' +
              (x.thumbnail ? "" : " noimg") +
              '">' +
              imgTag(x.thumbnail) +
              '</span><span class="tt"' +
              AR +
              ">" +
              esc(x.title) +
              "</span></a>",
          )
          .join("") +
        "</div>" +
        '<div style="margin-top:12px"' +
        L() +
        '><a class="btn small" href="#/playlist/' +
        encodeURIComponent(p.id) +
        '">' +
        esc(t("ls_all_series")) +
        "</a></div></div>"
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
  }
  function paintCap() {
    const box = $("#cap");
    if (!box || !cur) return;
    const now = cur.video.currentTime || 0;
    let lo = 0,
      hi = cur.cues.length - 1,
      best = -1;
    while (lo <= hi) {
      const m = (lo + hi) >> 1;
      if (cur.cues[m].a <= now) {
        best = m;
        lo = m + 1;
      } else hi = m - 1;
    }
    const c = best >= 0 ? cur.cues[best] : null;
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
      showNotice("<p" + L() + ">" + esc(t("cap_fail")) + "</p>");
    }
  }
  async function showTranscript(v, lang, box) {
    const s = subFor(v, lang);
    box.hidden = false;
    box.innerHTML =
      "<h2" +
      L() +
      ">" +
      esc(t("tx_" + lang)) +
      '</h2><div class="tx-body" lang="' +
      lang +
      '" dir="' +
      (lang === "ar" ? "rtl" : "ltr") +
      '">' +
      esc(t("tx_loading")) +
      "</div>";
    try {
      $(".tx-body", box).textContent = await getText(s.readSrc);
    } catch (_) {
      $(".tx-body", box).innerHTML =
        "<span" + L() + ">" + esc(t("tx_fail")) + "</span>";
    }
  }
  function showNotice(html) {
    const n = $("#notice");
    if (!n) return;
    n.innerHTML = html;
    n.hidden = false;
  }
  // On a playback error, ask the server whether the file exists before blaming the format.
  async function probeError(v) {
    let code = 0;
    try {
      code = (await fetch(v.media, { method: "HEAD", cache: "no-store" }))
        .status;
    } catch (_) {}
    if (!cur || cur.v.id !== v.id) return;
    if (code === 404) {
      let folder = null;
      try {
        folder = await (await fetch("/__status", { cache: "no-store" })).json();
      } catch (_) {}
      let rel = v.media;
      try {
        rel = decodeURIComponent(v.media);
      } catch (_) {}
      showNotice(
        "<p" +
          L() +
          "><b>" +
          esc(t("err_404")) +
          "</b> " +
          esc(t("err_where")) +
          "</p><code>" +
          esc(rel) +
          "</code>" +
          (folder && folder.videos_exists === false
            ? "<p" +
              L() +
              ' style="margin-top:8px">' +
              esc(t("err_nofolder")) +
              "</p>"
            : ""),
      );
    } else {
      showNotice(
        "<p" +
          L() +
          ">" +
          esc(t("err_format")) +
          '</p><p style="margin-top:10px"' +
          L() +
          '><a class="btn small" href="' +
          esc(v.media) +
          '" target="_blank" rel="noopener">' +
          esc(t("open_file")) +
          "</a></p>",
      );
    }
  }

  /* ---------- Languages & Text dialog ---------- */
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
        if (!s) return "";
        return (
          '<div class="dlg-row"' +
          L() +
          "><b>" +
          esc(t("lang_" + lang)) +
          '</b><div class="btns">' +
          (s.src
            ? '<a class="btn small" href="#/lesson/' +
              encodeURIComponent(v.id) +
              "?cc=" +
              lang +
              '">' +
              esc(t("dlg_captions")) +
              "</a>"
            : "") +
          (s.readSrc
            ? '<button class="btn small" type="button" data-dlgtx="' +
              lang +
              '">' +
              icon("i-text") +
              esc(t("dlg_read")) +
              "</button>"
            : "") +
          "</div></div>"
        );
      })
      .join("");
    $("#dlgBody").innerHTML =
      "<p" +
      AR +
      ' style="font-weight:500">' +
      esc(v.title) +
      "</p>" +
      (rows || "<p" + L() + ">" + esc(t("dlg_none")) + "</p>") +
      '<div class="tx" id="dlgTx" hidden></div>';
    $$("[data-dlgtx]", dlg).forEach((b) =>
      b.addEventListener("click", () =>
        showTranscript(v, b.dataset.dlgtx, $("#dlgTx")),
      ),
    );
    $$("a", dlg).forEach((a) => a.addEventListener("click", () => dlg.close()));
    if (!dlg.open) dlg.showModal();
  }

  /* ---------- Where to Start ---------- */
  function firstOf(plId) {
    const p = plById.get(plId);
    return p ? earliest(p) : null;
  }
  function renderStart() {
    // first session: the first lesson of the Beliefs series that runs 15 to 25 minutes
    const beliefs = plById.get(PATH[0].pl[0]);
    // first session: the earliest lesson of the Names of Allah series (its lesson 1)
    const firstPl = beliefs;
    const first = earliest(firstPl);
    const stepTime = (s) => s.pl.reduce((a, id) => a + (plDur.get(id) || 0), 0);
    const sorts = [
      ["a", 0],
      ["b", 2],
      ["c", 5],
    ];
    $("#v-start").innerHTML =
      '<div class="page">' +
      '<header class="page-h"><span class="eyebrow"' +
      L() +
      ">" +
      esc(t("st_kicker")) +
      "</span><h1" +
      L() +
      ">" +
      esc(t("st_title")) +
      "</h1><p" +
      L() +
      ">" +
      esc(t("st_lede")) +
      "</p></header>" +
      (first
        ? '<section class="first"><div class="min"><b>' +
          Math.round(first.duration / 60) +
          "</b><span" +
          L() +
          ">" +
          esc(t("st_min")) +
          "</span></div>" +
          '<div><span class="eyebrow"' +
          L() +
          ">" +
          esc(t("st_first_tag")) +
          "</span><h2" +
          L() +
          ">" +
          esc(t("st_first_t")) +
          "</h2>" +
          "<p" +
          AR +
          ' style="color:var(--ink);font-weight:500;margin:6px 0">' +
          esc(first.title) +
          ' <span class="muted ltr">(' +
          esc(dur(first.duration)) +
          ")</span></p>" +
          "<p" +
          L() +
          ">" +
          esc(t("st_first_p")) +
          "</p>" +
          '<div class="acts"><a class="btn primary" href="#/lesson/' +
          encodeURIComponent(first.id) +
          "?pl=" +
          encodeURIComponent(firstPl.id) +
          '"' +
          L() +
          ">" +
          icon("i-play") +
          esc(t("st_watch")) +
          "</a>" +
          tbc() +
          "</div></div></section>"
        : "") +
      '<div class="sec-h"><h2' +
      L() +
      ">" +
      esc(t("st_sort_t")) +
      '</h2><span class="rule"></span></div><p class="muted"' +
      L() +
      ' style="margin:-8px 0 18px">' +
      esc(t("st_sort_p")) +
      "</p>" +
      '<div class="cards3">' +
      sorts
        .map(([k, si]) => {
          const s = PATH[si],
            f = plById.get(s.pl[0]);
          return (
            '<a class="card" href="#step-' +
            (si + 1) +
            '" data-step="' +
            (si + 1) +
            '"><h3' +
            L() +
            ">" +
            esc(t("sort_" + k + "_t")) +
            "</h3><p" +
            L() +
            ">" +
            esc(t("sort_" + k + "_p")) +
            "</p>" +
            '<div class="foot"><span class="pill lvl"' +
            L() +
            ">" +
            esc(t("sort_from", { n: nf(si + 1) })) +
            "</span>" +
            (f
              ? "<p" +
                L() +
                ' style="font-size:14px">' +
                esc(t("sort_first", { t: "" })) +
                "<span" +
                AR +
                ">" +
                esc(f.title) +
                "</span></p>"
              : "") +
            '<p class="muted"' +
            L() +
            ' style="font-size:14px">' +
            esc(t("sort_time", { h: hours(stepTime(s)) })) +
            "</p>" +
            tbc() +
            "</div></a>"
          );
        })
        .join("") +
      "</div>" +
      '<div class="sec-h"><h2' +
      L() +
      ">" +
      esc(t("st_path_t")) +
      '</h2><span class="rule"></span></div><p class="muted"' +
      L() +
      ' style="margin:-8px 0 18px">' +
      esc(t("st_path_p")) +
      "</p>" +
      '<ol class="steps">' +
      PATH.map((s, i) => {
        const pre =
          i === 0
            ? t("pre_none")
            : i === 5
              ? t("pre_all")
              : t("pre_step", { n: nf(i) });
        return (
          '<li class="step" id="step-' +
          (i + 1) +
          '"><span class="num" aria-hidden="true">' +
          (i + 1) +
          "</span><div>" +
          "<h3" +
          L() +
          ">" +
          esc(t("step_" + s.k)) +
          "</h3>" +
          '<div class="pills"' +
          L() +
          '><span class="pill lvl">' +
          esc(t("lvl" + s.lvl)) +
          '</span><span class="pill">' +
          esc(pre) +
          "</span></div>" +
          "<p" +
          L() +
          ">" +
          esc(t("d_" + s.k)) +
          "</p>" +
          '<div class="series"><span class="muted"' +
          L() +
          ' style="font-size:14px">' +
          esc(t("step_series")) +
          "</span>" +
          s.pl
            .map((id) => plById.get(id))
            .filter(Boolean)
            .map(
              (p) =>
                '<a href="#/playlist/' +
                encodeURIComponent(p.id) +
                '"' +
                AR +
                ">" +
                esc(p.title) +
                "</a>",
            )
            .join("") +
          tbc() +
          "</div></div>" +
          '<label class="tick"' +
          L() +
          '><input type="checkbox" data-tick="' +
          s.k +
          '"' +
          (st.path[s.k] ? " checked" : "") +
          ">" +
          esc(t("done_tick")) +
          "</label></li>"
        );
      }).join("") +
      "</ol>" +
      '<div class="note"><h3' +
      L() +
      ">" +
      esc(t("st_skip_t")) +
      "</h3><p" +
      L() +
      ">" +
      esc(t("st_skip_p")) +
      "</p></div>" +
      '<div class="note"><h3' +
      L() +
      ">" +
      esc(t("st_rhythm_t")) +
      "</h3><p" +
      L() +
      ">" +
      esc(t("st_rhythm_p")) +
      "</p></div>" +
      '<div class="note"><h3' +
      L() +
      ">" +
      esc(t("st_stuck_t")) +
      "</h3><p" +
      L() +
      ">" +
      esc(t("st_stuck_p")) +
      "</p></div>" +
      "</div>";
    $$("[data-tick]").forEach((c) =>
      c.addEventListener("change", () => {
        st.path[c.dataset.tick] = c.checked ? 1 : 0;
        store(K.path, st.path);
      }),
    );
    $$("[data-step]").forEach((a) =>
      a.addEventListener("click", (e) => {
        e.preventDefault();
        $("#step-" + a.dataset.step).scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }),
    );
  }

  /* ---------- Saved ---------- */
  function renderSaved() {
    const list = Object.keys(st.fav)
      .map((id) => byId.get(id))
      .filter(Boolean);
    $("#v-saved").innerHTML =
      '<div class="wrap" style="padding:40px 24px 50px">' +
      '<header class="page-h"><h1' +
      L() +
      ">" +
      esc(t("sv_title")) +
      "</h1><p" +
      L() +
      ">" +
      esc(t("sv_lede")) +
      "</p></header>" +
      (list.length
        ? '<div class="grid">' +
          list.map((v) => lessonCard(v)).join("") +
          "</div>"
        : emptyBox(t("sv_empty"), "#/library", t("browse"))) +
      "</div>";
  }

  /* ---------- About, Mission, Sheikh ---------- */
  function pageHead(k, ti, le) {
    return (
      '<header class="page-h"><span class="eyebrow"' +
      L() +
      ">" +
      esc(t(k)) +
      "</span><h1" +
      L() +
      ">" +
      esc(t(ti)) +
      "</h1>" +
      (le ? "<p" + L() + ">" + esc(t(le)) + "</p>" : "") +
      '<div class="divider" aria-hidden="true"><span class="star"></span></div></header>'
    );
  }
  function renderAbout() {
    $("#v-about").innerHTML =
      '<div class="page">' +
      pageHead("ab_kicker", "ab_title", "ab_lede") +
      '<div class="stats"' +
      L() +
      ">" +
      '<div class="stat"><b>' +
      nf(STATS.videos) +
      "</b><span>" +
      esc(t("st_videos")) +
      "</span></div>" +
      '<div class="stat"><b>' +
      nf(STATS.series) +
      "</b><span>" +
      esc(t("st_series")) +
      "</span></div>" +
      '<div class="stat"><b>' +
      nf(STATS.hours) +
      "</b><span>" +
      esc(t("st_hours")) +
      "</span></div>" +
      '<div class="stat"><b>' +
      yearsRange() +
      "</b><span>" +
      esc(t("st_years")) +
      "</span></div></div>" +
      '<div class="prose"' +
      L() +
      ">" +
      "<h2>" +
      esc(t("ab_is_t")) +
      "</h2><p>" +
      esc(t("ab_is_p")) +
      "</p><p>" +
      esc(t("ab_not_p")) +
      "</p>" +
      "<h2>" +
      esc(t("ab_why_t")) +
      "</h2><p>" +
      esc(t("ab_why_p")) +
      "</p>" +
      "<h2>" +
      esc(t("ab_src_t")) +
      "</h2><p>" +
      esc(t("ab_src_p")) +
      "</p>" +
      "<h2>" +
      esc(t("ab_off_t")) +
      "</h2><p>" +
      esc(t("ab_off_p")) +
      "</p>" +
      "<h2>" +
      esc(t("ab_fix_t")) +
      "</h2><p>" +
      esc(t("ab_fix_p")) +
      " " +
      tbc() +
      "</p>" +
      "<h2>" +
      esc(t("ab_credit_t")) +
      "</h2><p>" +
      esc(t("ab_credit_p")) +
      "</p>" +
      "</div></div>";
  }
  function renderMission() {
    $("#v-mission").innerHTML =
      '<div class="page">' +
      pageHead("mi_kicker", "mi_title", "mi_lede") +
      '<div class="cards3">' +
      [1, 2, 3]
        .map(
          (i) =>
            '<div class="card pillar"><span class="star" aria-hidden="true"></span><h3' +
            L() +
            ">" +
            esc(t("p" + i + "_t")) +
            "</h3><p" +
            L() +
            ">" +
            esc(t("p" + i + "_p")) +
            "</p></div>",
        )
        .join("") +
      "</div>" +
      '<div class="prose"' +
      L() +
      "><h2>" +
      esc(t("mi_how_t")) +
      "</h2><ul>" +
      [1, 2, 3, 4]
        .map((i) => "<li>" + esc(t("mi_how_" + i)) + "</li>")
        .join("") +
      "</ul></div>" +
      '<p class="muted" style="text-align:center"' +
      L() +
      ">" +
      esc(t("mi_draft")) +
      " " +
      tbc() +
      "</p></div>";
  }
  function renderSheikh() {
    const own = VIDEOS.filter((v) => !v.playlistIds.includes(IMAD_PL));
    const hrs = Math.round(
      own.reduce((a, v) => a + (v.duration || 0), 0) / 3600,
    );
    const row = (k, val) =>
      '<div class="row"><span class="k">' +
      esc(t(k)) +
      "</span><span>" +
      val +
      "</span></div>";
    $("#v-sheikh").innerHTML =
      '<div class="page">' +
      '<header class="page-h"><div class="sheikh-mono" role="img" aria-label="' +
      esc(t("sheikh_full")) +
      '"><span class="star"></span><span>م ك</span></div>' +
      '<span class="eyebrow"' +
      L() +
      ">" +
      esc(t("sh_kicker")) +
      "</span>" +
      "<h1" +
      AR +
      '>فضيلة الشيخ الدكتور مصطفى كامل</h1><p lang="en" dir="ltr" style="font-family:var(--font-lat-head)">' +
      esc(t("sh_en")) +
      "</p></header>" +
      '<div class="prose"' +
      L() +
      "><h2>" +
      esc(t("sh_known_t")) +
      '</h2><div class="facts-l">' +
      row("sh_k_lessons", nf(own.length)) +
      row("sh_k_series", nf(sheikhSeries.length)) +
      row(
        "sh_k_years",
        '<span>' +
          yearsRange() +
          "</span>",
      ) +
      row("sh_k_hours", nf(hrs)) +
      row("sh_k_lang", esc(t("sh_lang_v"))) +
      '</div><p class="muted" style="font-size:14px">' +
      esc(t("sh_src")) +
      "</p></div>" +
      '<div class="prose"' +
      L() +
      "><h2>" +
      esc(t("sh_tbc_t")) +
      "</h2><p>" +
      esc(t("sh_tbc_p")) +
      '</p><div class="facts-l">' +
      [
        "sh_k_kunya",
        "sh_k_edu",
        "sh_k_teachers",
        "sh_k_ijazat",
        "sh_k_posts",
        "sh_k_works",
        "sh_k_method",
      ]
        .map((k) => row(k, tbc()))
        .join("") +
      "</div></div>" +
      '<div class="sec-h" style="margin-top:34px"><h2' +
      L() +
      ">" +
      esc(t("sh_series_t")) +
      '</h2><span class="rule"></span></div>' +
      '<div class="grid">' +
      sheikhSeries.map(seriesCard).join("") +
      "</div></div>";
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
      $("#recPlay").disabled =
        $("#recReplay").disabled =
        $("#recMute").disabled =
        $("#recVol").disabled =
          !avail;
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
    // the server reports whether the licensed file is present, so a missing file never shows as an error
    fetch("/__status", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        avail = !!(j && j.recitation);
        statusKey = avail ? "rec_ready" : "rec_none";
        ui();
      })
      .catch(ui);
    return {
      play,
      stop,
      ui,
      get avail() {
        return avail;
      },
    };
  })();

  /* ---------- Chrome: language and theme ---------- */
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
    $("#themePop").innerHTML = THEMES.map(
      (th) =>
        '<button class="sw" type="button" data-theme="' +
        th +
        '" data-th="' +
        th +
        '" aria-pressed="' +
        (th === st.theme) +
        '"><i style="background:var(--bg);border-color:var(--gold)"></i><span' +
        L() +
        ">" +
        esc(t("th_" + th)) +
        "</span></button>",
    ).join("");
    $("#themePop").setAttribute("aria-label", t("theme"));
    $("#dlgClose").setAttribute("aria-label", ar ? "إغلاق" : "Close");
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
    st.theme = th;
    store(K.theme, th);
    document.documentElement.dataset.theme = th;
    $$("#themePop .sw").forEach((b) =>
      b.setAttribute("aria-pressed", String(b.dataset.th === th)),
    );
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
        b.innerHTML =
          icon(st.fav[id] ? "i-saved" : "i-save") +
          "<span>" +
          esc(t(st.fav[id] ? "saved" : "save")) +
          "</span>";
      });
      return;
    }
    const lg = e.target.closest("[data-langs]");
    if (lg) return openLangs(lg.dataset.langs);
    const cap = e.target.closest("[data-cap]");
    if (cap) return setCaptions(cap.dataset.cap);
    const tx = e.target.closest("[data-tx]");
    if (tx && cur) return showTranscript(cur.v, tx.dataset.tx, $("#txPanel"));
    const rail = e.target.closest("[data-rail]");
    if (rail) {
      const r = $("#" + rail.dataset.rail);
      // the rail lives in the RTL chrome, so "next" scrolls toward the left
      if (r)
        r.scrollBy({
          left: -rail.dataset.dir * r.clientWidth * 0.9,
          behavior: "smooth",
        });
      return;
    }
    const sw = e.target.closest("[data-th]");
    if (sw) return setTheme(sw.dataset.th);
    const pop = $("#themePop");
    if (e.target.closest("#themeBtn")) {
      pop.hidden = !pop.hidden;
      $("#themeBtn").setAttribute("aria-expanded", String(!pop.hidden));
    } else if (!e.target.closest("#themePop")) {
      pop.hidden = true;
      $("#themeBtn").setAttribute("aria-expanded", "false");
    }
  });
  $$("#langSeg button").forEach((b) =>
    b.addEventListener("click", () => setLang(b.dataset.lang)),
  );
  $("#dlgClose").addEventListener("click", () => $("#dlg").close());
  window.addEventListener("hashchange", () => render());
  window.addEventListener("pagehide", saveProgress);

  /* ---------- Opening ---------- */
  const BIRDS = [
    // y, width, flight seconds, delay, opacity, colour, flap seconds, bob seconds, still x (reduced motion)
    [14, 62, 38, 0, 0.92, "#0f0a1d", 1.15, 3.6, 18],
    [19, 44, 38, -1.4, 0.85, "#0f0a1d", 1.0, 4.1, 24],
    [11, 36, 38, -2.6, 0.8, "#150e26", 0.92, 3.3, 29],
    [27, 26, 56, -22, 0.6, "#3a2a55", 0.78, 4.6, 70],
    [8, 20, 72, -40, 0.45, "#4a3560", 0.7, 5.2, 80],
    [32, 54, 46, -30, 0.88, "#0f0a1d", 1.1, 3.9, 62],
    [23, 18, 80, -10, 0.4, "#4a3560", 0.66, 5.6, 44],
  ];
  const wingR =
    '<g class="wi"><path d="M0,-2 C7,-5 14,-5.5 20,-3.5 L20,1.5 C13,1.5 6,2.5 0,3.5 Z"/><g transform="translate(19 -1)"><g class="wo"><path d="M0,-2.5 C9,-3.6 18,-2.2 27,2 C23,2.2 20,2.7 18,3.6 L16,2.6 L13.5,3.8 L11,2.8 L8.5,3.9 L6,2.8 L0,3 Z"/></g></g></g>';
  function birdSvg() {
    return (
      '<svg viewBox="-52 -22 104 44"><g class="bd">' +
      '<g transform="translate(-2.6 0) scale(-1 1)">' +
      wingR +
      '</g><g transform="translate(2.6 0)">' +
      wingR +
      "</g>" +
      '<path d="M0,-6 C2.6,-6 3.4,-2 3,2 C2.6,6 1.4,9 0,11 C-1.4,9 -2.6,6 -3,2 C-3.4,-2 -2.6,-6 0,-6Z"/><circle cy="-7.4" r="2.6"/><path d="M-2.8,9 L0,15.5 L2.8,9 Z"/></g></svg>'
    );
  }
  function splash() {
    const sp = $("#splash");
    let forced = false;
    try {
      forced = new URLSearchParams(location.search).get("splash") === "1";
    } catch (_) {}
    let skip = false;
    try {
      skip =
        sessionStorage.getItem("archive-v2-entered") === "1" ||
        new URLSearchParams(location.search).get("splash") === "0";
    } catch (_) {}
    if (skip && !forced) return;
    $("#sky").innerHTML = BIRDS.map(
      (b) =>
        '<div class="bird" style="--y:' +
        b[0] +
        "%;--w:" +
        b[1] +
        "px;--d:" +
        b[2] +
        "s;--dl:" +
        b[3] +
        "s;--o:" +
        b[4] +
        ";--c:" +
        b[5] +
        ";--f:" +
        b[6] +
        "s;--b:" +
        b[7] +
        "s;--x:" +
        b[8] +
        '"><div class="bob">' +
        birdSvg() +
        "</div></div>",
    ).join("");
    sp.hidden = false;
    document.body.style.overflow = "hidden";
    const enter = (withVerse) => {
      try {
        sessionStorage.setItem("archive-v2-entered", "1");
      } catch (_) {}
      sp.classList.add("gone");
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
      setTimeout(() => {
        sp.hidden = true;
        $("#sky").innerHTML = "";
      }, 520);
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
    document.documentElement.dataset.theme = st.theme;
    paintChrome();
    render();
    splash();
  })();
})();
