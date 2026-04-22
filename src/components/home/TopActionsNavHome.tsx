'use client'

import { useShipFastHomeAuth } from '@/components/home/ship-fast-home-auth-provider'
import { SfGlassPillButton, SfGlassPillLink } from '@/components/ui/sf-glass-pill-button'
import { BrandSvg } from '@/components/ui/brand-svg'
import Link from 'next/link'

export const TopActionsNavHome = ({ showBrand = false }: { showBrand?: boolean }) => {
  const { user, authReady, setOverlayOpen, signOutUser } = useShipFastHomeAuth()

  return (
    <nav className="top-actions" aria-label="Primary">
      {showBrand ? (
        <Link href="/" className="top-actions-brand" aria-label="SHIP FAST home">
          <BrandSvg />
          <span className="top-actions-brand-text">SHIP FAST</span>
        </Link>
      ) : null}
      <div className="top-actions-right">
        <SfGlassPillLink href="/pricing" className="pill--top-actions">
          Pricing
        </SfGlassPillLink>
        <div className="top-actions-auth-slot">
          <SfGlassPillButton
            id="signin-btn"
            type="button"
            className="pill--top-actions"
            style={{ display: !user && authReady ? 'inline-flex' : 'none' }}
            onClick={() => setOverlayOpen(true)}
          >
            Sign in
          </SfGlassPillButton>
          <SfGlassPillButton
            id="signout-btn"
            type="button"
            className="pill--top-actions"
            style={{ display: user ? 'inline-flex' : 'none' }}
            onClick={() => void signOutUser()}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign out
          </SfGlassPillButton>
        </div>
      </div>
    </nav>
  )
}
