import type { MacroOutput, MacroParams, LakebedTable } from '../types'
import { buildFields } from './helpers.ts'

/**
 * search macro — search + state tables.
 * Tables: state (stateFields) + searches (searchFields), both seedFromProps:false.
 * Query: searchState → read state + history.
 * Mutation: setSearch → upsert state + insert search record.
 */
export function search(params: MacroParams): MacroOutput {
  const stateFields = params.stateFields ?? []
  const searchFields = params.searchFields ?? []
  const stateTable: LakebedTable = {
    name: 'state',
    fields: buildFields(stateFields, false),
  }
  const searchesTable: LakebedTable = {
    name: 'searches',
    fields: buildFields(searchFields, false),
  }
  return {
    tables: [stateTable, searchesTable],
    queries: [
      {
        name: 'searchState',
        table: 'state',
        body: `ctx.db.state.first().then(state => ({state, history: ctx.db.searches.orderBy('updatedAt','desc').all()}))`,
      },
    ],
    mutations: [
      {
        name: 'setSearch',
        table: 'state',
        body: `ctx.db.state.upsert({id: 'current'}, args.state); ctx.db.searches.insert(args.search)`,
      },
    ],
  }
}
