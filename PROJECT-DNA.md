# Ship Fast — Complete Project Blueprint

## 1. Overview

Ship Fast is an AI-powered website generator. A visitor describes a site in natural language; the system produces a live, interactive preview within minutes, then supports refinement through chat, inline editing, optional content management, optional commerce backends, export to multiple formats, and deployment to a public subdomain.

**Who it is for:** Entrepreneurs, marketers, agencies, and hobbyists who want a credible web presence without hand-coding. Anonymous users can try the product with tight limits; signed-in users get higher quotas, account-owned projects, and paid export capabilities.

**Core value proposition:** Turn a prompt into a polished, multi-page website with real-time visual feedback, structural quality guarantees, and a path to ownership (export, deploy, CMS, store).

**Architectural stance:** One long-running application process owns HTTP, WebSockets, background generation promises, and optional container-backed integrations. Durability comes from per-session workspaces on disk plus cloud-backed identity and billing records. There is no central job queue; generation is fire-and-forget with live event streaming.

**Design principle:** The generation engine is generic—site kind, layout grammar, and structural audits scale to arbitrary prompts. Rules are never keyed to named demo briefs or single verticals.

---

## 2. Core Concepts & Data Model

### Session (central aggregate)

A session is one website-generation project from prompt through preview, refinement, export, and optional deployment.

**Holds:** unique identifier, workspace location, original prompt (with recovery fallbacks), creation timestamp, owner identity (account id or anonymous with owner secret), privacy flag, preferred export target, preferred generation language, generation tasks, homepage/site-spec/OpenUI readiness flags, elapsed time and dollar cost, optional alternative design JSON, theme color override, deployment slug and URL, provisioned CMS and commerce configuration, connected real-time clients, buffered streaming state for reconnect replay.

**Relationships:** one account owns many sessions; one session has one canonical site spec, one live preview HTML, up to fifty preview history checkpoints, optional deployment mapping, optional CMS tenant, optional commerce backend, one chat store.

**Lifecycle:** created after admission checks; updated continuously during generation and refinement; recovered from disk on server restart; deleted with full workspace teardown and integration deprovision.

### User and account entitlements

Identity comes from external authentication (stable account id, email, profile). A customer record per account stores download credit balance with capped append-only history, and a collection of subscription documents (provider, status, plan ids, checkout references, timestamps). Active subscription statuses include active, trialing, and authenticated variants.

**Relationships:** account → many sessions; account → one customer record → many subscriptions and credit balance.

### Site specification (canonical source of truth)

Structured, versioned description of the generated website—distinct from rendered preview HTML.

**Holds:** project name, URL slug, inferred site type (landing, SaaS, blog, ecommerce, institutional, docs, portfolio, dashboard, etc.), original prompt, generation timestamp, schema version, supported export frameworks, full visual theme (palette, typography, radii, spacing, shadows, dark/light), navigation and footer links, CTAs, ordered pages each with route, SEO block, layout type, and typed sections (hero, features, pricing, FAQ, product grid, blog list, contact form, etc.), component registry, interactions, forms, assets, ecommerce extension when applicable.

**Invariants:** required project fields; at least one page; unique page ids and routes; unique section ids per page; supported section types; export targets from allowed set; older schema versions migrate forward on read.

### Preview and versions

**Live preview:** rendered homepage HTML in the session workspace; updated by generation, inline edits, chat, palette, CMS sync, history restore.

**OpenUI source:** programmatic representation of pages for developer preview clients.

**Preview history:** ring buffer up to fifty HTML checkpoints with timestamp ids; restore overwrites live preview.

**Theme override:** small persisted color patch merged at render time—not a branching version tree.

### Generation tasks

Pipeline progress for the dashboard—typically one homepage task with status pending → in-progress → done/failed, label, target output, associated files. Persisted and streamed live.

### Quota and rate-limit state

In-memory sliding windows (periodically persisted to disk): monthly generations per authenticated user (10 free / 30 subscribed), daily generations per anonymous IP (2 + optional share bonus), burst limits per user and IP, concurrent generation count (max 2), export build limits, auxiliary endpoint limits. Whitelisted IPs and local development bypass limits.

### Deployment registry

Global mapping: unique URL slug → session id and deployment timestamp. One active slug per session; re-deploy replaces prior mapping.

### CMS tenant (per session)

Provisioned content project with dataset, API tokens, provisioning timestamp. Site settings singleton holds marketing overrides (titles, descriptions, hero copy, OG/hero images, chat-synced headlines). Content types include blog posts, notices, job openings, localized strings. Chat conversation may mirror to a CMS document.

### Commerce backend (per session)

Optional isolated store with backend URL, admin URL, publishable key, credentials, port, container id, optional public subdomain. Site spec ecommerce sections bind to live catalog.

### Chat store

Per-session messages (user/assistant), rolling summary, version, timestamps—size-capped. Persists locally; optional CMS mirror.

### Export metadata

Per-target records: generation time, file count, bundle path, hash of site spec used. Target ready only when bundle exists and hash matches current spec.

### Public gallery eligibility

Sessions appear when homepage-ready, not private, and generation cost > 0 (excludes zero-cost test runs).

### Anonymous session index (client-side)

Browser-local list of anonymous session ids, prompts, owner secrets—for reopen and batch claim on sign-in. Not authoritative server state.

### Marketing site settings (product scope)

Separate shared CMS settings for the product homepage itself (hero, SEO, pricing copy)—not per-session.

---

## 3. User Journeys

### Journey A: Anonymous first generation (happy path)

1. Visitor lands on marketing homepage with prompt area, example chips, optional gallery.
2. User types description (minimum ~15 characters to enable submit); optional language selector and design-reference URLs.
3. Client checks content policy; if anonymous quota exhausted locally, auth overlay opens without server call.
4. User submits → server validates prompt, policy, rate limits → creates session → returns id immediately; generation runs in background.
5. Homepage opens embedded session dashboard (iframe) or navigates to full dashboard URL.
6. Intro overlay plays for new sessions: logo, typing prompt, countdown.
7. WebSocket connects; user sees tasks, logs, progress bar, live preview streaming skeleton then pages.
8. Generation completes → toast with elapsed time; chat button appears; site tools rail unlocks.
9. User may refine via chat, inline edit, or browse gallery for another project.

**Failure paths:** policy block (inline alert, no session); gibberish rejection (400 guidance); daily/IP/concurrent limits (429, share panel or auth overlay when bonus exhausted); network error (alert); generation failure (failed task styling, error event, quota refunded).

### Journey B: Anonymous quota exhaustion → sign-in

1. After two daily generations (three with share bonus), client counter blocks submit.
2. Share-for-credit panel offers social links; one bonus per IP per calendar day.
3. After bonus used, copy steers to sign-in; auth overlay opens on explicit server quota signal or premium action.
4. Sign-in via Google, GitHub, or email → overlay closes; monthly quota applies (10 free / 30 Pro).

### Journey C: Authenticated generation with cache hit

1. Signed-in user submits prompt identical to prior session (same language, same design-reference fingerprint).
2. Server returns existing session id with cached flag—no new generation, no quota consumption (except brand-driven prompts missing brand profile may bypass cache).

### Journey D: Session refinement via chat

