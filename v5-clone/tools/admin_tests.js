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
const os = require("os");
const { execFileSync } = require("child_process");

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

// rewrite: optional function applied to the served HTML (used to inject a
// test admin-overrides object, exactly as build.py would embed it).
async function page(browser, email, rewrite) {
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
    let body = r.method() === "HEAD" ? "" : Buffer.from(await res.arrayBuffer());
    const headers = Object.fromEntries(res.headers);
    if (rewrite && /text\/html/.test(headers["content-type"] || "")) {
      body = rewrite(body.toString("utf8"));
      delete headers["content-length"];
    }
    await route.fulfill({ status: res.status, headers, body });
  });
  return pg;
}
const withOverrides = (ov) => (html) => {
  const out = html.replace(
    /const ADMIN_OVERRIDES = .*?;<\/script>/,
    () => "const ADMIN_OVERRIDES = " + JSON.stringify(ov) + ";</script>",
  );
  if (out === html) throw new Error("ADMIN_OVERRIDES not found in the page");
  return out;
};
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
  // The page-count cell, not the whole row: the row also shows the committed
  // note, which says "not 62" (Nov 25 2026: the note now shows, as intended).
  const b06pages = await pg.evaluate(
    () => document.querySelector('[data-adm-book="b06"] td.num').textContent,
  );
  check(
    "book-06 shows 32 pages (corrected count)",
    b06pages === "32",
    `pages cell=${b06pages} row=${a1.b06}`,
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

  // [new] Admin adds and edits (Nov 25 2026): add a book, edit book fields,
  // add a series, add videos by YouTube link, reorder and remove videos.
  pg = await page(browser, ADMIN);
  await pg.goto(G + "/?splash=0#/admin");
  await pg.waitForTimeout(1000);
  const stagedObj = () =>
    pg.evaluate(() => {
      const el = document.querySelector("#adm-staged-json");
      return el ? JSON.parse(el.textContent) : {};
    });
  const noticeText = () =>
    pg.evaluate(() => {
      const n = document.querySelector("#adm-notice");
      return n && !n.hidden ? n.textContent : "";
    });
  await pg.click('[data-adm-add="book"]');
  await pg.waitForTimeout(300);
  const addNote = await pg.evaluate(
    () => document.querySelector("#adm-add-book").innerText,
  );
  await pg.fill("#adm-n-ar", "كتاب اختبار مضاف");
  await pg.fill("#adm-n-en", "Added Test Book");
  await pg.selectOption("#adm-n-lang", "en");
  await pg.fill("#adm-n-pages", "12");
  await pg.fill("#adm-n-file", "not a file.txt");
  await pg.click('[data-adm-add-save="book"]');
  await pg.waitForTimeout(300);
  const badFile = {
    notice: await noticeText(),
    kept: await pg.evaluate(() => document.querySelector("#adm-n-ar").value),
  };
  badFile.staged = Object.keys((await stagedObj()).books || {}).some((k) =>
    k.startsWith("book-n"),
  );
  await pg.fill("#adm-n-file", "added-test-book.pdf");
  await pg.click('[data-adm-add-save="book"]');
  await pg.waitForTimeout(400);
  const n1 = await stagedObj();
  const addKey = Object.keys(n1.books || {}).find((k) => k.startsWith("book-n"));
  const nb = addKey ? n1.books[addKey] : {};
  check(
    "[new] add book: staged with title, language, pages and file; the repo-upload note is shown; a bad file name is refused and keeps the typed values",
    !!addKey &&
      nb.new === true &&
      nb.title_ar === "كتاب اختبار مضاف" &&
      nb.title_en === "Added Test Book" &&
      nb.lang === "en" &&
      nb.pages === 12 &&
      nb.file === "added-test-book.pdf" &&
      /الجلب اليومي/.test(addNote) &&
      !!badFile.notice &&
      badFile.kept === "كتاب اختبار مضاف" &&
      !badFile.staged &&
      !!(await pg.$('[data-adm-added-book="' + addKey + '"]')),
    JSON.stringify({ addKey, nb, badFile }),
  );

  await pg.click('[data-adm-book="b05"] [data-adm-edit-kind="book"]');
  await pg.waitForTimeout(300);
  await pg.selectOption("#adm-f-lang", "ar-en");
  await pg.fill("#adm-f-pages", "77");
  await pg.fill("#adm-f-file", "renamed-test-file.pdf");
  await pg.click('[data-adm-save="book"]');
  await pg.waitForTimeout(300);
  await pg.click('[data-adm-book="b06"] [data-adm-edit-kind="book"]');
  await pg.waitForTimeout(300);
  await pg.fill("#adm-f-en", "Family Sermons Test");
  await pg.click('[data-adm-save="book"]');
  await pg.waitForTimeout(300);
  await pg.click('[data-adm-book="b01"] [data-adm-edit-kind="book"]');
  await pg.waitForTimeout(300);
  const multi = await pg.evaluate(() => ({
    file: !!document.querySelector("#adm-f-file"),
    pages: !!document.querySelector("#adm-f-pages"),
    lang: !!document.querySelector("#adm-f-lang"),
  }));
  await pg.click("[data-adm-cancel]");
  const n2 = await stagedObj();
  check(
    "[new] edit book fields: language, pages and file staged under the source id; committed fields kept; multi-file books edit title and language only",
    JSON.stringify(n2.books["book-05"]) ===
      JSON.stringify({ lang: "ar-en", pages: 77, file: "renamed-test-file.pdf" }) &&
      n2.books["book-06"].title_en === "Family Sermons Test" &&
      n2.books["book-06"].pages === 32 &&
      !!n2.books["book-06"].note &&
      !n2.books.b05 &&
      !multi.file &&
      !multi.pages &&
      multi.lang,
    JSON.stringify({ b05: n2.books["book-05"], b06: n2.books["book-06"], multi }),
  );

  await pg.click('[data-adm-tab="videos"]');
  await pg.waitForTimeout(300);
  const PL = "PLtestAddedSeries0001";
  await pg.click('[data-adm-add="series"]');
  await pg.fill(
    "#adm-n-pl",
    "https://www.youtube.com/playlist?list=" + PL + "&si=abc",
  );
  await pg.fill("#adm-n-title", "سلسلة اختبار مضافة");
  await pg.fill("#adm-n-titleen", "Added Test Series");
  await pg.click('[data-adm-add-save="series"]');
  await pg.waitForTimeout(400);
  const n3 = await stagedObj();
  const editorOpen = await pg.evaluate(() => !!document.querySelector("#adm-n-yt"));
  check(
    "[new] add series: playlist ID read from the link, staged as a new series with both titles, editor opens",
    JSON.stringify(n3.series[PL]) ===
      JSON.stringify({
        new: true,
        items: [],
        title: "سلسلة اختبار مضافة",
        titleEn: "Added Test Series",
      }) && editorOpen,
    JSON.stringify({ s: n3.series[PL], editorOpen }),
  );

  const existing = await pg.evaluate(() => DATA.videos[5].id);
  await pg.fill("#adm-n-yt", "not a link");
  await pg.click("[data-adm-add-video]");
  await pg.waitForTimeout(200);
  const badYt = await noticeText();
  const addVid = async (link, title) => {
    await pg.fill("#adm-n-yt", link);
    await pg.fill("#adm-n-vtitle", title);
    await pg.click("[data-adm-add-video]");
    await pg.waitForTimeout(300);
  };
  await addVid("https://youtu.be/AbCdEfGhIj0?t=5", "درس اختبار أول");
  await addVid(
    "https://www.youtube.com/watch?v=" + existing + "&list=" + PL,
    "",
  );
  await addVid("https://www.youtube.com/shorts/ZyXwVuTsRq9", "درس اختبار ثان");
  const n4 = await stagedObj();
  check(
    "[new] add video by YouTube link: IDs extracted from youtu.be, watch?v= and shorts links; a catalog video needs no title; a bad link is refused",
    JSON.stringify(n4.series[PL].items) ===
      JSON.stringify(["AbCdEfGhIj0", existing, "ZyXwVuTsRq9"]) &&
      JSON.stringify(n4.videos.AbCdEfGhIj0) ===
        JSON.stringify({ new: true, title: "درس اختبار أول" }) &&
      !n4.videos[existing] &&
      !!badYt,
    JSON.stringify({ items: n4.series[PL].items, videos: n4.videos, badYt }),
  );
  await pg.click('[data-adm-item-op="up"][data-adm-item-idx="2"]');
  await pg.waitForTimeout(300);
  await pg.click('[data-adm-item-op="remove"][data-adm-item-idx="0"]');
  await pg.waitForTimeout(300);
  const n5 = await stagedObj();
  check(
    "[new] reorder and remove videos in an added series; a removed new video leaves the staged file",
    JSON.stringify(n5.series[PL].items) ===
      JSON.stringify(["ZyXwVuTsRq9", existing]) &&
      !n5.videos.AbCdEfGhIj0 &&
      !!n5.videos.ZyXwVuTsRq9,
    JSON.stringify({ items: n5.series[PL].items, videos: n5.videos }),
  );
  // a catalog series with at least three videos, among the rows the tab lists
  const pl0 = await pg.evaluate(() => {
    const p = DATA.playlists.slice(0, 25).find((x) => x.items.length >= 3);
    return { id: p.id, ids: p.items.map((x) => x.id) };
  });
  const PL0 = pl0.id,
    base0 = pl0.ids;
  await pg.click('[data-adm-cancel]');
  await pg.click(
    '[data-adm-series="' + PL0 + '"] [data-adm-edit-kind="series"]',
  );
  await pg.waitForTimeout(300);
  await pg.click('[data-adm-item-op="up"][data-adm-item-idx="1"]');
  await pg.waitForTimeout(300);
  const n6 = await stagedObj();
  const want0 = [base0[1], base0[0], ...base0.slice(2)];
  check(
    "[new] reorder videos in a catalog series: the new order is staged as the series item list",
    JSON.stringify(n6.series[PL0].items) === JSON.stringify(want0),
    JSON.stringify({ staged: n6.series[PL0], want: want0 }),
  );

  await pg.click('[data-adm-tab="settings"]');
  await pg.waitForTimeout(300);
  await pg.fill("#adm-f-admins", "not-an-email");
  await pg.click('[data-adm-save="settings"]');
  await pg.waitForTimeout(200);
  const badAdm = await noticeText();
  await pg.fill(
    "#adm-f-admins",
    "meroatschool@gmail.com\nsecond-admin@example.com",
  );
  await pg.click('[data-adm-save="settings"]');
  await pg.waitForTimeout(300);
  const n7 = await stagedObj();
  check(
    "[new] admin list editable in Settings: staged as settings.adminEmails; an invalid list is refused",
    JSON.stringify(n7.settings.adminEmails) ===
      JSON.stringify(["meroatschool@gmail.com", "second-admin@example.com"]) &&
      !!badAdm,
    JSON.stringify({ settings: n7.settings, badAdm }),
  );
  await pg.context().close();

  // [new] The exported file passes the real build: build.py's own override
  // validation, book assembly and series checks run on exactly that JSON.
  const V5 = path.join(__dirname, "..");
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "adm-ov-"));
  fs.writeFileSync(path.join(tmp, "admin-overrides.json"), JSON.stringify(n7));
  fs.symlinkSync(path.join(V5, "src", "assets"), path.join(tmp, "assets"));
  let built = null,
    buildErr = "";
  try {
    built = JSON.parse(
      execFileSync(
        "python3",
        [
          "-c",
          [
            "import json, pathlib, sys",
            "import build",
            "build.SRC = pathlib.Path(sys.argv[1])",
            "ov = build.admin_overrides()",
            "works = json.loads(build.books_literal()[0])",
            "base, _ = build.data_literal((build.V5P / 'audit' / 'catalog-reconciled.js').read_text(encoding='utf-8'))",
            "build.check_catalog_overrides(ov, base)",
            "base_url = (build.V5P / 'books-base.txt').read_text().strip().rstrip('/')",
            "print(json.dumps({'base': base_url, 'works': [w for w in works if w['id'] in ('b05', 'b06') or w['id'].startswith('bn')]}))",
          ].join("\n"),
          tmp,
        ],
        { cwd: V5, encoding: "utf8" },
      ),
    );
  } catch (e) {
    buildErr = String(e.stderr || e).slice(-400);
  }
  fs.rmSync(tmp, { recursive: true });
  const w = (id) => built && built.works.find((x) => x.id === id);
  const wn = built && built.works.find((x) => x.id.startsWith("bn"));
  check(
    "[new] export round-trip: the staged JSON passes build.py and yields the added book and the edited fields",
    !!built &&
      !!wn &&
      wn.ar === "كتاب اختبار مضاف" &&
      wn.lang === "en" &&
      wn.pages === 12 &&
      wn.parts[0].file === built.base + "/added-test-book.pdf" &&
      w("b05").lang === "ar-en" &&
      w("b05").pages === 77 &&
      w("b05").parts[0].file === built.base + "/renamed-test-file.pdf" &&
      w("b06").en === "Family Sermons Test" &&
      w("b06").pages === 32,
    buildErr || JSON.stringify({ added: wn, b05: w("b05") }).slice(0, 400),
  );

  // [new] The added series and video render like any other series and play
  // through the existing privacy-enhanced YouTube embed.
  pg = await page(browser, null, withOverrides(n7));
  await pg.goto(G + "/?splash=0#/playlist/" + PL);
  await pg.waitForTimeout(1200);
  const r1 = await pg.evaluate(() => ({
    on: document.querySelector("#v-playlist").classList.contains("on"),
    h1: (document.querySelector("#v-playlist h1") || {}).textContent,
    lessons: [
      ...new Set(
        [...document.querySelectorAll('#plGrid a[href^="#/lesson/"]')].map(
          (a) => a.getAttribute("href").split("?")[0],
        ),
      ),
    ],
  }));
  await pg.goto(
    G + "/?splash=0#/library?q=" + encodeURIComponent("سلسلة اختبار مضافة"),
  );
  await pg.waitForTimeout(1200);
  const inLib = await pg.evaluate(
    (pl) => !!document.querySelector('#v-library a[href^="#/playlist/' + pl + '"]'),
    PL,
  );
  check(
    "[new] added series renders like any other series: its page, its two lessons in order, found by library search",
    r1.on &&
      r1.h1 === "سلسلة اختبار مضافة" &&
      JSON.stringify(r1.lessons) ===
        JSON.stringify(["#/lesson/ZyXwVuTsRq9", "#/lesson/" + existing]) &&
      inLib,
    JSON.stringify({ ...r1, inLib }),
  );
  await pg.goto(G + "/?splash=0#/lesson/ZyXwVuTsRq9?pl=" + PL);
  await pg.waitForTimeout(1500);
  const r2 = await pg.evaluate(() => ({
    h1: (document.querySelector("#lsInfo h1") || {}).textContent,
    src: document.querySelector("#ytFrame").getAttribute("src"),
    shown: document.querySelector("#ytFrame").style.display,
    series: (document.querySelector("#lsInfo .pill") || {}).textContent,
  }));
  check(
    "[new] added video plays via the existing nocookie YouTube embed, inside its series",
    r2.h1 === "درس اختبار ثان" &&
      r2.src ===
        "https://www.youtube-nocookie.com/embed/ZyXwVuTsRq9?rel=0&autoplay=1" &&
      r2.shown === "block" &&
      r2.series === "سلسلة اختبار مضافة",
    JSON.stringify(r2),
  );
  await pg.goto(G + "/?splash=0#/playlist/" + PL0);
  await pg.waitForTimeout(1200);
  const r3 = await pg.evaluate(() =>
    [
      ...new Set(
        [...document.querySelectorAll('#plGrid a[href^="#/lesson/"]')].map(
          (a) => a.getAttribute("href").split("?")[0].slice(9),
        ),
      ),
    ].slice(0, 3),
  );
  check(
    "[new] a reordered catalog series renders in the new order",
    JSON.stringify(r3) === JSON.stringify(want0.slice(0, 3)),
    JSON.stringify({ shown: r3, want: want0.slice(0, 3) }),
  );
  await pg.context().close();

  // [new] The admin list comes from settings.adminEmails in the committed overrides.
  const listOv = { ...n7, settings: { adminEmails: ["second-admin@example.com"] } };
  const linkFor = async (email) => {
    const p = await page(browser, email, withOverrides(listOv));
    await p.goto(G + "/?splash=0#/home");
    await p.waitForTimeout(900);
    const on = !!(await p.$("#adminLink"));
    await p.context().close();
    return on;
  };
  const second = await linkFor("second-admin@example.com");
  const owner = await linkFor(ADMIN);
  check(
    "[new] admin list from settings.adminEmails: a listed email gets the admin page, an unlisted one does not",
    second && !owner,
    JSON.stringify({ second, owner }),
  );

  // [new] The Sheikh is on the committed admin list; the gate ignores case on both sides.
  const sheikhOv = {
    ...n7,
    settings: { adminEmails: [ADMIN, "SheikhMoustafaKamel@gmail.com"] },
  };
  // No rewrite = the built site with the committed overrides.
  const gate = async (email, ov) => {
    const p = await page(browser, email, ov && withOverrides(ov));
    await p.goto(G + "/?splash=0#/admin");
    await p.waitForTimeout(900);
    const on = await p.evaluate(
      () =>
        !!document.querySelector("#adminLink") &&
        document.querySelector("#v-admin").classList.contains("on"),
    );
    await p.context().close();
    return on;
  };
  const sk = {
    lower: await gate("sheikhmoustafakamel@gmail.com"),
    caps: await gate("SheikhMoustafaKamel@gmail.com"),
    capsInList: await gate("sheikhmoustafakamel@gmail.com", sheikhOv),
    owner: await gate(ADMIN),
    unlisted: await gate("someone-else@example.com"),
  };
  check(
    "[new] the Sheikh's email gets the admin page in any letter case; an unlisted email does not",
    sk.lower && sk.caps && sk.capsInList && sk.owner && !sk.unlisted,
    JSON.stringify(sk),
  );

  await browser.close();
  console.log("FAILURES:", fails);
  process.exit(fails ? 1 : 0);
})();
