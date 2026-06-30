# v3 Engine — Site-Plan + Macros

## Overview

v3 is a new third engine path (alongside v1 capsules and v2 SFF HTML) that generates **structure** instead of selecting templates. The LLM writes a minimal positional DSL declaring intent (which sections, what content, what data model). A compiler expands that intent into OpenUI-lang programs + generated lakebed definitions using system-level macros.

**Core principle:** AI writes intent (Java), system-level macros expand it (Smali). The LLM never writes field names, braces, boilerplate, or operation code. The compiler knows the field order, fills conventional fields, infers the data model, and generates lakebed from 6 proven macro templates.

**Token budget:** ~100-150 output tokens per page (vs ~2000-3000 in v1). ~600-700 input tokens. One LLM call for high-confidence kind inference, two calls for low-confidence. <5s generation on Groq.

**Not templates:** The LLM decides which sections this specific site needs and in what order (structural decision). The schema is generated from the LLM's content. Operations are compiled from typed macros. The component library is the standard library — behavior reuse, not structure reuse.

---

## Decision Log

### Engine Wiring

| #   | Decision       | Choice                                                                                                                                    |
| --- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Engine toggle  | v3 as third option alongside v1/v2. Toggle group: v1, v2, v3. No changes to v1 or v2.                                                     |
| 2   | Output format  | OpenUI-lang programs (same renderer as v1). LLM outputs positional DSL, compiler emits OpenUI.                                            |
| 38  | Engine adapter | `runAllV3` conforms to `RunShipFastEngine`, drop-in. `engine-selector.ts` adds `'v3'` branch. `convex/generation.ts` adds `'v3'` routing. |
| 37  | Code location  | Modular directory `packages/ship-fast-engine/src/v3/`                                                                                     |

### Architecture

| #   | Decision          | Choice                                                                                                                                         |
| --- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| 3   | Macro system      | D: macro library (6 proven patterns) with C: escape hatch as interim. Phase 1: macro-typed operations only. Phase 2: custom code escape hatch. |
| 4   | Section selection | B: LLM picks sections from the component registry (constrained selection). Evolving toward C: role mapping with generic primitive fallback.    |
| 5   | Generation flow   | A: one LLM call. The LLM writes kind + sections + content + data model + page plan in one pass.                                                |
| 11  | Site-plan shape   | Sections + content + optional `+` lines. Data model inferred by compiler. `@pages` line for secondary pages.                                   |
| 12  | Output format     | Positional DSL — minimal, no JSON, no braces, no repeated key names. Values are positional, matching the role's content-field order.           |
| 44  | Seeded RNG        | Theme selection only. Section selection is the LLM's job, not random.                                                                          |

### Kind Inference

| #   | Decision                         | Choice                                                                                                           |
| --- | -------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| 7   | Kind inference                   | Heuristic (keyword matching) + confidence score + LLM fallback. Not pure heuristic, not pure LLM.                |
| 9   | Kind→component mapping           | B: 17 kinds, default family resolution rule. `{Kind}{Role}` → fallback to default family's component.            |
| 10  | Kind table                       | 17 kinds covering 132 families. `marketing` as catch-all fallback.                                               |
| 17  | Kind selection (high confidence) | C: top-3 kind vocabularies shown, LLM picks one + fills sections in one call.                                    |
| 18  | Kind selection (low confidence)  | B: two-call path. Call 1: LLM picks kind from 17 summaries. Call 2: fill sections with chosen kind's vocabulary. |
| 19  | Confidence score                 | Ratio formula: `topScore / (topScore + secondScore)`. Threshold: 0.65. `0/0` → 0 → low confidence.               |
| 20  | Two-call fallback                | C: call 1 outputs ranked top-3 kind names. Call 2 shows all 3 vocabularies, LLM picks + fills.                   |

### Prompt Design

