import {
  createLibrary,
  isCapsule,
  isDefinedComponent,
  type ShipFastCapsule,
} from "./capsules/openui.ts"
import * as capsules from "./capsules/index.ts"
import * as registry from "./registry/all.ts"

// The OpenUI component library is assembled from Ship Fast capsules. Each
// capsule exposes the client component that OpenUI needs under the hood.

const registryCapsules = Object.values(registry)
  .filter(isDefinedComponent)
  .map((client) => ({ client })) satisfies ShipFastCapsule[]

const pageCapsules = Object.values(capsules).filter(isCapsule) as ShipFastCapsule[]

export const library = createLibrary({
  capsules: [...registryCapsules, ...pageCapsules],
  root: "Stack",
})

export const componentNames = Object.values(library.components).map((c) => c.name)
export const openUIComponentOpenPatternSource = [...componentNames].sort().join('|')
