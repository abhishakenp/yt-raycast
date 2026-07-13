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
const UNSAFE_DATA_KEYS = new Set(['__proto__', 'constructor', 'prototype'])

const RESERVED_DATA_KEYS = new Set([
  ...UNSAFE_DATA_KEYS,
  '_id',
  '_key',
  'id',
  'createdAt',
  'shipFastGeneratedProps',
  'updatedAt',
])

function hasOwn(record: JsonRecord, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(record, key)
}

function hasUnsafeDataKey(record: JsonRecord): boolean {
  return Object.keys(record).some((key) => UNSAFE_DATA_KEYS.has(key))
}

function isPlainRecord(value: unknown): value is JsonRecord {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

const GENERATED_PROPS_KEY = 'shipFastGeneratedProps'

function jsonEqual(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right)
}

function generatedSeedProps(generatedProps: JsonRecord): JsonRecord {
  const seedProps: JsonRecord = {}
  for (const [key, value] of Object.entries(generatedProps)) {
    if (RESERVED_DATA_KEYS.has(key)) continue
    if (value === undefined) continue
    seedProps[key] = value
  }
  return seedProps
}

function seedSnapshotFromLiveData(
  liveData: JsonRecord | null,
): JsonRecord | null {
  if (!liveData) return null
  const snapshot = liveData[GENERATED_PROPS_KEY]
  return isPlainRecord(snapshot) ? snapshot : null
}

/**
 * Build the seed patch for a section: one top-level key per generated prop.
 * Only seeds keys that are absent from the live data so admin overrides are
 * never clobbered. Storing each prop as its own key (rather than a single blob)
 * lets the generic admin panel introspect scalars as editable `value` tables
 * and arrays (e.g. `stats`) as editable `array` tables with zero panel changes.
 */
export function buildSectionSeedPatch(
  generatedProps: JsonRecord,
  liveData: JsonRecord | null,
): JsonRecord {
  const patch: JsonRecord = {}
  const seedProps = generatedSeedProps(generatedProps)
  const previousSeedProps = seedSnapshotFromLiveData(liveData)

  for (const [key, value] of Object.entries(seedProps)) {
    if (!liveData || !hasOwn(liveData, key)) {
      patch[key] = value
      continue
    }

    if (previousSeedProps) {
      if (
        jsonEqual(liveData[key], previousSeedProps[key]) &&
        !jsonEqual(liveData[key], value)
      ) {
        patch[key] = value
      }
      continue
    }

    if (!jsonEqual(liveData[key], value)) {
      patch[key] = value
    }
  }

  if (!jsonEqual(previousSeedProps, seedProps)) {
    patch[GENERATED_PROPS_KEY] = seedProps
  }

  return patch
}

/**
 * Merge live (admin-edited) section data over the generated props. Live values
 * win; reserved bookkeeping keys are dropped. Generated props that were never
 * persisted (e.g. defaulted-undefined) still pass through from `generatedProps`.
 */
export function mergeSectionProps(
  generatedProps: JsonRecord,
  liveData: JsonRecord | null,
): JsonRecord {
  if (!liveData) return generatedProps
  const merged = generatedSeedProps(generatedProps)
  const previousSeedProps = seedSnapshotFromLiveData(liveData)
  const hasUnsafeLiveDataKey = hasUnsafeDataKey(liveData)

  for (const [key, value] of Object.entries(liveData)) {
    if (RESERVED_DATA_KEYS.has(key)) continue

    if (hasOwn(generatedProps, key)) {
      if (!previousSeedProps && !hasUnsafeLiveDataKey) continue
      if (
        previousSeedProps &&
        hasOwn(previousSeedProps, key) &&
        jsonEqual(value, previousSeedProps[key])
      ) {
        continue
      }
    }

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
