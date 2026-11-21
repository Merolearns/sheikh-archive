// v3 behaviour checks in headless Chromium against the real server (requests relayed, see shots.js).
// Usage: node tools/behavior_tests.js http://127.0.0.1:8765
const {
  chromium,
} = require("/home/hatch/.npm/_npx/9833c18b2d85bc59/node_modules/playwright-core");
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
  await pg.evaluate(() => document.querySelector("#langSeg button[data-lang=en]").click());
  await pg.waitForTimeout(600);
  const b = await rects(pg);
  const s1 = await pg.evaluate(() => ({ dir: document.documentElement.dir, y: scrollY, nav: document.querySelectorAll("#nav a").length, navText: [...document.querySelectorAll("#nav a")].map((x) => x.textContent).join("|") }));
  check("chrome does not move on AR->EN", JSON.stringify(a) === JSON.stringify(b), JSON.stringify(a) + " vs " + JSON.stringify(b));
  check("html stays dir=rtl, scroll kept", s1.dir === "rtl" && Math.abs(s1.y - 900) < 5, JSON.stringify(s1));
  check("nav has exactly 5 items", s1.nav === 5, s1.navText);
  await pg.context().close();

  // 2. opening: verse alone + exactly one Enter button; Enter mid-sequence jumps to the end and enters
  pg = await page(browser);
  await pg.goto(G + "/?splash=1");
  await pg.waitForTimeout(900);
  const op = await pg.evaluate(() => ({
    controls: document.querySelectorAll("#splash button, #splash input, #splash select, #splash a, #splash [role=switch]").length,
    verse: document.querySelector("#spVerse").textContent,
    birds: document.querySelectorAll("#sky .bird").length,
    running: document.getAnimations().filter((x) => x.playState === "running").length,
  }));
  check("opening has exactly one control", op.controls === 1, JSON.stringify(op));
  check("opening is mid-sequence at 900ms (animations running)", op.running > 0, "running=" + op.running);
  await pg.click("#enterBtn");
  await pg.waitForTimeout(900);
  const after = await pg.evaluate(() => ({ hidden: document.querySelector("#splash").hidden, entered: sessionStorage.getItem("archive-v3-entered") }));
  check("Enter mid-sequence enters the library", after.hidden && after.entered === "1", JSON.stringify(after));
  await pg.context().close();

  // 3. reduced motion: one static, fully composed frame
  pg = await page(browser, { reducedMotion: "reduce" });
  await pg.goto(G + "/?splash=1");
  await pg.waitForTimeout(500);
  const rm = await pg.evaluate(() => ({
    running: document.getAnimations().filter((x) => x.playState === "running").length,
    verseOpacity: getComputedStyle(document.querySelector("#spVerse")).opacity,
    btnOpacity: getComputedStyle(document.querySelector("#enterBtn")).opacity,
  }));
  check("reduced motion: nothing running, verse and button visible", rm.running === 0 && rm.verseOpacity === "1" && rm.btnOpacity === "1", JSON.stringify(rm));
  await pg.context().close();

  // 4. theme swatches switch live and persist
  pg = await page(browser);
  await pg.goto(G + "/?splash=0#/home");
  await pg.click("#themeBtn");
  await pg.waitForTimeout(300);
  const bg0 = await pg.evaluate(() => getComputedStyle(document.body).backgroundColor);
  await pg.click('#swGrid .sw[data-th="parchment"]');
  await pg.waitForTimeout(900);
  const th = await pg.evaluate(() => ({ theme: document.documentElement.dataset.theme, bg: getComputedStyle(document.body).backgroundColor, stored: localStorage.getItem("archive-v2-theme"), popOpen: !document.querySelector("#themePop").hidden, swatches: document.querySelectorAll("#swGrid .sw").length }));
  check("swatch switches theme live without reload", th.theme === "parchment" && th.bg !== bg0 && th.stored === '"parchment"' && th.swatches === 6, bg0 + " -> " + JSON.stringify(th));
  await pg.context().close();

  // 5. transcript: tap a line jumps the video; the current line highlights
  pg = await page(browser);
  await pg.goto(G + "/?splash=0#/lesson/" + ids.with_subs);
  await pg.waitForSelector(".tx-line[data-cue='1']", { timeout: 8000 });
  await pg.evaluate(() => document.querySelector("#vid").pause());
  await pg.click(".tx-line[data-cue='1']");
  await pg.waitForTimeout(1200);
  const tx = await pg.evaluate(() => ({ t: document.querySelector("#vid").currentTime, now: [...document.querySelectorAll(".tx-line.now")].map((x) => x.dataset.cue) }));
  check("tapping transcript line 2 jumps the video to 0:05 and highlights it", tx.t >= 5 && tx.t < 8 && tx.now.join() === "1", JSON.stringify(tx));
  await pg.context().close();

  // 6. 404: human message, raw path only behind a Details disclosure
  pg = await page(browser);
  await pg.goto(G + "/?splash=0#/lesson/" + ids.missing);
  await pg.waitForTimeout(3000);
  const e = await pg.evaluate(() => {
    const d = document.querySelector("#v-lesson details");
    return { text: document.querySelector("#v-lesson").innerText.slice(0, 2000), hasDetails: !!d, open: d && d.open, codeInDetails: !!(d && d.querySelector("code")), codeOutside: [...document.querySelectorAll("#v-lesson code")].filter((c) => !c.closest("details")).length };
  });
  check("404 shows the human message with a closed Details disclosure", /غير موجود على هذا الجهاز/.test(e.text) && e.hasDetails && !e.open && e.codeInDetails && e.codeOutside === 0, JSON.stringify({ ...e, text: e.text.slice(0, 80) }));
  await pg.context().close();

  // 7. recitation silent and honest
  pg = await page(browser);
  await pg.goto(G + "/?splash=0");
  await pg.waitForTimeout(900);
  const rec = await pg.evaluate(() => ({ ctlHidden: document.querySelector("#recCtl").hidden, status: document.querySelector("#recStatus").textContent, src: document.querySelector("#recAudio").getAttribute("src") }));
  check("recitation: controls hidden, plain status, no audio src", rec.ctlHidden && rec.status === "لا توجد تلاوة مرفقة في هذه النسخة." && !rec.src, JSON.stringify(rec));
  await pg.context().close();

  // 8. owner's v2 favorites and progress carry over (same keys)
  pg = await page(browser);
  await pg.addInitScript((id) => {
    if (!localStorage.getItem("seeded")) {
      localStorage.setItem("archive-favorites-v4", JSON.stringify({ [id]: Date.now() }));
      localStorage.setItem("archive-progress-v4", JSON.stringify({ [id]: 120 }));
      localStorage.setItem("seeded", "1");
    }
  }, ids.with_subs);
  await pg.goto(G + "/?splash=0#/saved");
  await pg.waitForTimeout(900);
  const sv = await pg.evaluate((id) => document.querySelector("#v-saved").innerHTML.includes(id), ids.with_subs);
  check("v2 favorite (archive-favorites-v4) shows on Saved", sv, "found=" + sv);
  await pg.context().close();

  // 9. sort is one disclosure button (default series order) and remembers the choice across reloads
  pg = await page(browser);
  await pg.goto(G + "/?splash=0#/playlist/PLXKSrZvHoN9cmAY-O5kHl5JBsujbnpfIU");
  await pg.waitForTimeout(800);
  const s0 = await pg.evaluate(() => ({ n: document.querySelectorAll("#v-playlist .sortd").length, selects: document.querySelectorAll("#v-playlist select").length, checked: document.querySelector("#v-playlist .sortd [aria-checked=true]").dataset.sort }));
  await pg.click("#v-playlist .sortd > button");
  const opts = await pg.$$eval("#v-playlist .sortd [data-sort]", (bs) => bs.map((x) => x.dataset.sort));
  const pick = opts.find((o) => o !== s0.checked);
  await pg.click(`#v-playlist .sortd [data-sort="${pick}"]`);
  await pg.waitForTimeout(500);
  await pg.reload();
  await pg.waitForTimeout(900);
  const s2 = await pg.evaluate(() => document.querySelector("#v-playlist .sortd [aria-checked=true]").dataset.sort);
  check("one Sort disclosure, default first, choice remembered after reload", s0.n === 1 && s0.selects === 0 && s2 === pick, JSON.stringify({ ...s0, opts, pick, afterReload: s2 }));
  await pg.context().close();

  // 10. offline: the browser is offline and every non-archive request is refused; the page still works
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, offline: true });
  pg = await ctx.newPage();
  const ext = [];
  await pg.route("**/*", async (route) => {
    const r = route.request(), u = new URL(r.url());
    if (u.origin !== G) { ext.push(r.url()); return route.abort(); }
    const res = await fetch(RELAY + u.pathname + u.search, { method: r.method() });
    await route.fulfill({ status: res.status, headers: Object.fromEntries(res.headers), body: r.method() === "HEAD" ? "" : Buffer.from(await res.arrayBuffer()) });
  });
  const errs = [];
  pg.on("pageerror", (x) => errs.push(x.message));
  await pg.goto(G + "/?splash=0#/home");
  await pg.waitForTimeout(1500);
  const off = await pg.evaluate(() => ({ online: navigator.onLine, cards: document.querySelectorAll("#v-home article, #v-home .pcard").length, font: document.fonts.check("16px 'Noto Sans Arabic'") && [...document.fonts].filter((f) => f.status === "loaded").length }));
  check("offline: page renders, fonts load locally, zero external requests", !off.online && off.cards > 10 && off.font > 0 && ext.length === 0 && errs.length === 0, JSON.stringify({ ...off, ext: ext.length, errs }));
  await ctx.close();

  await browser.close();
  console.log("FAILURES:", fails);
  process.exit(fails ? 1 : 0);
})();
