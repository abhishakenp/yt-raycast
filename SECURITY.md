# Security Policy

## Reporting a vulnerability

Email **security@ship-fast.ai** with a description, reproduction steps, and the
impact you believe it has. Please do not open a public issue for a suspected
vulnerability.

We aim to acknowledge a report within 3 business days and to give a remediation
timeline within 10 business days. Please give us 90 days before public
disclosure, or less if we have already shipped a fix.

Testing that is always in scope: your own sessions and your own account.
Testing that is never acceptable: denial of service, spam, social engineering,
physical attacks, or accessing data belonging to other users. If a bug gives
you access to another user's data, stop and report it — do not enumerate.

## Security model

### Trust boundaries

| Boundary | What is trusted |
|---|---|
| Browser → HTTP route | Nothing. Every input is validated and rate limited. |
| HTTP route → Convex | Server-only mutations require `SHARE_BONUS_MUTATION_SECRET`. |
| Payment provider → webhook | HMAC signature, with a ±5 minute replay window. |
| Generated site → app origin | Nothing. Generated HTML is sandboxed. |

### Server-only mutations

Some Convex mutations must never be reachable from a browser, because the check
that makes them safe lives in the HTTP route and cannot run inside a mutation
(most often an outbound model call). These verify a shared secret via
`convex/lib/server_secret.ts`:

- `sessions.create` — the LLM content classifier runs in the API route.
- `gallery_preview_images.generateUploadUrl` / `commit` / `clearCache`
- `contentCache.setPublic`, `translationCache.completeBatch` / `releaseBatch`
- `shareBonus.*`, `moderation.*`, `billing.applyBillingWebhook`,
  `billing.revokeBillingAccess`, `partners.applyPartnerBillingWebhook`,
  `linkforty.*`, `sessions.claimAnonymousSessionsByClientIdMutation`

A mutation whose safety depends on something the mutation itself cannot check
belongs on this list.

### Untrusted generated HTML

Generated sites are authored by a model from user prompts and are treated as
hostile:

- `/api/sessions/:id/preview-raw` is served with
  `Content-Security-Policy: ... sandbox allow-scripts` and no
  `allow-same-origin`, so its scripts run in an opaque origin with no access to
  cookies, storage, or credentialed requests on the app origin.
- Dashboard and export previews render inside `<iframe sandbox>` without
  `allow-same-origin` or `allow-popups-to-escape-sandbox`.
- Saved preview edits are checked by `convex/lib/preview_html_safety.ts`, which
  runs **inside the `createEdit` mutation** as well as in the HTTP route.
- `server/middleware/security-headers.ts` applies a baseline CSP,
  `X-Frame-Options`, `nosniff`, `Referrer-Policy`, COOP and HSTS to every other
  response.

### Secrets

- Anything prefixed `VITE_` or `NEXT_PUBLIC_` is **inlined into the public
  browser bundle**. `scripts/assert-no-secret-vite-vars.ts` fails the build if
  a credential-looking name carries one of those prefixes.
- Server secrets are read from unprefixed env vars only.
- The IP hash salt (`SHIP_FAST_IP_HASH_SALT`) is mandatory in production;
  hashing an IP without one is equivalent to storing it in plaintext.

### Cost controls

`DISABLE_MODEL_SPEND=true` stops every model-spending route immediately without
a deploy. `MODEL_DAILY_CALL_CAP` sets a global per-process daily ceiling across
all of them.

## Development escape hatches

`VITE_DISABLE_CLERK=true` and `DISABLE_PAYWALL=true` disable **all** ownership
and admin checks. They are inert when `NODE_ENV=production` (unless `IS_DEV` is
explicitly set), so a stray value in a production environment cannot open the
deployment. Never set `IS_DEV=true` in production.
