# Pending steps only the owner can physically do — SEND ONCE, BATCHED, WHEN THE APP IS READY
# Do NOT send these one by one. Do NOT ask for keys. Do NOT offer the secure box.
# Prepared Nov 20, 2026 ~22:20 PST, corrected ~22:27 PST per owner order.

## Step 1 — Broader Cloudflare token (unblocks the public playback link)
- WHY: the current token is Object Read and Write on one bucket only. It verifies as valid, but the
  public-link toggle (PUT /accounts/{id}/r2/buckets/sheikh-archive-videos/domains/managed,
  {"enabled": true}) and even reading the bucket's domains return 403 with it. Docs confirm the
  toggle is an account-level R2 operation. A broader token is the only route without a dashboard tap.
- EXACT: Cloudflare dashboard > My Profile > API Tokens > Create Token > create a token with
  R2 Edit permission on the account (template "Edit Cloudflare Workers R2 Storage" covers it, or
  custom: Account / R2 / Edit). The existing object-scoped token stays untouched for uploads.
- BLOCKED COLLECTION: the secure box does not appear on his phone, so there is currently no working
  route to receive a second token. This step is PARKED, not asked. Do not offer the box for it.
- AFTER: agent flips the toggle via API, returns the public r2.dev URL, wires it into the app.

## Step 2 — S3 keys + laptop upload (one sitting, keys never leave his laptop)
- FINAL FLOW (owner order Nov 20 ~22:26 PST): the keys are NEVER asked for again — no secure box,
  no chat, never quote them back. When he runs the laptop upload script, it asks for the two keys
  once there and stores them only on the laptop. That is the only route.
- STATUS: upload script prepared by the call agent Nov 20 evening; verify it firsthand before the
  batched message goes out. Upload path verified live Nov 20 ~22:28 PST: bucket answers, 0 objects,
  ready for upload.

## Status notes
- Public development URL is DISABLED (confirmed by the owner from bucket Settings Nov 20 ~22:37 PST). The r2.dev URL (pub-<hash>.r2.dev) is only assigned once it is enabled, and cannot be guessed from the bucket name. Enabling it is still Step 1 above.
- Nothing above is to be sent until the app itself is ready to show.
