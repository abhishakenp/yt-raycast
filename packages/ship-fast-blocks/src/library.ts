import {
  createLibrary,
  isDefinedComponent,
  type ShipFastCapsule,
} from "./capsules/openui.ts"
import * as registry from "./registry/all.ts"

// The OpenUI component library is assembled from the registry's defined
// components (section families + primitives). Each exposes the client
// component that OpenUI needs under the hood. The legacy monolithic page
// capsules were removed once every vertical became a composable section family.

const registryCapsules = Object.values(registry)
  .filter(isDefinedComponent)
  .map((client) => ({ client })) satisfies ShipFastCapsule[]

export const library = createLibrary({
  capsules: registryCapsules,
  root: "Stack",
})

export const componentNames = Object.values(library.components).map((c) => c.name)
export const openUIComponentOpenPatternSource = [...componentNames].sort().join('|')
