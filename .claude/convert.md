# Ship-Fast: Framework-Neutral Generation Architecture Refactor

## Mission

Refactor the current system so that it no longer treats generated vanilla HTML as the canonical source of truth.

Instead, implement a framework-neutral generation architecture with these properties:

- The system generates and stores a **canonical site specification** for every session.
- The site spec becomes the **single source of truth** for:
  - pages, routes, sections, content
  - design/theme tokens
  - navigation
  - interactions
  - reusable components
- The app can render/export the same generated website into multiple targets:
  - Plain HTML
  - React
  - Next.js
  - Later extensible to Vue / Nuxt / SvelteKit
- The current fast preview experience must remain intact.
- Users should be able to generate a site first, then choose their desired framework afterward.
- Framework export should be based on the stored canonical site spec, not on reverse-engineering generated HTML.

> This is a production refactor, not a toy implementation.

---

## Core Product Requirement

**Customer flow:**

1. User submits a prompt.
2. The system generates the website preview quickly.
3. The user sees the generated website in the dashboard.
4. The user can then choose an export target:
   - HTML
   - React
   - Next.js
5. The system exports/downloads a clean project in that framework.

> **Important:** The export target may be chosen after generation, so the system must store enough structured information during generation to support later rendering into different frameworks.

---

## Non-Goals

Do not implement a naive "convert raw HTML into React/Vue" pipeline as the primary architecture.

**Avoid:**

- regex-based HTML conversion
- brittle `className` replacement scripts as the main solution
- line-by-line JavaScript translation from DOM APIs to framework hooks
- using generated HTML files as the only canonical artifact

If necessary, HTML can still be produced as one renderer output. But the internal source of truth must be structured and framework-neutral.

---

## High-Level Architecture

Refactor the generation pipeline into this model:

```
Prompt
  -> design extraction
  -> site classification
  -> context extraction
  -> canonical site spec generation
  -> preview renderer
  -> export renderers
```

The canonical site spec must include:
- project metadata
- design tokens
- sitemap / routes
- page definitions
- page sections
- reusable component definitions or component references
- interaction definitions
- forms and CTA actions
- assets references
- SEO metadata
- optional backend feature hints

The canonical site spec should be rich enough that we can generate static HTML preview, React app, and Next.js app **without having to parse the preview HTML back into structure**.

---

## Deliverables

### Phase 1 — Audit the Current Codebase

Find and document:

- Where prompt input enters the system
- Where design/theme is currently generated
- Where page context is currently generated
- Where homepage generation currently happens
- Where tasks/pages are currently generated
- How session state is stored
- How preview routing works
- How edit mode currently works

Document the existing flow in comments or a short internal design note before refactoring major pieces.

---

### Phase 2 — Introduce a Canonical Site Spec

Add a new persisted artifact to each session:

```
site-spec.json
```

This becomes the canonical representation of the generated project.

#### Schema Definition

Create a robust schema and types for the canonical site spec.

- If the repo uses **TypeScript**: define proper interfaces/types.
- If the repo is **JavaScript**: create a schema module and runtime validation.

##### Project-Level Metadata
```json
{
  "projectName": "",
  "slug": "",
  "siteType": "",
  "userPrompt": "",
  "generatedTimestamp": "",
  "exportableFrameworks": [],
  "version": ""
}
```

##### Theme
- colors
- typography
- radius
- spacing
- shadows
- dark/light mode flags
- design mood
- optional Tailwind token mapping

##### Navigation
- global nav items
- footer nav items
- CTA links/buttons

##### Pages

Each page includes:
- `id`
- `name`
- `route`
- `title`
- `description`
- SEO metadata
- layout type
- sections array

##### Sections

Each section includes:
- `id`
- `type`
- `variant`
- props/content
- styling overrides
- visibility rules (if any)
- child blocks (if applicable)

**Supported section types (minimum):**

| Section Type | Section Type |
|---|---|
| `hero` | `faq` |
| `features` | `cta` |
| `pricing` | `footer` |
| `testimonials` | `navbar` |
| `contact-form` | `stats` |
| `gallery` | `team` |
| `logo-cloud` | `blog-list` |
| `docs-content` | `dashboard-shell` |

