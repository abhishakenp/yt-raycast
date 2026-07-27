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
})
