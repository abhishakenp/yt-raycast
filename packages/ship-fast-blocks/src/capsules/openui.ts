import {
  createLibrary as createOpenUILibrary,
  defineComponent as defineOpenUIComponent,
} from "@openuidev/react-lang"
import type * as LakebedClient from "lakebed/client"
import type * as LakebedServer from "lakebed/server"
import type * as OpenUI from "@openuidev/react-lang"
import type { z } from "zod/v4"
import type { $ZodObject } from "zod/v4/core"

export type LakebedClientModule = typeof LakebedClient
export type LakebedServerModule = typeof LakebedServer

export type LakebedCapsuleDefinition = {
  name: string
  schema?: Record<string, LakebedServer.TableDefinition>
  queries?: Record<string, ReturnType<typeof LakebedServer.query>>
  mutations?: Record<string, ReturnType<typeof LakebedServer.mutation>>
  endpoints?: Record<string, LakebedServer.EndpointDefinition>
}

export type LakebedServerFactory<TServer extends LakebedCapsuleDefinition = LakebedCapsuleDefinition> =
  () => TServer | Promise<TServer>

export type LakebedClientFactory<TResult = unknown> = () => TResult | Promise<TResult>

export type CapsuleLakebedConfig<
  TServer extends LakebedCapsuleDefinition = LakebedCapsuleDefinition,
  TClientResult = unknown,
> = {
  client?: LakebedClientFactory<TClientResult>
  server?: LakebedServerFactory<TServer>
}

export type DefineCapsuleInput<
  TProps extends $ZodObject = $ZodObject,
  TServer extends LakebedCapsuleDefinition = LakebedCapsuleDefinition,
  TClientResult = unknown,
> = {
  name: string
  props: TProps
  description: string
  component: OpenUI.ComponentRenderer<z.infer<TProps>>
  lakebed?: CapsuleLakebedConfig<TServer, TClientResult>
}

export type ShipFastCapsule<
  TClient extends OpenUI.DefinedComponent<any> = OpenUI.DefinedComponent<any>,
  TServer extends LakebedCapsuleDefinition = LakebedCapsuleDefinition,
  TClientResult = unknown,
> = {
  client: TClient
  lakebed?: CapsuleLakebedConfig<TServer, TClientResult>
}

export type CapsuleLibraryInput = {
  capsules: ShipFastCapsule[]
  root?: string
}

export const defineCapsule = <
  TProps extends $ZodObject,
  TServer extends LakebedCapsuleDefinition = LakebedCapsuleDefinition,
  TClientResult = unknown,
>(
  input: DefineCapsuleInput<TProps, TServer, TClientResult>,
): ShipFastCapsule<OpenUI.DefinedComponent<TProps>, TServer, TClientResult> => {
  const { lakebed, ...openUIInput } = input

  return {
    client: defineOpenUIComponent(openUIInput),
    ...(lakebed ? { lakebed } : {}),
  }
}

export const isCapsule = (value: unknown): value is ShipFastCapsule =>
  !!value &&
  typeof value === "object" &&
  "client" in value &&
  isDefinedComponent(value.client)

export const isDefinedComponent = (value: unknown): value is OpenUI.DefinedComponent<any> =>
  !!value &&
  typeof value === "object" &&
  "name" in value &&
  "props" in value &&
  "component" in value

export const createLibrary = ({ capsules, root }: CapsuleLibraryInput): OpenUI.Library =>
  createOpenUILibrary({
    components: capsules.map((capsule) => capsule.client),
    root: root ?? capsules[0]?.client.name,
  })
