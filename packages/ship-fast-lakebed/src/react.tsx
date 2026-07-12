import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import {
  useMutation as useConvexMutation,
  useQuery as useConvexQuery,
  useConvex,
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

type QueryResult<TQuery> = TQuery extends (
  ...args: infer _TArgs
) => infer TResult
  ? TResult
  : never

type MutationArgs<TMutation> = TMutation extends (
  ctx: infer _TCtx,
  ...args: infer TArgs
) => unknown
  ? TArgs
  : never

type MutationResult<TMutation> = TMutation extends (
  ...args: infer _TArgs
) => infer TResult
  ? Awaited<TResult>
  : never

type LakebedMutationLifecycle = {
  onExecutionEnd?: () => void
  onExecutionStart?: () => void
}

export type LakebedMutationFunction<TMutation> = ((
  ...args: MutationArgs<TMutation>
) => Promise<MutationResult<TMutation>>) & {
  isPending: boolean
  lastError: unknown | null
  pendingCount: number
  reset(): void
  runWithLifecycle?(
    lifecycle: LakebedMutationLifecycle,
    ...args: MutationArgs<TMutation>
  ): Promise<MutationResult<TMutation>>
}

export type LakebedKeyedMutationFunction<TMutation> = {
  hasPending: boolean
  isPending(key: string): boolean
  lastError: unknown | null
  pendingKey: string | null
  pendingKeys: readonly string[]
  reset(): void
  run(
    key: string,
    ...args: MutationArgs<TMutation>
  ): Promise<MutationResult<TMutation> | undefined>
}

const lakebedApi = api.lakebed ?? {
  getSessionState: 'lakebed:getSessionState' as const,
  mergeSessionData: 'lakebed:mergeSessionData' as const,
  replaceSessionData: 'lakebed:replaceSessionData' as const,
}
const LakebedSessionContext = createContext<LakebedSessionContextValue | null>(
  null,
)

type LakebedMutationCoordinator = {
  data: JsonRecord | null
  queue: Promise<unknown>
}

const lakebedMutationCoordinators = new Map<
  string,
  LakebedMutationCoordinator
>()

function mutationCoordinatorKey({
  anonymousOwnerSecret,
  capsule,
  sessionId,
}: LakebedSessionContextValue & { capsule: string }) {
  return `${sessionId}:${anonymousOwnerSecret ?? ''}:${capsule}`
}

function mutationCoordinatorFor(key: string): LakebedMutationCoordinator {
  const existing = lakebedMutationCoordinators.get(key)
  if (existing) return existing

  const coordinator = {
    data: null,
    queue: Promise.resolve(),
  }
  lakebedMutationCoordinators.set(key, coordinator)
  return coordinator
}

function slugForSeedRow(value: unknown, fallback: string) {
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

function defaultFieldValue(field: { kind?: string; defaultValue?: unknown }) {
  if ('defaultValue' in field) return field.defaultValue
  if (field.kind === 'boolean') return false
  if (field.kind === 'number') return 0
  return ''
}

function seedRowsFromProp(
  tableName: string,
  table: LakebedSessionSchema[string],
  propValue: unknown,
) {
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
    if (table.seedFromProps === false) continue

    const existingValue = data[tableName]
    if (Array.isArray(existingValue)) continue
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
  children?: ReactNode
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

function lakebedSessionArgs({
  anonymousOwnerSecret,
  capsule,
  sessionId,
}: LakebedSessionContextValue & { capsule: string }) {
  return {
    ...(anonymousOwnerSecret === undefined ? {} : { anonymousOwnerSecret }),
    capsule,
    sessionId,
  }
}

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

/**
 * Safe wrapper around `useConvexQuery` that returns `undefined` when there is no
 * `ConvexProvider` in the React tree instead of throwing. Used by
 * `useOptionalSessionState` so previews/static paths can render without a Convex
 * client.
 */
function useOptionalConvexQuery(query: unknown, args: unknown): unknown {
  // `useConvex` is just `useContext(ConvexContext)` — returns `undefined` when
  // no provider is mounted, never throws. In test environments where
  // `convex/react` is mocked without `useConvex`, the import is `undefined`;
  // we guard for that too.
  const convex = typeof useConvex === 'function' ? useConvex() : undefined
  const [result, setResult] = useState<unknown>(undefined)
  const argsKey = typeof args === 'string' ? args : JSON.stringify(args)

  useEffect(() => {
    if (!convex || args === 'skip' || !query) {
      setResult(undefined)
      return
    }
    const watch = (
      convex as {
        watchQuery: (
          q: unknown,
          a: unknown,
        ) => {
          localResult: unknown
          onUpdate: (cb: () => void) => () => void
        }
      }
    ).watchQuery(query, args)
    const unsub = watch.onUpdate(() => {
      setResult(watch.localResult)
    })
    setResult(watch.localResult)
    return unsub
  }, [convex, query, argsKey])

  return result
}

export function useOptionalSessionState<TData extends JsonRecord = JsonRecord>(
  capsule: string,
): { auth: LakebedAuthContext | null; canWrite: boolean; data: TData | null } {
  const session = useOptionalLakebedSession()
  const state = useOptionalConvexQuery(
    lakebedApi?.getSessionState,
    session ? lakebedSessionArgs({ ...session, capsule }) : 'skip',
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
    async (patch) =>
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
    async (data) =>
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
  }, [data, enabled, mergeData, seedKey, seedPatch])
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
  ): LakebedMutationFunction<
    LakebedMutationsOf<NonNullable<TDefinition>>[TName]
  >
}

export function useKeyedLakebedMutation<
  TDefinition extends
    | ShipFastLakebedDefinition<any, any, any, any, any>
    | undefined,
  TName extends Extract<
    keyof LakebedMutationsOf<NonNullable<TDefinition>>,
    string
  >,
>(
  lakebed: LakebedClientRuntime<TDefinition>,
  name: TName,
): LakebedKeyedMutationFunction<
  LakebedMutationsOf<NonNullable<TDefinition>>[TName]
> {
  const mutation = lakebed.useMutation(name)
  const [pendingKeys, setPendingKeys] = useState<readonly string[]>([])
  const pendingKeySetRef = useRef(new Set<string>())
  const queuedKeySetRef = useRef(new Set<string>())

  const syncPendingKeys = useCallback(() => {
    setPendingKeys(Array.from(pendingKeySetRef.current))
  }, [])

  const run = useCallback(
    async (key, ...args) => {
      if (queuedKeySetRef.current.has(key)) return undefined

      queuedKeySetRef.current.add(key)
      try {
        if (typeof mutation.runWithLifecycle !== 'function') {
          pendingKeySetRef.current.add(key)
          syncPendingKeys()
          return await mutation(...args)
        }

        return await mutation.runWithLifecycle(
          {
            onExecutionEnd: () => {
              pendingKeySetRef.current.delete(key)
              syncPendingKeys()
            },
            onExecutionStart: () => {
              pendingKeySetRef.current.add(key)
              syncPendingKeys()
            },
          },
          ...args,
        )
      } finally {
        queuedKeySetRef.current.delete(key)
        pendingKeySetRef.current.delete(key)
        syncPendingKeys()
      }
    },
    [mutation, syncPendingKeys],
  )

  const isPending = useCallback(
    (key) => pendingKeys.includes(key),
    [pendingKeys],
  )

  const reset = useCallback(() => {
    queuedKeySetRef.current.clear()
    pendingKeySetRef.current.clear()
    syncPendingKeys()
    mutation.reset()
  }, [mutation, syncPendingKeys])
  const pendingKey = pendingKeys[0] ?? null

  return {
    hasPending: pendingKeys.length > 0,
    isPending,
    lastError: mutation.lastError,
    pendingKey,
    pendingKeys,
    reset,
    run,
  }
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
      const session = useLakebedSession()
      const [lastError, setLastError] = useState<unknown | null>(null)
      const [pendingCount, setPendingCount] = useState(0)
      const localAuth = useLakebedAuth()
      const state = useSessionState(capsule) as {
        auth: LakebedAuthContext | null
        canWrite: boolean
        data: LakebedDataOf<NonNullable<TDefinition>> | null
      }
      const data = state.data
      const auth = state.auth ?? localAuth
      const coordinator = useMemo(
        () =>
          mutationCoordinatorFor(
            mutationCoordinatorKey({ ...session, capsule }),
          ),
        [capsule, session],
      )
      useAutoSeedFromProps({
        capsule,
        data,
        definition,
        enabled: state.canWrite,
        props,
      })
      const setData =
        useMergeSessionData<LakebedDataOf<NonNullable<TDefinition>>>(capsule)
      const replaceData =
        useReplaceSessionData<LakebedDataOf<NonNullable<TDefinition>>>(capsule)
      const handler = definition?.mutations?.[name as string]

      useEffect(() => {
        if (data !== null) coordinator.data = data as JsonRecord
      }, [coordinator, data])

      type ActiveMutation = LakebedMutationsOf<
        NonNullable<TDefinition>
      >[typeof name]

      const runMutationWithLifecycle = useCallback(
        async (lifecycle, ...args) => {
          setLastError(null)

          if (!handler) {
            const error = new Error(
              `Lakebed mutation "${name}" is not defined for capsule "${capsule}"`,
            )
            setLastError(error)
            throw error
          }

          try {
            const executeMutation = async () => {
              lifecycle?.onExecutionStart?.()
              setPendingCount((count) => count + 1)
              try {
                const baseData = (coordinator.data ??
                  data ??
                  {}) as LakebedDataOf<NonNullable<TDefinition>>
                const rememberMergedData = async (patch) => {
                  const nextData = await setData(patch)
                  coordinator.data = nextData as JsonRecord
                  return nextData
                }
                const rememberReplacedData = async (nextData) => {
                  const replacedData = await replaceData(nextData)
                  coordinator.data = replacedData as JsonRecord
                  return replacedData
                }
                const { context, getPatch } = createLakebedHandlerContext({
                  auth,
                  data: baseData,
                  props,
                  replaceData: rememberReplacedData,
                  schema: definition?.schema,
                  setData: rememberMergedData,
                  writable: true,
                })
                const result = await handler(context, ...args)
                const patch = getPatch() as Partial<
                  LakebedDataOf<NonNullable<TDefinition>>
                >

                if (Object.keys(patch).length > 0) {
                  await rememberMergedData(patch)
                }

                return result
              } finally {
                setPendingCount((count) => Math.max(0, count - 1))
                lifecycle?.onExecutionEnd?.()
              }
            }

            const queuedMutation = coordinator.queue.then(
              executeMutation,
              executeMutation,
            )
            coordinator.queue = queuedMutation.then(
              () => undefined,
              () => undefined,
            )

            return await queuedMutation
          } catch (error) {
            setLastError(error)
            throw error
          }
        },
        [
          auth,
          capsule,
          coordinator,
          data,
          definition?.schema,
          handler,
          name,
          props,
          replaceData,
          setData,
        ],
      )

      const reset = useCallback(() => {
        setLastError(null)
      }, [])
      const mutation = useMemo(() => {
        const run = (...args) => runMutationWithLifecycle(undefined, ...args)
        const mutationState: Pick<
          LakebedMutationFunction<ActiveMutation>,
          | 'isPending'
          | 'lastError'
          | 'pendingCount'
          | 'reset'
          | 'runWithLifecycle'
        > = {
          isPending: false,
          lastError: null,
          pendingCount: 0,
          reset,
          runWithLifecycle: (lifecycle, ...args) =>
            runMutationWithLifecycle(lifecycle, ...args),
        }
        return Object.assign(run, mutationState)
      }, [reset, runMutationWithLifecycle])

      mutation.isPending = pendingCount > 0
      mutation.lastError = lastError
      mutation.pendingCount = pendingCount
      mutation.reset = reset

      return mutation
    },
  }
}