1. After generation reaches editable state (site spec or completed tasks + preview HTML).
2. User opens chat panel, sends text and optional image attachments.
3. Server accepts with 202; edit runs async; assistant message appended; preview reloads on success.
4. **Failures:** 409 if generation incomplete; 400 policy; 429 rate limit (refunded on edit failure); network errors in status line.

### Journey E: Inline preview editing

1. User enables Select mode, clicks element in preview iframe.
2. Rail editor shows text, colors, spacing, shape, shadow, layout, AI tabs.
3. Done persists cleaned HTML, creates history checkpoint, broadcasts preview reload.
4. Undo/redo within editor; server-side restore available via checkpoint API.
5. **Failures:** degenerate HTML rejected in production; AI assist errors returned to iframe.

### Journey F: CMS content management

1. User opens Edit content on site tools rail; may see provision modal for first CMS setup.
2. Tabs: embedded studio iframe, Medusa admin (ecommerce), or Quick fields form.
3. Save patches site settings; Apply Sanity re-renders preview from CMS.
4. **Failures:** 503 if CMS not configured; validation errors in status line.

### Journey G: Export and download

1. After site spec ready, Export menu shows targets (HTML, React, Next.js) with Waiting/Building/Ready/Pro-only states.
2. Anonymous user → sign-in wall. Signed-in without subscription/credits → payment modal (Stripe or Razorpay by geography).
3. User triggers build (auto after generation for signed-in, or manual POST); polls until ready.
4. Download consumes one credit unless subscribed; returns ZIP attachment.
5. **Failures:** 402 payment required; 401 if anonymous; 404 bundle not ready (retryable); 429 export rate limit.

### Journey H: GitHub push

1. Authenticated Pro user with GitHub OAuth token pushes export to new private repository.
2. Same paywall as download; credit consumed when applicable.
3. **Failures:** invalid token (re-auth); 409 conflicts retried automatically; payment/ownership errors.

### Journey I: Deployment

1. On generation success, system may auto-register subdomain slug.
2. User can manually trigger deploy; public URL appears in preview chrome.
3. Subdomain requests serve static files from session workspace.
4. **Failures:** deploy errors logged; session still usable on preview path.

### Journey J: Clone from URL

1. User provides HTTPS clone URL (dashboard new-prompt overlay or session create).
2. Pipeline crawls site, captures pages, extracts design tokens, converts sections, streams progressive preview.
3. **Failures:** capture retries once; per-page/section fallbacks; empty clone aborts with error.

### Journey K: Claim anonymous sessions on sign-in

1. User signs in; client may POST session ids to claim endpoint.
2. Ownership transfers; anonymous secrets removed.
3. **Failures:** per-id failure if already owned.

### Journey J: Pricing and subscription checkout

1. User opens payment modal from export rail or pricing page context.
2. Selects Pro or early-adopter tier; optional coupon.
3. Checkout starts (redirect or popup by gateway); webhook updates entitlements.
4. Dashboard refreshes export targets; premium badges clear.

---

## 4. Features & Capabilities

### Marketing homepage and prompt entry

**What:** Server-rendered landing with prompt form, animated placeholders, example chips, design-reference panel, public gallery, top-bar auth.

**Who:** Everyone; anonymous generation within quota.

**How:** Submit creates session; embeds dashboard on homepage path; tracks local anonymous counter; share bonus for +1 daily generation.

**Errors:** policy, gibberish, quota, network—see Journey A/B.

### Real-time session dashboard

**What:** Split layout—generation telemetry left, live preview right—with intro animation, task list, logs, viewport toggles, select/annotate modes, completion toast, new-prompt overlay.

**Who:** Anyone with session id; artifact mutations require ownership rules.

**How:** Initial REST hydrate plus WebSocket for all live updates; reconnect every 1.5s unless navigating away.

**Errors:** 404 session missing; hydrate failure still opens WebSocket; generation errors via events.

### AI website generation (OpenUI path)

**What:** Single primary task builds multi-page declarative UI program with planning, parallel page generation, validation/repair, static preview render, site spec persistence.

**Who:** Session creator within quota.

**How:** Background promise; progressive WebSocket streaming; post-save CMS/commerce sync hooks.

**Errors:** hard failure marks task failed, refunds quota; soft failures substitute template pages; partial site delivered.

### Clone mode

**What:** Crawl and reconstruct existing website from user-supplied URL.

**Who:** Same as generation.

**How:** Separate pipeline with crawl, capture, section conversion, progressive streaming.

**Errors:** per-page/section fallbacks; total failure on empty output.

### Chat-based refinement

**What:** Conversational edits to generated site with image attachments and Add section flow.

**Who:** Session artifact accessor after generation complete.

**How:** 202 accepted async edit with chat history composition.

**Errors:** 409 premature edit; policy; rate limits; note: legacy edit runner may throw until OpenUI-native edit engine ships.

### Inline preview editing

**What:** Click-to-edit text, styles, AI-assisted changes inside preview iframe with undo/redo and checkpoints.

**Who:** Artifact accessor.

**How:** Save homepage HTML endpoint; inline text/style AI endpoints.

**Errors:** degeneracy check in production; size caps; Indian-language mode restrictions.

### Palette and theme override

**What:** Apply brand color presets to preview and exports.

**Who:** Premium-unlocked users (client gate); theme POST currently lacks artifact check.

**How:** Persist override; merge into spec at render; broadcast theme events.

### CMS integration

**What:** Per-session Sanity tenant, embedded studio, quick fields, media library, sync preview from CMS.

**Who:** Artifact accessor; sync endpoint requires auth.

**How:** Background provision at session create; on-demand provision modal; PATCH site settings.

**Errors:** 503 not configured; field validation failures.

### Commerce integration

**What:** Per-session Medusa stack, admin iframe, storefront cart proxy, catalog sync from spec.

**Who:** Ecommerce-leaning prompts; Pro for admin rail.

**How:** Docker provision on demand; API proxy with publishable key.

**Errors:** provision failures leave session without commerce config.

### Export system

**What:** HTML, React, Next.js bundles as directories and ZIPs; optional badge on free tier.

**Who:** Authenticated owners with payment eligibility.

**How:** Hash-cached builds; auto-build chain after generation for signed-in users.

**Errors:** stale bundle rebuild; rate limits; not-ready polling.

### Billing and subscriptions

**What:** Pro subscription, credit packs, early-adopter slots, geo-routed gateways, partner coupons.

**Who:** Authenticated users.

**How:** Checkout start endpoints; webhooks update cloud billing records.

**Errors:** 503 unconfigured gateway; invalid coupon 400.

### Public gallery

**What:** Paginated recent public generations with thumbnails.

**Who:** Anonymous and signed-in visitors.

**How:** Server list plus client merge of local anonymous sessions on first page.

**Errors:** empty list on API failure.

### Deployment to subdomain

**What:** Register slug on product base domain; serve static site from workspace.

**Who:** Artifact accessor.

**How:** Auto on generation success or manual POST.

**Errors:** logged, non-blocking to session status.

### Auth overlay and session ownership

**What:** Modal sign-in; anonymous owner secrets; claim on sign-in.

**Who:** Triggered by quota, premium actions, explicit sign-in click.

**How:** Firebase client SDK; server verifies ID tokens.

