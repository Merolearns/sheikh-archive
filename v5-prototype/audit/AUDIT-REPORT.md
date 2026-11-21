# Catalog reconciliation audit

The audit compares numbered occurrences of each video ID within each playlist and verifies that the shared occurrences have the same order. TSV rows are ordered by numeric playlist_index, with physical line number breaking ties. App positions and DATA record numbers are one-based. TSV references point to files in `/home/hatch/workspace/youtube-archive/metadata/inventory`. App references point to `/home/hatch/workspace/archive-rebuild/v4/build/Preview/catalog.js`.

## Counts

| Measure | Count | Unit | Source |
|---|---:|---|---|
| app video ids | 3,977 | unique video IDs | catalog.js DATA.videos IDs |
| public video ids | 3,940 | unique video IDs | all_ids.txt and union of flat_videos.tsv, flat_shorts.tsv and flat_streams.tsv |
| app video ids outside public inventory | 37 | unique video IDs | catalog.js DATA.videos IDs absent from all_ids.txt |
| app playlists | 71 | playlists | catalog.js DATA.playlists IDs |
| tsv playlists | 71 | playlists | pl_entries_*.tsv filenames |
| app entries | 4,320 | playlist occurrences | catalog.js DATA.playlists item lists |
| app declared entries | 4,320 | playlist occurrences | catalog.js DATA.playlists count fields |
| app declared count mismatches | 0 | playlists | catalog.js DATA.playlists count versus item list length |
| playlist count deltas | 8 | playlists | catalog.js item lists and count fields versus pl_entries_*.tsv |
| tsv entries | 4,332 | playlist occurrences | pl_entries_*.tsv rows |
| tsv only entries | 13 | playlist occurrences | ordered occurrence join of catalog.js and pl_entries_*.tsv |
| tsv only video ids | 10 | unique video IDs | distinct IDs among TSV-only occurrences |
| app only entries | 1 | playlist occurrences | ordered occurrence join of catalog.js and pl_entries_*.tsv |
| bukhari app entries | 1,128 | playlist occurrences | catalog.js DATA.playlists items for PLXKSrZvHoN9cf7lGMyZjw0cndaCk004f0 |
| bukhari app video ids | 996 | unique video IDs | catalog.js DATA.playlists item IDs for PLXKSrZvHoN9cf7lGMyZjw0cndaCk004f0 |
| bukhari tsv entries | 1,131 | playlist occurrences | pl_entries_PLXKSrZvHoN9cf7lGMyZjw0cndaCk004f0.tsv rows |
| bukhari tsv video ids | 999 | unique video IDs | pl_entries_PLXKSrZvHoN9cf7lGMyZjw0cndaCk004f0.tsv video_id column |
| bukhari reconciled entries | 1,128 | playlist occurrences | catalog-reconciled.json items for PLXKSrZvHoN9cf7lGMyZjw0cndaCk004f0 |
| bukhari reconciled video ids | 996 | unique video IDs | catalog-reconciled.json item IDs for PLXKSrZvHoN9cf7lGMyZjw0cndaCk004f0 |
| reconciled playlists | 71 | playlists | catalog-reconciled.json DATA.playlists IDs |
| reconciled video ids | 3,977 | unique video IDs | catalog-reconciled.json DATA.videos IDs |
| reconciled entries | 4,320 | playlist occurrences | catalog-reconciled.json DATA.playlists item lists and count fields |

## Playlist count differences

