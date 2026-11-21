```js
// (1) renderLesson stage and actions-area changes
// Inside renderLesson(id, q, opts) — replace the existing div#ls-acts content generation:
const ytId = ytIdOf(v.media);
const hasLocalFile = v.media && /\.(mkv|mp4|webm)$/.test(v.media);
const isLocalMissing = opts?.localMissing === true; // set by probeError 404 path

// In the #ls-acts section, replace the existing action buttons with:
const modeButtons = `
  <button type="button" class="btn btn-primary pb-mode pb-yt" data-mode="yt" ${!ytId ? 'disabled' : ''}>
    <span class="pb-label">${t('pb_yt')}</span>
  </button>
  <button type="button" class="btn btn-secondary pb-mode pb-hosted" data-mode="hosted" ${hasLocalFile ? '' : 'disabled'}>
    <span class="pb-label">${t('pb_hosted')}</span>
  </button>
  <button type="button" class="btn btn-tertiary pb-mode pb-local" data-mode="local"
    ${isLocalMissing ? 'disabled' : ''}>
    <span class="pb-label">${isLocalMissing ? t('pb_local_no') : t('pb_local')}</span>
  </button>
`;

// Insert modeButtons into #ls-acts (replacing prior Save/Mark/etc. button group *except* Save, Mark-as-watched, resume — keep those before or after)
// Assuming original #ls-acts structure is: <div id="ls-acts">[existing buttons] [mode switches]</div>
// So append modeButtons *after* other actions but *before* caption button (which we’ll conditionally omit in YT mode):
const actionsHtml = `
  ${saveBtn} ${markBtn} ${resumeBtn}
  ${modeButtons}
  ${ytId && !isLocalMissing ? '' : `<button type="button" class="btn btn-icon btn-caption" id="capBtn" aria-expanded="false" aria-controls="txPanel"><span class="visually-hidden">${t('cap_toggle')}</span></button>`}
`;

// In the stage HTML: inside #pframe > .stage, *replace* the video#vid element when in YT mode
// So instead of hardcoding <video id="vid">, generate conditionally:
let stageContent = '';
if (opts?.playMode === 'yt' && ytId) {
  stageContent = `
    <iframe id="ytIframe" 
      title="${esc(t('pb_yt'))}" 
      width="100%" 
      height="100%" 
      src="https://www.youtube-nocookie.com/embed/${esc(ytId)}?rel=0" 
      frameborder="0" 
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
      allowfullscreen 
      loading="lazy">
    </iframe>
  `;
} else {
  stageContent = `
    <video id="vid" controls playsinline preload="metadata" aria-label="${esc(t('video_player'))}">
      ${v.media ? `<source src="${esc(v.media)}" type="${v.media.endsWith('.mp4') ? 'video/mp4' : v.media.endsWith('.webm') ? 'video/webm' : 'video/x-matroska'}">` : ''}
      ${v.media ? '' : `<p>${t('video_unavailable')}</p>`}
    </video>
    <div id="cap" hidden></div>
    <div id="buf"></div>
    <div id="stageEmpty" role="alert"><div id="stageMsg"></div></div>
  `;
}

// Then assign to #pframe > .stage.innerHTML = stageContent;
// Also ensure transcript panel (#txPanel) remains visible unconditionally — no change needed there.
```

```js
// (2) new functions and probeError integration

// Extract 11-char YouTube ID from v.media string (e.g. "[dQw4w9WgXcQ].mp4")
function ytIdOf(media) {
  if (!media || typeof media !== 'string') return null;
  const m = media.match(/\[([A-Za-z0-9_-]{11})\]\.(mkv|mp4|webm)$/);
  return m ? m[1] : null;
}

// Set playback mode and persist state; triggers UI update and side effects
function setPlayMode(mode) {
  const pframe = document.getElementById('pframe');
  if (!pframe) return;

  const currentMode = pframe.dataset.playMode;
  if (currentMode === mode) return;

  pframe.dataset.playMode = mode;

  // Update button states
  const modeBtns = document.querySelectorAll('.pb-mode');
  modeBtns.forEach(btn => {
    const isTarget = btn.dataset.mode === mode;
    btn.classList.toggle('active', isTarget);
    btn.setAttribute('aria-pressed', isTarget.toString());
  });

  // Hide caption button in YT mode
  const capBtn = document.getElementById('capBtn');
  if (capBtn) {
    capBtn.hidden = mode === 'yt';
  }

  // Side effects per mode
  if (mode === 'yt') {
    activateYouTube();
  } else if (mode === 'local') {
    activateLocal();
  }
  // hosted mode has no player — handled by UI only
}

// Switch to YouTube mode: pause local video, save progress, stop recitation, swap DOM
function activateYouTube() {
  const vid = document.getElementById('vid');
  const ytIframe = document.getElementById('ytIframe');
  const pframe = document.getElementById('pframe');
  const stage = pframe.querySelector('.stage');

  if (vid && !vid.paused) {
    vid.pause();
    saveProgress(); // saves last known time
  }
  Rec.stop();

  // Replace video with iframe
  if (ytIframe) {
    ytIframe.remove();
  }

  const ytId = ytIdOf(pframe.dataset.media || '');
  if (!ytId) {
    showError(t('pb_yt_no'));
    return;
  }

  const iframe = document.createElement('iframe');
  iframe.id = 'ytIframe';
  iframe.title = t('pb_yt');
  iframe.width = '100%';
  iframe.height = '100%';
  iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(ytId)}?rel=0`;
  iframe.frameBorder = '0';
  iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
  iframe.allowFullscreen = true;
  iframe.loading = 'lazy';

  // Clear stage and inject iframe
  stage.innerHTML = '';
  stage.appendChild(iframe);

  // Ensure transcript stays visible
  const txPanel = document.getElementById('txPanel');
  if (txPanel && txPanel.hidden) txPanel.hidden = false;
}

