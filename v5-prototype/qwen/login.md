```html
<!-- (1) body.html replacement for the enter button block -->
<div id="splash" class="sp-splash">
  <div class="sp-verse"></div>
  <div class="sp-sheikh"></div>
  <div class="sp-actions">
    <button id="enterBtn" class="sp-enter sp-guest">t(lg_guest)</button>
    <button id="signinBtn" class="sp-enter sp-signin">t(lg_email)</button>
  </div>
  <div id="signinForm" class="sp-form" style="display:none;">
    <div class="sp-form-group">
      <label class="sp-lbl" for="emailInput">t(lg_email_l)</label>
      <input id="emailInput" type="email" autocomplete="username" inputmode="email" class="sp-input" required>
    </div>
    <div class="sp-form-group">
      <label class="sp-lbl" for="passInput">t(lg_pass_l)</label>
      <input id="passInput" type="password" autocomplete="current-password" inputmode="text" class="sp-input" required>
    </div>
    <button id="submitBtn" class="sp-enter sp-submit">t(lg_submit)</button>
    <button id="cancelBtn" class="sp-enter sp-cancel">t(lg_guest)</button>
  </div>
</div>
```

```javascript
// (2) S.ar and S.en additions
// Add to S.ar object:
lg_guest: 'دخول كضيف',
lg_email: 'الدخول بالبريد الإلكتروني',
lg_email_l: 'البريد الإلكتروني',
lg_pass_l: 'كلمة المرور',
lg_submit: 'تسجيل الدخول',
lg_noconfig: 'هذه الميزة غير متاحة حالياً. يرجى استخدام خيار الضيف أو التحقق لاحقاً.',
lg_signedin: 'مسجل الدخول باسم: {email}',
lg_signout: 'تسجيل الخروج',
lg_bad: 'بيانات الدخول غير صحيحة',

// Add to S.en object:
lg_guest: 'Enter as Guest',
lg_email: 'Sign in with Email',
lg_email_l: 'Email Address',
lg_pass_l: 'Password',
lg_submit: 'Sign In',
lg_noconfig: 'This feature is currently unavailable. Please use the guest option or check back later.',
lg_signedin: 'Signed in as: {email}',
lg_signout: 'Sign Out',
lg_bad: 'Incorrect email or password',
```

```javascript
// (3) app.js additions and the exact splash() wiring changes
// Add at top of IIFE (after S, K, load/store definitions):
let supabaseConfig = { url: '', anonKey: '' };
let isSupabaseReady = false;

// Load Supabase config at boot — tolerate failure
fetch('Preview/assets/supabase-config.json')
  .then(res => res.ok ? res.json() : Promise.reject())
  .then(config => {
    if (config && typeof config === 'object') {
      supabaseConfig.url = String(config.url || '').trim();
      supabaseConfig.anonKey = String(config.anonKey || '').trim();
      isSupabaseReady = !!supabaseConfig.url && !!supabaseConfig.anonKey;
    }
  })
  .catch(() => {
    // Silent failure tolerated
  });

// Add new K key
K.acct = 'archive-v5-account';

// Replace existing splash() function entirely:
function splash() {
  const splashEl = document.getElementById('splash');
  const enterBtn = document.getElementById('enterBtn');
  const signinBtn = document.getElementById('signinBtn');
  const signinForm = document.getElementById('signinForm');
  const emailInput = document.getElementById('emailInput');
  const passInput = document.getElementById('passInput');
  const submitBtn = document.getElementById('submitBtn');
  const cancelBtn = document.getElementById('cancelBtn');

  // Check for existing account on load
  const acct = load(K.acct);
  if (acct && acct.mode === 'email' && acct.email && acct.access_token) {
    // Skip splash; show signed-in UI immediately
    document.body.classList.add('signed-in');
    updateSignedInHeader(acct.email);
    return;
  }

  // Show splash and wire buttons
  splashEl.style.display = 'block';

  // Guest entry (primary)
  enterBtn.onclick = () => enter(true);

  // Sign-in toggle (secondary)
  signinBtn.onclick = () => {
    if (!isSupabaseReady) {
      alert(t('lg_noconfig'));
      return;
    }
    signinBtn.style.display = 'none';
    enterBtn.style.display = 'none';
    signinForm.style.display = 'block';
    emailInput.focus();
  };

  // Form submission
  submitBtn.onclick = async () => {
    const email = emailInput.value.trim();
    const password = passInput.value;

    if (!email || !password) return;

    try {
      const res = await fetch(`${supabaseConfig.url}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'apikey': supabaseConfig.anonKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (res.status === 200) {
        const data = await res.json();
        if (data.access_token && data.refresh_token && data.expires_in) {
          const expiresAt = Math.floor(Date.now() / 1000) + data.expires_in;
          store(K.acct, {
            mode: 'email',
            email,
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            expires_at: expiresAt
          });
          enter(true);
        } else {
          throw new Error('Invalid auth response');
        }
      } else {
        throw new Error(`HTTP ${res.status}`);
      }
    } catch (err) {
      alert(t('lg_bad'));
      passInput.value = '';
      passInput.focus();
    }
  };

  // Cancel form → back to splash options
  cancelBtn.onclick = () => {
    signinForm.style.display = 'none';
    signinBtn.style.display = 'inline-block';
    enterBtn.style.display = 'inline-block';
  };

  // Keyboard support
  emailInput.onkeydown = e => { if (e.key === 'Enter') submitBtn.click(); };
  passInput.onkeydown = e => { if (e.key === 'Enter') submitBtn.click(); };
}

