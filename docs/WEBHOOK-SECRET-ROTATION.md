# Webhook secret rotation

Rotate Stripe, Razorpay, GitHub, and LinkForty webhook secrets every 90 days.

1. Generate and configure the new provider secret.
2. Set `<SECRET>_PREVIOUS` to the outgoing value and `<SECRET>_PREVIOUS_EXPIRES_AT` to no more than seven days ahead (Unix milliseconds).
3. Deploy after `bun run verify:config-drift` succeeds.
4. After the overlap, remove both `PREVIOUS` variables and rerun the gate.

GitHub endpoint: `POST /api/github/webhook`. It verifies `X-Hub-Signature-256` over the raw UTF-8 body and persists `X-GitHub-Delivery` before any future event side effect. Configure GitHub with the active secret; re-deliveries return success without repeating the side effect.
