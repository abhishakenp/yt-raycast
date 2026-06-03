import { createLibrary, type DefinedComponent } from "@openuidev/react-lang"
import * as all from "./registry/all.ts"

// The complete OpenUI component library: layout primitives + wrapped shadcn
// primitives + shadcn blocks. `Stack` is the required root.

function isDefinedComponent(v: unknown): v is DefinedComponent {
  return (
    !!v &&
    typeof v === "object" &&
    "name" in v &&
    "props" in v &&
    "component" in v
  )
}

export const library = createLibrary({
  components: Object.values(all).filter(isDefinedComponent),
  root: "Stack",
})

export const componentNames = Object.values(library.components).map((c) => c.name)
export const openUIComponentOpenPatternSource = [...componentNames].sort().join('|')
