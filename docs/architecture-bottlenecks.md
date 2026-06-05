# Architecture Bottlenecks

Date: 2026-06-04

Scope: generation launch path.

Primary architecture reference: `docs/generation-architecture.md`.

## Current Bottlenecks

- Generation progress is split across server events, dashboard state, iframe reloads, and export readiness. This makes final-state glitches easy to reintroduce.
- Quota, billing, coupon, and private-generation checks are currently route-level concerns. They work, but the policy surface is spread across billing helpers, payment handlers, and `/api/sessions`.
- Cost monitoring is file-backed for launch. It is simple and inspectable, but not ideal for multi-instance production.
- Export cache metadata now tracks badge mode. Additional export variants will need a more explicit target/cache key model.
- Prompt safety is duplicated lightly between client and server for UX. Server remains authoritative, but rule drift is possible.

## Recommended Refactors

- Extract a generation admission service that returns one decision object for auth, quota, private mode, prompt policy, and whitelist status.
- Move quota and usage accounting to a durable datastore before scaling beyond one runtime instance.
- Give export targets an explicit cache key that includes target, badge mode, privacy mode, and engine version.
- Add a small generation lifecycle state machine for dashboard preview events so iframe reloads are tied to durable ready states.
- Keep homepage engine behavior generic by site kind and structure, not by prompt-specific branches.