**Errors:** missing config → anonymous-only mode; popup cancelled silently.

### Auxiliary features

- **Prompt suggestions:** AI completions while typing (rate limited; empty on failure).
- **Translation API:** Short text translation for UI (browser first, then LLM).
- **Brand lookup:** Proxy search for brand assets by name/domain.
- **Share bonus:** +1 anonymous daily generation after social share claim.
- **Next.js dev preview:** Optional child dev server per session for Next export testing.
- **Analytics:** First-party proxied privacy analytics on marketing pages.
- **Content policy:** Zero-tolerance blocklist on prompts and chat.
- **Development hot reload:** File watchers broadcast client_reload to connected clients.

---

## 5. Function-Level Behaviors

Organized by domain. Each entry: Purpose, Input, Process, Output, Errors, Side effects.

### Server bootstrap and lifecycle

**Start application**
- Purpose: Boot HTTP server and attach WebSocket handler.
- Input: Optional CLI workspace path and one-shot prompt.
- Process: Load environment; exit if primary LLM API key missing; resolve sessions directory; free listen port; load deployment index; delete legacy static homepage; restore rate-limit counters from disk; mark interrupted generating sessions as failed; optionally build embedded CMS studio; assemble middleware chain; listen; register signal handlers for optional Next preview child shutdown.
- Output: Running server on configured port.
- Errors: missing API key → exit; corrupt rate-limit file → fresh counters; studio build failure → warning only.
- Side effects: disk reads/writes; optional synchronous studio build spawn.

**Recover session from workspace**
- Purpose: Reconstruct in-memory session from disk artifacts.
- Input: Session id, workspace path.
- Process: Load metadata, tasks, prompt fallbacks, flags; garbage-collect empty workspaces; attach client set.
- Output: Session object or null.
- Errors: invalid workspace → delete or skip.
- Side effects: may delete empty directory.

**Broadcast to session clients**
- Purpose: Push JSON event to all WebSocket clients for a session.
- Input: Session id, message object.
- Process: Iterate client set; prune dead sockets; optionally buffer OpenUI stream for replay.
- Output: none.
- Errors: send failures prune client.
- Side effects: updates lastStatus and stream buffers.

### Session admission and creation

**Create session**
- Purpose: Admit new generation request and start background pipeline.
- Input: Prompt, optional language, export target, design reference URLs/notes, optional clone URL, optional auth identity.
- Process: Validate body; gibberish check; content policy; rate-limit and concurrent checks; cache lookup for authenticated duplicate prompts; create workspace and metadata; assign anonymous owner secret if needed; pre-warm CMS/commerce; mark generating; fire generation promise; return immediately.
- Output: Session id, workspace path, cached flag, remaining quota, optional anon secret.
- Errors: 400 validation/gibberish; 422 policy; 429 quota; background failure refunds quota.
- Side effects: disk workspace; background generation; optional integration provision; Slack notification in production.

**Check generation rate limits**
- Purpose: Enforce sliding-window quotas before accepting work.
- Input: User id or anonymous IP key, whitelist/dev flags.
- Process: Check monthly/daily/burst/concurrent counters; record hit on pass.
- Output: pass or structured limit error with code and remaining.
- Errors: at limit → 429 with specific code.
- Side effects: increments counters; periodic persistence.

**Refund rate-limit hit**
- Purpose: Restore quota slot after failed generation or edit.
- Input: User or anonymous key, limit type.
- Process: Decrement most recent applicable counter.
- Output: none.
- Side effects: counter mutation.

**Claim anonymous sessions**
- Purpose: Transfer anonymous session ownership to authenticated account.
- Input: Account id, array of session ids.
- Process: For each id, verify anonymous and unowned; set owner; remove anon secret.
- Output: claimed and failed id lists.
- Errors: per-id failure if already owned.
- Side effects: metadata write.

### Generation pipeline

**Run generation for session**
- Purpose: Execute primary homepage generation task.
- Input: Session with prompt and workspace.
- Process: Normalize prompt; create/update task to in-progress; invoke OpenUI homepage phase; on success mark done, record metrics, auto-deploy, auto-export for signed-in; on failure mark failed, broadcast error, refund quota.
- Output: void (async).
- Errors: thrown → failed status, error event.
- Side effects: artifacts on disk; WebSocket events; deployment; export chain.

**OpenUI homepage phase (orchestrator)**
- Purpose: Plan and generate multi-page UI program with streaming.
- Input: User prompt, session context.
- Process: Planning call (fallback plan on failure); emit theme/locale; auth-page shortcut if applicable; emit navigation skeleton; parallel page generation (max 8 workers) with per-page retries and template fallback; validate modules; persist program and site spec; render static preview; completion signals.
- Output: Final program, site spec, preview HTML.
- Errors: empty catalog → hard fail; per-page → soft fallback.
- Side effects: live-source callbacks for stream chunks; CMS settings sync; commerce catalog sync.

**Clone site pipeline**
- Purpose: Reconstruct site from existing URL.
- Input: Clone URL, session workspace.
- Process: Crawl graph; parallel page capture with one retry; segment sections; extract tokens; deduplicate sections; convert to UI program with caching; assemble and validate; stream progressively.
- Output: OpenUI program and preview.
- Errors: empty pages → fallbacks; total failure → abort.
- Side effects: clone_progress events; asset downloads.

**Detect site type**
- Purpose: Classify prompt into site kind for grammar and audits.
- Input: Prompt text.
- Process: Keyword heuristics first; small LLM classification fallback; default landing.
- Output: Site type enum.
- Errors: none blocking.
- Side effects: none.

**Generate site specification**
- Purpose: Produce validated structural JSON from prompt and context.
- Input: Prompt, context, design brief, brand profile.
- Process: LLM generation with up to two attempts; validate schema; migrate version; fallback spec from prompt if invalid.
- Output: Site spec document.
- Errors: fallback used instead of abort.
- Side effects: disk write; site_spec_ready event.

**Quality audit homepage output**
- Purpose: Reject or revise degenerate generated HTML.
- Input: HTML string, site type, prompt density hints.
- Process: Structural checks (viewport, headings, links, buttons, Tailwind, JS); degeneracy detection; Nova marketing bar for dense SaaS; Mobbin anchor soft warnings; scoring threshold.
- Output: pass/fail with revision feedback.
- Errors: fail → revision or fallback render.
- Side effects: may trigger regeneration pass.

### Preview and editing

**Serve preview HTML**
- Purpose: Deliver generated page with editing tools injected.
- Input: Session id, requested path within workspace.
- Process: Load file; for HTML rewrite CDN tags, normalize theme CSS, inject base href, cart UI if ecommerce, inline config and preview-tools script.
- Output: HTML or static asset bytes.
- Errors: 404 missing session/file.
- Side effects: none.

**Save homepage HTML**
- Purpose: Persist user-edited preview document.
- Input: Session id, HTML string, accessor credentials.
- Process: Validate length; strip editor artifacts; degeneracy check in production; write index.html; append history checkpoint (max 50); broadcast preview_reload.
- Output: ok, checkpointId.
- Errors: 400 size/quality; 403 access.
- Side effects: disk; checkpoint; WebSocket.

