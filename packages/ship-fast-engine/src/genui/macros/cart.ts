import type {
  MacroOutput,
  MacroParams,
  LakebedTable,
  LakebedField,
} from '../types'
import { buildFields, numField } from './helpers.ts'

/**
 * cart macro — runtime order table.
 * Table: fields + quantity:number().default(1), seedFromProps:false.
 * Query: orderSummary → count + items.
 * Mutations: addToOrder (upsert by key + increment), removeFromOrder (delete by key), clearOrder (delete all).
 */
export function cart(params: MacroParams): MacroOutput {
  const tableName = params.tableName ?? 'orderItems'
  const fields = params.fields ?? []
  const key = params.key ?? fields[0] ?? 'id'
  const fieldRecord: Record<string, LakebedField> = {
    ...buildFields(fields, false),
    quantity: numField(1, false),
  }
  const table: LakebedTable = { name: tableName, fields: fieldRecord }
  return {
    tables: [table],
    queries: [
      {
        name: 'orderSummary',
        table: tableName,
        body: `ctx.db.${tableName}.all().then(items => ({count: items.length, items}))`,
      },
    ],
    mutations: [
      {
        name: 'addToOrder',
        table: tableName,
        body: `ctx.db.${tableName}.upsert({${key}: args.${key}}, { ...args, quantity: (existing?.quantity ?? 0) + 1 })`,
      },
      {
        name: 'removeFromOrder',
        table: tableName,
        body: `ctx.db.${tableName}.delete({${key}: args.${key}})`,
      },
      {
        name: 'clearOrder',
        table: tableName,
        body: `ctx.db.${tableName}.deleteAll()`,
      },
    ],
  }
}
