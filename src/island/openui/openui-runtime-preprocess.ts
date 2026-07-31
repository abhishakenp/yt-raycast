/**
 * Single source of truth: all preprocessing helpers and the pipeline live in
 * `@ship-fast/engine/lib/openui-preprocess.ts`. This module re-exports them so
 * existing imports (`preprocessOpenUIRuntimeResponse`, individual helpers used
 * by tests) keep working without duplicate implementations drifting apart.
 *
 * `preprocessOpenUIRuntimeResponse` is `preprocessOpenUIResponse` with
 * `resolveRefs: false` — the dashboard's live preview does not inline named
 * assignments (it renders the named form directly), which is the same behaviour
 * the SSR/export pipeline uses.
 */
import { preprocessOpenUIResponse } from '@ship-fast/engine/lib/openui-preprocess.ts'

export function preprocessOpenUIRuntimeResponse(source: string): string {
  return preprocessOpenUIResponse(source, { resolveRefs: false })
}

export {
  stripNullsFromArrays,
  sanitizePartialImages,
  repairMalformedQuotedObjectKeys,
  repairObjectNullArgumentBoundaries,
  balanceSegment,
  balanceStatements,
  balancePartial,
  forceGaplessSectionBandStack,
  stripActionCalls,
  transformOutsideQuotedStrings,
  fixNavbarLinksToMatchRoutes,
  fixSubPageHeroStacks,
} from '@ship-fast/engine/lib/openui-preprocess.ts'
