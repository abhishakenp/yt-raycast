import { defineCapsule } from '#/capsules/openui.ts'
import type { ReactNode } from 'react'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import {
  FeatureCard,
  FeatureIcon,
  FeatureTitle,
  FeatureDescription,
} from '#/section-kit/FeatureGrid.tsx'

/**
 * ManufacturingCapabilities — a heavy-industrial capabilities / services spec
 * grid for a precision-manufacturing site. An asymmetric header pairs a mono
 * index eyebrow + giant heading block on the left with a mono capability count on
 * the right, above a collapsed-border (shared thick-hairline) grid of slab cells,
 * each carrying a mono index, a hard-bordered square icon slab, a title and a
 * spec-rich description, flooding to a muted surface on hover. Tech-brutalist,
 * binary-radius, industrial. Use to present full-service manufacturing
 * capabilities (CNC machining, sheet metal, grinding, wire EDM, finishing,
 * inspection) on machine-shop or fabricator pages. Renders fully with no props
 * via baked-in defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
export const ManufacturingCapabilities = defineCapsule({
  name: 'ManufacturingCapabilities',
  description:
    'A heavy-industrial capabilities / services spec grid for a precision-manufacturing site: an asymmetric header (mono index eyebrow + giant heading block left, mono capability count right) above a collapsed-border grid of slab cells, each with a mono index, a hard-bordered square icon slab, a title and a spec-rich description that floods to a muted surface on hover. Tech-brutalist, binary-radius, industrial. Use to present full-service manufacturing capabilities (CNC machining, sheet metal, grinding, wire EDM, finishing, inspection) on machine-shop or fabricator pages.',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    description: z.string().optional(),
    items: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Capabilities'
    const heading = props.heading ?? 'Full-Service Manufacturing Under One Roof'
    const description =
      props.description ??
      'From 5-axis CNC machining to precision sheet metal fabrication, our 180,000 sq ft facility houses the latest manufacturing technology and skilled craftsmen.'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: '5-Axis CNC Machining',
            description:
              'Simultaneous 5-axis machining centers with pallet changers for complex geometries. Work envelope up to 60" x 30" x 24". Tolerances to ±0.0005" on aluminum, titanium, and Inconel.',
          },
          {
            title: 'Sheet Metal Fabrication',
            description:
              'Laser cutting (up to 1" steel), CNC press brakes (220-ton capacity), and robotic welding cells. Materials: steel, stainless, aluminum, copper, brass from 24 ga to 1" plate.',
          },
          {
            title: 'Precision Grinding',
            description:
              'Surface, cylindrical, and centerless grinding services. Mirror finishes to 4 Ra. Dimensional tolerances within ±0.0001". Ideal for aerospace shafts, medical instruments, and precision tooling.',
          },
          {
            title: 'Wire EDM',
            description:
              'High-precision wire EDM for complex profiles and tight internal radii. 0.004" wire diameter capability. Positioning accuracy ±0.0001". Perfect for hardened materials and intricate cuts.',
          },
          {
            title: 'Finishing & Coating',
            description:
              'Anodizing (Type II & III), powder coating, passivation, chem film (Alodine), and custom painting. NADCAP-certified processes for aerospace applications. Full traceability on all finishes.',
          },
          {
            title: 'Quality Inspection',
            description:
              'CMM inspection (Bridge and Arm), optical comparators, surface roughness testers, and certified calibration lab. FAIR, PPAP, and full material certifications provided with every order.',
          },
        ]
    const capIcons: ReactNode[] = [
      <svg
        key="i0"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>,
      <svg
        key="i1"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>,
      <svg
        key="i2"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>,
      <svg
        key="i3"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>,
      <svg
        key="i4"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>,
      <svg
        key="i5"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
      </svg>,
    ]
    return (
      <section className={cn('bg-background py-20 lg:py-28', props.className)}>
        <Container>
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:mb-16">
            <SectionHeading
              align="left"
              eyebrow={eyebrow}
              title={heading}
              subtitle={description}
              className="max-w-3xl gap-0"
              eyebrowClassName="font-mono uppercase tracking-[0.2em] text-muted-foreground"
              titleClassName="mt-3 font-extrabold uppercase tracking-tight sm:text-4xl"
              subtitleClassName="mt-4 text-lg"
            />
            <MonoTag
              aria-hidden="true"
              className="shrink-0 md:mb-2 md:text-right"
            >
              {String(items.length).padStart(2, '0')} / Processes
            </MonoTag>
          </div>
          <div className="grid grid-cols-1 border-l-2 border-t-2 border-foreground sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, i) => (
              <FeatureCard
                key={item.title}
                className="group rounded-none border-0 border-b-2 border-r-2 border-foreground bg-card p-6 transition-colors hover:bg-muted sm:p-7"
              >
                <div className="mb-5 flex items-center justify-between">
                  <FeatureIcon className="grid size-12 place-items-center rounded-none border-2 border-foreground bg-background text-foreground">
                    {capIcons[i % capIcons.length]}
                  </FeatureIcon>
                  <span className="font-mono text-2xl font-extrabold tabular-nums text-foreground/15">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                <FeatureTitle className="mb-2 font-bold uppercase tracking-tight">
                  {item.title}
                </FeatureTitle>
                <FeatureDescription className="leading-relaxed">
                  {item.description}
                </FeatureDescription>
              </FeatureCard>
            ))}
          </div>
        </Container>
      </section>
    )
  },
})
