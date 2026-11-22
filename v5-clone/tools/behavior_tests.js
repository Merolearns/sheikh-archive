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
  await pg.route("http://archive.test/**", async (route) => {
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
    "opening has exactly three controls (sign in + sign up + guest), form hidden",
    op.controls === 3 && op.formHidden,
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
    entered: sessionStorage.getItem("archive-v3-entered"),
  }));
  check(
    "Enter mid-sequence enters the library",
    after.hidden && after.entered === null,
    JSON.stringify(after),
  );
  // V5 owner order (Nov 21): the opening shows on EVERY visit, nothing is remembered
  await pg.goto(G + "/");
  await pg.waitForTimeout(600);
  const again = await pg.evaluate(
    () => !document.querySelector("#splash").hidden,
  );
  check(
    "opening shows again on the next visit in the same session",
    again,
    "splash visible=" + again,
  );
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
    titles: [...document.querySelectorAll("#bkGrid .stitle")].map(
      (a) => a.textContent,
    ),
    side: null,
  }));
  check(
    "books: 34 works listed, no title twice",
    bl.cards === 34 && new Set(bl.titles).size === bl.titles.length,
    `cards=${bl.cards} unique=${new Set(bl.titles).size}`,
  );
  await pg.goto(G + "/?splash=0#/books?lang=en");
  await pg.waitForTimeout(800);
  const en = await pg.evaluate(
    () => document.querySelectorAll("#bkGrid .scard").length,
  );
  check("books: language filter English", en === 2, "cards=" + en);
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
  await browser.close();
  console.log("FAILURES:", fails);
  process.exit(fails ? 1 : 0);
})();
