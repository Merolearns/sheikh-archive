/* Books section prototype — list / detail / reader.
   Data: window.BOOKS from books-data.js (generated mechanically).
   window.BOOKS_PREVIEW = true renders the metadata-only flavour:
   no cover images, no file links, no reader.
   Page chrome stays RTL-anchored (v4 pattern); only text switches lang. */
(function () {
  'use strict';
  var PREVIEW = !!window.BOOKS_PREVIEW;
  var DATA = window.BOOKS || { books: [], counts: {} };
  var BOOKS = DATA.books || [];

  var STR = {
    ar: {
      title: 'الكتب', subtitle: 'كتب فضيلة الشيخ الدكتور مصطفى كامل',
      searchPh: 'ابحث في عناوين الكتب والمؤلفين',
      all: 'الكل', arabic: 'العربية', english: 'English',
      booksUnit: ['كتاب واحد', 'كتابان', 'كتب', 'كتابًا'],
      pagesUnit: ['صفحة واحدة', 'صفحتان', 'صفحات', 'صفحة'],
      of: 'من', read: 'اقرأ', details: 'التفاصيل', back: 'عودة إلى الكتب',
      openFile: 'فتح الملف', alsoIn: 'متوفر أيضًا باللغة',
      parts: 'الأجزاء', part: ['الجزء الأول', 'الجزء الثاني', 'الجزء الثالث', 'الجزء الرابع'],
      volume: ['الجزء الأول', 'الجزء الثاني', 'الجزء الثالث', 'الجزء الرابع'],
      noResults: 'لا توجد نتائج مطابقة',
      readerNote: 'إذا لم يظهر الملف، استخدم زر فتح الملف.',
      wordTitle: 'ملف Word', wordBody: 'هذا الكتاب ملف Word، يفتح في برنامج معالجة الكلمات على جهازك.',
      previewBanner: 'نسخة معاينة: البيانات فقط، دون ملفات الكتب.',
      langName: 'العربية', formatPdf: 'PDF', formatDocx: 'Word',
      authorBy: 'تأليف'
    },
    en: {
      title: 'Books', subtitle: 'Books by Dr. Moustafa Suleiman Kamel',
      searchPh: 'Search book titles and authors',
      all: 'All', arabic: 'Arabic', english: 'English',
      booksUnit: ['book', 'books'],
      pagesUnit: ['page', 'pages'],
      of: 'of', read: 'Read', details: 'Details', back: 'Back to books',
      openFile: 'Open file', alsoIn: 'Also available in',
      parts: 'Parts', part: ['Part 1', 'Part 2', 'Part 3', 'Part 4'],
      volume: ['Volume 1', 'Volume 2', 'Volume 3', 'Volume 4'],
      noResults: 'No matching results',
      readerNote: 'If the document does not appear, use Open file.',
      wordTitle: 'Word document', wordBody: 'This book is a Word document. It opens in your word processor.',
      previewBanner: 'Preview copy: metadata only, no book files.',
      langName: 'English', formatPdf: 'PDF', formatDocx: 'Word',
      authorBy: 'By'
    }
  };

  var lang = 'ar';
  try { lang = localStorage.getItem('books-lang-proto') || 'ar'; } catch (e) {}
  if (lang !== 'ar' && lang !== 'en') lang = 'ar';
  var filter = 'all';
  var query = '';

  function t(k) { return STR[lang][k]; }
  function num(n) { return n.toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US'); }
  function arCount(n, forms) {
    if (lang === 'en') return num(n) + ' ' + (n === 1 ? forms[0] : forms[1]);
    if (n === 1) return forms[0];
    if (n === 2) return forms[1];
    if (n >= 3 && n <= 10) return num(n) + ' ' + forms[2];
    return num(n) + ' ' + forms[3];
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function norm(s) {
    return String(s || '').normalize('NFKC')
      .replace(/[\u064b-\u0652\u0670\u0640]/g, '')
      .replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي')
      .toLowerCase();
  }
  function encPath(p) { return p.split('/').map(encodeURIComponent).join('/'); }
  function $(s) { return document.querySelector(s); }
  function byId(id) { for (var i = 0; i < BOOKS.length; i++) if (BOOKS[i].id === id) return BOOKS[i]; return null; }
  function displayTitle(b) { return b.title_ar || b.title_en || ''; }
  function displayAuthor(b) { return (lang === 'ar' ? (b.author_ar || b.author_en) : (b.author_en || b.author_ar)) || ''; }
  function blurb(b) { return (b.blurb && (b.blurb[lang] || b.blurb.ar || b.blurb.en)) || ''; }

  function badge(b) {
    var l = b.language === 'ar' ? t('arabic') : t('english');
    var f = b.format === 'docx' ? t('formatDocx') : t('formatPdf');
    return '<span class="badge lang">' + esc(l) + '</span><span class="badge">' + esc(f) + '</span><span>' + esc(arCount(b.pages, t('pagesUnit'))) + '</span>';
  }

  function card(b) {
    var cover = (!PREVIEW && b.cover)
      ? '<span class="arch"><img src="' + esc(encPath(b.cover)) + '" alt="" loading="lazy"></span>'
      : '<span class="arch noimg" aria-hidden="true"></span>';
    var enTitle = (b.title_en && b.title_ar) ? '<span class="en-title" lang="en" dir="ltr">' + esc(b.title_en) + '</span>' : '';
    var author = displayAuthor(b);
    var action = PREVIEW
      ? '<a class="btn block" href="#/' + b.id + '">' + esc(t('details')) + '</a>'
      : '<a class="btn primary block" href="#/' + b.id + '/read">' + esc(t('read')) + '</a><a class="btn block" href="#/' + b.id + '">' + esc(t('details')) + '</a>';
    return '<article class="scard">' + cover +
      '<div class="sbody"><h3 class="stitle" lang="' + (b.title_ar ? 'ar' : 'en') + '" dir="auto">' + esc(displayTitle(b)) + '</h3>' +
      enTitle +
      (author ? '<span class="author">' + esc(author) + '</span>' : '') +
      '<span class="meta">' + badge(b) + '</span></div>' +
      '<div class="lacts">' + action + '</div></article>';
  }

  function visible() {
    var q = norm(query);
    return BOOKS.filter(function (b) {
      if (filter !== 'all' && b.language !== filter) return false;
      if (!q) return true;
      var hay = norm([b.title_ar, b.title_en, b.author_ar, b.author_en, blurb(b)].join(' '));
      return hay.indexOf(q) !== -1;
    });
  }

  function renderList() {
    var list = visible();
    var total = BOOKS.length;
    var countHtml = list.length === total
      ? '<span class="count">' + esc(arCount(total, t('booksUnit'))) + '</span>'
      : '<span class="count">' + esc(num(list.length)) + ' ' + esc(t('of')) + ' ' + esc(arCount(total, t('booksUnit'))) + '</span>';
    var cards = list.map(card).join('') || '<p class="empty">' + esc(t('noResults')) + '</p>';
    $('#view').innerHTML =
      '<section class="hero"><h1>' + esc(t('title')) + '</h1><p>' + esc(t('subtitle')) + ' ' + countHtml + '</p></section>' +
      '<div class="toolbar"><label class="search"><span class="sr">' + esc(t('searchPh')) + '</span>' +
      '<input id="q" type="search" placeholder="' + esc(t('searchPh')) + '" value="' + esc(query) + '" autocomplete="off"></label>' +
      '<div class="filters" role="group" aria-label="language">' +
      '<button class="chipf' + (filter === 'all' ? ' on' : '') + '" data-f="all" aria-pressed="' + (filter === 'all') + '">' + esc(t('all')) + ' <b>' + esc(num(total)) + '</b></button>' +
      '<button class="chipf' + (filter === 'ar' ? ' on' : '') + '" data-f="ar" aria-pressed="' + (filter === 'ar') + '">' + esc(t('arabic')) + ' <b>' + esc(num(BOOKS.filter(function (b) { return b.language === 'ar'; }).length)) + '</b></button>' +
      '<button class="chipf' + (filter === 'en' ? ' on' : '') + '" data-f="en" aria-pressed="' + (filter === 'en') + '">' + esc(t('english')) + ' <b>' + esc(num(BOOKS.filter(function (b) { return b.language === 'en'; }).length)) + '</b></button>' +
      '</div></div>' +
      '<div class="grid">' + cards + '</div>';
    var q = $('#q');
    q.addEventListener('input', function () { query = q.value; renderListKeepFocus(); });
    document.querySelectorAll('.chipf').forEach(function (c) {
      c.addEventListener('click', function () { filter = c.getAttribute('data-f'); renderList(); });
    });
    function renderListKeepFocus() {
      var pos = q.selectionStart;
      renderList();
      var nq = $('#q');
      nq.focus();
      try { nq.setSelectionRange(pos, pos); } catch (e) {}
    }
  }

  function renderDetail(b) {
    var cover = (!PREVIEW && b.cover)
      ? '<span class="arch"><img src="' + esc(encPath(b.cover)) + '" alt=""></span>'
      : '<span class="arch noimg" aria-hidden="true"></span>';
    var comp = b.companion ? byId(b.companion) : null;
    var compHtml = '';
    if (comp) {
      var otherLang = comp.language === 'ar' ? t('arabic') : t('english');
      compHtml = '<p class="notes"><a class="link" href="#/' + comp.id + '">' + esc(t('alsoIn')) + ' ' + esc(otherLang) + '</a></p>';
    }
    var author = displayAuthor(b);
    var partsHtml = '';
    if (b.parts && b.parts.length) {
      var rows = b.parts.map(function (p, i) {
        var label = t('part')[p.part - 1] || (t('part') + ' ' + num(p.part));
        var act = PREVIEW ? '' : '<a class="btn" href="#/' + b.id + '/read/' + i + '">' + esc(t('read')) + '</a>';
        return '<div class="part-row"><span class="pt">' + esc(label) + ' · ' + esc(arCount(p.pages, t('pagesUnit'))) + '</span>' + act + '</div>';
      }).join('');
      partsHtml = '<div class="parts"><h2>' + esc(t('parts')) + '</h2>' + rows + '</div>';
    }
    var volHtml = '';
    if (b.part && !b.parts) {
      volHtml = '<p class="notes">' + esc(t('volume')[b.part - 1] || '') + '</p>';
    }
    var actions = PREVIEW ? '' :
      '<div class="actions"><a class="btn primary" href="#/' + b.id + '/read">' + esc(t('read')) + '</a></div>';
    $('#view').innerHTML =
      '<div class="backrow"><a class="btn" href="#/">' + esc(t('back')) + '</a></div>' +
      '<section class="detail">' + cover +
      '<div><h1 lang="' + (b.title_ar ? 'ar' : 'en') + '" dir="auto">' + esc(displayTitle(b)) + '</h1>' +
      (b.title_en && b.title_ar ? '<p class="sub" lang="en" dir="ltr">' + esc(b.title_en) + '</p>' : '') +
      (author ? '<p class="sub">' + esc(t('authorBy')) + ' ' + esc(author) + '</p>' : '') +
      '<div class="facts">' + badge(b) + '</div>' +
      volHtml +
      (blurb(b) ? '<p class="notes">' + esc(blurb(b)) + '</p>' : '') +
      compHtml + actions + partsHtml + '</div></section>';
  }

  function renderReader(b, partIdx) {
    if (PREVIEW) { location.hash = '#/' + b.id; return; }
    var file, label;
    if (b.parts && b.parts.length) {
      var p = b.parts[partIdx || 0] || b.parts[0];
      file = p.file;
      label = (t('part')[p.part - 1] || '') + ' · ' + displayTitle(b);
    } else {
      file = b.files[0];
      label = displayTitle(b);
    }
    var url = encPath('books/files/' + file.split('/').pop());
    var body = '';
    if (b.format === 'docx') {
      body = '<div class="word-note"><h2>' + esc(t('wordTitle')) + '</h2><p>' + esc(t('wordBody')) + '</p>' +
        '<a class="btn primary" href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(t('openFile')) + '</a></div>';
    } else {
      body = '<iframe src="' + esc(url) + '" title="' + esc(label) + '"></iframe>' +
        '<div class="fallback"><span>' + esc(t('readerNote')) + '</span>' +
        '<a class="btn" href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(t('openFile')) + '</a></div>';
    }
    $('#view').innerHTML =
      '<div class="backrow"><a class="btn" href="#/' + b.id + '">' + esc(t('back')) + '</a></div>' +
      '<section class="reader"><h1 class="sr">' + esc(label) + '</h1>' + body + '</section>';
  }

  function renderLangToggle() {
    var seg = $('#langseg');
    var banner = $('#preview-banner');
    if (banner) banner.textContent = t('previewBanner');
    if (!seg) return;
    seg.innerHTML =
      '<button type="button" data-l="ar" aria-pressed="' + (lang === 'ar') + '">العربية</button>' +
      '<button type="button" data-l="en" aria-pressed="' + (lang === 'en') + '">English</button>';
    seg.querySelectorAll('button').forEach(function (bt) {
      bt.addEventListener('click', function () {
        lang = bt.getAttribute('data-l');
        try { localStorage.setItem('books-lang-proto', lang); } catch (e) {}
        document.documentElement.lang = lang;
        renderLangToggle();
        route();
      });
    });
  }

  function route() {
    var h = location.hash || '#/';
    var m = h.match(/^#\/([^\/]+)(?:\/read(?:\/(\d+))?)?$/);
    if (!m) { renderList(); return; }
    var b = byId(m[1]);
    if (!b) { renderList(); return; }
    if (h.indexOf('/read') !== -1) renderReader(b, m[2] ? parseInt(m[2], 10) : 0);
    else renderDetail(b);
    window.scrollTo(0, 0);
  }

  document.documentElement.lang = lang;
  renderLangToggle();
  window.addEventListener('hashchange', route);
  route();
})();
