#!/usr/bin/env python3
"""Call DeepSeek (v4-pro) to adjudicate the Books inventory.

Sends ONLY book metadata (filenames, verified page counts, first-page title
lines) — public-facing material intended for the website. No private data,
no file contents beyond first-page title lines, no credentials.
"""
import json, subprocess, sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
TABLE = json.load(open(HERE / "adjudication-table.json", encoding="utf-8"))

PROMPT = """VERDICT FIRST: reply with the adjudicated inventory as JSON first, then a short notes section after the JSON. Do not write prose before the JSON.

You are adjudicating the Books inventory for an offline Islamic library app (Sheikh Moustafa Kamel). 52 files were extracted from the real PDFs/DOCX. Every title, author, language and page count below comes from the files themselves (first-page text, PDF metadata, verified page counts). NEVER invent a title, author, content or page count. Anything not established goes to the review list, never to the public list.

VERIFIED FACTS (use only these):
- Author of the Sheikh's books: Dr. Moustafa Suleiman Kamel (Arabic: د. مصطفى سليمان كامل). His PhD dissertation title page reads: الفرقة بين الزوجين فى التشريع الإسلامى والقانون الأمريكى (كاليفورنيا), author مصطفى سليمان محمد كامل, supervisor Dr. Salah al-Sawi (د. صلاح الصاوي), Graduate Theological Foundation 2014-2015.
- The Sheikh's own message (Nov 16, 2026): he made his PhD book into 4 books and made the khutbas into books, to put them on the website. So the 4 PhD part-files are ONE work in 4 parts.
- The Noor Sprouts newsletters (3 files: 2 English, 1 Arabic) are the OWNER's own newsletter project, NOT the Sheikh's books. They were sent in the same chat but are not his authorship.
- The two Anta Tasalu cover PDFs (Part1_Cover_Wraparound.pdf, Part2_Cover_Wraparound.pdf, 1 page each, first line "عن هذا الكتاب") are wraparound COVER art for the two interior volumes, not books themselves.
- The al-Fadila lessons file is the Sheikh's lessons ON al-Manfaluti's book "al-Fadila" (الفضيلة للمنفلوطي): credit as the Sheikh's lessons on that book, do not present al-Manfaluti's book as the Sheikh's own book.
- The two DOCX files: big one (237,433 words, app.xml Pages 819) is the PhD dissertation source manuscript — the SAME work as the 4-part PhD book, in DOCX format. Small one (23,784 words) is مسائل في مشكلات الحياة الزوجية (a distinct work; page count NOT verified — record pages as null and note it needs a count).
- Design rule (already decided): the PhD book lists as ONE title with four ordered parts. Books without an English title render the Arabic title in both language modes. Sort: owner order, then Arabic title. Language filter only.

DEDUP RULES (apply to every file before listing):
- Normalize Arabic titles: strip diacritics (tashkeel), normalize alef variants (أ إ آ to ا), hamza variants, teh marbuta to heh, yeh/alef maksura, punctuation; collapse whitespace. Case-fold English titles.
- Exact match after normalization = duplicate; normalized match = duplicate; same file name = duplicate even if the title differs.
- KNOWN version groups to judge: (a) three kahf files (126/135/138 pages, all titled إضاءات من سورة الكهف — الجزء الأول, sent Nov 16/18/19) — successive versions of ONE book; (b) two marital-infidelity files (16 pages sent Nov 7, 17 pages sent Nov 17, same title الخيانة الزوجية وسبل التعامل معها) — two versions of ONE work.
- Duplicates NEVER go on the public list. They go to the review list with the matching rule that fired and a keep-which recommendation.
- Parallel editions are NOT duplicates: Arabic + English versions of the same content (Fatiha AR 50pp + Fatiha EN 67pp; Seerah AR parts 1-2 + EN parts 1-2) list separately and note the companion edition. Multi-part works (PhD parts 1-4; Seerah parts 1-2; Anta Tasalu vols 1-2) are separate parts of one work: list the PhD as ONE entry with four parts; list Anta Tasalu as TWO entries (Vol 1, Vol 2) each with its cover; list Seerah AR/EN parts as separate entries noting part numbers.

FILENAME TITLE HINTS (the Arabic filenames are the book titles as sent; first-page title blocks confirm them):
- خطب-رمضان = خطب رمضان, خطب-شعبان, خطب-رجب, خطب-أول-العام, خطب-الحج, خطب-العبادات, خطب-الإيمان, خطب-الموت-والآخرة, خطب-سبعة-يظلهم-الله, خطب-الأخلاق, خطب-تزكية-النفوس, خطب-الأسرة-والتربية, خطب-المجتمع-والمسلم-في-الغرب, خطب-السيرة-النبوية, خطب-الهجرة, خطب-الأنبياء, خطب-الصحابة, خطب-قضايا-الأمة, خطب-الدعوة-والإصلاح, خطب-الحديث-القدسي (20 khutba collections).
- وقفات-من-السيرة-النبوية = وقفات من السيرة النبوية (parts 1-2); educational-reflections-on-the-seerah = Educational Reflections on the Seerah (parts 1-2, English).
- الفرقة-بين-الزوجين = الفرقة بين الزوجين (parts 1-4); فقه-الزواج-الميسر = فقه الزواج الميسر; الخيانة-الزوجية = الخيانة الزوجية وسبل التعامل معها.
- إضاءات-من-سورة-الفاتحة = إضاءات من سورة الفاتحة (خواطر العشاء); illuminations-from-surah-al-fatiha = Illuminations from Surah al-Fatiha (Dinner Reflections).
- kahf-khutbas = إضاءات من سورة الكهف — الجزء الأول (the file name says khutbas; the printed title is the illuminations title — use the PRINTED title, note the file-name difference).
- قصة موسى = قصة موسى عليه السلام; قصص الأنبياء = قصص الأنبياء — الكتاب الكامل; دروس أصول الفقه = دروس أصول الفقه للمبتدئين; دروس من كتاب الفضيلة = دروس من كتاب الفضيلة للمنفلوطي; دروس مؤتمر MAS LA = دروس مؤتمر MAS LA; من فضائل القرآن الكريم = من فضائل القرآن الكريم.
- أنت تسأل والشيخ يجيب = Anta Tasalu wa al-Shaikhu Yujib (Vol 1: 256pp, 405 questions; Vol 2: 204pp, 303 questions — from the cover "About this book" text).
- #16 Series of Proud To Be Muslims (10pp; first page is a greeting letter, title from filename; author NOT stated in the file — decide: list with author null + review note to confirm authorship, or review-list it; explain your choice).

OUTPUT JSON (this exact shape, no extra fields at top level):
{
  "inventory": [ {"id": "book-01", "title_ar": "...", "title_en": "... or null", "author_ar": "... or null", "author_en": "... or null", "language": "ar|en", "pages": <int or null>, "format": "pdf|docx", "files": ["<filename>", ...], "parts": [{"part": 1, "file": "...", "pages": 330}] or null, "cover_file": "<filename>" or null, "companion": "<inventory id>" or null, "scan": false, "notes": "..."} ],
  "review": [ {"file": "...", "issue": "duplicate|not-sheikh-authored|author-unconfirmed|pages-unverified|other", "rule": "...", "matches": "...", "recommendation": "..."} ],
  "cover_assets": [ {"file": "...", "for_book": "<inventory id>"} ],
  "counts": {"files_total": 52, "listed": <n>, "review": <n>, "cover_assets": 2}
}
Rules for the JSON: title_ar in standard Arabic script (convert presentation forms to normal letters, strip tashkeel from titles except where it changes meaning; keep the title exactly as printed otherwise). title_en exactly as printed in the file, or null. pages: the verified integer, or null only for the small DOCX. Sort inventory by Arabic title (Arabic-language books first, then English), with the PhD entry first among Arabic (it is the flagship). ids sequential book-01.. in that sorted order. Every one of the 52 files must appear exactly once across inventory.files, review, or cover_assets — account for all 52.

EXTRACTION TABLE (52 files: id, filename, bytes, verified pages, first-page title lines, PDF metadata, language, scan flag):
""" + json.dumps(TABLE, ensure_ascii=False)

r = subprocess.run(
    [str(Path.home() / "workspace/custom-connectors/custom.deepseek/bin/deepseek-chat"),
     "--model", "deepseek-v4-pro", "--prompt", PROMPT, "--max-tokens", "30000", "--raw"],
    capture_output=True, text=True, timeout=600)
out = r.stdout
err = r.stderr
with open(HERE / "deepseek-adjudication-raw.json", "w", encoding="utf-8") as f:
    f.write(out)
print("exit:", r.returncode)
if err:
    print("STDERR:", err[:2000])
print("raw bytes:", len(out))
try:
    j = json.loads(out)
    ch = j.get("choices", [{}])[0]
    print("finish_reason:", ch.get("finish_reason"))
    u = j.get("usage", {})
    print("usage:", u)
    content = ch.get("message", {}).get("content", "")
    print("content chars:", len(content))
    print("content head:", content[:600])
except Exception as e:
    print("parse error:", e)
    print(out[:1500])
