// v4 behaviour checks (v3's 14 kept, the recitation check inverted, v4 checks added) in headless Chromium against the real server (requests relayed, see shots.js).
// Usage: node tools/behavior_tests.js http://127.0.0.1:8765
const {
  chromium,
} = require("/home/hatch/workspace/linkedin-posts/node_modules/playwright-core");
const fs = require("fs");
const crypto = require("crypto");
const path = require("path");

const RELAY = process.argv[2];
const ids = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "testroot", "test-ids.json")),
);
const POL =
  "/var/lib/hatch-browser/rootfs-base/usr/share/hatch/chromium/webgl-allowed-domains.txt";
const args = fs.existsSync(POL)
  ? [
      `--hatch-webgl-allowed-domains-file=${POL}`,
      `--hatch-webgl-allowed-domains-sha256=${crypto.createHash("sha256").update(fs.readFileSync(POL)).digest("hex")}`,
    ]
  : [];
let fails = 0;
const check = (name, ok, detail) => {
  fails += !ok;
  console.log((ok ? "PASS " : "FAIL ") + name + " :: " + detail);
};

async function page(browser, opts) {
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    ...(opts || {}),
  });
  const pg = await ctx.newPage();
  // on the context, so a second tab in the same browser is served too
  await ctx.route("http://archive.test/**", async (route) => {
    const r = route.request(),
      u = new URL(r.url());
    const res = await fetch(RELAY + u.pathname + u.search, {
      method: r.method(),
      headers: r.headers().range ? { range: r.headers().range } : {},
    });
    await route.fulfill({
      status: res.status,
      headers: Object.fromEntries(res.headers),
      body: r.method() === "HEAD" ? "" : Buffer.from(await res.arrayBuffer()),
    });
  });
  return pg;
}
const rects = (pg) =>
  pg.evaluate(() =>
    [".brand", "#langSeg", "#nav", "#themeBtn"].map((s) => {
      const r = document.querySelector(s).getBoundingClientRect();
      return [s, Math.round(r.x), Math.round(r.y)];
    }),
  );
const G = "http://archive.test";

