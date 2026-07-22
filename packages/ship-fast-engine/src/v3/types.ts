// v3 engine — type contracts. Other modules import from ./types.

export type MacroType =
  | 'collection'
  | 'cart'
  | 'submission'
  | 'search'
  | 'favorites'
  | 'auth'

export interface NestedItem {
  fields: string[]
}

export interface NestedGroup {
  name: string
  items: NestedItem[]
}

export interface Section {
  role: string
  content: string[]
  nested?: NestedGroup[]
}

export interface CustomTable {
  name: string
  fields: string[]
  seeded: boolean
}

export interface CustomOperation {
  name: string
  macroType: MacroType
  table: string
  key?: string
}

export interface ParsedSitePlan {
  kind: string
  sections: Section[]
  pages: string[]
  tables: CustomTable[]
  operations: CustomOperation[]
  /** LLM-extracted brand name (from @brand metadata line). */
  brand?: string
  /** LLM-decided descriptive site title (from @title metadata line). */
  title?: string
  /** LLM-suggested nav labels: pageId → display label (from @nav metadata line). */
  navLabels?: Record<string, string>
}

export interface LakebedField {
  type: 'string' | 'number'
  default: string | number
  seedFromProps: boolean
}

export interface LakebedTable {
  name: string
  fields: Record<string, LakebedField>
}

export interface LakebedQuery {
  name: string
  table: string
  body: string
}

export interface LakebedMutation {
  name: string
  table: string
  body: string
}

export interface LakebedDefinition {
  tables: LakebedTable[]
  queries: LakebedQuery[]
  mutations: LakebedMutation[]
}

export interface MacroParams {
  tableName?: string
  fields?: string[]
  key?: string
  stateFields?: string[]
  searchFields?: string[]
}

export interface MacroOutput {
  tables: LakebedTable[]
  queries: LakebedQuery[]
  mutations: LakebedMutation[]
}

export type InteractionProfiles = MacroType[] | ['none']

export interface InteractionProfile {
  profiles: InteractionProfiles
  dataKey?: string
  seedTable?: string
  seedPath?: string
  seedFields?: string[]
  cartTable?: string
  cartKey?: string
  submissionTable?: string
  submissionFields?: string[]
  operations: Record<string, string>
}

export interface KindEntry {
  kind: string
  defaultFamily: string
  keywordHints: string[]
  covers: string[]
}

export interface RoleField {
  name: string
  optional?: boolean
  array?: boolean
  nested?: RoleField[]
}

export interface RoleVocabulary {
  role: string
  fields: RoleField[]
  universal?: boolean
}

export interface KindVocabulary {
  kind: string
  roles: RoleVocabulary[]
}

export interface ConfidenceResult {
  kind: string
  confidence: number
  top3: string[]
}

export interface V3SiteSpec {
  brand: string
  projectName?: string
  tagline: string
  theme: string
  locale: string
  skeleton: string
  modules: Record<string, string>
  kind: string
  lakebed: LakebedDefinition
  /** Generated Convex backend files (schema + functions + seed). */
  convexBackend?: Record<string, string>
  /** Data bindings: component id → lakebed operation keys. */
  dataBindings?: Record<string, DataBinding>
  fullstackManifest: {
    tables: string[]
    schemaVersion: number
    auth: boolean
  }
  sitePlan: ParsedSitePlan
}

/** Describes how a component binds to lakebed operations at runtime. */
export interface DataBinding {
  /** The component id (e.g. "home_menu"). */
  componentId: string
  /** The component name (e.g. "RestaurantMenu"). */
  component: string
  /** Interaction profiles (collection, cart, submission, search, favorites, auth). */
  profiles: string[]
  /** Query operation key → Convex function name. */
  queries: Record<string, string>
  /** Mutation operation key → Convex function name. */
  mutations: Record<string, string>
  /** Seed table name (if this component seeds data from its props). */
  seedTable?: string
  /** Path into the component props to extract seed data from. */
  seedPath?: string
}
