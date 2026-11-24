import json
import tempfile
import unittest
from collections import Counter
from pathlib import Path

import audit_catalog as audit


class CatalogAuditTest(unittest.TestCase):
    def test_source_totals_and_complete_join(self):
        data, counts, discrepancies, _ = audit.reconcile()
        expected = {
            ("tsv", "PLXKSrZvHoN9eslRpkrxvTkTpFO0QrzD3G", "tp6k1bO6nkw", "37"),
            ("tsv", "PLXKSrZvHoN9c_bFPBSM_I9EkAcQCX0J8t", "XEwSL7ipork", "46"),
            ("tsv", "PLXKSrZvHoN9f0e4ZoRV50x02TzfIzZLRR", "nKiP1oFdrTw", "067"),
            ("tsv", "PLXKSrZvHoN9f0e4ZoRV50x02TzfIzZLRR", "EYFpmAxe7wA", "154"),
            ("app", "PLXKSrZvHoN9f0e4ZoRV50x02TzfIzZLRR", "1zRVE2yomk4", None),
            ("tsv", "PLXKSrZvHoN9ecZ95DiQoilTY18DKXYP3e", "qXkSN9Eipc0", "106"),
            ("tsv", "PLXKSrZvHoN9eemz-i3_rzlVrOs5EiyPwc", "ZuA_EVIl7Bo", "12"),
            ("tsv", "PLXKSrZvHoN9eemz-i3_rzlVrOs5EiyPwc", "3_y8JK2Li5Q", "14"),
            ("tsv", "PLXKSrZvHoN9cGYTIytP0mRvHfudmlvCSV", "tp6k1bO6nkw", "209"),
            ("tsv", audit.BUKHARI, "uK0gvIbzbbI", "0074"),
            ("tsv", audit.BUKHARI, "hYRb7csrJdQ", "0100"),
            ("tsv", audit.BUKHARI, "eJ6ZMd4sVrI", "0466"),
            ("tsv", "PLXKSrZvHoN9eL0fxlBjQcas7t-UrmSHSG", "ZuA_EVIl7Bo", "196"),
            ("tsv", "PLXKSrZvHoN9eL0fxlBjQcas7t-UrmSHSG", "3_y8JK2Li5Q", "197"),
        }
        self.assertEqual(counts["app_entries"]["value"], 4320)
        self.assertEqual(counts["tsv_entries"]["value"], 4332)
        self.assertEqual(Counter(discrepancies), Counter(expected))
        self.assertEqual(audit.reconcile()[2], discrepancies)
        bukhari = next(p for p in data["playlists"] if p["id"] == audit.BUKHARI)
        self.assertEqual(len(bukhari["items"]), 1128)
        self.assertEqual(len({item["id"] for item in bukhari["items"]}), 996)

    def test_output_matches_declared_totals_and_replays_byte_for_byte(self):
        with tempfile.TemporaryDirectory(dir=audit.OUTPUT) as directory:
            output = Path(directory)
            audit.write_outputs(output)
            first = {p.name: p.read_bytes() for p in output.iterdir()}
            audit.write_outputs(output)
            self.assertEqual(first, {p.name: p.read_bytes() for p in output.iterdir()})
            data = json.loads(first["catalog-reconciled.json"])
            self.assertEqual(data, audit.read_data(output / "catalog-reconciled.js"))
            counts = json.loads(first["counts.json"])
            self.assertEqual(len({v["id"] for v in data["videos"]}),
                             counts["reconciled_video_ids"]["value"])
            for playlist in data["playlists"]:
                self.assertEqual(playlist["count"], len(playlist["items"]))
            self.assertEqual(sum(len(p["items"]) for p in data["playlists"]),
                             counts["reconciled_entries"]["value"])
