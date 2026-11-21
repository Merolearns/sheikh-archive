(function () {
  'use strict';

  var reciteAvailable = false;

  App.addStrings({
    ar: {
      sp_verse: 'وَقُل رَّبِّ زِدْنِي عِلْمًا',
      sp_cite: 'طه ٢٠:١١٤ · Ta Ha 20:114',
      sp_sheikh: 'فضيلة الشيخ الدكتور مصطفى كامل',
      sp_enter: 'ادخل المكتبة',
      sp_recite: 'استمع إلى الآية · al-Husary (murattal)',
      sp_recite_status: 'التلاوة بانتظار الترخيص · Recitation licence pending, no recording is bundled.'
    },
    en: {
      sp_verse: 'وَقُل رَّبِّ زِدْنِي عِلْمًا',
      sp_cite: 'طه ٢٠:١١٤ · Ta Ha 20:114',
      sp_sheikh: 'His Eminence Sheikh Dr. Moustafa Kamel',
      sp_enter: 'Enter the library',
      sp_recite: 'استمع إلى الآية · al-Husary (murattal)',
      sp_recite_status: 'التلاوة بانتظار الترخيص · Recitation licence pending, no recording is bundled.'
    }
  });

  function el(id) { return document.getElementById(id); }

  function paint() {
    var s = el('sp-splash');
    if (!s) return;
    s.setAttribute('lang', App.state.lang === 'en' ? 'en' : 'ar');
    el('sp-verse').textContent = App.t('sp_verse');
    el('sp-cite').textContent = App.t('sp_cite');
    el('sp-sheikh').textContent = App.t('sp_sheikh');
    el('sp-enter-label').textContent = App.t('sp_enter');
    el('sp-recite-label').textContent = App.t('sp_recite');
    el('sp-recite-status').textContent = App.t('sp_recite_status');
    el('sp-recite-btn').disabled = !reciteAvailable;
  }

  App.renderSplash = function () {
    paint();
    var s = el('sp-splash');
    if (s) s.classList.remove('sp-hidden');
  };

  App.splash = {
    hide: function () {
      var s = el('sp-splash');
      if (s) s.classList.add('sp-hidden');
    },
    setRecitationAvailable: function (v) {
      reciteAvailable = !!v;
      var b = el('sp-recite-btn');
      if (b) b.disabled = !reciteAvailable;
    }
  };

  function wire() {
    var enter = el('sp-enter');
    if (enter) {
      enter.addEventListener('click', function () {
        App.splash.hide();
        App.go('#/home');
      });
    }
    var recite = el('sp-recite-btn');
    if (recite) {
      recite.addEventListener('click', function () {
        // Honest no-op: no licensed recording is bundled, and audio is never synthesized.
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wire);
  } else {
    wire();
  }
})();
