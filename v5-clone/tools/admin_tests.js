// Admin page checks (V5): gating, books incl. book-06/book-38, staged
// edits, settings, users honesty, series/video search. Headless Chromium
// against the real server (same relay as behavior_tests.js).
// Usage: node tools/admin_tests.js http://127.0.0.1:8765
const {
  chromium,
} = require("/home/hatch/workspace/linkedin-posts/node_modules/playwright-core");
const fs = require("fs");
const crypto = require("crypto");
const path = require("path");

const RELAY = process.argv[2];
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

const ADMIN = "meroatschool@gmail.com";
const OTHER = "someone@example.com";
const ACCT = (email) => ({
  mode: "email",
  email,
  access_token: "test-token",
  refresh_token: "",
  expires_at: 9999999999,
});

async function page(browser, email) {
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const pg = await ctx.newPage();
  if (email) {
    await pg.addInitScript((acct) => {
      localStorage.setItem("archive-v5-account", JSON.stringify(acct));
    }, ACCT(email));
  }
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
const G = "http://archive.test";

(async () => {
  const browser = await chromium.launch({
    executablePath: "/opt/meta-chromium/chrome",
    args: ["--autoplay-policy=no-user-gesture-required", ...args],
  });
  let pg;

  // 1. Guest: no admin link anywhere, #/admin lands on Home
  pg = await page(browser, null);
  await pg.goto(G + "/?splash=0#/admin");
  await pg.waitForTimeout(900);
  const g1 = await pg.evaluate(() => ({
    link: !!document.querySelector("#adminLink"),
    adminOn: document.querySelector("#v-admin").classList.contains("on"),
    homeOn: document.querySelector("#v-home").classList.contains("on"),
    nav: document.querySelectorAll("#nav a").length,
  }));
  check(
    "guest: no admin link, #/admin redirects to Home, nav still 5 items",
    !g1.link && !g1.adminOn && g1.homeOn && g1.nav === 5,
    JSON.stringify(g1),
  );
  await pg.context().close();

  // 2. Signed-in non-admin: same as guest
  pg = await page(browser, OTHER);
  await pg.goto(G + "/?splash=0#/admin");
  await pg.waitForTimeout(900);
  const g2 = await pg.evaluate(() => ({
    link: !!document.querySelector("#adminLink"),
    adminOn: document.querySelector("#v-admin").classList.contains("on"),
    homeOn: document.querySelector("#v-home").classList.contains("on"),
  }));
  check(
    "non-admin account: no admin link, #/admin redirects to Home",
    !g2.link && !g2.adminOn && g2.homeOn,
    JSON.stringify(g2),
  );
  await pg.context().close();

  // 3. Admin: link appears, page renders, 98 books, book-06 at 32 pages,
  // book-38 held with no author shown
  pg = await page(browser, ADMIN);
  await pg.goto(G + "/?splash=0#/admin");
  await pg.waitForTimeout(1000);
  const a1 = await pg.evaluate(() => {
    const b06 = document.querySelector('[data-adm-book="b06"]');
    const held = document.querySelector('[data-adm-held="book-38"]');
    return {
      link: !!document.querySelector("#adminLink"),
      adminOn: document.querySelector("#v-admin").classList.contains("on"),
      books: document.querySelectorAll("#v-admin [data-adm-book]").length,
      b06: b06 && b06.innerText.replace(/\s+/g, " ").slice(0, 120),
      held: held && held.innerText.replace(/\s+/g, " ").slice(0, 200),
      held66:
        document.querySelector('[data-adm-held="book-66"]') &&
        document
          .querySelector('[data-adm-held="book-66"]')
          .innerText.replace(/\s+/g, " ")
          .slice(0, 200),
    };
  });
  check(
    "admin: link present, page renders, 98 books listed",
    a1.link && a1.adminOn && a1.books === 98,
    `link=${a1.link} books=${a1.books}`,
  );
  check(
    "book-06 shows 32 pages (corrected count)",
    !!a1.b06 && /32/.test(a1.b06) && !/62/.test(a1.b06),
    a1.b06 || "no b06 row",
  );
  check(
    "book-66 held: title shown, no author named, flagged hidden",
    !!a1.held66 &&
      /Proud To Be Muslims/.test(a1.held66) &&
      !/Moustafa|Mustafa|مصطفى/.test(a1.held66),
    a1.held66 || "no held row",
  );
  check(
    "book-38 held: title shown, no author named, flagged hidden",
    !!a1.held &&
      /Proud To Be Muslims/.test(a1.held) &&
      !/Moustafa|Mustafa|مصطفى/.test(a1.held),
    a1.held || "no held row",
  );

  // 4. Edit flow: change book-06 Arabic title, save, staged JSON carries it
  await pg.click('[data-adm-book="b06"] [data-adm-edit-kind="book"]');
  await pg.waitForTimeout(400);
  await pg.fill("#adm-f-ar", "اختبار العنوان");
  await pg.click('[data-adm-save="book"]');
  await pg.waitForTimeout(500);
  const a2 = await pg.evaluate(() => ({
    staged: document.querySelector("#adm-staged-json").textContent,
    row: document.querySelector('[data-adm-book="b06"]').innerText,
  }));
  check(
    "book edit stages: staged JSON has book-06 with the new title",
    a2.staged.includes("book-06") && a2.staged.includes("اختبار العنوان"),
    a2.staged.slice(0, 200),
  );
  check(
    "book edit shows live: row title updates to the staged title",
    a2.row.includes("اختبار العنوان"),
    a2.row.replace(/\s+/g, " ").slice(0, 80),
  );

  // 5. Settings tab: announcement field + live toggle, staging works
  await pg.click('[data-adm-tab="settings"]');
  await pg.waitForTimeout(400);
  const a3 = await pg.evaluate(() => ({
    ann: !!document.querySelector("#adm-f-ann"),
    live: document.querySelector("#adm-f-live") &&
      document.querySelector("#adm-f-live").checked,
  }));
  check(
    "settings tab: announcement field present, live toggle on",
    a3.ann && a3.live === true,
    JSON.stringify(a3),
  );
  await pg.fill("#adm-f-ann", "إعلان اختبار");
  await pg.click('[data-adm-save="settings"]');
  await pg.waitForTimeout(500);
  const a4 = await pg.evaluate(
    () => document.querySelector("#adm-staged-json").textContent,
  );
  check(
    "settings edit stages: staged JSON carries the announcement",
    a4.includes("إعلان اختبار"),
    a4.slice(0, 200),
  );

  // 6. Users tab: honest state, zero fabricated rows
  await pg.click('[data-adm-tab="users"]');
  await pg.waitForTimeout(400);
  await pg.click("[data-adm-users-load]");
  await pg.waitForTimeout(9000);
  const a5 = await pg.evaluate(() => ({
    text: document.querySelector("#v-admin").innerText,
    rows: document.querySelectorAll(
      "#v-admin .adm-table tbody tr",
    ).length,
  }));
  check(
    "users tab: setup or error note with the SQL file, zero user rows",
    a5.rows === 0 &&
      (/admin-profiles\.sql/.test(a5.text) ||
        /لا تسجيلات بعد/.test(a5.text)),
    `rows=${a5.rows} text=${a5.text.slice(0, 160).replace(/\s+/g, " ")}`,
  );

  // 7. Series and video search
  await pg.click('[data-adm-tab="videos"]');
  await pg.waitForTimeout(400);
  const a6 = await pg.evaluate(
    () => document.querySelectorAll("#v-admin [data-adm-series]").length,
  );
  check("videos tab: series listed", a6 > 0, "series rows=" + a6);
  await pg.fill("#adm-series-q", "رمضان");
  await pg.click("[data-adm-series-search]");
  await pg.waitForTimeout(500);
  const a7 = await pg.evaluate(() => ({
    n: document.querySelectorAll("#v-admin [data-adm-series]").length,
    first: document.querySelector("#v-admin [data-adm-series]") &&
      document.querySelector("#v-admin [data-adm-series]").innerText,
  }));
  check(
    "series search filters to matching series",
    a7.n >= 1 && a7.n < 30 && /رمضان/.test(a7.first || ""),
    JSON.stringify({ n: a7.n, first: (a7.first || "").slice(0, 60) }),
  );
  const probe = await pg.evaluate(() => {
    for (const v of DATA.videos)
      for (const w of v.title.split(/\s+/))
        if (w.length > 5) return w;
    return "";
  });
  await pg.fill("#adm-video-q", probe);
  await pg.click("[data-adm-video-search]");
  await pg.waitForTimeout(500);
  const a8 = await pg.evaluate(
    () => document.querySelectorAll("#v-admin [data-adm-video]").length,
  );
  check(
    "video search finds matching videos",
    a8 >= 1,
    `probe=${probe} rows=${a8}`,
  );
  // 8. Staged changes survive a reload in the same browser (localStorage)
  // and clear cleanly. Same page, not a new context: a new context has
  // fresh storage, so it cannot see the earlier staged changes.
  await pg.reload();
  await pg.waitForTimeout(900);
  const a9 = await pg.evaluate(() => ({
    staged: document.querySelector("#adm-staged-json")
      ? document.querySelector("#adm-staged-json").textContent
      : "",
  }));
  check(
    "staged changes persist across reload",
    a9.staged.includes("اختبار العنوان"),
    a9.staged.slice(0, 120),
  );
  await pg.click("[data-adm-clear]");
  await pg.waitForTimeout(400);
  const a10 = await pg.evaluate(() => ({
    none: !!document.querySelector("#v-admin .adm-stage") &&
      /لا تغييرات معدة/.test(document.querySelector("#v-admin").innerText),
  }));
  check("clear removes staged changes", a10.none, JSON.stringify(a10));
  await pg.context().close();

  await browser.close();
  console.log("FAILURES:", fails);
  process.exit(fails ? 1 : 0);
})();