| Playlist ID | App source | App count field | App items | TSV rows | TSV − app items |
|---|---|---:|---:|---:|---:|
| `PLXKSrZvHoN9eslRpkrxvTkTpFO0QrzD3G` | catalog.js DATA.playlists record 11 | 45 | 45 | 46 | +1 |
| `PLXKSrZvHoN9c_bFPBSM_I9EkAcQCX0J8t` | catalog.js DATA.playlists record 35 | 47 | 47 | 48 | +1 |
| `PLXKSrZvHoN9f0e4ZoRV50x02TzfIzZLRR` | catalog.js DATA.playlists record 51 | 388 | 388 | 389 | +1 |
| `PLXKSrZvHoN9ecZ95DiQoilTY18DKXYP3e` | catalog.js DATA.playlists record 56 | 105 | 105 | 106 | +1 |
| `PLXKSrZvHoN9eemz-i3_rzlVrOs5EiyPwc` | catalog.js DATA.playlists record 64 | 60 | 60 | 62 | +2 |
| `PLXKSrZvHoN9cGYTIytP0mRvHfudmlvCSV` | catalog.js DATA.playlists record 65 | 208 | 208 | 209 | +1 |
| `PLXKSrZvHoN9cf7lGMyZjw0cndaCk004f0` | catalog.js DATA.playlists record 67 | 1,128 | 1,128 | 1,131 | +3 |
| `PLXKSrZvHoN9eL0fxlBjQcas7t-UrmSHSG` | catalog.js DATA.playlists record 69 | 195 | 195 | 197 | +2 |

## Bukhari count difference

The additional TSV occurrences are at playlist indexes `0074`, `0100`, `0466`. Their IDs are absent from DATA.videos and the inventory probe log records each as unrecoverable. The ordered shared occurrences, including repeated IDs, are preserved in the reconciled catalog.

## Reconciled catalog

The reconciled membership total is 4,332 TSV occurrences minus 13 unavailable occurrences plus 1 supported app-only occurrence. Every retained item resolves to DATA.videos, and the reverse playlistIds agree with the retained memberships. This audit uses catalog metadata for offline availability and does not inspect media.

## TSV-only occurrence `PLXKSrZvHoN9eslRpkrxvTkTpFO0QrzD3G` / `tp6k1bO6nkw` / index `37`

- TSV row `pl_entries_PLXKSrZvHoN9eslRpkrxvTkTpFO0QrzD3G.tsv:37` has title `NA`. This is occurrence 1 of 1 for the ID in that playlist.
- App positions for this ID in catalog.js DATA.playlists record 11 are absent. The ID is absent from DATA.videos, all three public tab TSVs, and all_ids.txt.
- The inventory probe log `unresolved_ids.csv:21` records `removed_tos` and `unrecoverable`.
- Resolution. Exclude this occurrence from the offline catalog.

## TSV-only occurrence `PLXKSrZvHoN9c_bFPBSM_I9EkAcQCX0J8t` / `XEwSL7ipork` / index `46`

- TSV row `pl_entries_PLXKSrZvHoN9c_bFPBSM_I9EkAcQCX0J8t.tsv:46` has title `NA`. This is occurrence 1 of 1 for the ID in that playlist.
- App positions for this ID in catalog.js DATA.playlists record 35 are absent. The ID is absent from DATA.videos, all three public tab TSVs, and all_ids.txt.
- The inventory probe log `unresolved_ids.csv:11` records `removed_hate_speech` and `unrecoverable`.
- Resolution. Exclude this occurrence from the offline catalog.

## TSV-only occurrence `PLXKSrZvHoN9f0e4ZoRV50x02TzfIzZLRR` / `nKiP1oFdrTw` / index `067`

- TSV row `pl_entries_PLXKSrZvHoN9f0e4ZoRV50x02TzfIzZLRR.tsv:67` has title `NA`. This is occurrence 1 of 1 for the ID in that playlist.
- App positions for this ID in catalog.js DATA.playlists record 51 are absent. The ID is absent from DATA.videos, all three public tab TSVs, and all_ids.txt.
- The inventory probe log `unresolved_ids.csv:19` records `removed_by_uploader` and `unrecoverable`.
- Resolution. Exclude this occurrence from the offline catalog.

## TSV-only occurrence `PLXKSrZvHoN9f0e4ZoRV50x02TzfIzZLRR` / `EYFpmAxe7wA` / index `154`

- TSV row `pl_entries_PLXKSrZvHoN9f0e4ZoRV50x02TzfIzZLRR.tsv:154` has title `NA`. This is occurrence 1 of 1 for the ID in that playlist.
- App positions for this ID in catalog.js DATA.playlists record 51 are absent. The ID is absent from DATA.videos, all three public tab TSVs, and all_ids.txt.
- The inventory probe log `unresolved_ids.csv:4` records `removed_hate_speech` and `unrecoverable`.
- Resolution. Exclude this occurrence from the offline catalog.

