import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import {
  renderPreviewToWorkspace,
  renderProject,
  writeStreamingShellToWorkspace,
} from './index'

const siteSpec = {
  brand: 'Preview Brand',
  projectName: 'Preview Brand',
  tagline: 'Local Tailwind preview',
  userPrompt: 'A polished SaaS homepage',
  pages: [{ id: 'home', title: 'Home', description: 'Homepage' }],
}

const expectNoTailwindCdn = (html: string) => {
  expect(html).not.toMatch(/cdn\.tailwindcss\.com/i)
  expect(html).toContain('openui-preview-tailwind.css')
}

describe('renderer Tailwind preview CSS', () => {
  it('uses a local Tailwind CSS asset for static HTML exports', () => {
    const rendered = renderProject(siteSpec as any, 'html')
    expectNoTailwindCdn(rendered.files['index.html'])
    expect(rendered.files['styles/openui-preview-tailwind.css']).toMatch(/\.bg-background|--color-background/)
  })

  it('uses a local Tailwind CSS asset for OpenUI preview shells', () => {
    const workspace = mkdtempSync(join(tmpdir(), 'ship-fast-renderer-'))
    try {
      writeFileSync(join(workspace, 'home.openui'), 'page Home { Text "Hello" }')
      renderPreviewToWorkspace(siteSpec as any, workspace)
      expectNoTailwindCdn(readFileSync(join(workspace, 'index.html'), 'utf8'))
      expect(readFileSync(join(workspace, 'styles/openui-preview-tailwind.css'), 'utf8')).toMatch(
        /\.bg-background|--color-background/,
      )
    } finally {
      rmSync(workspace, { recursive: true, force: true })
    }
  })

  it('uses a local Tailwind CSS asset for streaming shells', () => {
    const workspace = mkdtempSync(join(tmpdir(), 'ship-fast-streaming-shell-'))
    try {
      writeStreamingShellToWorkspace(workspace, 'Streaming Brand', null)
      expectNoTailwindCdn(readFileSync(join(workspace, 'index.html'), 'utf8'))
    } finally {
      rmSync(workspace, { recursive: true, force: true })
    }
  })
})

describe('Next.js Medusa export', () => {
  it('initializes payment sessions from the retrieved cart object', () => {
    const source = readFileSync(join(import.meta.dirname, 'nextjs/index.js'), 'utf8')
    expect(source).toContain('const { cart } = await client.store.cart.retrieve(cartId)')
    expect(source).toContain('client.store.payment.initiatePaymentSession(cart, { provider_id: pid })')
    expect(source).not.toContain('initiatePaymentSession(cartId')
  })
})
