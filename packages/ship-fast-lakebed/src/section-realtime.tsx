import { createElement, useEffect, useMemo, useRef } from 'react'
import type { ComponentType } from 'react'

import {
  useMergeSessionData,
  useOptionalLakebedSession,
  useSessionState,
} from './react.tsx'
import type { JsonRecord } from './server.ts'

/**
 * The render props every OpenUI component receives from the react-lang runtime.
 * Mirrors `@openuidev/react-lang`'s `ComponentRenderProps` without importing it
 * here (lakebed must not depend on the renderer package). `statementId` is the
 * source variable name from the generated program (e.g. `home_hero`) and is the
 * stable per-section identifier we key realtime data on. It is `undefined` for
 * inline / nested elements.
 */
export type SectionRenderProps = {
  props: JsonRecord
  renderNode?: unknown
  statementId?: string
}

export type SectionRenderer = ComponentType<SectionRenderProps>

/**
 * Reserved keys that the lakebed seed pipeline stamps onto rows. They are not
 * section props and must never be merged back into the component props.
 */
const RESERVED_DATA_KEYS = new Set([
  '_id',
  '_key',
  'id',
  'createdAt',
  'updatedAt',
])

const isPlainRecord = (value: unknown): value is JsonRecord =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value)

/**
 * Build the seed patch for a section: one top-level key per generated prop.
 * Only seeds keys that are absent from the live data so admin overrides are
 * never clobbered. Storing each prop as its own key (rather than a single blob)
 * lets the generic admin panel introspect scalars as editable `value` tables
 * and arrays (e.g. `stats`) as editable `array` tables with zero panel changes.
 */
export const buildSectionSeedPatch = (
  generatedProps: JsonRecord,
  liveData: JsonRecord | null,
): JsonRecord => {
  const patch: JsonRecord = {}
  for (const [key, value] of Object.entries(generatedProps)) {
    if (RESERVED_DATA_KEYS.has(key)) continue
    if (value === undefined) continue
    if (liveData && key in liveData) continue
    patch[key] = value
  }
  return patch
}

/**
 * Merge live (admin-edited) section data over the generated props. Live values
 * win; reserved bookkeeping keys are dropped. Generated props that were never
 * persisted (e.g. defaulted-undefined) still pass through from `generatedProps`.
 */
export const mergeSectionProps = (
  generatedProps: JsonRecord,
  liveData: JsonRecord | null,
): JsonRecord => {
  if (!liveData) return generatedProps
  const merged: JsonRecord = { ...generatedProps }
  for (const [key, value] of Object.entries(liveData)) {
    if (RESERVED_DATA_KEYS.has(key)) continue
    merged[key] = value
  }
  return merged
}

/**
 * Wrap a STATIC section renderer so that, when composed into a page and rendered
 * inside a `LakebedSessionProvider`, it becomes realtime + admin-editable:
 *
 *  - on first mount it seeds `sessionData[statementId]` from its generated props,
 *  - it reads live `sessionData[statementId]` and renders the static component
 *    with props merged from that data, so admin edits re-render it live.
 *
 * The static section component is never modified. When there is no session
 * context (SSR / static export / preview without a session) or no `statementId`
 * (inline / nested element), it renders the static component unchanged.
 *
 * `capsuleName` is the component's registered name; it is combined with
 * `statementId` so two pages that reuse the same variable name keep independent
 * realtime state.
 */
export function withSectionRealtime(
  Section: SectionRenderer,
  capsuleName: string,
): SectionRenderer {
  function SectionRealtime(renderProps: SectionRenderProps) {
    const session = useOptionalLakebedSession()
    const statementId = renderProps.statementId

    if (!session || !statementId) {
      return createElement(Section, renderProps)
    }

    return createElement(SectionRealtimeInner, {
      ...renderProps,
      Section,
      capsuleName,
      sectionId: statementId,
    })
  }

  SectionRealtime.displayName = `SectionRealtime(${capsuleName})`
  return SectionRealtime
}

type SectionRealtimeInnerProps = SectionRenderProps & {
  Section: SectionRenderer
  capsuleName: string
  sectionId: string
}

function SectionRealtimeInner({
  Section,
  capsuleName,
  sectionId,
  ...renderProps
}: SectionRealtimeInnerProps) {
  // One lakebed document per (capsule name + section id) so the same section
  // role on two pages never shares state.
  const lakebedKey = `${capsuleName}:${sectionId}`
  const generatedProps = isPlainRecord(renderProps.props)
    ? renderProps.props
    : {}

  const { canWrite, data } = useSessionState<JsonRecord>(lakebedKey)
  const mergeData = useMergeSessionData<JsonRecord>(lakebedKey)
  const seededKey = useRef<string | null>(null)

  const seedPatch = useMemo(
    () => buildSectionSeedPatch(generatedProps, data),
    [generatedProps, data],
  )
  const seedKey = useMemo(() => JSON.stringify(seedPatch), [seedPatch])

  useEffect(() => {
    if (
      !canWrite ||
      data === null ||
      seedKey === '{}' ||
      seededKey.current === seedKey
    ) {
      return
    }
    seededKey.current = seedKey
    void mergeData(seedPatch)
  }, [canWrite, data, mergeData, seedKey, seedPatch])

  const mergedProps = useMemo(
    () => mergeSectionProps(generatedProps, data),
    [generatedProps, data],
  )

  return createElement(Section, { ...renderProps, props: mergedProps })
}