| #   | Decision           | Choice                                                                                                                                                          |
| --- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 6   | LLM input          | B: slim catalog with one-line role descriptions + content-field signatures.                                                                                     |
| 8   | Vocabulary         | C: core content fields only. Compiler fills conventional fields (CTAs, routing, contact info). Prompt says: "Engine injects conventional fields automatically." |
| 14  | Field presentation | C: positional hint lines per role + one worked example (menu section — most complex nested case).                                                               |
| 15  | Vocabulary scope   | C: kind-specific roles + universal roles (hero, footer, contact, cta, testimonials, faq, stats).                                                                |
| 47  | System prompt      | ~600-700 tokens. 3 kind vocabularies + worked example + format rules + locale directive.                                                                        |

### Data Model & Lakebed

| #   | Decision               | Choice                                                                                                                                                                           |
| --- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 13  | Inference mechanism    | A: interaction profiles. Each component declares `profile: "cart"` / `"submission"` / etc. Compiler reads profiles to generate lakebed.                                          |
| 27  | Lakebed to components  | D: generated definitions via `withLakebed` wrapper. Components stop carrying hardcoded lakebed configs (end state). C: per-session wrapper is the implementation (phase 1).      |
| 28  | Interaction profiles   | B: separate `v3-interactions.ts` registry. Zero changes to existing components.                                                                                                  |
| 29  | Escape hatch           | Phase 1: macro-typed operations only in `+` lines. Phase 2: `custom` type with inline handler bodies.                                                                            |
| 33  | Macro templates        | 6 macros: `collection`, `cart`, `submission`, `search`, `favorites`, `auth`. All fields are `string().default('')` except `quantity` (number) and `rating` (number if detected). |
| 34  | Content→table mapping  | B: `seedPath` + `seedFields` in interaction profile. Explicit, no shape inference.                                                                                               |
| 35  | Multi-profile sections | A: each profile generates independently, merge by table name. Deduplicate tables across sections.                                                                                |
| 36  | Operation name wiring  | Interaction profile maps macro operation names → component-expected names. Compiler applies mapping when emitting lakebed definition.                                            |

### Multi-Page

| #   | Decision                | Choice                                                                                                        |
| --- | ----------------------- | ------------------------------------------------------------------------------------------------------------- |
| 21  | Multi-page              | B: homepage in main call, secondary pages in parallel calls.                                                  |
| 22  | Secondary page sections | B: homepage outputs `@pages` line declaring which secondary pages exist. Parallel calls expand each.          |
| 23  | Secondary page context  | D: brand + kind + focused role's content + role vocabulary. LLM expands the focused section with more detail. |

### Streaming & UX

| #   | Decision           | Choice                                                                                                   |
| --- | ------------------ | -------------------------------------------------------------------------------------------------------- |
| 24  | Streaming          | B: incremental compilation. Compiler detects section boundaries in stream, emits OpenUI statements live. |
| 25  | Two-call streaming | A: status message during call 1 (~1s), stream during call 2.                                             |
| 26  | Events             | Same as v1 (theme, locale, plan, skeleton, module, source, done) + new `lakebed` event.                  |
| 39  | Images             | C: alt text as Pexels search query at render time. No pre-resolution step.                               |
| 40  | Theme              | Same seeded RNG as v1 (`THEME_CATALOG`).                                                                 |
| 41  | Brand/nav          | Engine-injected, same as v1.                                                                             |
| 43  | Locale             | Same `detectLanguage` mechanism.                                                                         |

### Error Handling

| #   | Decision         | Choice                                                                                                                                                        |
| --- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 30  | Error handling   | Parse → validate → best-effort fix → retry up to 3 times → render whatever the last fix produced (even if <3 sections). No v1 fallback.                       |
| 31  | Validation rules | 7 rules: kind known, role valid for kind, field count matches, nested structure balanced, `+` lines well-formed, ≥1 section, `@pages` references valid roles. |

### Persistence & Export

