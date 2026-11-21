// Headless screenshots of every major view + per-shot console/overflow/broken-image checks.
// Usage: node tools/shots.js http://127.0.0.1:8765 [filter]
const {
  chromium,
} = require("/home/hatch/.npm/_npx/9833c18b2d85bc59/node_modules/playwright-core");
const fs = require("fs");
const crypto = require("crypto");
// this Chromium build requires the platform's read-only WebGL policy file and its hash at launch
function hatchPolicy() {
  const p = "/var/lib/hatch-browser/rootfs-base/usr/share/hatch/chromium/webgl-allowed-domains.txt";
  if (!fs.existsSync(p)) return [];
  const h = crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex");
  return [`--hatch-webgl-allowed-domains-file=${p}`, `--hatch-webgl-allowed-domains-sha256=${h}`];
}
const path = require("path");

const RELAY = process.argv[2].startsWith("http") ? process.argv[2] : null;
const BASE = RELAY ? "http://archive.test" : process.argv[2]; // http://... or file:///.../testroot/index-file.html
const FILTER = process.argv[3] || "";
const OUT = path.join(__dirname, "..", "shots");
fs.mkdirSync(OUT, { recursive: true });
const ids = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "testroot", "test-ids.json")),
);
const PL = "PLXKSrZvHoN9e4KqDBpbjQWPNbyfbJJcTJ";
const VP = {
  desktop: { width: 1440, height: 900 },
  mobile: { width: 390, height: 844 },
};

const shots = [];
for (const dev of ["desktop", "mobile"]) {
  for (const lang of ["ar", "en"]) {
    const q = `?splash=0&lang=${lang}`;
    shots.push([
      `${dev}-${lang}-opening`,
      `/?splash=1&lang=${lang}`,
      dev,
      { wait: 1500 },
    ]);
    shots.push([`${dev}-${lang}-home`, `/${q}#/home`, dev, { full: true }]);
    shots.push([`${dev}-${lang}-library`, `/${q}#/library`, dev, {}]);
    shots.push([
      `${dev}-${lang}-library-lessons`,
      `/${q}#/library?scope=all&q=${encodeURIComponent("الصلاة")}`,
      dev,
      {},
    ]);
    shots.push([`${dev}-${lang}-playlist`, `/${q}#/playlist/${PL}`, dev, {}]);
    shots.push([
      `${dev}-${lang}-lesson`,
      `/${q}#/lesson/${ids.with_subs}`,
      dev,
      { wait: 1500 },
    ]);
    shots.push([`${dev}-${lang}-start`, `/${q}#/start`, dev, { full: true }]);
    shots.push([`${dev}-${lang}-about`, `/${q}#/about`, dev, { full: true }]);
    shots.push([
      `${dev}-${lang}-mission`,
      `/${q}#/mission`,
      dev,
      { full: true },
    ]);
    shots.push([`${dev}-${lang}-sheikh`, `/${q}#/sheikh`, dev, {}]);
    shots.push([`${dev}-${lang}-saved`, `/${q}#/saved`, dev, {}]);
  }
  for (const th of [
    "emerald",
    "parchment",
    "midnight",
    "sand",
    "sunset",
    "puredark",
  ]) {
    shots.push([
      `${dev}-theme-${th}-home`,
      `/?splash=0&theme=${th}#/home`,
      dev,
      {},
    ]);
    shots.push([
      `${dev}-theme-${th}-library`,
      `/?splash=0&theme=${th}#/library`,
      dev,
      {},
    ]);
  }
}
shots.push([
  "desktop-ar-error-404",
  `/?splash=0#/lesson/${ids.missing}`,
  "desktop",
  { wait: 2500, expectErrors: true },
]);
shots.push([
  "desktop-ar-error-format",
  `/?splash=0#/lesson/${ids.corrupt}`,
  "desktop",
  { wait: 2500, expectErrors: true },
]);
shots.push([
  "desktop-en-captions",
  `/?splash=0&lang=en#/lesson/${ids.with_subs}?cc=ar`,
  "desktop",
  { wait: 2500, click: '[data-tx="ar"]' },
]);
shots.push([
  "desktop-ar-langs-dialog",
  `/?splash=0#/playlist/${PL}`,
  "desktop",
  { clickFirstLangs: true, wait: 800 },
]);

(async () => {
  const browser = await chromium.launch({
    executablePath: "/opt/meta-chromium/chrome",
    args: ["--autoplay-policy=no-user-gesture-required", ...hatchPolicy()],
  });
  const report = [];
  for (const [name, url, dev, o] of shots) {
    if (FILTER && !name.includes(FILTER)) continue;
    const ctx = await browser.newContext({
      viewport: VP[dev],
      deviceScaleFactor: 1,
      isMobile: dev === "mobile",
      hasTouch: dev === "mobile",
    });
    const page = await ctx.newPage();
    // Chromium here refuses loopback navigation, so this Node process relays every request for
    // http://archive.test to the real archive server (method, headers incl. Range, status, body).
    if (RELAY) await page.route("http://archive.test/**", async (route) => {
      const r = route.request();
      const u = new URL(r.url());
      const res = await fetch(RELAY + u.pathname + u.search, { method: r.method(), headers: r.headers().range ? { range: r.headers().range } : {} });
      const body = r.method() === "HEAD" ? "" : Buffer.from(await res.arrayBuffer());
      await route.fulfill({ status: res.status, headers: Object.fromEntries(res.headers), body });
    });
    const errs = [];
    page.on("console", (m) => {
      if (m.type() === "error") errs.push("console: " + m.text());
    });
    page.on("pageerror", (e) => errs.push("pageerror: " + e.message));
    page.on("requestfailed", (r) =>
      errs.push("requestfailed: " + r.url().slice(0, 120)),
    );
    page.on("response", (r) => {
      if (r.status() >= 400)
        errs.push(
          r.status() + ": " + decodeURIComponent(r.url()).slice(0, 120),
        );
    });
    await page.goto(BASE.startsWith("file:") ? BASE + url.slice(1) : BASE + url, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(o.wait || 700);
    if (o.click) {
      await page.click(o.click);
      await page.waitForTimeout(800);
    }
    if (o.clickFirstLangs) {
      const b = await page.$("[data-langs]");
      if (b) {
        await b.click();
        await page.click("[data-dlgtx]").catch(() => {});
      }
      await page.waitForTimeout(o.wait);
    }
    const checks = await page.evaluate(() => {
      const broken = Array.from(document.images)
        .filter(
          (i) =>
            i.complete &&
            i.naturalWidth === 0 &&
            i.getAttribute("src") &&
            i.offsetParent,
        )
        .map((i) => i.src.slice(-60));
      return {
        overflowX: document.documentElement.scrollWidth - window.innerWidth,
        broken: broken.length,
        dir: document.documentElement.dir,
      };
    });
    await page.screenshot({
      path: path.join(OUT, name + ".png"),
      fullPage: !!o.full,
    });
    const bad =
      (!o.expectErrors && errs.length) ||
      checks.overflowX > 0 ||
      checks.broken ||
      checks.dir !== "rtl";
    report.push(
      `${bad ? "FAIL" : "ok  "} ${name} overflowX=${checks.overflowX} brokenImgs=${checks.broken} htmlDir=${checks.dir} errors=${errs.length}${errs.length ? " [" + errs.slice(0, 3).join(" | ") + "]" : ""}`,
    );
    await ctx.close();
  }
  await browser.close();
  console.log(report.join("\n"));
  fs.writeFileSync(path.join(OUT, "report.txt"), report.join("\n") + "\n");
})();
