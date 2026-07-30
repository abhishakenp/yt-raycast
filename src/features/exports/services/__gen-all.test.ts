import { describe, it } from 'vitest'
import { writeFileSync, mkdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'

import { buildOpenUIArtifactFiles } from './openui-artifact-files'

// V3 export smoke corpus. The vertical FashionStore family was retired; keep
// this generated-artifact exercise focused on the portable registry contract.
const source = `home = Stack([Navbar({"brand":"Hello Kitty","links":["Home","Collections","Shop"]}), SplitHero({"heading":"Hello Kitty","subheading":"Cuteness in every stitch"}), ProductGrid({"heading":"Featured Products","products":[{"name":"Hello Kitty Bow Headband","price":"$12.99","imageAlt":"Pink bow headband"},{"name":"Hello Kitty Plush Pillow","price":"$19.99","imageAlt":"Soft plush pillow"}]}), FaqAccordion({"heading":"Need Help?","items":[{"question":"Do you ship internationally?","answer":"Yes, with tracking."}]}), Footer({"brand":"Hello Kitty","columns":[{"title":"Shop","links":["All Products"]}]})])
collections = Stack([Navbar({"brand":"Hello Kitty","links":["Home","Collections"]}), ProductGrid({"heading":"All Collections","products":[{"name":"Plush Toys","price":"$12","imageAlt":"Plush toys collection"}]}), Footer({"brand":"Hello Kitty"})])
shop = Stack([Navbar({"brand":"Hello Kitty","links":["Home","Shop"]}), ProductGrid({"heading":"Shop All","products":[{"name":"Hello Kitty T-Shirt","price":"$24.99","imageAlt":"Hello Kitty T-shirt"}]}), Footer({"brand":"Hello Kitty"})])
root = PageSwitch(["Home", "Collections", "Shop"], [home, collections, shop], "", {"Home":"home","Collections":"collections","Shop":"shop"})`

const siteSpec = JSON.stringify({
  brand: 'Hello Kitty',
  theme: 't3-chat',
  genui: {
    admin: {
      routes: [{ path: '/admin', label: 'Admin' }],
      ownerEmails: ['founder@example.com'],
    },
  },
})

describe('gen-all', () => {
  it('exports all three targets to /tmp', async () => {
    for (const target of ['next', 'react', 'lakebed'] as const) {
      const { files } = await buildOpenUIArtifactFiles({
        source,
        siteSpecJson: siteSpec,
        sessionId: 'hello-kitty',
        target,
      })
      const outDir = `/tmp/hello-kitty-${target}-review`
      rmSync(outDir, { recursive: true, force: true })
      for (const [path, content] of Object.entries(files)) {
        const fullPath = join(outDir, path)
        mkdirSync(join(fullPath, '..'), { recursive: true })
        writeFileSync(fullPath, content)
      }
      console.log(`${target}: ${Object.keys(files).length} files -> ${outDir}`)
    }
  })
})
