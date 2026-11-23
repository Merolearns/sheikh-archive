#!/usr/bin/env python3
"""Second pass of review corrections (hand-verified, by video id) + pattern
standardizations. Appends rows to audit/review-corrections.tsv.

Findings from reading all 229 RULING rows + QUESTION/MODAL_EN/SAMPLE spot
checks (Nov 22, 2026):
  - أميته (illiteracy) rendered "His Illness" — wrong.
  - الحكم التكليفي rendered "Obligatory Ruling" (2x) — taklifi is not
    "obligatory"; standardize to "Taklifi Ruling".
  - الحكم الوضعي rendered three ways — standardize to "Declarative Ruling".
  - "Isha Lesson Entitled" / "Friday Sermon Entitled" prefixes invented
    from series context on 11 titles whose Arabic has no such word.
  - 18 "قوله تعالى" verse headings were machine-translated (the audit's
    marker list missed "قوله تعالى"); standardize the rendering to the
    hand-done convention "The Statement of Allah, the Exalted", and use
    Sahih International wording ("Take what is given freely").
  - "يتم النبي" (the Prophet's orphanhood) read as "concludes".
  - معالم rendered "Signposts"/"Features"/"Signs" — series uses "Landmarks".
  - "Dawn Reflections" (15) vs "Fajr Reflections" (17) — glossary: Fajr.
  - "Shama’il" (curly apostrophe, 10) vs series "Shama'il".
  - "Aqeeda" (1) vs glossary "Aqeedah".
"""
import json
import re
import sys

V5 = "/home/hatch/workspace/archive-rebuild/v5-clone"
REC = f"{V5}/audit/catalog-reconciled.js"
MT = f"{V5}/audit/video-en-mt.json"
CORR = f"{V5}/audit/review-corrections.tsv"

text = open(REC, encoding="utf-8").read()
data = json.loads(re.match(r"const DATA = (.*);\s*$", text, re.S).group(1))
title_to_vid = {}
for v in data["videos"]:
    title_to_vid.setdefault(v["title"], v["id"])

mt = json.load(open(MT, encoding="utf-8"))

