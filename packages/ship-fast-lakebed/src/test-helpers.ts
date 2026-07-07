/**
 * Test helpers for creating properly-typed Lakebed client stubs.
 *
 * The generic method signatures on `LakebedClientRuntime` (`useQuery`/`useMutation`)
 * use distributive conditional return types that cannot be implemented with a
 * simple `if/else` function — TypeScript cannot narrow a generic type parameter
 * via string literal comparisons. These helpers bridge that gap by accepting
 * per-key implementations as a mapped object and returning a correctly-typed
 * generic function, with no type assertions.
 */

import type { LakebedMutationFunction } from './react.tsx'
import type {
  LakebedMutationsOf,
  LakebedQueriesOf,
  ShipFastLakebedDefinition,
} from './server.ts'

type QueryResult<TQuery> = TQuery extends (
  ...args: infer _TArgs
) => infer TResult
  ? TResult
  : never

/**
 * Create a `useQuery` stub from per-query-name implementations.
 *
 * Each key in `impls` corresponds to a query name in the lakebed definition.
 * The returned function has the same generic signature as
 * `LakebedClientRuntime['useQuery']`, so it can be used in mock objects that
 * need to satisfy `LakebedClientRuntime<TDefinition>`.
 *
 * No type assertions are used — the mapped type `{ [K in ...]: () =>
 * QueryResult<T[K]> | null }` provides correct generic indexing when the
 * returned function is called with a specific key.
 */
export function createLakebedQueryStub<
  TDefinition extends ShipFastLakebedDefinition<any, any, any, any, any>,
>(impls: {
  [K in Extract<
    keyof LakebedQueriesOf<TDefinition>,
    string
  >]: () => QueryResult<LakebedQueriesOf<TDefinition>[K]> | null
}): <K extends Extract<keyof LakebedQueriesOf<TDefinition>, string>>(
  name: K,
) => QueryResult<LakebedQueriesOf<TDefinition>[K]> | null {
  return function <
    K extends Extract<keyof LakebedQueriesOf<TDefinition>, string>,
  >(name: K): QueryResult<LakebedQueriesOf<TDefinition>[K]> | null {
    return impls[name]()
  }
}

/**
 * Create a `useMutation` stub from per-mutation-name implementations.
 *
 * Each key in `impls` corresponds to a mutation name in the lakebed definition.
 * The returned function has the same generic signature as
 * `LakebedClientRuntime['useMutation']`.
 */
export function createLakebedMutationStub<
  TDefinition extends ShipFastLakebedDefinition<any, any, any, any, any>,
>(impls: {
  [K in Extract<
    keyof LakebedMutationsOf<TDefinition>,
    string
  >]: () => LakebedMutationFunction<LakebedMutationsOf<TDefinition>[K]>
}): <K extends Extract<keyof LakebedMutationsOf<TDefinition>, string>>(
  name: K,
) => LakebedMutationFunction<LakebedMutationsOf<TDefinition>[K]> {
  return function <
    K extends Extract<keyof LakebedMutationsOf<TDefinition>, string>,
  >(name: K): LakebedMutationFunction<LakebedMutationsOf<TDefinition>[K]> {
    return impls[name]()
  }
}

/**
 * Create a complete `LakebedClientRuntime` stub from per-query and
 * per-mutation implementations plus auth/data stubs.
 *
 * This is the recommended way to create lakebed mocks in tests. It avoids the
 * generic-method implementation problem entirely — tests provide per-key
 * implementations as plain objects, and the helpers return correctly-typed
 * generic functions.
 */
export function createLakebedRuntimeStub<
  TDefinition extends ShipFastLakebedDefinition<any, any, any, any, any>,
>(options: {
  queries: {
    [K in Extract<
      keyof LakebedQueriesOf<TDefinition>,
      string
    >]: () => QueryResult<LakebedQueriesOf<TDefinition>[K]> | null
  }
  mutations: {
    [K in Extract<
      keyof LakebedMutationsOf<TDefinition>,
      string
    >]: () => LakebedMutationFunction<LakebedMutationsOf<TDefinition>[K]>
  }
  useAuth: () => unknown
  useData?: () => unknown
  signInWithGoogle?: () => Promise<unknown>
  signOut?: () => void
}) {
  return {
    signInWithGoogle: options.signInWithGoogle ?? (async () => ({})),
    signOut: options.signOut ?? (() => {}),
    useAuth: options.useAuth,
    useData: options.useData ?? (() => null),
    useQuery: createLakebedQueryStub<TDefinition>(options.queries),
    useMutation: createLakebedMutationStub<TDefinition>(options.mutations),
  }
}