// Switch to Local mode: restore video element, resume playback position if possible
function activateLocal() {
  const pframe = document.getElementById('pframe');
  const stage = pframe.querySelector('.stage');
  const vid = document.getElementById('vid');
  const ytIframe = document.getElementById('ytIframe');

  // If video already exists, just show it
  if (vid) {
    stage.innerHTML = '';
    stage.appendChild(vid);
    // Resume from saved progress if available
    const saved = getSavedProgress(pframe.dataset.lessonId);
    if (saved && saved.time > 0 && !isNaN(saved.time)) {
      vid.currentTime = saved.time;
      // Don’t auto-play — user must click play
    }
    return;
  }

  // Reconstruct video element
  const mediaSrc = pframe.dataset.media || '';
  const videoEl = document.createElement('video');
  videoEl.id = 'vid';
  videoEl.controls = true;
  videoEl.playsInline = true;
  videoEl.preload = 'metadata';
  videoEl.ariaLabel = t('video_player');

  if (mediaSrc) {
    const source = document.createElement('source');
    source.src = mediaSrc;
    source.type = mediaSrc.endsWith('.mp4') ? 'video/mp4' :
                  mediaSrc.endsWith('.webm') ? 'video/webm' :
                  'video/x-matroska';
    videoEl.appendChild(source);
  }

  // Append fallback message if no source
  if (!mediaSrc) {
    const p = document.createElement('p');
    p.textContent = t('video_unavailable');
    videoEl.appendChild(p);
  }

  stage.innerHTML = '';
  stage.appendChild(videoEl);

  // Reattach event listeners (assume existing initVideoListeners() exists — call it here if needed)
  initVideoListeners(); // You must ensure this function exists and handles vid, cap, buf, etc.

  // Restore saved time
  const saved = getSavedProgress(pframe.dataset.lessonId);
  if (saved && saved.time > 0 && !isNaN(saved.time)) {
    videoEl.currentTime = saved.time;
  }
}

// Integrate into probeError — called on video error
function probeError(v, p) {
  const pframe = document.getElementById('pframe');
  if (!pframe) return;

  const ytId = ytIdOf(v.media);
  const hasLocal = v.media && /\.(mkv|mp4|webm)$/.test(v.media);

  // HEAD fetch to confirm 404
  fetch(v.media, { method: 'HEAD', cache: 'no-store' })
    .then(res => {
      if (res.status === 404) {
        // Local file confirmed missing
        pframe.dataset.localMissing = 'true';
        // Update UI: disable Local button, show pb_local_no text
        const localBtn = document.querySelector('.pb-local');
        if (localBtn) {
          localBtn.disabled = true;
          localBtn.querySelector('.pb-label').textContent = t('pb_local_no');
        }
        // Keep YouTube active if possible
        if (ytId) {
          // Ensure YT button is enabled and primary
          const ytBtn = document.querySelector('.pb-yt');
          if (ytBtn) ytBtn.disabled = false;
        }
        // Show 404 error state
        showError(t('pb_yt_no')); // or a more specific msg — per req: use pb_yt_no when YT is fallback
      } else if (res.ok) {
        // File exists but player failed — format issue or codec
        // Keep Local button active; show format-error with "Open in another player"
        // This path is handled by existing probeError logic — no mode change
      } else {
        // Other HTTP error — treat as unavailable
        showError(t('pb_hosted_no')); // fallback message
      }
    })
    .catch(err => {
      // Network failure — assume local missing
      pframe.dataset.localMissing = 'true';
      const localBtn = document.querySelector('.pb-local');
      if (localBtn) {
        localBtn.disabled = true;
        localBtn.querySelector('.pb-label').textContent = t('pb_local_no');
      }
      showError(t('pb_yt_no'));
    });
}

