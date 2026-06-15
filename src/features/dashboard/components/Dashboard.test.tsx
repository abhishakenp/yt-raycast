// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { Dashboard } from './Dashboard'

vi.mock('convex/react', () => ({
  useMutation: () => vi.fn(),
  useQuery: () => null,
}))

vi.mock('@ship-fast/lakebed/react', () => ({
  LakebedSessionProvider: ({ children }: { children: ReactNode }) => (
    <>{children}</>
  ),
}))

vi.mock('@/features/admin/components/LakebedAdminPanel', () => ({
  LakebedAdminPanel: () => null,
}))
vi.mock('@/features/agentation/components/AgentationPanel', () => ({
  AgentationPanel: () => null,
}))
vi.mock('@/features/billing/components/BillingPanel', () => ({
  BillingPanel: () => null,
}))
vi.mock('@/features/brand/components/BrandMediaPanel', () => ({
  BrandMediaPanel: () => null,
}))
vi.mock('@/features/chat/components/ChatPanel', () => ({
  ChatPanel: () => null,
}))
vi.mock('@/features/cms/components/CmsPanel', () => ({
  CmsPanel: () => null,
}))
vi.mock('@/features/commerce/components/CommercePanel', () => ({
  CommercePanel: () => null,
}))
vi.mock('@/features/commerce/components/EcommercifyTransformOverlay', () => ({
  EcommercifyTransformOverlay: () => null,
}))
vi.mock('@/features/dashboard/components/ActivityPanel', () => ({
  ActivityPanel: () => null,
}))
vi.mock('@/features/deployments/components/DeploymentPanel', () => ({
  DeploymentPanel: () => null,
}))
vi.mock('@/features/editing/components/EditPanel', () => ({
  EditPanel: () => null,
}))
vi.mock('@/features/exports/components/ExportPanel', () => ({
  ExportPanel: () => null,
}))
vi.mock('@/features/generation/components/GeneratedModulePreview', () => ({
  GeneratedModulePreview: () => null,
}))
vi.mock('@/features/github/components/GitHubPanel', () => ({
  GitHubPanel: () => null,
}))
vi.mock('@/features/localization/components/LocalizationPanel', () => ({
  LocalizationPanel: () => null,
}))
vi.mock('@/features/session/services/anonymous-owner-secret', () => ({
  readAnonymousOwnerSecret: () => undefined,
}))
vi.mock('@/genui/components/ThemePicker', () => ({
  default: ({ trigger }: { trigger: ReactNode }) => <>{trigger}</>,
}))
vi.mock('@/genui/theme-apply', () => ({
  resolveThemeStyles: () => undefined,
}))

describe('Dashboard missing session state', () => {
  beforeEach(() => {
    window.matchMedia = vi.fn().mockReturnValue({
      addEventListener: vi.fn(),
      matches: true,
      removeEventListener: vi.fn(),
    })
  })

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('shows a missing project state when Convex returns no generation view', () => {
    render(<Dashboard sessionId="missing-session" />)

    expect(screen.getAllByText('Project missing')).toHaveLength(2)
    expect(
      screen.getByText('This generated website is no longer available.'),
    ).toBeTruthy()
    expect(screen.queryByText('Composing the first screen')).toBeNull()
    expect(screen.queryByRole('button', { name: 'Publish preview' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Open auto admin' })).toBeNull()
  })
})