## App-only occurrence `PLXKSrZvHoN9f0e4ZoRV50x02TzfIzZLRR` / `1zRVE2yomk4`

- TSV playlist_index is unavailable. The ID has no row in `pl_entries_PLXKSrZvHoN9f0e4ZoRV50x02TzfIzZLRR.tsv` or in the public tab TSVs and all_ids.txt.
- App item 1 in catalog.js DATA.playlists record 51 points to DATA.videos record 111, titled `٣٥-إضاءات من سورة الكهف ثانيا أدب التعامل مع المستقبل`. The record declares the same playlist and has a media path.
- The app upload date 2026-10-17 follows the 2026-10-15 inventory date in INVENTORY_SUMMARY.md. That supports a newer entry as the cause of the snapshot difference. The exact playlist insertion date is unavailable.
- Resolution. Retain the archived record and membership at app item 1.

## TSV-only occurrence `PLXKSrZvHoN9ecZ95DiQoilTY18DKXYP3e` / `qXkSN9Eipc0` / index `106`

- TSV row `pl_entries_PLXKSrZvHoN9ecZ95DiQoilTY18DKXYP3e.tsv:106` has title `NA`. This is occurrence 1 of 1 for the ID in that playlist.
- App positions for this ID in catalog.js DATA.playlists record 56 are absent. The ID is absent from DATA.videos, all three public tab TSVs, and all_ids.txt.
- The inventory probe log `unresolved_ids.csv:20` records `removed_tos` and `unrecoverable`.
- Resolution. Exclude this occurrence from the offline catalog.

## TSV-only occurrence `PLXKSrZvHoN9eemz-i3_rzlVrOs5EiyPwc` / `ZuA_EVIl7Bo` / index `12`

- TSV row `pl_entries_PLXKSrZvHoN9eemz-i3_rzlVrOs5EiyPwc.tsv:12` has title `NA`. This is occurrence 1 of 1 for the ID in that playlist.
- App positions for this ID in catalog.js DATA.playlists record 64 are absent. The ID is absent from DATA.videos, all three public tab TSVs, and all_ids.txt.
- The inventory probe log `unresolved_ids.csv:12` records `duplicate` and `unrecoverable`. The log labels the ID as a duplicate and supplies no replacement ID. The same ID appears in `pl_entries_PLXKSrZvHoN9eL0fxlBjQcas7t-UrmSHSG.tsv:196`.
- Resolution. Exclude this occurrence from the offline catalog.

## TSV-only occurrence `PLXKSrZvHoN9eemz-i3_rzlVrOs5EiyPwc` / `3_y8JK2Li5Q` / index `14`

- TSV row `pl_entries_PLXKSrZvHoN9eemz-i3_rzlVrOs5EiyPwc.tsv:14` has title `NA`. This is occurrence 1 of 1 for the ID in that playlist.
- App positions for this ID in catalog.js DATA.playlists record 64 are absent. The ID is absent from DATA.videos, all three public tab TSVs, and all_ids.txt.
- The inventory probe log `unresolved_ids.csv:3` records `duplicate` and `unrecoverable`. The log labels the ID as a duplicate and supplies no replacement ID. The same ID appears in `pl_entries_PLXKSrZvHoN9eL0fxlBjQcas7t-UrmSHSG.tsv:197`.
- Resolution. Exclude this occurrence from the offline catalog.

## TSV-only occurrence `PLXKSrZvHoN9cGYTIytP0mRvHfudmlvCSV` / `tp6k1bO6nkw` / index `209`

- TSV row `pl_entries_PLXKSrZvHoN9cGYTIytP0mRvHfudmlvCSV.tsv:209` has title `NA`. This is occurrence 1 of 1 for the ID in that playlist.
- App positions for this ID in catalog.js DATA.playlists record 65 are absent. The ID is absent from DATA.videos, all three public tab TSVs, and all_ids.txt.
- The inventory probe log `unresolved_ids.csv:21` records `removed_tos` and `unrecoverable`.
- Resolution. Exclude this occurrence from the offline catalog.

