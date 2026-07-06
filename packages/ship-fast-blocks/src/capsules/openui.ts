import {
  createLibrary as createOpenUILibrary,
  defineComponent as defineOpenUIComponent,
} from '@openuidev/react-lang'
import { createLakebedClient } from '@ship-fast/lakebed/react'
import type { LakebedClientRuntime } from '@ship-fast/lakebed/react'
import { mutation, query } from '@ship-fast/lakebed/server'
import type {
  JsonRecord,
  LakebedDataFromSchema,
  LakebedMutationMap,
  LakebedQueryMap,
  LakebedSessionSchema,
  ShipFastLakebedDefinition,
} from '@ship-fast/lakebed/server'
import type * as OpenUI from '@openuidev/react-lang'
import type { z } from 'zod/v4'
import type { $ZodObject } from 'zod/v4/core'
import { Children, cloneElement, createElement, isValidElement } from 'react'
import type { ReactElement, ReactNode } from 'react'
import { sanitizeProps } from './sanitize-props.ts'

export type LakebedCapsuleDefinition<
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
> = ShipFastLakebedDefinition<TProps, TSchema, TData, TQueries, TMutations>

export type LakebedServerFactory<TServer = LakebedCapsuleDefinition> = () =>
  | TServer
  | Promise<TServer>

export type LakebedClientFactory<TResult = unknown> = () =>
  | TResult
  | Promise<TResult>

export type CapsuleLakebedConfig<
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
  TClientResult = unknown,
> = LakebedCapsuleDefinition<TProps, TSchema, TData, TQueries, TMutations> & {
  client?: LakebedClientFactory<TClientResult>
  /** Optional shared Lakebed document key for cross-section state like Cart. */
  dataKey?: string
  server?: LakebedServerFactory<
    LakebedCapsuleDefinition<TProps, TSchema, TData, TQueries, TMutations>
  >
}

export type CapsuleComponentRenderer<
  TProps,
  TLakebed extends
    | CapsuleLakebedConfig<TProps, any, any, any, any, any>
    | undefined,
> = (
  input: OpenUI.ComponentRenderProps<TProps> & {
    lakebed: LakebedClientRuntime<TLakebed>
  },
) => ReturnType<OpenUI.ComponentRenderer<TProps>>

export type DefineCapsuleInput<
  TProps extends $ZodObject = $ZodObject,
  TSchema extends LakebedSessionSchema | undefined =
    | LakebedSessionSchema
    | undefined,
  TData extends JsonRecord = LakebedDataFromSchema<TSchema>,
  TQueries extends LakebedQueryMap<z.infer<TProps>, TData> = LakebedQueryMap<
    z.infer<TProps>,
    TData
  >,
  TMutations extends LakebedMutationMap<z.infer<TProps>, TData> =
    LakebedMutationMap<z.infer<TProps>, TData>,
  TClientResult = unknown,
> = {
  name: string
  props: TProps
  description: string
  component: CapsuleComponentRenderer<
    z.infer<TProps>,
    | CapsuleLakebedConfig<
        z.infer<TProps>,
        TSchema,
        TData,
        TQueries,
        TMutations,
        TClientResult
      >
    | undefined
  >
  lakebed?: CapsuleLakebedConfig<
    z.infer<TProps>,
    TSchema,
    TData,
    TQueries,
    TMutations,
    TClientResult
  >
}

export type ShipFastCapsule<
  TClient extends OpenUI.DefinedComponent<any> = OpenUI.DefinedComponent<any>,
  TServer extends CapsuleLakebedConfig<any, any, any, any, any, any> =
    CapsuleLakebedConfig<any, any, any, any, any, any>,
  TClientResult = unknown,
> = {
  client: TClient
  lakebed?: TServer &
    CapsuleLakebedConfig<any, any, any, any, any, TClientResult>
} & TClient

export type CapsuleLibraryInput = {
  capsules: ShipFastCapsule[]
  root?: string
}

const isJsonRecord = (value: unknown): value is JsonRecord =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value)

const defaultCapsuleDataKey = (
  capsuleName: string,
  statementId: string | undefined,
) => (statementId ? `${capsuleName}:${statementId}` : capsuleName)

