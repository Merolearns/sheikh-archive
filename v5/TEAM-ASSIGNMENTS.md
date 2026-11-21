# V5 team assignments — each voice does only what it does best

Owner order, Nov 20, 2026 voice call: Claude working 20 minutes then clocking out is not acceptable. Every team member is assigned to what he does absolutely best, and the capped builder never carries work another voice can do. This file is the single source of truth for V5 work splits. The 11:15 PM resume and every later session follow it.

## The rule that fixes the 20 minutes

Claude Code's 5-hour cap is spent on BUILDING ONLY. It was doing everything — building, testing its own work, voting in councils, reading the whole catalog — and that is what burned 11.4M tokens in 12 minutes. From now on, anything another voice can do, another voice does.

## Assignments

- **Claude Code — builds the app code, nothing else.** Implements V5 items 1–15. Deep review and judgment on code it wrote. Fixes what the testers find. NEVER: council votes, mechanical sweeps, testing its own work, reading the whole catalog for a non-build reason. Sessions are scoped: one item per session, only the context that item needs (see AGENTS.md cap lesson).
- **Codex — tests the website and does the mechanical work.** HTTP checks, screenshot runs, guard checks, catalog audit scripts, terminal work, build verification. It is the lead tester: the builder never tests its own work. RISK: Codex trial ends Nov 20, 2026. If it stops answering, Gemini takes the mechanical checks and the owner is told the same day.
- **Gemini — independent checker and second tester.** Cross-checks Codex findings, re-tests fixes. Flaky connection: retry with backoff, report silence, never count silence as agreement.
- **DeepSeek — independent diagnosis and review.** Judgment on disputed findings, second opinion on anything the builder and tester disagree about.
- **Qwen — Arabic copy and fast checks.** Native Arabic copy audit, Arabic-first research, fast verification passes.
- **Kimi — long-context review.** Reads full files end to end, catalog consistency, long transcript and book checks.
- **GLM — unassigned.** No credential on file, silent in every round so far. Not used until the owner registers a key.
- **Noor (coordinator and judge) — owns the plan, the resume, and the milestone updates.** Dispatches, judges disputes by majority rule, reports to the owner at every milestone.

## Testing rule (binding)

Every build session is followed by an independent test pass (Codex lead, Gemini second) before anything is reported as done. A builder's own test counts (HTTP 26/26, behaviour 37/37, shots 65/65 in v4) are treated as the builder's claim, not proof. Proof is the independent pass. The item-2 owner-hardware matrix is the release gate.

## Quota rules (from the Nov 20 cap incident)

1. Pre-flight before any Claude Code launch: plain shell check that brief, base, and work dir are readable from the launch directory. Zero Claude Code usage for the check.
2. Scoped sessions: one item per session, only the context that item needs.
3. A READY probe proves almost nothing about headroom. The smallest scoped item launches first as the real quota test.
4. No council, consultation, or design-voice work on Claude Code while a build is pending or running.
