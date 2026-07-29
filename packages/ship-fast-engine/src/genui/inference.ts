/**
 * inference.ts — infers a LakebedDefinition from a parsed composition.
 *
 * For each section in the composition, looks up the motif's interaction profile
 * and runs the appropriate macros to generate lakebed tables, queries, and mutations.
 *
 * This is the composition-based replacement for the old v3 inference.ts which
 * used `kind+role` component names. Now we use motif names directly.
 */
import type {
  LakebedDefinition,
  MacroType,
  MacroParams,
  MacroOutput,
  InteractionProfile,
} from './types.ts'
import { INTERACTIONS, getInteraction } from './interactions.ts'
import { runMacro } from './macros/index.ts'

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

/** Process a single section: look up interaction by motif name, run macros, apply operation names. */
function processMotifSection(motifName: string, acc: LakebedDefinition): void {
  const profile = getInteraction(motifName)
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
 * Infer a LakebedDefinition from a parsed composition.
 * Reads interaction profiles for each motif section, runs macros, merges outputs.
 */
export function inferLakebedFromComposition(
  sections: Array<{ motif: string }>,
): LakebedDefinition {
  const acc: LakebedDefinition = { tables: [], queries: [], mutations: [] }
  for (const section of sections) {
    processMotifSection(section.motif, acc)
  }
  return acc
}

// Re-export for testing convenience
export { INTERACTIONS, OPERATION_KEYS }