const sanitizeGeneratedCapsuleOutput = (output: ReactNode): ReactNode => {
  if (!isValidElement(output)) return output

  const element = output as ReactElement<Record<string, unknown>>
  const existing = (element.props ?? {}) as Record<string, unknown>
  const nextProps = { ...existing }
  const hasChildren = Object.prototype.hasOwnProperty.call(existing, 'children')

  if (Object.prototype.hasOwnProperty.call(nextProps, 'contentEditable')) {
    nextProps.contentEditable = undefined
  }
  if (
    Object.prototype.hasOwnProperty.call(
      nextProps,
      'suppressContentEditableWarning',
    )
  ) {
    nextProps.suppressContentEditableWarning = undefined
  }

  if (hasChildren) {
    const children = existing.children as ReactNode
    const nextChildren = Array.isArray(children)
      ? Children.map(children, sanitizeGeneratedCapsuleOutput)
      : sanitizeGeneratedCapsuleOutput(children)
    delete nextProps.children
    return cloneElement(element, nextProps, nextChildren)
  }

  return cloneElement(element, nextProps)
}

/**
 * Stamp `data-openui-component` (capsule name) and `data-openui-var` (source
 * variable name) on the root element of a capsule's rendered output so the
 * element inspector can map a selected DOM node back to its OpenUI capsule.
 *
 * If the output is a single React element, we clone it with the data attrs
 * merged onto its existing props (preserving any className/style the capsule
 * set). If it's a fragment, string, array, or null, we wrap it in a `<div>`
 * carrying the attrs so the marker is always present on a stable root.
 */
const stampCapsuleAttrs = (
  output: ReactNode,
  capsuleName: string,
  statementId: string | undefined,
): ReactNode => {
  const safeOutput = sanitizeGeneratedCapsuleOutput(output)
  if (isValidElement(safeOutput)) {
    const element = safeOutput as ReactElement<Record<string, unknown>>
    const existing = (element.props ?? {}) as Record<string, unknown>
    return cloneElement(element, {
      ...existing,
      'data-openui-component': capsuleName,
      'data-openui-var': statementId,
    })
  }
  return cloneElement(
    createElement('div', {
      'data-openui-component': capsuleName,
      'data-openui-var': statementId,
    }),
    undefined,
    safeOutput,
  )
}

const createDefaultCapsuleLakebed = <
  TProps extends JsonRecord,
>(): CapsuleLakebedConfig<TProps, undefined, JsonRecord> => ({
  queries: {
    sectionData: query((_ctx) => _ctx.data),
    sectionProps: query((_ctx) => ({
      ...(isJsonRecord(_ctx.props) ? _ctx.props : {}),
      ..._ctx.data,
    })),
  },
  mutations: {
    patchSectionProps: mutation((_ctx, patch: JsonRecord) =>
      _ctx.setData(isJsonRecord(patch) ? patch : {}),
    ),
    replaceSectionProps: mutation((_ctx, data: JsonRecord) =>
      _ctx.replaceData(isJsonRecord(data) ? data : {}),
    ),
    setProp: mutation((_ctx, key: string, value: unknown) =>
      _ctx.setData({ [key]: value }),
    ),
    appendItem: mutation((_ctx, key: string, value: unknown) => {
      const props: JsonRecord = isJsonRecord(_ctx.props) ? _ctx.props : {}
      const currentValue = _ctx.data[key] ?? props[key]
      const currentItems = Array.isArray(currentValue) ? currentValue : []
      return _ctx.setData({ [key]: [...currentItems, value] })
    }),
  },
})

export const defineCapsule = <
  TProps extends $ZodObject,
  TSchema extends LakebedSessionSchema | undefined =
    | LakebedSessionSchema
    | undefined,
  TData extends JsonRecord = LakebedDataFromSchema<TSchema>,
  TQueries extends LakebedQueryMap<z.infer<TProps>, TData> = LakebedQueryMap<
    z.infer<TProps>,
    TData
  >,
  TMutations extends LakebedMutationMap<z.infer<TProps>, TData> =
    LakebedMutationMap<z.infer<TProps>, TData>,
  TClientResult = unknown,
>(
  input: DefineCapsuleInput<
    TProps,
    TSchema,
    TData,
    TQueries,
    TMutations,
    TClientResult
  >,
): ShipFastCapsule<
  OpenUI.DefinedComponent<TProps>,
  CapsuleLakebedConfig<
    z.infer<TProps>,
    TSchema,
    TData,
    TQueries,
    TMutations,
    TClientResult
  >,
  TClientResult