| #   | Decision       | Choice                                                                                                                                                              |
| --- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 32  | SiteSpec shape | v1 shape (`brand`, `tagline`, `theme`, `locale`, `skeleton`, `modules`) + `kind`, `lakebed`, `fullstackManifest`, `sitePlan` (parsed site-plan for re-compilation). |
| 42  | Export         | Same siteSpec shape works with existing React/Next.js export. Lakebed export is phase 2.                                                                            |
| 45  | Re-compilation | `compiler.ts` called with persisted `sitePlan` — no LLM call, ~0ms. Triggered manually or on engine update.                                                         |

### Testing

| #   | Decision | Choice                                                                                                                                            |
| --- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| 46  | Testing  | 11 test files: parser, validator, fixer, macros (per macro), inference, compiler, kinds, prompt, streaming, integration, source-level invariants. |

---

## Kind Table (17 kinds)

| Kind          | Default family     | Keyword hints                                                                  | Covers                                                                                                                                                                   |
| ------------- | ------------------ | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `commerce`    | `Ecommerce`        | store, shop, buy, sell, product, goods, merch                                  | FashionStore, ElectronicsStore, JewelryStore, FurnitureStore, BeautyStore, Ecommerce, SubscriptionBox                                                                    |
| `restaurant`  | `Restaurant`       | restaurant, dining, food, menu, chef, cuisine, bistro, eatery                  | Restaurant, Cafe, Bakery, BarNightclub, FoodTruck, FoodDelivery, WineryBrewery                                                                                           |
| `saas`        | `Saas`             | saas, software, api, developer, tool, platform, dashboard, analytics           | Saas, DevTool, Crm, CloudInfra, Cybersecurity, NoCode, AiProduct, Auth                                                                                                   |
| `finance`     | `Fintech`          | fintech, finance, banking, payments, wallet, lending, loan, invest, money      | Fintech, Lending, Investing, Crypto, Insurance, AccountingFirm                                                                                                           |
| `marketplace` | `Marketplace`      | marketplace, vendors, sellers, multivendor, classifieds, buyers                | Marketplace, Directory                                                                                                                                                   |
| `realestate`  | `RealEstate`       | estate, realtor, property, homes, rental, housing, apartment, mortgage         | RealEstate, PropertyListing, VacationRental, InteriorDesign                                                                                                              |
| `healthcare`  | `Healthcare`       | telehealth, doctor, clinic, medical, patient, dental, therapy                  | Telehealth, Healthcare, Dental, MentalHealth, PetVeterinary                                                                                                              |
| `portfolio`   | `Portfolio`        | portfolio, designer, artist, creative, photographer, freelance                 | Portfolio, Photography, Illustrator, FilmDirector, MusicArtist, Agency, MarketingAgency                                                                                  |
| `publication` | `Newsroom`         | news, magazine, newsroom, editorial, press, journal, publication, blog         | Newsroom, Newsletter, Blog, Podcast, WriterAuthor                                                                                                                        |
| `service`     | `CleaningService`  | service, cleaning, plumbing, hvac, landscaping, salon, spa, fitness, yoga, gym | CleaningService, PlumbingHvac, Landscaping, SalonBarber, SpaWellness, Fitness, YogaStudio                                                                                |
| `education`   | `Bootcamp`         | bootcamp, course, education, tutor, university, kids, learning                 | Bootcamp, OnlineCourse, KidsEducation, Tutoring, University                                                                                                              |
| `events`      | `Event`            | event, wedding, festival, planner, conference, meetup                          | Event, EventPlanner, Wedding, MusicFestival                                                                                                                              |
| `travel`      | `HotelResort`      | hotel, resort, travel, tour, vacation, hospitality                             | HotelResort, TourExperiences, TravelAgency                                                                                                                               |
| `government`  | `GovernmentPortal` | government, public, sector, civic, municipal, portal, ministry                 | GovernmentPortal, Nonprofit, Church                                                                                                                                      |
| `logistics`   | `Logistics`        | logistics, manufacturing, construction, automotive, dealership, shipping       | Logistics, Manufacturing, Construction, AutoDealership                                                                                                                   |
| `jobs`        | `JobBoard`         | job, jobs, career, hiring, recruitment, board                                  | JobBoard, ComingSoon, LinkInBio, ResumeCv                                                                                                                                |
| `marketing`   | `Marketing`        | (fallback)                                                                     | Marketing, Consulting, Corporate, Coworking, DatingApp, MobileApp, Webinar, CommunityForum, KnowledgeBase, Docs, Crowdfunding, MembershipClub, Nutrition, VideoStreaming |

