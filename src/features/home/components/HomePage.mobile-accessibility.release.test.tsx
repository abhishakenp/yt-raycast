// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

interface PromptController {
  canSubmit: boolean
  claimShareBonus: () => Promise<void>
  errorMessage: string | undefined
  isSubmitting: boolean
  prompt: string
  refreshShareBonusStatus: () => Promise<void>
  scheduleSpeculativeGeneration: (request?: object) => void
  selectExamplePrompt: (prompt: string) => void
  setPrompt: (prompt: string) => void
  shareBonusClaimed: boolean
  submitPrompt: (request: object) => Promise<void>
}

interface WaitlistGateProps {
  children: ReactNode
}

interface RouterLinkProps {
  children: ReactNode
  className?: string
  to: string
}

function Link({ children, className, to }: RouterLinkProps) {
  return (
    <a className={className} href={to}>
      {children}
    </a>
  )
}

function WaitlistGate({ children }: WaitlistGateProps) {
  return children
}

const promptController = vi.hoisted<PromptController>(
  function createPromptController() {
    return {
      canSubmit: false,
      claimShareBonus: vi.fn(async function claimShareBonus() {}),
      errorMessage: undefined,
      isSubmitting: false,
      prompt: '',
      refreshShareBonusStatus: vi.fn(
        async function refreshShareBonusStatus() {},
      ),
      scheduleSpeculativeGeneration: vi.fn(),
      selectExamplePrompt: vi.fn(),
      setPrompt: vi.fn(),
      shareBonusClaimed: false,
      submitPrompt: vi.fn(async function submitPrompt() {}),
    }
  },
)

vi.mock('@tanstack/react-router', function mockRouter() {
  return {
    Link,
  }
})

vi.mock('@/components/launch-backdrop', function mockLaunchBackdrop() {
  return {
    LaunchBackdrop: function LaunchBackdrop() {
      return null
    },
  }
})

vi.mock(
  '@/features/gallery/components/PublicGallery',
  function mockPublicGallery() {
    return {
      HomeGallerySection: function HomeGallerySection() {
        return null
      },
    }
  },
)

vi.mock(
  '@/features/home/hooks/usePromptHomeController',
  function mockPromptController() {
    return {
      usePromptHomeController: function usePromptHomeController() {
        return promptController
      },
    }
  },
)

vi.mock('@/shared/auth/clerk-runtime', function mockClerkRuntime() {
  return {
    isClerkClientEnabled: function isClerkClientEnabled() {
      return false
    },
  }
})

vi.mock('./WaitlistGate', function mockWaitlistGate() {
  return {
    WaitlistGate,
  }
})

import { HomePage } from './HomePage'

describe('HomePage mobile accessibility', () => {
  afterEach(cleanup)

  it('keeps the Generate button named when its responsive text is hidden', () => {
    const view = render(<HomePage />)
    const submitButton = view.getByRole('button', { name: 'Generate' })
    const visualLabel = submitButton.querySelector('.btn-label')

    visualLabel?.setAttribute('hidden', '')

    expect(view.getByRole('button', { name: 'Generate' })).toBe(submitButton)
  })
})
