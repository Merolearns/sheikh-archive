/* track-home.js: HOME + LIBRARY views. IIFE, window.App only. */
(function () {
  "use strict";

  App.addStrings({
    ar: {
      hm_welcome: "مكتبة دروس الشيخ",
      hm_search_ph: "ابحث عن درس أو عنوان...",
      hm_search_btn: "ابحث",
      hm_browse: "تصفح المكتبة · Browse Library",
      hm_continue: "أكمل المشاهدة · Continue Watching",
      hm_featured: "سلاسل مختارة · Featured Series",
      hm_scholars: "العلماء · Scholars",
      hm_open: "افتح · Open",
      hm_episodes: "حلقة",
      hm_series_label: "سلسلة · Series",
      hm_videos_label: "درس",
      hm_playlists_label: "سلسلة",
      hm_sheikh: "فضيلة الشيخ الدكتور مصطفى كامل",
      hm_no_results: "لا توجد نتائج مطابقة، جرب كلمة أخرى",
      hm_offline: "متاح دون اتصال",
      lb_title: "المكتبة · Library",
      lb_all: "الكل · All",
      lb_search_ph: "ابحث في السلاسل...",
      lb_sort_label: "ترتيب",
      lb_sort_title: "حسب العنوان",
      lb_sort_count: "حسب عدد الحلقات",
      lb_sort_recent: "الأحدث",
      lb_open: "افتح · Open",
      lb_empty: "لا توجد سلاسل مطابقة هنا",
      lb_g_quran: "القرآن الكريم · Quran",
      lb_g_seerah: "السيرة والشمائل · Seerah",
      lb_g_hadith: "الحديث الشريف · Hadith",
      lb_g_fiqh: "الفقه والعبادات · Fiqh",
      lb_g_aqidah: "العقيدة · Aqidah",
      lb_g_tazkiyah: "التزكية والأخلاق · Tazkiyah",
      lb_g_seasons: "المواسم والمناسبات · Seasons",
      lb_g_misc: "دروس عامة · General"
    },
    en: {
      hm_welcome: "The Sheikh's Lesson Library",
      hm_search_ph: "Search a lesson or title...",
      hm_search_btn: "Search",
      hm_browse: "Browse Library · تصفح المكتبة",
      hm_continue: "Continue Watching · أكمل المشاهدة",
      hm_featured: "Featured Series · سلاسل مختارة",
      hm_scholars: "Scholars · العلماء",
      hm_open: "Open · افتح",
      hm_episodes: "episodes",
      hm_series_label: "Series · سلسلة",
      hm_videos_label: "videos",
      hm_playlists_label: "series",
      hm_sheikh: "Dr. Moustafa Kamel",
      hm_no_results: "No matching results, try another word",
      hm_offline: "Available offline",
      lb_title: "Library · المكتبة",
      lb_all: "All · الكل",
      lb_search_ph: "Search series...",
      lb_sort_label: "Sort",
      lb_sort_title: "By title",
      lb_sort_count: "By episode count",
      lb_sort_recent: "Most recent",
      lb_open: "Open · افتح",
      lb_empty: "No matching series here",
      lb_g_quran: "Quran · القرآن الكريم",
      lb_g_seerah: "Seerah · السيرة والشمائل",
      lb_g_hadith: "Hadith · الحديث الشريف",
      lb_g_fiqh: "Fiqh · الفقه والعبادات",
      lb_g_aqidah: "Aqeedah · العقيدة",
      lb_g_tazkiyah: "Tazkiyah · التزكية والأخلاق",
      lb_g_seasons: "Seasons · المواسم والمناسبات",
      lb_g_misc: "General · دروس عامة"
    }
  });

  /* ---- Topic groups: exact playlist titles from the catalog (71 total) ---- */
  var norm = function (s) { return String(s || "").replace(/\s+/g, " ").trim(); };

  var GROUPS = [
    { key: "quran", titles: [
      "وقفات تربوية مع سور القرآن الكريم",
      "برنامج في حفظ ثلاثة اجزاء مع التجويد والمعاني والإعراب",
      "ليلة قرآنية",
      "نظرات في سورة مريم",
      "تفسير سورة الأنعام",
      "التجويد",
      "تفسيرالقران الكريم" ] },
    { key: "seerah", titles: [
      "موسوعة شمائل المصطفى صلى الله عليه وسلم",
      "الرسول محمد ﷺ يتحدث عن نفسه",
      "الاسراء والمعراج",
      "محمد رسول الله صلى الله عليه وسلم",
      "صاحب الخلق العظيم ﷺ",
      "وقفات تربوية من السيرة النبوية",
      "كيف عاملهم رسول الله صلى الله عليه وسلم",
      "السيرة النبوية" ] },
    { key: "hadith", titles: [
      "معالم السنة النبوية الشريفة",
      "دورة الحديث بالتعاون مع أكاديمية ائمة امريكا",
      "شرح صحيح الإمام البخاري",
      "سلسله شرح البيقونيه - علم مصطلح الحديث" ] },
    { key: "aqidah", titles: [
      "Aqeeda by Dr Imad Bayoun",
      "أسماء الله الحسنى",
      "الفقه العام -التوحيد" ] },
    { key: "fiqh", titles: [
      "الزكاة سؤال وجواب",
      "فقه المعاملات 2023 المستثمر المسلم",
      "فقه العبادات",
      "دورة جديدة في علم أصول الفقه 2022",
      "قضايا فقهية معاصرة",
      "فقه الاقليات",
      "أصول الفقه",
      "سلسلة فقه المعاملات",
      "الحج" ] },
    { key: "tazkiyah", titles: [
      "من أخلاق النصر في جيل الصحابة",
      "المبشرين بالجنة من غير العشرة",
      "موسى عليه السلام",
      "القدوة الطيبة",
      "معالم على طريق التوفيق",
      "تزكية النفوس ( قراءة في مختصر منهاج القاصدين)",
      "سلسلة مكارم الأخلاق",
      "شخصية المرأة المسلمة كما يريدها القرآن الكريم والسنة المطهرة",
      "القدوة الطيبة للمرأة المسلمة",
      "خطب أحوال النفوس وتؤكيتها",
      "سلسلة الأخلاق",
      "سلسله حل المشاكل الزوجيه" ] },
    { key: "seasons", titles: [
      "رمضان كما عاشَهُ رسول الله محمد ﷺ",
      "شهر شعبان ١٤٤٧-٢٠٢٦",
      "خاطرة وسؤال خلال صلاة التراويح- رمضان 2025",
      "شهر شعبان 2025-1466",
      "شهر رمضان ١٤٤٥-٢٠٢٤",
      "شهر شعبان 1445 -2024",
      "دروس وخطب شهر شعبان 2023",
      "Ramadan 2022-1443",
      "قصص وعبر - رمضان 2022 -1443",
      "دروس وخطب شهر شعبان2022",
      "دروس وخطب شهر رجب 2022",
      "شهر ربيع مولد سيد الخلق ﷺ ١٤٤٣-٢٠٢١",
      "العشر الاوائل من ذي الحجة",
      "رمضان - العيد ٢٠٢١",
      "كل يوم سؤال/ خاطرة بعد صلاة التراويح رمضان 2021",
      "رمضان سؤال وجواب",
      "سلسلة يوم من حياة مسلم في شهر رمضان ١٤٤٢هـ-٢٠٢١م",
      "برنامج و بشر المؤمنين - رمضان",
      "رمضانيات" ] },
    { key: "misc", titles: [
      "خواطر العشاء قضايا وقصص",
      "سلسلة خواطر الفجر",
      "تاريخ الهجرة",
      "English Lectures",
      "خطب الجمعة",
      "أحداث عامة",
      "دروس العشاء",
      "دروس السبت",
      "أنشطة المسجد في الصيف" ] }
  ];

  var groupOf = function (title) {
    var t = norm(title);
    for (var i = 0; i < GROUPS.length; i++) {
      var list = GROUPS[i].titles;
      for (var j = 0; j < list.length; j++) {
        if (norm(list[j]) === t) return GROUPS[i].key;
      }
    }
    return "misc";
  };

  /* ---- Shared card builders ---- */
  var OFFLINE_SVG = '<svg class="hm-off" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v10m0 0l-4-4m4 4l4-4"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></svg>';

  var thumbHtml = function (src, alt) {
    var img = src
      ? '<img src="' + App.esc(src) + '" alt="' + App.esc(alt) + '" loading="lazy" onerror="this.closest(\'.hm-thumb\').classList.add(\'is-fallback\')">'
      : "";
    var cls = src ? "hm-thumb" : "hm-thumb is-fallback";
    return '<div class="' + cls + '">' + img + '<div class="hm-thumb-fallback" aria-hidden="true">۞</div></div>';
  };

  var progressHtml = function (pct) {
    if (!(pct > 0)) return "";
    return '<div class="hm-progress"><i style="width:' + Math.min(100, Math.round(pct)) + '%"></i></div>';
  };

  var playlistCard = function (pl, openKey) {
    var title = App.esc(pl.title);
    var eyebrow = App.esc(App.t("lb_g_" + groupOf(pl.title)));
    var meta = Number(pl.count || 0).toLocaleString("en-US") + " " + App.esc(App.t("hm_episodes"));
    var href = "#/playlist/" + encodeURIComponent(pl.id);
    return '<article class="hm-card hm-card--arch">' +
      thumbHtml(pl.cover, pl.title) +
      '<div class="hm-body">' +
      '<div class="hm-eyebrow">' + eyebrow + '</div>' +
      '<h3 class="hm-title">' + title + '</h3>' +
      '<div class="hm-meta"><span>' + App.esc(meta) + '</span>' +
      '<span title="' + App.esc(App.t("hm_offline")) + '">' + OFFLINE_SVG + '</span></div>' +
      '<a class="hm-open" href="' + href + '">' + App.esc(App.t(openKey || "hm_open")) + '</a>' +
      '</div></article>';
  };

  var videoCard = function (v, pct) {
    var pl = v.playlistIds && v.playlistIds.length ? App.pl(v.playlistIds[0]) : null;
    var eyebrow = pl ? App.esc(pl.title) : App.esc(App.t("hm_series_label"));
    var year = v.uploadDate ? String(v.uploadDate).slice(0, 4) : "";
    var meta = App.fmtDur(v.duration || 0) + (year ? " · " + App.esc(year) : "");
    var href = "#/lesson/" + encodeURIComponent(v.id);
    return '<article class="hm-card">' +
      thumbHtml(v.thumbnail, v.title) +
      '<div class="hm-body">' +
      '<div class="hm-eyebrow">' + eyebrow + '</div>' +
      '<h3 class="hm-title">' + App.esc(v.title) + '</h3>' +
      '<div class="hm-meta"><span>' + App.esc(meta) + '</span>' +
      '<span title="' + App.esc(App.t("hm_offline")) + '">' + OFFLINE_SVG + '</span></div>' +
      progressHtml(pct) +
      '<a class="hm-open" href="' + href + '">' + App.esc(App.t("hm_open")) + '</a>' +
      '</div></article>';
  };

  /* ---- HOME ---- */
  var $ = function (id) { return document.getElementById(id); };

  var heroSearch = function (q) {
    var box = $("hm-search-results");
    q = norm(q).toLowerCase();
    if (q.length < 2) { box.hidden = true; box.innerHTML = ""; return; }
    var hits = [];
    for (var i = 0; i < DATA.videos.length && hits.length < 8; i++) {
      var v = DATA.videos[i];
      var hay = norm(v.title).toLowerCase() + " " + norm(v.titleEn).toLowerCase();
      if (hay.indexOf(q) !== -1) hits.push(v);
    }
    if (!hits.length) {
      box.innerHTML = '<div class="hm-no-results">' + App.esc(App.t("hm_no_results")) + '</div>';
    } else {
      box.innerHTML = hits.map(function (v) {
        return '<a class="hm-result" href="#/lesson/' + encodeURIComponent(v.id) + '">' +
          (v.thumbnail ? '<img src="' + App.esc(v.thumbnail) + '" alt="" loading="lazy">' : "") +
          '<span><span class="hm-result-title">' + App.esc(v.title) + '</span>' +
          '<span class="hm-result-meta">' + App.esc(App.fmtDur(v.duration || 0)) + '</span></span></a>';
      }).join("");
    }
    box.hidden = false;
  };

  var lastWatchedId = function () {
    var prog = App.state.prog || {};
    var ids = Object.keys(prog).filter(function (id) { return prog[id] > 0 && App.vid(id); });
    return ids.length ? ids[ids.length - 1] : null;
  };

  App.renderHome = function () {
    $("hm-welcome").textContent = App.t("hm_welcome");
    $("hm-search-input").placeholder = App.t("hm_search_ph");
    $("hm-search-btn").textContent = App.t("hm_search_btn");
    $("hm-btn-browse").textContent = App.t("hm_browse");
    $("hm-btn-continue").textContent = App.t("hm_continue");
    $("hm-title-continue").textContent = App.t("hm_continue");
    $("hm-title-featured").textContent = App.t("hm_featured");
    $("hm-title-scholars").textContent = App.t("hm_scholars");

    var input = $("hm-search-input");
    input.value = "";
    input.oninput = function () { heroSearch(input.value); };
    input.onkeydown = function (e) {
      if (e.key === "Enter") heroSearch(input.value);
      if (e.key === "Escape") { $("hm-search-results").hidden = true; }
    };
    input.onblur = function () { setTimeout(function () { $("hm-search-results").hidden = true; }, 150); };
    $("hm-search-btn").onclick = function () { heroSearch(input.value); };

    $("hm-btn-browse").onclick = function () { App.go("#/library"); };
    $("hm-btn-continue").onclick = function () {
      var id = lastWatchedId();
      App.go(id ? "#/lesson/" + encodeURIComponent(id) : "#/library");
    };

    // Continue Watching rail
    var prog = App.state.prog || {};
    var ids = Object.keys(prog).filter(function (id) { return prog[id] > 0 && App.vid(id); });
    var sec = $("hm-sec-continue");
    if (!ids.length) {
      sec.hidden = true;
    } else {
      sec.hidden = false;
      $("hm-rail-continue").innerHTML = ids.map(function (id) {
        var v = App.vid(id);
        var pct = v.duration ? (100 * prog[id]) / v.duration : 0;
        return videoCard(v, pct);
      }).join("");
    }

    // Featured Series: 8 playlists with the highest count
    var top = DATA.playlists.slice().sort(function (a, b) { return (b.count || 0) - (a.count || 0); }).slice(0, 8);
    $("hm-rail-featured").innerHTML = top.map(function (p) { return playlistCard(p, "hm_open"); }).join("");

    // Scholar card
    var nv = DATA.videos.length.toLocaleString("en-US");
    var np = DATA.playlists.length.toLocaleString("en-US");
    $("hm-scholar-card").innerHTML =
      '<div class="hm-scholar">' +
      '<div class="hm-mono" aria-hidden="true">م</div>' +
      '<div><h3 class="hm-scholar-name">' + App.esc(App.t("hm_sheikh")) + '</h3>' +
      '<div class="hm-scholar-stats">' +
      '<span><b>' + nv + '</b> ' + App.esc(App.t("hm_videos_label")) + '</span>' +
      '<span><b>' + np + '</b> ' + App.esc(App.t("hm_playlists_label")) + '</span>' +
      '</div></div></div>';
  };

  /* ---- LIBRARY ---- */
  var lbGroup = "all";
  var lbQuery = "";
  var lbSort = "title";

  var groupCounts = function () {
    var c = {};
    for (var i = 0; i < GROUPS.length; i++) c[GROUPS[i].key] = 0;
    for (var k = 0; k < DATA.playlists.length; k++) {
      var g = groupOf(DATA.playlists[k].title);
      c[g] = (c[g] || 0) + 1;
    }
    return c;
  };

  var playlistRecent = function (pl) {
    var best = "";
    var items = pl.items || [];
    for (var i = 0; i < items.length; i++) {
      var v = App.vid(items[i] && items[i].id);
      if (v && v.uploadDate && v.uploadDate > best) best = v.uploadDate;
    }
    return best;
  };

  var renderSide = function () {
    var c = groupCounts();
    var html = '<li><button class="lb-side-item' + (lbGroup === "all" ? " is-active" : "") + '" data-g="all">' +
      '<span>' + App.esc(App.t("lb_all")) + '</span>' +
      '<span class="lb-side-count">' + DATA.playlists.length + '</span></button></li>';
    html += GROUPS.map(function (g) {
      return '<li><button class="lb-side-item' + (lbGroup === g.key ? " is-active" : "") + '" data-g="' + g.key + '">' +
        '<span>' + App.esc(App.t("lb_g_" + g.key)) + '</span>' +
        '<span class="lb-side-count">' + (c[g.key] || 0) + '</span></button></li>';
    }).join("");
    $("lb-side-list").innerHTML = html;
    var btns = $("lb-side-list").querySelectorAll(".lb-side-item");
    for (var i = 0; i < btns.length; i++) {
      btns[i].onclick = function () { lbGroup = this.getAttribute("data-g"); App.rerender(); };
    }
  };

  var renderGrid = function () {
    var q = norm(lbQuery).toLowerCase();
    var list = DATA.playlists.filter(function (pl) {
      if (lbGroup !== "all" && groupOf(pl.title) !== lbGroup) return false;
      if (q) {
        var hay = norm(pl.title).toLowerCase() + " " + norm(pl.titleEn).toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });
    if (lbSort === "title") {
      list.sort(function (a, b) { return norm(a.title).localeCompare(norm(b.title), "ar"); });
    } else if (lbSort === "count") {
      list.sort(function (a, b) { return (b.count || 0) - (a.count || 0); });
    } else if (lbSort === "recent") {
      list.sort(function (a, b) {
        var x = playlistRecent(a), y = playlistRecent(b);
        return y < x ? -1 : (y > x ? 1 : 0);
      });
    }
    $("lb-grid").innerHTML = list.map(function (p) { return playlistCard(p, "lb_open"); }).join("");
    $("lb-empty").hidden = list.length > 0;
    $("lb-empty").textContent = App.t("lb_empty");
  };

  App.renderLibrary = function () {
    $("lb-title").textContent = App.t("lb_title");
    renderSide();

    var search = $("lb-search");
    search.placeholder = App.t("lb_search_ph");
    if (document.activeElement !== search) search.value = lbQuery;
    search.oninput = function () { lbQuery = search.value; renderGrid(); };

    $("lb-sort-label").textContent = App.t("lb_sort_label");
    var sel = $("lb-sort");
    sel.innerHTML = ["title", "count", "recent"].map(function (k) {
      return '<option value="' + k + '"' + (lbSort === k ? " selected" : "") + '>' +
        App.esc(App.t("lb_sort_" + k)) + '</option>';
    }).join("");
    sel.onchange = function () { lbSort = sel.value; renderGrid(); };

    renderGrid();
  };
})();