**Restore preview checkpoint**
- Purpose: Revert live preview to earlier saved HTML.
- Input: Session id, checkpoint id (safe pattern).
- Process: Load checkpoint HTML; overwrite index; broadcast reload.
- Output: ok.
- Errors: 404 missing; 400 invalid id.
- Side effects: preview file replace.

**Inline text AI edit**
- Purpose: Rewrite selected text per user instruction.
- Input: Current text, instruction, output language mode.
- Process: Route Indian mode to optional GPU endpoint then primary LLM; English to primary LLM.
- Output: improved text string.
- Errors: 400 validation; 502/500 LLM failure.
- Side effects: external LLM call.

**Inline style AI edit**
- Purpose: Modify HTML fragment styles per instruction.
- Input: Fragment HTML, instruction, optional computed styles/tokens/scope.
- Process: Validate fragment; strip huge data URLs from prompt; call LLM; return html or styleDiff JSON.
- Output: updated fragment or diff.
- Errors: validation and LLM errors as above.
- Side effects: external LLM call.

**Apply palette**
- Purpose: Save and apply theme color preset to preview.
- Input: Palette object with id and CSS variable maps.
- Process: Validate structure; persist; broadcast theme update.
- Output: saved palette.
- Errors: 400 invalid.
- Side effects: disk; WebSocket.

**Rerender preview from site spec**
- Purpose: Rebuild index.html from canonical spec.
- Input: Session id.
- Process: Load spec with theme override; render; write preview; signal ready; broadcast reload.
- Output: ok.
- Errors: 400 render failure.
- Side effects: preview file; events.

### Chat and refinement

**Load chat store**
- Purpose: Return conversation history for dashboard.
- Input: Session id, accessor.
- Process: Read local store; merge with CMS remote if newer.
- Output: messages, summary, version, editable flag.
- Errors: 404 session.
- Side effects: none.

**Post chat message / start edit**
- Purpose: Queue conversational site edit.
- Input: Text, optional attachment paths.
- Process: Policy check; edit-readiness gate; rate limits; append user message; return 202; run edit async; append assistant result or failure.
- Output: 202 accepted.
- Errors: 409 not ready; 400 policy; 429 limits.
- Side effects: chat persist; edit job; refund on failure.

**Upload chat images**
- Purpose: Store user images for edit context.
- Input: Multipart files (max 12, 4MB each, image types).
- Process: Validate types; save under user-uploads with hashed names.
- Output: paths array.
- Errors: 400 invalid.
- Side effects: disk files.

### Export and download

**Generate session export**
- Purpose: Build target framework bundle and ZIP.
- Input: Session, target (html/react/nextjs), user id for rate limit.
- Process: Load spec; apply theme override; check hash cache; render project; optional badge; zip; update export index.
- Output: export metadata.
- Errors: missing spec, unsupported target, build failure throws.
- Side effects: disk artifacts; export_ready event.

**Check export payment access**
- Purpose: Determine if user may download or push.
- Input: User id, session, paywall flags.
- Process: Evaluate subscription, historical access flag, credits; dev bypass.
- Output: allowed boolean, payment summary, credit consumption plan.
- Errors: none (caller maps to 402).
- Side effects: credit decrement on download when applicable.

**Download export ZIP**
- Purpose: Stream bundle file to client.
- Input: Session id, target, auth, ownership.
- Process: Verify access; verify bundle exists and hash matches; consume credit if needed; attach ZIP.
- Output: file stream.
- Errors: 401/403/402/404 retryable.
- Side effects: credit consumption; ledger entry.

**Push to GitHub**
- Purpose: Create/update private repo with export files.
- Input: Session, target, GitHub access token.
- Process: Payment check; render or reuse export; create repo with collision suffix retries; commit tree; up to 8 retries on 409 conflicts.
- Output: repo URL, ref, sha.
- Errors: auth, payment, API failures.
- Side effects: remote repo; session metadata.

### Billing

**Resolve payment gateway**
- Purpose: Choose Razorpay vs Stripe from user geography.
- Input: Request headers, optional client hint.
- Process: Infer country from CDN/geo headers or accept-language.
- Output: gateway id and currency context.
- Errors: none.
- Side effects: none.

**Start checkout**
- Purpose: Create provider checkout session for subscription or credits.
- Input: User id, mode, tier/pack id, optional coupon.
- Process: Validate coupon; check gateway configured; create provider session/order.
- Output: client checkout parameters.
- Errors: 400 invalid; 503 not configured; 500 provider error.
- Side effects: external payment API call.

**Process payment webhook**
- Purpose: Update entitlements from provider events.
- Input: Raw body, signature header.
- Process: Verify signature; parse event; idempotent update subscriptions/credits/refunds in cloud store.
- Output: ok.
- Errors: 400 bad signature/payload; 500 processing failure.
- Side effects: Firestore writes.

**Get subscription status**
- Purpose: Report active subscription for user.
- Input: User id.
- Process: Query cloud subscriptions collection.
- Output: boolean active.
- Errors: 500 on read failure.
- Side effects: none.

**Consume download credit**
- Purpose: Decrement credit balance with ledger entry.
- Input: User id, reason metadata.
- Process: Transactional read-modify-write with capped history.
- Output: remaining balance.
- Errors: insufficient credits.
- Side effects: Firestore write.

### CMS and commerce provision

**Provision CMS tenant**
- Purpose: Create per-session content project.
- Input: Session id; management credentials from environment.
- Process: Dedupe in-flight; create project, dataset, tokens via management API; persist config on session; register CORS.
- Output: config object.
- Errors: 503 if not configured; 500 provision failure.
- Side effects: external CMS project; session metadata.

**Patch CMS site settings**
- Purpose: Update marketing fields in tenant CMS.
- Input: Settings patch object, accessor.
- Process: Validate recognized fields; coerce strings; asset refs; write via write client; read back.
- Output: updated settings.
- Errors: 400 no fields; 503 no write client.
- Side effects: CMS document mutate.

**Provision commerce tenant**
- Purpose: Start isolated store stack for session.
- Input: Session id.
- Process: Allocate port; docker compose up; wait health; seed admin; store publishable key and URLs on session.
- Output: commerce config.
- Errors: 503/500 on docker/timeout.
- Side effects: containers; disk metadata.

**Proxy storefront cart operations**
- Purpose: Forward cart API to session's commerce backend.
- Input: sessionId query, cart payloads.
- Process: Resolve backend URL and publishable key; forward request; attach key server-side.
- Output: upstream JSON.
- Errors: 503 not configured; 500 upstream.
- Side effects: external commerce API calls.

**Sync catalog from site spec**
- Purpose: Push product titles/prices into tenant store.
- Input: Session with spec and commerce config.
- Process: Extract products from spec/HTML; admin API upsert.
- Output: success flag.
- Errors: logged warning; non-blocking.
- Side effects: commerce records.

### Deployment

**Register deployment**
- Purpose: Map slug to session for subdomain serving.
- Input: Session id, optional preferred slug.
- Process: Normalize slug; ensure uniqueness; write global index and session deploy metadata; broadcast deployed event.
- Output: slug, public URL, timestamp.
- Errors: collision handling via generator retries.
- Side effects: registry file; WebSocket.