##### Components
If useful, include a reusable component registry or inferred reusable blocks.

##### Interactions

Represent interactions structurally rather than as raw script blobs:

- mobile menu toggle
- accordion expand/collapse
- tabs
- modal open/close
- theme switch
- form submit behavior
- client-side filtering/sorting
- basic carousel state

##### Forms / Actions

Represent:
- form fields
- validation hints
- success/error messages
- intended submission action
- placeholder backend integration hints

---

### Phase 3 — Refactor Generation Pipeline

Refactor existing generation phases so they produce:
- design tokens
- project context
- structured pages/sections
- `site-spec.json`

Do not rely solely on fully composed HTML page generation as the primary LLM output.

Where appropriate, the LLM should generate **structured JSON** matching the site spec schema.

**Rendering pipeline:**

```
LLM generation
 -> site-spec.json
 -> render(html preview)
 -> render(react export on demand)
 -> render(nextjs export on demand)
```

---

### Phase 4 — Export Renderers

Implement a renderer architecture with these initial targets:

```
html | react | nextjs
```

Design renderers so new targets can be added later.

**Suggested interface:**
```js
renderProject(siteSpec, target, options) -> output files
```

#### HTML Renderer

Generate:
- static HTML pages
- shared assets/styles if appropriate
- reusable partial patterns if architecture supports them

Must be **driven from the site spec**, not from existing HTML.

#### React Renderer

Generate a usable **Vite-based** React project.

Requirements:
- route-based structure
- reusable components
- separate page components
- shared layout components
- no raw DOM imperative code unless absolutely necessary
- styling preserved via Tailwind or existing token system
- interactive behavior expressed using React state/handlers

**Suggested output structure:**
```
src/components/*
src/pages/*
src/App.*
router config
package metadata
styles/global theme
```

#### Next.js Renderer

Generate a usable Next.js app.

Requirements:
- use app router if practical
- create route folders per page
- create shared layout
- convert navigation to framework links
- preserve theme tokens
- keep output clean enough for a customer to continue building on

**Suggested output structure:**
```
app/layout.*
app/page.*
app/<route>/page.*
components/*
lib/theme.*
styles / Tailwind config if needed
```

#### Important: Idiomatic Code

**Avoid:**
- one massive page component with thousands of lines
- embedding all sections inline if they can reasonably be components
- leaving framework output as "HTML inside a framework wrapper"

**I want:**
- reusable components
- shared layout
- clear separation of page-level and component-level code
- minimal duplication
- naming consistency
- maintainable project structure

---

### Phase 5 — Server Endpoints & Dashboard

#### API Endpoints

Add or update API endpoints:
- List supported export targets for a session
- Trigger export for a target
- Download generated project bundle
- Regenerate preview from site spec if necessary

Fit into the current session route architecture. Do not break existing auth/session patterns.

#### Frontend / Dashboard

After site generation, the user should be able to:
- See available framework targets
- Choose a target
- Request export/download

**Suggested UX:**
- Preview remains visible
- Framework selector appears in dashboard
- Export status shown
- Download button appears when ready

---

### Phase 6 — Refactor Edit Mode

Edit mode should operate primarily on the **canonical site spec**.

- Edit prompt → updates site spec content/sections/theme/layout
- Then re-renders preview/export outputs from the updated spec

**Hybrid approach for v1 if full structured editing is difficult:**
1. Parse existing `site-spec.json`
2. Ask LLM to update the structured spec
3. Re-render all outputs from the updated spec

> Do not use HTML as the primary edit input when the spec already exists.

---

### Phase 7 — Tests & Verification

Add basic tests or verification scripts for:
- Schema validity
- Renderer output sanity
- Sample session export success

---

## Section / Component Rendering Strategy

Introduce a **section-driven renderer system**.

```
page = list of sections
section renderer = function/module per section type
each target framework has its own section renderers or templates
```

The same abstract section can be rendered to HTML, React JSX, or Next.js JSX without changing the source spec.

