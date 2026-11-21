1. **body.html** — replace the enter button block (inside `#splash > .sp-stage > .sp-page > .sp-in`, after the verse, cite, ornament and name):
```html
        <button class="sp-enter" id="enterBtn" type="button">
          <svg class="sp-bf" aria-hidden="true"><rect class="d" pathLength="100" width="100%" height="100%" rx="26"/></svg>
          <span class="sp-fill" aria-hidden="true"></span>
          <span class="sp-lbl">ادخل المكتبة <span lang="en" dir="ltr">Enter</span></span>
        </button>
        <button class="sp-enter sp-alt" id="signinBtn" type="button" data-t="lg_email"></button>
        <div id="lgForm" hidden>
          <label for="lgEmail" data-t="lg_email_l"></label>
          <input type="email" id="lgEmail" autocomplete="username" inputmode="email" spellcheck="false" aria-describedby="lgNotice">
          <label for="lgPass" data-t="lg_pass_l"></label>
          <input type="password" id="lgPass" autocomplete="current-password" spellcheck="false" aria-describedby="lgNotice">
          <button class="sp-enter" id="lgSubmit" type="submit" data-t="lg_submit"></button>
          <button class="sp-enter sp-alt" id="lgBack" type="button" data-t="lg_guest"></button>
          <p id="lgNotice" role="status" hidden data-t="lg_noconfig"></p>
        </div>
```

2. **app.js** — add new key to `K` object (after existing keys, before the closing `}`):
```js
    acct: "archive-v5-account",
```

3. **app.js** — patch `splash()` function (replace entire `splash()` body *from the skip check onward*, keeping all prior setup like `anims`, `sp`, `sky`, `Rec`, `$("#main")`, `calm()`, etc., and preserving the exact `onKey`, `enterBtn.addEventListener`, and `setTimeout focus` lines — only inject logic *after* the skip check and *before* the `const enter = ...` definition):
```js
    if (sessionStorage.getItem("archive-v3-entered") === "1" || new URLSearchParams(location.search).get("splash") === "0") {
      const acct = load(K.acct, null);
      if (acct && acct.mode === "email" && acct.access_token) {
        showAcctChip(acct.email);
        return;
      }
      sp.hidden = true;
      document.body.style.overflow = "";
      return;
    }

    const enter = (withVerse) => {
      anims.forEach((a) => { try { a.finish(); } catch (_) {} });
      try { sessionStorage.setItem("archive-v3-entered", "1"); } catch (_) {}
      sp.classList.add("gone");
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", lay);
      setTimeout(() => { sp.hidden = true; sky.innerHTML = ""; }, calm() ? 0 : 520);
      if (withVerse) Rec.play(true); else Rec.stop();
      $("#main").focus({ preventScroll: true });
    };
    const onKey = (e) => { if (e.key === "Escape") enter(false); };
    document.addEventListener("keydown", onKey);
    $("#enterBtn").addEventListener("click", () => enter(true));
    $("#signinBtn").addEventListener("click", () => {
      $("#enterBtn").hidden = true;
      $("#signinBtn").hidden = true;
      $("#lgForm").hidden = false;
      $("#lgEmail").focus({ preventScroll: true });
    });
    $("#lgBack").addEventListener("click", () => {
      $("#lgForm").hidden = true;
      $("#enterBtn").hidden = false;
      $("#signinBtn").hidden = false;
      $("#enterBtn").focus({ preventScroll: true });
    });
    $("#lgSubmit").addEventListener("click", signInEmail);
    setTimeout(() => $("#enterBtn").focus({ preventScroll: true }), 50);
```

4. **app.js** — add `signInEmail()` and `syncAccountProgress()` functions (append *after* `splash()` and *before* any other top-level functions like `paintChrome`, `lay`, etc. — no reordering of existing exports or IIFE closure):
```js
    async function signInEmail() {
      const email = $("#lgEmail").value.trim();
      const pass = $("#lgPass").value.trim();
      if (!email || !pass) return;

      let config;
      try {
        const res = await fetch("Preview/assets/supabase-config.json", { cache: "no-store" });
        config = res.ok ? await res.json() : {};
      } catch (_) {
        config = {};
      }

      if (!config.url || !config.anonKey) {
        $("#lgNotice").hidden = false;
        $("#lgNotice").textContent = t("lg_noconfig");
        return;
      }

      try {
        const res = await fetch(`${config.url}/auth/v1/token?grant_type=password`, {
          method: "POST",
          headers: {
            "apikey": config.anonKey,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ email, password: pass })
        });

        if (res.status === 200) {
          const data = await res.json();
          if (data.access_token) {
            store(K.acct, {
              mode: "email",
              email,
              access_token: data.access_token,
              refresh_token: data.refresh_token,
              expires_at: data.expires_at
            });
            enter(true);
            return;
          }
        }
      } catch (_) {}

      $("#lgNotice").hidden = false;
      $("#lgNotice").textContent = t("lg_bad");
      $("#lgPass").value = "";
      $("#lgPass").focus({ preventScroll: true });
    }

    function syncAccountProgress() {
      // stub: no-op when unconfigured; no network call
    }
```

5. **app.js** — add `showAcctChip(email)` function (append *immediately after* `signInEmail()` and `syncAccountProgress()` above, before next top-level function):
```js
    function showAcctChip(email) {
      const tools = $(".tools");
      const chip = document.createElement("span");
      chip.innerHTML = `<span>${t("lg_signedin", { email })}</span><button type="button" data-t="lg_signout"></button>`;
      chip.className = "acct-chip";
      const btn = chip.querySelector("button");
      btn.addEventListener("click", () => {
        store(K.acct, null);
        location.reload();
      });
      tools.appendChild(chip);
    }
```