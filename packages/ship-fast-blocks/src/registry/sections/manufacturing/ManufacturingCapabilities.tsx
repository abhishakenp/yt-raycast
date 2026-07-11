import { defineCapsule } from '#/capsules/openui.ts'
import type { ReactNode } from 'react'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { ResponsiveGrid } from '#/section-kit/index.ts'

/**
 * ManufacturingCapabilities — a 6-up capabilities / services grid for a
 * precision-manufacturing site. A centered eyebrow + heading + description intro
 * sits above a responsive three-column grid of muted cards, each with a rounded
 * icon tile (rotating through a built-in industrial icon set), a title and a
 * spec-rich description, lifting to an accent surface on hover. Clean, neutral,
 * industrial. Use to present full-service manufacturing capabilities (CNC
 * machining, sheet metal, grinding, wire EDM, finishing, inspection) on machine-
 * shop or fabricator pages. Renders fully with no props via baked-in defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
export const ManufacturingCapabilities = defineCapsule({
  name: 'ManufacturingCapabilities',
  description:
    'A 6-up capabilities / services grid for a precision-manufacturing site: a centered eyebrow + heading + description intro above a responsive three-column grid of muted cards, each with a rounded icon tile (rotating through a built-in industrial icon set), a title and a spec-rich description, lifting to an accent surface on hover. Clean, neutral, industrial. Use to present full-service manufacturing capabilities (CNC machining, sheet metal, grinding, wire EDM, finishing, inspection) on machine-shop or fabricator pages.',
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
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              {eyebrow}
            </span>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {heading}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">{description}</p>
          </div>
          <ResponsiveGrid cols="1-md-2-3" gap="lg">
            {items.map((item, i) => (
              <article
                key={item.title}
                className="group rounded-lg bg-muted p-6 transition-colors hover:bg-accent"
              >
                <div className="mb-4 grid size-12 place-items-center rounded-lg bg-secondary text-foreground">
                  {capIcons[i % capIcons.length]}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </article>
            ))}
          </ResponsiveGrid>
        </Container>
      </section>
    )
  },
})