# video id -> corrected English title (full replacement)
FIXES = {
    "4dMpX-MqU94": "30 - Shama'il of the Chosen One \ufdfa (His Being Unlettered \ufdfa and the Wisdom Behind It)",
    "LDcP29Wewq8": "2-1 - (Usul al-Fiqh) The Shar'i Ruling \u2014 Part 1: The Taklifi Ruling",
    "9VbsvNfCn4A": "2-2 - (Usul al-Fiqh) What Are the Usuli Principles Pertaining to Types of Taklifi Rulings? \u2014 Part 1: Principles of the Obligatory",
    "m7mhZzv8JB8": "547 - Explanation of Sahih al-Bukhari (Chapter: Shaving and Shortening the Hair Upon Exiting the State of Ihram), Hadith no. 639-640-641-642",
    "slyo4suUnkA": "5 - Terminology Relating to the Declarative Ruling (Usul al-Fiqh)",
    "7OqHxJAKn20": "4-1 (Usul al-Fiqh): The Declarative Ruling",
    "iWK32xeragQ": "4-2 (Usul al-Fiqh): The Declarative Ruling",
    "-rEBo8GRFr4": "10 - 2 - Contemporary Fiqh Issues (What Is the Ruling on Placing One\u2019s Hand on the Torah or the Gospel When Taking an Oath Before the Court?)",
    "8cMWAYLc8zc": "74 - Explanation of Abridgement of Manhaj al-Qasidin \u2014 What Is the Ruling on Using the Credit Card Called Visa (Credit Card)?",
    "eaylq0gdgZo": "39 - Is It Permissible for a Menstruating Woman to Fast Ramadan During Her Menses out of Shyness?",
    "DIPOPeC3Rms": "The Ruling on Congregational Prayer",
    "HT2FtqnoZ4o": "The Ruling on Saying 'Ameen' Behind the Imam in Loud Prayers",
    "HgiBizvrswU": "The Ruling on Pressing One's Foot Against That of the Person Next to One in Prayer",
    "UgX5X3BJ2S0": "The Ruling on an Individual Praying Alone Behind the Row",
    "_vUnM11G4no": "The Ruling on Turning One's Gaze and Raising One's Eyes During Prayer",
    "usIjcX38Y2Q": "The Ruling on Reciting Al-Fatihah in Congregational Prayer or When Praying Alone, Whether Obligatory or Voluntary",
    "RDfT7zrpXWc": "Choosing a Spouse Well: Both Wife and Husband",
    "VjPnFbgcY7A": "The New Zealand Incident: How Do We Confront Hatred Against Islam? \u2014 Sheikh Dr. Moustafa Kamel",
    "qJjMVhGuhWY": "The State of the Muslim Ummah \u2014 Dr. Moustafa Kamel",
    "jYaj9_Wdft8": "Review of the Past Year and Welcoming the New Year \u2014 Dr. Moustafa Kamel",
    "1LKxai9YM-Y": "Race to Be Freed from the Fire",
    "0rvwx8P5uxc": "15 - The Orphanhood of the Prophet \ufdfa: Lessons and Morals",
    "3ggctUtwfKA": "13 - Among the Landmarks on the Path to Tawfiq (Righteous Offspring)",
    "phY8xqFvf2I": "14 - Among the Landmarks on the Path to Tawfiq (Lawful Earnings)",
    "mTD3beHPnDg": "15 - Among the Landmarks on the Path to Tawfiq (Acceptance on Earth)",
    "1AxMqPkezp8": "25 - The Blessings of Allah Are Innumerable (From 'Landmarks on the Path to Tawfiq')",
    "ij2sKKGcUcA": "26 - Reflecting Upon the Creation of Allah, Exalted and Glorified is He (From 'Landmarks on the Path to Tawfiq')",
    "AFb4FHU6Ni0": "4 - Landmarks of the Prophetic Sunna (2 - Chapter: Sincerity and Intention)",
    "7rLpdGPm3Q0": "5 - Among the Landmarks on the Path to Tawfiq (The Eight Gates of Paradise)",
    "VK7wVzBd0yE": "10 - Isha Reflections (From the Meanings of Ar-Rahman Ar-Rahim: Hope in Allah\u2019s Forgiveness)",
    "SgEIYoIRl0Y": "20 - Isha Reflections (The Glorious Qur'an)",
}

# Pattern standardizations, applied to the MT title text.
def patterns(ar, en):
    new = en
    if "Dawn Reflections" in new:
        new = new.replace("Dawn Reflections", "Fajr Reflections")
    if "Shama\u2019il" in new:
        new = new.replace("Shama\u2019il", "Shama'il")
    if "Aqeeda" in new and "Aqeedah" not in new:
        new = new.replace("Aqeeda", "Aqeedah")
    # Verse headings: standardize the قوله تعالى rendering.
    if re.search(r"قال الله|قول الله|قال تعالى|قوله تعالى|﴿", ar):
        new = new.replace("Allah\u2019s Statement", "The Statement of Allah, the Exalted")
        new = new.replace("His saying, may He be exalted", "The Statement of Allah, the Exalted")
        new = new.replace("His Saying", "The Statement of Allah, the Exalted")
        new = new.replace("Take what is pardoned", "Take what is given freely")
    return new

rows = {}
for vid, en in FIXES.items():
    rows[vid] = en
report = {"explicit": len(FIXES), "pattern": 0}
for ar, en in mt.items():
    new = patterns(ar, en)
    if new != en:
        vid = title_to_vid.get(ar)
        assert vid, f"no video id for {ar!r}"
        if vid in rows and rows[vid] != new:
            print(f"CONFLICT {vid}: explicit vs pattern; keeping explicit")
            continue
        rows[vid] = new
        report["pattern"] += 1

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
print(f"second-pass fixes: {report} | rows added: {added} "
      f"(total rows now {len(existing) + added})")