## TSV-only occurrence `PLXKSrZvHoN9cf7lGMyZjw0cndaCk004f0` / `uK0gvIbzbbI` / index `0074`

- TSV row `pl_entries_PLXKSrZvHoN9cf7lGMyZjw0cndaCk004f0.tsv:74` has title `NA`. This is occurrence 1 of 1 for the ID in that playlist.
- App positions for this ID in catalog.js DATA.playlists record 67 are absent. The ID is absent from DATA.videos, all three public tab TSVs, and all_ids.txt.
- The inventory probe log `unresolved_ids.csv:22` records `removed_violent_graphic` and `unrecoverable`.
- Resolution. Exclude this occurrence from the offline catalog.

## TSV-only occurrence `PLXKSrZvHoN9cf7lGMyZjw0cndaCk004f0` / `hYRb7csrJdQ` / index `0100`

- TSV row `pl_entries_PLXKSrZvHoN9cf7lGMyZjw0cndaCk004f0.tsv:100` has title `NA`. This is occurrence 1 of 1 for the ID in that playlist.
- App positions for this ID in catalog.js DATA.playlists record 67 are absent. The ID is absent from DATA.videos, all three public tab TSVs, and all_ids.txt.
- The inventory probe log `unresolved_ids.csv:17` records `removed_violent_graphic` and `unrecoverable`.
- Resolution. Exclude this occurrence from the offline catalog.

## TSV-only occurrence `PLXKSrZvHoN9cf7lGMyZjw0cndaCk004f0` / `eJ6ZMd4sVrI` / index `0466`

- TSV row `pl_entries_PLXKSrZvHoN9cf7lGMyZjw0cndaCk004f0.tsv:466` has title `Al Jazeera  Live الجزيرة  | البث المباشر`. This is occurrence 1 of 1 for the ID in that playlist.
- App positions for this ID in catalog.js DATA.playlists record 67 are absent. The ID is absent from DATA.videos, all three public tab TSVs, and all_ids.txt.
- The inventory probe log `unresolved_ids.csv:15` records `livestream_lost` and `unrecoverable`.
- Resolution. Exclude this occurrence from the offline catalog.

## TSV-only occurrence `PLXKSrZvHoN9eL0fxlBjQcas7t-UrmSHSG` / `ZuA_EVIl7Bo` / index `196`

- TSV row `pl_entries_PLXKSrZvHoN9eL0fxlBjQcas7t-UrmSHSG.tsv:196` has title `NA`. This is occurrence 1 of 1 for the ID in that playlist.
- App positions for this ID in catalog.js DATA.playlists record 69 are absent. The ID is absent from DATA.videos, all three public tab TSVs, and all_ids.txt.
- The inventory probe log `unresolved_ids.csv:12` records `duplicate` and `unrecoverable`. The log labels the ID as a duplicate and supplies no replacement ID. The same ID appears in `pl_entries_PLXKSrZvHoN9eemz-i3_rzlVrOs5EiyPwc.tsv:12`.
- Resolution. Exclude this occurrence from the offline catalog.

## TSV-only occurrence `PLXKSrZvHoN9eL0fxlBjQcas7t-UrmSHSG` / `3_y8JK2Li5Q` / index `197`

- TSV row `pl_entries_PLXKSrZvHoN9eL0fxlBjQcas7t-UrmSHSG.tsv:197` has title `NA`. This is occurrence 1 of 1 for the ID in that playlist.
- App positions for this ID in catalog.js DATA.playlists record 69 are absent. The ID is absent from DATA.videos, all three public tab TSVs, and all_ids.txt.
- The inventory probe log `unresolved_ids.csv:3` records `duplicate` and `unrecoverable`. The log labels the ID as a duplicate and supplies no replacement ID. The same ID appears in `pl_entries_PLXKSrZvHoN9eemz-i3_rzlVrOs5EiyPwc.tsv:14`.
- Resolution. Exclude this occurrence from the offline catalog.
