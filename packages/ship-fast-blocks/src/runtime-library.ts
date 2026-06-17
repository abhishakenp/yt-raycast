import type { Library } from '@openuidev/react-lang'
import { createLibrary, type ShipFastCapsule } from './capsules/openui.ts'
import {
  runtimeComponentLoaders,
  type RuntimeComponentName,
} from './generated/runtime-component-loaders.ts'

const rootComponentName = 'Stack' satisfies RuntimeComponentName
const componentCallPattern = /\b([A-Z][A-Za-z0-9_]*)\s*\(/g
const capsuleCache = new Map<RuntimeComponentName, Promise<ShipFastCapsule>>()
const libraryCache = new Map<string, Promise<Library>>()

const isRuntimeComponentName = (name: string): name is RuntimeComponentName =>
  name in runtimeComponentLoaders

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

export function getOpenUIRuntimeLibraryCacheKey(
  response: string | null | undefined,
): string {
  return extractOpenUIRuntimeComponentNames(response).join('\0')
}

export function loadOpenUIRuntimeComponent(
  name: RuntimeComponentName,
): Promise<ShipFastCapsule> {
  let cached = capsuleCache.get(name)
  if (!cached) {
    cached = runtimeComponentLoaders[name]()
    capsuleCache.set(name, cached)
  }
  return cached
}

export function loadOpenUIRuntimeLibrary(
  response: string | null | undefined,
): Promise<Library> {
  const names = extractOpenUIRuntimeComponentNames(response)
  const cacheKey = names.join('\0')
  let cached = libraryCache.get(cacheKey)
  if (!cached) {
    cached = Promise.all(names.map(loadOpenUIRuntimeComponent)).then(
      (capsules) => createLibrary({ capsules, root: rootComponentName }),
    )
    libraryCache.set(cacheKey, cached)
  }
  return cached
}
