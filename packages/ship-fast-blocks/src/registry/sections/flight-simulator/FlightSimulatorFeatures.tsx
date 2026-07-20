import { defineCapsule } from '#/capsules/openui.ts'
import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { z } from 'zod/v4'

import {
  FeatureCard,
  FeatureIcon,
  FeatureTitle,
  FeatureDescription,
} from '#/section-kit/FeatureGrid.tsx'

/** Decorative div-built attitude indicator: rolled horizon + fixed aircraft symbol. */
function AttitudeIndicator() {
  return (
    <div
      aria-hidden="true"
      className="relative size-28 shrink-0 overflow-hidden rounded-full border-2 border-border sm:size-32"
    >
      <div
        className="absolute inset-[-30%]"
        style={{ transform: 'rotate(-12deg)' }}
      >
        <div className="absolute inset-x-0 top-0 h-1/2 bg-muted" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-foreground/15" />
        <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border" />
      </div>
      <div className="absolute left-1/2 top-1/2 h-0.5 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary" />
      <div className="absolute left-1/2 top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary bg-background" />
      <div className="absolute left-1/2 top-1.5 h-2 w-0.5 -translate-x-1/2 rounded-full bg-muted-foreground/70" />
    </div>
  )
}

/**
 * FlightSimulatorFeatures — an instrument-panel capability bento for a flight
 * simulator landing page. An asymmetric mono HUD header sits above a
 * collapsed-border grid of sharp-cornered cells built from the shared
 * `FeatureCard` slots: a wide lead cell pairs a div-built attitude-indicator gauge
 * with the headline capability, a second wide cell carries a giant ghost index
 * numeral, and four square cells each stack a mono `NN / SYS` index, a bordered
 * line-icon, a title, and a description. Six baked features cover real flight
 * physics, global photoreal scenery, live real-world weather, true-to-life
 * multiplayer ATC, study-level aircraft systems, and VR support. Use to sell the
 * depth of a flight sim, airliner / combat sim, or aviation training title.
 * Renders fully with no props via baked defaults.
 */
function PhysicsIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M3 19c4-2 6-6 8-11 1.5 4 4 7 10 8" />
      <path d="M14 5l3-2 1 4" />
    </svg>
  )
}

function SceneryIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18" />
    </svg>
  )
}

function WeatherIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M7 17a4 4 0 0 1 .5-7.96A5 5 0 0 1 17 9a3.5 3.5 0 0 1 .5 8H7z" />
      <path d="M9 21l-1 1M13 21l-1 1M17 21l-1 1" />
    </svg>
  )
}

function AtcIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2v6" />
      <path d="M9 8h6l1 12H8z" />
      <path d="M5 6a9 9 0 0 1 14 0" />
      <path d="M7.5 8.5a5.5 5.5 0 0 1 9 0" />
    </svg>
  )
}

function SystemsIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 12l4-3" />
      <circle cx="12" cy="12" r="1.5" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2" />
    </svg>
  )
}

function VrIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="2" y="7" width="20" height="10" rx="3" />
      <path d="M9 17l1.5-2.5a2 2 0 0 1 3 0L15 17" />
    </svg>
  )
}

