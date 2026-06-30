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
  tagline: string
  theme: string
  locale: string
  skeleton: string
  modules: Record<string, string>
  kind: string
  lakebed: LakebedDefinition
  fullstackManifest: {
    tables: string[]
    schemaVersion: number
    auth: boolean
  }
  sitePlan: ParsedSitePlan
}
