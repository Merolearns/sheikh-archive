(function(){
"use strict";

/* ---------- i18n (pl_ playlist, ls_ lesson) ---------- */
App.addStrings({ar:{
  pl_play_all:"تشغيل الكل",
  pl_lessons:"دروس",
  pl_total:"المدة الكلية",
  pl_empty:"لا توجد دروس في هذه القائمة بعد.",
  ls_save:"حفظ",
  ls_saved:"محفوظ",
  ls_save_sub:"أضفه إلى مفضلتك",
  ls_saved_sub:"في مفضلتك",
  ls_resume:"استئناف",
  ls_resume_sub:"أكمل من حيث توقفت",
  ls_lang:"اللغات والنص",
  ls_lang_sub:"الترجمة والنص الكامل",
  ls_date:"تاريخ الرفع",
  ls_duration:"المدة",
  ls_in_lists:"تظهر في",
  ls_transcript:"النص الكامل",
  ls_na:"النص غير متوفر",
  ls_no_tr:"لا توجد نصوص لهذا الدرس.",
  ls_notfound:"تعذر العثور على ملف الفيديو في هذا الجهاز",
  ls_expected:"المسار المتوقع للملف",
  ls_badformat:"قد لا يدعم المتصفح صيغة هذا الملف",
  ls_vlc_tip:"جرّب فتح الملف مباشرة ببرنامج VLC المجاني، فهو يشغّل كل الصيغ تقريبا.",
  ls_up_next:"التالي",
  ls_from:"من قائمة"
},en:{
  pl_play_all:"Play all",
  pl_lessons:"lessons",
  pl_total:"Total duration",
  pl_empty:"No lessons in this playlist yet.",
  ls_save:"Save",
  ls_saved:"Saved",
  ls_save_sub:"Add to your favorites",
  ls_saved_sub:"In your favorites",
  ls_resume:"Resume",
  ls_resume_sub:"Continue where you left off",
  ls_lang:"Languages & Text",
  ls_lang_sub:"Captions and full transcript",
  ls_date:"Uploaded",
  ls_duration:"Duration",
  ls_in_lists:"Appears in",
  ls_transcript:"Full transcript",
  ls_na:"Transcript not available",
  ls_no_tr:"No transcripts for this lesson.",
  ls_notfound:"Video file not found on this computer",
  ls_expected:"Expected file location",
  ls_badformat:"This browser may not support this file format",
  ls_vlc_tip:"Try opening the file directly in the free VLC player, it plays almost every format.",
  ls_up_next:"Up next",
  ls_from:"From playlist"
}});

/* ---------- transcript cache: max 4 entries, oldest evicted ---------- */
var trCache = new Map();
function trGet(key){
  if(!trCache.has(key)) return null;
  var v = trCache.get(key);
  trCache.delete(key); trCache.set(key, v);
  return v;
}
function trSet(key, val){
  if(trCache.has(key)) trCache.delete(key);
  trCache.set(key, val);
  while(trCache.size > 4) trCache.delete(trCache.keys().next().value);
}

/* ============ PLAYLIST view ============ */
App.renderPlaylist = function(pid){
  var pl = App.pl(pid);
  var head = document.getElementById("pl-head");
  var list = document.getElementById("pl-list");
  if(!head || !list) return;
  if(!pl){ head.innerHTML = ""; list.innerHTML = ""; return; }

  var items = (pl.items || []).slice();
  var total = 0, rows = "";
  items.forEach(function(it, i){
    var v = App.vid(it.id);
    if(!v) return;
    total += (v.duration || 0);
    var thumb = v.thumbnail ? '<img class="pl-thumb" src="' + App.esc(v.thumbnail) + '" alt="" loading="lazy">' : "";
    rows += '<li><a class="pl-row" href="#/lesson/' + App.esc(v.id) + '">'
      + '<span class="pl-num">' + (i + 1) + "</span>"
      + thumb
      + '<span class="pl-t">' + App.esc(v.title) + "</span>"
      + '<span class="pl-dur">' + App.esc(App.fmtDur(v.duration || 0)) + "</span>"
      + "</a></li>";
  });

  var first = items.length ? App.vid(items[0].id) : null;
  head.innerHTML =
    '<div class="pl-head">'
    + (pl.cover ? '<img class="pl-cover" src="' + App.esc(pl.cover) + '" alt="">' : "")
    + '<div><h1 class="pl-title">' + App.esc(pl.title) + "</h1>"
    + '<div class="pl-meta"><span><b>' + items.length + "</b> " + App.esc(App.t("pl_lessons")) + "</span>"
    + '<span>' + App.esc(App.t("pl_total")) + ': <b>' + App.esc(App.fmtDur(total)) + "</b></span></div>"
    + (first ? '<a class="pl-playall" href="#/lesson/' + App.esc(first.id) + '"><span class="pl-tri"></span>' + App.esc(App.t("pl_play_all")) + "</a>" : "")
    + "</div></div>";

  list.innerHTML = rows || '<li class="pl-empty">' + App.esc(App.t("pl_empty")) + "</li>";
};

/* ============ LESSON view ============ */
App.renderLesson = function(vid){
  var v = App.vid(vid);
  var player = document.getElementById("ls-player");
  var errBox = document.getElementById("ls-error");
  var info = document.getElementById("ls-info");
  var actions = document.getElementById("ls-actions");
  var panel = document.getElementById("ls-panel");
  var next = document.getElementById("ls-next");
  if(!player || !info) return;
  if(!v){ info.innerHTML = ""; return; }

  /* ---- player source + caption tracks ---- */
  errBox.innerHTML = "";
  panel.hidden = true;
  panel.innerHTML = "";
  player.pause();
  player.innerHTML = "";
  (v.subtitles || []).forEach(function(st, i){
    if(!st || !st.src) return;
    var tr = document.createElement("track");
    tr.kind = "subtitles";
    tr.src = st.src;
    tr.srclang = st.lang || "";
    tr.label = st.label || st.lang || "";
    if(i === 0) tr.default = true;
    player.appendChild(tr);
  });
  var probed = false;
  player.onerror = function(){
    if(probed) return;
    probed = true;
    player.pause();
    var media = v.media;
    fetch(media, {method:"HEAD"}).then(function(r){
      if(r.status === 404) showNotFound(media);
      else showBadFormat();
    }).catch(function(){ showBadFormat(); });
  };
  function showNotFound(media){
    errBox.innerHTML = '<div class="ls-errbox" role="alert"><p>'
      + App.esc(App.t("ls_notfound")) + " · Video file not found on this computer.</p>"
      + '<div style="color:var(--ink2);font-size:.88rem;margin-bottom:8px">'
      + App.esc(App.t("ls_expected")) + " · Expected file location:</div>"
      + '<div class="ls-path">' + App.esc(media) + "</div></div>";
  }
  function showBadFormat(){
    errBox.innerHTML = '<div class="ls-errbox" role="alert"><p>'
      + App.esc(App.t("ls_badformat")) + " · This browser may not support this file format.</p>"
      + '<div style="color:var(--ink2);font-size:.9rem">'
      + App.esc(App.t("ls_vlc_tip")) + "</div></div>";
  }
  player.src = v.media;
  player.load();

  /* ---- progress: throttled save + clear on finish ---- */
  var lastSave = 0;
  player.ontimeupdate = function(){
    var now = Date.now();
    if(now - lastSave < 5000) return;
    lastSave = now;
    App.state.prog[v.id] = player.currentTime || 0;
    App.save();
  };
  player.onended = function(){
    delete App.state.prog[v.id];
    App.save();
  };

  /* ---- title, meta, playlist chips ---- */
  var chips = (v.playlistIds || []).map(function(p){
    var pObj = App.pl(p);
    return pObj ? '<a class="ls-chip" href="#/playlist/' + App.esc(p) + '">' + App.esc(pObj.title) + "</a>" : "";
  }).join("");
  info.innerHTML =
    '<h1 class="ls-title">' + App.esc(v.title) + "</h1>"
    + '<div class="ls-meta">'
    + (v.uploadDate ? "<span>" + App.esc(App.t("ls_date")) + ': <b>' + App.esc(v.uploadDate) + "</b></span>" : "")
    + "<span>" + App.esc(App.t("ls_duration")) + ': <b>' + App.esc(App.fmtDur(v.duration || 0)) + "</b></span>"
    + "</div>"
    + (chips ? '<div class="ls-chips"><span class="ls-chips-label">' + App.esc(App.t("ls_in_lists")) + ":</span>" + chips + "</div>" : "");

  /* ---- action cards ---- */
  var favs = App.state.favs;
  var saved = favs.has(v.id);
  var prog = App.state.prog[v.id] || 0;
  actions.innerHTML =
    '<button type="button" id="ls-btn-save" class="ls-card' + (saved ? " ls-active" : "") + '">'
    + '<span class="ls-ico">' + (saved ? "★" : "☆") + "</span>"
    + "<span>" + App.esc(saved ? App.t("ls_saved") : App.t("ls_save")) + "</span>"
    + '<span class="ls-sub">' + App.esc(saved ? App.t("ls_saved_sub") : App.t("ls_save_sub")) + "</span></button>"
    + (prog > 10
      ? '<button type="button" id="ls-btn-resume" class="ls-card">'
        + '<span class="ls-ico">▶</span>'
        + "<span>" + App.esc(App.t("ls_resume")) + " · Resume</span>"
        + '<span class="ls-sub">' + App.esc(App.t("ls_resume_sub")) + " (" + App.esc(App.fmtDur(Math.floor(prog))) + ")</span></button>"
      : "")
    + '<button type="button" id="ls-btn-lang" class="ls-card" aria-expanded="false">'
    + '<span class="ls-ico">🌐</span>'
    + "<span>" + App.esc(App.t("ls_lang")) + "</span>"
    + '<span class="ls-sub">' + App.esc(App.t("ls_lang_sub")) + "</span></button>";

  var btnSave = document.getElementById("ls-btn-save");
  if(btnSave) btnSave.onclick = function(){
    if(favs.has(v.id)) favs.delete(v.id); else favs.add(v.id);
    App.save();
    App.renderLesson(v.id);
  };
  var btnResume = document.getElementById("ls-btn-resume");
  if(btnResume) btnResume.onclick = function(){
    try { player.currentTime = prog; player.play(); } catch(e){}
  };
  var btnLang = document.getElementById("ls-btn-lang");
  if(btnLang) btnLang.onclick = function(){ togglePanel(); };

  /* ---- Languages & Text panel ---- */
  var subs = (v.subtitles || []).filter(function(s){ return s && s.readSrc; });
  function togglePanel(){
    var open = panel.hidden;
    if(open) buildPanel();
    panel.hidden = !open;
    btnLang.setAttribute("aria-expanded", open ? "true" : "false");
    btnLang.classList.toggle("ls-active", open);
  }
  function buildPanel(){
    if(!subs.length){
      panel.innerHTML = '<p class="ls-na">' + App.esc(App.t("ls_no_tr")) + "</p>";
      return;
    }
    var btns = subs.map(function(s, i){
      return '<button type="button" class="ls-tr-btn" data-i="' + i + '">' + App.esc(s.label || s.lang || "") + "</button>";
    }).join("");
    panel.innerHTML = '<div class="ls-tr-btns">' + btns
      + '</div><div id="ls-tr-out"><p class="ls-na">' + App.esc(App.t("ls_transcript")) + "…</p></div>";
    var out = document.getElementById("ls-tr-out");
    panel.querySelectorAll(".ls-tr-btn").forEach(function(b){
      b.onclick = function(){
        panel.querySelectorAll(".ls-tr-btn").forEach(function(x){ x.classList.remove("ls-active"); });
        b.classList.add("ls-active");
        var s = subs[parseInt(b.getAttribute("data-i"), 10)];
        loadTranscript(s, out);
      };
    });
  }
  function loadTranscript(s, out){
    var cached = trGet(s.readSrc);
    if(cached !== null){ out.innerHTML = '<pre class="ls-transcript">' + App.esc(cached) + "</pre>"; return; }
    out.innerHTML = '<p class="ls-na">' + App.esc(App.t("ls_transcript")) + "…</p>";
    fetch(s.readSrc).then(function(r){
      if(!r.ok) throw 0;
      return r.text();
    }).then(function(txt){
      trSet(s.readSrc, txt);
      out.innerHTML = '<pre class="ls-transcript">' + App.esc(txt) + "</pre>";
    }).catch(function(){
      out.innerHTML = '<p class="ls-na">' + App.esc(App.t("ls_na")) + " · Transcript not available</p>";
    });
  }

  /* ---- Up next: next video in first playlist membership ---- */
  var upNext = null, fromTitle = "";
  var firstPl = (v.playlistIds && v.playlistIds.length) ? App.pl(v.playlistIds[0]) : null;
  if(firstPl && firstPl.items){
    var idx = -1;
    for(var i = 0; i < firstPl.items.length; i++){
      if(firstPl.items[i].id === v.id){ idx = i; break; }
    }
    if(idx >= 0 && idx + 1 < firstPl.items.length){
      upNext = App.vid(firstPl.items[idx + 1].id);
      fromTitle = firstPl.title;
    }
  }
  if(upNext){
    next.style.display = "";
    next.innerHTML =
      '<h3>' + App.esc(App.t("ls_up_next")) + " · Up next</h3>"
      + '<div class="ls-from">' + App.esc(App.t("ls_from")) + " " + App.esc(fromTitle) + "</div>"
      + '<a href="#/lesson/' + App.esc(upNext.id) + '">'
      + (upNext.thumbnail ? '<img src="' + App.esc(upNext.thumbnail) + '" alt="" loading="lazy">' : "")
      + '<div class="ls-t">' + App.esc(upNext.title) + "</div>"
      + '<div class="ls-dur">' + App.esc(App.fmtDur(upNext.duration || 0)) + "</div>"
      + "</a>";
  } else {
    next.style.display = "none";
    next.innerHTML = "";
  }

};

})();