---

## Interaction Strategy

**Do not store arbitrary inline JavaScript as the main interaction format.**

Instead, define structured interaction descriptors and map them per renderer.

### Examples

**Mobile Menu**

Instead of:
```js
document.querySelector('.menu-btn').addEventListener(...)
```

Store:
```json
{
  "type": "mobileMenu",
  "target": "mainNav",
  "behavior": "toggle"
}
```

- HTML renderer → emits minimal JS
- React renderer → emits `useState`
- Next.js renderer → emits client component logic

**FAQ Accordion**

Store:
- items
- default open item
- single/multi expand behavior

Let renderers implement appropriate behavior.

**Modal**

Store:
- trigger id
- modal content reference
- dismiss rules

Map per framework.

---

## Session Persistence

For each session, store at minimum:
- original prompt
- design metadata
- project context
- `site-spec.json`
- preview artifacts
- renderer outputs metadata
- export history (if useful)
- elapsed/cost (if already present)

Design session storage so:
- preview can be re-rendered from the site spec
- exports can be generated later without rerunning full prompt generation
- user can choose framework after generation

---

## Validation & Quality

### Site Spec Validation
- Invalid or partial LLM output should be caught early
- Normalize missing optional fields
- Reject malformed page/section structures gracefully
- Provide fallback defaults

### Renderer-Level Verification
- Required files exist
- Routes are valid
- Duplicate component names avoided
- Malformed section types logged clearly

### Fallback Strategy

If structured generation fails or returns incomplete data:
1. Validate
2. Normalize
3. Retry once with clearer schema constraints if appropriate
4. Log exact failure reason
5. Fail gracefully rather than producing corrupted export output

---

## Suggested Internal Module Structure

```
src/
  pipeline/
    phases/
      generate-design.*
      detect-site-type.*
      generate-context.*
      generate-site-spec.*
    runner.*
  spec/
    schema.*
    validate.*
    normalize.*
    defaults.*
  renderers/
    index.*
    html/
      index.*
      sections/*
      project/*
    react/
      index.*
      sections/*
      project/*
    nextjs/
      index.*
      sections/*
      project/*
  interactions/
    map-html.*
    map-react.*
    map-nextjs.*
  sessions/
    storage.*
    exports.*
  server/
    routes/*
```

---

## LLM Prompting Requirements

When updating generation logic, ensure the LLM is asked to produce **structured output** that maps directly to the site spec:

- Ask for strict JSON where possible
- Define allowed section types
- Define required page fields
- Constrain outputs to renderer-supported patterns
- Avoid freeform HTML as the main generation output for the canonical pipeline

HTML generation may still be used in the HTML renderer stage if that is the target output.

---

## Backward Compatibility

**Approach:**
- If `site-spec.json` exists → use new pipeline
- Otherwise → fall back to legacy handling or attempt migration

Migration helpers should be:
- clearly separated
- labeled as `legacy/` or `compatibility/` code

> Do not make legacy HTML parsing the central architecture.

---

## Implementation Preferences

| Priority | Preference |
|---|---|
| **Strong** | Use a canonical intermediate representation and renderer pattern |
| **Medium** | Use runtime schema validation even if the codebase is JavaScript |
| **Strong** | Keep first version focused on HTML, React, and Next.js |
| **Strong** | Preserve or improve generation speed |
| **Strong** | Avoid giant over-engineered abstractions with no payoff |

---

## The Core Mental Model

**Before:**
```
Prompt -> generated HTML pages
```

**After:**
```
Prompt -> canonical site model -> renderer-selected output
```

The preview is just one renderer.
The React export is another renderer.
The Next.js export is another renderer.

> The system should feel like a **multi-target compiler for websites**, not an HTML-to-framework converter.

---

## Coding Standards

- Make focused, well-named modules
- Prefer small composable functions
- Avoid massive god files
- Leave comments only where they help future maintainers understand architectural intent
- Keep naming consistent
- Do not silently delete existing useful behavior unless necessary

If you must choose between speed and polish: prioritize **correct architecture and maintainability**, but do not ignore the need for fast preview.