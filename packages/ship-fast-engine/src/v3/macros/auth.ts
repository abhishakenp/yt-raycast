import type { MacroOutput, LakebedTable } from '../types'
import { strField, numField } from './helpers.ts'

/**
 * auth macro — session table (fixed schema).
 * Table: authSessions with source:string.default(''), timestamp:number.default(0).
 * Query: sessionSummary → count + latest.
 * Mutations: recordSession, clearSessions.
 */
export function auth(): MacroOutput {
  const table: LakebedTable = {
    name: 'authSessions',
    fields: {
      source: strField(false),
      timestamp: numField(0, false),
    },
  }
  return {
    tables: [table],
    queries: [
      {
        name: 'sessionSummary',
        table: 'authSessions',
        body: `ctx.db.authSessions.all().then(list => ({count: list.length, latest: list[list.length-1]}))`,
      },
    ],
    mutations: [
      {
        name: 'recordSession',
        table: 'authSessions',
        body: `ctx.db.authSessions.insert(args)`,
      },
      {
        name: 'clearSessions',
        table: 'authSessions',
        body: `ctx.db.authSessions.deleteAll()`,
      },
    ],
  }
}
