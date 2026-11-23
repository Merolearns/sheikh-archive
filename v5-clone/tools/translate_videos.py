#!/usr/bin/env python3
"""Batch-translate video titles (Arabic -> English) with Qwen (qwen-plus).

Reads audit/catalog-reconciled.js, skips titles that need no machine work
(no Arabic script -> copied verbatim; verse-fragment titles -> hand-done in
audit/verse-titles-en.tsv), and translates the rest in batches of 50 via the
stored custom.qwen credential (same surrogate mechanism as bin/qwen-chat).

Outputs:
  audit/mt-raw/batch-NNN.json  raw API reply + usage, one file per batch
  audit/video-en-mt.json       {Arabic title: English title} (consolidated)
  usage rows appended to ~/workspace/custom-connectors/custom.qwen/usage-log.tsv

Resume-safe: titles already present in video-en-mt.json are skipped.
A failed batch is retried up to 3 times; persistent failures are recorded
in audit/mt-failed.json and reported at the end (never silently dropped).

Usage:
  python3 tools/translate_videos.py [--limit N] [--batch N] [--only N]
    --limit N   translate only the first N titles (smoke test)
    --batch N   run only batch number N (0-based)
    --only N    run only the batch containing work-item N
"""
import argparse
import json
import re
import sys
import time
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, "/opt/muse/skills/custom-connector-setup/bin")
from dynamic_credentials import add_surrogate_to_request, read_json_response

V5P = Path(__file__).resolve().parent.parent
REC = V5P / "audit" / "catalog-reconciled.js"
SERIES_TSV = V5P / "audit" / "series-en.tsv"
VERSE_TSV = V5P / "audit" / "verse-titles-en.tsv"
MT_OUT = V5P / "audit" / "video-en-mt.json"
MT_RAW = V5P / "audit" / "mt-raw"
FAILED = V5P / "audit" / "mt-failed.json"
USAGE_LOG = Path.home() / "workspace/custom-connectors/custom.qwen/usage-log.tsv"

HOST = "dashscope-intl.aliyuncs.com"
BASE = f"https://{HOST}/compatible-mode/v1"
MODEL = "qwen-plus"
BATCH = 50

AR = re.compile(r"[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]")
AR_DIGITS = re.compile(r"[٠-٩]")

GLOSSARY = """شرح = Explanation of; مختصر = Abridgement of; تفسير = Tafsir of;
فقه = Fiqh; أصول الفقه = Usul al-Fiqh; التجويد = Tajweed; التوحيد = Tawhid;
العقيدة = Aqeedah; القرآن الكريم = the Noble Qur'an; السيرة النبوية = the Prophetic Seerah;
السنة النبوية = the Prophetic Sunna; صحيح البخاري = Sahih al-Bukhari;
شرح البخاري = Explanation of Sahih al-Bukhari; باب = Chapter; كتاب (in Bukhari) = Book;
الحديث رقم = Hadith no.; الدرس = Lesson; دروس = Lessons; خطبة/خطب = Sermon/Sermons;
الحلقة = Episode; المحاضرة = Lecture; الجزء = Part (book) / Juz' (Qur'an);
سورة = Surah; سؤال وجواب = Questions and Answers; ما حكم = What is the ruling on;
يجوز = permissible; لا يجوز = not permissible; حرام = forbidden; حلال = lawful;
الزكاة = Zakat; الحج = Hajj; الصلاة = Prayer; الصيام = Fasting; التراويح = Taraweeh;
العشاء = Isha; الفجر = Fajr; رمضان = Ramadan; شعبان = Sha'ban; رجب = Rajab;
ذي الحجة = Dhu al-Hijja; أسماء الله الحسنى = the Beautiful Names of Allah;
تزكية النفوس = Purification of the Soul; شمائل = Shama'il; الأخلاق = Character;
المسجد = Mosque; المرأة المسلمة = the Muslim Woman; الصحابة = the Companions;
الهجرة = the Hijra; الإسراء والمعراج = al-Isra' and al-Mi'raj.
Honorifics: ﷺ stays ﷺ; صلى الله عليه وسلم = peace be upon him;
عليه السلام = peace be upon him; رضي الله عنه = may Allah be pleased with him;
رضي الله عنها = may Allah be pleased with her; رضي الله عنهم = may Allah be pleased with them."""

