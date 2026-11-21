You are Claude Code, the coding lead for this project. The owner has ordered: you are in charge of the coding, end to end, no questions, deliver beautifully.

Read ~/workspace/archive-rebuild/BRIEF_V5.md and follow it exactly. It is your complete mission spec: the v5 hardening build of the Sheikh Moustafa Kamel offline video library. Items 13 and 14 in the brief already carry the owner's Nov 20 overrides (in-page YouTube playback with hosted and local fallback, auto-sync of new uploads, Arabic and English transcripts), and item 15 carries the newest owner order (login page with two options on the opening screen — sign in with Gmail, or enter as guest — and per-account progress), so follow the brief as written.

Write all build output inside ~/workspace/archive-rebuild/v5/. Read the brief, the v4 base, and checkpoints.log from ~/workspace/archive-rebuild/; the final ZIP goes to ~/workspace/archive-rebuild/archive-rebuild-v5.zip. Base yourself on v4 as shipped in ~/workspace/archive-rebuild/archive-rebuild-v4.zip. Reuse its catalog DATA only AFTER item 1 reconciles it. Never touch media. Never touch the v4 build dir. Books and biography source material are staged in v5/books-from-sheikh/ (66 files: the Anta Tasalu volumes 1 and 2 with covers, plus the Sheikh's WhatsApp books) and v5/sheikh-bio-source.txt; apply the brief's dedup rule to every incoming item before it is listed anywhere. If the browser tools fail to connect, use the headless Chromium setup for the screenshot review.

Write CHECKPOINT lines with ISO timestamps to ~/workspace/archive-rebuild/checkpoints.log at each milestone. Keep v5/TEST-RESULTS.md honest about what you ran and what you could not verify. Note routine decisions in v5/DECISIONS.md. Work fast: reuse DATA as reconciled, parallelize tracks, timebox screenshot-fix loops, early visual checkpoint.

When the build passes your own screenshot review and the item-2 gate, create ~/workspace/archive-rebuild/archive-rebuild-v5.zip per the brief (app source only, zero media). Then report: what you built, test results, anything unverified. Do not deliver anything to the owner directly.

If a previous session already seeded v5/src and wrote checkpoints (see checkpoints.log), continue from that partial state: verify what is there first, do not redo completed work, and pick up the next unfinished item.

Begin now.
