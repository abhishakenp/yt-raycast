import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react'
import type { ReactNode } from 'react'
import {
  useMutation as useConvexMutation,
  useQuery as useConvexQuery,
} from 'convex/react'

import { api } from '../../../convex/_generated/api.js'
import type { Id } from '../../../convex/_generated/dataModel.js'
import { createLakebedHandlerContext } from './server.ts'
import type {
  JsonRecord,
  LakebedDataOf,
  LakebedMutationsOf,
  LakebedQueriesOf,
  LakebedSessionSchema,
  ShipFastLakebedDefinition,
} from './server.ts'

type LakebedSessionContextValue = {
  sessionId: Id<'sessions'>
}

type QueryResult<TQuery> = TQuery extends (...args: any[]) => infer TResult
  ? TResult
  : never

type MutationArgs<TMutation> = TMutation extends (
  ctx: any,
  ...args: infer TArgs
) => unknown
  ? TArgs
  : never

type MutationResult<TMutation> = TMutation extends (
  ...args: any[]
) => infer TResult
  ? Awaited<TResult>
  : never

const lakebedApi = (api as any).lakebed
const LakebedSessionContext = createContext<LakebedSessionContextValue | null>(
  null,
)

const slugForSeedRow = (value: unknown, fallback: string) => {
  const source = (() => {
    if (typeof value !== 'object' || value === null) return undefined

    const record = value as Record<string, unknown>
    for (const key of ['name', 'title', 'label']) {
      const item = record[key]
      if (typeof item === 'string' && item.trim()) return item
    }

    return Object.values(record).find(
      (item) => typeof item === 'string' && item.trim(),
    )
  })()
  const text = typeof source === 'string' ? source : fallback

  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80) || fallback
  )
}

const defaultFieldValue = (field: {
  kind?: string
  defaultValue?: unknown
}) => {
  if ('defaultValue' in field) return field.defaultValue
  if (field.kind === 'boolean') return false
  if (field.kind === 'number') return 0
  return ''
}

const seedRowsFromProp = (
  tableName: string,
  table: LakebedSessionSchema[string],
  propValue: unknown,
) => {
  const sourceRows = Array.isArray(propValue)
    ? propValue
    : typeof propValue === 'object' &&
        propValue !== null &&
        Array.isArray((propValue as { items?: unknown }).items)
      ? (propValue as { items: unknown[] }).items
      : []

  if (!sourceRows.length) return []

  const now = new Date().toISOString()
  const fields = Object.entries(table.fields)

  return sourceRows.map((source, index) => {
    const sourceRecord =
      typeof source === 'object' && source !== null
        ? (source as Record<string, unknown>)
        : {}
    const rowPrefix = tableName.endsWith('s')
      ? tableName.slice(0, -1)
      : tableName

    const row: JsonRecord = {
      createdAt: now,
      id:
        typeof sourceRecord.id === 'string'
          ? sourceRecord.id
          : `${rowPrefix}-${slugForSeedRow(sourceRecord, String(index + 1))}`,
      updatedAt: now,
    }

    for (const [fieldName, field] of fields) {
      row[fieldName] = sourceRecord[fieldName] ?? defaultFieldValue(field)
    }

    return row
  })
}

export function buildSeedPatchFromProps({
  data,
  definition,
  props,
}: {
  data: JsonRecord
  definition:
    | ShipFastLakebedDefinition<any, LakebedSessionSchema, JsonRecord, any, any>
    | undefined
  props: unknown
}): JsonRecord {
  if (!definition?.schema || typeof props !== 'object' || props === null) {
    return {}
  }

  const propsRecord = props as Record<string, unknown>
  const patch: JsonRecord = {}

  for (const [tableName, table] of Object.entries(definition.schema)) {
    const existingValue = data[tableName]
    if (Array.isArray(existingValue) && existingValue.length > 0) continue
    if (!(tableName in propsRecord)) continue

    const rows = seedRowsFromProp(tableName, table, propsRecord[tableName])
    if (rows.length > 0) patch[tableName] = rows
  }

  return patch
}

export function LakebedSessionProvider({
  children,
  sessionId,
}: {
  children: ReactNode
  sessionId: string
}) {
  const value = useMemo(
    () => ({ sessionId: sessionId as Id<'sessions'> }),
    [sessionId],
  )

  return (
    <LakebedSessionContext.Provider value={value}>
      {children}
    </LakebedSessionContext.Provider>
  )
}

export function useLakebedSession(): LakebedSessionContextValue {
  const value = useContext(LakebedSessionContext)
  if (!value) {
    throw new Error('Lakebed hooks must be used inside LakebedSessionProvider')
  }
  return value
}

export function useSessionData<TData extends JsonRecord = JsonRecord>(
  capsule: string,
): TData | null {
  const { sessionId } = useLakebedSession()
  const data = useConvexQuery(lakebedApi.getSessionData, {
    capsule,
    sessionId,
  }) as TData | undefined

  return data === undefined ? null : data
}

export function useMergeSessionData<TData extends JsonRecord = JsonRecord>(
  capsule: string,
): (patch: Partial<TData>) => Promise<TData> {
  const { sessionId } = useLakebedSession()
  const mergeSessionData = useConvexMutation(lakebedApi.mergeSessionData)

  return useCallback(
    async (patch: Partial<TData>) =>
      (await mergeSessionData({
        capsule,
        patch,
        sessionId,
      })) as TData,
    [capsule, mergeSessionData, sessionId],
  )
}

