import { exportReactZip } from './openui-export-builder.ts'
import { writeFileSync, mkdirSync, rmSync } from 'fs'
import { join } from 'path'
import { execSync } from 'child_process'

const source = `root = PageSwitch(["Home", "Shop", "About"], [home, shop, about], "", {})
homeHero = EcommerceHero()
home = Stack([homeHero])
shopProducts = FashionStoreProducts()
shop = Stack([shopProducts])
aboutText = Text("About us")
about = Stack([aboutText])`

const siteSpecJson = JSON.stringify({
  project: { name: 'Test', brandColor: '#000' },
  pages: [
    { label: 'Home', path: '/' },
    { label: 'Shop', path: '/shop' },
    { label: 'About', path: '/about' },
  ],
})

const result = exportReactZip({
  source,
  siteSpecJson,
  sessionId: 'test-block',
  target: 'react',
  projectName: 'Test Store',
} as any)

const tmpDir = '/tmp/test-block-translation'
rmSync(tmpDir, { recursive: true, force: true })
mkdirSync(tmpDir, { recursive: true })
writeFileSync(join(tmpDir, 'export.zip'), result.body)
execSync(`cd ${tmpDir} && unzip -o export.zip`)
console.log('Done')
