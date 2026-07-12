export { capsule, empty, endpoint, json, redirect, text } from 'lakebed/server'
export {
  authFromUrl,
  createGuestAuth,
  requestOrigin,
  shooBaseUrlFromEnv,
  verifyShooAuth,
} from 'lakebed/auth'
export type {
  AuthContext,
  EndpointDefinition,
  Field,
  LogContext,
  QueryBuilder,
  TableApi,
  TableDefinition,
} from 'lakebed/server'

import {
  boolean as lakebedBoolean,
  string as lakebedString,
  table as lakebedTable,
} from 'lakebed/server'
import type {
  AuthContext,
  EndpointDefinition,
  Field,
  LogContext,
  TableDefinition,
} from 'lakebed/server'
import { createGuestAuthContext, withAuthUser } from './auth-shared.ts'
import type { LakebedAuthContext } from './auth-shared.ts'
import { createLakebedObjectRuntime, noopLog } from './db.ts'
import type { LakebedDbFromData } from './db.ts'
export {
  createGoogleAuthFromToken,
  createGuestAuthContext,
  decodeIdentityClaims,
  normalizeShooBaseUrl,
  toDisplayName,
  toGuestName,
  withAuthUser,
} from './auth-shared.ts'
export type {
  IdentityClaims,
  LakebedAuthContext,
  LakebedAuthUser,
  LakebedAuthValue,
  StoredIdentityResult,
} from './auth-shared.ts'

export type JsonRecord = Record<string, unknown>
export type LakebedSessionSchema = Record<
  string,
  TableDefinition & { seedFromProps?: boolean }
>
export type TypedTableDefinition<TFields extends Record<string, Field<any>>> =
  TableDefinition & {
    fields: TFields
    seedFromProps?: boolean
  }

export function table(fields: TFields): TypedTableDefinition<TFields> {
  return lakebedTable(fields) as TypedTableDefinition<TFields>
}

export function string(): Field<string> {
  return lakebedString()
}
export function boolean(): Field<boolean> {
  return lakebedBoolean()
}
export function number(): Field<number> {
  return {
    kind: 'number',
    default(value: number) {
      return { ...this, defaultValue: value }
    },
  }
}

type FieldValue<TField> = TField extends Field<infer TValue> ? TValue : unknown
type FieldsOf<TTable> = TTable extends { fields: infer TFields }
  ? TFields
  : JsonRecord

export type LakebedRow<TTable> = {
  id: string
  createdAt: string
  updatedAt: string
} & {
  [TKey in keyof FieldsOf<TTable>]: FieldValue<FieldsOf<TTable>[TKey]>
}

export type LakebedDataFromSchema<TSchema> =
  TSchema extends LakebedSessionSchema
    ? { [TName in keyof TSchema]: LakebedRow<TSchema[TName]>[] }
    : JsonRecord

export type LakebedQueryContext<TProps, TData extends JsonRecord> = {
  auth: LakebedAuthContext
  props: TProps
  data: TData
  db: LakebedDbFromData<TData>
  env: Record<string, string | undefined>
  log: LogContext
}

export type LakebedMutationContext<TProps, TData extends JsonRecord> = {
  auth: LakebedAuthContext
  props: TProps
  data: TData
  db: LakebedDbFromData<TData>
  env: Record<string, string | undefined>
  log: LogContext
  setData(patch: Partial<TData>): Promise<TData>
  replaceData(data: TData): Promise<TData>
}

export type LakebedQueryHandler<TProps, TData extends JsonRecord, TResult> = (
  ctx: LakebedQueryContext<TProps, TData>,
) => TResult

export type LakebedMutationHandler<
  TProps,
  TData extends JsonRecord,
  TArgs extends unknown[],
  TResult,
> = (
  ctx: LakebedMutationContext<TProps, TData>,
  ...args: TArgs
) => TResult | Promise<TResult>

