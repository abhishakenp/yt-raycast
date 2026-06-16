import { dark } from '@clerk/ui/themes'

export const clerkFrostedGlassAppearance = {
  theme: dark,
  variables: {
    colorPrimary: '#ffffff',
    colorText: '#ffffff',
    colorTextOnPrimaryBackground: '#020617',
    colorTextSecondary: 'rgba(226, 232, 240, 0.9)',
    colorBackground: 'rgba(8, 13, 28, 0.92)',
    colorInputBackground: 'rgba(255, 255, 255, 0.94)',
    colorInputText: '#0f172a',
    colorNeutral: '#cbd5e1',
    borderRadius: '22px',
    fontFamily: '"Cal Sans", "Geist", ui-sans-serif, system-ui, sans-serif',
  },
  elements: {
    modalBackdrop: {
      background: 'rgba(2, 6, 23, 0.58)',
      backdropFilter: 'blur(18px)',
    },
    cardBox: {
      border: '1px solid rgba(255, 255, 255, 0.22)',
      background: 'rgba(8, 13, 28, 0.9)',
      boxShadow:
        '0 32px 120px rgba(0, 0, 0, 0.68), inset 0 1px 0 rgba(255, 255, 255, 0.14)',
      backdropFilter: 'blur(40px)',
    },
    card: {
      background: 'transparent',
      boxShadow: 'none',
    },
    headerTitle: {
      color: '#ffffff',
      letterSpacing: '-0.02em',
      fontWeight: 700,
    },
    headerSubtitle: {
      color: 'rgba(248, 250, 252, 0.86)',
    },
    socialButtonsBlockButton: {
      border: '1px solid rgba(255, 255, 255, 0.2)',
      background: 'rgba(255, 255, 255, 0.12)',
      color: '#ffffff',
      boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.2)',
      backdropFilter: 'blur(18px)',
    },
    socialButtonsBlockButtonText: {
      color: '#ffffff',
      fontWeight: 650,
    },
    dividerLine: {
      background: 'rgba(255, 255, 255, 0.22)',
    },
    dividerText: {
      color: 'rgba(248, 250, 252, 0.84)',
    },
    formFieldLabel: {
      color: '#f8fafc',
      fontWeight: 600,
    },
    formFieldInput: {
      border: '1px solid rgba(255, 255, 255, 0.34)',
      background: 'rgba(255, 255, 255, 0.94)',
      color: '#0f172a',
      boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.7)',
      backdropFilter: 'blur(18px)',
    },
    formButtonPrimary: {
      background: 'linear-gradient(135deg, #ffffff, #cbd5e1)',
      color: '#020617',
      boxShadow: '0 20px 54px rgba(15, 23, 42, 0.46)',
      fontWeight: 700,
    },
    footer: {
      borderTop: '1px solid rgba(255, 255, 255, 0.12)',
      background: 'rgba(255, 255, 255, 0.06)',
      backdropFilter: 'blur(18px)',
    },
    footerActionText: {
      color: 'rgba(226, 232, 240, 0.9)',
    },
    footerActionLink: {
      color: '#ffffff',
      fontWeight: 700,
    },
    identityPreviewText: {
      color: '#f8fafc',
    },
    formFieldAction: {
      color: '#ffffff',
    },
    logoBox: {
      display: 'none',
    },
    footerPagesLink: {
      color: 'rgba(226, 232, 240, 0.84)',
    },
  },
} as const
