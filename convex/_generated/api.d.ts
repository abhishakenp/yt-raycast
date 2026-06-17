/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as billing from '../billing.js'
import type * as generation from '../generation.js'
import type * as generationConfig from '../generationConfig.js'
import type * as lakebed from '../lakebed.js'
import type * as lib_chat_refinement_helpers from '../lib/chat_refinement_helpers.js'
import type * as lib_cms_helpers from '../lib/cms_helpers.js'
import type * as lib_gallery_helpers from '../lib/gallery_helpers.js'
import type * as lib_session_access_helpers from '../lib/session_access_helpers.js'
import type * as lib_session_agentation_helpers from '../lib/session_agentation_helpers.js'
import type * as lib_session_api_response_helpers from '../lib/session_api_response_helpers.js'
import type * as lib_session_artifact_helpers from '../lib/session_artifact_helpers.js'
import type * as lib_session_chat_helpers from '../lib/session_chat_helpers.js'
import type * as lib_session_cms_binding_helpers from '../lib/session_cms_binding_helpers.js'
import type * as lib_session_commerce_helpers from '../lib/session_commerce_helpers.js'
import type * as lib_session_creation_helpers from '../lib/session_creation_helpers.js'
import type * as lib_session_deployment_helpers from '../lib/session_deployment_helpers.js'
import type * as lib_session_edit_helpers from '../lib/session_edit_helpers.js'
import type * as lib_session_edit_mutation_helpers from '../lib/session_edit_mutation_helpers.js'
import type * as lib_session_event_stream_helpers from '../lib/session_event_stream_helpers.js'
import type * as lib_session_export_helpers from '../lib/session_export_helpers.js'
import type * as lib_session_fork_helpers from '../lib/session_fork_helpers.js'
import type * as lib_session_gallery_helpers from '../lib/session_gallery_helpers.js'
import type * as lib_session_generation_action_helpers from '../lib/session_generation_action_helpers.js'
import type * as lib_session_generation_progress_helpers from '../lib/session_generation_progress_helpers.js'
import type * as lib_session_generation_state_helpers from '../lib/session_generation_state_helpers.js'
import type * as lib_session_generation_view_helpers from '../lib/session_generation_view_helpers.js'
import type * as lib_session_internal_references from '../lib/session_internal_references.js'
import type * as lib_session_operational_notifications from '../lib/session_operational_notifications.js'
import type * as lib_session_preview_history_helpers from '../lib/session_preview_history_helpers.js'
import type * as lib_session_prompt_helpers from '../lib/session_prompt_helpers.js'
import type * as lib_session_public_preview_helpers from '../lib/session_public_preview_helpers.js'
import type * as lib_session_readiness_helpers from '../lib/session_readiness_helpers.js'
import type * as lib_session_serialization_helpers from '../lib/session_serialization_helpers.js'
import type * as lib_session_task_helpers from '../lib/session_task_helpers.js'
import type * as lib_session_usage_metrics_helpers from '../lib/session_usage_metrics_helpers.js'
import type * as lib_session_validators from '../lib/session_validators.js'
import type * as lib_session_workspace_helpers from '../lib/session_workspace_helpers.js'
import type * as session_completion from '../session_completion.js'
import type * as sessions from '../sessions.js'

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from 'convex/server'

declare const fullApi: ApiFromModules<{
  billing: typeof billing
  generation: typeof generation
  generationConfig: typeof generationConfig
  lakebed: typeof lakebed
  'lib/chat_refinement_helpers': typeof lib_chat_refinement_helpers
  'lib/cms_helpers': typeof lib_cms_helpers
  'lib/gallery_helpers': typeof lib_gallery_helpers
  'lib/session_access_helpers': typeof lib_session_access_helpers
  'lib/session_agentation_helpers': typeof lib_session_agentation_helpers
  'lib/session_api_response_helpers': typeof lib_session_api_response_helpers
  'lib/session_artifact_helpers': typeof lib_session_artifact_helpers
  'lib/session_chat_helpers': typeof lib_session_chat_helpers
  'lib/session_cms_binding_helpers': typeof lib_session_cms_binding_helpers
  'lib/session_commerce_helpers': typeof lib_session_commerce_helpers
  'lib/session_creation_helpers': typeof lib_session_creation_helpers
  'lib/session_deployment_helpers': typeof lib_session_deployment_helpers
  'lib/session_edit_helpers': typeof lib_session_edit_helpers
  'lib/session_edit_mutation_helpers': typeof lib_session_edit_mutation_helpers
  'lib/session_event_stream_helpers': typeof lib_session_event_stream_helpers
  'lib/session_export_helpers': typeof lib_session_export_helpers
  'lib/session_fork_helpers': typeof lib_session_fork_helpers
  'lib/session_gallery_helpers': typeof lib_session_gallery_helpers
  'lib/session_generation_action_helpers': typeof lib_session_generation_action_helpers
  'lib/session_generation_progress_helpers': typeof lib_session_generation_progress_helpers
  'lib/session_generation_state_helpers': typeof lib_session_generation_state_helpers
  'lib/session_generation_view_helpers': typeof lib_session_generation_view_helpers
  'lib/session_internal_references': typeof lib_session_internal_references
  'lib/session_operational_notifications': typeof lib_session_operational_notifications
  'lib/session_preview_history_helpers': typeof lib_session_preview_history_helpers
  'lib/session_prompt_helpers': typeof lib_session_prompt_helpers
  'lib/session_public_preview_helpers': typeof lib_session_public_preview_helpers
  'lib/session_readiness_helpers': typeof lib_session_readiness_helpers
  'lib/session_serialization_helpers': typeof lib_session_serialization_helpers
  'lib/session_task_helpers': typeof lib_session_task_helpers
  'lib/session_usage_metrics_helpers': typeof lib_session_usage_metrics_helpers
  'lib/session_validators': typeof lib_session_validators
  'lib/session_workspace_helpers': typeof lib_session_workspace_helpers
  session_completion: typeof session_completion
  sessions: typeof sessions
}>

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
  FunctionReference<any, 'public'>
>

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
  FunctionReference<any, 'internal'>
>

export declare const components: {}
