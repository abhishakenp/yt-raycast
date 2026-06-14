# Go Prod

Production must never run with local-development quota bypass enabled.

## Convex Quota Safety

`sessions.create` enforces anonymous daily quota, authenticated monthly quota, and short-window rate limits in Convex.

The only server-owned bypasses are Convex runtime environment variables:

- `IS_DEV=true`
- `DISABLE_LIMIT=true`

These are safe only on local or development Convex deployments. They must be absent or set to `false` in production Convex.

Before deploying production Convex, verify:

```bash
npx convex env list
```

Production must not include:

```text
IS_DEV=true
DISABLE_LIMIT=true
```

If either value is enabled in production, every user of that Convex deployment can bypass quota. This is the real risk.

## Localhost Is Not Trusted

Do not treat `localhost`, browser origin, or client-provided IP as proof of developer access.

A user can run their own local app and point it at the production Convex URL. That must not grant unlimited generations.

The current browser flow calls Convex directly:

```text
browser -> api.sessions.create -> Convex
```

Because the app server is not in the middle of that mutation, Convex does not receive a trustworthy request IP for `sessions.create`.

## Whitelisted IPs

`WHITELISTED_IPS` can only be trusted in code paths where the Ship Fast server receives the HTTP request and reads the real client IP from trusted infrastructure headers.

Do not pass a whitelisted-IP decision from the browser to Convex. That would be forgeable.

If production needs IP-based generation bypass, implement one of these server-owned designs:

- Route generation creation through a Ship Fast server endpoint that checks the request IP and calls Convex from the server.
- Or have the server issue a short-lived signed bypass token after checking the request IP, then have Convex verify the signature before bypassing quota.

Until one of those exists, whitelisted IPs do not safely bypass `sessions.create`.

## Required Production Check

Before going prod:

1. Confirm production Convex has no `IS_DEV=true`.
2. Confirm production Convex has no `DISABLE_LIMIT=true`.
3. Confirm local `.env.local` values were not copied into production.
4. Generate once as an anonymous user and verify quota still returns `QUOTA_EXCEEDED` after the allowed daily limit.
5. Generate from localhost against production Convex and verify it does not bypass quota.
