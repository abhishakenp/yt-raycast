#!/usr/bin/env bun
/**
 * Regenerates `component-spec.json` (the `{root, components:{Name:{signature,
 * description}}}` catalogue the GenUI engine reads) from the live capsule library.
 *
 * The signatures/descriptions are derived by `@openuidev/lang-core` from each
 * capsule's `defineCapsule({ description, props: z.object({...}) })` at import
 * time and exposed via `library.toSpec()` — so authoring a new section capsule +
 * registering it in `src/library.ts` and running this script is all that's needed
 * for the engine to compose it. Run with bun (imports .tsx capsules directly):
 *
 *   bun packages/ship-fast-blocks/scripts/generate-component-spec.mjs
 */
import { writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { library } from '../src/library.ts'

const spec = library.toSpec()
const json = `${JSON.stringify(spec, null, 2)}\n`

const blocksRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const repoRoot = join(blocksRoot, '..', '..')
const targets = [
  join(blocksRoot, 'src/generated/component-spec.json'),
  join(repoRoot, 'packages/ship-fast-engine/src/generated/component-spec.json'),
  join(
    repoRoot,
    'packages/ship-fast-engine/src/genui/generated/component-spec.json',
  ),
]
for (const target of targets) writeFileSync(target, json)

console.log(
  `component-spec.json regenerated: ${Object.keys(spec.components ?? {}).length} components → ${targets.length} files`,
)