FEWSHOT = """Examples (input -> output):
"٩٢٠- شرح البخاري ( باب الخلع وكيف الطلاق منه) الحديث برقم١٠٦٧" -> "920 - Explanation of Sahih al-Bukhari (Chapter: Khul' and How Divorce Follows from It), Hadith no. 1067"
"٨- تجويد ( المستوى الثاني) أحكام الميم الساكنة" -> "8 - Tajweed (Level Two): The Rules of the Silent Meem"
"خطبة الجمعة بعنوان التردد" -> "Friday Sermon Entitled 'Hesitation'"
"١٧-١٢- ما حكم ضياع الزكاة بعد عزلها؟" -> "17-12 - What Is the Ruling on Zakat That Is Lost After It Has Been Set Aside?"
"الحلقة التاسعة والعشرون من البرنامج الرمضاني وبشر المؤمنين بعنوان الاحترام" -> "Episode 29 of the Ramadan Programme 'And Give Glad Tidings to the Believers', Entitled 'Respect'"
"١٤ رمضان - حذيفة بن اليمان رضي الله عنه" -> "14 Ramadan - Hudhayfa ibn al-Yaman, may Allah be pleased with him\""""

SYSTEM = (
    "You are an expert translator of classical Islamic Arabic into clear, correct "
    "English. You translate lesson titles for a library of the lectures of Sheikh "
    "Dr. Moustafa Kamel. Translate faithfully: keep every number (lesson no., "
    "hadith no., episode no.) and convert Arabic-Indic digits to Latin digits. "
    "Keep the ﷺ ligature as ﷺ. Keep ruling words exact (permissible / not "
    "permissible / forbidden / lawful) — never soften a ruling. Use the glossary "
    "below; the same Arabic term must always become the same English word. "
    "Each input object carries a row id 'n' and a 'series' name for context only. "
    "Never include the row id or the series name in your translation — translate "
    "only the title text, adding no number, prefix, or word that is not in it."
)


def norm_ws(s):
    return re.sub(r"\s+", " ", s).strip()


