import type { MacroOutput, MacroParams, LakebedTable } from '../types'
import { buildFields, pascalCase } from './helpers.ts'

/**
 * submission macro — runtime form table.
 * Table: fields, seedFromProps:false.
 * Query: submissionSummary → count + latest + list.
 * Mutation: submit{TableName} → clean fields, insert, return list.
 */
export function submission(params: MacroParams): MacroOutput {
  const tableName = params.tableName ?? 'submissions'
  const fields = params.fields ?? []
  const table: LakebedTable = {
    name: tableName,
    fields: buildFields(fields, false),
  }
  const pascal = pascalCase(tableName)
  const fieldList = fields.length ? fields.join(', ') : 'data'
  return {
    tables: [table],
    queries: [
      {
        name: 'submissionSummary',
        table: tableName,
        body: `ctx.db.${tableName}.all().then(list => ({count: list.length, latest: list[list.length-1], list}))`,
      },
    ],
    mutations: [
      {
        name: `submit${pascal}`,
        table: tableName,
        body: `ctx.db.${tableName}.insert(clean({${fieldList}}, args)).then(() => ctx.db.${tableName}.all())`,
      },
    ],
  }
}