> => {
  const { component, lakebed, ...openUIInput } = input
  const defaultLakebed = createDefaultCapsuleLakebed<z.infer<TProps>>()
  const effectiveLakebed = (
    lakebed
      ? {
          ...lakebed,
          mutations: {
            ...defaultLakebed.mutations,
            ...lakebed.mutations,
          },
          queries: {
            ...defaultLakebed.queries,
            ...lakebed.queries,
          },
        }
      : defaultLakebed
  ) as CapsuleLakebedConfig<
    z.infer<TProps>,
    TSchema,
    TData,
    TQueries,
    TMutations,
    TClientResult
  >

  const client = defineOpenUIComponent({
    ...openUIInput,
    component: (componentInput) => {
      // Best-effort repair of LLM-generated props against the declared schema
      // (drop unrepairable nested items / null arrays, coerce scalars) so a
      // single malformed value can't throw inside React and blank the whole
      // page during SSR. Generic across every capsule -- never name-specific.
      const safeProps = sanitizeProps(componentInput.props, input.props)
      const rendered = component({
        ...componentInput,
        props: safeProps,
        lakebed: createLakebedClient({
          capsule:
            effectiveLakebed.dataKey ??
            defaultCapsuleDataKey(input.name, componentInput.statementId),
          definition: effectiveLakebed,
          props: safeProps,
        }),
      })
      // Stamp capsule identification attrs on the root element so the element
      // inspector can map a selected DOM node back to its OpenUI capsule.
      if (rendered instanceof Promise) {
        return rendered.then((resolved) =>
          stampCapsuleAttrs(resolved, input.name, componentInput.statementId),
        )
      }
      return stampCapsuleAttrs(rendered, input.name, componentInput.statementId)
    },
  })

  return Object.assign(
    {
      client,
      lakebed: effectiveLakebed,
    },
    client,
  )
}

/**
 * Wrap a capsule component renderer so its renderer receives a Lakebed client
 * runtime built from the supplied Lakebed definition. This is the same wiring
 * `defineCapsule` applies internally; extracted here so it can be reused to
 * add Lakebed client wiring to an arbitrary component renderer.
 */
export const withLakebed = <
  TProps extends JsonRecord = JsonRecord,
  TLakebed extends
    | CapsuleLakebedConfig<TProps, any, any, any, any, any>
    | undefined =
    | CapsuleLakebedConfig<TProps, any, any, any, any, any>
    | undefined,
>(
  renderer: CapsuleComponentRenderer<TProps, TLakebed>,
  lakebed: TLakebed,
  capsuleName: string,
): CapsuleComponentRenderer<TProps, TLakebed> => {
  const defaultLakebed = createDefaultCapsuleLakebed<TProps>()
  const effectiveLakebed = (
    lakebed
      ? {
          ...lakebed,
          mutations: {
            ...defaultLakebed.mutations,
            ...lakebed.mutations,
          },
          queries: {
            ...defaultLakebed.queries,
            ...lakebed.queries,
          },
        }
      : defaultLakebed
  ) as CapsuleLakebedConfig<TProps, any, any, any, any, any>

  return (input) =>
    renderer({
      ...input,
      lakebed: createLakebedClient({
        capsule:
          effectiveLakebed.dataKey ??
          defaultCapsuleDataKey(capsuleName, input.statementId),
        definition: effectiveLakebed,
        props: input.props,
      }) as LakebedClientRuntime<TLakebed>,
    }) as ReturnType<CapsuleComponentRenderer<TProps, TLakebed>>
}

export const isCapsule = (value: unknown): value is ShipFastCapsule =>
  !!value &&
  typeof value === 'object' &&
  'client' in value &&
  isDefinedComponent(value.client)

export const isDefinedComponent = (
  value: unknown,
): value is OpenUI.DefinedComponent<any> =>
  !!value &&
  typeof value === 'object' &&
  'name' in value &&
  'props' in value &&
  'component' in value

export const createLibrary = ({
  capsules,
  root,
}: CapsuleLibraryInput): OpenUI.Library =>
  createOpenUILibrary({
    components: capsules.map((capsule) => capsule.client),
    root: root ?? capsules[0]?.client.name,
  })
