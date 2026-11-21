1. **app.js – renderLesson stage + video wiring (REAL CODE 1), replace entire block**  
```js
    if (!keep) {
      const drawFrame = !calm() && onceKey("player-frame");
      $("#v-lesson").innerHTML =
        `<div class="wrap ls${opts.keepPage ? "" : " intro"}"><div class="ls-main">` +
        `<div class="pframe${drawFrame ? " drawing" : ""}" id="pframe"><svg class="pf-line" aria-hidden="true"><rect pathLength="100" rx="17"/></svg><span class="corner a">${kh()}</span><span class="corner b">${kh()}</span>` +
        `<div class="stage" dir="ltr"><video id="vid" controls playsinline preload="metadata"></video><iframe id="ytFrame" title="${esc(t("pb_yt"))}" style="display:none" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe><div class="cap" id="cap" hidden></div><div class="buf" id="buf" aria-hidden="true">${kh()}</div>` +
        `<div class="stage-empty" id="stageEmpty" role="alert">${kh("se-kh")}<div class="se-msg" id="stageMsg"></div></div></div></div>` +
        '<div class="notice" id="notice" role="status" hidden></div><div id="lsInfo"></div><div class="panel tx" id="txPanel" hidden></div></div><aside id="lsSide"></aside></div>';
      const video = $("#vid");
      const ytFrame = $("#ytFrame");
      const capWrap = document.createElement("span");
      capWrap.id = "capWrap";
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
      video.addEventListener("seeked", () => { paintCap(); syncTx(true); });
      video.addEventListener("pause", saveProgress);
      video.addEventListener("ended", () => setDone(v.id, true));
      video.addEventListener("error", () => {
        $("#pframe").classList.add("err");
        probeError(v, p);
      });
      const from = q.get("resume") ? progOf(v.id) : 0;
      if (from > 5)
        video.addEventListener("loadedmetadata", () => {
          if (!video.duration || from < video.duration - 2) video.currentTime = from;
        }, { once: true });
      video.src = v.media;
      const cc = q.get("cc");
      if (cc === "ar" || cc === "en") setCaptions(cc);
      Rec.stop();
      const ytId = ytIdOf(v.media);
      if (ytId) {
        setPlayMode("yt");
      } else {
        setPlayMode("local");
      }
      const pr = video.play();
      if (pr && pr.catch) pr.catch(() => {});
    }
```

2. **app.js – actions area (REAL CODE 2), replace entire block**  
```js
    $("#lsInfo").innerHTML =
      `<h1${AR}>${esc(v.title)}</h1><div class="ls-meta"${L()}>` +
      (p ? `<a class="pill" href="#/playlist/${encodeURIComponent(p.id)}"${AR}>${esc(p.title)}</a>` : `<span class="pill">${esc(t("no_series"))}</span>`) +
      `<span class="pill">${esc(scholarOf(v))}</span><span class="pill ltr">${esc(dur(v.duration))}</span><span class="pill">${esc(t("published", { d: date(v.uploadDate) }))}</span></div>` +
      `<div class="ls-acts"${L()}>${starBtn(v.id, "lg")}${doneBtn(v.id)}` +
      (canResume(v) && !q.get("resume") ? `<button class="btn small" type="button" id="lsResume">${icon("i-resume")}${esc(t("ls_resume_at", { t: dur(progOf(v.id)) }))}</button>` : "") +
      `<button class="btn" type="button" data-mode="yt" aria-pressed="${cur.mode === 'yt'}">${esc(t("pb_yt"))}</button>` +
      `<button class="btn" type="button" data-mode="hosted" aria-pressed="${cur.mode === 'hosted'}">${esc(t("pb_hosted"))}</button>` +
      `<button class="btn" type="button" data-mode="local" aria-pressed="${cur.mode === 'local'}">${esc(t("pb_local"))}</button>` +
      `<span id="capWrap">${capBtn("ar")}${capBtn("en")}</span>` +
      "</div>" +
```

3. **app.js – add helper function `buildVideo(v, p)` immediately before or after `probeError` (not inside it)**  
```js
  function buildVideo(v, p) {
    const video = $("#vid");
    const buf = $("#buf");
    video.src = v.media;
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
    video.addEventListener("seeked", () => { paintCap(); syncTx(true); });
    video.addEventListener("pause", saveProgress);
    video.addEventListener("ended", () => setDone(v.id, true));
    video.addEventListener("error", () => {
      $("#pframe").classList.add("err");
      probeError(v, p);
    });
    const from = q.get("resume") ? progOf(v.id) : 0;
    if (from > 5)
      video.addEventListener("loadedmetadata", () => {
        if (!video.duration || from < video.duration - 2) video.currentTime = from;
      }, { once: true });
    const cc = q.get("cc");
    if (cc === "ar" || cc === "en") setCaptions(cc);
  }
```

