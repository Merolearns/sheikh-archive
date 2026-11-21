# Gemini voice: V5 consultation for the Sheikh Moustafa Kamel offline video library

**Source:** Gemini's answer obtained through the `custom.gemini` connector (`bin/gemini-chat`, default model `gemini-3-flash-preview`), Nov 20, 2026, single call, answered in ~37 seconds, no retries needed. The text below is Gemini's reply, reproduced verbatim except for light formatting (headings and list structure preserved). No em dash appears in Gemini's answer. Nothing in sections 1-6 is the transcriber's invention.

---

## (1) Design for Requirement 1: Dual Playback

Dual playback provides flexibility for users who have limited local storage but occasional internet access.

Placement:
1. Video Detail View: Two distinct buttons placed below the video player.
2. Video Card: A primary "Play" icon (local) and a secondary "External Link" icon (YouTube).

Labels:
- Local Playback (Primary): Arabic: "تشغيل الفيديو محلياً" / English: "Play Video Locally"
- YouTube Playback (Secondary): Arabic: "مشاهدة على يوتيوب" / English: "Watch on YouTube"

Behavior:
- Local File Present: The "Play Video Locally" button is highlighted (gold outline). Clicking it opens the in-app player.
- Local File Missing: The "Play Video Locally" button is visually dimmed (reduced opacity). If clicked, a notification appears: "الملف غير موجود في التخزين المحلي" (File not found in local storage).
- YouTube Link: This is a standard HTML anchor link with `target="_blank"`. It triggers only on a deliberate user click. It does not attempt to "fetch" data or check connectivity in the background. The app remains silent and offline until the user leaves the app via this link.
- ID Extraction: The system must use a regex pattern to extract the 11 character ID found between brackets (example: aoAR2A0pd9M) from the media path field in the catalog to construct the URL.

## (2) Design for Requirement 2: Books Section

The Books section serves as a digital library for the Sheikh's written works, integrated into the existing offline architecture.

Design:
- Navigation: A new 6th navigation item (replacing one or expanding to 6 total) labeled "Books" (الكتب).
- List View: A grid of cards. Each card displays a book cover (if available) or a geometric khatam motif, the title, and the file size.
- Details/Reader View: Clicking a book opens a dedicated reader page using a bundled, offline-ready PDF viewer (such as PDF.js).
- Offline Reading: Books must be stored in the same local directory structure as the videos to be served by the local Python server.

Owner Inputs Needed:
1. File Repository: The actual PDF files.
2. Metadata Table: A simple list or TSV containing:
   - Arabic Title (العنوان)
   - English Title (for the English UI toggle)
   - Description (نبذة عن الكتاب)
   - Publication Year (if applicable)
   - File Name (matching the provided PDF)
   - Category (e.g., Fiqh, Hadith, General)

## (3) Design for Requirement 3: About the Sheikh Page

This page provides context on the teacher while maintaining strict adherence to verified data.

Verified Facts:
- Name: Sheikh Moustafa Kamel (الشيخ مصطفى كامل).
- Role: Islamic Scholar and Lecturer.
- Archive Scale: Over 3,970 recorded lessons and 70+ organized playlists.
- Notable Work: Detailed commentary on Sahih al-Bukhari and diverse series on Beliefs (Aqeedah) and Islamic Jurisprudence.

Unknowns (Must stay blank/silent unless provided):
- Date and place of birth.
- Specific university degrees or formal institutions of study.
- Names of specific teachers (Mashayekh) or chains of narration (Ijazat).
- Personal life details or timeline of his career.

UI Structure:
- Header: Monogram logo and Name.
- Stats Row: Number of videos, number of playlists, and total years of the archive (if known).
- Bio Section: A brief paragraph of verified text (to be provided by the owner).
- Series Index: A list of the 71 playlists as a "Legacy of Work" section.

## (4) Additional Improvements and Additions

### 1. Resolve Sahih al-Bukhari Discrepancy
- What: Investigate why the app has 996 lessons while the YouTube inventory shows 1,131.
- Where: Catalog data and TSV source files.
- Why: 135 missing lessons represent a significant gap in the Sheikh's primary work.
- Acceptance Criteria: Catalog matches the inventory or a reason for exclusion is documented.
- Score: 5/5 (Critical for data integrity).

### 2. Review "NEEDS OWNER REVIEW" Playlists
- What: Re-classify the 7 outlier playlists (Sermons, Saturday lessons, etc.).
- Where: Home screen and Series index.
- Why: "Friday Sermons" (368 lessons) is a massive content block currently without a clear pillar.
- Acceptance Criteria: Every playlist assigned to a category (e.g., "Sermons" or "Community").
- Score: 4/5 (Improves discovery).

