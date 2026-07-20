import { defineCapsule } from '#/capsules/openui.ts'
import type { ReactNode } from 'react'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * ManufacturingIndustries — a heavy-industrial industries-served spec grid for a
 * precision-manufacturing site. An asymmetric header (mono index eyebrow + giant
 * heading left, mono sector count right) sits above a collapsed-border (shared
 * thick-hairline) grid of slab cells, each carrying a mono index, a small
 * accent-tinted square icon slab, a sector title, a short description and a
 * hairline-topped mono certification ledger tag. A giant ghost watermark bleeds
 * behind. Tech-brutalist, binary-radius, industrial. Use to show specialized
 * expertise across critical sectors (aerospace, automotive, energy, medical,
 * defense, robotics, semiconductor, industrial) on machine-shop or fabricator
 * pages. Renders fully with no props via baked-in defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { IndustryGrid, IndustryCard } from '#/section-kit/IndustryGrid.tsx'
export const ManufacturingIndustries = defineCapsule({
  name: 'ManufacturingIndustries',
  description:
    'A heavy-industrial industries-served spec grid for a precision-manufacturing site: an asymmetric header (mono index eyebrow + giant heading left, mono sector count right) above a collapsed-border grid of slab cells, each with a mono index, a small accent-tinted square icon slab, a sector title, a short description and a hairline-topped mono certification ledger tag, with a giant ghost watermark behind. Tech-brutalist, binary-radius, industrial. Use to show specialized expertise across critical sectors (aerospace, automotive, energy, medical, defense, robotics, semiconductor, industrial) on machine-shop or fabricator pages.',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    description: z.string().optional(),
    items: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
          tag: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Industries Served'
    const heading =
      props.heading ?? 'Specialized Expertise Across Critical Sectors'
    const description =
      props.description ??
      'We understand the unique requirements, certifications, and quality standards that each industry demands.'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Aerospace',
            description:
              'AS9100D & NADCAP certified. Structural components, engine parts, and avionics housings for Boeing, Airbus, and defense contractors.',
            tag: 'AS9100D • ITAR Registered',
          },
          {
            title: 'Automotive',
            description:
              'EV drivetrain components, suspension parts, and prototype builds for Tesla, Ford, and tier-1 suppliers. IATF 16949 compliant.',
            tag: 'IATF 16949 • PPAP Capable',
          },
          {
            title: 'Energy & Oil',
            description:
              'Valve components, drilling equipment, and turbine parts. Corrosion-resistant alloys for harsh offshore and downhole environments.',
            tag: 'API Compliant • ISO 14001',
          },
          {
            title: 'Medical Devices',
            description:
              'Surgical instruments, implant components, and diagnostic equipment. ISO 13485 certified with full cleanroom assembly available.',
            tag: 'ISO 13485 • FDA Registered',
          },
          {
            title: 'Defense',
            description:
              'Armor systems, weapon components, and tactical equipment. ITAR registered with secure facilities and cleared personnel.',
            tag: 'ITAR • DFARS Compliant',
          },
          {
            title: 'Robotics',
            description:
              'Precision gears, actuator housings, and frame components. Tight tolerances for smooth motion control and repeatability.',
            tag: '±0.0005" Tolerance',
          },
          {
            title: 'Semiconductor',
            description:
              'Chamber components, wafer handling tools, and vacuum systems. UHV-compatible materials with ultra-clean surface finishes.',
            tag: 'UHV Compatible • Class 1000',
          },
          {
            title: 'Industrial',
            description:
              'Heavy machinery components, conveyor systems, and custom automation equipment. Large format machining and welding services.',
            tag: '24/7 Production',
          },
        ]
    const indIcons: ReactNode[] = [
      <svg
        key="n0"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
      </svg>,
      <svg
        key="n1"
        width="20"
        height="20"
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
        key="n2"
        width="20"
        height="20"
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
        key="n3"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>,
      <svg
        key="n4"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>,
      <svg
        key="n5"
        width="20"
        height="20"
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
        key="n6"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>,
      <svg
        key="n7"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>,
    ]
    return (
      <section
        className={cn(
          'relative overflow-hidden bg-muted py-20 lg:py-28',
          props.className,
        )}
      >
        <Watermark className="-right-4 top-10 text-[8rem] leading-none sm:text-[12rem]">
          08
        </Watermark>
        <Container className="relative">
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              align="left"
              eyebrow={eyebrow}
              title={heading}
              subtitle={description}
              className="max-w-3xl gap-0"
              eyebrowClassName="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground"
              titleClassName="mt-3 text-3xl font-extrabold uppercase tracking-tight text-foreground sm:text-4xl"
              subtitleClassName="mt-4 text-lg text-muted-foreground"
            />
            <MonoTag
              aria-hidden="true"
              className="shrink-0 md:mb-2 md:text-right"
            >
              {String(items.length).padStart(2, '0')} / Sectors
            </MonoTag>
          </div>
          <IndustryGrid
            cols="1-2-4"
            className="gap-0 border-l-2 border-t-2 border-foreground"
          >
            {items.map((item, i) => (
              <IndustryCard
                key={item.title}
                className="rounded-none border-0 border-b-2 border-r-2 border-foreground bg-card transition-colors hover:bg-muted"
              >
                <div className="flex h-full flex-col gap-3 p-6">
                  <div className="flex items-center justify-between">
                    <div className="inline-flex size-11 items-center justify-center rounded-none border-2 border-foreground bg-primary/10 text-primary">
                      {indIcons[i % indIcons.length]}
                    </div>
                    <span className="font-mono text-lg font-extrabold tabular-nums text-foreground/15">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold uppercase tracking-tight text-foreground">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                  <MonoTag
                    tone="faint"
                    className="mt-auto block border-t-2 border-foreground pt-3 text-[10px] tracking-[0.14em]"
                  >
                    {item.tag}
                  </MonoTag>
                </div>
              </IndustryCard>
            ))}
          </IndustryGrid>
        </Container>
      </section>
    )
  },
})