---

## Macro Templates (6)

### `collection` (seeded content table)

- **Parameters:** `tableName`, `fields[]`
- **Generates:**
  - Table: `{ [tableName]: table({ field1: string().default(''), ... }) }` with `seedFromProps: true`
  - Query: `list{TableName}` → `ctx.db.{tableName}.orderBy('updatedAt', 'desc').all()`
  - Mutation: `sync{TableName}` → upsert by first field

### `cart` (runtime order table)

- **Parameters:** `tableName`, `fields[]`, `key` (upsert key field)
- **Generates:**
  - Table: `{ [tableName]: table({ ...fields, quantity: number().default(1) }) }` with `seedFromProps: false`
  - Query: `orderSummary` → count (sum of quantity) + items list
  - Mutations: `addToOrder` (upsert by key + increment), `removeFromOrder` (delete by key), `clearOrder` (delete all)

### `submission` (runtime form table)

- **Parameters:** `tableName`, `fields[]`
- **Generates:**
  - Table: `{ [tableName]: table({ ...fields }) }` with `seedFromProps: false`
  - Query: `submissionSummary` → count + latest + list
  - Mutation: `submit{TableName}` → clean fields, insert, return list

### `search` (search + state tables)

- **Parameters:** `stateFields[]`, `searchFields[]`
- **Generates:**
  - Tables: `state` (with stateFields) + `searches` (with searchFields), both `seedFromProps: false`
  - Query: `searchState` → read state row + search history
  - Mutation: `setSearch` → upsert state + insert search record

### `favorites` (saved items table)

- **Parameters:** `tableName`, `fields[]`, `key`
- **Generates:**
  - Table: `{ [tableName]: table({ ...fields }) }` with `seedFromProps: false`
  - Query: `savedList` → list saved items
  - Mutation: `toggleSave` → insert if new, delete if exists

### `auth` (session table)

- **Parameters:** none (fixed schema)
- **Generates:**
  - Table: `authSessions` (with `source`, `timestamp` fields)
  - Query: `sessionSummary` → count + latest session
  - Mutations: `recordSession`, `clearSessions`

---

## Interaction Profile Registry (`v3-interactions.ts`)

Each component maps to one or more profiles:

```typescript
export const INTERACTIONS = {
  RestaurantMenu: {
    profiles: ['collection', 'cart'],
    dataKey: 'Restaurant',
    seedTable: 'menuItems',
    seedPath: 'categories.items',
    seedFields: ['name', 'description', 'price', 'tag'],
    cartTable: 'orderItems',
    cartKey: 'name',
    operations: {
      listCollection: 'menuCatalog',
      syncCollection: 'syncMenuCatalog',
      orderSummary: 'restaurantOrder',
      addToOrder: 'addMenuItem',
      removeFromOrder: 'removeMenuItem',
      clearOrder: 'clearRestaurantOrder',
    },
  },
  RestaurantReservations: {
    profiles: ['submission'],
    dataKey: 'Restaurant',
    submissionTable: 'reservations',
    submissionFields: ['label', 'source'],
    operations: {
      submissionSummary: 'restaurantExperience',
      submit: 'reserveTable',
    },
  },
  RestaurantHero: { profiles: ['none'] },
  // ... one entry per component with interactions
}
```

---

## Positional DSL Format

### Example output (restaurant homepage)

