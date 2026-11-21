// Behaviour checks in headless Chromium against the real server (requests relayed, see shots.js).
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
      return [s, Math.round(r.x), Math.round(r.width)];
    }),
  );

(async () => {
  const browser = await chromium.launch({
    executablePath: "/opt/meta-chromium/chrome",
    args: ["--autoplay-policy=no-user-gesture-required", ...args],
  });

  // 1. language switch: chrome geometry unchanged, html dir fixed, scroll kept
  let pg = await page(browser);
  await pg.goto("http://archive.test/?splash=0#/start");
  await pg.evaluate(() => document.fonts.ready);
  await pg.evaluate(() => window.scrollTo(0, 900));
  const a = await rects(pg);
  await pg.evaluate(() =>
    document.querySelector("#langSeg button[data-lang=en]").click(),
  ); // DOM click: Playwright's click scrolls the sticky header into view
  await pg.waitForTimeout(400);
  const b = await rects(pg);
  const st = await pg.evaluate(() => ({
    y: window.scrollY,
    dir: document.documentElement.dir,
    h1: document.querySelector("#v-start h1").getAttribute("lang"),
  }));
  check(
    "chrome does not move on AR->EN",
    JSON.stringify(a.map((x) => x.slice(0, 2))) ===
      JSON.stringify(b.map((x) => x.slice(0, 2))),
    JSON.stringify(a) + " vs " + JSON.stringify(b),
  );
  check(
    "html stays dir=rtl, text blocks switch lang",
    st.dir === "rtl" && st.h1 === "en",
    JSON.stringify(st),
  );
  check(
    "scroll position kept on switch",
    Math.abs(st.y - 900) < 5,
    "scrollY=" + st.y,
  );
  const order = await pg.$$eval("#langSeg button", (bs) =>
    bs.map((x) => x.textContent),
  );
  check(
    "toggle labels never swap order",
    order.join("|") === "العربية|English",
    order.join("|"),
  );
  await pg.context().close();

  // 2. switching language mid-video keeps the same playing <video>
  pg = await page(browser);
  await pg.goto("http://archive.test/?splash=0#/lesson/" + ids.with_subs);
  await pg.waitForTimeout(6500);
  const t1 = await pg.evaluate(() => {
    window.__v = document.querySelector("#vid");
    return window.__v.currentTime;
  });
  await pg.evaluate(() =>
    document.querySelector("#langSeg button[data-lang=en]").click(),
  ); // DOM click: Playwright's click scrolls the sticky header into view
  await pg.waitForTimeout(1200);
  const v2 = await pg.evaluate(() => ({
    same: window.__v === document.querySelector("#vid"),
    t: document.querySelector("#vid").currentTime,
    paused: document.querySelector("#vid").paused,
  }));
  check(
    "video continues across language switch",
    v2.same && v2.t > t1 && !v2.paused,
    `t1=${t1.toFixed(2)} t2=${v2.t.toFixed(2)} same=${v2.same}`,
  );
  await pg.evaluate(() => document.querySelector("#vid").pause());
  await pg.waitForTimeout(300); // the pause event (which saves progress) fires asynchronously
  const prog = await pg.evaluate(() =>
    JSON.parse(localStorage.getItem("archive-progress-v4") || "{}"),
  );
  check(
    "progress saved under the v1 key",
    prog[ids.with_subs] > 0,
    JSON.stringify(prog),
  );
  await pg.context().close();

  // 3. recitation slot ships silent and honest
  pg = await page(browser);
  await pg.goto("http://archive.test/?splash=0");
  await pg.waitForTimeout(800);
  const rec = await pg.evaluate(() => ({
    dis: ["#recPlay", "#recReplay", "#recMute", "#recVol"].every(
      (s) => document.querySelector(s).disabled,
    ),
    status: document.querySelector("#recStatus").textContent,
    audio: document.querySelector("#recAudio").getAttribute("src"),
  }));
  check(
    "Listen controls disabled, honest status, no audio src",
    rec.dis && /الترخيص/.test(rec.status) && !rec.audio,
    JSON.stringify(rec),
  );
  await pg.context().close();

  // 4. opening holds only verse, citation, name, ONE button; Escape skips
  pg = await page(browser);
  await pg.goto("http://archive.test/?splash=1");
  await pg.waitForTimeout(600);
  const op = await pg.evaluate(() => ({
    buttons: document.querySelectorAll(
      "#splash button, #splash input, #splash select",
    ).length,
    verse: document.querySelector(".sp-verse").textContent,
    birds: document.querySelectorAll("#sky .bird").length,
  }));
  check(
    "opening: one button, verse with U+06DD marker, birds present",
    op.buttons === 1 && op.verse.includes("۝") && op.birds >= 5,
    JSON.stringify(op),
  );
  await pg.keyboard.press("Escape");
  await pg.waitForTimeout(700);
  check(
    "Escape skips the opening",
    await pg.evaluate(() => document.querySelector("#splash").hidden),
    "splash hidden",
  );
  await pg.context().close();

  // 5. reduced motion: no running ambient animations
  pg = await page(browser, { reducedMotion: "reduce" });
  await pg.goto("http://archive.test/?splash=1");
  await pg.waitForTimeout(800);
  const anims = await pg.evaluate(
    () =>
      document.getAnimations().filter((x) => x.playState === "running").length,
  );
  check(
    "prefers-reduced-motion stops animation",
    anims === 0,
    "running animations=" + anims,
  );
  await pg.context().close();

  // 6. save persists under the v1 favourites key and shows on Saved
  pg = await page(browser);
  await pg.goto("http://archive.test/?splash=0#/library?scope=all");
  await pg.waitForTimeout(600);
  const fid = await pg.$eval("[data-fav]", (b) => b.dataset.fav);
  await pg.click("[data-fav]");
  await pg.goto("http://archive.test/?splash=0#/saved");
  await pg.reload();
  await pg.waitForTimeout(600);
  const saved = await pg.evaluate(
    (id) => ({
      store: JSON.parse(localStorage.getItem("archive-favorites-v4"))[id],
      cards: document.querySelectorAll("#v-saved .lcard").length,
    }),
    fid,
  );
  check(
    "Save persists and appears on Saved",
    saved.store === true && saved.cards === 1,
    JSON.stringify(saved),
  );
  await pg.context().close();

  await browser.close();
  console.log("FAILURES:", fails);
  process.exit(fails ? 1 : 0);
})();
