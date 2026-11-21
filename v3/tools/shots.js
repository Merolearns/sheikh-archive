// v3 headless screenshots of every major screen, with per-shot checks: console errors, horizontal
// overflow, broken images, html dir, and any request that leaves the archive origin (aborted + counted).
// Usage: node tools/shots.js http://127.0.0.1:8765 [filter]
const { chromium } = require("/home/hatch/.npm/_npx/9833c18b2d85bc59/node_modules/playwright-core");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

function hatchPolicy() {
  const p = "/var/lib/hatch-browser/rootfs-base/usr/share/hatch/chromium/webgl-allowed-domains.txt";
  if (!fs.existsSync(p)) return [];
  const h = crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex");
  return [`--hatch-webgl-allowed-domains-file=${p}`, `--hatch-webgl-allowed-domains-sha256=${h}`];
}
const RELAY = process.argv[2];
const BASE = "http://archive.test";
const FILTER = process.argv[3] || "";
const OUT = path.join(__dirname, "..", "shots");
fs.mkdirSync(OUT, { recursive: true });
const ids = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "testroot", "test-ids.json")));
const PL = "PLXKSrZvHoN9cmAY-O5kHl5JBsujbnpfIU"; // tajweed series, holds the beginner first lesson
const VP = { desktop: { width: 1440, height: 900 }, mobile: { width: 390, height: 844 } };

const shots = [];
for (const dev of ["desktop", "mobile"]) {
  for (const lang of ["ar", "en"]) {
    const q = `?splash=0&lang=${lang}`;
    shots.push([`${dev}-${lang}-opening-mid`, `/?splash=1&lang=${lang}`, dev, { wait: 1300 }]);
    shots.push([`${dev}-${lang}-opening`, `/?splash=1&lang=${lang}`, dev, { wait: 4200 }]);
    shots.push([`${dev}-${lang}-home`, `/${q}#/home`, dev, { full: true, wait: 1500 }]);
    shots.push([`${dev}-${lang}-library`, `/${q}#/library`, dev, { wait: 1200 }]);
    shots.push([`${dev}-${lang}-search`, `/${q}#/library?q=${encodeURIComponent("الصلاة")}`, dev, { wait: 1200 }]);
    shots.push([`${dev}-${lang}-playlist`, `/${q}#/playlist/${PL}`, dev, {}]);
    shots.push([`${dev}-${lang}-lesson`, `/${q}#/lesson/${ids.with_subs}`, dev, { wait: 1800, full: dev === "desktop" }]);
    shots.push([`${dev}-${lang}-start`, `/${q}#/start`, dev, { full: true }]);
    shots.push([`${dev}-${lang}-about`, `/${q}#/about`, dev, { full: true }]);
    shots.push([`${dev}-${lang}-mission`, `/${q}#/about/mission`, dev, { full: true }]);
    shots.push([`${dev}-${lang}-sheikh`, `/${q}#/about/sheikh`, dev, { full: true }]);
    shots.push([`${dev}-${lang}-saved`, `/${q}#/saved`, dev, {}]);
  }
  shots.push([`${dev}-ar-theme-picker`, `/?splash=0#/home`, dev, { click: "#themeBtn" }]);
  for (const th of ["emerald", "parchment", "midnight", "sand", "sunset", "puredark"])
    shots.push([`${dev}-theme-${th}-home`, `/?splash=0&theme=${th}#/home`, dev, { wait: 1200 }]);
}
shots.push(["desktop-ar-opening-calm", "/?splash=1&calm=1", "desktop", { wait: 600, reduced: true }]);
shots.push(["desktop-ar-error-404", `/?splash=0#/lesson/${ids.missing}`, "desktop", { wait: 2500, expectErrors: true, click: "details summary" }]);
shots.push(["desktop-ar-error-format", `/?splash=0#/lesson/${ids.corrupt}`, "desktop", { wait: 2500, expectErrors: true }]);

(async () => {
  const browser = await chromium.launch({
    executablePath: "/opt/meta-chromium/chrome",
    args: ["--autoplay-policy=no-user-gesture-required", ...hatchPolicy()],
  });
  const report = [];
  let bads = 0;
  for (const [name, url, dev, o] of shots) {
    if (FILTER && !name.includes(FILTER)) continue;
    const ctx = await browser.newContext({
      viewport: VP[dev], deviceScaleFactor: 1, isMobile: dev === "mobile", hasTouch: dev === "mobile",
      reducedMotion: o.reduced ? "reduce" : "no-preference",
    });
    const page = await ctx.newPage();
    const ext = [];
    await page.route("**/*", async (route) => {
      const r = route.request();
      const u = new URL(r.url());
      if (u.origin !== BASE) {
        if (!u.protocol.startsWith("data") && !u.protocol.startsWith("blob")) ext.push(r.url().slice(0, 100));
        return route.abort();
      }
      // Chromium here refuses loopback, so this process relays archive.test to the real server.
      const res = await fetch(RELAY + u.pathname + u.search, { method: r.method(), headers: r.headers().range ? { range: r.headers().range } : {} });
      const body = r.method() === "HEAD" ? "" : Buffer.from(await res.arrayBuffer());
      await route.fulfill({ status: res.status, headers: Object.fromEntries(res.headers), body });
    });
    const errs = [];
    page.on("console", (m) => m.type() === "error" && errs.push("console: " + m.text()));
    page.on("pageerror", (e) => errs.push("pageerror: " + e.message));
    page.on("response", (r) => r.status() >= 400 && errs.push(r.status() + ": " + decodeURIComponent(r.url()).slice(0, 110)));
    await page.goto(BASE + url, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(o.wait || 800);
    if (o.click) {
      await page.click(o.click).catch((e) => errs.push("click: " + e.message.split("\n")[0]));
      await page.waitForTimeout(700);
    }
    if (o.full) {
      // walk the page so lazy covers load, as they would for a reader scrolling
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }
        scrollTo(0, 0);
      });
      await page.waitForTimeout(900);
    }
    const c = await page.evaluate((vw) => ({
      // against the device width: mobile emulation widens innerWidth to fit overflowing content
      overflowX: Math.max(document.documentElement.scrollWidth, innerWidth) - vw,
      broken: [...document.images].filter((i) => i.complete && i.naturalWidth === 0 && i.getAttribute("src") && i.offsetParent).length,
      dir: document.documentElement.dir,
    }), VP[dev].width);
    await page.screenshot({ path: path.join(OUT, name + ".png"), fullPage: !!o.full });
    const bad = (!o.expectErrors && errs.length) || c.overflowX > 0 || c.broken || c.dir !== "rtl" || ext.length;
    bads += !!bad;
    report.push(`${bad ? "FAIL" : "ok  "} ${name} overflowX=${c.overflowX} brokenImgs=${c.broken} htmlDir=${c.dir} external=${ext.length} errors=${errs.length}${errs.length ? " [" + errs.slice(0, 3).join(" | ") + "]" : ""}${ext.length ? " EXT[" + ext.slice(0, 2).join(" | ") + "]" : ""}`);
    await ctx.close();
  }
  await browser.close();
  report.push(`SHOTS ${report.length}, FAILURES ${bads}`);
  console.log(report.join("\n"));
  fs.writeFileSync(path.join(OUT, "report.txt"), report.join("\n") + "\n");
})();
