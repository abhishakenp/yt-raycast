import { defineCapsule } from '#/capsules/openui.ts'
import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { z } from 'zod/v4'
import {
  Globe2Icon,
  Layers3Icon,
  RadarIcon,
  ShieldCheckIcon,
  UsersRoundIcon,
  WandSparklesIcon,
} from 'lucide-react'

import {
  FeatureCard,
  FeatureIcon,
  FeatureTitle,
  FeatureDescription,
} from '#/section-kit/FeatureGrid.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'

/**
 * AuthFeatures — capability dossier for Authly, a developer authentication
 * product. A sticky left rail holds a large tight-tracked heading and a live
 * "feature map" console card; the right side is an asymmetric editorial grid
 * of capability cards, each opening with a mono dossier mark above a title
 * with an inline line-icon, a description, and a hairline signal rule. Baked
 * defaults cover the core auth surface — SSO / SAML, MFA & 2FA, passwordless,
 * user management, social login, and bot & fraud protection. Use to explain an
 * auth platform, identity API, or login SDK. Renders fully with no props.
 */
export const AuthFeatures = defineCapsule({
  name: 'AuthFeatures',
  description:
    "Capability dossier for a developer-auth product: a sticky left rail with a large tight-tracked heading ('Everything you need to ship auth') and a live 'feature map' console card beside an asymmetric editorial grid of capability cards — mono dossier marks above titles with inline line-icons, descriptions, and hairline signal rules. Baked defaults cover SSO / SAML, MFA & 2FA, passwordless (magic links + passkeys), a user-management dashboard, social login (OAuth), and bot & fraud protection. Use to explain an auth platform, identity API, or login SDK.",
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
    const heading = props.heading ?? 'Everything you need to ship auth'
    const subheading =
      props.subheading ??
      'A complete identity platform behind a clean API — add only what you need and scale the rest as you grow.'

    const icons = [
      <Layers3Icon className="size-5" aria-hidden="true" />,
      <ShieldCheckIcon className="size-5" aria-hidden="true" />,
      <WandSparklesIcon className="size-5" aria-hidden="true" />,
      <UsersRoundIcon className="size-5" aria-hidden="true" />,
      <Globe2Icon className="size-5" aria-hidden="true" />,
      <RadarIcon className="size-5" aria-hidden="true" />,
    ]

    const baked = props.features?.length
      ? props.features
      : [
          {
            title: 'SSO & SAML',
            description:
              'Enterprise single sign-on with SAML and OIDC. Connect Okta, Azure AD, Google Workspace, and any IdP in minutes.',
          },
          {
            title: 'MFA & 2FA',
            description:
              'Step-up authentication with TOTP authenticator apps, SMS, and WebAuthn — enforced by policy per app or per role.',
          },
          {
            title: 'Passwordless',
            description:
              'Magic links and passkeys out of the box. Cut password resets and phishing risk while raising conversion.',
          },
          {
            title: 'User management',
            description:
              'A drop-in dashboard for users, sessions, and organizations — invite, suspend, and audit without writing UI.',
          },
          {
            title: 'Social login',
            description:
              'One-click OAuth with Google, GitHub, Apple, and 20+ providers. Pre-built buttons and managed token refresh.',
          },
          {
            title: 'Bot & fraud protection',
            description:
              'Adaptive risk scoring, rate limiting, and breached-password detection block credential-stuffing automatically.',
          },
        ]

    const features = baked.map((f, i) => ({
      ...f,
      icon: icons[i % icons.length],
    }))
    const featureMarks = ['lead', 'signal', 'path', 'flow', 'reach', 'guard']
    const featureLayouts = [
      'md:col-span-2 xl:col-span-3 xl:-rotate-1 max-lg:-rotate-1',
      'md:col-span-2 xl:col-span-3 xl:translate-y-6 xl:rotate-1 max-lg:rotate-1 max-lg:translate-x-1.5',
      'xl:col-span-2 xl:rotate-1 max-lg:rotate-[0.6deg] max-lg:-translate-x-1.5',
      'xl:col-span-2 xl:translate-y-6 xl:-rotate-1 max-lg:-rotate-[0.6deg] max-lg:translate-x-1',
      'xl:col-span-2 xl:-rotate-[0.5deg] max-lg:rotate-1 max-lg:-translate-x-1',
      'md:col-span-2 xl:col-span-6 max-lg:-rotate-[0.5deg]',
    ]

    return (
      <section
        className={cn(
          'overflow-hidden border-y border-border bg-muted/30 py-16 sm:py-20 lg:py-28',
          props.className,
        )}
      >
        <Container>
          <div className="grid gap-10 xl:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] xl:items-start">
            <div className="lg:sticky lg:top-24">
              <SectionHeading
                title={heading}
                subtitle={subheading}
                align="left"
                className="max-w-xl"
                titleClassName="text-balance text-3xl font-semibold tracking-tight sm:text-4xl lg:text-[2.6rem] lg:leading-[1.12]"
                subtitleClassName="text-pretty leading-7"
              />
              <div className="mt-8 max-w-sm rounded-2xl border border-border bg-background p-4 shadow-sm shadow-foreground/5 max-lg:-rotate-[0.6deg] lg:block">
                <div className="flex items-center justify-between border-b border-border pb-3 font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  <span>feature map</span>
                  <span className="inline-flex items-center gap-1.5">
                    <span
                      aria-hidden="true"
                      className="size-1.5 rounded-full bg-primary"
                    />
                    live
                  </span>
                </div>
                <div className="mt-4 space-y-3 font-mono text-xs text-muted-foreground">
                  {features.slice(0, 3).map((feature, index) => (
                    <div
                      key={feature.title}
                      className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3"
                    >
                      <span className="text-primary">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="truncate text-foreground">
                        {feature.title}
                      </span>
                      <span aria-hidden="true">· ok</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2 xl:grid-cols-6 lg:gap-5">
              {features.map((f, index) => {
                const mark = featureMarks[index % featureMarks.length]
                const layout = featureLayouts[index % featureLayouts.length]
                return (
                  <FeatureCard
                    key={f.title}
                    className={cn(
                      'relative min-w-0 overflow-hidden rounded-2xl border-border bg-background p-5 shadow-sm shadow-foreground/5 sm:p-6',
                      layout,
                    )}
                  >
                    <span className="-mx-5 -mt-5 mb-5 block w-fit rounded-br-xl border-b border-r border-border bg-muted/70 px-4 py-2 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground sm:-mx-6 sm:-mt-6">
                      {mark} {String(index + 1).padStart(2, '0')}
                    </span>
                    {layout.includes('col-span-6') ? (
                      <span
                        aria-hidden="true"
                        className="absolute right-6 top-6 hidden -rotate-3 rounded-md border-[3px] border-double border-primary/50 px-2.5 py-1 font-mono text-[0.65rem] font-bold uppercase tracking-[0.14em] text-primary/70 max-lg:inline-flex xl:inline-flex"
                      >
                        cleared
                      </span>
                    ) : null}
                    <div className="min-w-0 space-y-2">
                      <FeatureTitle className="flex items-center gap-2.5 text-base font-semibold leading-7 text-balance sm:text-lg">
                        <FeatureIcon className="size-8 shrink-0 rounded-lg bg-transparent text-primary">
                          {f.icon}
                        </FeatureIcon>
                        {f.title}
                      </FeatureTitle>
                      <FeatureDescription className="text-sm leading-6 text-pretty">
                        {f.description}
                      </FeatureDescription>
                    </div>
                    <div
                      className="mt-6 flex items-center gap-2"
                      aria-hidden="true"
                    >
                      <span className="h-px w-8 shrink-0 bg-primary" />
                      <span className="h-px flex-1 bg-border" />
                    </div>
                  </FeatureCard>
                )
              })}
            </div>
          </div>
        </Container>
      </section>
    )
  },
})