**Serve deployed site**
- Purpose: Static file hosting for tenant subdomain.
- Input: Host header slug, request path.
- Process: Lookup session from index; serve from workspace.
- Output: static response.
- Errors: 404 unknown slug.
- Side effects: none.

### Auth

**Verify ID token**
- Purpose: Authenticate API request.
- Input: Bearer token.
- Process: Firebase Admin verify; attach uid and email to request.
- Output: user context or 401.
- Errors: invalid → 401, logged server-side.
- Side effects: none.

**Get public client config**
- Purpose: Supply browser auth initialization keys.
- Input: none.
- Process: Read configured Firebase web keys and Medusa admin flag.
- Output: config object.
- Errors: empty config → client anonymous mode.
- Side effects: none.

### Auxiliary

**Suggest prompt completions**
- Purpose: Autocomplete partial prompts.
- Input: Partial string, detected language.
- Process: Rate limit; call small LLM or static templates.
- Output: up to 4 suggestions.
- Errors: empty list on limit/error.
- Side effects: LLM call optional.

**Translate text**
- Purpose: Localize short strings.
- Input: text, locale.
- Process: Rate limit; skip if locale unnecessary; browser path optional; LLM translation.
- Output: translated string or echo.
- Errors: 429; 502 upstream.
- Side effects: LLM call.

**Check content policy**
- Purpose: Block prohibited prompt categories.
- Input: text.
- Process: Normalize unicode/leetspeak; blocklist and regex scan.
- Output: pass or block with code.
- Errors: block → 422.
- Side effects: security log with IP/user.

**Extract brand profile**
- Purpose: Enrich brand-driven prompts with logo/colors/contacts.
- Input: Prompt, optional domain hints.
- Process: Brand API search; fallback web scrape; SVG logo synthesis.
- Output: brand profile object.
- Errors: timeout → partial profile; generation continues.
- Side effects: external API calls; downloaded assets.

**Resolve stock images**
- Purpose: Inject relevant photos into generation.
- Input: Prompt, page context, queries.
- Process: Parallel stock photo APIs; merge rank; placeholder fallback.
- Output: image URL list.
- Errors: empty on missing keys/failures.
- Side effects: external API calls.

**Generate deployment slug**
- Purpose: Produce URL-safe unique slug.
- Input: Project context.
- Process: LLM suggestion with random adjective-noun fallback; collision check against registry.
- Output: slug string.
- Errors: fallback slug on LLM fail.
- Side effects: none until register.

**Persist rate limits**
- Purpose: Survive server restart for quota counters.
- Input: In-memory maps.
- Process: Every five minutes serialize to JSON file.
- Output: none.
- Errors: write failure logged.
- Side effects: disk file.

**Send generation notification**
- Purpose: Alert operators of run completion/cost.
- Input: Session metrics.
- Process: Format message; POST to Slack/Telegram webhooks if configured.
- Output: none.
- Errors: swallowed.
- Side effects: external webhook.

**Health check**
- Purpose: Liveness for monitors.
- Input: none.
- Process: Return ok, uptime, version.
- Output: JSON status.
- Errors: none.
- Side effects: optional Uptime Kuma heartbeat on interval.

### Client-side (homepage)

**Initialize auth module**
- Purpose: Set up sign-in state on marketing site.
- Input: Public config endpoint response.
- Process: Init auth SDK; listen state changes; dispatch events for UI; store GitHub token for later push.
- Output: signed-in or anonymous UI.
- Errors: missing config → anonymous unavailable auth.
- Side effects: Firebase connection.

**Submit generation form**
- Purpose: Create session from homepage.
- Input: Form fields, quota state, auth state.
- Process: Policy check; quota pre-gate; POST create; open embed or navigate; persist anon secret.
- Output: session view.
- Errors: mapped UX per status code.
- Side effects: API call; localStorage updates.

**Load public gallery**
- Purpose: Show recent generations.
- Input: page number, auth state for user vs public source.
- Process: Fetch paginated API; render cards; handle pagination URLs.
- Output: gallery UI.
- Errors: empty on failure.
- Side effects: API call.

### Client-side (dashboard)

**Hydrate session state**
- Purpose: Initial dashboard population.
- Input: Session id from URL.
- Process: GET session; populate tasks, deployment, exports, payment; decide intro skip; open WebSocket.
- Output: populated UI.
- Errors: still connect WS on hydrate failure.
- Side effects: API + WS.

**Handle WebSocket message**
- Purpose: Reflect live generation and product events.
- Input: Typed JSON messages.
- Process: Update tasks, logs, preview island, export badges, deploy link, errors, reload iframe on preview_reload.
- Output: UI state updates.
- Errors: openui-error shows boot error.
- Side effects: DOM updates.

**Poll export readiness**
- Purpose: Wait for background ZIP builds.
- Input: Export target states.
- Process: Every 4s GET export-targets up to ~6 min; trigger POST export if needed.
- Output: download button enabled.
- Errors: rate limit message in UI.
- Side effects: API calls.

**Premium gate check**
- Purpose: Block premium rail actions.
- Input: Auth, subscription/credits, anon flag.
- Process: If anon → sign-in wall; if locked → payment modal; else proceed.
- Output: allow or modal.
- Errors: none.
- Side effects: may open auth/payment UI.

---

## 6. API Surface

Grouped by domain. Methods described as: accepts → does → returns. Auth: None, Optional (token if present), Required (valid Bearer), Provision (internal secret or Bearer), Artifact (ownership rules below).

### Marketing and static

