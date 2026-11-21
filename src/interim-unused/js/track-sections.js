/* track-sections.js : INFO SECTIONS (Where to Start, About, Mission, About the Sheikh) + FAVORITES.
   Prefix: sc-. Touches only window.App. Facts not verified are shown as visible placeholder pills. */
(function () {
  "use strict";

  var PILL_AR = "[بانتظار التأكيد] · [to be confirmed]";
  var pill = function () {
    return '<span class="sc-pill"><span class="sc-dot" aria-hidden="true"></span>' + PILL_AR + "</span>";
  };
  var libBtn = function (label) {
    return '<a class="sc-btn" href="#/library">' + App.esc(label) + "</a>";
  };

  App.addStrings({
    ar: {
      sc_start_kicker: "أين تبدأ · Where to Start",
      sc_start_title: "ابدأ رحلتك من هنا",
      sc_start_lede: "لا تعرف من أين تبدأ؟ لا مشكلة. هذه الصفحة ترسم لك طريقا واضحا خطوة بخطوة، بكلمات بسيطة، وبدون أي تعقيد.",
      sc_first_tag: "أول جلسة · First Session",
      sc_first_title: "جلسة تعريفية (٢٠ دقيقة)",
      sc_first_p1: "قبل أن تغوص في آلاف الدروس، خصص عشرين دقيقة لجلسة تعريفية واحدة: من هو الشيخ، وما منهجه في الشرح، وكيف تستخدم هذه المكتبة، وبأي ترتيب تبدأ.",
      sc_first_p2: "الفيديو التعريفي المحدد لم يُختر بعد، وسيظهر هنا فور تأكيده. حتى ذلك الحين، ابدأ بالخطوة الأولى من المسار أدناه.",
      sc_first_open: "فتح الجلسة التعريفية",
      sc_sort_title: "اختر نقطة انطلاقك",
      sc_sort_sub: "اقرأ البطاقات الثلاث واختر الأقرب لحالك الآن.",
      sc_sort1_t: "جديد على طلب العلم · New to seeking knowledge",
      sc_sort1_p1: "إذا كان هذا أول تواصل جدي لك مع العلم الشرعي، فابدأ صغيرا وثابتا. لا تقفز إلى المواضيع الصعبة.",
      sc_sort1_p2: "نقطة البداية المقترحة: الخطوة ١ (العقيدة) ثم الخطوة ٢ (العبادة) من المسار أدناه.",
      sc_sort2_t: "أعرف الأساسيات · I know the basics",
      sc_sort2_p1: "إذا كنت تصلي وتحفظ شيئا من القرآن وتعرف أركان الإسلام، فأنت هنا. هدفك الآن: الترتيب والتعمق.",
      sc_sort2_p2: "نقطة البداية المقترحة: الخطوة ٣ (السيرة) ثم الخطوة ٤ (القرآن) من المسار أدناه.",
      sc_sort3_t: "طالب متقدم · Advanced student",
      sc_sort3_p1: "إذا تجاوزت الأساسيات وتريد التخصص والتعمق في العلوم، فالمسار الكامل أمامك.",
      sc_sort3_p2: "نقطة البداية المقترحة: الخطوة ٦ (العلوم المتقدمة)، مع مراجعة ما فاتك من الخطوات السابقة.",
      sc_path_title: "المسار: ست خطوات مرتبة",
      sc_path_sub: "كل خطوة تبني على ما قبلها. لا تستعجل، العلم يُبنى لبنة فوق لبنة.",
      sc_browse: "تصفح المكتبة",
      sc_series_note: "السلسلة المقترحة لهذه الخطوة",
      sc_lvl1: "مبتدئ · Beginner",
      sc_lvl2: "متوسط · Intermediate",
      sc_lvl3: "متقدم · Advanced",
      sc_step1_t: "١ · العقيدة · Beliefs",
      sc_step1_d1: "تعرف على الله بأسمائه وصفاته، وعلى أركان الإيمان الستة.",
      sc_step1_d2: "هذه هي البداية الصحيحة لكل طالب علم، لأن العمل لا يُقبل بلا عقيدة سليمة.",
      sc_step2_t: "٢ · العبادة · Worship",
      sc_step2_d1: "تعلم أحكام الطهارة والصلاة والصيام والزكاة والحج خطوة بخطوة.",
      sc_step2_d2: "العلم هنا عملي: تتعلم ثم تطبق في يومك مباشرة.",
      sc_step3_t: "٣ · السيرة · Seerah",
      sc_step3_d1: "تعرف على حياة النبي صلى الله عليه وسلم من الميلاد إلى الوفاة.",
      sc_step3_d2: "السيرة تجعل العقيدة والعبادة حيّة، وتريك القدوة العملية.",
      sc_step4_t: "٤ · القرآن · Qur'an",
      sc_step4_d1: "ابدأ بالتلاوة الصحيحة، ثم تعرف على معاني السور وتفسيرها.",
      sc_step4_d2: "القرآن هو المصدر الأول، وكل علم شرعي يرجع إليه.",
      sc_step5_t: "٥ · الأخلاق والتزكية · Character",
      sc_step5_d1: "تعلم أخلاق المسلم: الصدق والأمانة والرحمة وحسن الخلق.",
      sc_step5_d2: "العلم بلا أخلاق حِمل ثقيل، والتزكية هي ثمرة العلم الحقيقية.",
      sc_step6_t: "٦ · العلوم المتقدمة · Deeper sciences",
      sc_step6_d1: "تعمق في الفقه وأصوله، والحديث ومصطلحه، واللغة العربية.",
      sc_step6_d2: "هذه مرحلة التخصص لمن أتقن الخطوات الخمس السابقة.",
      sc_preq: "المتطلب السابق",
      sc_about_kicker: "عن المكتبة · About",
      sc_about_title: "ما هذه المكتبة؟",
      sc_about_lede: "أرشيف كامل يعمل بدون إنترنت، يحفظ دروس الشيخ وينظمها لك.",
      sc_about_what_t: "ما هي؟",
      sc_about_what_p1: "هذه مكتبة غير متصلة بالإنترنت (أوفلاين) تضم أرشيف قناة الشيخ على يوتيوب: ٣٩٧٧ فيديو و٧١ قائمة تشغيل في القرآن والتفسير والحديث والخطب.",
      sc_about_what_p2: "العناوين الأصلية للفيديوهات محفوظة كما هي بدون تغيير، وكل شيء يعمل من جهازك مباشرة بدون الحاجة إلى اتصال بالإنترنت.",
      sc_about_who_t: "لمن هي؟",
      sc_about_who_p1: "لكل مسلم يريد أن يتعلم دينه من مصدر موثوق، سواء كان مبتدئا تماما أو طالب علم متقدما.",
      sc_about_who_p2: "وهي مفيدة بشكل خاص لمن يعيش في مكان بإنترنت ضعيف أو يريد الاحتفاظ بالدروس دائما معه.",
      sc_about_draft: "مسودة · Draft",
      sc_about_draft_note: "صياغة هذه الصفحة مسودة أولى، وقد تُحسَّن لاحقا.",
      sc_videos_n: "فيديو",
      sc_lists_n: "قائمة تشغيل",
      sc_offline_n: "يعمل أوفلاين",
      sc_mission_kicker: "رسالتنا · Mission",
      sc_mission_title: "لماذا توجد هذه المكتبة؟",
      sc_mission_lede: "ثلاث ركائز تحملها كل دروس الشيخ، وتلخص الهدف من هذا الأرشيف.",
      sc_p1_t: "تفنيد الشبهات · Dismantle Doubts",
      sc_p1_p1: "كثير من الشباب تصلهم شبهات عن الإسلام من هنا وهناك. هذه الدروس ترد على الشبهات بالدليل من القرآن والسنة.",
      sc_p1_p2: "الهدف: أن تجد الجواب الشافي عندما يطرأ عليك سؤال أو شبهة، فلا يبقى في قلبك شك.",
      sc_p2_t: "ترسيخ اليقين · Nurture Conviction",
      sc_p2_p1: "اليقين لا يأتي بالتمني، بل بالعلم المتدرج بالأدلة. الدروس تبني إيمانك لبنة فوق لبنة.",
      sc_p2_p2: "الهدف: إيمان راسخ مبني على الفهم والدليل، لا على التقليد فقط.",
      sc_p3_t: "إلهام العطاء · Inspire Contribution",
      sc_p3_p1: "العلم أمانة، ومن تعلم شيئا نافعا شاركه. هذه المكتبة تشجعك أن تنقل الخير لأهلك وأصدقائك.",
      sc_p3_p2: "الهدف: جيل يتعلم ويعلّم، ويساهم في نشر الخير حوله.",
      sc_sheikh_kicker: "عن الشيخ · About the Sheikh",
      sc_sheikh_name: "فضيلة الشيخ الدكتور مصطفى كامل",
      sc_sheikh_sub: "عالم إسلامي عربي · Arabic Islamic scholar",
      sc_sheikh_f1: "عالم إسلامي عربي، صاحب قناة على يوتيوب تضم ٣٩٧٧ فيديو في القرآن والتفسير والحديث والخطب، منظمة في ٧١ قائمة تشغيل.",
      sc_sheikh_f2: "هذه المكتبة أرشيف غير متصل بالإنترنت لتلك القناة، بعناوينها الأصلية المحفوظة.",
      sc_sheikh_unknown_t: "معلومات لم تُؤكَّد بعد",
      sc_sheikh_unknown_sub: "كل ما يلي سيُملأ فقط بعد التأكد من مصدر موثوق. لا شيء هنا مختلق.",
      sc_u_teachers: "شيوخه وأساتذته",
      sc_u_ijazat: "الإجازات العلمية",
      sc_u_bio: "تفاصيل السيرة (المولد، الدراسة، المسيرة)",
      sc_sheikh_honest: "لا شيء هنا مختلق · Nothing here is invented.",
      sc_favs_kicker: "المفضلة · Favorites",
      sc_favs_title: "دروسك المحفوظة",
      sc_favs_lede: "كل درس تحفظه بالقلب سيظهر هنا، مرتبا وجاهزا للعودة إليه في أي وقت.",
      sc_favs_empty_t: "لا دروس محفوظة بعد",
      sc_favs_empty_p: "عندما يعجبك درس، اضغط على زر الحفظ وسيظهر هنا. ابدأ بالتصفح واختر أول درس.",
      sc_favs_go: "تصفح المكتبة",
      sc_watch: "مشاهدة",
      sc_remove: "إزالة"
    },
    en: {
      sc_start_kicker: "Where to Start · أين تبدأ",
      sc_start_title: "Start your journey here",
      sc_start_lede: "Not sure where to begin? No problem. This page draws you a clear path, step by step, in simple words, with no complications.",
      sc_first_tag: "First Session · أول جلسة",
      sc_first_title: "Introductory session (20 minutes)",
      sc_first_p1: "Before diving into thousands of lessons, spend twenty minutes on one introductory session: who the Sheikh is, his teaching approach, how to use this library, and in what order to start.",
      sc_first_p2: "The specific introductory video has not been chosen yet, and will appear here once confirmed. Until then, start with step one of the path below.",
      sc_first_open: "Open the introductory session",
      sc_sort_title: "Pick your starting point",
      sc_sort_sub: "Read the three cards and choose the one closest to where you are now.",
      sc_sort1_t: "New to seeking knowledge · جديد على طلب العلم",
      sc_sort1_p1: "If this is your first serious contact with Islamic knowledge, start small and steady. Do not jump to hard topics.",
      sc_sort1_p2: "Suggested start: step 1 (Beliefs) then step 2 (Worship) from the path below.",
      sc_sort2_t: "I know the basics · أعرف الأساسيات",
      sc_sort2_p1: "If you pray, memorized some Quran, and know the pillars of Islam, you are here. Your goal now: order and depth.",
      sc_sort2_p2: "Suggested start: step 3 (Seerah) then step 4 (Quran) from the path below.",
      sc_sort3_t: "Advanced student · طالب متقدم",
      sc_sort3_p1: "If you are past the basics and want specialization and depth in the sciences, the full path is open to you.",
      sc_sort3_p2: "Suggested start: step 6 (Deeper sciences), while reviewing anything you missed in earlier steps.",
      sc_path_title: "The path: six ordered steps",
      sc_path_sub: "Each step builds on the one before it. Do not rush, knowledge is built brick upon brick.",
      sc_browse: "Browse the library",
      sc_series_note: "Suggested series for this step",
      sc_lvl1: "Beginner · مبتدئ",
      sc_lvl2: "Intermediate · متوسط",
      sc_lvl3: "Advanced · متقدم",
      sc_step1_t: "1 · Beliefs · العقيدة",
      sc_step1_d1: "Learn about Allah through His names and attributes, and the six pillars of faith.",
      sc_step1_d2: "This is the right beginning for every student of knowledge, because deeds are not accepted without sound belief.",
      sc_step2_t: "2 · Worship · العبادة",
      sc_step2_d1: "Learn the rulings of purification, prayer, fasting, zakat, and hajj, step by step.",
      sc_step2_d2: "The knowledge here is practical: you learn, then apply it in your day right away.",
      sc_step3_t: "3 · Seerah · السيرة",
      sc_step3_d1: "Learn the life of the Prophet, peace be upon him, from birth to passing.",
      sc_step3_d2: "The Seerah makes beliefs and worship come alive, and shows you the practical example.",
      sc_step4_t: "4 · Quran · القرآن",
      sc_step4_d1: "Start with correct recitation, then learn the meanings of surahs and their tafsir.",
      sc_step4_d2: "The Quran is the first source, and every Islamic science returns to it.",
      sc_step5_t: "5 · Character · الأخلاق والتزكية",
      sc_step5_d1: "Learn the Muslim's manners: honesty, trustworthiness, mercy, and good character.",
      sc_step5_d2: "Knowledge without manners is a heavy burden, and purification is the true fruit of knowledge.",
      sc_step6_t: "6 · Deeper sciences · العلوم المتقدمة",
      sc_step6_d1: "Go deeper into fiqh and its principles, hadith and its terminology, and the Arabic language.",
      sc_step6_d2: "This is the specialization stage for whoever mastered the five previous steps.",
      sc_preq: "Previous step",
      sc_about_kicker: "About · عن المكتبة",
      sc_about_title: "What is this library?",
      sc_about_lede: "A complete archive that works without the internet, preserving the Sheikh's lessons and organizing them for you.",
      sc_about_what_t: "What is it?",
      sc_about_what_p1: "This is an offline library holding the archive of the Sheikh's YouTube channel: 3,977 videos and 71 playlists in Quran, tafsir, hadith, and sermons.",
      sc_about_what_p2: "The videos' original titles are preserved exactly as they are, and everything runs from your device directly with no internet connection needed.",
      sc_about_who_t: "Who is it for?",
      sc_about_who_p1: "For every Muslim who wants to learn their religion from a trusted source, whether a complete beginner or an advanced student.",
      sc_about_who_p2: "It is especially useful for whoever lives somewhere with weak internet or wants to keep the lessons with them always.",
      sc_about_draft: "Draft · مسودة",
      sc_about_draft_note: "The wording of this page is a first draft, and may be improved later.",
      sc_videos_n: "videos",
      sc_lists_n: "playlists",
      sc_offline_n: "works offline",
      sc_mission_kicker: "Mission · رسالتنا",
      sc_mission_title: "Why does this library exist?",
      sc_mission_lede: "Three pillars carried by all of the Sheikh's lessons, summarizing the goal of this archive.",
      sc_p1_t: "Dismantle Doubts · تفنيد الشبهات",
      sc_p1_p1: "Many young people come across doubts about Islam from here and there. These lessons answer doubts with evidence from the Quran and Sunnah.",
      sc_p1_p2: "The goal: that you find the satisfying answer when a question or doubt comes to you, so no doubt remains in your heart.",
      sc_p2_t: "Nurture Conviction · ترسيخ اليقين",
      sc_p2_p1: "Conviction does not come by wishing, but by gradual knowledge built on evidence. The lessons build your faith brick upon brick.",
      sc_p2_p2: "The goal: a firm faith built on understanding and evidence, not on imitation alone.",
      sc_p3_t: "Inspire Contribution · إلهام العطاء",
      sc_p3_p1: "Knowledge is a trust, and whoever learns something beneficial shares it. This library encourages you to pass the good to your family and friends.",
      sc_p3_p2: "The goal: a generation that learns and teaches, and contributes to spreading good around them.",
      sc_sheikh_kicker: "About the Sheikh · عن الشيخ",
      sc_sheikh_name: "His Eminence Sheikh Dr. Mostafa Kamel",
      sc_sheikh_sub: "Arabic Islamic scholar · عالم إسلامي عربي",
      sc_sheikh_f1: "An Arabic Islamic scholar with a YouTube channel of 3,977 videos in Quran, tafsir, hadith, and sermons, organized in 71 playlists.",
      sc_sheikh_f2: "This library is an offline archive of that channel, with its original titles preserved.",
      sc_sheikh_unknown_t: "Information not yet confirmed",
      sc_sheikh_unknown_sub: "Everything below will only be filled in after verification from a trusted source. Nothing here is invented.",
      sc_u_teachers: "His teachers",
      sc_u_ijazat: "Scholarly ijazat",
      sc_u_bio: "Biography details (birth, studies, journey)",
      sc_sheikh_honest: "Nothing here is invented · لا شيء هنا مختلق.",
      sc_favs_kicker: "Favorites · المفضلة",
      sc_favs_title: "Your saved lessons",
      sc_favs_lede: "Every lesson you save with the heart button will appear here, organized and ready whenever you return.",
      sc_favs_empty_t: "No saved lessons yet",
      sc_favs_empty_p: "When you like a lesson, press the save button and it will appear here. Start browsing and pick your first lesson.",
      sc_favs_go: "Browse the library",
      sc_watch: "Watch",
      sc_remove: "Remove"
    }
  });

  var hero = function (kicker, title, lede, delay) {
    var t = title ? '<h1 class="sc-title">' + App.esc(App.t(title)) + "</h1>" : "";
    var l = lede ? '<p class="sc-lede">' + App.esc(App.t(lede)) + "</p>" : "";
    return '<div class="sc-hero sc-reveal ' + (delay || "") + '">' +
      '<span class="sc-kicker">' + App.esc(App.t(kicker)) + "</span>" + t + l + "</div>";
  };

  /* ---------- WHERE TO START ---------- */
  App.renderStart = function () {
    var box = document.getElementById("sc-start");
    if (!box) return;
    var steps = [
      { t: "sc_step1_t", d1: "sc_step1_d1", d2: "sc_step1_d2", lvl: "sc_lvl1", pre: null },
      { t: "sc_step2_t", d1: "sc_step2_d1", d2: "sc_step2_d2", lvl: "sc_lvl1", pre: "sc_step1_t" },
      { t: "sc_step3_t", d1: "sc_step3_d1", d2: "sc_step3_d2", lvl: "sc_lvl1", pre: "sc_step2_t" },
      { t: "sc_step4_t", d1: "sc_step4_d1", d2: "sc_step4_d2", lvl: "sc_lvl2", pre: "sc_step3_t" },
      { t: "sc_step5_t", d1: "sc_step5_d1", d2: "sc_step5_d2", lvl: "sc_lvl2", pre: "sc_step4_t" },
      { t: "sc_step6_t", d1: "sc_step6_d1", d2: "sc_step6_d2", lvl: "sc_lvl3", pre: "sc_step5_t" }
    ];
    var h = hero("sc_start_kicker", "sc_start_title", "sc_start_lede", "sc-d1");

    h += '<div class="sc-first sc-reveal sc-d2">' +
      '<span class="sc-first-tag">' + App.esc(App.t("sc_first_tag")) + "</span>" +
      "<h2>" + App.esc(App.t("sc_first_title")) + "</h2>" +
      "<p>" + App.esc(App.t("sc_first_p1")) + "</p>" +
      "<p>" + App.esc(App.t("sc_first_p2")) + "</p>" +
      '<div class="sc-actions">' + pill() +
      '<a class="sc-btn-ghost" href="#/library">' + App.esc(App.t("sc_browse")) + "</a></div></div>";

    h += '<h2 class="sc-sectitle sc-reveal sc-d2">' + App.esc(App.t("sc_sort_title")) + "</h2>" +
      '<p class="sc-secsub sc-reveal sc-d2">' + App.esc(App.t("sc_sort_sub")) + "</p>" +
      '<div class="sc-grid">' +
      [1, 2, 3].map(function (i) {
        return '<div class="sc-card sc-reveal sc-d3"><h3>' + App.esc(App.t("sc_sort" + i + "_t")) + "</h3>" +
          "<p>" + App.esc(App.t("sc_sort" + i + "_p1")) + "</p>" +
          "<p>" + App.esc(App.t("sc_sort" + i + "_p2")) + "</p>" + pill() + "</div>";
      }).join("") + "</div>";

    h += '<h2 class="sc-sectitle sc-reveal sc-d3">' + App.esc(App.t("sc_path_title")) + "</h2>" +
      '<p class="sc-secsub sc-reveal sc-d3">' + App.esc(App.t("sc_path_sub")) + "</p>" +
      '<div class="sc-steps">';
    steps.forEach(function (s, idx) {
      var n = idx + 1;
      h += '<div class="sc-step sc-reveal sc-d' + Math.min(4, idx + 2) + '">' +
        '<div class="sc-num" aria-hidden="true">' + n + "</div>" +
        '<div class="sc-step-body">' +
        "<h3>" + App.esc(App.t(s.t)) + "</h3>" +
        '<div class="sc-step-meta"><span class="sc-level">' + App.esc(App.t(s.lvl)) + "</span>" +
        (s.pre ? '<span class="sc-pre">' + App.esc(App.t("sc_preq")) + ": " + App.esc(App.t(s.pre)) + "</span>" : "") +
        "</div>" +
        "<p>" + App.esc(App.t(s.d1)) + "</p>" +
        "<p>" + App.esc(App.t(s.d2)) + "</p>" +
        '<div class="sc-step-foot"><span style="font-size:.85rem;color:var(--ink3)">' +
        App.esc(App.t("sc_series_note")) + ":</span>" + pill() + libBtn(App.t("sc_browse")) + "</div>" +
        "</div></div>";
    });
    h += "</div>";
    box.innerHTML = h;
  };

  /* ---------- ABOUT ---------- */
  App.renderAbout = function () {
    var box = document.getElementById("sc-about");
    if (!box) return;
    box.innerHTML =
      hero("sc_about_kicker", "sc_about_title", "sc_about_lede", "sc-d1") +
      '<div class="sc-about-block sc-reveal sc-d2">' +
      '<div style="text-align:center"><span class="sc-draft">' + App.esc(App.t("sc_about_draft")) + "</span></div>" +
      "<h3>" + App.esc(App.t("sc_about_what_t")) + "</h3>" +
      "<p>" + App.esc(App.t("sc_about_what_p1")) + "</p>" +
      "<p>" + App.esc(App.t("sc_about_what_p2")) + "</p>" +
      "<h3>" + App.esc(App.t("sc_about_who_t")) + "</h3>" +
      "<p>" + App.esc(App.t("sc_about_who_p1")) + "</p>" +
      "<p>" + App.esc(App.t("sc_about_who_p2")) + "</p>" +
      '<p style="text-align:center;color:var(--ink3);font-size:.9rem">' + App.esc(App.t("sc_about_draft_note")) + "</p>" +
      '<div class="sc-facts">' +
      '<div class="sc-fact"><b>3,977</b><span>' + App.esc(App.t("sc_videos_n")) + "</span></div>" +
      '<div class="sc-fact"><b>71</b><span>' + App.esc(App.t("sc_lists_n")) + "</span></div>" +
      '<div class="sc-fact"><b>100%</b><span>' + App.esc(App.t("sc_offline_n")) + "</span></div>" +
      "</div></div>";
  };

  /* ---------- MISSION ---------- */
  App.renderMission = function () {
    var box = document.getElementById("sc-mission");
    if (!box) return;
    var icons = ["\uD83D\uDEE1\uFE0F", "\uD83D\uDC9B", "\uD83E\uDD32"];
    var h = hero("sc_mission_kicker", "sc_mission_title", "sc_mission_lede", "sc-d1") + '<div class="sc-grid">';
    [1, 2, 3].forEach(function (i) {
      h += '<div class="sc-card sc-pillar sc-reveal sc-d' + (i + 1) + '">' +
        '<div class="sc-pic" aria-hidden="true">' + icons[i - 1] + "</div>" +
        "<h3>" + App.esc(App.t("sc_p" + i + "_t")) + "</h3>" +
        "<p>" + App.esc(App.t("sc_p" + i + "_p1")) + "</p>" +
        "<p>" + App.esc(App.t("sc_p" + i + "_p2")) + "</p></div>";
    });
    box.innerHTML = h + "</div>";
  };

  /* ---------- ABOUT THE SHEIKH ---------- */
  App.renderSheikh = function () {
    var box = document.getElementById("sc-sheikh");
    if (!box) return;
    var unknowns = ["sc_u_teachers", "sc_u_ijazat", "sc_u_bio"];
    var h = hero("sc_sheikh_kicker", null, null, "sc-d1");
    h += '<div class="sc-mono sc-reveal sc-d2"><div class="sc-star" role="img" aria-label="' +
      App.esc(App.t("sc_sheikh_name")) + '"><div class="sc-star-in"><span aria-hidden="true">\u0645</span></div></div></div>' +
      '<h2 class="sc-sheikh-name sc-reveal sc-d2">' + App.esc(App.t("sc_sheikh_name")) + "</h2>" +
      '<p class="sc-sheikh-sub sc-reveal sc-d2">' + App.esc(App.t("sc_sheikh_sub")) + "</p>" +
      '<div class="sc-about-block sc-reveal sc-d3">' +
      "<p>" + App.esc(App.t("sc_sheikh_f1")) + "</p>" +
      "<p>" + App.esc(App.t("sc_sheikh_f2")) + "</p></div>" +
      '<h2 class="sc-sectitle sc-reveal sc-d3">' + App.esc(App.t("sc_sheikh_unknown_t")) + "</h2>" +
      '<p class="sc-secsub sc-reveal sc-d3">' + App.esc(App.t("sc_sheikh_unknown_sub")) + "</p>" +
      '<ul class="sc-unknown sc-reveal sc-d4">' +
      unknowns.map(function (k) {
        return "<li><b>" + App.esc(App.t(k)) + "</b>" + pill() + "</li>";
      }).join("") + "</ul>" +
      '<div style="text-align:center"><span class="sc-okline sc-reveal sc-d4">' +
      App.esc(App.t("sc_sheikh_honest")) + "</span></div>";
    box.innerHTML = h;
  };

  /* ---------- FAVORITES ---------- */
  function favCard(v) {
    var lang = App.state.lang;
    var title = (lang === "en" && v.titleEn) ? v.titleEn : v.title;
    return '<article class="sc-favcard sc-reveal">' +
      '<a class="sc-thumb" href="#/lesson/' + App.esc(v.id) + '">' +
      (v.thumbnail ? '<img src="' + App.esc(v.thumbnail) + '" alt="" loading="lazy">' : "") + "</a>" +
      '<div class="sc-favbody">' +
      '<h3 class="sc-favtitle">' + App.esc(title || "") + "</h3>" +
      '<div class="sc-favmeta"><span class="sc-dur">' + App.esc(App.fmtDur(v.duration || 0)) + "</span></div>" +
      '<div class="sc-favactions">' +
      '<a class="sc-btn" href="#/lesson/' + App.esc(v.id) + '">' + App.esc(App.t("sc_watch")) + "</a>" +
      '<button type="button" class="sc-btn-ghost" data-sc-unfav="' + App.esc(v.id) + '">' + App.esc(App.t("sc_remove")) + "</button>" +
      "</div></div></article>";
  }

  App.renderFavs = function () {
    var box = document.getElementById("sc-favs");
    if (!box) return;
    var ids = [];
    if (App.state.favs && App.state.favs.forEach) {
      App.state.favs.forEach(function (id) { ids.push(id); });
    }
    var h = hero("sc_favs_kicker", "sc_favs_title", "sc_favs_lede", "sc-d1");
    if (!ids.length) {
      h += '<div class="sc-empty sc-reveal sc-d2"><span class="sc-big" aria-hidden="true">\u2764\uFE0F</span>' +
        "<h3 style=\"font-family:var(--font-head);color:var(--ink);margin:0 0 .4rem\">" +
        App.esc(App.t("sc_favs_empty_t")) + "</h3>" +
        "<p>" + App.esc(App.t("sc_favs_empty_p")) + "</p>" +
        '<div class="sc-actions">' + libBtn(App.t("sc_favs_go")) + "</div></div>";
    } else {
      h += '<div class="sc-favgrid">';
      ids.forEach(function (id) {
        var v = App.vid(id);
        if (v) h += favCard(v);
      });
      h += "</div>";
    }
    box.innerHTML = h;
  };

  document.addEventListener("click", function (e) {
    var b = e.target && e.target.closest ? e.target.closest("[data-sc-unfav]") : null;
    if (!b) return;
    var id = b.getAttribute("data-sc-unfav");
    if (App.state.favs && App.state.favs.delete) {
      App.state.favs.delete(id);
      App.save();
      App.renderFavs();
    }
  });
})();
