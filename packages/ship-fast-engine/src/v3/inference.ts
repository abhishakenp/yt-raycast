import type {
  LakebedDefinition,
  MacroType,
  MacroParams,
  MacroOutput,
  ParsedSitePlan,
  Section,
  InteractionProfile,
} from './types.ts'
import { INTERACTIONS, getInteraction } from './interactions.ts'
import { getDefaultFamily } from './kinds.ts'
import { runMacro } from './macros/index.ts'
import { pascalCase } from './macros/helpers.ts'

/** Operation key mapping: which generic operation name each generated query/mutation corresponds to. */
const OPERATION_KEYS: Record<
  MacroType,
  { queries: string[]; mutations: string[] }
> = {
  collection: { queries: ['listCollection'], mutations: ['syncCollection'] },
  cart: {
    queries: ['orderSummary'],
    mutations: ['addToOrder', 'removeFromOrder', 'clearOrder'],
  },
  submission: { queries: ['submissionSummary'], mutations: ['submit'] },
  search: { queries: ['searchState'], mutations: ['setSearch'] },
  favorites: { queries: ['savedList'], mutations: ['toggleSave'] },
  auth: {
    queries: ['sessionSummary'],
    mutations: ['recordSession', 'clearSessions'],
  },
}

/** Build MacroParams for a given profile type from an InteractionProfile. */
function paramsForProfile(
  type: MacroType,
  profile: InteractionProfile,
): MacroParams {
  switch (type) {
    case 'collection':
      return { tableName: profile.seedTable, fields: profile.seedFields }
    case 'cart':
      return {
        tableName: profile.cartTable,
        fields: profile.seedFields,
        key: profile.cartKey,
      }
    case 'submission':
      return {
        tableName: profile.submissionTable,
        fields: profile.submissionFields,
      }
    case 'search':
      return {
        stateFields: profile.seedFields,
        searchFields: profile.seedFields,
      }
    case 'favorites':
      return {
        tableName: profile.seedTable,
        fields: profile.seedFields,
        key: profile.cartKey,
      }
    case 'auth':
      return {}
  }
}

/** Apply operation name mapping from the interaction profile to a macro output. */
function applyOperationNames(
  type: MacroType,
  output: MacroOutput,
  operations: Record<string, string>,
): MacroOutput {
  const keys = OPERATION_KEYS[type]
  const queries = output.queries.map((q, i) => {
    const opKey = keys.queries[i]
    const mapped = operations[opKey]
    return mapped ? { ...q, name: mapped } : q
  })
  const mutations = output.mutations.map((m, i) => {
    const opKey = keys.mutations[i]
    const mapped = operations[opKey]
    return mapped ? { ...m, name: mapped } : m
  })
  return { tables: output.tables, queries, mutations }
}

/** Merge a macro output into the accumulator (dedupe by name). */
function mergeOutput(acc: LakebedDefinition, output: MacroOutput): void {
  for (const table of output.tables) {
    const existing = acc.tables.find((t) => t.name === table.name)
    if (existing) {
      // later wins, merge fields
      existing.fields = { ...existing.fields, ...table.fields }
    } else {
      acc.tables.push({ ...table, fields: { ...table.fields } })
    }
  }
  for (const query of output.queries) {
    const existing = acc.queries.find((q) => q.name === query.name)
    if (existing) {
      Object.assign(existing, query)
    } else {
      acc.queries.push({ ...query })
    }
  }
  for (const mutation of output.mutations) {
    const existing = acc.mutations.find((m) => m.name === mutation.name)
    if (existing) {
      Object.assign(existing, mutation)
    } else {
      acc.mutations.push({ ...mutation })
    }
  }
}

/** Process a single section: look up interaction, run macros, apply operation names. */
function processSection(
  section: Section,
  kind: string,
  acc: LakebedDefinition,
): void {
  const family = getDefaultFamily(kind)
  const component = `${family}${pascalCase(section.role)}`
  const profile = getInteraction(component)
  if (!profile) return
  if (profile.profiles[0] === 'none') return
  const profiles = profile.profiles.filter((p): p is MacroType => p !== 'none')
  for (const type of profiles) {
    const params = paramsForProfile(type, profile)
    const output = runMacro(type, params)
    const renamed = applyOperationNames(type, output, profile.operations)
    mergeOutput(acc, renamed)
  }
}

/**
 * Infer a LakebedDefinition from a parsed site plan.
 * Reads interaction profiles for each section, runs macros, merges outputs.
 */
export function inferLakebed(
  plan: ParsedSitePlan,
  kind: string,
): LakebedDefinition {
  const acc: LakebedDefinition = { tables: [], queries: [], mutations: [] }
  for (const section of plan.sections) {
    processSection(section, kind, acc)
  }
  return acc
}

// Re-export for testing convenience
export { INTERACTIONS, OPERATION_KEYS }
