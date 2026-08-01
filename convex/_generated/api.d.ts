/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as account from "../account.js";
import type * as billing from "../billing.js";
import type * as brandfetch from "../brandfetch.js";
import type * as commerce_operations from "../commerce_operations.js";
import type * as contentCache from "../contentCache.js";
import type * as crons from "../crons.js";
import type * as customLanguages from "../customLanguages.js";
import type * as exportRenderCache from "../exportRenderCache.js";
import type * as export_artifacts from "../export_artifacts.js";
import type * as gallery_preview_images from "../gallery_preview_images.js";
import type * as generationConfig from "../generationConfig.js";
import type * as github from "../github.js";
import type * as lakebed from "../lakebed.js";
import type * as lakebed_deploy from "../lakebed_deploy.js";
import type * as maintenance from "../maintenance.js";
import type * as lib_acquisition_attribution from "../lib/acquisition_attribution.js";
import type * as lib_billing_constants from "../lib/billing_constants.js";
import type * as lib_billing_generation_quota from "../lib/billing_generation_quota.js";
import type * as lib_commerce_operation_helpers from "../lib/commerce_operation_helpers.js";
import type * as lib_content_moderation_classifier from "../lib/content_moderation_classifier.js";
import type * as lib_content_moderation_policy from "../lib/content_moderation_policy.js";
import type * as lib_deployment_badge_helpers from "../lib/deployment_badge_helpers.js";
import type * as lib_disposable_email from "../lib/disposable_email.js";
import type * as lib_dub_outbox from "../lib/dub_outbox.js";
import type * as lib_edit_helpers from "../lib/edit_helpers.js";
import type * as lib_export_generator_revision from "../lib/export_generator_revision.js";
import type * as lib_export_progress_stages from "../lib/export_progress_stages.js";
import type * as lib_gallery_helpers from "../lib/gallery_helpers.js";
import type * as lib_openui_error_html from "../lib/openui_error_html.js";
import type * as lib_openui_handoff_html from "../lib/openui_handoff_html.js";
import type * as lib_preview_html_safety from "../lib/preview_html_safety.js";
import type * as lib_referral_helpers from "../lib/referral_helpers.js";
import type * as lib_referral_qualification from "../lib/referral_qualification.js";
import type * as lib_server_secret from "../lib/server_secret.js";
import type * as lib_session_access_helpers from "../lib/session_access_helpers.js";
import type * as lib_session_ai_capsule_helpers from "../lib/session_ai_capsule_helpers.js";
import type * as lib_session_api_response_helpers from "../lib/session_api_response_helpers.js";
import type * as lib_session_artifact_helpers from "../lib/session_artifact_helpers.js";
import type * as lib_session_clone_helpers from "../lib/session_clone_helpers.js";
import type * as lib_session_commerce_helpers from "../lib/session_commerce_helpers.js";
import type * as lib_session_creation_helpers from "../lib/session_creation_helpers.js";
import type * as lib_session_delete_helpers from "../lib/session_delete_helpers.js";
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
import type * as lib_session_translation_cache_helpers from "../lib/session_translation_cache_helpers.js";
import type * as lib_session_ttl_constants from "../lib/session_ttl_constants.js";
import type * as lib_session_usage_metrics_helpers from "../lib/session_usage_metrics_helpers.js";
import type * as lib_session_user_image_helpers from "../lib/session_user_image_helpers.js";
import type * as lib_session_validators from "../lib/session_validators.js";
import type * as lib_session_workspace_helpers from "../lib/session_workspace_helpers.js";
import type * as lib_slack_business_notifications from "../lib/slack_business_notifications.js";
import type * as lib_slack_notifications_shared from "../lib/slack_notifications_shared.js";
import type * as lib_testHelpers from "../lib/testHelpers.js";
import type * as lib_timingSafeEqual from "../lib/timingSafeEqual.js";
import type * as lib_translation_entitlement_helpers from "../lib/translation_entitlement_helpers.js";
import type * as linkforty from "../linkforty.js";
import type * as moderation from "../moderation.js";
import type * as openui_ssr_health from "../openui_ssr_health.js";
import type * as partners from "../partners.js";
import type * as partners_worker from "../partners_worker.js";
import type * as pollinations_image_cache from "../pollinations_image_cache.js";
import type * as referrals from "../referrals.js";
import type * as session_completion from "../session_completion.js";
import type * as sessions from "../sessions.js";
import type * as shareBonus from "../shareBonus.js";
import type * as translationCache from "../translationCache.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  account: typeof account;
  billing: typeof billing;
  brandfetch: typeof brandfetch;
  commerce_operations: typeof commerce_operations;
  contentCache: typeof contentCache;
  crons: typeof crons;
  customLanguages: typeof customLanguages;
  exportRenderCache: typeof exportRenderCache;
  export_artifacts: typeof export_artifacts;
  gallery_preview_images: typeof gallery_preview_images;
  generationConfig: typeof generationConfig;
  github: typeof github;
  lakebed: typeof lakebed;
  lakebed_deploy: typeof lakebed_deploy;
  maintenance: typeof maintenance;
  "lib/acquisition_attribution": typeof lib_acquisition_attribution;
  "lib/billing_constants": typeof lib_billing_constants;
  "lib/billing_generation_quota": typeof lib_billing_generation_quota;
  "lib/commerce_operation_helpers": typeof lib_commerce_operation_helpers;
  "lib/content_moderation_classifier": typeof lib_content_moderation_classifier;
  "lib/content_moderation_policy": typeof lib_content_moderation_policy;
  "lib/deployment_badge_helpers": typeof lib_deployment_badge_helpers;
  "lib/disposable_email": typeof lib_disposable_email;
  "lib/dub_outbox": typeof lib_dub_outbox;
  "lib/edit_helpers": typeof lib_edit_helpers;
  "lib/export_generator_revision": typeof lib_export_generator_revision;
  "lib/export_progress_stages": typeof lib_export_progress_stages;
  "lib/gallery_helpers": typeof lib_gallery_helpers;
  "lib/openui_error_html": typeof lib_openui_error_html;
  "lib/openui_handoff_html": typeof lib_openui_handoff_html;
  "lib/preview_html_safety": typeof lib_preview_html_safety;
  "lib/referral_helpers": typeof lib_referral_helpers;
  "lib/referral_qualification": typeof lib_referral_qualification;
  "lib/server_secret": typeof lib_server_secret;
  "lib/session_access_helpers": typeof lib_session_access_helpers;
  "lib/session_ai_capsule_helpers": typeof lib_session_ai_capsule_helpers;
  "lib/session_api_response_helpers": typeof lib_session_api_response_helpers;
  "lib/session_artifact_helpers": typeof lib_session_artifact_helpers;
  "lib/session_clone_helpers": typeof lib_session_clone_helpers;
  "lib/session_commerce_helpers": typeof lib_session_commerce_helpers;
  "lib/session_creation_helpers": typeof lib_session_creation_helpers;
  "lib/session_delete_helpers": typeof lib_session_delete_helpers;
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
  "lib/session_translation_cache_helpers": typeof lib_session_translation_cache_helpers;
  "lib/session_ttl_constants": typeof lib_session_ttl_constants;
  "lib/session_usage_metrics_helpers": typeof lib_session_usage_metrics_helpers;
  "lib/session_user_image_helpers": typeof lib_session_user_image_helpers;
  "lib/session_validators": typeof lib_session_validators;
  "lib/session_workspace_helpers": typeof lib_session_workspace_helpers;
  "lib/slack_business_notifications": typeof lib_slack_business_notifications;
  "lib/slack_notifications_shared": typeof lib_slack_notifications_shared;
  "lib/testHelpers": typeof lib_testHelpers;
  "lib/timingSafeEqual": typeof lib_timingSafeEqual;
  "lib/translation_entitlement_helpers": typeof lib_translation_entitlement_helpers;
  linkforty: typeof linkforty;
  moderation: typeof moderation;
  openui_ssr_health: typeof openui_ssr_health;
  partners: typeof partners;
  partners_worker: typeof partners_worker;
  pollinations_image_cache: typeof pollinations_image_cache;
  referrals: typeof referrals;
  session_completion: typeof session_completion;
  sessions: typeof sessions;
  shareBonus: typeof shareBonus;
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
