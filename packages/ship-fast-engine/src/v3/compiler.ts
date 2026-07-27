// v3 compiler — site-plan → OpenUI statements + lakebed + siteSpec.
// Positional DSL intent is expanded into OpenUI-lang component calls (no LLM).
import type {
  Section,
  NestedGroup,
  ParsedSitePlan,
  LakebedDefinition,
  V3SiteSpec,
  RoleField,
  RoleVocabulary,
} from './types.ts'
import { getDefaultFamily } from './kinds.ts'
import { getVocabulary } from './vocabulary.ts'
import { inferLakebed } from './inference.ts'
import { buildComponentCall } from '../genui/openui-signature.ts'
import { getInteraction } from './interactions.ts'
import { generateConvexBackend } from './convex-codegen.ts'
import { compileSvelteBlock, type CompiledSvelte } from './svelte-compiler.ts'
import type { DataBinding } from './types.ts'

export interface CompileOptions {
  brand: string
  theme: string
  locale: string
  nav: string[]
  kind: string
  tagline?: string
  title?: string
}

export interface CompileResult {
  source: string
  lakebed: LakebedDefinition
  siteSpec: V3SiteSpec
  skeleton: string
  pageSources: Record<string, string>
  /** Compiled Svelte DOM JS scripts: script path → JS source. */
  svelteScripts: Record<string, string>
}

/** Capitalize first letter (PascalCase a single role word). */
function pascal(role: string): string {
  return role.charAt(0).toUpperCase() + role.slice(1)
}

/** Zip item field defs against positional string values → object. */
function zipItem(
  itemFields: RoleField[],
  values: string[],
): Record<string, unknown> {
  const obj: Record<string, unknown> = {}
  itemFields.forEach((rf, i) => {
    if (i < values.length) obj[rf.name] = values[i]
  })
  return obj
}

/**
 * Build the value for a nested array field from parsed `section.nested` groups.
 * - Two-level (group>items): field.nested contains an inner array field (e.g.
 *   `categories[name, items[...]]`) → `[{ name, items: [{...}] }]`.
 * - One-level (flat object array): field.nested is item fields directly →
 *   `[{...itemFields}]`.
 * - Primitive array (field.nested empty) → `[v1, v2, ...]`.
 */
function buildNestedValue(
  groups: NestedGroup[] | undefined,
  field: RoleField,
): unknown[] {
  const itemFields = field.nested ?? []
  const innerArray = itemFields.find(
    (nf) => nf.array && nf.nested && nf.nested.length > 0,
  )
  if (innerArray) {
    const innerFields = innerArray.nested ?? []
    return (groups ?? []).map((g) => ({
      name: g.name,
      [innerArray.name]: g.items.map((item) =>
        zipItem(innerFields, item.fields),
      ),
    }))
  }
  if (itemFields.length === 0) {
    return (groups ?? []).flatMap((g) => g.items.map((item) => item.fields[0]))
  }
  return (groups ?? []).flatMap((g) =>
    g.items.map((item) => zipItem(itemFields, item.fields)),
  )
}

/** Resolve the RoleField list for a role in a kind (empty if unknown). */
function roleFields(kind: string, role: string): RoleField[] {
  const vocab = getVocabulary(kind)
  const rv: RoleVocabulary | undefined = vocab.roles.find(
    (r) => r.role === role,
  )
  return rv ? rv.fields : []
}

/**
 * Parse inline array content from a single string using ~ and ^ separators.
 *
 * - Object array (field.nested non-empty): ^ separates items, ~ separates
 *   field values within each item. Values are zipped against field.nested
 *   names. If a nested field is itself an array (e.g. `links[]`), all
 *   remaining ~ values collapse into that sub-array.
 * - Primitive array (field.nested empty): ~ separates elements directly
 *   (no ^ needed).
 */