(async () => {
  const browser = await chromium.launch({
    executablePath: "/opt/meta-chromium/chrome",
    args: ["--autoplay-policy=no-user-gesture-required", ...args],
  });
  let pg;

  // 1. language switch keeps the RTL chrome fixed
  pg = await page(browser);
  await pg.goto(G + "/?splash=0#/start");
  await pg.evaluate(() => document.fonts.ready);
  await pg.evaluate(() => scrollTo(0, 900));
  const a = await rects(pg);
  await pg.evaluate(() =>
    document.querySelector("#langSeg button[data-lang=en]").click(),
  );
  await pg.waitForTimeout(600);
  const b = await rects(pg);
  const s1 = await pg.evaluate(() => ({
    dir: document.documentElement.dir,
    y: scrollY,
    nav: document.querySelectorAll("#nav a").length,
    navText: [...document.querySelectorAll("#nav a")]
      .map((x) => x.textContent)
      .join("|"),
  }));
  check(
    "chrome does not move on AR->EN",
    JSON.stringify(a) === JSON.stringify(b),
    JSON.stringify(a) + " vs " + JSON.stringify(b),
  );
  check(
    "html stays dir=rtl, scroll kept",
    s1.dir === "rtl" && Math.abs(s1.y - 900) < 5,
    JSON.stringify(s1),
  );
  check("nav has exactly 5 items", s1.nav === 5, s1.navText);
  await pg.context().close();

  // 2. opening: verse + two options (guest first, email sign-in; V5 item 15
  // supersedes the v4 one-button opening); the sign-in form stays hidden
  // until chosen. Enter mid-sequence jumps to the end and enters
  pg = await page(browser);
  await pg.goto(G + "/?splash=1");
  await pg.waitForTimeout(900);
  const op = await pg.evaluate(() => ({
    controls: [
      ...document.querySelectorAll(
        "#splash button, #splash input, #splash select, #splash a, #splash [role=switch]",
      ),
    ].filter((el) => el.offsetParent !== null).length,
    formHidden: document.querySelector("#lgForm").hidden,
    verse: document.querySelector("#spVerse").textContent,
    birds: document.querySelectorAll("#sky .bird").length,
    running: document.getAnimations().filter((x) => x.playState === "running")
      .length,
  }));
  check(
    "opening has exactly five controls (English + Arabic, then sign in + sign up + guest), form hidden",
    op.controls === 5 && op.formHidden,
    JSON.stringify(op),
  );
  check(
    "opening is mid-sequence at 900ms (animations running)",
    op.running > 0,
    "running=" + op.running,
  );
  await pg.click("#enterBtn");
  await pg.waitForTimeout(900);
  const after = await pg.evaluate(() => ({
    hidden: document.querySelector("#splash").hidden,
    entered: JSON.parse(sessionStorage.getItem("archive-v5-entered")),
  }));
  check(
    "Enter mid-sequence enters the library and sets the entered flag in sessionStorage",
    after.hidden && after.entered && after.entered.mode === "guest" && !!after.entered.at,
    JSON.stringify(after),
  );
  // A same-session reload after entering goes straight to the library
  await pg.goto(G + "/#/home");
  await pg.waitForTimeout(900);
  const again = await pg.evaluate(() => ({
    splashHidden: document.querySelector("#splash").hidden,
    main: getComputedStyle(document.querySelector("#main")).visibility,
    home: document.querySelector("#v-home").classList.contains("on"),
    entered: !!sessionStorage.getItem("archive-v5-entered"),
  }));
  check(
    "[r3] guest entered, same-session reload: no opening, the library shows, entered flag kept",
    again.splashHidden && again.main === "visible" && again.home && again.entered,
    JSON.stringify(again),
  );
  await pg.goto(G + "/?splash=1");
  await pg.waitForTimeout(600);
  const forced = await pg.evaluate(() => !document.querySelector("#splash").hidden);
  check("[r3] ?splash=1 still forces the opening after entering", forced, "splash visible=" + forced);
  await pg.context().close();

  // 3. reduced motion: one static, fully composed frame
  pg = await page(browser, { reducedMotion: "reduce" });
  await pg.goto(G + "/?splash=1");
  await pg.waitForTimeout(500);
  const rm = await pg.evaluate(() => ({
    running: document.getAnimations().filter((x) => x.playState === "running")
      .length,
    verseOpacity: getComputedStyle(document.querySelector("#spVerse")).opacity,
    btnOpacity: getComputedStyle(document.querySelector("#enterBtn")).opacity,
  }));
  check(
    "reduced motion: nothing running, verse and button visible",
    rm.running === 0 && rm.verseOpacity === "1" && rm.btnOpacity === "1",
    JSON.stringify(rm),
  );
  await pg.context().close();

  // 4. theme swatches switch live and persist
  pg = await page(browser);
  await pg.goto(G + "/?splash=0#/home");
  await pg.click("#themeBtn");
  await pg.waitForTimeout(300);
  const bg0 = await pg.evaluate(
    () => getComputedStyle(document.body).backgroundColor,
  );
  await pg.click('#swGrid .sw[data-th="parchment"]');
  await pg.waitForTimeout(900);
  const th = await pg.evaluate(() => ({
    theme: document.documentElement.dataset.theme,
    bg: getComputedStyle(document.body).backgroundColor,
    stored: localStorage.getItem("archive-v2-theme"),
    popOpen: !document.querySelector("#themePop").hidden,
    swatches: document.querySelectorAll("#swGrid .sw").length,
  }));
  check(
    "swatch switches theme live without reload",
    th.theme === "parchment" &&
      th.bg !== bg0 &&
      th.stored === '"parchment"' &&
      th.swatches === 6,
    bg0 + " -> " + JSON.stringify(th),
  );
  await pg.context().close();

  // 5. transcript: tap a line jumps the video; the current line highlights
  pg = await page(browser);
  await pg.goto(G + "/?splash=0#/lesson/" + ids.with_subs);
  await pg.waitForSelector(".tx-line[data-cue='1']", { timeout: 8000 });
  await pg.evaluate(() => document.querySelector("#vid").pause());
  await pg.click(".tx-line[data-cue='1']");
  await pg.waitForTimeout(1200);
  const tx = await pg.evaluate(() => ({
    t: document.querySelector("#vid").currentTime,
    now: [...document.querySelectorAll(".tx-line.now")].map(
      (x) => x.dataset.cue,
    ),
  }));
  check(
    "tapping transcript line 2 jumps the video to 0:05 and highlights it",
    tx.t >= 5 && tx.t < 8 && tx.now.join() === "1",
    JSON.stringify(tx),
  );
  await pg.context().close();

  // 6. 404: human message, raw path only behind a Details disclosure
  pg = await page(browser);
  await pg.goto(G + "/?splash=0#/lesson/" + ids.missing);
  await pg.waitForTimeout(3000);
  const e = await pg.evaluate(() => {
    const d = document.querySelector("#v-lesson details");
    return {
      text: document.querySelector("#v-lesson").innerText.slice(0, 2000),
      hasDetails: !!d,
      open: d && d.open,
      codeInDetails: !!(d && d.querySelector("code")),
      codeOutside: [...document.querySelectorAll("#v-lesson code")].filter(
        (c) => !c.closest("details"),
      ).length,
    };
  });
  check(
    "404 shows the human message with a closed Details disclosure",
    /غير موجود على هذا الجهاز/.test(e.text) &&
      e.hasDetails &&
      !e.open &&
      e.codeInDetails &&
      e.codeOutside === 0,
    JSON.stringify({ ...e, text: e.text.slice(0, 80) }),
  );
  await pg.context().close();

  // 7. recitation: present, controls offered, silent until asked
  pg = await page(browser);
  await pg.goto(G + "/?splash=0");
  await pg.waitForTimeout(900);
  const rec = await pg.evaluate(() => ({
    ctlHidden: document.querySelector("#recCtl").hidden,
    status: document.querySelector("#recStatus").textContent,
    paused: document.querySelector("#recAudio").paused,
    src: document.querySelector("#recAudio").getAttribute("src"),
  }));
  check(
    "recitation: controls shown, ready status, silent by default",
    !rec.ctlHidden &&
      rec.status === "تلاوة الآية جاهزة." &&
      rec.paused &&
      !rec.src,
    JSON.stringify(rec),
  );
  await pg.context().close();

  // 8. owner's v2 favorites and progress carry over (same keys)
  pg = await page(browser);
  await pg.addInitScript((id) => {
    if (!localStorage.getItem("seeded")) {
      localStorage.setItem(
        "archive-favorites-v4",
        JSON.stringify({ [id]: Date.now() }),
      );
      localStorage.setItem(
        "archive-progress-v4",
        JSON.stringify({ [id]: 120 }),
      );
      localStorage.setItem("seeded", "1");
    }
  }, ids.with_subs);
  await pg.goto(G + "/?splash=0#/saved");
  await pg.waitForTimeout(900);
  const sv = await pg.evaluate(
    (id) => document.querySelector("#v-saved").innerHTML.includes(id),
    ids.with_subs,
  );
  check("v2 favorite (archive-favorites-v4) shows on Saved", sv, "found=" + sv);
  await pg.context().close();

  // 9. sort is one disclosure button (default series order) and remembers the choice across reloads
  pg = await page(browser);
  await pg.goto(G + "/?splash=0#/playlist/PLXKSrZvHoN9cmAY-O5kHl5JBsujbnpfIU");
  await pg.waitForTimeout(800);
  const s0 = await pg.evaluate(() => ({
    n: document.querySelectorAll("#v-playlist .sortd").length,
    selects: document.querySelectorAll("#v-playlist select").length,
    checked: document.querySelector("#v-playlist .sortd [aria-checked=true]")
      .dataset.sort,
  }));
  await pg.click("#v-playlist .sortd > button");
  const opts = await pg.$$eval("#v-playlist .sortd [data-sort]", (bs) =>
    bs.map((x) => x.dataset.sort),
  );
  const pick = opts.find((o) => o !== s0.checked);
  await pg.click(`#v-playlist .sortd [data-sort="${pick}"]`);
  await pg.waitForTimeout(500);
  await pg.reload();
  await pg.waitForTimeout(900);
  const s2 = await pg.evaluate(
    () =>
      document.querySelector("#v-playlist .sortd [aria-checked=true]").dataset
        .sort,
  );
  check(
    "one Sort disclosure, default first, choice remembered after reload",
    s0.n === 1 && s0.selects === 0 && s2 === pick,
    JSON.stringify({ ...s0, opts, pick, afterReload: s2 }),
  );
  await pg.context().close();

  // 10. offline: the browser is offline and every non-archive request is refused; the page still works
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    offline: true,
  });
  pg = await ctx.newPage();
  const ext = [];
  await pg.route("**/*", async (route) => {
    const r = route.request(),
      u = new URL(r.url());
    if (u.origin !== G) {
      ext.push(r.url());
      return route.abort();
    }
    const res = await fetch(RELAY + u.pathname + u.search, {
      method: r.method(),
    });
    await route.fulfill({
      status: res.status,
      headers: Object.fromEntries(res.headers),
      body: r.method() === "HEAD" ? "" : Buffer.from(await res.arrayBuffer()),
    });
  });
  const errs = [];
  pg.on("pageerror", (x) => errs.push(x.message));
  await pg.goto(G + "/?splash=0#/home");
  await pg.waitForTimeout(1500);
  const off = await pg.evaluate(() => ({
    online: navigator.onLine,
    cards: document.querySelectorAll("#v-home article, #v-home .pcard").length,
    font:
      document.fonts.check("16px 'Noto Sans Arabic'") &&
      [...document.fonts].filter((f) => f.status === "loaded").length,
  }));
  check(
    "offline: page renders, fonts load locally, zero external requests",
    !off.online &&
      off.cards > 10 &&
      off.font > 0 &&
      ext.length === 0 &&
      errs.length === 0,
    JSON.stringify({ ...off, ext: ext.length, errs }),
  );
  await ctx.close();

  const audio = (pg) =>
    pg.evaluate(() => {
      const a = document.querySelector("#recAudio");
      return {
        paused: a.paused,
        t: +a.currentTime.toFixed(2),
        src: a.getAttribute("src"),
        dur: +(a.duration || 0).toFixed(1),
      };
    });

  // 11. Enter on the opening plays the verse; a lesson video starting stops it (never overlap)
  pg = await page(browser);
  await pg.goto(G + "/?splash=1");
  await pg.waitForTimeout(1200);
  await pg.click("#enterBtn");
  await pg.waitForTimeout(2500);
  const r1 = await audio(pg);
  check(
    "Enter plays the recitation",
    !r1.paused &&
      r1.t > 0.5 &&
      r1.src === "Preview/assets/recitation.mp3" &&
      r1.dur > 20 &&
      r1.dur < 22,
    JSON.stringify(r1),
  );
  await pg.evaluate(
    (id) => (location.hash = "#/lesson/" + id),
    ids.playable[1],
  );
  await pg.waitForSelector("#vid");
  await pg.waitForTimeout(600);
  await pg.evaluate(() => document.querySelector("#vid").play());
  await pg.waitForTimeout(1200);
  const r2 = await audio(pg);
  const v2 = await pg.evaluate(() => ({
    paused: document.querySelector("#vid").paused,
    t: document.querySelector("#vid").currentTime,
  }));
  check(
    "lesson video starting stops the recitation",
    r2.paused && r2.t === 0 && !v2.paused && v2.t > 0,
    JSON.stringify({ rec: r2, vid: v2 }),
  );
  await pg.click("#recPlay");
  await pg.waitForTimeout(900);
  const r3 = await audio(pg);
  const v3 = await pg.evaluate(() => document.querySelector("#vid").paused);
  check(
    "pressing play on the recitation pauses the lesson video",
    !r3.paused && v3,
    JSON.stringify({ rec: r3, vidPaused: v3 }),
  );
  await pg.click("#recPlay");
  await pg.waitForTimeout(300);
  const r4 = await audio(pg);
  await pg.click("#recMute");
  const muted = await pg.evaluate(
    () => document.querySelector("#recAudio").muted,
  );
  check(
    "recitation pause and mute controls work",
    r4.paused && muted,
    JSON.stringify({ ...r4, muted }),
  );
  await pg.context().close();

  // 12. skipping the opening (Escape) never starts the voice
  pg = await page(browser);
  await pg.goto(G + "/?splash=1");
  await pg.waitForTimeout(800);
  await pg.keyboard.press("Escape");
  await pg.waitForTimeout(1500);
  const r5 = await audio(pg);
  const gone = await pg.evaluate(
    () => document.querySelector("#splash").hidden,
  );
  check(
    "skip (Escape) enters silently",
    r5.paused && !r5.src && gone,
    JSON.stringify({ ...r5, gone }),
  );
  await pg.context().close();

  // 13. Scholars section gone; Bayoun's Aqeeda series still reachable by library, search and URL
  const IMAD = "PLXKSrZvHoN9dOyWCCK6Qm8AS4blW3Ylwm";
  pg = await page(browser);
  await pg.goto(G + "/?splash=0#/home");
  await pg.waitForTimeout(1200);
  const home = await pg.evaluate(
    (id) => ({
      sch: document.querySelectorAll("#v-home .sch, #v-home .mono").length,
      heading: /العلماء/.test(
        [...document.querySelectorAll("#v-home h2")]
          .map((h) => h.textContent)
          .join("|"),
      ),
      imadLink: !!document.querySelector(`#v-home a[href*="${id}"]`),
      imadName: /عماد/.test(document.querySelector("#v-home").innerText),
    }),
    IMAD,
  );
  check(
    "home has no Scholars section and no Bayoun rail card",
    !home.sch && !home.heading && !home.imadLink && !home.imadName,
    JSON.stringify(home),
  );
  await pg.goto(G + "/?splash=0#/library?pillar=beliefs");
  await pg.waitForTimeout(900);
  const lib = await pg.evaluate(
    (id) => !!document.querySelector(`#v-library [data-k="${id}"]`),
    IMAD,
  );
  const reach = { libraryPillar: lib };
  for (const q of ["عماد", "Bayoun", "عقيدة"]) {
    await pg.goto(G + "/?splash=0#/library?q=" + encodeURIComponent(q));
    await pg.waitForTimeout(900);
    reach[q] = await pg.evaluate(
      (id) => !!document.querySelector(`#v-library [data-k="${id}"]`),
      IMAD,
    );
  }
  await pg.goto(G + "/?splash=0#/playlist/" + IMAD);
  await pg.waitForTimeout(900);
  reach.url = await pg.evaluate(() => ({
    h1: document.querySelector("#v-playlist h1").textContent,
    by: document.querySelector("#v-playlist .ph .eyebrow").textContent,
    eps: document.querySelectorAll("#plGrid .lcard").length,
  }));
  check(
    "Bayoun series reachable: Beliefs pillar, search (3 terms), direct URL with byline",
    Object.values(reach).every(Boolean) &&
      /عماد/.test(reach.url.by) &&
      reach.url.eps > 0,
    JSON.stringify(reach),
  );
  await pg.context().close();

  // 14. Arabic plurals and numerals: no wrong count forms on any main screen; durations Arabic-Indic
  pg = await page(browser);
  const bad = [];
  const BAD =
    /(?:^|[^٠-٩])(?:[٢-٩]|١٠)\s(?:درسًا|سلسلة|نتيجة|دقيقة|ملفًا|ساعة)(?![؀-ۿ])|(?:^|[^٠-٩])٢\s(?:دروس|درس|سلاسل|نتائج|دقائق)/;
  for (const r of [
    "#/home",
    "#/library",
    "#/library?scope=all",
    "#/start",
    "#/about",
    "#/about/sheikh",
    "#/library?q=" + encodeURIComponent("عماد"),
  ]) {
    await pg.goto(G + "/?splash=0" + r);
    await pg.waitForTimeout(1100);
    const txt = await pg.evaluate(
      () => document.querySelector(".view.on").innerText,
    );
    txt
      .split("\n")
      .forEach(
        (l) => BAD.test(l) && bad.push(r + " :: " + l.trim().slice(0, 60)),
      );
  }
  await pg.goto(G + "/?splash=0#/library?scope=all");
  await pg.waitForTimeout(1000);
  const chips = await pg.$$eval("#v-library .lcard .chip", (c) =>
    c.slice(0, 40).map((x) => x.textContent),
  );
  const latin = chips.filter((c) => /[0-9]/.test(c));
  const forms = await pg.evaluate(() => {
    const out = {};
    for (const p of DATA.playlists) {
      const n = p.items.length;
      const k = n === 2 ? "two" : n >= 3 && n <= 10 ? "few" : null;
      if (k && !out[k]) out[k] = p.id;
    }
    return out;
  });
  const seen = {};
  for (const [k, id] of Object.entries(forms)) {
    await pg.goto(G + "/?splash=0&f=" + k + "#/playlist/" + id);
    await pg.waitForFunction(
      () =>
        [...document.querySelectorAll("#v-playlist .ph .facts .pill")].some(
          (x) => /درو?س/.test(x.textContent),
        ),
      null,
      { timeout: 8000 },
    );
    seen[k] = await pg.evaluate(() =>
      [...document.querySelectorAll("#v-playlist .ph .facts .pill")]
        .map((x) => x.textContent)
        .find((x) => /درو?س/.test(x)),
    );
  }
  check(
    "no wrong Arabic plural forms on 7 screens",
    bad.length === 0,
    bad.length ? bad.slice(0, 5).join(" | ") : "0 bad lines",
  );
  check(
    "dual and 3-10 forms render (درسان / ٣-١٠ دروس)",
    (!forms.two || seen.two === "درسان") &&
      (!forms.few || /^[٣-٩١٠]+ دروس$/.test(seen.few)),
    JSON.stringify(seen),
  );
  check(
    "Arabic durations use Arabic-Indic digits",
    chips.length > 10 && latin.length === 0,
    `${chips.length} chips, latin: ${latin.slice(0, 3)}`,
  );
  await pg.context().close();

  // 15. search with matching lessons but no series: no contradiction, lessons are the primary action
  pg = await page(browser);
  const probe = await (async () => {
    await pg.goto(G + "/?splash=0#/library");
    await pg.waitForTimeout(800);
    // a word from a lesson title that is in no series title
    return pg.evaluate(() => {
      const norm = (x) => x.toLowerCase();
      const pt = DATA.playlists
        .map((p) => norm(p.title + " " + (p.titleEn || "")))
        .join(" ");
      for (const v of DATA.videos)
        for (const w of v.title.split(/\s+/))
          if (w.length > 5 && !pt.includes(norm(w)) && !/[#\[\]()]/.test(w))
            return w;
    });
  })();
  await pg.goto(G + "/?splash=0#/library?q=" + encodeURIComponent(probe));
  await pg.waitForTimeout(1000);
  const nr = await pg.evaluate(() => {
    const e = document.querySelector("#v-library .empty");
    return {
      h1: document.querySelector("#v-library h1").textContent,
      empty: e && e.innerText,
      primary:
        e &&
        e.querySelector(".btn.primary") &&
        e.querySelector(".btn.primary").getAttribute("href"),
      btns: e ? e.querySelectorAll(".btn").length : 0,
      zeroCount: !!document.querySelector("#v-library .lib-h .cnt"),
      scopeLine: !!document.querySelector("#libRes .scope"),
      framed: e && e.classList.contains("framed"),
    };
  });
  check(
    "no series but N lessons: one honest message, Show lessons primary, Browse second",
    nr.empty &&
      /لا توجد سلاسل مطابقة/.test(nr.empty) &&
      !/لا توجد نتائج/.test(nr.empty) &&
      /scope=all/.test(nr.primary) &&
      nr.btns === 2 &&
      !nr.scopeLine &&
      !nr.zeroCount &&
      nr.h1 === "نتائج البحث" &&
      nr.framed,
    JSON.stringify({ probe, ...nr }),
  );
  await pg.goto(
    G + "/?splash=0#/library?q=" + encodeURIComponent("zzqqxxnotaword"),
  );
  await pg.waitForTimeout(1000);
  const nr2 = await pg.evaluate(() => {
    const e = document.querySelector("#v-library .empty");
    return {
      text: e && e.innerText,
      links: e ? [...e.querySelectorAll(".btn")].map((b) => b.textContent) : [],
    };
  });
  check(
    "true no-results: clear search plus quiet Browse the library",
    nr2.text &&
      /لا توجد نتائج مطابقة/.test(nr2.text) &&
      nr2.links.length === 2 &&
      nr2.links.includes("تصفح المكتبة"),
    JSON.stringify(nr2),
  );
  await pg.context().close();

  // 16. error screens: the dead native player is gone, the designed empty state takes its place
  for (const [kind, id] of [
    ["404", ids.missing],
    ["format", ids.corrupt],
  ]) {
    pg = await page(browser);
    await pg.goto(G + "/?splash=0#/lesson/" + id);
    await pg.waitForTimeout(3500);
    const er = await pg.evaluate(() => ({
      err: document.querySelector("#pframe").classList.contains("err"),
      videoShown:
        getComputedStyle(document.querySelector("#vid")).display !== "none",
      emblem:
        getComputedStyle(document.querySelector("#stageEmpty")).display !==
          "none" && !!document.querySelector("#stageEmpty .se-kh"),
      msg: document.querySelector("#stageMsg").innerText.slice(0, 60),
    }));
    check(
      `${kind}: player hidden, khatam empty state with the notice`,
      er.err && !er.videoShown && er.emblem && er.msg.length > 10,
      JSON.stringify(er),
    );
    await pg.context().close();
  }

  // 17. mark as watched: toggles, persists across reload, and marks the card
  pg = await page(browser);
  await pg.goto(G + "/?splash=0#/lesson/" + ids.missing);
  await pg.waitForSelector("[data-done]");
  await pg.click("#lsInfo [data-done]");
  await pg.reload();
  await pg.waitForSelector("[data-done]");
  const mw = await pg.evaluate(
    (id) => ({
      pressed: document
        .querySelector("#lsInfo [data-done]")
        .getAttribute("aria-pressed"),
      label: document.querySelector("#lsInfo [data-done]").textContent,
      stored: JSON.parse(localStorage.getItem("archive-v2-done") || "{}")[id],
    }),
    ids.missing,
  );
  await pg.click("#lsInfo [data-done]");
  const mw2 = await pg.evaluate(
    (id) => ({
      pressed: document
        .querySelector("#lsInfo [data-done]")
        .getAttribute("aria-pressed"),
      stored:
        JSON.parse(localStorage.getItem("archive-v2-done") || "{}")[id] || 0,
    }),
    ids.missing,
  );
  check(
    "mark as watched persists across reload and can be undone",
    mw.pressed === "true" &&
      mw.stored === 1 &&
      mw.label === "شاهدتَه" &&
      mw2.pressed === "false" &&
      !mw2.stored,
    JSON.stringify({ mw, mw2 }),
  );
  await pg.context().close();

  // 18. motion: entrances, drawn lines and the golden thread run; Calm shows final frames with nothing running
  pg = await page(browser);
  await pg.goto(G + "/?splash=0#/home");
  await pg.waitForTimeout(250);
  await pg.evaluate(() => scrollTo(0, 700));
  await pg.waitForTimeout(150);
  const mo = await pg.evaluate(() => ({
    rise: document.querySelectorAll("#v-home .rise").length,
    drawing: document.querySelectorAll("#v-home .medal.drawing").length,
    running: document.getAnimations().filter((a) => a.playState === "running")
      .length,
  }));
  check(
    "home: staggered card entrances and a drawing divider",
    mo.rise > 0 && mo.drawing > 0 && mo.running > 0,
    JSON.stringify(mo),
  );
  await pg.goto(G + "/?splash=0#/lesson/" + ids.with_subs);
  // the sample transcript has two cues (0 and 1); tap the second
  await pg.waitForSelector(".tx-line[data-cue='1']", { timeout: 8000 });
  await pg.evaluate(() => document.querySelector("#vid").pause());
  await pg.click(".tx-line[data-cue='1']");
  await pg.waitForTimeout(600);
  const gt = await pg.evaluate(() => {
    const b = document.querySelector(".tx-bar"),
      l = document.querySelector(".tx-line.now");
    return {
      on: b.classList.contains("on"),
      y: b.style.transform,
      lineTop: l && l.offsetTop,
      h: b.style.height,
      wash:
        document.querySelector(".tx-line.wash") &&
        document.querySelector(".tx-line.wash").dataset.cue,
    };
  });
  check(
    "golden thread: bar sits on the tapped line, line washes gold",
    gt.on &&
      gt.y === `translateY(${gt.lineTop}px)` &&
      parseFloat(gt.h) > 10 &&
      gt.wash === "1",
    JSON.stringify(gt),
  );
  await pg.context().close();
  for (const mode of ["calm", "reduce"]) {
    pg = await page(
      browser,
      mode === "reduce" ? { reducedMotion: "reduce" } : {},
    );
    await pg.goto(
      G + "/?splash=0" + (mode === "calm" ? "&calm=1" : "") + "#/home",
    );
    await pg.waitForTimeout(400);
    await pg.evaluate(() => scrollTo(0, 1600));
    await pg.waitForTimeout(400);
    const cm = await pg.evaluate(() => ({
      pend: [...document.querySelectorAll(".pend")].filter(
        (e) => getComputedStyle(e).opacity !== "1",
      ).length,
      running: document
        .getAnimations()
        .filter(
          (a) =>
            a.playState === "running" &&
            a.effect &&
            a.effect.getComputedTiming().duration > 1 &&
            a.effect.getComputedTiming().iterations !== Infinity,
        ).length,
      medalKh: [...document.querySelectorAll("#v-home .medal .kh")].every(
        (k) => getComputedStyle(k).opacity !== "0",
      ),
    }));
    check(
      `${mode}: no hidden pending elements, no finite animations running, dividers drawn`,
      cm.pend === 0 && cm.running === 0 && cm.medalKh,
      JSON.stringify(cm),
    );
    await pg.context().close();
  }

  // 19. missing videos folder: one calm Library banner, dismissible
  pg = await page(browser);
  await pg.route("http://archive.test/__status", (r) =>
    r.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        videos_exists: false,
        videos_count: 0,
        recitation: true,
      }),
    }),
  );
  await pg.goto(G + "/?splash=0#/library");
  await pg.waitForTimeout(1200);
  const bn = await pg.evaluate(() => ({
    n: document.querySelectorAll("#v-library .banner").length,
    text:
      document.querySelector("#v-library .banner") &&
      document.querySelector("#v-library .banner").innerText.slice(0, 50),
    role: document.querySelector("#v-library .banner [role=alert]"),
  }));
  await pg.click("#bannerHide");
  await pg.goto(G + "/?splash=0#/home");
  await pg.goto(G + "/?splash=0#/library");
  await pg.waitForTimeout(700);
  const bn2 = await pg.evaluate(
    () => document.querySelectorAll("#v-library .banner").length,
  );
  check(
    "missing folder: one calm banner on Library, hidden after Hide",
    bn.n === 1 && /ليست على هذا الجهاز/.test(bn.text) && bn2 === 0,
    JSON.stringify({ ...bn, afterHide: bn2 }),
  );
  await pg.context().close();

  // 20. forty days: the quiet terminus line appears only when all 40 are done, and Start again resets
  pg = await page(browser);
  await pg.addInitScript(() => {
    if (!sessionStorage.getItem("seeded")) {
      const d = {};
      for (let i = 1; i <= 40; i++) d[i] = 1;
      localStorage.setItem("archive-v3-days", JSON.stringify(d));
      sessionStorage.setItem("seeded", "1");
    }
  });
  await pg.goto(G + "/?splash=0#/start?at=days");
  await pg.waitForTimeout(1000);
  const de = await pg.evaluate(() => ({
    line:
      document.querySelector("#v-start .days-end") &&
      document.querySelector("#v-start .days-end").innerText,
  }));
  await pg.click("#v-start [data-days-reset]");
  await pg.waitForTimeout(500);
  const de2 = await pg.evaluate(() => ({
    line: !!document.querySelector("#v-start .days-end"),
    stored: localStorage.getItem("archive-v3-days"),
    checked: document.querySelectorAll("#v-start [data-day]:checked").length,
  }));
  check(
    "40-day terminus shows when complete; Start again clears the ticks",
    /أنهيت الأيام الأربعين/.test(de.line || "") &&
      !de2.line &&
      de2.stored === "{}" &&
      de2.checked === 0,
    JSON.stringify({ de, de2 }),
  );
  await pg.context().close();

  // 21. phone 390px: theme picker and all five nav items inside the screen
  pg = await page(browser, {
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  await pg.goto(G + "/?splash=0#/home");
  await pg.waitForTimeout(800);
  const navR = await pg.$$eval("#nav a", (as) =>
    as.map((a) => {
      const r = a.getBoundingClientRect();
      return [Math.round(r.left), Math.round(r.right)];
    }),
  );
  await pg.click("#themeBtn");
  await pg.waitForTimeout(400);
  const popR = await pg.evaluate(() => {
    const r = document.querySelector("#themePop").getBoundingClientRect();
    const sw = [...document.querySelectorAll("#swGrid .sw")].map((s) =>
      s.getBoundingClientRect(),
    );
    return {
      l: Math.round(r.left),
      r: Math.round(r.right),
      swMin: Math.round(Math.min(...sw.map((x) => x.left))),
      swMax: Math.round(Math.max(...sw.map((x) => x.right))),
    };
  });
  check(
    "390px: five nav items fully visible",
    navR.length === 5 && navR.every(([l, r]) => l >= 0 && r <= 390),
    JSON.stringify(navR),
  );
  check(
    "390px: theme picker and all swatches inside the screen",
    popR.l >= 0 && popR.r <= 390 && popR.swMin >= 0 && popR.swMax <= 390,
    JSON.stringify(popR),
  );
  await pg.context().close();

  // Books (item 4): one card per work, parts nested, native reader links, missing-file state
  pg = await page(browser);
  await pg.goto(G + "/?splash=0#/books");
  await pg.waitForTimeout(1500);
  const bl = await pg.evaluate(() => ({
    cards: document.querySelectorAll("#bkGrid .scard").length,
    // A card is identified by its displayed title + page count: the
    // bilingual (ar-en) editions share the Arabic title of their
    // single-language twin but differ in pages and file, so bare-title
    // uniqueness would flag a real edition as a duplicate (Nov 23 2026).
    titles: [...document.querySelectorAll("#bkGrid .scard")].map((c) => {
      const t = c.querySelector(".stitle");
      const p = c.querySelector(".eyebrow");
      return (t ? t.textContent : "") + " | " + (p ? p.textContent : "");
    }),
    side: null,
  }));
  check(
    "books: 98 works listed, no title+pages twice",
    bl.cards === 98 && new Set(bl.titles).size === bl.titles.length,
    `cards=${bl.cards} unique=${new Set(bl.titles).size}`,
  );
  await pg.goto(G + "/?splash=0#/books?lang=en");
  await pg.waitForTimeout(800);
  const en = await pg.evaluate(
    () => document.querySelectorAll("#bkGrid .scard").length,
  );
  // English tab: 11 English books + 46 bilingual (ar-en) editions + b03,
  // the Arabic Q and A book that carries an English title in the data.
  check("books: language filter English", en === 58, "cards=" + en);
  await pg.goto(G + "/?splash=0#/book/b01");
  await pg.waitForTimeout(1500);
  const d1 = await pg.evaluate(() =>
    [...document.querySelectorAll(".bk-part")].map((li) => ({
      read: li.querySelector('a[target="_blank"]')?.getAttribute("href"),
      open: !!li.querySelector("a[download]"),
      missing: li.textContent.includes("books"),
    })),
  );
  check(
    "books: PhD detail shows 4 parts, each with Read + Open file, none missing",
    d1.length === 4 &&
      d1.every(
        // local mode links books/<file>.pdf; R2 mode links the public
        // bucket URL ending in .pdf — either shape is a real book file
        // (the HTTP suite verifies every part URL actually serves).
        (x) => x.read && x.read.endsWith(".pdf") && x.open && !x.missing,
      ),
    JSON.stringify(d1),
  );
  // a book file absent from this computer shows the calm missing state, no Read button.
  // Local mode: fake the absence by routing the part file to 404. Remote
  // mode: remote files are never HEAD-checked (a public host answers
  // without CORS), so there is no missing case to fake there — instead
  // the Word book (b31, which ships on the public base like the PDFs)
  // must still offer its file for download.
  await pg.goto(G + "/?splash=0#/book/b03");
  await pg.waitForTimeout(1500);
  const b03hrefs = await pg.evaluate(() =>
    [...document.querySelectorAll(".bk-part")].map(
      (li) =>
        li.querySelector('a[target="_blank"]')?.getAttribute("href") || "",
    ),
  );
  const r2mode = b03hrefs.some((h) => h.startsWith("http"));
  if (!r2mode) {
    await pg.route("**/books/Part1_Interior_256pp.pdf", (r) =>
      r.fulfill({ status: 404, body: "" }),
    );
    await pg.goto(G + "/?splash=0#/book/b03");
    await pg.waitForTimeout(1500);
  } else {
    await pg.goto(G + "/?splash=0#/book/b31");
    await pg.waitForTimeout(1500);
  }
  const d3 = await pg.evaluate(() =>
    [...document.querySelectorAll(".bk-part")].map((li) => ({
      read: !!li.querySelector('a[target="_blank"]'),
      text: li.querySelector(".bk-acts").textContent,
    })),
  );
  check(
    r2mode
      ? "books: Word book on the public base still offers its file (no Read button)"
      : "books: missing part shows the missing-file state, the other part stays readable",
    r2mode
      ? d3.length === 1 && !d3[0].read && /افتح/.test(d3[0].text)
      : d3.length === 2 &&
          !d3[0].read &&
          /books/.test(d3[0].text) &&
          d3[1].read,
    JSON.stringify(d3),
  );
  await pg.goto(G + "/?splash=0#/library");
  await pg.waitForTimeout(800);
  const side = await pg.evaluate(
    () => !!document.querySelector('.side a[href="#/books"]'),
  );
  check("books: secondary link in the Library sidebar", side, "link=" + side);
  await pg.goto(G + "/?splash=0#/about/sheikh");
  await pg.waitForTimeout(800);
  const ab = await pg.evaluate(() => ({
    link: !!document.querySelector('#v-about a[href="#/books"]'),
    years: /سنوات النشر|years of publishing/.test(
      document.querySelector("#v-about").textContent,
    ),
    stats: document.querySelectorAll("#v-about .stat").length,
  }));
  check(
    "about: Books link present, years-of-publishing dropped, 2 verified stats",
    ab.link && !ab.years && ab.stats === 2,
    JSON.stringify(ab),
  );
  await pg.context().close();

  // English titles (Nov 22, 2026 translation fix): EN mode shows English
  // series/lesson titles with the Arabic kept as a subtitle on detail pages,
  // English search finds things, and Arabic mode is unchanged.
  pg = await page(browser);
  await pg.goto(G + "/?splash=0#/library");
  await pg.waitForTimeout(800);
  await pg.evaluate(() =>
    document.querySelector("#langSeg button[data-lang=en]").click(),
  );
  await pg.waitForTimeout(800);
  const enLib = await pg.evaluate(() => ({
    stitles: [...document.querySelectorAll("#v-library .stitle")].map(
      (a) => a.textContent,
    ),
  }));
  const AR_RE = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  // The ﷺ ligature is kept in English titles too, so it does not count as Arabic here.
  const hasArabic = (s) => AR_RE.test(s.replace(/ﷺ/g, ""));
  const enArabic = enLib.stitles.filter((s) => hasArabic(s));
  check(
    "EN library: 71 series cards, 70 English + the 1 held title still Arabic",
    enLib.stitles.length === 71 &&
      enArabic.length === 1 &&
      enArabic[0] === "خطب أحوال النفوس وتؤكيتها" &&
      enLib.stitles.includes("Explanation of Sahih al-Bukhari") &&
      enLib.stitles.includes("Friday Sermons") &&
      enLib.stitles.includes("The Prophetic Seerah"),
    `cards=${enLib.stitles.length} arabic=${JSON.stringify(enArabic)} sample=${enLib.stitles.slice(0, 3).join(" | ")}`,
  );
  await pg.goto(
    G + "/?splash=0#/playlist/PLXKSrZvHoN9cf7lGMyZjw0cndaCk004f0",
  );
  await pg.waitForTimeout(1200);
  const enPl = await pg.evaluate(() => ({
    h1: document.querySelector("#v-playlist h1")?.textContent,
    sub: document.querySelector("#v-playlist .ar-sub")?.textContent,
    first: document.querySelector("#v-playlist .ltitle")?.textContent,
  }));
  check(
    "EN playlist: h1 English, Arabic subtitle kept, first lesson English",
    enPl.h1 === "Explanation of Sahih al-Bukhari" &&
      enPl.sub === "شرح صحيح الإمام البخاري" &&
      !!enPl.first &&
      !hasArabic(enPl.first) &&
      /Bukhari/.test(enPl.first),
    JSON.stringify(enPl),
  );
  await pg.goto(G + "/?splash=0#/library?q=" + encodeURIComponent("Seerah"));
  await pg.waitForTimeout(1000);
  const enSe = await pg.evaluate(() => ({
    series: [...document.querySelectorAll("#v-library .stitle")]
      .map((a) => a.textContent)
      .filter((s) => /Seerah/i.test(s)).length,
  }));
  check(
    "EN search 'Seerah' finds series",
    enSe.series >= 1,
    JSON.stringify(enSe),
  );
  // Lessons live in the lessons scope: the series view only shows series
  // cards plus a "N lessons match" note, so search lessons there.
  await pg.goto(
    G + "/?splash=0#/library?scope=all&q=" + encodeURIComponent("Bukhari"),
  );
  await pg.waitForTimeout(1000);
  const enBu = await pg.evaluate(() => ({
    lessons: [...document.querySelectorAll("#v-library .ltitle")]
      .map((a) => a.textContent)
      .filter((s) => /Bukhari/i.test(s)).length,
  }));
  check(
    "EN search 'Bukhari' finds lessons",
    enBu.lessons >= 1,
    JSON.stringify(enBu),
  );
  // Bilingual books (Nov 24, 2026): in English mode a bilingual (ar-en)
  // book shows its English title, with the Arabic kept as a subtitle on
  // its detail page, and the English tab lists it.
  await pg.goto(G + "/?splash=0#/books");
  await pg.waitForTimeout(1000);
  const enBk = await pg.evaluate(() => ({
    b85: document.querySelector('[data-k="b85"] .stitle')?.textContent,
    b84: document.querySelector('[data-k="b84"] .stitle')?.textContent,
  }));
  check(
    "EN books: bilingual b85 and b84 show their English titles",
    enBk.b85 === "The Facilitated Fiqh of Marriage Part One" &&
      enBk.b84 ===
        "Divorce in America, the Rulings of Divorced Women, and From the Rulings of Separation Between Spouses (Divorce Rulings in Civil Courts) Part Twelve",
    JSON.stringify(enBk),
  );
  await pg.goto(G + "/?splash=0#/book/b85");
  await pg.waitForTimeout(1200);
  const enBkD = await pg.evaluate(() => ({
    h1: document.querySelector("#v-book h1")?.textContent,
    sub: document.querySelector('#v-book .bk-h p[lang="ar"]')?.textContent,
  }));
  check(
    "EN book detail: h1 English, Arabic subtitle kept",
    enBkD.h1 === "The Facilitated Fiqh of Marriage Part One" &&
      enBkD.sub === "فقه الزواج الميسر الجزء الأول",
    JSON.stringify(enBkD),
  );
  await pg.goto(G + "/?splash=0#/books?lang=en");
  await pg.waitForTimeout(1000);
  const enBkTab = await pg.evaluate(
    () => document.querySelectorAll("#bkGrid .scard").length,
  );
  check(
    "EN books: English tab lists the bilingual books",
    enBkTab === 58,
    "cards=" + enBkTab,
  );
  await pg.context().close();

  // Arabic mode unchanged: series cards still Arabic
  pg = await page(browser);
  await pg.goto(G + "/?splash=0#/library");
  await pg.waitForTimeout(800);
  const arLib = await pg.evaluate(() => ({
    stitles: [...document.querySelectorAll("#v-library .stitle")].map(
      (a) => a.textContent,
    ),
  }));
  check(
    "AR library: series cards still show Arabic titles",
    arLib.stitles.length === 71 &&
      arLib.stitles.includes("شرح صحيح الإمام البخاري") &&
      arLib.stitles.includes("السيرة النبوية"),
    `cards=${arLib.stitles.length} sample=${arLib.stitles.slice(0, 3).join(" | ")}`,
  );
  await pg.context().close();

  // [new] Opening order (Nov 25 2026): the opening is painted first, the
  // library never shows behind or before it, no button shows ahead of the
  // others, and Sign In takes focus only after its entrance has finished.
  // A per-frame sampler records what every painted frame showed.
  const SAMPLER = () => {
    window.__frames = [];
    const t0 = performance.now();
    const op = (el) => (el ? +getComputedStyle(el).opacity : -1);
    const BTN = ["signinBtn", "signupBtn", "enterBtn"];
    const tick = () => {
      const sp = document.getElementById("splash"),
        main = document.getElementById("main");
      if (sp && main) {
        const stage = sp.querySelector(".sp-stage");
        window.__frames.push({
          t: Math.round(performance.now() - t0),
          splash:
            !sp.hidden &&
            getComputedStyle(sp).display !== "none" &&
            !sp.classList.contains("gone"),
          mainVis: getComputedStyle(main).visibility,
          stageVis: stage ? getComputedStyle(stage).visibility : "none",
          lbl: BTN.map((id) => op(document.querySelector(`#${id} .sp-lbl`))),
          fill: BTN.map((id) => op(document.querySelector(`#${id} .sp-fill`))),
          lang: op(document.getElementById("spLang")),
          verse: op(document.getElementById("spVerse")),
          focus: document.activeElement && document.activeElement.id,
        });
      }
      // The entrance starts when splash() runs, which under load can be
      // seconds after this init script: sample 9s so the ~3.4s entrance
      // and the focus that follows it are inside the window.
      if (performance.now() - t0 < 9000) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const frames = async (opts, url) => {
    const p = await page(browser, opts);
    await p.addInitScript(SAMPLER);
    await p.goto(G + url);
    await p.waitForTimeout(9400);
    const f = await p.evaluate(() => window.__frames);
    await p.context().close();
    return f;
  };
  const spread = (a) => Math.max(...a) - Math.min(...a);
  const fa = await frames({}, "/?splash=1");
  const covered = fa.filter((f) => f.splash && f.mainVis === "hidden");
  check(
    "[new] splash first: every painted frame shows the opening, the library behind it stays hidden",
    fa.length > 20 && covered.length === fa.length,
    `frames=${fa.length} covered=${covered.length} first=${JSON.stringify(fa[0])}`,
  );
  const shown = fa.filter((f) => f.stageVis === "visible");
  const lockstep = shown.every(
    (f) => spread(f.lbl) < 0.02 && spread(f.fill) < 0.02,
  );
  const focused = fa.filter((f) => f.focus === "signinBtn");
  const focusLate = focused.every(
    (f) =>
      f.stageVis === "visible" &&
      f.lbl.every((x) => x === 1) &&
      f.fill.every((x) => x === 1),
  );
  check(
    "[new] no early button: the three buttons enter together, Sign In is focused only after its entrance finished",
    lockstep && focused.length > 0 && focusLate && !!shown.length && shown[0].lbl[0] === 0,
    `shown=${shown.length} lockstep=${lockstep} focusedFrames=${focused.length} firstFocusAt=${focused[0] && focused[0].t}ms lastEntrance=${(shown.find((f) => f.fill.every((x) => x === 1)) || {}).t}ms firstShown=${JSON.stringify(shown[0])}`,
  );
  for (const [mode, opts, url] of [
    ["reduced motion", { reducedMotion: "reduce" }, "/?splash=1"],
    ["calm", {}, "/?splash=1&calm=1"],
  ]) {
    const fc = await frames(opts, url);
    const vis = fc.filter((f) => f.stageVis === "visible");
    const whole = vis.every(
      (f) =>
        f.verse === 1 &&
        f.lang === 1 &&
        f.lbl.every((x) => x === 1) &&
        f.fill.every((x) => x === 1),
    );
    check(
      `[new] ${mode}: the opening is one instant final frame (no early button), library hidden, Sign In focused`,
      fc.length > 20 &&
        fc.every((f) => f.splash && f.mainVis === "hidden") &&
        vis.length > 0 &&
        whole &&
        fc.some((f) => f.focus === "signinBtn"),
      `frames=${fc.length} visible=${vis.length} whole=${whole} first=${JSON.stringify(vis[0])}`,
    );
  }
  const fd = await frames({}, "/?splash=0#/home");
  check(
    "[new] ?splash=0 deep link: the opening is never painted",
    fd.length > 20 && fd.every((f) => !f.splash && f.mainVis === "visible"),
    `frames=${fd.length} first=${JSON.stringify(fd[0])}`,
  );

  // [new] Language first: English / Arabic on the opening switches the opening and the whole site.
  pg = await page(browser);
  await pg.goto(G + "/?splash=1");
  await pg.waitForTimeout(3800);
  const lp0 = await pg.evaluate(() => ({
    order: [...document.querySelectorAll("#splash .sp-in button")]
      .filter((b) => b.offsetParent !== null)
      .map((b) => b.id || b.dataset.lang),
    dir: document.querySelector("#splash").dir,
    lang: document.querySelector("#splash").lang,
  }));
  check(
    "[new] language choice comes first on the opening, before the three choices; Arabic by default",
    lp0.order.join(",") === "en,ar,signinBtn,signupBtn,enterBtn" &&
      lp0.dir === "rtl" &&
      lp0.lang === "ar",
    JSON.stringify(lp0),
  );
  await pg.click('#spLang button[data-lang="en"]');
  await pg.waitForTimeout(500);
  const lp1 = await pg.evaluate(() => ({
    dir: document.querySelector("#splash").dir,
    lang: document.querySelector("#splash").lang,
    signin: document.querySelector("#signinBtn .sp-lbl").textContent,
    guest: document.querySelector("#enterBtn .sp-lbl").textContent,
    pressed: document
      .querySelector('#spLang button[data-lang="en"]')
      .getAttribute("aria-pressed"),
    verseLang: getComputedStyle(document.querySelector("#spVerse")).fontFamily,
    stored: localStorage.getItem("archive-v2-lang"),
  }));
  check(
    "[new] picking English on the opening: opening turns LTR English, choice stored",
    lp1.dir === "ltr" &&
      lp1.lang === "en" &&
      lp1.signin === "Sign In" &&
      /^[\x20-\x7E]+$/.test(lp1.guest) &&
      lp1.pressed === "true" &&
      lp1.stored === '"en"',
    JSON.stringify(lp1),
  );
  await pg.click("#enterBtn");
  await pg.waitForTimeout(1500);
  const lp2 = await pg.evaluate(() => ({
    nav: [...document.querySelectorAll("#nav a")].map((a) => a.textContent),
    seg: document.querySelector("#langSeg").dataset.on,
    title: document.title,
    homeArabic: (document.querySelector("#v-home h1, #v-home h2") || {})
      .textContent,
  }));
  check(
    "[new] after entering, the whole site is in English (nav, title, home)",
    lp2.nav.length === 5 &&
      lp2.nav.every((x) => /^[\x20-\x7E]+$/.test(x)) &&
      lp2.seg === "en" &&
      /Library/.test(lp2.title) &&
      !!lp2.homeArabic &&
      !/[؀-ۿ]/.test(lp2.homeArabic),
    JSON.stringify(lp2),
  );
  await pg.goto(G + "/?splash=1");
  await pg.waitForTimeout(3800);
  await pg.click('#spLang button[data-lang="ar"]');
  await pg.waitForTimeout(500);
  const lp3 = await pg.evaluate(() => ({
    dir: document.querySelector("#splash").dir,
    lang: document.querySelector("#splash").lang,
    signin: document.querySelector("#signinBtn .sp-lbl").textContent,
    stored: localStorage.getItem("archive-v2-lang"),
  }));
  check(
    "[new] picking Arabic switches back: opening RTL Arabic, choice stored",
    lp3.dir === "rtl" &&
      lp3.lang === "ar" &&
      lp3.signin === "تسجيل الدخول" &&
      lp3.stored === '"ar"',
    JSON.stringify(lp3),
  );
  await pg.context().close();
  // ---------- Round 3 (Nov 25 2026) ----------
  const SB = (u) => /\.supabase\.co$/.test(u.hostname);
  const CORS = {
    "access-control-allow-origin": "*",
    "access-control-allow-headers": "*",
    "access-control-allow-methods": "POST, OPTIONS",
  };
  // Every Supabase call is intercepted: the tests never reach the real project.
  const fakeAuth = async (p, status, body) => {
    const calls = [];
    await p.route(SB, async (route) => {
      const r = route.request();
      if (r.method() === "OPTIONS") return route.fulfill({ status: 204, headers: CORS });
      calls.push({ url: r.url(), body: r.postData(), apikey: !!r.headers().apikey });
      await route.fulfill({
        status,
        headers: { ...CORS, "content-type": "application/json" },
        body: JSON.stringify(body),
      });
    });
    return calls;
  };
  const seed = (p, items) =>
    p.evaluate((o) => {
      for (const [k, v] of Object.entries(o)) localStorage.setItem(k, JSON.stringify(v));
    }, items);
  // Same tab, same session: stands in for a reload after entering.
  const seedSession = (p, items) =>
    p.evaluate((o) => {
      for (const [k, v] of Object.entries(o)) sessionStorage.setItem(k, JSON.stringify(v));
    }, items);
  const ENTERED = { "archive-v5-entered": { mode: "email", at: "2026-11-25T00:00:00.000Z" } };
  const ACC = (extra) => ({
    mode: "email",
    email: "reader@example.com",
    access_token: "live-token",
    refresh_token: "live-refresh",
    expires_at: 9999999999,
    ...(extra || {}),
  });

  // Item 1: the opening holds still across a language switch (measured, 1px tolerance)
  const SP_ROWS = ["#spVerse", "#spCite", "#spName", "#spLang", "#signinBtn", "#signupBtn", "#enterBtn"];
  const spRects = (p) =>
    p.evaluate(
      (S) =>
        S.map((s) => {
          const r = document.querySelector(s).getBoundingClientRect();
          return [s, r.top, r.height];
        }),
      SP_ROWS,
    );
  const spDiff = (a, b) =>
    a
      .map((x, i) => [x[0], +(b[i][1] - x[1]).toFixed(2), +(b[i][2] - x[2]).toFixed(2)])
      .filter((d) => Math.abs(d[1]) > 1 || Math.abs(d[2]) > 1);
  for (const vp of [
    { width: 1440, height: 900 },
    { width: 390, height: 844 },
  ]) {
    pg = await page(browser, { viewport: vp });
    await pg.goto(G + "/?splash=1");
    await pg.evaluate(() => document.fonts.ready);
    await pg.waitForTimeout(3800);
    const ar0 = await spRects(pg);
    await pg.click('#spLang button[data-lang="en"]');
    await pg.waitForTimeout(600);
    const en = await spRects(pg);
    const lang = await pg.evaluate(() => document.querySelector("#splash").lang);
    await pg.click('#spLang button[data-lang="ar"]');
    await pg.waitForTimeout(600);
    const ar1 = await spRects(pg);
    const d1 = spDiff(ar0, en),
      d2 = spDiff(ar0, ar1);
    check(
      `[r3] opening holds still on AR->EN->AR at ${vp.width}x${vp.height} (every row top/height within 1px)`,
      lang === "en" && !d1.length && !d2.length,
      `lang=${lang} AR->EN off=${JSON.stringify(d1)} EN->AR off=${JSON.stringify(d2)} ar=${JSON.stringify(ar0.map((r) => [r[0], Math.round(r[1]), Math.round(r[2])]))}`,
    );
    await pg.context().close();
  }

  // Fresh visits always show the opening; only a same-session reload skips it.
  // (a) a device carrying the old forever flag in localStorage gets the opening back
  pg = await page(browser);
  await pg.goto(G + "/?splash=0#/home");
  await seed(pg, ENTERED);
  await pg.evaluate(() => sessionStorage.clear()); // fresh session: nothing in sessionStorage
  await pg.goto(G + "/");
  await pg.waitForTimeout(600);
  const lg = await pg.evaluate(() => ({
    splash: !document.querySelector("#splash").hidden,
    legacy: localStorage.getItem("archive-v5-entered"),
    session: sessionStorage.getItem("archive-v5-entered"),
  }));
  check(
    "[fresh] legacy localStorage entered flag: the opening shows and the legacy flag is removed",
    lg.splash && lg.legacy === null && lg.session === null,
    JSON.stringify(lg),
  );
  await pg.context().close();

  // (b) a fresh visit plays the entrance in sequence: verse, then name and buttons, then the sheen
  pg = await page(browser);
  await pg.goto(G + "/");
  const spSample = () =>
    pg.evaluate(() => {
      const op = (s) => +getComputedStyle(document.querySelector(s)).opacity;
      return {
        t: Math.round(performance.now()),
        running: document.getAnimations().filter((x) => x.playState === "running")
          .length,
        verse: +op("#spVerse").toFixed(2),
        name: +op("#spName").toFixed(2),
        btn: +op("#enterBtn .sp-lbl").toFixed(2),
        sheen: document
          .querySelector("#splash .sp-gold")
          .classList.contains("sheen"),
        hidden: document.querySelector("#splash").hidden,
      };
    });
  await pg.waitForTimeout(900);
  const s09 = await spSample();
  await pg.waitForTimeout(600);
  const s15 = await spSample();
  await pg.waitForTimeout(1100);
  const s26 = await spSample();
  await pg.waitForTimeout(1600);
  const s42 = await spSample();
  check(
    "[fresh] fresh visit plays the entrance in sequence (running at 0.9s, verse low at 1.5s and rising, name/buttons later, verse 1 + sheen at the end)",
    !s09.hidden &&
      s09.running > 0 &&
      s15.verse < 0.2 &&
      s15.name === 0 &&
      s15.btn === 0 &&
      s26.verse > s15.verse &&
      s42.verse === 1 &&
      s42.name === 1 &&
      s42.btn === 1 &&
      s42.sheen,
    JSON.stringify({ s09, s15, s26, s42 }),
  );
  await pg.context().close();

  // (c) ?splash=0 and ?splash=1 together: one decision (first value wins), so the opening is never painted
  const fdup = await frames({}, "/?splash=0&splash=1#/home");
  check(
    "[fresh] ?splash=0&splash=1: the opening is never painted and the library shows (first value wins)",
    fdup.length > 20 && fdup.every((f) => !f.splash && f.mainVis === "visible"),
    `frames=${fdup.length} first=${JSON.stringify(fdup[0])}`,
  );

  // (d) signed in, fresh visit: the opening shows; entering keeps the session and shows the chip
  pg = await page(browser);
  let sbCalls = await fakeAuth(pg, 500, {});
  await pg.goto(G + "/?splash=0#/home");
  await seed(pg, { "archive-v5-account": ACC() });
  await pg.evaluate(() => sessionStorage.clear());
  await pg.goto(G + "/#/home");
  await pg.waitForTimeout(900);
  const sf = await pg.evaluate(() => !document.querySelector("#splash").hidden);
  await pg.click("#enterBtn");
  await pg.waitForTimeout(900);
  const sf2 = await pg.evaluate(() => ({
    splashHidden: document.querySelector("#splash").hidden,
    chip: !!document.querySelector(".acct-chip"),
    token: JSON.parse(localStorage.getItem("archive-v5-account")).access_token,
  }));
  check(
    "[fresh] signed-in fresh visit: the opening shows; Enter as Guest shows the account chip, token intact, no auth call",
    sf &&
      sf2.splashHidden &&
      sf2.chip &&
      sf2.token === "live-token" &&
      sbCalls.length === 0,
    "splash=" + sf + " " + JSON.stringify(sf2) + " calls=" + sbCalls.length,
  );
  await pg.context().close();

  // (e) Item 2 (2): signed in, same-session reload skips the opening and shows the account chip
  pg = await page(browser);
  sbCalls = await fakeAuth(pg, 500, {});
  await pg.goto(G + "/?splash=0#/home");
  await seed(pg, { "archive-v5-account": ACC() });
  await seedSession(pg, ENTERED);
  await pg.goto(G + "/#/home");
  await pg.waitForTimeout(900);
  const si = await pg.evaluate(() => ({
    splashHidden: document.querySelector("#splash").hidden,
    chip: !!document.querySelector(".acct-chip"),
    acctLink: !!document.querySelector('.acct-chip a[href="#/account"]'),
    token: JSON.parse(localStorage.getItem("archive-v5-account")).access_token,
  }));
  check(
    "[r3] signed-in same-session reload: no opening, account chip (with My account link) shown, no auth call",
    si.splashHidden && si.chip && si.acctLink && si.token === "live-token" && sbCalls.length === 0,
    JSON.stringify(si) + " calls=" + sbCalls.length,
  );
  await pg.context().close();

  // (f) real sign-in through the form, then reload, then a new tab in the same browser
  pg = await page(browser);
  sbCalls = await fakeAuth(pg, 200, {
    access_token: "form-token",
    refresh_token: "form-refresh",
    expires_in: 3600,
    user: { id: "u-form" },
  });
  await pg.goto(G + "/");
  await pg.click("#signinBtn");
  await pg.fill("#lgEmail", "reader@example.com");
  await pg.fill("#lgPass", "secret-pass");
  await pg.click("#lgSubmit");
  await pg.waitForFunction(() => document.querySelector("#splash").hidden, null, {
    timeout: 5000,
  });
  await pg.reload();
  await pg.waitForTimeout(900);
  const fr = await pg.evaluate(() => ({
    splashHidden: document.querySelector("#splash").hidden,
    chip: !!document.querySelector(".acct-chip"),
    token: JSON.parse(localStorage.getItem("archive-v5-account")).access_token,
  }));
  const tab = await pg.context().newPage();
  const tabCalls = await fakeAuth(tab, 500, {});
  await tab.goto(G + "/");
  await tab.waitForTimeout(900);
  const ft = await tab.evaluate(() => ({
    splash: !document.querySelector("#splash").hidden,
    running: document.getAnimations().filter((x) => x.playState === "running")
      .length,
    token: JSON.parse(localStorage.getItem("archive-v5-account")).access_token,
  }));
  check(
    "[fresh] form sign-in, reload: no opening, still signed in; new tab: the opening plays, account kept",
    sbCalls.some((c) => /grant_type=password$/.test(c.url)) &&
      fr.splashHidden &&
      fr.chip &&
      fr.token === "form-token" &&
      ft.splash &&
      ft.running > 0 &&
      ft.token === "form-token" &&
      tabCalls.length === 0,
    JSON.stringify({
      fr,
      ft,
      calls: sbCalls.map((c) => c.url),
      tabCalls: tabCalls.length,
    }),
  );
  await pg.context().close();

  // Item 2 (3): an expired session with a refresh token is renewed silently on boot
  pg = await page(browser);
  sbCalls = await fakeAuth(pg, 200, {
    access_token: "fresh-token",
    refresh_token: "fresh-refresh",
    expires_in: 3600,
    token_type: "bearer",
  });
  await pg.goto(G + "/?splash=0#/home");
  await seed(pg, {
    "archive-v5-account": ACC({ access_token: "old-token", refresh_token: "old-refresh", expires_at: 1000 }),
  });
  await seedSession(pg, ENTERED);
  await pg.goto(G + "/#/home");
  await pg.waitForTimeout(1500);
  const rf = await pg.evaluate(() => ({
    acct: JSON.parse(localStorage.getItem("archive-v5-account")),
    splashHidden: document.querySelector("#splash").hidden,
    chip: !!document.querySelector(".acct-chip"),
    now: Math.floor(Date.now() / 1000),
  }));
  check(
    "[r3] expired session + refresh token: renewed on boot via grant_type=refresh_token, user stays signed in",
    sbCalls.length === 1 &&
      /\/auth\/v1\/token\?grant_type=refresh_token$/.test(sbCalls[0].url) &&
      sbCalls[0].apikey &&
      JSON.parse(sbCalls[0].body).refresh_token === "old-refresh" &&
      rf.acct.access_token === "fresh-token" &&
      rf.acct.refresh_token === "fresh-refresh" &&
      rf.acct.expires_at > rf.now &&
      rf.splashHidden &&
      rf.chip,
    JSON.stringify({ calls: sbCalls, acct: rf.acct, splashHidden: rf.splashHidden, chip: rf.chip }),
  );
  await pg.context().close();

  // Item 2 (3b): a failed renewal continues as a guest in the library, with no login error
  pg = await page(browser);
  sbCalls = await fakeAuth(pg, 400, { error: "invalid_grant" });
  await pg.goto(G + "/?splash=0#/home");
  await seed(pg, {
    "archive-v5-account": ACC({ expires_at: 1000 }),
  });
  await seedSession(pg, ENTERED);
  await pg.goto(G + "/#/home");
  await pg.waitForTimeout(1500);
  const rx = await pg.evaluate(() => ({
    acct: localStorage.getItem("archive-v5-account"),
    entered: !!sessionStorage.getItem("archive-v5-entered"),
    splashHidden: document.querySelector("#splash").hidden,
    chip: !!document.querySelector(".acct-chip"),
    notice: document.querySelector("#lgNotice").hidden,
  }));
  check(
    "[r3] failed silent refresh: session cleared, entered flag kept, library as guest, no error shown",
    sbCalls.length === 1 &&
      (rx.acct === null || rx.acct === "null") &&
      rx.entered &&
      rx.splashHidden &&
      !rx.chip &&
      rx.notice,
    JSON.stringify(rx) + " calls=" + sbCalls.length,
  );
  await pg.context().close();

  // Item 2 (4): sign-out clears the session and the entered flag; the opening comes back
  pg = await page(browser);
  await fakeAuth(pg, 500, {});
  await pg.goto(G + "/?splash=0#/home");
  await seed(pg, {
    "archive-v5-account": ACC(),
  });
  await seedSession(pg, ENTERED);
  await pg.goto(G + "/#/home");
  await pg.waitForSelector(".acct-chip button");
  await Promise.all([pg.waitForNavigation(), pg.click(".acct-chip button")]);
  await pg.waitForTimeout(900);
  const so = await pg.evaluate(() => ({
    acct: localStorage.getItem("archive-v5-account"),
    entered: sessionStorage.getItem("archive-v5-entered"),
    legacy: localStorage.getItem("archive-v5-entered"),
    splash: !document.querySelector("#splash").hidden,
  }));
  await pg.goto(G + "/");
  await pg.waitForTimeout(600);
  const so2 = await pg.evaluate(() => !document.querySelector("#splash").hidden);
  check(
    "[r3] sign-out clears the session and the entered flag; the opening shows again",
    so.acct === null && so.entered === null && so.legacy === null && so.splash && so2,
    JSON.stringify(so) + " nextVisitSplash=" + so2,
  );
  await pg.context().close();

  // Item 3: guest on #/account sees the sign-in note with a way back to the opening
  pg = await page(browser);
  await pg.goto(G + "/?splash=0&lang=en#/account");
  await pg.waitForTimeout(600);
  const gu = await pg.evaluate(() => ({
    on: document.querySelector("#v-account").classList.contains("on"),
    note: (document.querySelector("#v-account .empty p") || {}).textContent,
    href: (document.querySelector("#v-account .empty a") || {}).getAttribute?.("href"),
    stats: !!document.querySelector("#acStats"),
  }));
  check(
    "[r3] guest on #/account: sign-in note and a button to the opening (?splash=1), no stats",
    gu.on && gu.note === "Sign in to track your progress." && gu.href === "?splash=1" && !gu.stats,
    JSON.stringify(gu),
  );
  await pg.context().close();

  // Item 3: signed-in account page shows stats computed from the seeded local stores
  const DONE3 = ["hZKu4yiQrjs", "NuPjCsDg28o", "sZ-8-ZKDJBU"]; // the three first lessons in src/content.json
  pg = await page(browser);
  await fakeAuth(pg, 500, {});
  await pg.goto(G + "/?splash=0#/home");
  await seed(pg, {
    "archive-v5-account": ACC(),
    "archive-v2-lang": "en",
    "archive-v2-done": Object.fromEntries(DONE3.map((id) => [id, 1])),
    "archive-v3-days": { 1: 1, 2: 1 },
    "archive-v5-watch-sec": 5400,
  });
  await seedSession(pg, ENTERED);
  await pg.goto(G + "/#/account");
  await pg.waitForTimeout(900);
  const ac = await pg.evaluate((ids) => {
    const vids = DATA.videos;
    const started = new Set(vids.filter((v) => ids.includes(v.id)).flatMap((v) => v.playlistIds));
    return {
      cells: [...document.querySelectorAll("#acStats .stat")].map((s) => [
        s.querySelector("b").textContent,
        s.querySelector("span").textContent,
      ]),
      expectSeries: String(started.size),
      expectPct: Math.round((ids.length / vids.length) * 100) + "%",
      level: document.querySelector("#acLevel h2").textContent,
      summary: document.querySelector("#acSummary").textContent,
      pillars: document.querySelectorAll(".ac-pillars li").length,
      note: document.body.textContent.includes("Hours watched are counted from Nov 25, 2026."),
    };
  }, DONE3);
  const cellsOk =
    JSON.stringify(ac.cells) ===
    JSON.stringify([
      ["1h 30m", "Hours watched"],
      ["3", "Videos watched"],
      [ac.expectSeries, "Series started"],
      ["2 of 40", "Plan days"],
      [ac.expectPct, "Overall progress"],
    ]);
  check(
    "[r3] account page: hours, videos, series, plan days, overall from local stores; level, summary, 6 pillars",
    cellsOk &&
      ac.level === "Your level: Beginner" &&
      /^You have watched 3 of [\d,]+ lessons, and finished 2 of 40 plan days\.$/.test(ac.summary) &&
      ac.pillars === 6 &&
      ac.note,
    JSON.stringify(ac),
  );
  // The Home view links to the account page; check it on the Home route,
  // where #v-home is actually rendered (render() only renders the current
  // route, so the link is not in the DOM while on #/account).
  await pg.goto(G + "/#/home");
  await pg.waitForTimeout(900);
  check(
    "[r3] Home links to the account page",
    await pg.evaluate(
      () => !!document.querySelector('#v-home a[href="#/account"]'),
    ),
    "home account link",
  );
  // Back to the account page: the quiz checks below click inside #acQuiz.
  await pg.goto(G + "/#/account");
  await pg.waitForTimeout(900);

  // Item 3: quiz fails below 70% (wrong answers shown), retry passes at 70% or more
  const BEGIN = ["quran", "beliefs", "40", "quran", "worship"]; // src/content.json answers
  const answer = async (picks) => {
    for (let i = 0; i < picks.length; i++)
      await pg.check(`#qzForm input[name="q${i}"][value="${picks[i]}"]`);
    await pg.click('#qzForm button[type="submit"]');
    await pg.waitForTimeout(300);
  };
  await pg.click('#acQuiz [data-quiz="beginner"]');
  await answer(["quran", "beliefs", "40", "beliefs", "seerah"]); // 3 of 5 = 60%
  const qf = await pg.evaluate(() => ({
    res: document.querySelector(".qz-res b").textContent,
    wrong: [...document.querySelectorAll(".qz-res li")].map((li) => li.textContent),
    store: JSON.parse(localStorage.getItem("archive-v5-quiz")).beginner,
  }));
  check(
    "[r3] quiz at 60% fails, shows the 2 wrong answers with the correct ones, stored with date",
    qf.res === "Not passed: 3 of 5. The pass mark is 70%." &&
      qf.wrong.length === 2 &&
      /Correct answer: Qur'an/.test(qf.wrong[0]) &&
      /Correct answer: Worship/.test(qf.wrong[1]) &&
      qf.store.pass === false &&
      qf.store.score === 3 &&
      /^\d{4}-\d{2}-\d{2}$/.test(qf.store.at),
    JSON.stringify(qf),
  );
  await pg.click('.qz-res [data-quiz="beginner"]');
  await answer(["quran", "beliefs", "40", "quran", "seerah"]); // 4 of 5 = 80%
  const qp = await pg.evaluate(() => ({
    res: document.querySelector(".qz-res b").textContent,
    wrong: document.querySelectorAll(".qz-res li").length,
    store: JSON.parse(localStorage.getItem("archive-v5-quiz")).beginner,
    last: (document.querySelector('[data-qz-last="beginner"]') || {}).textContent,
  }));
  check(
    "[r3] retry at 80% passes (pass mark 70%), stored as passed",
    qp.res === "Passed: 4 of 5." && qp.wrong === 0 && qp.store.pass === true && qp.store.score === 4 && /Beginner: last result 4 of 5/.test(qp.last),
    JSON.stringify(qp),
  );
  await pg.click('.qz-res [data-quiz="beginner"]');
  await answer(BEGIN);
  const q5 = await pg.evaluate(() => document.querySelector(".qz-res b").textContent);
  check("[r3] every beginner answer traces to the site data (5 of 5)", q5 === "Passed: 5 of 5.", q5);

  // Item 3: local reminders, added and deleted on the account page, shown on Home
  await pg.fill('#remForm input[name="text"]', "Tafsir lesson");
  await pg.selectOption('#remForm select[name="day"]', "5");
  await pg.click('#remForm button[type="submit"]');
  await pg.waitForTimeout(200);
  const rm1 = await pg.evaluate(() => ({
    list: [...document.querySelectorAll("#acRem .rm-list li")].map((li) => li.textContent),
    store: JSON.parse(localStorage.getItem("archive-v5-reminders")),
  }));
  await pg.goto(G + "/#/home");
  await pg.waitForTimeout(600);
  const rm2 = await pg.evaluate(() => (document.querySelector("#homeRem .rm-list") || {}).textContent);
  await pg.goto(G + "/#/account");
  await pg.waitForTimeout(400);
  await pg.click("#acRem [data-rem-del='0']");
  await pg.waitForTimeout(200);
  const rm3 = await pg.evaluate(() => ({
    store: JSON.parse(localStorage.getItem("archive-v5-reminders")),
    empty: (document.querySelector("#acRem p.muted:last-of-type") || {}).textContent,
  }));
  check(
    "[rm3] reminders: add (text + day) shows on the account page and Home, delete removes it",
    rm1.store.length === 1 &&
      rm1.store[0].text === "Tafsir lesson" &&
      rm1.store[0].day === 5 &&
      /Friday/.test(rm1.list[0]) &&
      /Friday/.test(rm2 || "") &&
      /Tafsir lesson/.test(rm2 || "") &&
      rm3.store.length === 0,
    JSON.stringify({ rm1, rm2, rm3 }),
  );
  await pg.context().close();

  // Item 3: the watch-seconds counter counts played seconds only, never a seek
  pg = await page(browser);
  await pg.goto(G + "/?splash=0#/lesson/" + ids.with_subs);
  await pg.waitForSelector("#vid");
  await pg.evaluate(() => {
    const v = document.querySelector("#vid");
    v.muted = true;
    return v.play();
  });
  await pg.waitForTimeout(3000);
  await pg.evaluate(() => document.querySelector("#vid").pause());
  await pg.waitForTimeout(300);
  const w1 = await pg.evaluate(() => +localStorage.getItem("archive-v5-watch-sec"));
  await pg.evaluate(() => {
    const v = document.querySelector("#vid");
    v.currentTime = Math.min(v.duration - 1, v.currentTime + 20);
    return v.play();
  });
  await pg.waitForTimeout(800);
  await pg.evaluate(() => document.querySelector("#vid").pause());
  const w2 = await pg.evaluate(() => +localStorage.getItem("archive-v5-watch-sec"));
  check(
    "[r3] watch counter: ~3s of play counted, a 20s seek is not",
    w1 > 1.5 && w1 < 4.5 && w2 - w1 < 2,
    `after 3s play=${w1.toFixed(2)} after seek+0.8s=${w2.toFixed(2)}`,
  );
  await pg.context().close();

  // 13-bug fix (Nov 26 2026): playback position is saved, Resume shows on
  // Home, and In progress counts started-but-unfinished lessons. Second
  // pass: a watched lesson LEAVES In progress (it is done, not in
  // progress) - the old "watched still counts" rule was the bug.
  pg = await page(browser);
  await pg.goto(G + "/?splash=0#/lesson/" + ids.with_subs);
  await pg.waitForSelector("#vid");
  await pg.evaluate(() => {
    const v = document.querySelector("#vid");
    v.muted = true;
    return v.play();
  });
  await pg.waitForTimeout(7000);
  await pg.evaluate(() => document.querySelector("#vid").pause());
  await pg.waitForTimeout(400);
  const prog = await pg.evaluate(() =>
    JSON.parse(localStorage.getItem("archive-progress-v4") || "{}"),
  );
  await pg.goto(G + "/?splash=0#/home");
  await pg.waitForTimeout(1200);
  const resume = await pg.evaluate(
    (id) => {
      const rc = document.querySelector("#rc");
      return !!rc && rc.innerHTML.includes(id);
    },
    ids.with_subs,
  );
  await pg.goto(G + "/?splash=0#/library?scope=progress");
  await pg.waitForTimeout(1500);
  const inProgStarted = await pg.evaluate(
    (id) =>
      !!document.querySelector(
        '#v-library a[href^="#/lesson/' + id + '"]',
      ),
    ids.with_subs,
  );
  await pg.goto(G + "/?splash=0#/lesson/" + ids.with_subs);
  await pg.waitForTimeout(1200);
  await pg.evaluate(() => document.querySelector("[data-done]")?.click());
  await pg.waitForTimeout(500);
  await pg.goto(G + "/?splash=0#/library?scope=progress");
  await pg.waitForTimeout(1500);
  const inProgWatched = await pg.evaluate(
    (id) =>
      !!document.querySelector(
        '#v-library a[href^="#/lesson/' + id + '"]',
      ),
    ids.with_subs,
  );
  check(
    "[fix] resume: position saved after ~7s play, Resume on Home, started lesson in In progress, watched lesson out of it",
    prog[ids.with_subs] > 5 && resume && inProgStarted && !inProgWatched,
    JSON.stringify({
      saved: prog[ids.with_subs],
      resume,
      inProgStarted,
      inProgWatched,
    }),
  );
  await pg.context().close();

  // 13-bug fix: #/library?scope=books lands on the Books view.
  pg = await page(browser);
  await pg.goto(G + "/?splash=0#/library?scope=books");
  await pg.waitForTimeout(1200);
  const booksView = await pg.evaluate(() => ({
    hash: location.hash,
    on: document.querySelector("#v-books").classList.contains("on"),
  }));
  check(
    "[fix] library scope=books redirects to #/books",
    booksView.hash === "#/books" && booksView.on,
    JSON.stringify(booksView),
  );
  await pg.context().close();

  // 13-bug fix: series order is the lesson numbers (intro, 1, 2, 3), and
  // the Sheikh tab reads the same counts as the Library (3,977 / 71).
  pg = await page(browser);
  await pg.goto(G + "/?splash=0#/home");
  await pg.waitForTimeout(1200);
  const progId = await pg.evaluate(
    () =>
      DATA.playlists.find((p) => /Programme to Memorise/.test(p.titleEn)).id,
  );
  await pg.goto(G + "/?splash=0#/playlist/" + progId);
  await pg.waitForTimeout(2000);
  const firstNums = await pg.evaluate(() =>
    [...document.querySelectorAll("#plGrid .lcard .ltitle")]
      .slice(0, 4)
      .map((e) => {
        const t = e.textContent
          .trim()
          .replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d));
        const m = t.match(/^(\d+)/);
        return m ? +m[1] : null;
      }),
  );
  check(
    "[fix] series order: Programme opens with the intro, then lessons 1, 2, 3",
    JSON.stringify(firstNums) === JSON.stringify([null, 1, 2, 3]),
    JSON.stringify(firstNums),
  );
  await pg.goto(G + "/?splash=0#/about/sheikh");
  await pg.waitForTimeout(1200);
  const sheikhStats = await pg.evaluate(() =>
    [...document.querySelectorAll("#v-about .stat b")].map((b) =>
      b.textContent
        .replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d))
        .replace(/[^0-9]/g, ""),
    ),
  );
  check(
    "[fix] Sheikh tab counts match the Library: 3977 lessons, 71 series",
    sheikhStats[0] === "3977" && sheikhStats[1] === "71",
    JSON.stringify(sheikhStats),
  );
  await pg.context().close();

  // fix2 (Nov 26 2026, second pass on the live re-check's 2 FAILs + 3 PARTIALs)
  // 1. YT first-load race: the iframe_api loader resolves before YT.Player
  // exists, so the first lesson of a session never got a player or a
  // progress poll. Faithful mock of the real loader timing: the loader
  // defines YT without Player and injects the widget script, which defines
  // Player a moment later.
  const YT_LOADER =
    'var YT;if(!window["YT"])YT={loading:0,loaded:0};' +
    'var YTConfig;if(!window["YTConfig"])YTConfig={"host":"https://www.youtube.com"};' +
    'if(!YT.loading){YT.loading=1;(function(){var l=[];YT.ready=function(f){if(YT.loaded)f();else l.push(f)};' +
    'window.onYTReady=function(){YT.loaded=1;var i=0;for(;i<l.length;i++)try{l[i]()}catch(e){}};' +
    'YT.setConfig=function(c){var k;for(k in c)if(c.hasOwnProperty(k))YTConfig[k]=c[k]};' +
    'var a=document.createElement("script");a.type="text/javascript";a.id="www-widgetapi-script";' +
    'a.src="https://www.youtube.com/s/player/xxx/www-widgetapi.vflset/www-widgetapi.js";a.async=true;' +
    'var b=document.getElementsByTagName("script")[0];b.parentNode.insertBefore(a,b)})()};';
  const YT_WIDGET =
    'window.YT.PlayerState={UNSTARTED:-1,ENDED:0,PLAYING:1,PAUSED:2,BUFFERING:3,CUED:5};' +
    'window.YT.Player=function(el,opts){let t=0;const timer=setInterval(()=>{t+=1;},1000);' +
    'this.getCurrentTime=()=>t;this.getPlayerState=()=>1;' +
    'this.seekTo=(s)=>{t=s;};this.playVideo=()=>{};this.pauseVideo=()=>{};' +
    'this.destroy=()=>clearInterval(timer);' +
    'this.setOption=(m,k,v)=>{window.__capOpt={m,k,v};};' +
    'this.getOption=(m,k)=>{if(m==="captions"&&k==="tracklist")return[{languageCode:"ar",kind:"asr"},{languageCode:"en",kind:"asr"}];return null;};' +
    'this.loadModule=()=>{};' +
    'setTimeout(()=>opts&&opts.events&&opts.events.onStateChange&&opts.events.onStateChange({data:1}),300);' +
    'setTimeout(()=>opts&&opts.events&&opts.events.onReady&&opts.events.onReady({target:this}),350);' +
    'window.__mockPlayer=this;};' +
    'if(window.onYTReady)window.onYTReady();' +
    'if(window.onYouTubeIframeAPIReady)window.onYouTubeIframeAPIReady();';
  // The YT test uses a long playable lesson, not ids.with_subs: that clip
  // is only 12 seconds, so a saved 12s position is the end of the clip,
  // not a resume point, and canResume correctly refuses it.
  const LONG_LESSON = "V1nx_qy87FM"; // 1223s, playable in the test env
  pg = await page(browser);
  await pg.context().route("**/iframe_api", (route) =>
    route.fulfill({
      status: 200,
      contentType: "text/javascript",
      body: YT_LOADER,
    }),
  );
  await pg.context().route("**/www-widgetapi.js", (route) =>
    route.fulfill({
      status: 200,
      contentType: "text/javascript",
      body: YT_WIDGET,
    }),
  );
  await pg.goto(G + "/?splash=0#/lesson/" + LONG_LESSON);
  await pg.waitForTimeout(1500);
  await pg.evaluate(() =>
    document.querySelector('[data-mode="yt"]')?.click(),
  );
  await pg.waitForTimeout(15000);
  const yt1 = await pg.evaluate(() => ({
    player: !!window.__mockPlayer,
    cap: window.__capOpt || null,
    prog: JSON.parse(localStorage.getItem("archive-progress-v4") || "{}"),
  }));
  await pg.goto(G + "/?splash=0#/home");
  await pg.waitForTimeout(1200);
  const resume1 = await pg.evaluate(
    (id) => {
      const rc = document.querySelector("#rc");
      return !!rc && rc.innerHTML.includes(id);
    },
    LONG_LESSON,
  );
  // Reopen with no ?resume=1: the lesson must auto-resume from the saved
  // position on the local path. This is a separate seeded check below:
  // the YT poll above saves 12s, and the test videos are 12s stubs, so a
  // saved 12s position sits at the stub's end and the seek guard
  // (from < video.duration - 2) correctly refuses it. The seeded check
  // uses 8s, which passes the guard and proves the resume path.
  check(
    "[fix2] YT first load: player created, poll saves progress, captions picked, Resume on Home",
    yt1.player &&
      yt1.prog[LONG_LESSON] > 5 &&
      yt1.cap &&
      yt1.cap.m === "captions" &&
      resume1,
    JSON.stringify(yt1),
  );
  await pg.context().close();

  // fix2: auto-resume on reopen (seeded). A saved position resumes the
  // lesson on the local path with no ?resume=1.
  pg = await page(browser);
  await pg.context().addInitScript(() => {
    localStorage.setItem(
      "archive-progress-v4",
      JSON.stringify({ V1nx_qy87FM: 8 }),
    );
  });
  await pg.goto(G + "/?splash=0#/lesson/" + LONG_LESSON);
  await pg.waitForTimeout(2500);
  const autoRes = await pg.evaluate(
    () => document.querySelector("#vid")?.currentTime || 0,
  );
  check(
    "[fix2] reopen auto-resumes from the saved position (seeded 8s)",
    autoRes > 5,
    JSON.stringify({ autoRes }),
  );
  await pg.context().close();

  // fix2: Start tabs with the real flow (Home first, then Start). Home
  // renders the same first-lesson block, so the tabs must act on their own
  // box, not the first #firstBox in the document.
  pg = await page(browser);
  await pg.goto(G + "/?splash=0#/home");
  await pg.waitForTimeout(1500);
  const homeBoxes = await pg.evaluate(() => ({
    firstBox: document.querySelectorAll("#firstBox").length,
    homeBox: !!document.querySelector("#firstBoxHome"),
  }));
  await pg.click('#nav a[data-r="start"]');
  await pg.waitForTimeout(1200);
  const beforeTitle = await pg.evaluate(() =>
    document.querySelector("#v-start #firstBox .ttl")?.textContent?.trim(),
  );
  await pg.click('#v-start [data-level="advanced"]');
  await pg.waitForTimeout(600);
  const startTabs = await pg.evaluate(() => ({
    aria: [...document.querySelectorAll("#v-start [data-level]")].map((b) =>
      b.getAttribute("aria-selected"),
    ),
    title: document
      .querySelector("#v-start #firstBox .ttl")
      ?.textContent?.trim(),
    boxes: document.querySelectorAll("#firstBox").length,
  }));
  check(
    "[fix2] Start tabs: Home box has its own id, Advanced switches the visible box",
    homeBoxes.firstBox === 0 &&
      homeBoxes.homeBox &&
      startTabs.boxes === 1 &&
      JSON.stringify(startTabs.aria) ===
        JSON.stringify(["false", "false", "true"]) &&
      !!startTabs.title &&
      startTabs.title !== beforeTitle,
    JSON.stringify({ homeBoxes, beforeTitle, startTabs }),
  );
  await pg.context().close();

  // fix2: series grids flow with the site language (the document stays
  // dir=rtl by design; the grid itself must flip).
  pg = await page(browser);
  await pg.goto(G + "/?splash=0#/home");
  await pg.waitForTimeout(1200);
  await pg.evaluate(() =>
    document.querySelector('#langSeg button[data-lang="en"]')?.click(),
  );
  await pg.waitForTimeout(600);
  const tawId = await pg.evaluate(() =>
    DATA.playlists.find((p) => /General Fiqh – Tawhid/.test(p.titleEn)).id,
  );
  await pg.goto(G + "/?splash=0#/playlist/" + tawId);
  await pg.waitForTimeout(2500);
  const gridEn = await pg.evaluate(() => {
    const g = document.querySelector("#plGrid");
    const xs = [...g.querySelectorAll(":scope > *")]
      .slice(0, 4)
      .map((c) => Math.round(c.getBoundingClientRect().x));
    return {
      dir: getComputedStyle(g).direction,
      ascending: xs[0] < xs[1] && xs[1] < xs[2] && xs[2] < xs[3],
    };
  });
  await pg.evaluate(() =>
    document.querySelector('#langSeg button[data-lang="ar"]')?.click(),
  );
  await pg.waitForTimeout(800);
  const gridAr = await pg.evaluate(() =>
    getComputedStyle(document.querySelector("#plGrid")).direction,
  );
  check(
    "[fix2] series grid flows with the site language: LTR in English, RTL in Arabic",
    gridEn.dir === "ltr" && gridEn.ascending && gridAr === "rtl",
    JSON.stringify({ gridEn, gridAr }),
  );
  await pg.context().close();

  // fix2: the transcript note follows the transcript tab language, not the
  // site language (Tajweed lesson has subtitle entries but no text file in
  // the preview, so the note is what shows).
  pg = await page(browser);
  await pg.goto(G + "/?splash=0#/home");
  await pg.waitForTimeout(1200);
  await pg.evaluate(() =>
    document.querySelector('#langSeg button[data-lang="en"]')?.click(),
  );
  await pg.waitForTimeout(600);
  await pg.goto(G + "/?splash=0#/lesson/VLKRl6DmzaU");
  await pg.waitForTimeout(3000);
  await pg.evaluate(() =>
    [...document.querySelectorAll("#txPanel [data-tx]")]
      .find((b) => b.dataset.tx === "ar")
      ?.click(),
  );
  await pg.waitForTimeout(2000);
  const txAr = await pg.evaluate(() =>
    document.querySelector("#txBody")?.textContent?.trim(),
  );
  check(
    "[fix2] transcript note follows the transcript tab language (Arabic tab, English site)",
    !!txAr && txAr.startsWith("النص الكامل"),
    JSON.stringify(txAr && txAr.slice(0, 80)),
  );
  await pg.context().close();

  // fix2: Programme lesson 24 is genuinely absent from the channel's
  // numbering (as is 46); the rendered numbers ascend with no other gaps.
  pg = await page(browser);
  await pg.goto(G + "/?splash=0#/home");
  await pg.waitForTimeout(1200);
  const progId2 = await pg.evaluate(() =>
    DATA.playlists.find((p) => /Programme to Memorise/.test(p.titleEn)).id,
  );
  await pg.goto(G + "/?splash=0#/playlist/" + progId2);
  await pg.waitForTimeout(2500);
  const progNums = await pg.evaluate(() =>
    [...document.querySelectorAll("#plGrid .lcard .ltitle")].map((e) => {
      const t = e.textContent
        .trim()
        .replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d));
      const m = t.match(/^(\d+)/);
      return m ? +m[1] : null;
    }),
  );
  const numbered = progNums.filter((n) => n !== null);
  const sorted = [...numbered].sort((a, b) => a - b);
  check(
    "[fix2] Programme numbers ascend with no other gaps: 24 and 46 are the channel's own missing numbers",
    progNums.length === 72 &&
      JSON.stringify(numbered) === JSON.stringify(sorted) &&
      !numbered.includes(24) &&
      !numbered.includes(46),
    JSON.stringify({
      count: progNums.length,
      first: progNums.slice(0, 6),
      max: Math.max(...numbered),
    }),
  );
  await pg.context().close();

  // fix3 (Nov 26 2026, third pass): Start tabs change the whole page,
  // not just the starter lesson. Verified against the real catalog:
  // beginner shows 2 question cards, 4 path steps, 15 days; intermediate
  // 3 cards, 6 steps, 23 days; advanced 1 card, 1 step, 2 days.
  pg = await page(browser);
  await pg.goto(G + "/?splash=0#/start");
  await pg.waitForTimeout(1500);
  // English mode for exact heading assertions (the site defaults to Arabic).
  await pg.evaluate(() =>
    document.querySelector("#langSeg button[data-lang=en]")?.click(),
  );
  await pg.waitForTimeout(800);
  const startState = () =>
    pg.evaluate(() => ({
      heading: document
        .querySelector("#v-start .page-h h1")
        ?.textContent?.trim(),
      cards: document.querySelectorAll("#v-start .cards3 .card").length,
      steps: document.querySelectorAll("#v-start .steps .step").length,
      days: document.querySelectorAll("#v-start #days .dcard").length,
      prog: document.querySelector("#daysProg")?.textContent?.trim(),
      heads: [...document.querySelectorAll("#v-start .sec-h h2")].map(
        (h) => h.textContent?.trim(),
      ),
    }));
  const stBeginner = await startState();
  await pg.click('#v-start [data-level="advanced"]');
  await pg.waitForTimeout(800);
  const stAdvanced = await startState();
  await pg.click('#v-start [data-level="intermediate"]');
  await pg.waitForTimeout(800);
  const stIntermediate = await startState();
  check(
    "[fix3] Start tabs: heading, questions, path and days follow the level",
    stBeginner.heading === "A clear path for beginners" &&
      stBeginner.cards === 2 &&
      stBeginner.steps === 4 &&
      stBeginner.days === 15 &&
      stBeginner.prog === "0 of 15 days done" &&
      stAdvanced.heading === "A clear path for advanced learners" &&
      stAdvanced.cards === 1 &&
      stAdvanced.steps === 1 &&
      stAdvanced.days === 2 &&
      stAdvanced.prog === "0 of 2 days done" &&
      stIntermediate.heading === "A clear path for intermediate learners" &&
      stIntermediate.cards === 3 &&
      stIntermediate.steps === 6 &&
      stIntermediate.days === 23 &&
      stIntermediate.prog === "0 of 23 days done",
    JSON.stringify({ stBeginner, stAdvanced, stIntermediate }),
  );
  check(
    // fix4: the path heading is count-aware and singular for one step.
    "[fix4] Start tabs: path heading reads 'The path in 1 step' for Advanced",
    stBeginner.heads.includes("The path in 4 steps") &&
      stAdvanced.heads.includes("The path in 1 step") &&
      stIntermediate.heads.includes("The path in six steps"),
    JSON.stringify({
      beginner: stBeginner.heads,
      advanced: stAdvanced.heads,
      intermediate: stIntermediate.heads,
    }),
  );
  await pg.context().close();

  // fix3: captions with the REAL player timing. The track list is empty
  // at onReady and only fills once the video's timed text arrives after
  // playback starts; the old onReady + one retry never saw a track. The
  // mock keeps the list empty until 2.5s after PLAYING, then offers
  // Arabic + English tracks; the app must end with an active track.
  const YT_WIDGET3 =
    "window.YT.PlayerState={UNSTARTED:-1,ENDED:0,PLAYING:1,PAUSED:2,BUFFERING:3,CUED:5};" +
    "window.YT.Player=function(el,opts){let t=0;let tracks=[];let active=null;" +
    "const timer=setInterval(()=>{t+=1;},1000);" +
    "this.getCurrentTime=()=>t;this.getPlayerState=()=>1;" +
    "this.seekTo=(s)=>{t=s;};this.playVideo=()=>{};this.pauseVideo=()=>{};" +
    "this.destroy=()=>clearInterval(timer);" +
    "this.loadModule=()=>{};" +
    'this.setOption=(m,k,v)=>{if(m==="captions"&&k==="track")active={languageCode:v.languageCode};};' +
    'this.getOption=(m,k)=>{if(m==="captions"&&k==="tracklist")return tracks;if(m==="captions"&&k==="track")return active;return null;};' +
    "setTimeout(()=>opts&&opts.events&&opts.events.onStateChange&&opts.events.onStateChange({data:1}),300);" +
    'setTimeout(()=>{tracks=[{languageCode:"ar",kind:"asr"},{languageCode:"en",kind:"asr"}];},2800);' +
    "setTimeout(()=>opts&&opts.events&&opts.events.onReady&&opts.events.onReady({target:this}),350);" +
    "window.__mockPlayer=this;window.__capState=()=>({active, tracks: tracks.length});};" +
    "if(window.onYTReady)window.onYTReady();" +
    "if(window.onYouTubeIframeAPIReady)window.onYouTubeIframeAPIReady();";
  pg = await page(browser);
  await pg.context().route("**/iframe_api", (route) =>
    route.fulfill({
      status: 200,
      contentType: "text/javascript",
      body: YT_LOADER,
    }),
  );
  await pg.context().route("**/www-widgetapi.js", (route) =>
    route.fulfill({
      status: 200,
      contentType: "text/javascript",
      body: YT_WIDGET3,
    }),
  );
  await pg.goto(G + "/?splash=0#/lesson/" + LONG_LESSON);
  await pg.waitForTimeout(1500);
  await pg.evaluate(() =>
    document.querySelector('[data-mode="yt"]')?.click(),
  );
  await pg.waitForTimeout(8000);
  const capLate = await pg.evaluate(() => window.__capState?.());
  check(
    "[fix3] captions: track turns on once the list arrives after playback starts",
    // The site defaults to Arabic, so the Arabic track is picked first.
    capLate && capLate.active && capLate.active.languageCode === "ar",
    JSON.stringify(capLate),
  );
  await pg.context().close();

  // fix4: the track list alone is NOT reliable. On VLKRl6DmzaU the list
  // stayed empty through 35s of real playback even though YouTube lists
  // an Arabic auto-generated track, fix3 then showed the "no captions"
  // notice wrongly. This mock never fills the list, but setOption by
  // language code DOES activate (the real player's documented behaviour);
  // the app must end with an active track and NO notice.
  const YT_WIDGET4_DIRECT =
    "window.YT.PlayerState={UNSTARTED:-1,ENDED:0,PLAYING:1,PAUSED:2,BUFFERING:3,CUED:5};" +
    "window.YT.Player=function(el,opts){let t=0;let active=null;" +
    "const timer=setInterval(()=>{t+=1;},1000);" +
    "this.getCurrentTime=()=>t;this.getPlayerState=()=>1;" +
    "this.seekTo=(s)=>{t=s;};this.playVideo=()=>{};this.pauseVideo=()=>{};" +
    "this.destroy=()=>clearInterval(timer);" +
    "this.loadModule=()=>{};" +
    'this.setOption=(m,k,v)=>{if(m==="captions"&&k==="track"&&(v.languageCode==="ar"||v.languageCode==="en"))active={languageCode:v.languageCode};};' +
    'this.getOption=(m,k)=>{if(m==="captions"&&k==="tracklist")return [];if(m==="captions"&&k==="track")return active;return null;};' +
    "setTimeout(()=>opts&&opts.events&&opts.events.onStateChange&&opts.events.onStateChange({data:1}),300);" +
    "setTimeout(()=>opts&&opts.events&&opts.events.onReady&&opts.events.onReady({target:this}),350);" +
    "window.__mockPlayer=this;window.__capState=()=>({active});};" +
    "if(window.onYTReady)window.onYTReady();" +
    "if(window.onYouTubeIframeAPIReady)window.onYouTubeIframeAPIReady();";
  pg = await page(browser);
  await pg.context().route("**/iframe_api", (route) =>
    route.fulfill({
      status: 200,
      contentType: "text/javascript",
      body: YT_LOADER,
    }),
  );
  await pg.context().route("**/www-widgetapi.js", (route) =>
    route.fulfill({
      status: 200,
      contentType: "text/javascript",
      body: YT_WIDGET4_DIRECT,
    }),
  );
  await pg.goto(G + "/?splash=0#/lesson/" + LONG_LESSON);
  await pg.waitForTimeout(1500);
  await pg.evaluate(() =>
    document.querySelector('[data-mode="yt"]')?.click(),
  );
  await pg.waitForTimeout(8000);
  const capDirect = await pg.evaluate(() => ({
    state: window.__capState?.(),
    notice: (() => {
      const n = document.querySelector("#notice");
      return n ? { hidden: n.hidden, text: n.textContent.trim().slice(0, 60) } : null;
    })(),
  }));
  check(
    "[fix4] captions: direct setOption activates a track even when the track list never fills",
    // The site defaults to Arabic, so the Arabic track is picked first.
    capDirect.state &&
      capDirect.state.active &&
      capDirect.state.active.languageCode === "ar" &&
      capDirect.notice &&
      capDirect.notice.hidden,
    JSON.stringify(capDirect),
  );
  await pg.context().close();

  // fix3: a lesson with no captions in any language must say so plainly.
  // Same mock, but the track list never fills; after playback starts the
  // page shows the "Captions are not available" notice under the player.
  const YT_WIDGET3_NONE =
    "window.YT.PlayerState={UNSTARTED:-1,ENDED:0,PLAYING:1,PAUSED:2,BUFFERING:3,CUED:5};" +
    "window.YT.Player=function(el,opts){let t=0;" +
    "const timer=setInterval(()=>{t+=1;},1000);" +
    "this.getCurrentTime=()=>t;this.getPlayerState=()=>1;" +
    "this.seekTo=(s)=>{t=s;};this.playVideo=()=>{};this.pauseVideo=()=>{};" +
    "this.destroy=()=>clearInterval(timer);" +
    "this.loadModule=()=>{};" +
    'this.setOption=()=>{};' +
    'this.getOption=(m,k)=>{if(m==="captions"&&(k==="tracklist"||k==="track"))return m==="captions"&&k==="tracklist"?[]:null;return null;};' +
    "setTimeout(()=>opts&&opts.events&&opts.events.onStateChange&&opts.events.onStateChange({data:1}),300);" +
    "setTimeout(()=>opts&&opts.events&&opts.events.onReady&&opts.events.onReady({target:this}),350);" +
    "window.__mockPlayer=this;};" +
    "if(window.onYTReady)window.onYTReady();" +
    "if(window.onYouTubeIframeAPIReady)window.onYouTubeIframeAPIReady();";
  pg = await page(browser);
  await pg.context().route("**/iframe_api", (route) =>
    route.fulfill({
      status: 200,
      contentType: "text/javascript",
      body: YT_LOADER,
    }),
  );
  await pg.context().route("**/www-widgetapi.js", (route) =>
    route.fulfill({
      status: 200,
      contentType: "text/javascript",
      body: YT_WIDGET3_NONE,
    }),
  );
  await pg.goto(G + "/?splash=0#/lesson/" + LONG_LESSON);
  await pg.waitForTimeout(1500);
  await pg.evaluate(() =>
    document.querySelector('[data-mode="yt"]')?.click(),
  );
  await pg.waitForTimeout(11000);
  const capNone = await pg.evaluate(() => {
    const n = document.querySelector("#notice");
    return n
      ? { hidden: n.hidden, text: n.textContent.trim().slice(0, 80) }
      : null;
  });
  check(
    "[fix3] captions: no tracks at all shows the plain no-captions notice",
    // The site defaults to Arabic, so the notice reads in Arabic.
    capNone &&
      !capNone.hidden &&
      (capNone.text.includes("الترجمة غير متاحة") ||
        capNone.text.includes("Captions are not available")),
    JSON.stringify(capNone),
  );
  await pg.context().close();

  // fix5: the stale "no captions" notice. VLKRl6DmzaU HAS Arabic + English
  // subtitle entries in the catalog, and YouTube lists an Arabic
  // auto-generated track for it, but in real playback the track list
  // stays empty and getOption never reports an active track, so the old
  // detector concluded "none" and showed the notice while captions were
  // visibly on. Same no-track mock as the [fix3] none test, but on a
  // lesson the catalog says HAS captions: no notice must ever show, and
  // the state must stay unknown, not "none".
  const CAP_LESSON = "VLKRl6DmzaU"; // ar+en subtitle entries in the catalog
  pg = await page(browser);
  await pg.context().route("**/iframe_api", (route) =>
    route.fulfill({
      status: 200,
      contentType: "text/javascript",
      body: YT_LOADER,
    }),
  );
  await pg.context().route("**/www-widgetapi.js", (route) =>
    route.fulfill({
      status: 200,
      contentType: "text/javascript",
      body: YT_WIDGET3_NONE,
    }),
  );
  await pg.goto(G + "/?splash=0#/lesson/" + CAP_LESSON);
  await pg.waitForTimeout(1500);
  await pg.evaluate(() =>
    document.querySelector('[data-mode="yt"]')?.click(),
  );
  await pg.waitForTimeout(11000);
  const capStale = await pg.evaluate(() => {
    const n = document.querySelector("#notice");
    return n
      ? { hidden: n.hidden, text: n.textContent.trim().slice(0, 80) }
      : null;
  });
  check(
    "[fix5] captions: lesson the catalog says has captions never shows the no-captions notice",
    capStale && capStale.hidden,
    JSON.stringify(capStale),
  );
  await pg.context().close();

  // fix5: the "Text of the lesson" note follows the caption state even
  // when the state settles after the panel opens. Same direct-activation
  // mock as [fix4], but PLAYING arrives late (3s) so the panel first
  // shows the generic note; once the track activates the note must say
  // subtitles are on in the player above.
  const YT_WIDGET5_TX =
    "window.YT.PlayerState={UNSTARTED:-1,ENDED:0,PLAYING:1,PAUSED:2,BUFFERING:3,CUED:5};" +
    "window.YT.Player=function(el,opts){let t=0;let active=null;" +
    "const timer=setInterval(()=>{t+=1;},1000);" +
    "this.getCurrentTime=()=>t;this.getPlayerState=()=>1;" +
    "this.seekTo=(s)=>{t=s;};this.playVideo=()=>{};this.pauseVideo=()=>{};" +
    "this.destroy=()=>clearInterval(timer);" +
    "this.loadModule=()=>{};" +
    'this.setOption=(m,k,v)=>{if(m==="captions"&&k==="track"&&(v.languageCode==="ar"||v.languageCode==="en"))active={languageCode:v.languageCode};};' +
    'this.getOption=(m,k)=>{if(m==="captions"&&k==="tracklist")return [];if(m==="captions"&&k==="track")return active;return null;};' +
    "setTimeout(()=>opts&&opts.events&&opts.events.onStateChange&&opts.events.onStateChange({data:1}),3000);" +
    "setTimeout(()=>opts&&opts.events&&opts.events.onReady&&opts.events.onReady({target:this}),350);" +
    "window.__mockPlayer=this;window.__capState=()=>({active});};" +
    "if(window.onYTReady)window.onYTReady();" +
    "if(window.onYouTubeIframeAPIReady)window.onYouTubeIframeAPIReady();";
  pg = await page(browser);
  await pg.context().route("**/iframe_api", (route) =>
    route.fulfill({
      status: 200,
      contentType: "text/javascript",
      body: YT_LOADER,
    }),
  );
  await pg.context().route("**/www-widgetapi.js", (route) =>
    route.fulfill({
      status: 200,
      contentType: "text/javascript",
      body: YT_WIDGET5_TX,
    }),
  );
  await pg.goto(G + "/?splash=0#/lesson/" + CAP_LESSON);
  await pg.waitForTimeout(3000);
  const txBefore = await pg.evaluate(() =>
    document.querySelector("#txBody")?.textContent?.trim(),
  );
  await pg.evaluate(() =>
    document.querySelector('[data-mode="yt"]')?.click(),
  );
  await pg.waitForTimeout(8000);
  const txAfter = await pg.evaluate(() =>
    document.querySelector("#txBody")?.textContent?.trim(),
  );
  check(
    "[fix5] transcript note updates to subtitles-on once the track activates",
    !!txBefore &&
      txBefore.startsWith("النص الكامل") &&
      !txBefore.includes("الترجمة مفعّلة") &&
      !!txAfter &&
      txAfter.includes("الترجمة مفعّلة"),
    JSON.stringify({
      before: txBefore && txBefore.slice(0, 60),
      after: txAfter && txAfter.slice(0, 80),
    }),
  );
  await pg.context().close();

  await browser.close();
  console.log("FAILURES:", fails);
  process.exit(fails ? 1 : 0);
})();