def chat(model, system, prompt, max_tokens=8192):
    body = {
        "model": model,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": prompt},
        ],
        "max_tokens": max_tokens,
        "temperature": 0,
        "stream": False,
        "enable_thinking": False,
    }
    req = urllib.request.Request(
        f"{BASE}/chat/completions",
        data=json.dumps(body).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    add_surrogate_to_request(req, "custom.qwen", allowed_hosts=[HOST])
    opener = urllib.request.build_opener()
    with opener.open(req, timeout=180) as resp:
        return read_json_response(resp)


def log_usage(model, usage):
    row = "\t".join([
        datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "translation-en-batch",
        model,
        str(usage.get("prompt_tokens", "")),
        str(usage.get("completion_tokens", "")),
        str(usage.get("total_tokens", "")),
    ])
    with open(USAGE_LOG, "a", encoding="utf-8") as f:
        f.write(row + "\n")


def norm_ar(s):
    """Normalize Arabic spelling variants for comparison: alef forms,
    ta marbuta, and alef maksura are spelled inconsistently across the
    catalog (playlist 'فقه الاقليات' vs video 'فقه الأقليات')."""
    return (s.replace("أ", "ا").replace("إ", "ا").replace("آ", "ا")
             .replace("ة", "ه").replace("ى", "ي"))


def leak_check(ar, en, series_ar, series_en):
    """Catch the model folding its metadata into the title: the batch row id
    (a number that is not in the Arabic title) or the series name."""
    a = re.sub(r"^[\s.\-–—]+", "", ar)
    e = re.sub(r"^[\s.\-–—]+", "", en)
    if re.match(r"\d+\s*[-–—]", e) and not re.match(r"[٠-٩0-9]", a):
        return "number-prefix-leak"
    if series_ar and series_en and len(series_en) > 8:
        head = series_en.split(":")[0].strip()
        if len(head) > 8 and head in en:
            # legitimate only if the Arabic title itself mentions the series:
            # any distinctive word of the series title present in the title.
            words = [w for w in re.split(r"\s+", norm_ws(series_ar)) if len(w) >= 4]
            if not any(norm_ar(w) in norm_ar(norm_ws(ar)) for w in words):
                return "series-leak"
    return None


def valid_en(text):
    if not text or not text.strip():
        return "empty"
    if any(AR.search(ch) and ch != "ﷺ" for ch in text):
        return "arabic-left"
    if AR_DIGITS.search(text):
        return "arabic-digits"
    return None


def build_prompt(items, note=""):
    lines = [
        "Translate each Arabic lesson title below into English.",
        "Glossary and rules:",
        GLOSSARY,
        "",
        FEWSHOT,
        "",
        "Rules: output ONLY a JSON array, one object per input, with the same "
        '"n" and an "en" field. No commentary, no markdown fences. Translate the '
        "whole title, including any parenthetical chapter name. Convert all "
        "Arabic-Indic digits to Latin digits. The 'n' is only a row ID for "
        "matching outputs to inputs and 'series' is only context: NEVER put "
        "the row number or the series name into the 'en' title, and never add "
        "any number, prefix, or word that is not in the Arabic title itself.",
    ]
    if note:
        lines.append(note)
    lines.append("")
    lines.append("Titles:")
    for it in items:
        lines.append(json.dumps(it, ensure_ascii=False))
    return "\n".join(lines)


def run_batch(items, attempt=1, note=""):
    prompt = build_prompt(items, note)
    resp = chat(MODEL, SYSTEM, prompt)
    usage = resp.get("usage", {})
    log_usage(MODEL, usage)
    content = resp["choices"][0]["message"]["content"]
    start, end = content.find("["), content.rfind("]")
    assert start >= 0 and end > start, f"no JSON array in reply: {content[:200]!r}"
    out = json.loads(content[start:end + 1])
    got = {}
    for o in out:
        n, en = o.get("n"), o.get("en")
        if not isinstance(n, int) or not isinstance(en, str):
            continue
        got[n] = en
    return got, content, usage


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--limit", type=int, default=None)
    ap.add_argument("--batch", type=int, default=None)
    ap.add_argument("--only", type=int, default=None)
    args = ap.parse_args()

    data = json.loads(re.match(r"const DATA = (.*);\s*$", REC.read_text(encoding="utf-8"), re.S).group(1))
    # series titleEn for context
    series_en = {}
    for line in SERIES_TSV.read_text(encoding="utf-8").splitlines():
        if not line or line.startswith("#"):
            continue
        ar, en = line.split("\t")
        series_en[norm_ws(ar)] = en
    pl_by_id = {p["id"]: p for p in data["playlists"]}
    for p in data["playlists"]:
        if not AR.search(p["title"]):
            series_en[norm_ws(p["title"])] = p["title"]
    verse_ids = set()
    for line in VERSE_TSV.read_text(encoding="utf-8").splitlines():
        if not line or line.startswith("#"):
            continue
        verse_ids.add(line.split("\t")[0])
    pl_of = {}
    for p in data["playlists"]:
        for it in p["items"]:
            pl_of[it["id"]] = p["title"]

    done = {}
    if MT_OUT.exists():
        done = json.loads(MT_OUT.read_text(encoding="utf-8"))
    # unique titles needing MT
    seen = set()
    work = []  # {ar, series} — series is the ARABIC playlist title (context
    # only; the English series name is never sent, so the model cannot
    # copy it into a title)
    for v in data["videos"]:
        t = v["title"]
        if t in seen or t in done:
            continue
        seen.add(t)
        if v["id"] in verse_ids:
            continue
        if not AR.search(t):
            continue
        series = pl_of.get(v["id"], "")
        work.append({"ar": t, "series": series})
    work.sort(key=lambda x: x["ar"])
    if args.limit:
        work = work[: args.limit]
    print(f"work items: {len(work)} (already done: {len(done)})")

    MT_RAW.mkdir(exist_ok=True)
    failed = json.loads(FAILED.read_text(encoding="utf-8")) if FAILED.exists() else {}
    batches = [work[i:i + BATCH] for i in range(0, len(work), BATCH)]
    todo = range(len(batches))
    if args.batch is not None:
        todo = [args.batch]
    if args.only is not None:
        todo = [args.only // BATCH]
    for bi in todo:
        batch = batches[bi]
        raw_path = MT_RAW / f"batch-{bi:03d}.json"
        # pending: batch indices still needing a valid translation.
        pending = list(range(len(batch)))
        got_all = {}
        bad_kinds = {}  # batch index -> last error kind
        for attempt in range(1, 4):
            if not pending:
                break
            items = []
            for j, i in enumerate(pending):
                w = batch[i]
                # On retry, strip the series context from items that leaked
                # it: with temperature 0 the same prompt repeats the leak.
                series = "" if bad_kinds.get(i) == "series-leak" else w["series"]
                items.append({"n": j + 1, "series": series, "ar": w["ar"]})
            note = ("RETRY: the previous translation wrongly added a number or "
                    "a series name that is not in the Arabic title. Translate "
                    "ONLY the Arabic title text.") if attempt > 1 else ""
            try:
                got, content, usage = run_batch(items, attempt, note)
                bad = {}
                for j, i in enumerate(pending):
                    w = batch[i]
                    en = got.get(j + 1)
                    err = valid_en(en) if en is not None else "missing"
                    if not err and en is not None:
                        err = leak_check(
                            w["ar"], en, w["series"],
                            series_en.get(norm_ws(w["series"]), ""))
                    if err:
                        bad[i] = err
                    else:
                        got_all[i] = en
                raw_path.write_text(json.dumps(
                    {"batch": bi, "attempt": attempt, "usage": usage,
                     "reply": content, "invalid": bad},
                    ensure_ascii=False, indent=1), encoding="utf-8")
                if bad:
                    bad_kinds.update(bad)
                    print(f"batch {bi} attempt {attempt}: invalid "
                          f"{ {k + 1: v for k, v in bad.items()} }; retrying "
                          f"{len(bad)} item(s)")
                    # Bank the good items now so a stubborn title never
                    # costs the rest of its batch.
                    for i, en in got_all.items():
                        done[batch[i]["ar"]] = en
                    MT_OUT.write_text(json.dumps(done, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
                    pending = sorted(bad)
                    time.sleep(5)
                    continue
                pending = []
                break
            except Exception as e:  # noqa: BLE001 - retry then record
                print(f"batch {bi} attempt {attempt} failed: {e}")
                time.sleep(10)
        if pending:
            failed[str(bi)] = [batch[i]["ar"] for i in pending]
            print(f"batch {bi}: {len(pending)} title(s) FAILED after 3 attempts")
        for i, en in got_all.items():
            done[batch[i]["ar"]] = en
        MT_OUT.write_text(json.dumps(done, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
        print(f"batch {bi}: ok ({len(batch) - len(pending)} titles, total done {len(done)})")
    if failed:
        FAILED.write_text(json.dumps(failed, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"DONE: {len(done)} titles translated, {len(failed)} failed batches")


if __name__ == "__main__":
    main()
