/* Admin page (V5): books, series and videos, users, site settings.
   Visible only to the admin account. Edits are kept in this browser as
   staged changes until the overrides file is committed to the repo and
   the site is republished; nothing here writes to the repo or to
   Supabase directly, and no privileged key is used anywhere. */
(function () {
  "use strict";
  var DEFAULT_ADMINS = ["meroatschool@gmail.com", "sheikhmoustafakamel@gmail.com"];
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
      adm_not_admin: "هذه الصفحة للمسؤول فقط.",
      adm_lang: "اللغة",
      adm_lang_ar: "العربية",
      adm_lang_en: "الإنجليزية",
      adm_lang_aren: "العربية والإنجليزية",
      adm_file: "ملف الكتاب (اسم الملف أو رابطه الكامل)",
      adm_file_note: "ملف الكتاب نفسه يجب أن يصل إلى المستودع عبر الجلب اليومي أو عبر حفظه في المستودع، فهذه الصفحة لا ترفع ملفا إلى المستودع من المتصفح. اكتب اسم الملف كما سيكون في مجلد الكتب (مثل my-book.pdf) أو رابطه الكامل.",
      adm_add_book: "أضف كتابا",
      adm_added_h: "كتب مضافة (معدة)",
      adm_remove: "احذف",
      adm_up: "انقل إلى الأعلى",
      adm_down: "انقل إلى الأسفل",
      adm_add_series: "أضف سلسلة",
      adm_pl_id: "رقم قائمة التشغيل في YouTube أو رابطها",
      adm_series_items: "دروس هذه السلسلة",
      adm_series_empty: "لا دروس في هذه السلسلة بعد.",
      adm_yt_link: "رابط الدرس في YouTube",
      adm_video_title: "عنوان الدرس (للدرس الجديد)",
      adm_add_video: "أضف الدرس",
      adm_new: "جديد",
      adm_admins: "حسابات الإدارة (بريد في كل سطر)",
      adm_err_title: "اكتب عنوانا واحدا على الأقل.",
      adm_err_file: "اكتب اسم ملف ينتهي بـ .pdf أو .docx، أو رابطه الكامل.",
      adm_err_yt: "تعذّر قراءة رقم الدرس من هذا الرابط.",
      adm_err_pl: "تعذّر قراءة رقم قائمة التشغيل.",
      adm_err_pl_dup: "هذه السلسلة موجودة بالفعل.",
      adm_err_dup: "هذا الدرس موجود في السلسلة بالفعل.",
      adm_err_vtitle: "اكتب عنوان الدرس الجديد.",
      adm_err_admins: "أبق بريدا صحيحا واحدا على الأقل."
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
      adm_not_admin: "This page is for the admin only.",
      adm_lang: "Language",
      adm_lang_ar: "Arabic",
      adm_lang_en: "English",
      adm_lang_aren: "Arabic and English",
      adm_file: "Book file (file name or full link)",
      adm_file_note: "The book file itself still has to reach the repo through the daily fetch or a commit; this page cannot upload a file to the repo from the browser. Enter the file name as it will be in the books folder (for example my-book.pdf), or its full link.",
      adm_add_book: "Add a book",
      adm_added_h: "Added books (staged)",
      adm_remove: "Remove",
      adm_up: "Move up",
      adm_down: "Move down",
      adm_add_series: "Add a series",
      adm_pl_id: "YouTube playlist ID or link",
      adm_series_items: "Videos in this series",
      adm_series_empty: "No videos in this series yet.",
      adm_yt_link: "YouTube link",
      adm_video_title: "Video title (for a new video)",
      adm_add_video: "Add video",
      adm_new: "New",
      adm_admins: "Admin accounts (one email per line)",
      adm_err_title: "Enter at least one title.",
      adm_err_file: "Enter a file name ending in .pdf or .docx, or its full link.",
      adm_err_yt: "Could not read a video ID from that link.",
      adm_err_pl: "Could not read a playlist ID from that.",
      adm_err_pl_dup: "That series already exists.",
      adm_err_dup: "That video is already in this series.",
      adm_err_vtitle: "Enter a title for the new video.",
      adm_err_admins: "Keep at least one valid email."
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
    return !!(a && a.mode === "email" && a.access_token && adminEmails().indexOf(String(a.email || "").toLowerCase()) !== -1);
  }
  // The admin list comes from the committed overrides only, never from staged edits.
  function adminEmails() {
    var s = committed().settings || {};
    var list = Array.isArray(s.adminEmails) && s.adminEmails.length ? s.adminEmails : DEFAULT_ADMINS;
    return list.map(function (e) { return String(e).toLowerCase(); });
  }
  function copy(o) { return JSON.parse(JSON.stringify(o || {})); }
  function same(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
  function val(sel) { return String(($(sel) || {}).value || "").trim(); }
  // A book row is a work ("b06"); the overrides file keys the source book ("book-06").
  function srcId(workId) { return "book-" + String(workId).slice(1); }
  function single(b) { return !!(b && b.parts && b.parts.length === 1); }
  function fileOk(f) { return /^[\w.-]+\.(pdf|docx)$/i.test(f) || /^https:\/\/\S+$/.test(f); }
  function ytId(s) {
    s = String(s || "").trim();
    var m = s.match(/(?:[?&]v=|youtu\.be\/|\/(?:shorts|embed|live)\/)([A-Za-z0-9_-]{11})(?![A-Za-z0-9_-])/);
    if (m) return m[1];
    return /^[A-Za-z0-9_-]{11}$/.test(s) ? s : "";
  }
  function plId(s) {
    s = String(s || "").trim();
    var m = s.match(/[?&]list=([A-Za-z0-9_-]{10,64})(?![A-Za-z0-9_-])/);
    if (m) return m[1];
    return /^[A-Za-z0-9_-]{10,64}$/.test(s) ? s : "";
  }
  // Stage a full override entry; an entry equal to the committed one (or an
  // empty one with nothing committed) is no change and is dropped.
  function stageEntry(kind, id, o) {
    var g = staged();
    g[kind] = g[kind] || {};
    var c = (committed()[kind] || {})[id];
    if (c ? same(o, c) : !Object.keys(o).length) delete g[kind][id];
    else g[kind][id] = o;
    pruneVideos(g);
    saveStaged(cleanStaged(g));
  }
  // A staged new video that no series lists any more is dropped with it.
  function pruneVideos(g) {
    var series = {}, used = {};
    [committed().series || {}, g.series || {}].forEach(function (s) {
      Object.keys(s).forEach(function (k) { series[k] = s[k]; });
    });
    Object.keys(series).forEach(function (k) {
      (series[k].items || []).forEach(function (v) { used[v] = 1; });
    });
    Object.keys(g.videos || {}).forEach(function (v) {
      if (g.videos[v].new && !used[v]) delete g.videos[v];
    });
  }
  function entry(kind, id) {
    return copy((staged()[kind] || {})[id] || (committed()[kind] || {})[id]);
  }
  // Show a form error without re-rendering, so what was typed stays in place.
  function fail(key) {
    var n = $("#adm-notice");
    if (n) { n.textContent = t(key); n.hidden = false; }
    return false;
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
    [c[srcId(id)] || {}, g[srcId(id)] || {}].forEach(function (x) {
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
  var adding = null; // "book" | "series"
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
        "<td>" + statusPill(hidden, hasStaged(srcId(b.id), "books")) + "</td>" +
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
    var g = staged().books || {};
    var added = Object.keys(g).filter(function (k) { return g[k].new; }).map(function (k) {
      return '<tr data-adm-added-book="' + esc(k) + '"><td>' + esc(g[k].title_ar || g[k].title_en) +
        '<div class="adm-muted" dir="ltr">' + esc(g[k].file) + "</div></td>" +
        '<td><button type="button" class="btn small" data-adm-remove-book="' + esc(k) + '">' + esc(t("adm_remove")) + "</button></td></tr>";
    }).join("");
    return "<h2>" + esc(t("adm_books_h")) + "</h2>" +
      '<p class="adm-note">' + esc(t("adm_books_p")) + "</p>" +
      (adding === "book" ? addBookForm() : '<div class="adm-row"><button type="button" class="btn small" data-adm-add="book">' + esc(t("adm_add_book")) + "</button></div>") +
      (added ? "<h2 style=\"margin-top:20px\">" + esc(t("adm_added_h")) + '</h2><table class="adm-table"><tbody>' + added + "</tbody></table>" : "") +
      '<table class="adm-table"><thead><tr><th>' + esc(t("adm_col_title")) + "</th><th>" + esc(t("adm_col_pages")) + "</th><th>" + esc(t("adm_col_parts")) + "</th><th>" + esc(t("adm_col_status")) + "</th><th></th></tr></thead><tbody>" +
      rows + "</tbody></table>" +
      (held ? "<h2 style=\"margin-top:28px\">" + esc(t("adm_held_h")) + "</h2>" +
        '<p class="adm-note">' + esc(t("adm_held_p")) + "</p>" +
        '<table class="adm-table"><thead><tr><th>' + esc(t("adm_col_title")) + "</th><th>" + esc(t("adm_col_pages")) + "</th><th>" + esc(t("adm_col_parts")) + "</th><th>" + esc(t("adm_col_status")) + "</th><th></th></tr></thead><tbody>" +
        held + "</tbody></table>" : "");
  }
  function langSelect(id, cur) {
    return '<select id="' + id + '">' + [["ar", "adm_lang_ar"], ["en", "adm_lang_en"], ["ar-en", "adm_lang_aren"]].map(function (x) {
      return '<option value="' + x[0] + '"' + (x[0] === cur ? " selected" : "") + ">" + esc(t(x[1])) + "</option>";
    }).join("") + "</select>";
  }
  function addBookForm() {
    return '<div class="adm-form" id="adm-add-book">' +
      '<p class="full adm-muted">' + esc(t("adm_file_note")) + "</p>" +
      '<label>' + esc(t("adm_title_ar")) + '<input type="text" id="adm-n-ar"></label>' +
      '<label>' + esc(t("adm_title_en")) + '<input type="text" id="adm-n-en"></label>' +
      '<label>' + esc(t("adm_lang")) + langSelect("adm-n-lang", "ar") + "</label>" +
      '<label>' + esc(t("adm_pages")) + '<input type="number" id="adm-n-pages" min="1"></label>' +
      '<label class="full">' + esc(t("adm_file")) + '<input type="text" id="adm-n-file" dir="ltr"></label>' +
      '<div class="full adm-row"><button type="button" class="btn primary small" data-adm-add-save="book">' + esc(t("adm_save")) + "</button>" +
      '<button type="button" class="btn small" data-adm-cancel>' + esc(t("adm_cancel")) + "</button></div></div>";
  }
  function addBook() {
    var ar = val("#adm-n-ar"), en = val("#adm-n-en"), f = val("#adm-n-file");
    var pg = parseInt(val("#adm-n-pages"), 10);
    if (!ar && !en) return fail("adm_err_title");
    if (!fileOk(f)) return fail("adm_err_file");
    var o = { new: true, lang: val("#adm-n-lang") || "ar", file: f };
    if (ar) o.title_ar = ar;
    if (en) o.title_en = en;
    if (pg >= 1) o.pages = pg;
    stageEntry("books", "book-n" + Date.now().toString(36), o);
    adding = null;
  }
  function bookForm(b, o) {
    var pages = (o.pages != null) ? o.pages : b.pages;
    // Page count and file belong to one file, so they are edited on single-file books only.
    return '<div class="adm-form">' +
      '<label>' + esc(t("adm_title_ar")) + '<input type="text" id="adm-f-ar" value="' + esc(o.title_ar || b.ar || "") + '"></label>' +
      '<label>' + esc(t("adm_title_en")) + '<input type="text" id="adm-f-en" value="' + esc(o.title_en || b.en || "") + '"></label>' +
      '<label>' + esc(t("adm_lang")) + langSelect("adm-f-lang", o.lang || b.lang) + "</label>" +
      (single(b) ? '<label>' + esc(t("adm_pages")) + '<input type="number" id="adm-f-pages" min="1" value="' + esc(pages) + '"></label>' +
        '<label class="full">' + esc(t("adm_file")) + '<input type="text" id="adm-f-file" dir="ltr" value="' + esc(o.file || b.parts[0].file) + '"></label>' +
        '<p class="full adm-muted">' + esc(t("adm_file_note")) + "</p>" : "") +
      '<label class="full"><span><input type="checkbox" id="adm-f-hidden"' + (o.hidden ? " checked" : "") + "> " + esc(t("adm_hide_book")) + "</span></label>" +
      '<div class="full adm-row"><button type="button" class="btn primary small" data-adm-save="book" data-adm-save-id="' + esc(b.id) + '">' + esc(t("adm_save")) + "</button>" +
      '<button type="button" class="btn small" data-adm-cancel>' + esc(t("adm_cancel")) + "</button></div></div>";
  }
  function saveBook(id) {
    var b = bookBase(id);
    if (!b) return;
    // BOOKS already carries the committed overrides, so start from the
    // committed entry and record only what differs from what is shown.
    var o = copy((committed().books || {})[srcId(id)]);
    var ar = val("#adm-f-ar"), en = val("#adm-f-en"), lg = val("#adm-f-lang");
    if (ar && ar !== (b.ar || "")) o.title_ar = ar;
    if (en && en !== (b.en || "")) o.title_en = en;
    if (lg && lg !== b.lang) o.lang = lg;
    if (single(b)) {
      var pg = parseInt(val("#adm-f-pages"), 10), f = val("#adm-f-file");
      if (pg >= 1 && pg !== b.pages) o.pages = pg;
      if (f && f !== b.parts[0].file) {
        if (!fileOk(f)) return fail("adm_err_file");
        o.file = f;
      }
    }
    if (($("#adm-f-hidden") || {}).checked) o.hidden = true;
    else delete o.hidden;
    stageEntry("books", srcId(id), o);
    editing = null;
  }

  // Series staged as new are not in the catalog yet: list them first.
  function allSeries() {
    var g = staged().series || {};
    var known = {};
    (DATA.playlists || []).forEach(function (p) { known[p.id] = 1; });
    return Object.keys(g).filter(function (k) { return g[k].new && !known[k]; }).map(function (k) {
      return { id: k, title: "", titleEn: "", items: [], stagedNew: true };
    }).concat(DATA.playlists || []);
  }
  function findSeries(id) {
    var found = null;
    allSeries().forEach(function (p) { if (p.id === id) found = p; });
    return found;
  }
  function itemsOf(p) {
    var o = entry("series", p.id);
    return o.items ? o.items : (p.items || []).map(function (x) { return x.id; });
  }
  function videoById(id) {
    var found = null;
    (DATA.videos || []).forEach(function (v) { if (v.id === id) found = v; });
    var g = (staged().videos || {})[id];
    return found || (g && g.new ? { id: id, title: g.title } : null);
  }
  function setItems(p, ids) {
    var o = entry("series", p.id);
    var c = (committed().series || {})[p.id];
    o.items = ids;
    // an unchanged list on a catalog series is no change at all
    if (!o.new && !(c && c.items) && same(ids, (p.items || []).map(function (x) { return x.id; }))) delete o.items;
    stageEntry("series", p.id, o);
  }
  function itemOp(sid, op, i) {
    var p = findSeries(sid);
    if (!p) return;
    var ids = itemsOf(p).slice();
    if (op === "remove") ids.splice(i, 1);
    else {
      var j = op === "up" ? i - 1 : i + 1;
      if (j < 0 || j >= ids.length) return;
      var x = ids[i]; ids[i] = ids[j]; ids[j] = x;
    }
    setItems(p, ids);
  }
  function addVideo(sid) {
    var p = findSeries(sid);
    if (!p) return;
    var vid = ytId(val("#adm-n-yt"));
    if (!vid) return fail("adm_err_yt");
    var ids = itemsOf(p);
    if (ids.indexOf(vid) !== -1) return fail("adm_err_dup");
    if (!videoById(vid)) {
      var title = val("#adm-n-vtitle");
      if (!title) return fail("adm_err_vtitle");
      var g = staged();
      g.videos = g.videos || {};
      g.videos[vid] = { new: true, title: title };
      saveStaged(g);
    }
    setItems(p, ids.concat(vid));
  }
  function addSeriesForm() {
    return '<div class="adm-form" id="adm-add-series">' +
      '<label class="full">' + esc(t("adm_pl_id")) + '<input type="text" id="adm-n-pl" dir="ltr"></label>' +
      '<label>' + esc(t("adm_title_ar")) + '<input type="text" id="adm-n-title"></label>' +
      '<label>' + esc(t("adm_title_en")) + '<input type="text" id="adm-n-titleen"></label>' +
      '<div class="full adm-row"><button type="button" class="btn primary small" data-adm-add-save="series">' + esc(t("adm_save")) + "</button>" +
      '<button type="button" class="btn small" data-adm-cancel>' + esc(t("adm_cancel")) + "</button></div></div>";
  }
  function addSeries() {
    var id = plId(val("#adm-n-pl"));
    if (!id) return fail("adm_err_pl");
    if (findSeries(id)) return fail("adm_err_pl_dup");
    var title = val("#adm-n-title"), titleEn = val("#adm-n-titleen");
    if (!title && !titleEn) return fail("adm_err_title");
    var o = { new: true, items: [] };
    if (title) o.title = title;
    if (titleEn) o.titleEn = titleEn;
    stageEntry("series", id, o);
    adding = null;
    seriesQuery = "";
    editing = { kind: "series", id: id };
  }
  function videosTab() {
    var q = seriesQuery.trim().toLowerCase();
    var list = allSeries().filter(function (p) {
      if (!q) return true;
      var st = seriesTitle(p);
      return (st.title + " " + (st.titleEn || "")).toLowerCase().indexOf(q) !== -1;
    });
    var shown = list.slice(0, 30);
    var rows = shown.map(function (p) {
      var st = seriesTitle(p);
      var h = '<tr data-adm-series="' + esc(p.id) + '"><td><span lang="ar" dir="rtl">' + esc(st.title) + "</span>" +
        (st.titleEn ? '<div class="adm-muted" lang="en" dir="ltr">' + esc(st.titleEn) + "</div>" : "") + "</td>" +
        '<td class="num">' + esc(itemsOf(p).length) + " " + esc(t("adm_lessons")) + "</td>" +
        "<td>" + (p.stagedNew ? '<span class="adm-pill">' + esc(t("adm_new")) + "</span> " : "") +
        (hasStaged(p.id, "series") ? '<span class="adm-pill">' + esc(t("adm_staged")) + "</span>" : "") + "</td>" +
        '<td><div class="adm-row"><button type="button" class="btn small" data-adm-edit-kind="series" data-adm-edit-id="' + esc(p.id) + '">' + esc(t("adm_edit")) + "</button>" +
        (p.stagedNew ? '<button type="button" class="btn small" data-adm-remove-series="' + esc(p.id) + '">' + esc(t("adm_remove")) + "</button>" : "") + "</div></td></tr>";
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
      (adding === "series" ? addSeriesForm() : '<div class="adm-row" style="margin-bottom:12px"><button type="button" class="btn small" data-adm-add="series">' + esc(t("adm_add_series")) + "</button></div>") +
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
    var ids = itemsOf(p);
    var opBtn = function (op, i, off) {
      return '<button type="button" class="btn small" data-adm-item-op="' + op + '" data-adm-item-idx="' + i + '" data-adm-series-id="' + esc(p.id) + '"' +
        (off ? " disabled" : "") + ' aria-label="' + esc(t("adm_" + op)) + '">' + (op === "up" ? "&uarr;" : op === "down" ? "&darr;" : esc(t("adm_remove"))) + "</button>";
    };
    var items = ids.length ? '<table class="adm-table"><tbody>' + ids.map(function (vid, i) {
      var v = videoById(vid);
      return '<tr data-adm-item="' + esc(vid) + '"><td><span lang="ar" dir="rtl">' + esc(v ? videoTitle(v) : vid) + "</span>" +
        '<div class="adm-muted" dir="ltr">' + esc(vid) + "</div></td>" +
        '<td class="num"><div class="adm-row">' + opBtn("up", i, i === 0) + opBtn("down", i, i === ids.length - 1) + opBtn("remove", i) + "</div></td></tr>";
    }).join("") + "</tbody></table>" : '<p class="adm-muted">' + esc(t("adm_series_empty")) + "</p>";
    return '<div class="adm-form">' +
      '<label>' + esc(t("adm_title_ar")) + '<input type="text" id="adm-f-title" value="' + esc(st.title) + '"></label>' +
      '<label>' + esc(t("adm_title_en")) + '<input type="text" id="adm-f-titleen" value="' + esc(st.titleEn || "") + '"></label>' +
      '<div class="full adm-row"><button type="button" class="btn primary small" data-adm-save="series" data-adm-save-id="' + esc(p.id) + '">' + esc(t("adm_save")) + "</button>" +
      '<button type="button" class="btn small" data-adm-cancel>' + esc(t("adm_cancel")) + "</button></div>" +
      '<div class="full"><b>' + esc(t("adm_series_items")) + "</b>" + items + "</div>" +
      '<label>' + esc(t("adm_yt_link")) + '<input type="text" id="adm-n-yt" dir="ltr"></label>' +
      '<label>' + esc(t("adm_video_title")) + '<input type="text" id="adm-n-vtitle"></label>' +
      '<div class="full adm-row"><button type="button" class="btn small" data-adm-add-video="' + esc(p.id) + '">' + esc(t("adm_add_video")) + "</button></div></div>";
  }
  function videoForm(v) {
    return '<div class="adm-form">' +
      '<label class="full">' + esc(t("adm_title_ar")) + '<input type="text" id="adm-f-title" value="' + esc(videoTitle(v)) + '"></label>' +
      '<div class="full adm-row"><button type="button" class="btn primary small" data-adm-save="video" data-adm-save-id="' + esc(v.id) + '">' + esc(t("adm_save")) + "</button>" +
      '<button type="button" class="btn small" data-adm-cancel>' + esc(t("adm_cancel")) + "</button></div></div>";
  }
  function saveSeries(id) {
    var p = findSeries(id);
    if (!p) return;
    var title = val("#adm-f-title"), titleEn = val("#adm-f-titleen");
    // p carries the committed titles, so a value equal to it keeps the committed one
    var c = (committed().series || {})[id] || {};
    var o = entry("series", id);
    o.title = title && title !== p.title ? title : c.title;
    o.titleEn = titleEn && titleEn !== (p.titleEn || "") ? titleEn : c.titleEn;
    if (!o.title) delete o.title;
    if (!o.titleEn) delete o.titleEn;
    if (o.new && !o.title && !o.titleEn) return fail("adm_err_title");
    stageEntry("series", id, o);
    editing = null;
  }
  function saveVideo(id) {
    var v = null;
    (DATA.videos || []).forEach(function (x) { if (x.id === id) v = x; });
    if (!v) return;
    var title = val("#adm-f-title");
    var c = (committed().videos || {})[id] || {};
    var o = entry("videos", id);
    o.title = title && title !== v.title ? title : c.title;
    if (!o.title) delete o.title;
    stageEntry("videos", id, o);
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
      '<label class="full">' + esc(t("adm_admins")) + '<textarea id="adm-f-admins" dir="ltr">' + esc((s.adminEmails || adminEmails()).join("\n")) + "</textarea></label>" +
      '<div class="full adm-row"><button type="button" class="btn primary small" data-adm-save="settings">' + esc(t("adm_save")) + "</button></div></div>";
  }
  function saveSettings() {
    var ann = ((($("#adm-f-ann") || {}).value) || "").trim();
    var live = !!($("#adm-f-live") || {}).checked;
    var c = committed().settings || {};
    var o = {};
    var admins = val("#adm-f-admins").toLowerCase().split(/[\s,]+/).filter(Boolean);
    if (!admins.length || admins.some(function (e) { return !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e); })) return fail("adm_err_admins");
    if (!same(admins, adminEmails())) o.adminEmails = admins;
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
      tabsHtml() + '<p class="adm-note" id="adm-notice" role="alert" hidden></p>' + body + stagedPanel() + "</div>";
    if (usersState.state === "loading") {
      var btn = $("[data-adm-users-load]", host);
      if (btn) btn.disabled = true;
    }
  }
  function onClick(e) {
    var el = e.target.closest("[data-adm-tab],[data-adm-edit-kind],[data-adm-cancel],[data-adm-save],[data-adm-copy],[data-adm-download],[data-adm-clear],[data-adm-users-load],[data-adm-series-search],[data-adm-video-search],[data-adm-add],[data-adm-add-save],[data-adm-remove-book],[data-adm-remove-series],[data-adm-item-op],[data-adm-add-video]");
    if (!el) return;
    if (el.hasAttribute("data-adm-tab")) { tab = el.getAttribute("data-adm-tab"); editing = null; adding = null; render(); return; }
    if (el.hasAttribute("data-adm-add")) { adding = el.getAttribute("data-adm-add"); editing = null; render(); return; }
    if (el.hasAttribute("data-adm-add-save")) {
      var added = el.getAttribute("data-adm-add-save") === "book" ? addBook() : addSeries();
      if (added !== false) render();
      return;
    }
    if (el.hasAttribute("data-adm-remove-book") || el.hasAttribute("data-adm-remove-series")) {
      var rg = staged();
      if (rg.books) delete rg.books[el.getAttribute("data-adm-remove-book")];
      if (rg.series) delete rg.series[el.getAttribute("data-adm-remove-series")];
      pruneVideos(rg);
      saveStaged(cleanStaged(rg));
      editing = null;
      render();
      return;
    }
    if (el.hasAttribute("data-adm-item-op")) {
      itemOp(el.getAttribute("data-adm-series-id"), el.getAttribute("data-adm-item-op"), +el.getAttribute("data-adm-item-idx"));
      render();
      return;
    }
    if (el.hasAttribute("data-adm-add-video")) { if (addVideo(el.getAttribute("data-adm-add-video")) !== false) render(); return; }
    if (el.hasAttribute("data-adm-edit-kind")) {
      editing = { kind: el.getAttribute("data-adm-edit-kind"), id: el.getAttribute("data-adm-edit-id") };
      render();
      return;
    }
    if (el.hasAttribute("data-adm-cancel")) { editing = null; adding = null; render(); return; }
    if (el.hasAttribute("data-adm-save")) {
      var kind = el.getAttribute("data-adm-save");
      var id = el.getAttribute("data-adm-save-id");
      var ok = kind === "book" ? saveBook(id) : kind === "series" ? saveSeries(id) : kind === "video" ? saveVideo(id) : saveSettings();
      if (ok !== false) render();
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
