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
import type * as brandfetch from "../brandfetch.js";
import type * as contentCache from "../contentCache.js";
import type * as customLanguages from "../customLanguages.js";
import type * as export_artifacts from "../export_artifacts.js";
import type * as generation from "../generation.js";
import type * as generationConfig from "../generationConfig.js";
import type * as github from "../github.js";
import type * as lakebed from "../lakebed.js";
import type * as lakebed_deploy from "../lakebed_deploy.js";
import type * as lib_disposable_email from "../lib/disposable_email.js";
import type * as lib_gallery_helpers from "../lib/gallery_helpers.js";
import type * as lib_openui_error_html from "../lib/openui_error_html.js";
import type * as lib_openui_handoff_html from "../lib/openui_handoff_html.js";
import type * as lib_referral_helpers from "../lib/referral_helpers.js";
import type * as lib_referral_qualification from "../lib/referral_qualification.js";
import type * as lib_session_access_helpers from "../lib/session_access_helpers.js";
import type * as lib_session_ai_capsule_helpers from "../lib/session_ai_capsule_helpers.js";
import type * as lib_session_api_response_helpers from "../lib/session_api_response_helpers.js";
import type * as lib_session_artifact_helpers from "../lib/session_artifact_helpers.js";
import type * as lib_session_clone_helpers from "../lib/session_clone_helpers.js";
import type * as lib_session_commerce_helpers from "../lib/session_commerce_helpers.js";
import type * as lib_session_creation_helpers from "../lib/session_creation_helpers.js";
import type * as lib_session_deployment_helpers from "../lib/session_deployment_helpers.js";
import type * as lib_session_edit_helpers from "../lib/session_edit_helpers.js";
import type * as lib_session_edit_mutation_helpers from "../lib/session_edit_mutation_helpers.js";
import type * as lib_session_event_stream_helpers from "../lib/session_event_stream_helpers.js";
import type * as lib_session_export_helpers from "../lib/session_export_helpers.js";
import type * as lib_session_fork_helpers from "../lib/session_fork_helpers.js";
import type * as lib_session_gallery_helpers from "../lib/session_gallery_helpers.js";
import type * as lib_session_generation_action_helpers from "../lib/session_generation_action_helpers.js";
import type * as lib_session_generation_progress_helpers from "../lib/session_generation_progress_helpers.js";
import type * as lib_session_generation_state_helpers from "../lib/session_generation_state_helpers.js";
import type * as lib_session_generation_view_helpers from "../lib/session_generation_view_helpers.js";
import type * as lib_session_internal_references from "../lib/session_internal_references.js";
import type * as lib_session_operational_notifications from "../lib/session_operational_notifications.js";
import type * as lib_session_preview_history_helpers from "../lib/session_preview_history_helpers.js";
import type * as lib_session_prompt_helpers from "../lib/session_prompt_helpers.js";
import type * as lib_session_public_preview_helpers from "../lib/session_public_preview_helpers.js";
import type * as lib_session_readiness_helpers from "../lib/session_readiness_helpers.js";
import type * as lib_session_section_edit_helpers from "../lib/session_section_edit_helpers.js";
import type * as lib_session_serialization_helpers from "../lib/session_serialization_helpers.js";
import type * as lib_session_task_helpers from "../lib/session_task_helpers.js";
import type * as lib_session_usage_metrics_helpers from "../lib/session_usage_metrics_helpers.js";
import type * as lib_session_user_image_helpers from "../lib/session_user_image_helpers.js";
import type * as lib_session_validators from "../lib/session_validators.js";
import type * as lib_session_workspace_helpers from "../lib/session_workspace_helpers.js";
import type * as referrals from "../referrals.js";
import type * as session_completion from "../session_completion.js";
import type * as sessions from "../sessions.js";
import type * as translationCache from "../translationCache.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  billing: typeof billing;
  brandfetch: typeof brandfetch;
  contentCache: typeof contentCache;
  customLanguages: typeof customLanguages;
  export_artifacts: typeof export_artifacts;
  generation: typeof generation;
  generationConfig: typeof generationConfig;
  github: typeof github;
  lakebed: typeof lakebed;
  lakebed_deploy: typeof lakebed_deploy;
  "lib/disposable_email": typeof lib_disposable_email;
  "lib/gallery_helpers": typeof lib_gallery_helpers;
  "lib/openui_error_html": typeof lib_openui_error_html;
  "lib/openui_handoff_html": typeof lib_openui_handoff_html;
  "lib/referral_helpers": typeof lib_referral_helpers;
  "lib/referral_qualification": typeof lib_referral_qualification;
  "lib/session_access_helpers": typeof lib_session_access_helpers;
  "lib/session_ai_capsule_helpers": typeof lib_session_ai_capsule_helpers;
  "lib/session_api_response_helpers": typeof lib_session_api_response_helpers;
  "lib/session_artifact_helpers": typeof lib_session_artifact_helpers;
  "lib/session_clone_helpers": typeof lib_session_clone_helpers;
  "lib/session_commerce_helpers": typeof lib_session_commerce_helpers;
  "lib/session_creation_helpers": typeof lib_session_creation_helpers;
  "lib/session_deployment_helpers": typeof lib_session_deployment_helpers;
  "lib/session_edit_helpers": typeof lib_session_edit_helpers;
  "lib/session_edit_mutation_helpers": typeof lib_session_edit_mutation_helpers;
  "lib/session_event_stream_helpers": typeof lib_session_event_stream_helpers;
  "lib/session_export_helpers": typeof lib_session_export_helpers;
  "lib/session_fork_helpers": typeof lib_session_fork_helpers;
  "lib/session_gallery_helpers": typeof lib_session_gallery_helpers;
  "lib/session_generation_action_helpers": typeof lib_session_generation_action_helpers;
  "lib/session_generation_progress_helpers": typeof lib_session_generation_progress_helpers;
  "lib/session_generation_state_helpers": typeof lib_session_generation_state_helpers;
  "lib/session_generation_view_helpers": typeof lib_session_generation_view_helpers;
  "lib/session_internal_references": typeof lib_session_internal_references;
  "lib/session_operational_notifications": typeof lib_session_operational_notifications;
  "lib/session_preview_history_helpers": typeof lib_session_preview_history_helpers;
  "lib/session_prompt_helpers": typeof lib_session_prompt_helpers;
  "lib/session_public_preview_helpers": typeof lib_session_public_preview_helpers;
  "lib/session_readiness_helpers": typeof lib_session_readiness_helpers;
  "lib/session_section_edit_helpers": typeof lib_session_section_edit_helpers;
  "lib/session_serialization_helpers": typeof lib_session_serialization_helpers;
  "lib/session_task_helpers": typeof lib_session_task_helpers;
  "lib/session_usage_metrics_helpers": typeof lib_session_usage_metrics_helpers;
  "lib/session_user_image_helpers": typeof lib_session_user_image_helpers;
  "lib/session_validators": typeof lib_session_validators;
  "lib/session_workspace_helpers": typeof lib_session_workspace_helpers;
  referrals: typeof referrals;
  session_completion: typeof session_completion;
  sessions: typeof sessions;
  translationCache: typeof translationCache;
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

export declare const components: {
  debouncer: import("@ikhrustalev/convex-debouncer/_generated/component.js").ComponentApi<"debouncer">;
};