```
restaurant
hero Farm to Table|Wood-fired cuisine in the heart of the valley|Seasonal menus sourced from local farms cooked over open flame|Rustic dining room with candlelit tables
menu Autumn Menu|Three courses from Chef Marco changing weekly with the harvest|Starters>Roasted Beet Tartare~Charred beets horseradish creme rye crisp~14~Vegan^Charred Octopus~Smoked paprika fingerling potato aioli~18|Mains>Grilled Ribeye~Charred onion confit~42^Pan-seared Salmon~Lemon butter capers~34
reservations Book a Table|Parties up to 8 for larger groups call us
footer
@pages menu reservations
```

### With escape hatch (vet clinic)

```
healthcare
hero PetCare Clinic|Compassionate care for your furry family members|Experienced vets modern facility personalized treatment|Friendly veterinarian examining a happy dog
services Our Services|Comprehensive veterinary care|Wellness>Annual Checkup~Full physical exam and vaccinations~85^Dental Cleaning~Teeth scaling and polishing~120|Surgery>Spay Neuter~Routine surgical procedures~350^Emergency Surgery~Urgent surgical intervention~500
footer
+ pets name species breed ownerName birthDate
+ vaccinations petName vaccine date nextDue +
+ scheduleAppointment submission vaccinations
+ markVaccinated toggle vaccinations petName vaccinated
```

### Format rules

- Line 1: kind (one word)
- Section lines: `role` + `|`-separated positional values (field order from vocabulary)
- `footer` and other no-content sections: just the role name
- Nested arrays: `>` separates group name from items, `~` separates fields within item, `^` separates items
- `@pages` line: space-separated page names (roles to expand into secondary pages)
- `+` lines: custom tables and operations
  - `+ tableName field1 field2 field3` — declare custom table
  - `+ tableName field1 field2 +` — declare custom seeded table
  - `+ opName macroType tableName [key]` — declare custom operation

---

## System Prompt (high-confidence path)

```
You are a website superagent. You design and author a complete website from a build request.

OUTPUT FORMAT (strict — no prose, no markdown, no JSON):
Line 1: kind (one of the 3 listed below)
Then: one line per section, in order
Then: optional @pages line
Then: optional + lines for custom tables/operations

Section line format:
role value1|value2|value3
- Values are positional, matching the role's field order shown below
- Arrays: groupName>item1~field1~field2^item2~field1~field2
- Sections with no content fields: just the role name
- Omit conventional fields (CTAs, routing, contact info) — the engine injects them

@pages line: @pages page1 page2 page3

+ lines (custom data model, only if inference can't cover your needs):
+ tableName field1 field2 field3
+ tableName field1 field2 +
+ opName macroType tableName [key]

Available kinds (pick one):
1. restaurant — food/dining venues, cafes, bars, food trucks
2. commerce — online stores, product catalogs, shops
3. saas — software products, dev tools, platforms

Sections for restaurant:
hero: eyebrow|heading|subheading|imageAlt
menu: heading|description|categories[name>items[name~description~price~tag?]]
story: eyebrow|heading|body|alt|features[title~description]
gallery: heading|images[alt]
reservations: heading|description
testimonials: heading|items[quote~name~role~rating]
contact: heading|description
faq: heading|items[question~answer]
cta: heading|subheading|buttonLabel
stats: heading|items[value~label]
footer: (none)

Sections for commerce:
hero: eyebrow|heading|subheading|imageAlt
products: heading|description|items[name~price~imageAlt~tag?]
features: heading|items[title~description]
pricing: heading|subheading|tiers[name~price~period?~features[]~highlighted?]
testimonials: heading|items[quote~name~role~rating]
contact: heading|description
faq: heading|items[question~answer]
cta: heading|subheading|buttonLabel
stats: heading|items[value~label]
footer: (none)

Sections for saas:
hero: eyebrow|heading|subheading|imageAlt
features: heading|items[title~description]
pricing: heading|subheading|tiers[name~price~period?~features[]~highlighted?]
stats: heading|items[value~label]
testimonials: heading|items[quote~name~role~rating]
faq: heading|items[question~answer]
cta: heading|subheading|buttonLabel
contact: heading|description
footer: (none)

Example (restaurant menu section):
menu Autumn Menu|Three courses from Chef Marco|Starters>Roasted Beet Tartare~Charred beets horseradish rye crisp~14~Vegan^Charred Octopus~Smoked paprika fingerling potato aioli~18|Mains>Grilled Ribeye~Charred onion confit~42^Pan-seared Salmon~Lemon butter capers~34

Rules:
- Pick the kind that best fits the build request
- Include only sections this specific site needs — not all available sections
- Write rich, realistic, on-topic content — no lorem ipsum
- Arrays should have several distinct entries
- The engine injects brand, nav, CTAs, routing, and contact info automatically
- Write all content in {locale}

Build request: {prompt}
```