### 3. MKV Playback Verification
- What: Stress test real MKV files on target browsers (Chrome/Edge/Safari).
- Where: Local Python server environment.
- Why: MKV support varies by browser and OS (especially Safari).
- Acceptance Criteria: Successful playback of 5 unique MKV files of varying sizes on the owner's primary machine.
- Score: 5/5 (Technical blocker).

### 4. Search Performance (Chunked Rendering)
- What: Implement a web worker or chunked list rendering for the 3,977 entries.
- Where: Search and Saved pages.
- Why: Instant filtering of 4,000 items can cause UI lag on older laptops.
- Acceptance Criteria: Filter results update in under 100ms without freezing the UI thread.
- Score: 3/5 (Performance polish).

### 5. Recitation/Video Audio Guard
- What: Logic check to ensure the opening recitation (Ta Ha 20:114) stops immediately when a video is launched.
- Where: Global audio controller.
- Why: To prevent overlapping audio as per the design rules.
- Acceptance Criteria: Initiating a video or YouTube link kills any active recitation playback.
- Score: 4/5 (User experience).

## (5) Risks and Verification

- MKV Codecs: If the owner's laptop (especially if using Safari) does not support the MKV container or the specific video codec (H.264 vs H.265), the app will fail to play local files. Verification on the actual target hardware is mandatory before V5 release.
- Memory Limits: Loading a 4,000 entry JSON object into memory on a low-end device could cause crashes. Verify memory usage during search.
- PDF Viewer Performance: Large PDF files might struggle in an offline web-based viewer. Verify file sizes of the Sheikh's books.
- Path Encoding: Arabic filenames or folder names in the local server must be correctly URI-encoded to ensure the video player finds them.

## (6) What NOT to do

- Do NOT embed YouTube: Even though YouTube playback is a requirement, do not use an iFrame or the YouTube API. These require an internet connection to even load the player script, violating the "zero external requests at runtime" rule.
- Do NOT add a "Scholars" section: Per instructions, only Sheikh Moustafa Kamel is prominent. The guest playlist by Dr. Imad Bayoun must remain a simple series card, not a reason to build a multi-scholar UI.
- Do NOT use AI-generated summaries: Do not use AI to summarize the Sheikh's biography or video content. All text must be archive-derived or owner-provided.
- Do NOT use external PDF CDNs: Do not link to a hosted PDF.js. The library must be local and bundled within the single-file app or served by the local Python server.

---

## Transcription notes (not Gemini's words)

These are factual flags from the transcriber for the coordinator, not part of Gemini's answer:

1. **Nav count tension:** Gemini proposes a 6th nav item for Books. V4 has 5 nav items, and round-3 research set a standing rule of at most 5 top-level destinations (About + Mission + Sheikh were folded into one hub for exactly this reason). The coordinator should decide whether Books becomes a 6th item, replaces/folds into an existing destination, or lives as a home rail plus Library entry.
2. **PDF.js is a new dependency:** Gemini names PDF.js as the reader. The app is dependency-free by standing rule (stdlib-only build, no bundled libraries beyond the font stack). A bundled PDF.js copy needs a license/size check and a decision; a lighter alternative is serving the PDF file itself and letting the browser's built-in viewer open it, which keeps zero new dependencies.
3. **"Total years of the archive (if known)"** in Gemini's stats row is itself an unknown: no archive year span is verified in the grounding, so that stat must stay blank until the owner supplies it, per the unknown-stays-unknown rule.
4. **Item (4)4 restates existing v4 behavior:** chunked rendering and `content-visibility` are already implemented in v4 (track F verified). Gemini's search-performance item is therefore a verify-and-measure task, not a new build, unless profiling on the owner's laptop shows a real lag.
5. **Item (4)5 restates existing v4 behavior:** the no-overlap recitation/video guard is already built and tested in v4 (37/37 behavior tests). The new part is only the YouTube-link case: opening a YouTube link should also stop the recitation, which Gemini correctly adds.
6. **Missing-vs-present behavior is thin:** Gemini covers dimming the local button when the file is missing, but does not say whether the YouTube button should be promoted to primary in that state, nor what the lesson page shows when neither local file nor video ID exists. The coordinator may want that gap closed before the build brief.
7. **Exact counts for the record:** archive scale is 3,977 lessons and 71 playlists (Gemini wrote "over 3,970" and "70+"); Bukhari gap is 1,131 minus 996 = 135, as Gemini states.