export const FlightSimulatorFeatures = defineCapsule({
  name: 'FlightSimulatorFeatures',
  description:
    'Instrument-panel capability bento for a flight-simulator landing page built on the shared FeatureCard slots: an asymmetric mono HUD header above a collapsed-border grid of sharp-cornered cells — a wide lead cell pairs a div-built attitude-indicator gauge with the headline capability, a second wide cell carries a giant ghost index numeral, and four square cells each stack a mono NN / SYS index, a bordered line-icon, a title, and a description. Six baked features cover real flight physics, global photoreal scenery, live real-world weather, true-to-life multiplayer ATC, study-level aircraft systems, and VR support. Use to sell the depth of a flight sim, airliner / combat sim, or aviation training title.',
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
    const heading = props.heading ?? 'Built for true-to-life flight'
    const defaults = [
      {
        title: 'Real flight physics',
        description:
          'A high-fidelity aerodynamic model simulates lift, drag, and ground effect for every airframe — so a heavy jet handles nothing like a glider.',
        icon: <PhysicsIcon className="size-6" />,
      },
      {
        title: 'Global photoreal scenery',
        description:
          'Stream the entire planet in stunning detail, from city skylines and mountain ranges to the bush strip behind your hometown.',
        icon: <SceneryIcon className="size-6" />,
      },
      {
        title: 'Live real-world weather',
        description:
          'Fly into the exact conditions happening right now — real winds aloft, pressure, cloud layers, and storm systems pulled from live data.',
        icon: <WeatherIcon className="size-6" />,
      },
      {
        title: 'True-to-life multiplayer ATC',
        description:
          'Share busy airspace with thousands of live pilots and talk to real human controllers for authentic clearances and approaches.',
        icon: <AtcIcon className="size-6" />,
      },
      {
        title: 'Study-level aircraft systems',
        description:
          'Cold-and-dark startups, modeled failures, and faithful avionics let you fly procedures exactly as the real flight crews do.',
        icon: <SystemsIcon className="size-6" />,
      },
      {
        title: 'VR support',
        description:
          'Step into the cockpit in full virtual reality with native headset support, room-scale tracking, and reach-out-and-touch controls.',
        icon: <VrIcon className="size-6" />,
      },
    ]
    const features = props.features?.length
      ? props.features.map((f, i) => ({
          ...f,
          icon: defaults[i % defaults.length].icon,
        }))
      : defaults

    const cellBase =
      'group relative gap-4 rounded-none border-0 border-b border-r border-border p-6 shadow-none transition-[background-color] duration-150 hover:bg-muted/40 sm:p-8'

    return (
      <section
        className={cn(
          'relative overflow-hidden bg-background pb-20 pt-24 lg:pb-28 lg:pt-28',
          props.className,
        )}
      >
        <Container className="relative">
          {/* Asymmetric HUD header. */}
          <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:mb-14">
            <div className="max-w-2xl">
              <MonoTag className="mb-4 flex items-center gap-2.5">
                <span
                  aria-hidden="true"
                  className="h-1.5 w-1.5 rounded-full bg-primary"
                />
                Systems
              </MonoTag>
              <SectionHeading
                align="left"
                title={heading}
                subtitle={props.subheading}
                titleClassName="text-3xl font-extrabold tracking-tight sm:text-4xl"
              />
            </div>
            <MonoTag tone="faint" className="shrink-0 tabular-nums">
              [ {String(features.length).padStart(2, '0')} systems ] armed
            </MonoTag>
          </div>

          {/* Collapsed-border instrument bento. */}
          <div className="grid grid-cols-1 border-l border-t border-border sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => {
              const __iv__ = f as {
                title: string
                description: string
                icon?: React.ReactNode
                points?: string[]
                cta?: string
                price?: string
                imageAlt?: string
              }
              const monoIndex = `${String(i + 1).padStart(2, '0')} / SYS`

              if (i === 0) {
                return (
                  <FeatureCard
                    key={__iv__.title}
                    className={cn(cellBase, 'sm:col-span-2 lg:col-span-2')}
                  >
                    <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
                      <AttitudeIndicator />
                      <div className="flex flex-col gap-3">
                        <MonoTag tone="primary">{monoIndex}</MonoTag>
                        <FeatureTitle className="text-2xl font-bold tracking-tight">
                          {__iv__.title}
                        </FeatureTitle>
                        <FeatureDescription className="text-pretty text-[15px] leading-relaxed">
                          {__iv__.description}
                        </FeatureDescription>
                      </div>
                    </div>
                  </FeatureCard>
                )
              }

              if (i === 1) {
                return (
                  <FeatureCard
                    key={__iv__.title}
                    className={cn(
                      cellBase,
                      'justify-between overflow-hidden sm:col-span-2 lg:col-span-2',
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute -right-2 -top-6 select-none font-mono text-[8rem] font-extrabold leading-none tracking-tighter text-foreground/[0.05]"
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className="relative flex flex-col gap-3">
                      <MonoTag>{monoIndex}</MonoTag>
                      <FeatureTitle className="text-xl font-bold tracking-tight">
                        {__iv__.title}
                      </FeatureTitle>
                      <FeatureDescription className="text-pretty text-[15px] leading-relaxed">
                        {__iv__.description}
                      </FeatureDescription>
                    </div>
                  </FeatureCard>
                )
              }

              return (
                <FeatureCard key={__iv__.title} className={cellBase}>
                  <div className="flex items-center justify-between">
                    <MonoTag>{monoIndex}</MonoTag>
                    {__iv__.icon && (
                      <FeatureIcon className="size-9 rounded-none border border-border bg-card text-foreground group-hover:border-primary/50 group-hover:text-primary">
                        {__iv__.icon}
                      </FeatureIcon>
                    )}
                  </div>
                  <FeatureTitle className="mt-1 text-lg font-bold tracking-tight">
                    {__iv__.title}
                  </FeatureTitle>
                  <FeatureDescription className="text-pretty leading-relaxed">
                    {__iv__.description}
                  </FeatureDescription>
                </FeatureCard>
              )
            })}
          </div>
        </Container>
      </section>
    )
  },
})
