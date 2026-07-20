import { defineCapsule } from '#/capsules/openui.ts'
import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { z } from 'zod/v4'

import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import {
  ServicesGrid,
  ServiceCard,
  ServiceIcon,
  ServiceTitle,
  ServiceDescription,
} from '#/section-kit/ServicesGrid.tsx'

/**
 * PortfolioServices — a numbered "what I do" capability ledger for a
 * creative-individual portfolio. A left-aligned editorial header (mono index +
 * uppercase label, giant clamp extrabold heading, lead line) over a faint ghost
 * watermark, above a responsive 3-up grid of sharp rounded-none hairline
 * service plates. Each plate leads with an oversized mono index numeral (not an
 * icon tile), then the service title and a short description; the plate lifts on
 * hover and presses down on click. Use to outline the disciplines a freelancer
 * or studio offers — art direction, motion, 3D, branding, web — on a designer,
 * animator, or director personal site. Renders fully with no props via baked-in
 * defaults (six services).
 */
export const PortfolioServices = defineCapsule({
  name: 'PortfolioServices',
  description:
    "Numbered 'what I do' capability ledger for a creative-individual portfolio built on the shared ServicesGrid composite: a left-aligned editorial header (mono index + uppercase label, giant clamp extrabold heading, lead line) over a faint ghost watermark, above a responsive 3-up grid of sharp rounded-none hairline service plates. Each plate leads with an oversized mono index numeral instead of an icon tile, then the service title and a short description, and lifts on hover / presses on click. Use to outline the disciplines a freelancer or studio offers — art direction, motion, 3D, branding, web — on a designer, animator, or director personal site.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting line under the heading. */
    subheading: z.string().optional(),
    /** Service cards: title + description. */
    services: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'What I do'
    const subheading =
      props.subheading ??
      'A focused set of services for brands and studios that care about craft — from the first concept to the final frame.'
    const services = props.services?.length
      ? props.services
      : [
          {
            title: 'Art Direction',
            description:
              'Setting the visual language for a brand or campaign — mood, palette, type, and motion principles that hold across every touchpoint.',
          },
          {
            title: 'Motion Design',
            description:
              'Brand films, product reveals, and title sequences with kinetic typography and cinematic camera work built to perform.',
          },
          {
            title: '3D & CGI',
            description:
              'Photoreal and stylised 3D in C4D, Houdini, and Blender — from fluid sims to full environments rendered with Redshift or Octane.',
          },
          {
            title: 'Brand Identity',
            description:
              'Logos, systems, and guidelines that give a product a distinct, ownable presence and scale gracefully across media.',
          },
          {
            title: 'Web & Interactive',
            description:
              'Immersive sites and interactive launches that translate the brand world into a fast, responsive on-screen experience.',
          },
          {
            title: 'Creative Consulting',
            description:
              'Hands-on direction for in-house teams — from pitch to delivery, helping shape the work and keep the craft high.',
          },
        ]

    return (
      <section
        className={cn(
          'relative overflow-hidden bg-background pt-28 pb-20 lg:pt-32 lg:pb-28',
          props.className,
        )}
      >
        <Watermark className="-bottom-6 -right-2 text-[7rem] sm:text-[11rem] lg:text-[14rem]">
          Craft
        </Watermark>
        <Container className="relative">
          {/* Left-aligned editorial header, replacing the centered kit heading. */}
          <div className="mb-14 max-w-2xl">
            <div className="mb-4 flex items-center gap-4">
              <MonoTag tone="muted">02 · Services</MonoTag>
              <span aria-hidden="true" className="h-px w-16 bg-border" />
            </div>
            <h2 className="text-[clamp(1.9rem,4.5vw,3rem)] font-extrabold leading-[1.02] tracking-tighter text-foreground text-balance">
              {heading}
            </h2>
            <p className="mt-4 max-w-[560px] text-[1.05rem] leading-relaxed text-muted-foreground text-pretty">
              {subheading}
            </p>
          </div>

          <ServicesGrid>
            {services.map((s, i) => {
              const __iv__ = s as {
                title: string
                description: string
                icon?: React.ReactNode
              }
              return (
                <ServiceCard
                  key={__iv__.title}
                  className="gap-4 rounded-none border-2 border-border bg-transparent p-7 transition-all duration-150 hover:-translate-y-1 hover:border-foreground active:translate-x-[2px] active:translate-y-[2px]"
                >
                  <ServiceIcon className="size-auto items-start justify-start rounded-none bg-transparent p-0 font-mono text-4xl font-extrabold leading-none tabular-nums text-foreground/15">
                    <span aria-hidden="true">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </ServiceIcon>
                  <ServiceTitle className="text-lg font-bold tracking-tight">
                    {__iv__.title}
                  </ServiceTitle>
                  <ServiceDescription className="leading-relaxed">
                    {__iv__.description}
                  </ServiceDescription>
                </ServiceCard>
              )
            })}
          </ServicesGrid>
        </Container>
      </section>
    )
  },
})
