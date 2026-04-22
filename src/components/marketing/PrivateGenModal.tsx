import { SfGlassPillButton } from '@/components/ui/sf-glass-pill-button'
import Link from 'next/link'

export const PrivateGenModal = () => (
  <div className="private-gen-modal" id="private-gen-modal" aria-hidden="true">
    <div className="private-gen-modal-backdrop" id="private-gen-modal-backdrop" />
    <div
      className="private-gen-modal-card"
      role="dialog"
      aria-modal="true"
      aria-labelledby="private-gen-modal-title"
    >
      <SfGlassPillButton
        className="private-gen-modal-close pill--modal-close"
        id="private-gen-modal-close"
        type="button"
        aria-label="Close"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </SfGlassPillButton>
      <div className="private-gen-modal-icon">
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </div>
      <h2 id="private-gen-modal-title">Private Generation</h2>
      <p>Your generated site won&apos;t be publicly listed — only you can access it.</p>
      <p>
        This is a <strong>Pro plan</strong> feature.
      </p>
      <Link href="/pricing" className="private-gen-modal-btn">
        Upgrade to Pro
      </Link>
    </div>
  </div>
)
