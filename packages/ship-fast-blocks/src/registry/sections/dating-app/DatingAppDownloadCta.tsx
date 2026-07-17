import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'
import { CtaBand } from '#/section-kit/CtaBand.tsx'

/**
 * DatingAppDownloadCta — a bold app-download CTA band for a dating / matchmaking
 * app. A dark foreground-surfaced two-column band: on the left a big heading, a
 * supporting paragraph, and App Store + Google Play store buttons (each with its
 * glyph and two-line label); on the right a tilted phone mockup with an overlaid
 * in-app profile card and a floating "New Match!" notification chip. Store buttons
 * route through useNavigate and the mockup imagery is alt-driven. Use as the final
 * conversion / install push for dating apps, singles platforms, or any mobile app
 * landing page. Renders fully with no props via baked-in "HeartLink" defaults.
 */
export const DatingAppDownloadCta = defineCapsule({
  name: 'DatingAppDownloadCta',
  description:
    "Bold app-download CTA band for a dating / matchmaking app: a dark foreground-surfaced two-column band — left has a big heading, a supporting paragraph, and App Store + Google Play store buttons (each with its glyph and two-line label); right has a tilted phone mockup with an overlaid in-app profile card and a floating 'New Match!' notification chip. Store buttons route through useNavigate; mockup imagery is alt-driven <Image>. Use as the final conversion / install push for dating apps, singles platforms, or any mobile app landing page.",
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    appStore: z.string().optional(),
    googlePlay: z.string().optional(),
    /** Alt text for the phone-mockup screen image. */
    mockupAlt: z.string().optional(),
    mockupProfileName: z.string().optional(),
    mockupProfileMeta: z.string().optional(),
    /** Alt text for the small overlaid profile photo. */
    mockupProfileImageAlt: z.string().optional(),
    floatTitle: z.string().optional(),
    floatMeta: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const downloadHeading = props.heading ?? 'Your perfect match is waiting'
    const downloadDesc =
      props.description ??
      'Download HeartLink today and join 2 million singles already finding meaningful connections. Your next great conversation starts with a single tap.'
    const appStore = props.appStore ?? 'App Store'
    const googlePlay = props.googlePlay ?? 'Google Play'
    const mockupAlt =
      props.mockupAlt ??
      'app interface showing matching screen with profile cards'
    const mockupProfileName = props.mockupProfileName ?? 'Alex, 26'
    const mockupProfileMeta = props.mockupProfileMeta ?? 'Software Engineer'
    const mockupProfileImageAlt =
      props.mockupProfileImageAlt ??
      'profile photo of Alex a 26 year old software engineer'
    const floatTitle = props.floatTitle ?? 'New Match!'
    const floatMeta = props.floatMeta ?? 'Jessica liked you'

    const HeartGlyph = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        className={className}
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
          clipRule="evenodd"
        />
      </svg>
    )

    const Check = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M5 13l4 4L19 7" />
      </svg>
    )

    return (
      <CtaBand
        tone="muted"
        title={downloadHeading}
        subtitle={downloadDesc}
        titleClassName="text-background font-bold sm:text-4xl lg:text-5xl"
        subtitleClassName="text-background/70 text-xl leading-relaxed"
        innerClassName="max-w-7xl gap-12 py-24"
        className={`bg-foreground text-background ${props.className ?? ''}`}
      >
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <div className="flex flex-col gap-4 sm:flex-row">
              <button
                type="button"
                onClick={() => go(appStore)}
                className="inline-flex items-center justify-center gap-3 rounded-xl bg-background px-6 py-4 font-semibold text-foreground transition-colors hover:bg-background/90"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="size-7"
                  aria-hidden="true"
                >
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                <span className="text-left">
                  <span className="block text-xs text-muted-foreground">
                    Download on the
                  </span>
                  <span className="-mt-1 block text-lg font-semibold">
                    {appStore}
                  </span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => go(googlePlay)}
                className="inline-flex items-center justify-center gap-3 rounded-xl bg-background px-6 py-4 font-semibold text-foreground transition-colors hover:bg-background/90"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="size-7"
                  aria-hidden="true"
                >
                  <path d="M3,20.5V3.5C3,2.91 3.4,2.38 4,2.2L13.69,12L4,21.8C3.4,21.62 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                </svg>
                <span className="text-left">
                  <span className="block text-xs text-muted-foreground">
                    Get it on
                  </span>
                  <span className="-mt-1 block text-lg font-semibold">
                    {googlePlay}
                  </span>
                </span>
              </button>
            </div>
          </div>
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative">
              <div className="w-64 rounded-3xl bg-card p-3 shadow-2xl sm:w-72">
                <div className="relative aspect-[9/16] overflow-hidden rounded-2xl bg-muted">
                  <Image
                    alt={mockupAlt}
                    w={400}
                    h={700}
                    className="size-full object-cover"
                  />
                  <div className="absolute inset-x-4 bottom-8 space-y-3">
                    <div className="rounded-xl bg-card p-3 shadow-lg">
                      <div className="flex items-center gap-3">
                        <Image
                          alt={mockupProfileImageAlt}
                          w={100}
                          h={100}
                          className="size-10 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-card-foreground">
                            {mockupProfileName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {mockupProfileMeta}
                          </p>
                        </div>
                        <span className="grid size-8 place-items-center rounded-full bg-primary text-primary-foreground">
                          <HeartGlyph className="size-4" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -left-6 hidden rounded-xl bg-card p-4 shadow-lg sm:block">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-full bg-primary/10 text-primary">
                    <Check className="size-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-card-foreground">
                      {floatTitle}
                    </p>
                    <p className="text-xs text-muted-foreground">{floatMeta}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CtaBand>
    )
  },
})
