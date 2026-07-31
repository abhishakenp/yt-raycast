// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/components/GenUI/DirectPreview', () => ({
  default: ({ children }: { children: ReactNode }) => (
    <div data-testid="direct-preview">{children}</div>
  ),
}))

vi.mock('@/island/openui/OpenUIViewer', () => ({
  default: ({
    response,
    designIntent,
  }: {
    response: string
    designIntent?: unknown
  }) => (
    <div
      data-testid="openui-viewer"
      data-design={JSON.stringify(designIntent ?? null)}
    >
      {response}
    </div>
  ),
}))

vi.mock('@ship-fast/lakebed/react', () => ({
  LakebedSessionProvider: ({ children }: { children: ReactNode }) => (
    <>{children}</>
  ),
}))

vi.mock('@/features/session/services/anonymous-owner-secret', () => ({
  readAnonymousOwnerSecret: () => undefined,
}))

import { GeneratedModulePreview } from './GeneratedModulePreview'

describe('GeneratedModulePreview', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders storage-backed clone HTML from an iframe URL', () => {
    render(
      <GeneratedModulePreview
        source=""
        sourceUrl="https://storage.test/tvnl-home"
        sessionId="session-1"
      />,
    )

    const iframe = screen.getByTitle('Generated website preview')
    expect(iframe).toBeInstanceOf(HTMLIFrameElement)
    expect(iframe.getAttribute('src')).toBe('https://storage.test/tvnl-home')
    expect(iframe.hasAttribute('srcdoc')).toBe(false)
    expect(screen.queryByTestId('openui-viewer')).toBeNull()
  })

  it('renders OpenUI sources on the OpenUI renderer', async () => {
    render(
      <GeneratedModulePreview
        source='root = Text("OpenUI site")'
        sessionId="session-1"
      />,
    )

    expect((await screen.findByTestId('openui-viewer')).textContent).toContain(
      'OpenUI site',
    )
    expect(screen.queryByTitle('Generated website preview')).toBeNull()
  })

  it('shows generating placeholder when source is empty', () => {
    render(<GeneratedModulePreview source="" sessionId="session-1" />)

    expect(screen.getByText('Generating preview…')).toBeDefined()
    expect(screen.queryByTestId('openui-viewer')).toBeNull()
    expect(screen.queryByTitle('Generated website preview')).toBeNull()
  })

  it('parses @design intent from siteSpecJson and passes it to the viewer', async () => {
    const siteSpecJson = JSON.stringify({
      brand: 'Test',
      design: '@design radius:sharp shadow:none gradient:none',
    })
    render(
      <GeneratedModulePreview
        source='root = Text("test")'
        sessionId="session-1"
        siteSpecJson={siteSpecJson}
      />,
    )
    const viewer = await screen.findByTestId('openui-viewer')
    const parsed = JSON.parse(viewer.getAttribute('data-design') ?? 'null')
    expect(parsed).not.toBeNull()
    expect(parsed.radius).toBe('sharp')
    expect(parsed.shadow).toBe('none')
    expect(parsed.gradient).toBe('none')
  })

  it('passes null designIntent when siteSpecJson has no design field', async () => {
    const siteSpecJson = JSON.stringify({ brand: 'Test' })
    render(
      <GeneratedModulePreview
        source='root = Text("test")'
        sessionId="session-1"
        siteSpecJson={siteSpecJson}
      />,
    )
    const viewer = await screen.findByTestId('openui-viewer')
    expect(viewer.getAttribute('data-design')).toBe('null')
  })
})