function parseInlineArray(raw: string, field: RoleField): unknown[] {
  // Strip array-name prefix if LLM wrote `fieldName[...]` literally.
  // e.g. "features[Online Ordering~Order ahead^...]" → "Online Ordering~Order ahead^..."
  let cleaned = raw.trim()
  const bracketMatch = cleaned.match(/^[A-Za-z_]+\[(.+)\]$/)
  if (bracketMatch) {
    cleaned = bracketMatch[1]
  }
  const itemFields = field.nested ?? []
  if (itemFields.length === 0) {
    // Primitive array — ~ separates elements directly.
    return cleaned.split('~')
  }
  // Object array — ^ separates items, ~ separates fields within an item.
  const items = cleaned.split('^')
  return items.map((item) => {
    const values = item.split('~')
    const obj: Record<string, unknown> = {}
    let vi = 0
    for (const nf of itemFields) {
      if (nf.array) {
        // Sub-array: consume all remaining ~ values as primitive elements.
        obj[nf.name] = values.slice(vi)
        vi = values.length
      } else if (vi < values.length) {
        obj[nf.name] = values[vi++]
      }
    }
    return obj
  })
}

/**
 * Map positional DSL content → named props object using the vocabulary's field
 * names. Nested array fields are built from section.nested groups (> syntax)
 * or parsed inline from content strings (~ and ^ separators).
 */
function contentToProps(
  section: Section,
  fields: RoleField[],
): Record<string, unknown> {
  const props: Record<string, unknown> = {}
  let contentIdx = 0
  for (const field of fields) {
    if (field.array) {
      // 1. If section.nested has groups, use buildNestedValue (> syntax).
      if (section.nested && section.nested.length > 0) {
        props[field.name] = buildNestedValue(section.nested, field)
        continue
      }
      // 2–3. Else parse inline from content string, or single-element array.
      if (contentIdx < section.content.length) {
        const raw = section.content[contentIdx++]
        if (raw == null) {
          props[field.name] = []
        } else if (raw.includes('~') || raw.includes('^')) {
          props[field.name] = parseInlineArray(raw, field)
        } else {
          props[field.name] = [raw]
        }
      } else {
        // 4. Empty array.
        props[field.name] = []
      }
      continue
    }
    if (contentIdx < section.content.length) {
      props[field.name] = section.content[contentIdx++]
    }
  }
  return props
}

/**
 * Compile one section on a page into OpenUI statements.
 * Uses buildComponentCall to map named props → spec-correct positional args,
 * injecting brand/nav automatically. Returns empty statements if the component
 * doesn't exist in the registry (skipped silently).
 */
