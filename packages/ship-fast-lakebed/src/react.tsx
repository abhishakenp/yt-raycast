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
import {
  signInWithGoogle,
  signOut,
  useAuth as useLakebedAuth,
} from './auth.tsx'
import type { GoogleAuthOptions, LakebedAuthValue } from './auth.tsx'
import type { LakebedAuthContext } from './auth-shared.ts'
import { createLakebedHandlerContext } from './server.ts'
import type {
  JsonRecord,
  LakebedDataOf,
  LakebedMutationsOf,
  LakebedQueriesOf,
  LakebedSessionSchema,
  ShipFastLakebedDefinition,
} from './server.ts'

export {
  SignInWithGoogle,
  ensureAuthInitialized,
  getAuth,
  getAuthToken,
  getIdentity,
  getIdentityClaims,
  signInWithGoogle,
  signOut,
  useAuth,
} from './auth.tsx'
export type {
  GoogleAuthOptions,
  LakebedAuthValue,
  PkceBundle,
  SignInWithGoogleProps,
} from './auth.tsx'
export {
  buildSectionSeedPatch,
  mergeSectionProps,
  withSectionRealtime,
} from './section-realtime.tsx'
export type {
  SectionRenderProps,
  SectionRenderer,
} from './section-realtime.tsx'

type LakebedSessionContextValue = {
  anonymousOwnerSecret?: string
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
  anonymousOwnerSecret,
  children,
  sessionId,
}: {
  anonymousOwnerSecret?: string
  children: ReactNode
  sessionId: string
}) {
  const value = useMemo(
    () => ({
      ...(anonymousOwnerSecret === undefined ? {} : { anonymousOwnerSecret }),
      sessionId: sessionId as Id<'sessions'>,
    }),
    [anonymousOwnerSecret, sessionId],
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

/**
 * Like {@link useLakebedSession} but returns `null` instead of throwing when no
 * {@link LakebedSessionProvider} is mounted. Used by the section realtime
 * wrapper so static section capsules can render outside a session (SSR, static
 * export, previews without a session) without crashing.
 */
export function useOptionalLakebedSession(): LakebedSessionContextValue | null {
  return useContext(LakebedSessionContext)
}

const lakebedSessionArgs = ({
  anonymousOwnerSecret,
  capsule,
  sessionId,
}: LakebedSessionContextValue & { capsule: string }) => ({
  ...(anonymousOwnerSecret === undefined ? {} : { anonymousOwnerSecret }),
  capsule,
  sessionId,
})

export function useSessionState<TData extends JsonRecord = JsonRecord>(
  capsule: string,
): { auth: LakebedAuthContext | null; canWrite: boolean; data: TData | null } {
  const session = useLakebedSession()
  const state = useConvexQuery(
    lakebedApi.getSessionState,
    lakebedSessionArgs({ ...session, capsule }),
  ) as { auth: LakebedAuthContext; canWrite?: boolean; data: TData } | undefined

  return state === undefined
    ? { auth: null, canWrite: false, data: null }
    : { auth: state.auth, canWrite: state.canWrite === true, data: state.data }
}

export function useSessionData<TData extends JsonRecord = JsonRecord>(
  capsule: string,
): TData | null {
  const { data } = useSessionState<TData>(capsule)

  return data
}

export function useMergeSessionData<TData extends JsonRecord = JsonRecord>(
  capsule: string,
): (patch: Partial<TData>) => Promise<TData> {
  const session = useLakebedSession()
  const mergeSessionData = useConvexMutation(lakebedApi.mergeSessionData)

  return useCallback(
    async (patch: Partial<TData>) =>
      (await mergeSessionData({
        ...lakebedSessionArgs({ ...session, capsule }),
        patch,
      })) as TData,
    [capsule, mergeSessionData, session],
  )
}

export function useReplaceSessionData<TData extends JsonRecord = JsonRecord>(
  capsule: string,
): (data: TData) => Promise<TData> {
  const session = useLakebedSession()
  const replaceSessionData = useConvexMutation(lakebedApi.replaceSessionData)

  return useCallback(
    async (data: TData) =>
      (await replaceSessionData({
        data,
        ...lakebedSessionArgs({ ...session, capsule }),
      })) as TData,
    [capsule, replaceSessionData, session],
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
  enabled = true,
  props,
}: {
  capsule: string
  data: JsonRecord | null
  definition: TDefinition
  enabled?: boolean
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
    if (
      !enabled ||
      data === null ||
      seedKey === '{}' ||
      seededKey.current === seedKey
    ) {
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
  signInWithGoogle(options?: GoogleAuthOptions): Promise<{
    bundle: {
      challenge: string
      state: string
      verifier: string
    }
    url: string
  }>
  signOut(): void
  useAuth(): LakebedAuthValue
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
    signInWithGoogle,
    signOut,
    useAuth: useLakebedAuth,
    useData() {
      const state = useSessionState(capsule) as {
        auth: LakebedAuthContext | null
        canWrite: boolean
        data: LakebedDataOf<NonNullable<TDefinition>> | null
      }
      const data = state.data
      useAutoSeedFromProps({
        capsule,
        data,
        definition,
        enabled: state.canWrite,
        props,
      })
      return data
    },
    useQuery(name) {
      const localAuth = useLakebedAuth()
      const state = useSessionState(capsule) as {
        auth: LakebedAuthContext | null
        canWrite: boolean
        data: LakebedDataOf<NonNullable<TDefinition>> | null
      }
      const data = state.data
      const auth = state.auth ?? localAuth
      useAutoSeedFromProps({
        capsule,
        data,
        definition,
        enabled: state.canWrite,
        props,
      })
      const handler = definition?.queries?.[name as string]

      return useMemo(() => {
        if (data === null) return null

        if (!handler) {
          throw new Error(
            `Lakebed query "${name}" is not defined for capsule "${capsule}"`,
          )
        }

        const { context } = createLakebedHandlerContext({
          auth,
          data,
          props,
          schema: definition?.schema,
        })

        return handler(context)
      }, [
        auth,
        capsule,
        data,
        definition?.schema,
        handler,
        name,
        props,
      ]) as QueryResult<LakebedQueriesOf<NonNullable<TDefinition>>[typeof name]>
    },
    useMutation(name) {
      const localAuth = useLakebedAuth()
      const state = useSessionState(capsule) as {
        auth: LakebedAuthContext | null
        canWrite: boolean
        data: LakebedDataOf<NonNullable<TDefinition>> | null
      }
      const data = state.data
      const auth = state.auth ?? localAuth
      useAutoSeedFromProps({
        capsule,
        data,
        definition,
        enabled: state.canWrite,
        props,
      })
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
            auth,
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
          auth,
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