// Add helper to update header when signed in
function updateSignedInHeader(email) {
  const toolsEl = document.querySelector('.tools'); // assuming existing header tools container
  if (!toolsEl) return;

  // Clear any existing sign-in UI
  const existingSignedIn = toolsEl.querySelector('.signed-in-line');
  if (existingSignedIn) existingSignedIn.remove();

  const signedInEl = document.createElement('div');
  signedInEl.className = 'signed-in-line';
  signedInEl.innerHTML = `<span class="sp-lbl">${esc(t('lg_signedin', { email }))}</span>`;
  toolsEl.insertBefore(signedInEl, toolsEl.firstChild);

  const signoutBtn = document.createElement('button');
  signoutBtn.className = 'sp-enter sp-signout';
  signoutBtn.textContent = t('lg_signout');
  signoutBtn.onclick = () => {
    store(K.acct, null);
    document.body.classList.remove('signed-in');
    if (toolsEl.querySelector('.signed-in-line')) {
      toolsEl.querySelector('.signed-in-line').remove();
    }
    if (toolsEl.querySelector('.sp-signout')) {
      toolsEl.querySelector('.sp-signout').remove();
    }
    splash(); // reload splash
  };
  toolsEl.insertBefore(signoutBtn, toolsEl.firstChild);
}

// Add stub function as required
function syncAccountProgress() {
  // no-op stub; implementation deferred
}

// Ensure splash() is called on initial load — replace any existing call site with:
// splash();
```

```css
/* (4) CSS additions for the form and the two-option layout */
.sp-splash {
  text-align: center;
  padding: 24px;
  max-width: 600px;
  margin: 0 auto;
}

.sp-actions {
  margin: 32px 0;
}

.sp-guest {
  margin-bottom: 12px;
  width: 100%;
  max-width: 320px;
}

.sp-signin {
  width: 100%;
  max-width: 320px;
  background: transparent;
  border: 2px solid var(--accent);
  color: var(--accent);
}

.sp-signin:hover {
  background: rgba(0, 0, 0, 0.05);
}

.sp-form {
  margin-top: 24px;
  width: 100%;
  max-width: 320px;
  margin-left: auto;
  margin-right: auto;
}

.sp-form-group {
  margin-bottom: 16px;
  text-align: right;
}

.sp-lbl {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  font-size: 15px;
  line-height: 1.4;
}

.sp-input {
  width: 100%;
  padding: 14px 16px;
  font-size: 16px;
  line-height: 1.4;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-sizing: border-box;
  min-height: 44px;
}

.sp-input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(0, 128, 255, 0.2);
}

.sp-submit {
  width: 100%;
  margin-bottom: 12px;
}

.sp-cancel {
  width: 100%;
  background: transparent;
  border: 2px solid #999;
  color: #666;
}

.sp-cancel:hover {
  background: rgba(0, 0, 0, 0.05);
}

.signed-in-line {
  display: inline-block;
  margin-left: 16px;
  padding: 8px 12px;
  background: rgba(0, 128, 255, 0.1);
  border-radius: 6px;
  font-size: 14px;
  line-height: 1.4;
}

.sp-signout {
  margin-left: 8px;
  padding: 8px 12px;
  font-size: 14px;
  min-height: 44px;
}

/* RTL overrides */
[dir="rtl"] .sp-form-group {
  text-align: right;
}

[dir="rtl"] .sp-lbl {
  text-align: right;
}

[dir="rtl"] .sp-input {
  text-align: right;
}

/* Touch target minimum */
.sp-enter,
.sp-input {
  min-height: 44px;
}

/* Responsive spacing */
@media (max-width: 480px) {
  .sp-splash {
    padding: 16px;
  }
  .sp-actions {
    margin: 24px 0;
  }
}
```