export function useReplaceSessionData<TData extends JsonRecord = JsonRecord>(
  capsule: string,
): (data: TData) => Promise<TData> {
  const { sessionId } = useLakebedSession()
  const replaceSessionData = useConvexMutation(lakebedApi.replaceSessionData)

  return useCallback(
    async (data: TData) =>
      (await replaceSessionData({
        capsule,
        data,
        sessionId,
      })) as TData,
    [capsule, replaceSessionData, sessionId],
  )
}

function useAutoSeedFromProps<
  TProps,
  TDefinition extends
    | ShipFastLakebedDefinition<TProps, any, any, any, any>
    | undefined,
>({
  capsule,
  data,
  definition,
  props,
}: {
  capsule: string
  data: JsonRecord | null
  definition: TDefinition
  props: TProps
}) {
  const seededKey = useRef<string | null>(null)
  const mergeData = useMergeSessionData(capsule)
  const seedPatch = useMemo(
    () =>
      data === null
        ? {}
        : buildSeedPatchFromProps({
            data,
            definition: definition as
              | ShipFastLakebedDefinition<
                  any,
                  LakebedSessionSchema,
                  JsonRecord,
                  any,
                  any
                >
              | undefined,
            props,
          }),
    [data, definition, props],
  )
  const seedKey = useMemo(() => JSON.stringify(seedPatch), [seedPatch])

  useEffect(() => {
    if (data === null || seedKey === '{}' || seededKey.current === seedKey) {
      return
    }

    seededKey.current = seedKey
    void mergeData(seedPatch)
  }, [data, mergeData, seedKey, seedPatch])
}

export type LakebedClientRuntime<
  TDefinition extends
    | ShipFastLakebedDefinition<any, any, any, any, any>
    | undefined,
> = {
  useData(): LakebedDataOf<NonNullable<TDefinition>> | null
  useQuery<
    TName extends Extract<
      keyof LakebedQueriesOf<NonNullable<TDefinition>>,
      string
    >,
  >(
    name: TName,
  ): QueryResult<LakebedQueriesOf<NonNullable<TDefinition>>[TName]> | null
  useMutation<
    TName extends Extract<
      keyof LakebedMutationsOf<NonNullable<TDefinition>>,
      string
    >,
  >(
    name: TName,
  ): (
    ...args: MutationArgs<LakebedMutationsOf<NonNullable<TDefinition>>[TName]>
  ) => Promise<
    MutationResult<LakebedMutationsOf<NonNullable<TDefinition>>[TName]>
  >
}

export function createLakebedClient<
  TProps,
  TDefinition extends
    | ShipFastLakebedDefinition<TProps, any, any, any, any>
    | undefined,
>({
  capsule,
  definition,
  props,
}: {
  capsule: string
  definition: TDefinition
  props: TProps
}): LakebedClientRuntime<TDefinition> {
  return {
    useData() {
      const data = useSessionData(capsule) as LakebedDataOf<
        NonNullable<TDefinition>
      > | null
      useAutoSeedFromProps({ capsule, data, definition, props })
      return data
    },
    useQuery(name) {
      const data = useSessionData(capsule) as LakebedDataOf<
        NonNullable<TDefinition>
      > | null
      useAutoSeedFromProps({ capsule, data, definition, props })
      const handler = definition?.queries?.[name as string]

      return useMemo(() => {
        if (data === null) return null

        if (!handler) {
          throw new Error(
            `Lakebed query "${name}" is not defined for capsule "${capsule}"`,
          )
        }

        const { context } = createLakebedHandlerContext({
          data,
          props,
          schema: definition?.schema,
        })

        return handler(context)
      }, [capsule, data, definition?.schema, handler, name, props]) as QueryResult<
        LakebedQueriesOf<NonNullable<TDefinition>>[typeof name]
      >
    },
    useMutation(name) {
      const data = useSessionData(capsule) as LakebedDataOf<
        NonNullable<TDefinition>
      > | null
      useAutoSeedFromProps({ capsule, data, definition, props })
      const setData = useMergeSessionData(capsule)
      const replaceData = useReplaceSessionData(capsule)
      const handler = definition?.mutations?.[name as string]

      return useCallback(
        async (...args) => {
          if (!handler) {
            throw new Error(
              `Lakebed mutation "${name}" is not defined for capsule "${capsule}"`,
            )
          }

          const { context, getPatch } = createLakebedHandlerContext({
            data: (data ?? {}) as LakebedDataOf<NonNullable<TDefinition>>,
            props,
            replaceData,
            schema: definition?.schema,
            setData,
            writable: true,
          })
          const result = await handler(context, ...args)
          const patch = getPatch() as Partial<
            LakebedDataOf<NonNullable<TDefinition>>
          >

          if (Object.keys(patch).length > 0) {
            await setData(patch)
          }

          return result
        },
        [
          capsule,
          data,
          definition?.schema,
          handler,
          name,
          props,
          replaceData,
          setData,
        ],
      ) as (
        ...args: MutationArgs<
          LakebedMutationsOf<NonNullable<TDefinition>>[typeof name]
        >
      ) => Promise<
        MutationResult<
          LakebedMutationsOf<NonNullable<TDefinition>>[typeof name]
        >
      >
    },
  }
}
