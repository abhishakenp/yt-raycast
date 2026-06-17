/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as billing from "../billing.js";
import type * as generation from "../generation.js";
import type * as generationConfig from "../generationConfig.js";
import type * as lakebed from "../lakebed.js";
import type * as lib_chat_refinement_helpers from "../lib/chat_refinement_helpers.js";
import type * as lib_cms_helpers from "../lib/cms_helpers.js";
import type * as lib_gallery_helpers from "../lib/gallery_helpers.js";
import type * as sessions from "../sessions.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  billing: typeof billing;
  generation: typeof generation;
  generationConfig: typeof generationConfig;
  lakebed: typeof lakebed;
  "lib/chat_refinement_helpers": typeof lib_chat_refinement_helpers;
  "lib/cms_helpers": typeof lib_cms_helpers;
  "lib/gallery_helpers": typeof lib_gallery_helpers;
  sessions: typeof sessions;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