---

## Confidence Score Logic

```
if topScore == 0 and secondScore == 0:
    confidence = 0                          # no signal → LLM fallback (two-call)
else:
    confidence = topScore / (topScore + secondScore)

if confidence >= 0.65:
    high confidence → one-call path (top-3 kind vocabularies, LLM picks + fills)
else:
    low confidence → two-call path (LLM picks kind from 17 summaries, then fills)
```

---

## Error Handling Flow

1. **Parse** LLM output into structured site-plan
2. **Validate** — 7 rules: kind known, role valid for kind, field count matches, nested structure balanced, `+` lines well-formed, ≥1 section, `@pages` references valid roles
3. **Best-effort fix** — if validation fails:
   - Unknown role → skip section
   - Wrong field count → pad with defaults or truncate
   - `|` in prose → merge into previous value
   - Missing kind → infer from section roles
   - If fix produces ≥3 valid sections → accept
   - If fix produces <3 valid sections → retry
4. **Retry up to 3 times** — re-prompt with error context. Each retry goes through parse → validate → fix.
5. **After 3 failed retries** — render whatever the last best-effort fix produced, even if <3 sections. No v1 fallback.

---

## Code Structure

```
packages/ship-fast-engine/src/v3/
  index.ts              ← exports runAllV3
  compiler.ts           ← site-plan → OpenUI + lakebed
  parser.ts             ← positional DSL → structured site-plan
  validator.ts          ← 7 validation rules
  fixer.ts              ← best-effort repair
  macros/
    collection.ts       ← collection macro template
    cart.ts             ← cart macro template
    submission.ts       ← submission macro template
    search.ts           ← search macro template
    favorites.ts        ← favorites macro template
    auth.ts             ← auth macro template
    index.ts            ← macro registry
  inference.ts          ← section list → data model (reads interaction profiles)
  interactions.ts       ← v3-interactions.ts mapping (component → profiles + operation names)
  kinds.ts              ← 17 kinds + default families + keyword hints + confidence scoring
  vocabulary.ts         ← generic role vocabulary + content-field signatures per kind
  prompt.ts             ← prompt builder (system + user prompt, high/low confidence paths)
  streaming.ts          ← streaming parser for incremental compilation
  retry.ts              ← parse → validate → fix → retry loop
```

### Wiring changes (existing files)

- `src/features/generation/server/engine-selector.ts` — add `'v3'` to union, add `runAllV3` branch
- `convex/generation.ts` — add `'v3'` routing branch (same shape as `'v2'` branch)
- `convex/schema.ts` — `engineVersion` already `v.optional(v.string())`, no change needed
- `packages/ship-fast-engine/src/index.ts` — export `runAllV3`

---

## Event Stream

v3 emits the same events as v1, plus one new event:

