// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/components/GenUI/DirectPreview', () => ({
  default: ({ children }: { children: ReactNode }) => (
    <div data-testid="direct-preview">{children}</div>
  ),
}))

vi.mock('@/components/GenUI/AgentationSessionBridge', () => ({
  default: () => null,
}))

vi.mock('@/island/openui/OpenUIViewer', () => ({
  default: ({ response }: { response: string }) => (
    <div data-testid="openui-viewer">{response}</div>
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

import {
  GeneratedModulePreview,
  isHtmlDocumentSource,
} from './GeneratedModulePreview'

describe('GeneratedModulePreview', () => {
  afterEach(() => {
    cleanup()
  })

  it('detects complete HTML document sources', () => {
    expect(
      isHtmlDocumentSource('<!DOCTYPE html><html><body></body></html>'),
    ).toBe(true)
    expect(isHtmlDocumentSource('root = Text("Hello")')).toBe(false)
  })

  it('renders raw generated HTML in an iframe', () => {
    const html = '<!DOCTYPE html><html><body><h1>SFF site</h1></body></html>'

    render(<GeneratedModulePreview source={html} sessionId="session-1" />)

    const iframe = screen.getByTitle('Generated website preview')
    expect(iframe).toBeInstanceOf(HTMLIFrameElement)
    expect(iframe.getAttribute('srcdoc')).toBe(html)
    expect(screen.queryByTestId('openui-viewer')).toBeNull()
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

  it('keeps OpenUI sources on the OpenUI renderer', async () => {
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
})
