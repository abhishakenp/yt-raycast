import type { Library } from '@openuidev/react-lang'
import {
  withSectionRealtime,
  type SectionRenderer,
} from '@ship-fast/lakebed/react'
import { z } from 'zod/v4'
import {
  createLibrary,
  defineCapsule,
  type ShipFastCapsule,
} from './capsules/openui.ts'
import {
  runtimeComponentNames,
  type RuntimeComponentName,
} from './generated/runtime-component-names.ts'
import { runtimeSectionComponentNameSet } from './generated/runtime-section-component-names.ts'

const rootComponentName = 'Stack' satisfies RuntimeComponentName
const componentCallPattern = /\b([A-Z][A-Za-z0-9_]*)\s*\(/g
const capsuleCache = new Map<RuntimeComponentName, Promise<ShipFastCapsule>>()
const libraryCache = new Map<string, Promise<Library>>()
const runtimeComponentNameSet = new Set<string>(runtimeComponentNames)

export function isRuntimeComponentName(
  name: string,
): name is RuntimeComponentName {
  return runtimeComponentNameSet.has(name)
}

export function extractOpenUIRuntimeComponentNames(
  response: string | null | undefined,
): RuntimeComponentName[] {
  const names = new Set<RuntimeComponentName>([rootComponentName])
  if (!response) return [...names]

  for (const match of response.matchAll(componentCallPattern)) {
    const name = match[1]
    if (name && isRuntimeComponentName(name)) {
      names.add(name)
    }
  }

  return [...names].sort()
}

/** Extract ALL component-like names from the response, including AI capsules
 *  that are not in the static runtime loaders. Used to identify which AI
 *  capsules need to be loaded for a given response. */
export function extractAllComponentNames(
  response: string | null | undefined,
): string[] {
  const names = new Set<string>([rootComponentName])
  if (!response) return [...names]

  for (const match of response.matchAll(componentCallPattern)) {
    const name = match[1]
    if (name) {
      names.add(name)
    }
  }

  return [...names].sort()
}

export function getOpenUIRuntimeLibraryCacheKey(
  response: string | null | undefined,
  aiCapsules: AiCapsuleRecord[] = [],
): string {
  const staticNames = extractOpenUIRuntimeComponentNames(response)
  const aiNames = [
    ...aiCapsules.map((capsule) => capsule.capsuleName),
    ...resolveReferencedAiCapsules(response, aiCapsules).map(
      (capsule) =>
        `${capsule.referenceName}<${capsule.parentRuntimeComponentName ?? ''}>(${capsule.propNames.join(',')})`,
    ),
  ].sort()
  return [...staticNames, ...aiNames].join('\0')
}

/**
 * Wrap a STATIC section capsule's client component with the realtime + admin
 * editable HOC. Only applied to capsules under `registry/sections/**` (listed in
 * `runtimeSectionComponentNameSet`) that represent editable page content.
 * Structural chrome such as navbars and footers must not seed Lakebed docs,
 * otherwise the admin panel exposes implementation namespaces like
 * `BeautyStoreFooter:explore_footer.brand` instead of business data tables.
 * Page capsules already carry their own lakebed wiring and primitives must stay
 * structural, so neither is wrapped. The section components themselves are never
 * modified — interception happens here, at name→component resolution, the single
 * seam react-lang exposes.
 */
function isRealtimeEditableSection(name: string): boolean {
  return (
    runtimeSectionComponentNameSet.has(name) && !/(Navbar|Footer)$/.test(name)
  )
}

function withRealtimeSection(
  name: string,
  capsule: ShipFastCapsule,
): ShipFastCapsule {
  if (!isRealtimeEditableSection(name)) return capsule
  const { client } = capsule
  const wrapped: ShipFastCapsule = {
    ...capsule,
    client: {
      ...client,
      component: withSectionRealtime(
        client.component as unknown as SectionRenderer,
        name,
      ) as unknown as typeof client.component,
    },
  }
  return wrapped
}

export function loadOpenUIRuntimeComponent(
  name: RuntimeComponentName,
): Promise<ShipFastCapsule> {
  let cached = capsuleCache.get(name)
  if (!cached) {
    cached = import('./generated/runtime-component-loaders.ts').then(
      ({ runtimeComponentLoaders }) =>
        runtimeComponentLoaders[name]().then((capsule) =>
          withRealtimeSection(name, capsule),
        ),
    )
    capsuleCache.set(name, cached)
  }
  return cached
}

// ─── AI Capsule Loading ─────────────────────────────────────────────────────

export type AiCapsuleRecord = {
  capsuleName: string
  parentCapsule: string
  compiledJs: string
  description: string
}

const aiCapsuleCache = new Map<string, Promise<ShipFastCapsule>>()
const aiCapsuleOpenUIPropsArg = '__shipFastAiCapsuleProps'

/** Dynamic-import compiled JS of an AI capsule and wrap it as a ShipFastCapsule.
 *  The compiled JS references globalThis.React and globalThis.__jsxRuntime
 *  instead of importing 'react', so it can be loaded via Blob URL without
 *  an import map. */
export function loadAiCapsule(
  record: AiCapsuleRecord,
  capsuleName = record.capsuleName,
  propNames: string[] = [],
  parentRuntimeComponentName: RuntimeComponentName | null = null,
): Promise<ShipFastCapsule> {
  const cacheKey = `${record.capsuleName}\0${capsuleName}\0${parentRuntimeComponentName ?? ''}\0${[...propNames].sort().join('\0')}`
  let cached = aiCapsuleCache.get(cacheKey)
  if (!cached) {
    cached = (async () => {
      // Ensure React globals are available for the compiled JS
      const g = globalThis as Record<string, unknown>
      if (!g.React) {
        const React = await import('react')
        g.React = React
      }
      if (!g.__jsxRuntime) {
        g.__jsxRuntime = await import('react/jsx-runtime')
      }

      const blob = new Blob([record.compiledJs], { type: 'text/javascript' })
      const url = URL.createObjectURL(blob)
      try {
        const module = await import(/* @vite-ignore */ url)
        const Component = module.default
        if (typeof Component !== 'function') {
          throw new Error(
            `AI capsule ${record.capsuleName} does not export a default function`,
          )
        }
        // Wrap the AI component as a ShipFastCapsule so it gets data attrs
        // stamped and integrates with the OpenUI runtime.
        const propsSchema = parentRuntimeComponentName
          ? (await loadOpenUIRuntimeComponent(parentRuntimeComponentName))
              .client.props
          : createAiCapsulePropsSchema(propNames)
        return defineCapsule({
          name: capsuleName,
          description: record.description,
          props: propsSchema,
          component: ({ props }) => Component(normalizeAiCapsuleProps(props)),
        })
      } finally {
        URL.revokeObjectURL(url)
      }
    })()
    aiCapsuleCache.set(cacheKey, cached)
  }
  return cached
}

function createAiCapsulePropsSchema(propNames: string[]) {
  const shape = {
    [aiCapsuleOpenUIPropsArg]: z.record(z.string(), z.unknown()).optional(),
    ...Object.fromEntries(
      propNames.map((propName) => [propName, z.any().optional()]),
    ),
  }
  return z.object(shape).passthrough()
}

function normalizeAiCapsuleProps(props: unknown): unknown {
  if (!props || typeof props !== 'object' || Array.isArray(props)) return props
  const record = props as Record<string, unknown>
  const positionalProps = record[aiCapsuleOpenUIPropsArg]
  if (
    !positionalProps ||
    typeof positionalProps !== 'object' ||
    Array.isArray(positionalProps)
  ) {
    return props
  }

  const { [aiCapsuleOpenUIPropsArg]: _ignored, ...namedProps } = record
  return {
    ...(positionalProps as Record<string, unknown>),
    ...namedProps,
  }
}

type ReferencedAiCapsule = {
  referenceName: string
  record: AiCapsuleRecord
  propNames: string[]
  parentRuntimeComponentName: RuntimeComponentName | null
}

function findAiCapsuleRecordForReference(
  referenceName: string,
  aiCapsuleMap: Map<string, AiCapsuleRecord>,
  orderedCapsuleNames: string[],
): AiCapsuleRecord | null {
  const exact = aiCapsuleMap.get(referenceName)
  if (exact) return exact

  if (!referenceName.startsWith('AICustom_AICustom_')) return null

  for (const capsuleName of orderedCapsuleNames) {
    const legacyPrefix = `AICustom_${capsuleName}`
    if (
      referenceName === legacyPrefix ||
      referenceName.startsWith(`${legacyPrefix}_`)
    ) {
      return aiCapsuleMap.get(capsuleName) ?? null
    }
  }

  return null
}

function resolveReferencedAiCapsules(
  response: string | null | undefined,
  aiCapsules: AiCapsuleRecord[],
): ReferencedAiCapsule[] {
  const aiCapsuleMap = new Map(aiCapsules.map((c) => [c.capsuleName, c]))
  const orderedCapsuleNames = [...aiCapsuleMap.keys()].sort(
    (left, right) => right.length - left.length,
  )

  return extractAllComponentNames(response)
    .map((referenceName) => {
      const record = findAiCapsuleRecordForReference(
        referenceName,
        aiCapsuleMap,
        orderedCapsuleNames,
      )
      return record
        ? {
            referenceName,
            record,
            propNames: extractComponentCallArgumentNames(
              response,
              referenceName,
            ),
            parentRuntimeComponentName: resolveAiCapsuleRuntimeParent(
              record,
              aiCapsuleMap,
            ),
          }
        : null
    })
    .filter((value): value is ReferencedAiCapsule => value !== null)
}

function resolveAiCapsuleRuntimeParent(
  record: AiCapsuleRecord,
  aiCapsuleMap: Map<string, AiCapsuleRecord>,
): RuntimeComponentName | null {
  const seen = new Set<string>([record.capsuleName])
  let parentName = record.parentCapsule

  while (parentName.startsWith('AICustom_')) {
    if (seen.has(parentName)) return null
    seen.add(parentName)
    const parentRecord = aiCapsuleMap.get(parentName)
    if (!parentRecord) return null
    parentName = parentRecord.parentCapsule
  }

  return isRuntimeComponentName(parentName) ? parentName : null
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function extractComponentCallArgumentNames(
  response: string | null | undefined,
  componentName: string,
): string[] {
  if (!response) return []
  const names = new Set<string>()
  const callPattern = new RegExp(
    `\\b${escapeRegExp(componentName)}\\s*\\(`,
    'g',
  )

  for (const match of response.matchAll(callPattern)) {
    const start = (match.index ?? 0) + match[0].length
    let depth = 1
    let end = start
    for (; end < response.length; end += 1) {
      const char = response[end]
      if (char === '(') depth += 1
      if (char === ')') depth -= 1
      if (depth === 0) break
    }
    const args = response.slice(start, end)
    for (const argMatch of args.matchAll(
      /(?:^|[,{]\s*)([A-Za-z_$][A-Za-z0-9_$]*)\s*[:=]/g,
    )) {
      const name = argMatch[1]
      if (name) names.add(name)
    }
  }

  return [...names].sort()
}

export function loadOpenUIRuntimeLibrary(
  response: string | null | undefined,
  aiCapsules?: AiCapsuleRecord[],
): Promise<Library> {
  const staticNames = extractOpenUIRuntimeComponentNames(response)
  const referencedAiCapsules = resolveReferencedAiCapsules(
    response,
    aiCapsules ?? [],
  )
  const aiNames = [
    ...(aiCapsules ?? []).map((capsule) => capsule.capsuleName),
    ...referencedAiCapsules.map(
      (c) =>
        `${c.referenceName}<${c.parentRuntimeComponentName ?? ''}>(${c.propNames.join(',')})`,
    ),
  ]
  const cacheKey = [...staticNames, ...aiNames].join('\0')
  let cached = libraryCache.get(cacheKey)
  if (!cached) {
    const staticCapsules = staticNames.map((name) =>
      loadOpenUIRuntimeComponent(name),
    )
    const aiCapsulePromises = referencedAiCapsules.map(
      ({ referenceName, record, propNames, parentRuntimeComponentName }) =>
        loadAiCapsule(
          record,
          referenceName,
          propNames,
          parentRuntimeComponentName,
        ),
    )
    cached = Promise.all([...staticCapsules, ...aiCapsulePromises]).then(
      (capsules) =>
        createLibrary({
          capsules: capsules as ShipFastCapsule[],
          root: rootComponentName,
        }),
    )
    libraryCache.set(cacheKey, cached)
  }
  return cached
}