| Action | Auth | Accepts | Does | Success | Errors |
|--------|------|---------|------|---------|--------|
| GET / | None | — | SSR homepage with optional CMS settings | HTML | defaults if CMS down |
| GET /pricing, /privacy | None | — | SSR legal/marketing pages | HTML | — |
| GET /robots.txt, /sitemap.xml, /llms.txt | None | — | Crawler/discovery files | text/xml | — |
| GET /session/:id | None | session id | Dashboard HTML shell with WS host | HTML | 404 missing session |
| GET /preview/:id/* | None | path | Static preview with HTML injection | files | 404 |
| GET /studio/* | None | optional session query | Embedded CMS studio SPA | HTML/assets | stub if unbuilt |
| Subdomain static | None | host slug | Serve deployed workspace | files | 404 |
| GET /index.html | None | — | Redirect to / | 301 | — |
| Catch-all non-API | None | path | Redirect to / | 302 | — |

### Config and status

| Action | Auth | Accepts | Returns | Errors |
|--------|------|---------|---------|--------|
| GET /api/config | None | — | Firebase web keys, Medusa flag | — |
| GET /api/studio-embed-ready | None | — | boolean built | — |
| GET /api/early-adopter-status | None | — | slots, eligibility, price id | 500 |
| GET /api/subscription-status | Required | — | active boolean | 401, 500 |
| GET /api/credits | Required | — | remaining credits | 401, 500 |
| GET /api/health | None | — | ok, uptime, version | — |

### Analytics and translate

| Action | Auth | Accepts | Returns | Errors |
|--------|------|---------|---------|--------|
| GET /js/script.js | None | — | Proxied analytics script | stub on fail |
| POST /api/event | None | raw body | Forward Plausible event | 204 on fail |
| POST /api/translate | None | text, locale | translation | 400, 429, 502 |

### Prompt helpers

| Action | Auth | Accepts | Returns | Errors |
|--------|------|---------|---------|--------|
| POST /api/prompt-suggestions | None | partial string | ≤4 suggestions | empty on 429/500 |
| GET /api/share-bonus | None | — | claimed today flag | — |
| POST /api/share-bonus | None | — | ok, claimed | 400 no IP |
| GET /api/brandfetch/search | None | q, limit | search results | 400, 502 |
| GET /api/brandfetch/brand | None | domain | brand data | 400, 502 |
| POST /api/stream-openui | None | prompt, siteType?, title? | SSE stream chunks | 400, 500 |

### Sessions — lifecycle

| Action | Auth | Accepts | Returns | Errors |
|--------|------|---------|---------|--------|
| POST /api/sessions | Optional | prompt, language?, exportTarget?, designRefs?, cloneUrl? | id, cached, remaining, anonSecret? | 400, 422, 429 |
| GET /api/sessions | Required | page?, limit? | sessions list/pagination | 401 |
| GET /api/sessions/recent | None | page? | public gallery | — |
| POST /api/sessions/claim | Required | sessionIds[] | claimed, failed | 401 |
| DELETE /api/sessions/:id | Optional | owner rules | ok | 401/403/404 |
| DELETE /api/sessions | Required | — | ok, deleted count | 401 |
| GET /api/sessions/:id | Optional | — | full session metadata | 404 |
| GET /api/sessions/:id/tasks | None | — | tasks array | 404 |
| POST /api/sessions/:id/status | None | message, phase | ok | — |
| POST /api/sessions/:id/generate-design | None | — | ok | 404 |

### Sessions — preview and editing

| Action | Auth | Accepts | Returns | Errors |
|--------|------|---------|---------|--------|
| GET .../openui | Optional+artifact | route? | source, theme, locale | 404 |
| GET .../preview-html | Artifact | — | html JSON | 404, 500 |
| POST .../apply-palette | Artifact | palette object | ok, saved | 400 |
| GET .../palette | Artifact | — | palette or null | — |
| POST .../preview-homepage-html | Artifact | html | ok, checkpointId | 400, 422 |
| GET .../history | Artifact | — | entries[] | — |
| POST .../history/:id/restore | Artifact | checkpoint id | ok | 400, 404, 500 |
| POST .../preview-inline-text | Artifact | text, instruction, lang | improved text | 400, 502 |
| POST .../preview-inline-style | Artifact | fragment, instruction, ... | html or diff | 400, 502 |
| POST .../theme | None | theme object | ok | 400, 404 |
| POST .../rerender-preview | None | — | ok | 400 |

### Sessions — chat and uploads

| Action | Auth | Accepts | Returns | Errors |
|--------|------|---------|---------|--------|
| GET .../chat | Artifact | — | store, editable | 404 |
| POST .../chat | Artifact | text, attachments? | 202 accepted | 400, 409, 429 |
| DELETE .../chat | Artifact | — | ok | — |
| POST .../edit | Artifact | prompt | 202 accepted | 400, 409 |
| POST .../uploads | Artifact | multipart images | paths[] | 400, 409 |

### Sessions — deploy, export, github

| Action | Auth | Accepts | Returns | Errors |
|--------|------|---------|---------|--------|
| POST .../deploy | Artifact | — | slug, url, deployedAt | 500 |
| GET .../deploy | Artifact | — | deployed, slug?, url? | — |
| GET .../export-targets | None | — | targets, payment, ready flags | — |
| POST .../export | Required | target | ok, metadata | 400, 401, 403, 429 |
| GET .../download/:target | Optional+pay | — | ZIP file | 401, 402, 403, 404 |
| POST .../github/push | Required | target, githubToken | ok, repo | 401, 402, 403 |

### Sessions — CMS and commerce

| Action | Auth | Accepts | Returns | Errors |
|--------|------|---------|---------|--------|
| PATCH .../cms/site-settings | Artifact | settings patch | ok, siteSettings | 400, 503 |
| POST .../cms/upload-image | Artifact | file | url, assetId? | 400, 503 |
| GET .../cms/media | Artifact | limit? | assets[] | 503 |
| POST .../sync-sanity-preview | Required | — | ok, files | 400 |
| POST /api/provision/sanity | None | sessionId | config | 503 |
| POST .../provision/sanity | Provision | — | config | 503 |
| POST /api/provision/medusa | None | sessionId | config | 503, 500 |
| POST .../provision/medusa | Provision | — | config | 503, 500 |
| GET .../medusa-config | Required | — | config or null | 401 |
| GET /api/ecommercify/products | None | sessionId | products[] | CORS restricted |

### Storefront proxy (/api/storefront/*)

| Action | Auth | Accepts | Returns | Errors |
|--------|------|---------|---------|--------|
| GET config | None | sessionId? | enabled, backendUrl | — |
| POST cart | None | — | cart | 503, 500 |
| GET cart/:id | None | id | cart | 503, 500 |
| POST cart/line-items | None | cart_id, variant_id, qty | cart | 400, 500 |
| GET payment-providers | None | regionId | providers | 503 |
| POST cart/payment-sessions | None | cart_id, provider? | session | 400 |
| POST cart/complete | None | cart_id | order | 400, 500 |

### Next preview

| Action | Auth | Accepts | Returns | Errors |
|--------|------|---------|---------|--------|
| GET .../next-preview | Artifact | — | running, url, flags | — |
| POST .../next-preview/start | Artifact | — | ok | 400, 403 |
| POST .../next-preview/stop | Artifact | — | ok | — |

### Payments

| Action | Auth | Accepts | Returns | Errors |
|--------|------|---------|---------|--------|
| POST /api/payments/razorpay/start | Required | mode, tier/pack, coupon? | checkout fields | 400, 503, 500 |
| POST /api/payments/stripe/start | Required | same | session id, url | same |
| POST /api/payments/razorpay/webhook | None+signature | raw event | ok | 400, 503, 500 |

### WebSocket (server → client only)

**Connect:** `?session=<id>` required (or `?devReload=1` in dev). Invalid session → close 4001.

**Server messages:** prompt, status, tasks_loaded, task_updated, site_spec_ready, homepage_ready, openui_ready, openui_stream_*, openui-error, clone_progress, preview_reload, deployed, export_ready, alternative_design_ready, theme_override_*, error, log, next_preview_ready, client_reload (dev).

---

## 7. Background Processes

### Generation job (per session create)

- **Trigger:** POST /api/sessions success, or CLI one-shot mode.
- **Frequency:** On demand; max 2 concurrent per user or anonymous IP.
- **Steps:** Admission already done → mark generating → run OpenUI orchestrator or clone pipeline → persist artifacts → metrics → auto-deploy → auto-export chain for signed-in → mark done/failed.
- **Failure:** Task failed, error event, quota refund, partial artifacts may remain.
- **No resume:** Interrupted generating sessions marked failed on server restart.

### Integration pre-warm

- **Trigger:** Session create (background, non-blocking).
- **Does:** Provision CMS tenant for all sessions when configured; provision commerce when prompt is ecommerce-leaning.
- **Failure:** Logged; on-demand provision available later; orphan cleanup on session delete.

### Auto-export build chain

- **Trigger:** Generation success for authenticated user.
- **Does:** Sequentially build html, react, nextjs exports; broadcast export_ready per target.
- **Failure:** Per-target log; other targets may succeed; dashboard polls.

### Rate-limit persistence

- **Trigger:** Timer every 5 minutes.
- **Does:** Serialize in-memory counters to disk.
- **Failure:** Logged; counters may reset partially on corrupt read at boot.

### Development file watchers

- **Trigger:** File change in public assets (dev only).
- **Does:** Debounce 400ms → broadcast client_reload to all session and devReload sockets.
- **Failure:** none critical.

### Uptime heartbeat

- **Trigger:** Optional 60s interval when push URL configured.
- **Does:** HTTP push to external monitor.
- **Failure:** Warning log.

### Optional Next.js preview child

- **Trigger:** API start or autostart after generation when enabled.
- **Does:** Spawn dev server in session next-app folder; poll readiness up to 3 min; broadcast next_preview_ready.
- **Failure:** 400 to client; child stopped on signal or stop API.

### Commerce Docker provision

- **Trigger:** Provision API or pre-warm.
- **Does:** Compose up Postgres/Redis/Medusa; migrations; admin bootstrap; port allocation.
- **Failure:** 500/503; session lacks medusaConfig.

### CMS studio build at boot

- **Trigger:** Server start if studio dist missing and auto-build enabled.
- **Does:** Synchronous build of embedded studio package.
- **Failure:** Warning; stub studio page until manual build.

### Startup interrupted-session sweep

- **Trigger:** Server boot.
- **Does:** Mark generating → failed for crash-interrupted sessions.
- **Failure:** N/A.

### Generation cost monitoring (optional wiring)

- **Trigger:** Intended on generation complete.
- **Does:** Append JSONL usage log; Slack/Telegram notify; monthly cost threshold alert.
- **Note:** Module exists; may not be wired in all deployments.

### Chat/edit async jobs

- **Trigger:** POST chat or edit.
- **Does:** Compose prompt from history; invoke edit pipeline.
- **Failure:** Assistant failure message; rate-limit refund.
- **Note:** Legacy edit path may throw until replaced.

---

## 8. External Integrations

### Primary LLM provider (Groq)

- **Purpose:** Homepage generation, planning, site spec, translations, slugs, prompt suggestions, inline edits (fallback).
- **Data in:** Prompts, system instructions, structured tasks.
- **Data out:** Text, JSON, streaming tokens.
- **When:** Core generation path; auxiliary APIs.
- **Fallback:** Retries with exponential backoff; planning fallback plan; site spec fallback JSON; empty suggestions.

### Secondary LLMs (Gemini, Talaas, Ollama Cloud)

- **Purpose:** Optional model selection in orchestrator.
- **Fallback:** Error if misconfigured; default remains primary provider.

### RunPod / Hex1 GPU endpoint

- **Purpose:** Indian-language inline copy editing.
- **Fallback:** Primary LLM with India-specific prompts.

### Firebase Authentication + Admin

- **Purpose:** User sign-in; API token verification.
- **Data in:** OAuth/email credentials; ID tokens.
- **Data out:** uid, email, profile.
- **Fallback:** Missing client config → anonymous-only UX.

### Firestore

- **Purpose:** Subscriptions, credits, early-adopter counts, webhook idempotency.
- **Fallback:** Early-adopter read may use local file; writes do not silently fallback.

### Stripe

- **Purpose:** International payments and checkout webhooks.
- **Fallback:** 503 when not configured; dev paywall disable.

### Razorpay

- **Purpose:** India payments, subscriptions, webhooks.
- **Fallback:** Same as Stripe.

### Sanity (management + content APIs)

- **Purpose:** Per-session CMS tenants; marketing site settings; chat sync documents.
- **Fallback:** 503 provision; null settings on read failure.

### Medusa + Docker + Traefik

- **Purpose:** Per-session commerce stacks; cart proxy; admin.
- **Fallback:** Unconfigured → storefront 503; provision errors leave session without store.

### Pexels + Unsplash

- **Purpose:** Stock imagery during generation and preview resolver.
- **Fallback:** Empty hints or Picsum placeholders.

### Brandfetch + web scrape (Brave HTML)

- **Purpose:** Brand logos, palettes, contacts for brand-driven prompts.
- **Fallback:** Synthetic SVG logo; minimal profile.

### GitHub REST API

- **Purpose:** Push export to private repository.
- **Fallback:** Repo name suffix retries; 409 tree retries.

### Mobbin (static DNA + optional live API)

- **Purpose:** Design reference anchoring for generation quality.
- **Fallback:** Static DNA only; empty anchor continues generation.

### Plausible Analytics

- **Purpose:** Privacy-oriented page analytics via first-party proxy.
- **Fallback:** No-op script stub.

### Slack / Telegram webhooks

- **Purpose:** Generation notifications, cost alerts, rate-limit ops signals.
- **Fallback:** Silent skip if unset.

### Uptime Kuma

- **Purpose:** Push heartbeat monitoring.
- **Fallback:** Disabled without URL.

### Coolify / Doppler (operations)

- **Purpose:** Deployment and secrets injection—operator-level, not runtime API calls from app code.

---

## 9. Error Handling Philosophy

**Layered responses:** Validation → 400; auth → 401; ownership → 403; payment → 402; not ready → 409; policy → 422; quota → 429 with machine codes; upstream → 502; misconfiguration → 503; server → 500.

**Optimistic session create:** HTTP returns immediately; generation errors surface via WebSocket and task status, not by changing the create response.

**Quota fairness:** Hits recorded at acceptance; refunded on total generation failure or failed chat edit.

**Generation: hard vs soft failure:** Hard aborts refund quota and mark failed; soft substitutes template pages and continues streaming.

**User messaging:** Policy and quota messages are explicit; model/infrastructure errors often generic; premium actions return payment objects for modal UX.

**Silent degradation:** Prompt suggestions, some CMS reads, gallery failures, missing ops webhooks, missing stock photos—fail quietly to empty defaults.

**No centralized error tracking service** in production path—console logs, optional Slack/Telegram, health endpoint, optional JSONL cost log.

**Reconnect resilience:** WebSocket replay of stream state; dashboard auto-reconnect; OpenUI preview exponential backoff until generation settles.

**Webhook security:** Signature verification required; misconfiguration returns 503/400.

**Content policy:** Logged with IP/user; blocks before expensive generation.

**Preview quality gate:** Production rejects degenerate saved HTML; development skips.

---

## 10. State & Data Flow

### Persistent state (disk)

- Session workspaces: metadata, tasks, prompt, site spec, preview HTML, OpenUI source, export bundles and index, chat store, generation metrics, deploy mirror, brand profile, history checkpoints, uploaded images.
- Global: deployment registry, rate-limit snapshot, early-adopter fallback file, usage JSONL log.

### Persistent state (cloud)

- Per-user customer: credits, subscription documents, webhook idempotency keys.

### Ephemeral state (memory)

- Loaded sessions map with WebSocket client sets, stream buffers, last status.
- Rate-limit counters (restored from disk periodically).
- Public gallery cache (~20–30s TTL).
- In-flight provision deduplication maps.
- Active generation counts per user/IP.

### Client state

- Firebase auth session; GitHub token in session storage; anonymous session index and owner secrets in localStorage; generation counter; gallery page; dashboard UI flags (intro seen, premium unlocked, export polling).

### Key transitions

1. **Prompt → session:** admission → workspace created → generating → done/failed.
2. **Generation → artifacts:** stream → site spec + preview HTML + OpenUI → homepage_ready / site_spec_ready events.
3. **Refinement:** chat/edit → async mutation → preview_reload.
4. **Inline edit:** iframe change stack → save → checkpoint append → preview_reload.
5. **CMS patch:** settings update → optional sync back to preview render.
6. **Export:** spec hash change invalidates bundles → rebuild → export_ready → download consumes credit.
7. **Billing webhook:** event → Firestore update → session GET reflects unlocked exports.
8. **Claim:** anonymous → owned; secret removed.
9. **Delete:** workspace wipe → deprovision integrations → registry cleanup → gallery cache invalidate.

### Caching

- Export bundles keyed by site spec hash + badge mode.
- Prompt cache returns existing session for duplicate authenticated prompts.
- Public gallery list cached briefly.
- Stock image and brand lookups not long-cached in critical path.

---

## 11. Configuration & Environment

Settings control runtime behavior without being named as specific technology:

| Setting area | Controls |
|--------------|----------|
| Primary LLM API key | **Required** — server refuses start if missing |
| Listen port | HTTP/WebSocket port (default 7420) |
| Sessions directory | Where workspaces and deployment index live |
| Site URL / base domain | Links, deployment hostnames, CORS |
| Firebase web + admin credentials | Client auth bootstrap and token verification |
| Payment gateway keys and price ids | Stripe/Razorpay checkout and webhooks |
| Webhook secrets | Payment signature verification |
| DISABLE_PAYWALL | Bypass export payment checks |
| NODE_ENV / development detection | Skip anon owner checks, skip paywall, hot reload, rate-limit bypass for localhost |
| IP whitelist | Skip all rate limits |
| Sanity management + read/write tokens | CMS provision and marketing settings |
| Medusa defaults + Docker settings | Shared or per-tenant commerce |
| Groq/Gemini/Talaas/RunPod/Ollama keys | Model routing |
| Pexels/Unsplash keys | Stock imagery |
| Brandfetch credentials | Brand enrichment |
| Mobbin live auth | Optional live design anchors |
| INTERNAL_API_SECRET | Provision route protection |
| Plausible host | Analytics proxy target |
| Slack/Telegram webhooks | Ops notifications |
| Uptime Kuma push URL | Heartbeat |
| Monthly cost alert threshold USD | Billing ops alert |
| Historical subscription access flag | Export eligibility for lapsed subscribers |
| Early adopter slot count | Discounted plan gating |
| Partner coupon map | Promotion ids per gateway |
| AUTO_BUILD_SANITY_STUDIO | Boot-time studio build |
| NEXT_PREVIEW_AUTOSTART | Spawn Next dev preview after generation |
| Gallery and quota numeric constants | Business limits (documented in billing constants) |

**Behavior modes:**

- **Production:** Full auth, owner secrets, paywall, degeneracy checks, Slack notifications.
- **Development:** Relaxed auth on artifacts, paywall off, hot reload, rate limits skipped on local hosts.
- **Paywall disabled:** Treat all users as subscribed for export.

---

## 12. Security & Permissions

### Authentication

Users authenticate via external identity provider (Google, GitHub, email/password). Browser obtains ID token; API sends Bearer token. Server verifies with admin credentials. Missing admin config may weaken verification depending on deployment defaults.

### Authorization model

| Resource | Anonymous | Authenticated owner | Other users |
|----------|-----------|---------------------|-------------|
| Create session | Yes (quota) | Yes (quota) | — |
| View public gallery | Yes | Yes | Yes |
| View private session dashboard shell | Yes with id | Yes | Yes with id |
| Mutate session artifacts | Owner secret header | Matching uid | Denied |
| List own sessions | No | Yes | No |
| Download export | No | Yes + payment | Denied |
| CMS/commerce provision | API-dependent | Provision auth or open body endpoints | — |
| Payment checkout | No | Yes | No |
| Webhooks | Signature only | — | — |

### Artifact access rules

- Owned sessions: Bearer uid must match owner id.
- Anonymous sessions: owner secret must match (production); dev may skip.
- Public OpenUI read exception for non-private anonymous sessions without owner.
- Theme override POST currently lacks artifact check (notable gap).

### Data protection

- Passwords never stored locally—delegated to identity provider.
- Payment secrets only on server; publishable commerce keys proxied server-side.
- CMS write tokens stored in session metadata—not all exposed to browser.
- Session workspaces may contain user uploads—scoped to session id paths.
- Robots/noindex on session and API routes.
- Private sessions excluded from public gallery and public OpenUI exception.

### Abuse prevention

- Content policy blocklist (CSAM, violence, malware, hate, etc.).
- Gibberish prompt rejection.
- Multi-layer rate limits and concurrent caps.
- IP-level monthly cap for free authenticated users.
- Share bonus once per IP per day.

### Provision routes

Internal secret header OR valid user token for session-scoped provision paths; some body-form provision endpoints lack auth (notable exposure if exposed publicly).

---

## 13. Third-Party Dependencies

Purpose only—implementation may vary:

| Dependency | Purpose |
|------------|---------|
| Groq | Primary LLM inference for generation and auxiliary text tasks |
| Google Gemini | Optional alternate LLM in generation orchestrator |
| Talaas (chatjimmy.ai) | Optional streaming LLM provider |
| Ollama Cloud | Optional cloud-hosted open models |
| RunPod / Hex1 | GPU inference for Indian-language inline copy edits |
| Firebase Authentication | End-user sign-in (Google, GitHub, email) |
| Firebase Admin | Server-side ID token verification |
| Google Firestore | Subscriptions, download credits, early-adopter counters, webhook idempotency |
| Stripe | International payment checkout and webhooks |
| Razorpay | India payment checkout, subscriptions, UPI, webhooks |
| Sanity | Headless CMS—per-session tenants, marketing settings, chat sync, embedded studio |
| Medusa | Headless commerce—per-session store backends |
| Docker | Isolated commerce stack containers |
| Traefik / reverse proxy | Optional HTTPS routing to commerce tenants |
| Pexels | Stock photos and videos |
| Unsplash | Supplemental stock photos |
| Brandfetch | Brand logo and palette lookup |
| Web scraping (search result HTML) | Fallback brand discovery |
| Picsum.photos | Placeholder images when stock APIs unavailable |
| GitHub REST API | Private repository export push |
| Mobbin | Design reference DNA library and optional live screen metadata |
| Plausible Analytics | Privacy-oriented web analytics |
| Slack incoming webhooks | Operations and generation notifications |
| Telegram Bot API | Parallel ops notifications |
| Uptime Kuma | External uptime push monitoring |
| Coolify | Production hosting orchestration (operator) |
| Doppler | Secrets management at deploy time (operator) |
| Brand / stock / LLM env-configured hosts | Various HTTP APIs as listed above |

---

*Document generated by project-dna extraction. Rebuild any equivalent system from this blueprint without reference to the original implementation stack.*
