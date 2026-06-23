import { z } from "zod/v4"
import type { ReactNode } from "react"
import { defineComponent } from "@openuidev/react-lang"
import { FeatureGrid } from "#/section-kit/FeatureGrid.tsx"

/**
 * AuthFeatures — capability grid for Authly, a developer authentication product.
 * Thin configuration over the shared `FeatureGrid` composite: a centered heading
 * ("Everything you need to ship auth") above a 3-column responsive grid of
 * feature cards, each pairing a token line-icon with a title and description.
 * Baked defaults cover the core auth surface — SSO / SAML, MFA & 2FA,
 * passwordless (magic links + passkeys), a user-management dashboard, social
 * login (OAuth), and bot & fraud protection. Use to explain an auth platform,
 * identity API, or login SDK. Renders fully with no props.
 */
const IconShield = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M12 3 4 6v6c0 5 3.5 7.5 8 9 4.5-1.5 8-4 8-9V6l-8-3Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
)
const IconLayers = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="m12 2 9 5-9 5-9-5 9-5Z" />
    <path d="m3 12 9 5 9-5" />
    <path d="m3 17 9 5 9-5" />
  </svg>
)
const IconWand = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M15 4V2M15 16v-2M8 9h2M20 9h2M17.8 11.8 19 13M15 9l-2-2M17.8 6.2 19 5M3 21l9-9" />
  </svg>
)
const IconUsers = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)
const IconGlobe = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
  </svg>
)
const IconBot = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <rect x="4" y="8" width="16" height="11" rx="2" />
    <path d="M12 8V5M9 13h.01M15 13h.01M2 13v2M22 13v2" />
  </svg>
)

export const AuthFeatures = defineComponent({
  name: "AuthFeatures",
  description:
    "Capability grid for a developer-auth product built on the shared FeatureGrid composite: a centered heading ('Everything you need to ship auth') above a 3-column responsive grid of feature cards, each with a token line-icon, title, and description. Baked defaults cover the core auth surface — SSO / SAML, MFA & 2FA, passwordless (magic links + passkeys), a user-management dashboard, social login (OAuth), and bot & fraud protection. Use to explain an auth platform, identity API, or login SDK.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting subheading under the heading. */
    subheading: z.string().optional(),
    /** Feature cards: title + description. */
    features: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? "Everything you need to ship auth"
    const subheading =
      props.subheading ??
      "A complete identity platform behind a clean API — add only what you need and scale the rest as you grow."

    const icons: ReactNode[] = [
      <IconLayers className="size-6" />,
      <IconShield className="size-6" />,
      <IconWand className="size-6" />,
      <IconUsers className="size-6" />,
      <IconGlobe className="size-6" />,
      <IconBot className="size-6" />,
    ]

    const baked = props.features?.length
      ? props.features
      : [
          {
            title: "SSO & SAML",
            description:
              "Enterprise single sign-on with SAML and OIDC. Connect Okta, Azure AD, Google Workspace, and any IdP in minutes.",
          },
          {
            title: "MFA & 2FA",
            description:
              "Step-up authentication with TOTP authenticator apps, SMS, and WebAuthn — enforced by policy per app or per role.",
          },
          {
            title: "Passwordless",
            description:
              "Magic links and passkeys out of the box. Cut password resets and phishing risk while raising conversion.",
          },
          {
            title: "User management",
            description:
              "A drop-in dashboard for users, sessions, and organizations — invite, suspend, and audit without writing UI.",
          },
          {
            title: "Social login",
            description:
              "One-click OAuth with Google, GitHub, Apple, and 20+ providers. Pre-built buttons and managed token refresh.",
          },
          {
            title: "Bot & fraud protection",
            description:
              "Adaptive risk scoring, rate limiting, and breached-password detection block credential-stuffing automatically.",
          },
        ]

    const features = baked.map((f, i) => ({ ...f, icon: icons[i % icons.length] }))

    return (
      <FeatureGrid
        heading={heading}
        subheading={subheading}
        features={features}
        columns={3}
        className={props.className}
      />
    )
  },
})
