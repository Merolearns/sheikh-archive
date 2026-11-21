# GLM voice — V5 consultation (Sheikh Moustafa Kamel offline video library)

**Status: GLM SILENT — no answer obtained. This file records the failure only. No GLM opinion is stated anywhere below, and no opinion has been invented to fill the slot.**

## What happened

Two calls to the GLM connector helper were attempted on Fri Nov 20, 2026 ~23:04 UTC (15:04 PST):

1. `~/workspace/custom-connectors/custom.glm/bin/glm-chat --check-key`
2. `~/workspace/custom-connectors/custom.glm/bin/glm-chat --prompt "Reply with exactly: OK" --max-tokens 10`

Both failed identically, before any request reached Z.ai, with:

```
dynamic_credentials.DynamicCredentialError:
authd /v1/credentials/surrogate returned HTTP 403:
this connector's credentials are not available to the sandbox;
use the connector's privsep tool, or a custom.* connector whose policy
allows sandbox use. Need help? See S693585
```

## Root cause

The GLM connector has no registered credential. Its connector doc
(`~/workspace/custom-connectors/custom.glm/CONNECTOR.md`) states, verbatim in
effect: **Status: NOT CONNECTED — no credential yet (Nov 14, 2026)**. No Z.ai
account or API key exists yet; the credential registration and first test call
wait on the owner's step (create a free account at z.ai, create an API key,
save it through the Secure Vault capture page). Because there is no credential
to retrieve, the authd surrogate endpoint returns 403 and the helper cannot
attach a Bearer key to any request.

This is **not** a rate limit, timeout, or transient error, so no backoff retry
would help and no paid-model fallback was attempted (the paid GLM model stays
OFF without the owner's explicit word, per the standing rule). The 403 is a
hard failure of the same kind the skill lists as an immediate failure
(401/403/404: do not retry).

## What was NOT done

- No GLM answer was obtained, so sections (1)–(6) of the consultation
  (dual playback design, Books section, About the Sheikh page, ranked
  additional improvements, risks, explicit NOT-dos) are **not answered here**.
- No opinion has been invented, paraphrased from another voice, or filled in
  from the grounding material. The grounding files (vetted playbook,
  BRIEF_V4, DECISIONS, TEST-RESULTS, research reports, v4 preview) were not
  used to fabricate a GLM position.
- Nothing was built, edited, or modified. No app file, v4 file, or other
  voice's file was touched.

## What is needed to get the GLM voice

The owner's step from the connector doc, in order:

1. Create a free account at z.ai (email sign-up; no card, no top-up).
2. Create an API key at z.ai/manage-apikey/apikey-list (shown only once).
3. Save the key through the Secure Vault capture page only, never in chat or
   in a file, using the registered connection details
   (provider `glm`, auth scheme `api_key`, bearer header, host `api.z.ai`).
4. Prove access with `glm-chat --check-key`, then verify with
   `glm-chat --prompt "Reply with exactly: OK" --max-tokens 10`.
5. Re-dispatch this consultation (free model `glm-4.7-flash` only) once the
   check passes.

## Carry-forward

Per the team-organization rule, the missing GLM voice is a **gap in the
verdict record, not agreement**. The V5 verdict must note GLM as silent
(connector not connected, no credential) and must not count GLM toward any
majority on the three decided requirements or the open improvements.