export function compileSection(
  section: Section,
  kind: string,
  pageId: string,
  brand?: string,
  nav?: string[],
  svelteCompiled?: CompiledSvelte | null,
): { statements: string[]; ref: string | null } {
  const role = section.role
  const id = `${pageId}_${role.toLowerCase()}`
  const family = getDefaultFamily(kind)
  const component = `${family}${pascal(role)}`
  const fields = roleFields(kind, role)

  // Map positional DSL content → named props via vocabulary field names.
  const props = contentToProps(section, fields)

  // Footer auto-fill: when the LLM provided empty columns, generate link
  // columns from the available nav labels so the footer isn't blank or filled
  // with non-routing placeholder defaults. Also force social to [] (not null)
  // so the component doesn't render its baked-in default social links.
  if (role.toLowerCase() === 'footer') {
    // Schema-leak guard: the LLM sometimes copies the vocabulary signature
    // (`columns[title~links[]]`, `social[]`) verbatim instead of filling in
    // real content. The parser turns that into columns like
    // { title: 'title', links: ['links[]'] } and social like ['social[]'].
    // Detect these leaks and reset to empty so the auto-fill below kicks in.
    if (Array.isArray(props.columns)) {
      const isLeakedColumn = (c: unknown): boolean => {
        if (!c || typeof c !== 'object') return false
        const col = c as Record<string, unknown>
        const links = Array.isArray(col.links) ? col.links : []
        return (
          col.title === 'title' &&
          (links.includes('links[]') ||
            links.length === 0 ||
            (links.length === 1 &&
              typeof links[0] === 'string' &&
              (links[0] as string).includes('links[')))
        )
      }
      if (props.columns.length === 0 || props.columns.every(isLeakedColumn)) {
        props.columns = []
      }
    }
    if (Array.isArray(props.columns) && props.columns.length === 0) {
      props.columns = [
        { title: 'Pages', links: nav ?? [] },
        { title: 'Company', links: ['About', 'Contact'] },
        { title: 'Legal', links: ['Privacy', 'Terms'] },
      ]
    }
    if (props.social == null) {
      props.social = []
    }
    if (
      Array.isArray(props.social) &&
      props.social.some(
        (s) =>
          typeof s === 'string' && (s === 'social[]' || s.includes('social[')),
      )
    ) {
      props.social = []
    }
    // Some kinds use `socials` (with 's') — same null/leak guards apply.
    if (props.socials == null) {
      props.socials = []
    }
    if (
      Array.isArray(props.socials) &&
      props.socials.some(
        (s) =>
          typeof s === 'string' &&
          (s === 'socials[]' ||
            s.includes('social[') ||
            s.includes('socials[')),
      )
    ) {
      props.socials = []
    }
  }

  // buildComponentCall reads the ACTUAL spec signature, maps named props to
  // the correct positional order, and injects brand/nav fields automatically.
  const call = buildComponentCall({
    component,
    props,
    brand: brand ?? '',
    nav: nav ?? [],
  })

  // Component not in registry → check for svelte block (LLM-generated component).
  if (!call) {
    if (section.svelte && svelteCompiled) {
      const scriptPath = `/scripts/svelte-${pageId}-${role.toLowerCase()}.js`
      const htmlJson = JSON.stringify(svelteCompiled.ssrHtml)
      const scriptPathJson = JSON.stringify(scriptPath)
      const cssJson = JSON.stringify(svelteCompiled.css)
      const callStmt = `${id} = SvelteIsland(${htmlJson}, ${scriptPathJson}, ${cssJson})`
      const anchorId = `${id}_anchor`
      const anchorStmt = `${anchorId} = SectionAnchor("${id}", ${id}, "scroll-mt-28")`
      return { statements: [callStmt, anchorStmt], ref: anchorId }
    }
    return { statements: [], ref: null }
  }

  const callStmt = `${id} = ${call}`
  const anchorId = `${id}_anchor`
  const isNavbar = role.toLowerCase() === 'navbar'
  const anchorStmt = isNavbar
    ? `${anchorId} = SectionAnchor("${id}", ${id})`
    : `${anchorId} = SectionAnchor("${id}", ${id}, "scroll-mt-28")`

  return { statements: [callStmt, anchorStmt], ref: anchorId }
}