4. **app.js – replace `probeError` (REAL CODE 3) with this version**  
```js
  function probeError(v, p) {
    let code = 0;
    try { code = (await fetch(v.media, { method: "HEAD", cache: "no-store" })).status; } catch (_) {}
    if (!cur || cur.v.id !== v.id) return;
    if (code === 404) {
      let folder = null;
      try { folder = await (await fetch("__status", { cache: "no-store" })).json(); } catch (_) {}
      let rel = v.media;
      try { rel = decodeURIComponent(v.media); } catch (_) {}
      showError(
        `<p${L()}><b>${esc(t("err_404"))}</b></p>` +
          `<div class="acts"${L()}><a class="btn small" href="${p ? "#/playlist/" + encodeURIComponent(p.id) : "#/library"}">${esc(t(p ? "back_series" : "back_lib"))}</a></div>` +
          `<details${L()}><summary>${esc(t("err_details"))}</summary><p style="margin-top:8px">${esc(t("err_where"))}</p><code>${esc(rel)}</code>` +
          (folder && folder.videos_exists === false ? `<p style="margin-top:8px">${esc(t("err_nofolder"))}</p>` : "") +
          "</details>",
      );
      const ytId = ytIdOf(v.media);
      if (ytId) {
        setPlayMode("yt");
        const localBtn = $("[data-mode='local']");
        if (localBtn) {
          localBtn.outerHTML = `<span class="muted">${esc(t("pb_local_no"))}</span>`;
        }
      }
    } else {
      showError(
        `<p${L()}><b>${esc(t("err_format"))}</b></p><div class="acts"${L()}><a class="btn small" href="${esc(v.media)}" target="_blank" rel="noopener">${esc(t("open_file"))}</a></div>`,
      );
    }
  }
```

5. **app.js – add `setPlayMode(mode)` function immediately after `probeError` (or before `renderLesson` if outside all functions)**  
```js
  function setPlayMode(mode) {
    if (!cur) return;
    cur.mode = mode;
    const video = cur.video;
    const ytFrame = cur.ytFrame;
    const capWrap = $("#capWrap");
    const localBtn = $("[data-mode='local']");
    const ytBtn = $("[data-mode='yt']");
    const hostedBtn = $("[data-mode='hosted']");
    const buttons = [ytBtn, hostedBtn, localBtn].filter(Boolean);
    buttons.forEach(btn => btn.setAttribute("aria-pressed", btn.dataset.mode === mode));
    if (mode === "yt") {
      if (video && !video.paused) video.pause();
      saveProgress();
      Rec.stop();
      const ytId = ytIdOf(cur.v.media);
      if (ytId) {
        ytFrame.src = `https://www.youtube-nocookie.com/embed/${ytId}?rel=0`;
        ytFrame.style.display = "block";
        video.style.display = "none";
        if (capWrap) capWrap.hidden = true;
      }
    } else if (mode === "local") {
      if (ytFrame) ytFrame.style.display = "none";
      if (video) {
        video.style.display = "block";
        buildVideo(cur.v, null);
        const from = progOf(cur.v.id);
        if (from > 5 && !video.paused && video.duration && from < video.duration - 2) {
          video.currentTime = from;
        }
      }
      if (capWrap) capWrap.hidden = false;
    } else if (mode === "hosted") {
      showNotice(t("pb_hosted_no"));
      // do not alter stage DOM
      if (capWrap) capWrap.hidden = false;
    }
  }
```

6. **app.js – add `ytIdOf(media)` helper immediately before `setPlayMode` (or before `probeError`)**  
```js
  function ytIdOf(media) {
    const m = media.match(/\[([A-Za-z0-9_-]{11})\]\.(mkv|mp4|webm)$/);
    return m ? m[1] : null;
  }
```

7. **app.js – add guards to top of `paintCap()` and `syncTx()` (replace their existing bodies’ first lines)**  
*(Assuming `paintCap` and `syncTx` are declared earlier — insert these checks at the very start of each function body)*  
```js
    if (!cur || !cur.video || !cur.video.isConnected) return;
```

8. **app.css – add these CSS rules at end of file**  
```css
.stage iframe {
  width: 100%;
  height: 100%;
  display: block;
  border: 0;
}
```