// Attach mode-switch handlers on DOMContentLoaded or lesson render
document.addEventListener('click', e => {
  const btn = e.target.closest('.pb-mode');
  if (!btn) return;
  e.preventDefault();
  const mode = btn.dataset.mode;
  if (!mode) return;

  // Guard: don’t switch if disabled
  if (btn.disabled) return;

  setPlayMode(mode);

  // Special case: Hosted mode — no player, just notify and revert
  if (mode === 'hosted') {
    const notice = document.getElementById('notice');
    if (notice) {
      notice.textContent = t('pb_hosted_no');
      notice.hidden = false;
      notice.setAttribute('aria-live', 'polite');
      // Auto-revert to local after 3s, or require manual click
      setTimeout(() => {
        if (document.querySelector('.pb-mode[data-mode="local"]') && 
            !document.querySelector('.pb-mode[data-mode="local"]').disabled) {
          setPlayMode('local');
        }
      }, 3000);
    }
  }
});

// Guard paintCap and syncTx against missing video element
function paintCap(caption) {
  const vid = document.getElementById('vid');
  if (!vid) return;
  // ... existing caption painting logic
}

function syncTx(time) {
  const vid = document.getElementById('vid');
  if (!vid) return;
  // ... existing transcript sync logic
}
```

```js
// (3) S.ar and S.en additions

// In S.ar (Arabic strings object):
pb_yt: 'مشاهدة على يوتيوب داخل التطبيق',
pb_hosted: 'النسخة المستضافة',
pb_local: 'الملف المحلي',
pb_local_no: 'الملف المحلي غير متاح',
pb_yt_no: 'يوتيوب غير متاح، جرب الملف المحلي',
pb_hosted_no: 'النسخة المستضافة غير متاحة بعد',

// In S.en (English strings object):
pb_yt: 'Watch on YouTube in-app',
pb_hosted: 'Hosted Version',
pb_local: 'Local File',
pb_local_no: 'Local file unavailable',
pb_yt_no: 'YouTube unavailable, try local file',
pb_hosted_no: 'Hosted version not available yet',
```

```css
/* (4) CSS additions */

/* Playback mode switch buttons */
.pb-mode {
  font-size: 0.875rem;
  padding: 0.375rem 0.75rem;
  margin: 0 0.25rem;
  border-radius: 0.25rem;
  transition: all 0.15s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
}
.pb-mode:focus {
  outline: 2px solid #0066cc;
  outline-offset: 2px;
}
.pb-mode:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.pb-mode.active {
  box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.25);
}
.pb-mode .pb-label {
  line-height: 1;
}

/* YouTube mode button */
.pb-yt {
  background-color: #ff0000;
  color: white;
  border-color: #cc0000;
}
.pb-yt:hover:not(:disabled) {
  background-color: #cc0000;
  border-color: #990000;
}
.pb-yt:active:not(:disabled) {
  background-color: #990000;
}

/* Hosted mode button */
.pb-hosted {
  background-color: #4a6fa5;
  color: white;
  border-color: #3a5a80;
}
.pb-hosted:hover:not(:disabled) {
  background-color: #3a5a80;
  border-color: #2a4a6f;
}
.pb-hosted:active:not(:disabled) {
  background-color: #2a4a6f;
}

/* Local mode button */
.pb-local {
  background-color: #28a745;
  color: white;
  border-color: #1e7e34;
}
.pb-local:hover:not(:disabled) {
  background-color: #1e7e34;
  border-color: #176b2b;
}
.pb-local:active:not(:disabled) {
  background-color: #176b2b;
}

/* Responsive spacing */
@media (max-width: 480px) {
  .pb-mode {
    padding: 0.25rem 0.5rem;
    font-size: 0.8125rem;
  }
}

/* YouTube iframe container — ensure aspect ratio & responsiveness */
#pframe > .stage > iframe {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
}

/* Ensure stage maintains aspect ratio for iframe/video */
#pframe > .stage {
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: 56.25%; /* 16:9 */
  overflow: hidden;
}
#pframe > .stage > video,
#pframe > .stage > iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

/* Hide caption button in YT mode */
#capBtn[hidden] {
  display: none;
}

/* Transcript panel visibility override — always visible */
#txPanel {
  display: block !important;
}
#txPanel[hidden] {
  display: block !important;
}
```