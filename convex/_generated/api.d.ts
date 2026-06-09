/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as sessions from '../sessions.js'
import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from 'convex/server'

declare const fullApi: ApiFromModules<{
  sessions: typeof sessions
}>

export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, 'public'>
>
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, 'internal'>
>
export declare const components: {}
