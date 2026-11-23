#!/usr/bin/env python3
"""Generate review-corrections.tsv rows for the systematic MT defects found
in the Nov 22, 2026 review pass. Appends to audit/review-corrections.tsv
(which already holds the hand-spotted HDhLXdTdjp0 fix).

Defects (all verified title by title):
  1. NAME: the model transliterates the Sheikh as "Mustafa Kamal" (20) or
     "Mustafa Kamel" (48); house style everywhere on the site is
     "Moustafa Kamel".
  2. INVENTED YEAR: ten "يوم من حياة مسلم في شهر رمضان" titles gained
     " 1442 AH / 2021 CE" although the Arabic title carries no year.
  3. SUMUD: "#أسطول_الصمود" -> "Armada of Steadfastness"; the established
     English name is "Sumud Flotilla".
  4. LOST QUESTION MARK: six titles whose Arabic ends in ؟ (or asks a
     question mid-title) lost the "?" in English.
A row is written per Arabic title (first video id with that title); the
correction applies to the shared title in video-en-mt.json, so repeated
titles are fixed for all copies at once.
"""
import json
import re
import sys

V5 = "/home/hatch/workspace/archive-rebuild/v5-clone"
sys.path.insert(0, f"{V5}/tools")

REC = f"{V5}/audit/catalog-reconciled.js"
MT = f"{V5}/audit/video-en-mt.json"
CORR = f"{V5}/audit/review-corrections.tsv"

text = open(REC, encoding="utf-8").read()
data = json.loads(re.match(r"const DATA = (.*);\s*$", text, re.S).group(1))
title_to_vid = {}
for v in data["videos"]:
    title_to_vid.setdefault(v["title"], v["id"])

mt = json.load(open(MT, encoding="utf-8"))

# Hand-written question fixes: Arabic title -> corrected English tail.
QUESTIONS = {
    "من وحي الهجرة _ تأييد الله لنبيه وكيف يؤيدنا الله؟":
        "From the Inspiration of the Hijra: Allah’s Support for His Prophet and How Allah Supports Us?",
    "١٠-٨- فقه الاقليات ( خلاصة حكم التامين التجاري في بلاد الغرب؟)":
        "10 - 8 - Fiqh of Minorities (Summary of the Ruling on Commercial Insurance in Western Countries?)",
    "١٥- سورة المسد ( كيف تقرأ ؟ وتجويدها وتفسيرها  والمستفاد منها)":
        "15 - Surah Al-Masad (How to Recite It? Its Tajweed, Its Tafsir, and Lessons Derived Therefrom)",
    "١٥-٨- احكام التعزية؟":
        "15-8 - What Are the Rulings Pertaining to Condolences?",
    "٦٢٥- شرح البخاري ( باب من لم يبال من أين كسب المال ؟) الحديث رقم ٧٢٥":
        "625 - Explanation of Sahih al-Bukhari (Chapter: One Who Does Not Care From Where He Acquires Wealth?), Hadith no. 725",
    "٦٦- حكم من يصلي في بيته لأن المسجد بعيد ؟":
        "66 - What Is the Ruling on One Who Prays at Home Because the Mosque Is Far Away?",
}

rows = {}  # vid -> corrected EN
report = {"name": 0, "year": 0, "sumud": 0, "question": 0}

for ar, en in mt.items():
    new = en
    if "Mustafa Kamal" in new or "Mustafa Kamel" in new:
        new = new.replace("Mustafa Kamal", "Moustafa Kamel").replace(
            "Mustafa Kamel", "Moustafa Kamel")
        report["name"] += 1
    if ar.startswith("يوم من حياة مسلم") or "يوم من حياة مسلم في شهر رمضان" in ar:
        if " 1442 AH / 2021 CE" in new:
            new = new.replace(" 1442 AH / 2021 CE", "")
            report["year"] += 1
    if "Armada of Steadfastness" in new:
        new = new.replace("Armada of Steadfastness", "Sumud Flotilla")
        report["sumud"] += 1
    if ar in QUESTIONS:
        new = QUESTIONS[ar]
        report["question"] += 1
    if new != en:
        vid = title_to_vid.get(ar)
        assert vid, f"no video id for {ar!r}"
        assert vid not in rows or rows[vid] == new, f"conflict for {vid}"
        rows[vid] = new

existing = set()
with open(CORR, encoding="utf-8") as f:
    for line in f:
        if line.startswith("#") or not line.strip():
            continue
        existing.add(line.split("\t")[0])

added = 0
with open(CORR, "a", encoding="utf-8") as f:
    for vid, en in sorted(rows.items()):
        if vid in existing:
            continue
        f.write(f"{vid}\t{en}\n")
        added += 1
print(f"systematic fixes: {report} | rows added to {CORR}: {added} "
      f"(total rows now {len(existing) + added})")