| Event      | When                               | Content                                                     |
| ---------- | ---------------------------------- | ----------------------------------------------------------- |
| `theme`    | Start                              | Theme name from seeded RNG                                  |
| `locale`   | Start                              | Detected language code                                      |
| `plan`     | After homepage parsed              | Page IDs for nav (from `@pages` line)                       |
| `skeleton` | After homepage parsed              | PageSwitch skeleton (empty structure)                       |
| `module`   | Per section (streaming)            | OpenUI statement for one section                            |
| `source`   | Per section (streaming)            | Accumulated OpenUI source                                   |
| `lakebed`  | After all homepage sections known  | Generated lakebed definition (schema + queries + mutations) |
| `done`     | After all pages + lakebed compiled | Completion signal                                           |

`signalHomepageReady` is called when the first section's OpenUI statement is emitted — IntroLoader fades, preview shows.

---

## SiteSpec Shape

```typescript
{
  // v1-compatible fields
  brand: string,
  tagline: string,
  theme: string,
  locale: string,
  skeleton: string,
  modules: { home: string, [pageId: string]: string },

  // v3 additions
  kind: string,                    // selected kind (e.g. "restaurant")
  lakebed: LakebedDefinition,       // generated lakebed definition
  fullstackManifest: object,        // table list, schema version, auth config
  sitePlan: {                       // parsed site-plan (for re-compilation)
    sections: [...],                // ordered list of { role, content }
    pages: [...],                   // secondary page declarations
    data: {...},                    // custom tables/operations from + lines
  }
}
```

---

## Testing Strategy

11 test files:

1. **`parser.test.ts`** — positional DSL → structured site-plan. Valid input, malformed input, edge cases (empty sections, nested arrays, `+` lines, `@pages` line).
2. **`validator.test.ts`** — each of the 7 validation rules. Valid plans, invalid plans.
3. **`fixer.test.ts`** — best-effort repair. Unknown role skipping, field count padding/truncation, prose-merge heuristics, minimum section threshold.
4. **`macros/*.test.ts`** — each macro generates correct lakebed tables/queries/mutations. Various field names, verify output shape.
5. **`inference.test.ts`** — section list + interaction profiles → data model. Single-profile, multi-profile, table deduplication, `+` line integration.
6. **`compiler.test.ts`** — site-plan → OpenUI + lakebed + siteSpec. Full pipeline, verify OpenUI valid, lakebed correct, siteSpec shape matches.
7. **`kinds.test.ts`** — keyword matching, confidence score computation, high/low confidence routing.
8. **`prompt.test.ts`** — prompt shape for high/low confidence paths. Vocabulary injection, syntax/example inclusion.
9. **`streaming.test.ts`** — incremental parsing, section boundary detection, partial input handling.
10. **`v3.integration.test.ts`** — end-to-end: mock LLM output → parse → validate → fix → compile → verify OpenUI + lakebed + siteSpec + events. Restaurant + SaaS briefs.
11. **Source-level invariant tests** — assert structural properties (e.g. "v3/index.ts exports runAllV3", "engine-selector.ts handles 'v3'").

---

## Implementation Phases

### Phase 1: Core engine (MVP)

- Parser, validator, fixer
- 6 macro templates
- Inference engine + interaction profile registry
- Compiler (site-plan → OpenUI + lakebed)
- Kind table + confidence scoring
- Prompt builder
- `runAllV3` wiring (engine-selector, convex/generation.ts)
- Streaming parser
- Error handling (parse → validate → fix → retry)
- Tests (all 11)
- Supports: homepage generation, secondary pages, inferred data model, `+` escape hatch (macro-typed only)

### Phase 2: Polish & escape hatch

- Custom code escape hatch (`custom` type in `+` lines) with safety rails
- Lakebed export (include generated definition in React/Next.js export bundle)
- Re-compilation from `sitePlan` (manual trigger)
- Role→component mapping for novel roles (evolving toward C from Q4)
- Performance tuning (prompt token optimization, parallel page generation tuning)

### Phase 3: Macro library expansion

- New macros as patterns emerge from real briefs
- Finer-grained kinds for commerce subtypes (if needed)
- Component registry growth for uncovered roles
- Escape hatch deprecation as macro library covers more ground
