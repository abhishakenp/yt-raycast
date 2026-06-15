import {
  createLibrary as createOpenUILibrary,
  defineComponent as defineOpenUIComponent,
} from '@openuidev/react-lang'
import { createLakebedClient } from '@ship-fast/lakebed/react'
import type { LakebedClientRuntime } from '@ship-fast/lakebed/react'
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
}

export type CapsuleLibraryInput = {
  capsules: ShipFastCapsule[]
  root?: string
}

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

  return {
    client: defineOpenUIComponent({
      ...openUIInput,
      component: (componentInput) => {
        // Best-effort repair of LLM-generated props against the declared schema
        // (drop unrepairable nested items / null arrays, coerce scalars) so a
        // single malformed value can't throw inside React and blank the whole
        // page during SSR. Generic across every capsule — never name-specific.
        const safeProps = sanitizeProps(componentInput.props, input.props)
        return component({
          ...componentInput,
          props: safeProps,
          lakebed: createLakebedClient({
            capsule: input.name,
            definition: lakebed,
            props: safeProps,
          }),
        })
      },
    }),
    ...(lakebed ? { lakebed } : {}),
  }
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
