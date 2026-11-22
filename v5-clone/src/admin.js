/* Admin page (V5): books, series and videos, users, site settings.
   Visible only to the admin account. Edits are kept in this browser as
   staged changes until the overrides file is committed to the repo and
   the site is republished; nothing here writes to the repo or to
   Supabase directly, and no privileged key is used anywhere. */
(function () {
  "use strict";
  var ADMIN_EMAIL = "meroatschool@gmail.com";
  var STAGED_KEY = "archive-v5-admin-staged";
  var ACCT_KEY = "archive-v5-account";
  var LANG_KEY = "archive-v2-lang";
  var PROFILES_SQL = "src/admin-profiles.sql";

  var S = {
    ar: {
      adm_title: "الإدارة",
      adm_lede: "الكتب والسلاسل والدروس والمستخدمون وإعدادات الموقع. هذه الصفحة لك وحدك.",
      adm_tab_books: "الكتب",
      adm_tab_videos: "السلاسل والدروس",
      adm_tab_users: "المستخدمون",
      adm_tab_settings: "الإعدادات",
      adm_books_h: "الكتب",
      adm_books_p: "عدد الصفحات مأخوذ من ملفات الكتب. أخفِ كتابا لإزالته من قائمة الكتب.",
      adm_col_title: "العنوان",
      adm_col_pages: "الصفحات",
      adm_col_parts: "الأجزاء",
      adm_col_status: "الحالة",
      adm_shown: "ظاهر",
      adm_hidden: "مخفي",
      adm_staged: "معد",
      adm_edit: "تعديل",
      adm_save: "حفظ",
      adm_cancel: "إلغاء",
      adm_title_ar: "العنوان بالعربية",
      adm_title_en: "العنوان بالإنجليزية",
      adm_pages: "الصفحات",
      adm_hide_book: "أخفِ هذا الكتاب",
      adm_held_h: "كتب موقوفة",
      adm_held_p: "هذه الكتب مخفية من قائمة الكتب، وتبقى مخفية حتى يؤكدها الشيخ.",
      adm_held_note38: "الملف ليس على GitHub، فسيكون رابط القراءة معطلا. ولا يظهر مؤلف، لأن التأليف غير مؤكد.",
      adm_no_author: "لا يظهر مؤلف",
      adm_series_h: "السلاسل",
      adm_series_p: "غيّر عنوان سلسلة. يسري التغيير بعد حفظ ملف التجاوزات في المستودع وإعادة نشر الموقع.",
      adm_series_search_ph: "ابحث في السلاسل بالعنوان",
      adm_search: "بحث",
      adm_lessons: "درس",
      adm_videos_h: "الدروس",
      adm_videos_p: "ابحث عن درس بالعنوان، ثم غيّر عنوانه.",
      adm_video_search_ph: "ابحث في الدروس بالعنوان",
      adm_no_match: "لا نتائج. جرّب بحثا أقصر.",
      adm_type_to_search: "اكتب حرفين على الأقل ثم ابحث.",
      adm_users_h: "المستخدمون",
      adm_users_p: "من سجّلوا في الموقع. القائمة تشمل فقط من سجّلوا بعد إعداد جدول الملفات.",
      adm_users_load: "اعرض القائمة",
      adm_users_setup: "قائمة المسجلين ليست معدة بعد.",
      adm_users_setup_p: "نفّذ الملف src/admin-profiles.sql مرة واحدة في محرر SQL في Supabase لمشروع sheikh-archive. بعدها تظهر التسجيلات الجديدة هنا. والتسجيلات التي سبقت تلك الخطوة لا تظهر.",
      adm_users_none: "لا تسجيلات بعد.",
      adm_users_err: "تعذّر تحميل القائمة. تحقق من خطوة الإعداد أعلاه ثم حاول مجددا.",
      adm_col_email: "البريد",
      adm_col_joined: "تاريخ التسجيل",
      adm_set_h: "إعدادات الموقع",
      adm_set_p: "تسري هذه الإعدادات بعد حفظ ملف التجاوزات في المستودع وإعادة نشر الموقع.",
      adm_ann: "شريط الإعلان (فارغ يعني لا شريط)",
      adm_live: "أظهر زر البث المباشر في الصفحة الرئيسية",
      adm_stage_h: "التغييرات المعدة",
      adm_stage_p: "التغييرات المعدة تبقى في هذا المتصفح فقط. لنشرها، ضع هذا الملف في src/admin-overrides.json في المستودع وأعد نشر الموقع.",
      adm_stage_none: "لا تغييرات معدة.",
      adm_copy: "انسخ JSON",
      adm_copied: "تم النسخ",
      adm_download: "نزّل admin-overrides.json",
      adm_clear: "امسح التغييرات المعدة",
      adm_not_admin: "هذه الصفحة للمسؤول فقط."
    },
    en: {
      adm_title: "Admin",
      adm_lede: "Books, series, videos, users and site settings. Only you can see this page.",
      adm_tab_books: "Books",
      adm_tab_videos: "Series and videos",
      adm_tab_users: "Users",
      adm_tab_settings: "Settings",
      adm_books_h: "Books",
      adm_books_p: "Page counts come from the book files. Hide a book to remove it from the Books list.",
      adm_col_title: "Title",
      adm_col_pages: "Pages",
      adm_col_parts: "Parts",
      adm_col_status: "Status",
      adm_shown: "Shown",
      adm_hidden: "Hidden",
      adm_staged: "Staged",
      adm_edit: "Edit",
      adm_save: "Save",
      adm_cancel: "Cancel",
      adm_title_ar: "Arabic title",
      adm_title_en: "English title",
      adm_pages: "Pages",
      adm_hide_book: "Hide this book",
      adm_held_h: "Held books",
      adm_held_p: "These books are hidden from the Books list. They stay hidden until the Sheikh confirms them.",
      adm_held_note38: "The file is not on GitHub, so its Read link would be dead. No author is shown, because authorship is not confirmed.",
      adm_no_author: "No author shown",
      adm_series_h: "Series",
      adm_series_p: "Change a series title. The change applies after the overrides file is committed and the site is republished.",
      adm_series_search_ph: "Search series by title",
      adm_search: "Search",
      adm_lessons: "lessons",
      adm_videos_h: "Videos",
      adm_videos_p: "Search a video by title, then change its title.",
      adm_video_search_ph: "Search videos by title",
      adm_no_match: "No matches. Try a shorter search.",
      adm_type_to_search: "Type at least two letters, then search.",
      adm_users_h: "Users",
      adm_users_p: "People who signed up. The list only covers sign-ups after the profiles table is set up.",
      adm_users_load: "Load the list",
      adm_users_setup: "The sign-ups list is not set up yet.",
      adm_users_setup_p: "Run the file src/admin-profiles.sql once in the Supabase SQL Editor for project sheikh-archive. New sign-ups then appear here. Sign-ups from before that step are not listed.",
      adm_users_none: "No sign-ups yet.",
      adm_users_err: "The list could not be loaded. Check the setup step above, then try again.",
      adm_col_email: "Email",
      adm_col_joined: "Signed up",
      adm_set_h: "Site settings",
      adm_set_p: "These settings apply after the overrides file is committed and the site is republished.",
      adm_ann: "Announcement banner (empty means no banner)",
      adm_live: "Show the live video button on the home page",
      adm_stage_h: "Staged changes",
      adm_stage_p: "Staged changes live only in this browser. To publish them, put this file in src/admin-overrides.json in the repo and republish the site.",
      adm_stage_none: "No staged changes.",
      adm_copy: "Copy JSON",
      adm_copied: "Copied",
      adm_download: "Download admin-overrides.json",
      adm_clear: "Clear staged changes",
      adm_not_admin: "This page is for the admin only."
    }
  };

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  var ESC = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  function esc(v) { return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) { return ESC[c]; }); }
  function lang() {
    try {
      var v = JSON.parse(localStorage.getItem(LANG_KEY) || '"ar"');
      return v === "en" ? "en" : "ar";
    } catch (e) { return "ar"; }
  }
  function t(k) { var l = lang(); return (S[l] && S[l][k]) || S.ar[k] || k; }
  function readJSON(key, fallback) {
    try {
      var v = JSON.parse(localStorage.getItem(key));
      return v == null ? fallback : v;
    } catch (e) { return fallback; }
  }
  function writeJSON(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
  }
  function account() { return readJSON(ACCT_KEY, null); }
  function isAdmin() {
    var a = account();
    return !!(a && a.mode === "email" && a.access_token && String(a.email || "").toLowerCase() === ADMIN_EMAIL);
  }
  function committed() {
    try {
      if (typeof ADMIN_OVERRIDES !== "undefined" && ADMIN_OVERRIDES) return ADMIN_OVERRIDES;
    } catch (e) {}
    return { books: {}, series: {}, videos: {}, settings: {} };
  }
  function heldBooks() {
    try {
      if (typeof ADMIN_HELD !== "undefined" && ADMIN_HELD) return ADMIN_HELD;
    } catch (e) {}
    return [];
  }
  function staged() { return readJSON(STAGED_KEY, {}); }
  function saveStaged(v) { writeJSON(STAGED_KEY, v); }
  function cleanStaged(v) {
    var out = {};
    ["books", "series", "videos", "settings"].forEach(function (k) {
      if (v[k] && Object.keys(v[k]).length) out[k] = v[k];
    });
    return out;
  }
  function bookBase(id) {
    var found = null;
    try {
      (BOOKS || []).forEach(function (b) { if (b.id === id) found = b; });
    } catch (e) {}
    return found;
  }
  function effBook(id) {
    var base = bookBase(id);
    var c = committed().books || {};
    var g = staged().books || {};
    var o = {};
    [c[id] || {}, g[id] || {}].forEach(function (x) {
      Object.keys(x).forEach(function (k) { o[k] = x[k]; });
    });
    return { base: base, ov: o };
  }
  function effSettings() {
    var o = {};
    [committed().settings || {}, (staged().settings || {})].forEach(function (x) {
      Object.keys(x).forEach(function (k) { o[k] = x[k]; });
    });
    return o;
  }
  function seriesTitle(p) {
    var c = (committed().series || {})[p.id] || {};
    var g = (staged().series || {})[p.id] || {};
    return { title: g.title || c.title || p.title, titleEn: g.titleEn || c.titleEn || p.titleEn || "" };
  }
  function videoTitle(v) {
    var c = (committed().videos || {})[v.id] || {};
    var g = (staged().videos || {})[v.id] || {};
    return g.title || c.title || v.title;
  }
  function hasStaged(id, kind) {
    var g = staged()[kind] || {};
    return !!g[id];
  }

  var tab = "books";
  var editing = null; // {kind: "book"|"series"|"video", id: string}
  var seriesQuery = "";
  var videoQuery = "";
  var videoResults = null;
  var usersState = { state: "idle", rows: [], error: false };

  function kh() {
    return '<svg class="kh" aria-hidden="true"><use href="#khatam"/></svg>';
  }
  function bookTitleText(b) {
    if (!b) return "";
    return (lang() === "en" && b.en) ? b.en : (b.ar || b.en || "");
  }
  function statusPill(hidden, isStaged) {
    var p = '<span class="adm-pill' + (hidden ? " hide" : "") + '">' + esc(hidden ? t("adm_hidden") : t("adm_shown")) + "</span>";
    if (isStaged) p += ' <span class="adm-pill">' + esc(t("adm_staged")) + "</span>";
    return p;
  }

  function booksTab() {
    var rows = (BOOKS || []).slice().sort(function (a, b) { return a.id < b.id ? -1 : 1; }).map(function (b) {
      var e = effBook(b.id);
      var o = e.ov;
      var pages = (o.pages != null) ? o.pages : b.pages;
      var hidden = !!o.hidden;
      var title = (o.title_ar || o.title_en) ? (lang() === "en" && o.title_en ? o.title_en : (o.title_ar || o.title_en)) : bookTitleText(b);
      var note = o.note ? '<div class="adm-muted">' + esc(o.note) + "</div>" : "";
      var h = '<tr data-adm-book="' + esc(b.id) + '"><td><span' + (b.lang === "en" ? ' lang="en" dir="ltr"' : ' lang="ar" dir="rtl"') + ">" + esc(title) + "</span>" + note + "</td>" +
        '<td class="num">' + esc(pages) + "</td>" +
        '<td class="num">' + esc(b.parts ? b.parts.length : 1) + "</td>" +
        "<td>" + statusPill(hidden, hasStaged(b.id, "books")) + "</td>" +
        '<td><button type="button" class="btn small" data-adm-edit-kind="book" data-adm-edit-id="' + esc(b.id) + '">' + esc(t("adm_edit")) + "</button></td></tr>";
      if (editing && editing.kind === "book" && editing.id === b.id) {
        h += '<tr><td colspan="5">' + bookForm(b, o) + "</td></tr>";
      }
      return h;
    }).join("");
    var held = heldBooks().map(function (hb) {
      var title = (lang() === "en" && hb.title_en) ? hb.title_en : (hb.title_ar || hb.title_en || hb.id);
      return '<tr data-adm-held="' + esc(hb.id) + '"><td><span lang="en" dir="ltr">' + esc(title) + "</span>" +
        '<div class="adm-muted">' + esc(hb.reason || t("adm_held_note38")) + "</div>" +
        '<div class="adm-muted">' + esc(t("adm_no_author")) + "</div></td>" +
        '<td class="num">-</td><td class="num">-</td><td><span class="adm-pill warn">' + esc(t("adm_hidden")) + "</span></td><td></td></tr>";
    }).join("");
    return "<h2>" + esc(t("adm_books_h")) + "</h2>" +
      '<p class="adm-note">' + esc(t("adm_books_p")) + "</p>" +
      '<table class="adm-table"><thead><tr><th>' + esc(t("adm_col_title")) + "</th><th>" + esc(t("adm_col_pages")) + "</th><th>" + esc(t("adm_col_parts")) + "</th><th>" + esc(t("adm_col_status")) + "</th><th></th></tr></thead><tbody>" +
      rows + "</tbody></table>" +
      (held ? "<h2 style=\"margin-top:28px\">" + esc(t("adm_held_h")) + "</h2>" +
        '<p class="adm-note">' + esc(t("adm_held_p")) + "</p>" +
        '<table class="adm-table"><thead><tr><th>' + esc(t("adm_col_title")) + "</th><th>" + esc(t("adm_col_pages")) + "</th><th>" + esc(t("adm_col_parts")) + "</th><th>" + esc(t("adm_col_status")) + "</th><th></th></tr></thead><tbody>" +
        held + "</tbody></table>" : "");
  }
  function bookForm(b, o) {
    var pages = (o.pages != null) ? o.pages : b.pages;
    return '<div class="adm-form">' +
      '<label>' + esc(t("adm_title_ar")) + '<input type="text" id="adm-f-ar" value="' + esc(o.title_ar || b.ar || "") + '"></label>' +
      '<label>' + esc(t("adm_title_en")) + '<input type="text" id="adm-f-en" value="' + esc(o.title_en || b.en || "") + '"></label>' +
      '<label>' + esc(t("adm_pages")) + '<input type="number" id="adm-f-pages" min="1" value="' + esc(pages) + '"></label>' +
      '<label class="full"><span><input type="checkbox" id="adm-f-hidden"' + (o.hidden ? " checked" : "") + "> " + esc(t("adm_hide_book")) + "</span></label>" +
      '<div class="full adm-row"><button type="button" class="btn primary small" data-adm-save="book" data-adm-save-id="' + esc(b.id) + '">' + esc(t("adm_save")) + "</button>" +
      '<button type="button" class="btn small" data-adm-cancel>' + esc(t("adm_cancel")) + "</button></div></div>";
  }
  function saveBook(id) {
    var b = bookBase(id);
    if (!b) return;
    var ar = ($("#adm-f-ar") || {}).value || "";
    var en = ($("#adm-f-en") || {}).value || "";
    var pg = parseInt((($("#adm-f-pages") || {}).value || ""), 10);
    var hidden = !!($("#adm-f-hidden") || {}).checked;
    var c = (committed().books || {})[id] || {};
    var o = {};
    if (ar.trim() && ar.trim() !== (b.ar || "")) o.title_ar = ar.trim();
    if (en.trim() && en.trim() !== (b.en || "")) o.title_en = en.trim();
    if (pg >= 1 && pg !== b.pages) o.pages = pg;
    if (hidden !== !!c.hidden) o.hidden = hidden;
    if (c.note) o.note = c.note;
    var g = staged();
    g.books = g.books || {};
    if (Object.keys(o).length) g.books[id] = o;
    else delete g.books[id];
    saveStaged(cleanStaged(g));
    editing = null;
  }

  function videosTab() {
    var q = seriesQuery.trim().toLowerCase();
    var list = (DATA.playlists || []).filter(function (p) {
      if (!q) return true;
      var st = seriesTitle(p);
      return (st.title + " " + (st.titleEn || "")).toLowerCase().indexOf(q) !== -1;
    });
    var shown = list.slice(0, 30);
    var rows = shown.map(function (p) {
      var st = seriesTitle(p);
      var h = '<tr data-adm-series="' + esc(p.id) + '"><td><span lang="ar" dir="rtl">' + esc(st.title) + "</span>" +
        (st.titleEn ? '<div class="adm-muted" lang="en" dir="ltr">' + esc(st.titleEn) + "</div>" : "") + "</td>" +
        '<td class="num">' + esc(p.items ? p.items.length : 0) + " " + esc(t("adm_lessons")) + "</td>" +
        "<td>" + (hasStaged(p.id, "series") ? '<span class="adm-pill">' + esc(t("adm_staged")) + "</span>" : "") + "</td>" +
        '<td><button type="button" class="btn small" data-adm-edit-kind="series" data-adm-edit-id="' + esc(p.id) + '">' + esc(t("adm_edit")) + "</button></td></tr>";
      if (editing && editing.kind === "series" && editing.id === p.id) {
        h += '<tr><td colspan="4">' + seriesForm(p, st) + "</td></tr>";
      }
      return h;
    }).join("");
    var vrows = "";
    if (videoResults) {
      vrows = videoResults.length ? videoResults.map(function (v) {
        var h = '<tr data-adm-video="' + esc(v.id) + '"><td><span lang="ar" dir="rtl">' + esc(videoTitle(v)) + "</span></td>" +
          "<td>" + (hasStaged(v.id, "videos") ? '<span class="adm-pill">' + esc(t("adm_staged")) + "</span>" : "") + "</td>" +
          '<td><button type="button" class="btn small" data-adm-edit-kind="video" data-adm-edit-id="' + esc(v.id) + '">' + esc(t("adm_edit")) + "</button></td></tr>";
        if (editing && editing.kind === "video" && editing.id === v.id) {
          h += '<tr><td colspan="3">' + videoForm(v) + "</td></tr>";
        }
        return h;
      }).join("") : '<tr><td colspan="3">' + esc(t("adm_no_match")) + "</td></tr>";
    }
    return "<h2>" + esc(t("adm_series_h")) + "</h2>" +
      '<p class="adm-note">' + esc(t("adm_series_p")) + "</p>" +
      '<div class="adm-search"><input type="text" id="adm-series-q" value="' + esc(seriesQuery) + '" placeholder="' + esc(t("adm_series_search_ph")) + '">' +
      '<button type="button" class="btn small" data-adm-series-search>' + esc(t("adm_search")) + "</button></div>" +
      '<table class="adm-table"><tbody>' + (rows || '<tr><td>' + esc(t("adm_no_match")) + "</td></tr>") + "</tbody></table>" +
      "<h2 style=\"margin-top:28px\">" + esc(t("adm_videos_h")) + "</h2>" +
      '<p class="adm-note">' + esc(t("adm_videos_p")) + "</p>" +
      '<div class="adm-search"><input type="text" id="adm-video-q" value="' + esc(videoQuery) + '" placeholder="' + esc(t("adm_video_search_ph")) + '">' +
      '<button type="button" class="btn small" data-adm-video-search>' + esc(t("adm_search")) + "</button></div>" +
      (videoResults === null
        ? '<p class="adm-muted">' + esc(t("adm_type_to_search")) + "</p>"
        : '<table class="adm-table"><tbody>' + vrows + "</tbody></table>");
  }
  function seriesForm(p, st) {
    return '<div class="adm-form">' +
      '<label>' + esc(t("adm_title_ar")) + '<input type="text" id="adm-f-title" value="' + esc(st.title) + '"></label>' +
      '<label>' + esc(t("adm_title_en")) + '<input type="text" id="adm-f-titleen" value="' + esc(st.titleEn || "") + '"></label>' +
      '<div class="full adm-row"><button type="button" class="btn primary small" data-adm-save="series" data-adm-save-id="' + esc(p.id) + '">' + esc(t("adm_save")) + "</button>" +
      '<button type="button" class="btn small" data-adm-cancel>' + esc(t("adm_cancel")) + "</button></div></div>";
  }
  function videoForm(v) {
    return '<div class="adm-form">' +
      '<label class="full">' + esc(t("adm_title_ar")) + '<input type="text" id="adm-f-title" value="' + esc(videoTitle(v)) + '"></label>' +
      '<div class="full adm-row"><button type="button" class="btn primary small" data-adm-save="video" data-adm-save-id="' + esc(v.id) + '">' + esc(t("adm_save")) + "</button>" +
      '<button type="button" class="btn small" data-adm-cancel>' + esc(t("adm_cancel")) + "</button></div></div>";
  }
  function saveSeries(id) {
    var p = null;
    (DATA.playlists || []).forEach(function (x) { if (x.id === id) p = x; });
    if (!p) return;
    var title = ((($("#adm-f-title") || {}).value) || "").trim();
    var titleEn = ((($("#adm-f-titleen") || {}).value) || "").trim();
    var o = {};
    if (title && title !== p.title) o.title = title;
    if (titleEn && titleEn !== (p.titleEn || "")) o.titleEn = titleEn;
    var g = staged();
    g.series = g.series || {};
    if (Object.keys(o).length) g.series[id] = o;
    else delete g.series[id];
    saveStaged(cleanStaged(g));
    editing = null;
  }
  function saveVideo(id) {
    var v = null;
    (DATA.videos || []).forEach(function (x) { if (x.id === id) v = x; });
    if (!v) return;
    var title = ((($("#adm-f-title") || {}).value) || "").trim();
    var g = staged();
    g.videos = g.videos || {};
    if (title && title !== v.title) g.videos[id] = { title: title };
    else delete g.videos[id];
    saveStaged(cleanStaged(g));
    editing = null;
  }
  function runVideoSearch() {
    var q = ((($("#adm-video-q") || {}).value) || "").trim();
    videoQuery = q;
    if (q.length < 2) { videoResults = null; render(); return; }
    var low = q.toLowerCase();
    videoResults = (DATA.videos || []).filter(function (v) {
      return (v.title || "").toLowerCase().indexOf(low) !== -1;
    }).slice(0, 30);
    render();
  }

  function usersTab() {
    var h = "<h2>" + esc(t("adm_users_h")) + "</h2>" +
      '<p class="adm-note">' + esc(t("adm_users_p")) + "</p>";
    if (usersState.state === "done") {
      if (!usersState.rows.length) return h + '<p class="adm-muted">' + esc(t("adm_users_none")) + "</p>";
      h += '<table class="adm-table"><thead><tr><th>' + esc(t("adm_col_email")) + "</th><th>" + esc(t("adm_col_joined")) + "</th></tr></thead><tbody>" +
        usersState.rows.map(function (r) {
          return "<tr><td>" + esc(r.email || "") + "</td><td class=\"num\">" + esc(r.created_at ? String(r.created_at).slice(0, 10) : "") + "</td></tr>";
        }).join("") + "</tbody></table>";
      return h;
    }
    if (usersState.state === "setup") {
      return h + '<p class="adm-note"><b>' + esc(t("adm_users_setup")) + "</b><br>" + esc(t("adm_users_setup_p")) + "</p>" +
        '<p class="adm-muted">' + esc(PROFILES_SQL) + "</p>";
    }
    if (usersState.state === "error") {
      return h + '<p class="adm-note">' + esc(t("adm_users_err")) + "</p>" +
        '<p class="adm-muted">' + esc(PROFILES_SQL) + "</p>";
    }
    return h + '<div class="adm-row"><button type="button" class="btn primary small" data-adm-users-load>' + esc(t("adm_users_load")) + "</button></div>";
  }
  function loadUsers() {
    usersState = { state: "loading", rows: [], error: false };
    render();
    var acct = account();
    var token = acct && acct.access_token ? acct.access_token : "";
    var cfgPaths = ["assets/supabase-config.json", "Preview/assets/supabase-config.json"];
    var timeoutMs = 6000;
    function tryCfg(i) {
      if (i >= cfgPaths.length) { usersState = { state: "setup", rows: [], error: false }; render(); return; }
      var ctl = new AbortController();
      var to = setTimeout(function () { ctl.abort(); }, timeoutMs);
      fetch(cfgPaths[i], { cache: "no-store", signal: ctl.signal }).then(function (r) {
        clearTimeout(to);
        if (!r.ok) return tryCfg(i + 1);
        return r.json().then(function (cfg) {
          if (!cfg || !cfg.url || !cfg.anonKey) return tryCfg(i + 1);
          fetchProfiles(cfg, token);
        }, function () { tryCfg(i + 1); });
      }, function () { clearTimeout(to); tryCfg(i + 1); });
    }
    function fetchProfiles(cfg, tok) {
      var ctl = new AbortController();
      var to = setTimeout(function () { ctl.abort(); }, timeoutMs);
      var url = String(cfg.url).replace(/\/$/, "") + "/rest/v1/profiles?select=id,email,created_at&order=created_at.desc";
      fetch(url, {
        headers: { apikey: cfg.anonKey, Authorization: "Bearer " + tok },
        signal: ctl.signal
      }).then(function (r) {
        clearTimeout(to);
        if (r.status === 404 || r.status === 400) { usersState = { state: "setup", rows: [], error: false }; render(); return; }
        if (!r.ok) { usersState = { state: "error", rows: [], error: true }; render(); return; }
        return r.json().then(function (rows) {
          usersState = { state: "done", rows: Array.isArray(rows) ? rows : [], error: false };
          render();
        }, function () { usersState = { state: "error", rows: [], error: true }; render(); });
      }, function () { clearTimeout(to); usersState = { state: "error", rows: [], error: true }; render(); });
    }
    tryCfg(0);
  }

  function settingsTab() {
    var s = effSettings();
    var ann = s.announcement || "";
    var live = s.liveEnabled !== false;
    return "<h2>" + esc(t("adm_set_h")) + "</h2>" +
      '<p class="adm-note">' + esc(t("adm_set_p")) + "</p>" +
      '<div class="adm-form">' +
      '<label class="full">' + esc(t("adm_ann")) + '<textarea id="adm-f-ann">' + esc(ann) + "</textarea></label>" +
      '<label class="full"><span><input type="checkbox" id="adm-f-live"' + (live ? " checked" : "") + "> " + esc(t("adm_live")) + "</span></label>" +
      '<div class="full adm-row"><button type="button" class="btn primary small" data-adm-save="settings">' + esc(t("adm_save")) + "</button></div></div>";
  }
  function saveSettings() {
    var ann = ((($("#adm-f-ann") || {}).value) || "").trim();
    var live = !!($("#adm-f-live") || {}).checked;
    var c = committed().settings || {};
    var o = {};
    if (ann !== (c.announcement || "")) o.announcement = ann;
    if (live !== (c.liveEnabled !== false)) o.liveEnabled = live;
    var g = staged();
    if (Object.keys(o).length) g.settings = o;
    else delete g.settings;
    saveStaged(cleanStaged(g));
  }

  function stagedPanel() {
    var g = cleanStaged(staged());
    var has = Object.keys(g).length > 0;
    var h = '<div class="adm-stage"><h2>' + esc(t("adm_stage_h")) + "</h2>" +
      '<p class="adm-note">' + esc(t("adm_stage_p")) + "</p>";
    if (!has) return h + '<p class="adm-muted">' + esc(t("adm_stage_none")) + "</p></div>";
    var merged = JSON.parse(JSON.stringify(committed()));
    ["books", "series", "videos", "settings"].forEach(function (k) {
      var base = {};
      Object.keys(merged[k] || {}).forEach(function (id) { base[id] = merged[k][id]; });
      Object.keys(g[k] || {}).forEach(function (id) { base[id] = g[k][id]; });
      if (Object.keys(base).length) merged[k] = base;
      else delete merged[k];
    });
    h += "<pre id=\"adm-staged-json\">" + esc(JSON.stringify(merged, null, 2)) + "</pre>" +
      '<div class="row"><button type="button" class="btn primary small" data-adm-copy>' + esc(t("adm_copy")) + "</button>" +
      '<button type="button" class="btn small" data-adm-download>' + esc(t("adm_download")) + "</button>" +
      '<button type="button" class="btn small" data-adm-clear>' + esc(t("adm_clear")) + "</button></div></div>";
    return h;
  }
  function copyStaged(btn) {
    var el = $("#adm-staged-json");
    var text = el ? el.textContent : "";
    function done() { if (btn) { btn.textContent = t("adm_copied"); setTimeout(function () { btn.textContent = t("adm_copy"); }, 1500); } }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text, done); });
    } else fallbackCopy(text, done);
  }
  function fallbackCopy(text, done) {
    var ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch (e) {}
    document.body.removeChild(ta);
    done();
  }
  function downloadStaged() {
    var el = $("#adm-staged-json");
    var text = el ? el.textContent : "{}";
    var blob = new Blob([text], { type: "application/json" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "admin-overrides.json";
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  function tabsHtml() {
    return '<div class="adm-tabs" role="tablist">' +
      ["books", "videos", "users", "settings"].map(function (k) {
        return '<button type="button" role="tab" aria-selected="' + (tab === k) + '" data-adm-tab="' + k + '">' + esc(t("adm_tab_" + k)) + "</button>";
      }).join("") + "</div>";
  }
  function render() {
    var host = $("#v-admin");
    if (!host) return;
    if (!isAdmin()) {
      host.innerHTML = '<div class="wrap adm-wrap"><p class="adm-note">' + esc(t("adm_not_admin")) + "</p></div>";
      return;
    }
    var body = tab === "books" ? booksTab() : tab === "videos" ? videosTab() : tab === "users" ? usersTab() : settingsTab();
    host.innerHTML = '<div class="wrap adm-wrap">' +
      '<header class="page-h">' + kh() + "<h1>" + esc(t("adm_title")) + "</h1><p>" + esc(t("adm_lede")) + "</p></header>" +
      tabsHtml() + body + stagedPanel() + "</div>";
    if (usersState.state === "loading") {
      var btn = $("[data-adm-users-load]", host);
      if (btn) btn.disabled = true;
    }
  }
  function onClick(e) {
    var el = e.target.closest("[data-adm-tab],[data-adm-edit-kind],[data-adm-cancel],[data-adm-save],[data-adm-copy],[data-adm-download],[data-adm-clear],[data-adm-users-load],[data-adm-series-search],[data-adm-video-search]");
    if (!el) return;
    if (el.hasAttribute("data-adm-tab")) { tab = el.getAttribute("data-adm-tab"); editing = null; render(); return; }
    if (el.hasAttribute("data-adm-edit-kind")) {
      editing = { kind: el.getAttribute("data-adm-edit-kind"), id: el.getAttribute("data-adm-edit-id") };
      render();
      return;
    }
    if (el.hasAttribute("data-adm-cancel")) { editing = null; render(); return; }
    if (el.hasAttribute("data-adm-save")) {
      var kind = el.getAttribute("data-adm-save");
      var id = el.getAttribute("data-adm-save-id");
      if (kind === "book") saveBook(id);
      else if (kind === "series") saveSeries(id);
      else if (kind === "video") saveVideo(id);
      else if (kind === "settings") saveSettings();
      render();
      return;
    }
    if (el.hasAttribute("data-adm-copy")) { copyStaged(el); return; }
    if (el.hasAttribute("data-adm-download")) { downloadStaged(); return; }
    if (el.hasAttribute("data-adm-clear")) { saveStaged({}); editing = null; render(); return; }
    if (el.hasAttribute("data-adm-users-load")) { loadUsers(); return; }
    if (el.hasAttribute("data-adm-series-search")) {
      seriesQuery = ((($("#adm-series-q") || {}).value) || "");
      editing = null;
      render();
      return;
    }
    if (el.hasAttribute("data-adm-video-search")) { runVideoSearch(); return; }
  }
  function onKey(e) {
    if (e.key !== "Enter") return;
    if (e.target && e.target.id === "adm-series-q") { seriesQuery = e.target.value || ""; editing = null; render(); }
    if (e.target && e.target.id === "adm-video-q") { runVideoSearch(); }
  }
  function wireOnce() {
    var host = $("#v-admin");
    if (!host || host.dataset.admWired) return;
    host.dataset.admWired = "1";
    host.addEventListener("click", onClick);
    host.addEventListener("keydown", onKey);
  }
  window.__adminRender = function (arg, q) {
    if (q && q.get && q.get("tab") && ["books", "videos", "users", "settings"].indexOf(q.get("tab")) !== -1) tab = q.get("tab");
    wireOnce();
    render();
  };
})();
