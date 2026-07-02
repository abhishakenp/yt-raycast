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

const isRuntimeComponentName = (name: string): name is RuntimeComponentName =>
  runtimeComponentNameSet.has(name)

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
  const aiNames = aiCapsules.map((capsule) => capsule.capsuleName).sort()
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
const isRealtimeEditableSection = (name: string): boolean =>
  runtimeSectionComponentNameSet.has(name) && !/(Navbar|Footer)$/.test(name)

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

/** Dynamic-import compiled JS of an AI capsule and wrap it as a ShipFastCapsule.
 *  The compiled JS references globalThis.React and globalThis.__jsxRuntime
 *  instead of importing 'react', so it can be loaded via Blob URL without
 *  an import map. */
export function loadAiCapsule(
  record: AiCapsuleRecord,
): Promise<ShipFastCapsule> {
  let cached = aiCapsuleCache.get(record.capsuleName)
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
        return defineCapsule({
          name: record.capsuleName,
          description: record.description,
          props: zodObjectAny,
          component: ({ props }) => Component(props),
        })
      } finally {
        URL.revokeObjectURL(url)
      }
    })()
    aiCapsuleCache.set(record.capsuleName, cached)
  }
  return cached
}

// Minimal zod schema that accepts any props — AI capsules have freeform props
const zodObjectAny = z.object({}).passthrough()

export function loadOpenUIRuntimeLibrary(
  response: string | null | undefined,
  aiCapsules?: AiCapsuleRecord[],
): Promise<Library> {
  const staticNames = extractOpenUIRuntimeComponentNames(response)
  const aiCapsuleMap = new Map(
    (aiCapsules ?? []).map((c) => [c.capsuleName, c]),
  )
  // Find AI capsule names that are actually referenced in the response
  const allNames = extractAllComponentNames(response)
  const referencedAiCapsules = allNames
    .filter((name) => aiCapsuleMap.has(name))
    .map((name) => aiCapsuleMap.get(name)!)
  const aiNames = referencedAiCapsules.map((c) => c.capsuleName)
  const cacheKey = [...staticNames, ...aiNames].join('\0')
  let cached = libraryCache.get(cacheKey)
  if (!cached) {
    const staticCapsules = staticNames.map((name) =>
      loadOpenUIRuntimeComponent(name),
    )
    const aiCapsulePromises = referencedAiCapsules.map((record) =>
      loadAiCapsule(record),
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