/** Compile a full site-plan into OpenUI source + lakebed + siteSpec. */
export async function compileSitePlan(
  plan: ParsedSitePlan,
  opts: CompileOptions,
): Promise<CompileResult> {
  const kind = opts.kind

  const navbarSection: Section = plan.sections.find(
    (s) => s.role === 'navbar',
  ) ?? { role: 'navbar', content: [] }
  const footerSection: Section = plan.sections.find(
    (s) => s.role === 'footer',
  ) ?? { role: 'footer', content: [] }

  // ── Pre-compile all Svelte blocks (async) ──────────────────────────────
  // Svelte compilation is async (dynamic import for SSR evaluation).
  // Pre-compile all blocks upfront so compileSection stays synchronous.
  const svelteCompiledMap: Record<string, CompiledSvelte> = {}
  const svelteScripts: Record<string, string> = {}
  for (const section of plan.sections) {
    if (section.svelte) {
      try {
        const compiled = await compileSvelteBlock(
          section.svelte.source,
          section.role,
        )
        svelteCompiledMap[section.role] = compiled
        const scriptPath = `scripts/svelte-home-${section.role.toLowerCase()}.js`
        svelteScripts[scriptPath] = compiled.domJs
      } catch {
        // Compile error — skip this block; it will be silently dropped
        // in compileSection. The retry loop in the generation runner
        // handles re-prompting the LLM for corrections.
      }
    }
  }

  // FIRST PASS: determine which pages have a matching focused section so we
  // can build a filtered nav that only references valid pages.  Without this,
  // the navbar would render buttons for pages that were skipped (no matching
  // section found), producing dead links.
  const PAGE_ROLE_ALIASES: Record<string, string[]> = {
    menu: ['gallery', 'products', 'menu'],
    shop: ['gallery', 'products', 'store'],
    store: ['gallery', 'products'],
    products: ['gallery', 'products'],
    about: ['story', 'about'],
    story: ['story', 'about'],
    services: ['services', 'features'],
    team: ['team', 'about', 'story'],
    pricing: ['pricing', 'tiers'],
  }

  const focusedByPage: Record<string, Section> = {}
  const validPageIds: string[] = []
  for (const page of plan.pages) {
    const pageId = page.toLowerCase()
    let focused = plan.sections.find(
      (s) => s.role.toLowerCase() === page.toLowerCase(),
    )
    // Fallback: if no exact role match, try common page-name → role mappings.
    // The LLM may use friendly page names (menu, shop, about) that don't match
    // the vocabulary role names (gallery, products, story).
    if (!focused) {
      const aliases = PAGE_ROLE_ALIASES[pageId]
      if (aliases) {
        for (const alias of aliases) {
          focused = plan.sections.find((s) => s.role.toLowerCase() === alias)
          if (focused) break
        }
      }
    }
    // Last resort: if still no match, skip this page (don't create empty page)
    if (!focused) continue
    focusedByPage[pageId] = focused
    validPageIds.push(pageId)
  }

  // Filtered nav — only includes pages that actually exist.  This is used for
  // every navbar compilation and the skeleton so no dead nav buttons appear.
  const validAllPageIds = ['home', ...validPageIds]
  const filteredNav = [
    'Home',
    ...validPageIds.map((p) => p.charAt(0).toUpperCase() + p.slice(1)),
  ]

  // Home page — navbar ALWAYS first, then authored sections (skip navbar/footer
  // in the loop since we handle them explicitly), footer ALWAYS last.
  const homeStmts: string[] = []
  const homeRefs: string[] = []

  // 1. Navbar first — use authored navbar if present, else default.
  const authoredNavbar = plan.sections.find((s) => s.role === 'navbar')
  const navbarToUse = authoredNavbar ?? navbarSection
  {
    const { statements, ref } = compileSection(
      navbarToUse,
      kind,
      'home',
      opts.brand,
      filteredNav,
      svelteCompiledMap[navbarToUse.role] ?? null,
    )
    if (ref) {
      homeStmts.push(...statements)
      homeRefs.push(ref)
    }
  }

  // 2. Authored sections (skip navbar and footer — handled explicitly).
  for (const section of plan.sections) {
    if (section.role === 'navbar' || section.role === 'footer') continue
    const { statements, ref } = compileSection(
      section,
      kind,
      'home',
      opts.brand,
      filteredNav,
      svelteCompiledMap[section.role] ?? null,
    )
    if (ref) {
      homeStmts.push(...statements)
      homeRefs.push(ref)
    }
  }

  // 3. Footer last — use authored footer if present, else default.
  const authoredFooter = plan.sections.find((s) => s.role === 'footer')
  const footerToUse = authoredFooter ?? footerSection
  {
    const { statements, ref } = compileSection(
      footerToUse,
      kind,
      'home',
      opts.brand,
      filteredNav,
      svelteCompiledMap[footerToUse.role] ?? null,
    )
    if (ref) {
      homeStmts.push(...statements)
      homeRefs.push(ref)
    }
  }
  homeStmts.push(`home = Stack([${homeRefs.join(', ')}])`)

  // Secondary pages — focused role section + Navbar + Footer.
  const pageSources: Record<string, string> = { home: homeStmts.join('\n') }
  const allStmts: string[] = [...homeStmts]

  for (const pageId of validPageIds) {
    const focused = focusedByPage[pageId]
    const pageStmts: string[] = []
    const pageRefs: string[] = []
    for (const section of [navbarSection, focused, footerSection]) {
      if (!section) continue
      const { statements, ref } = compileSection(
        section,
        kind,
        pageId,
        opts.brand,
        filteredNav,
        svelteCompiledMap[section.role] ?? null,
      )
      if (ref) {
        pageStmts.push(...statements)
        pageRefs.push(ref)
      }
    }
    pageStmts.push(`${pageId} = Stack([${pageRefs.join(', ')}])`)
    pageSources[pageId] = pageStmts.join('\n')
    allStmts.push(...pageStmts)
  }

  // Skeleton — PageSwitch over valid page ids only; nav labels → page ids.
  const targetMap: Record<string, string> = {}
  filteredNav.forEach((label, i) => {
    targetMap[label] = validAllPageIds[i] ?? 'home'
  })
  const skeleton = `root = PageSwitch(${JSON.stringify(filteredNav)}, [${validAllPageIds.join(', ')}], "", ${JSON.stringify(targetMap)})`

  const source = `${allStmts.join('\n')}\n${skeleton}`
  const lakebed = inferLakebed(plan, kind)
  const hasAuth = lakebed.tables.some((t) => t.name === 'authSessions')

  // ── Fullstack wiring: generate data bindings for interactive components ──
  // For each section, check if its component has an interaction profile. If so,
  // create a DataBinding record mapping the component to its lakebed queries/
  // mutations. This is what makes v3 fully fullstack — the bindings tell the
  // renderer which Convex functions each component should call.
  const dataBindings: Record<string, DataBinding> = {}
  const seedData: Record<string, unknown[]> = {}

  for (const section of plan.sections) {
    const component = `${getDefaultFamily(kind)}${pascal(section.role)}`
    const profile = getInteraction(component)
    if (!profile || profile.profiles[0] === 'none') continue

    const componentId = `home_${section.role.toLowerCase()}`
    const binding: DataBinding = {
      componentId,
      component,
      profiles: profile.profiles,
      queries: {},
      mutations: {},
    }

    // Map operation keys to Convex function names.
    // Operations with "list"/"sync" → queries; others → mutations.
    for (const [opKey, opName] of Object.entries(profile.operations)) {
      if (
        opKey.startsWith('list') ||
        opKey.startsWith('saved') ||
        opKey.startsWith('session') ||
        opKey.startsWith('search') ||
        opKey.startsWith('order')
      ) {
        binding.queries[opKey] = opName
      } else {
        binding.mutations[opKey] = opName
      }
    }

    if (profile.seedTable) {
      binding.seedTable = profile.seedTable
      binding.seedPath = profile.seedPath
      // Extract seed data from the section's compiled props
      const fields = roleFields(kind, section.role)
      const props = contentToProps(section, fields)
      if (profile.seedPath && props) {
        const pathParts = profile.seedPath.split('.')
        let extracted: unknown = props
        for (const part of pathParts) {
          extracted = (extracted as Record<string, unknown>)?.[part]
        }
        if (Array.isArray(extracted)) {
          seedData[profile.seedTable] = extracted
        }
      }
    }

    dataBindings[componentId] = binding
  }

  // Generate the actual Convex backend code (schema + functions + seed).
  const convexBackend = generateConvexBackend(lakebed, seedData)

  const siteSpec: V3SiteSpec = {
    brand: opts.brand,
    projectName: opts.title,
    tagline: opts.tagline ?? opts.brand,
    theme: opts.theme,
    locale: opts.locale,
    skeleton,
    modules: pageSources,
    kind: plan.kind,
    lakebed,
    convexBackend,
    dataBindings,
    fullstackManifest: {
      tables: lakebed.tables.map((t) => t.name),
      schemaVersion: 1,
      auth: hasAuth,
    },
    sitePlan: plan,
  }

  return { source, lakebed, siteSpec, skeleton, pageSources, svelteScripts }
}
