import type { MacroOutput, MacroParams, LakebedTable } from '../types'
import { buildFields } from './helpers.ts'

/**
 * favorites macro — saved items table.
 * Table: fields, seedFromProps:false.
 * Query: savedList → list.
 * Mutation: toggleSave → insert if new, delete if exists (by key).
 */
export function favorites(params: MacroParams): MacroOutput {
  const tableName = params.tableName ?? 'favorites'
  const fields = params.fields ?? []
  const key = params.key ?? fields[0] ?? 'id'
  const table: LakebedTable = {
    name: tableName,
    fields: buildFields(fields, false),
  }
  return {
    tables: [table],
    queries: [
      {
        name: 'savedList',
        table: tableName,
        body: `ctx.db.${tableName}.all()`,
      },
    ],
    mutations: [
      {
        name: 'toggleSave',
        table: tableName,
        body: `ctx.db.${tableName}.find({${key}: args.${key}}).then(existing => existing ? ctx.db.${tableName}.delete({${key}: args.${key}}) : ctx.db.${tableName}.insert(args))`,
      },
    ],
  }
}
