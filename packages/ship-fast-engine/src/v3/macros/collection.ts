import type { MacroOutput, MacroParams, LakebedTable } from '../types'
import { buildFields, pascalCase } from './helpers.ts'

/**
 * collection macro — seeded content table.
 * Table: all fields string().default('') with seedFromProps:true.
 * Query: list{TableName} → orderBy('updatedAt','desc').all().
 * Mutation: sync{TableName} → upsert by first field.
 */
export function collection(params: MacroParams): MacroOutput {
  const tableName = params.tableName ?? 'items'
  const fields = params.fields ?? []
  const table: LakebedTable = {
    name: tableName,
    fields: buildFields(fields, true),
  }
  const pascal = pascalCase(tableName)
  const firstField = fields[0] ?? 'id'
  return {
    tables: [table],
    queries: [
      {
        name: `list${pascal}`,
        table: tableName,
        body: `ctx.db.${tableName}.orderBy('updatedAt','desc').all()`,
      },
    ],
    mutations: [
      {
        name: `sync${pascal}`,
        table: tableName,
        body: `ctx.db.${tableName}.upsert({${firstField}: args.${firstField}}, args)`,
      },
    ],
  }
}
