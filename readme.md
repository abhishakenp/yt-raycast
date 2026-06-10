# Ship Fast

Prompt-to-website app built with TanStack Start, Convex, Clerk, and the local
Ship Fast engine packages.

## Development

```bash
bun install
bun run dev
```

The app runs on `http://localhost:3000`.

## Root layout

- `src/` contains the TanStack Start app.
- `convex/` contains Convex schema and session mutations.
- `packages/ship-fast-engine/` contains the generation engine.
- `packages/ship-fast-blocks/` contains OpenUI/React blocks used by the engine.
- `packages/ship-fast-aeo/` contains SEO/AEO rendering helpers.
- `public/` contains marketing assets and browser runtime scripts.

## Environment

Copy `.env.example` to `.env.local` for local app runtime values.

Required for normal local generation:

```bash
VITE_CONVEX_URL=
VITE_CONVEX_SELF_HOSTED_URL=
GROQ_API_KEY=
GEMINI_API_KEY=
```

Clerk, Stripe, Razorpay, Sanity, and Medusa variables are optional unless the
corresponding feature is being tested.

## Scripts

```bash
bun run dev              # Start TanStack Start on port 3000
bun run build            # Build production output
bun run test             # Run Vitest
bun run generate-routes  # Regenerate TanStack route tree
```