export type LakebedQueryMap<TProps, TData extends JsonRecord> = Record<
  string,
  LakebedQueryHandler<TProps, TData, unknown>
>

export type LakebedMutationMap<TProps, TData extends JsonRecord> = Record<
  string,
  LakebedMutationHandler<TProps, TData, any[], unknown>
>

export type ShipFastLakebedDefinition<
  TProps = JsonRecord,
  TSchema extends LakebedSessionSchema | undefined =
    | LakebedSessionSchema
    | undefined,
  TData extends JsonRecord = LakebedDataFromSchema<TSchema>,
  TQueries extends LakebedQueryMap<TProps, TData> = LakebedQueryMap<
    TProps,
    TData
  >,
  TMutations extends LakebedMutationMap<TProps, TData> = LakebedMutationMap<
    TProps,
    TData
  >,
> = {
  schema?: TSchema
  queries?: TQueries
  mutations?: TMutations
  endpoints?: Record<string, EndpointDefinition>
}

export type LakebedDataOf<TDefinition> =
  TDefinition extends ShipFastLakebedDefinition<any, any, infer TData, any, any>
    ? TData
    : JsonRecord

export type LakebedQueriesOf<TDefinition> =
  TDefinition extends ShipFastLakebedDefinition<
    any,
    any,
    any,
    infer TQueries,
    any
  >
    ? TQueries
    : LakebedQueryMap<JsonRecord, JsonRecord>

export type LakebedMutationsOf<TDefinition> =
  TDefinition extends ShipFastLakebedDefinition<
    any,
    any,
    any,
    any,
    infer TMutations
  >
    ? TMutations
    : LakebedMutationMap<JsonRecord, JsonRecord>

export const guestAuthContext: LakebedAuthContext =
  createGuestAuthContext('local')

export function query<TProps, TData extends JsonRecord, TResult>(
  handler: LakebedQueryHandler<TProps, TData, TResult>,
): LakebedQueryHandler<TProps, TData, TResult> {
  return handler
}

export function mutation<
  TProps,
  TData extends JsonRecord,
  TArgs extends unknown[],
  TResult,
>(
  handler: LakebedMutationHandler<TProps, TData, TArgs, TResult>,
): LakebedMutationHandler<TProps, TData, TArgs, TResult> {
  return handler
}

export function createLakebedDefinition<
  TSchema extends LakebedSessionSchema,
  TProps = JsonRecord,
>(schema: TSchema) {
  type TData = LakebedDataFromSchema<TSchema>

  return {
    schema,
    query<TResult>(handler: LakebedQueryHandler<TProps, TData, TResult>) {
      return query(handler)
    },
    mutation<TArgs extends unknown[], TResult>(
      handler: LakebedMutationHandler<TProps, TData, TArgs, TResult>,
    ) {
      return mutation(handler)
    },
  }
}

export function createLakebedHandlerContext<TProps, TData extends JsonRecord>({
  auth = guestAuthContext,
  data,
  env = {},
  log = noopLog,
  props,
  replaceData,
  schema,
  setData,
  writable = false,
}: {
  auth?: AuthContext | LakebedAuthContext
  data: TData
  env?: Record<string, string | undefined>
  log?: LogContext
  props: TProps
  replaceData?: (data: TData) => Promise<TData>
  schema?: LakebedSessionSchema
  setData?: (patch: Partial<TData>) => Promise<TData>
  writable?: boolean
}) {
  const runtime = createLakebedObjectRuntime({ data, schema, writable })
  const context = {
    auth: 'user' in auth ? auth : withAuthUser(auth),
    data,
    db: runtime.db,
    env,
    log,
    props,
    replaceData:
      replaceData ??
      (async (nextData) => {
        return nextData
      }),
    setData:
      setData ??
      (async (patch) => {
        return { ...data, ...patch }
      }),
  }

  return { context, getPatch: runtime.getPatch }
}

export { createLakebedObjectRuntime } from './db.ts'
export type { LakebedDbFromData } from './db.ts'
