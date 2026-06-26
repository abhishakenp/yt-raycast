import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { GalleryGrid } from '#/section-kit/GalleryGrid.tsx'

/**
 * FlightSimulatorGallery — a screenshot showcase for a flight simulator landing
 * page. Thin configuration over the shared `GalleryGrid` composite: a centered
 * heading above a responsive grid of in-game captures, each driven by an
 * evocative alt prompt and a short caption naming the aircraft, airport, and
 * lighting. Six baked screenshots span airliners, bush flying, and night ops.
 * Use to flaunt the visual fidelity of a flight sim, airliner / combat sim, or
 * aviation title. Renders fully with no props via baked defaults.
 */
export const FlightSimulatorGallery = defineComponent({
  name: 'FlightSimulatorGallery',
  description:
    'Screenshot showcase for a flight-simulator landing page built on the shared GalleryGrid composite: a centered heading above a responsive grid of in-game captures, each driven by an evocative alt prompt and a short caption naming the aircraft, airport, and lighting. Six baked screenshots span airliners, bush flying, and night ops. Use to flaunt the visual fidelity of a flight sim, airliner / combat sim, or aviation title.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting subheading under the heading. */
    subheading: z.string().optional(),
    /** Screenshots: alt prompt + caption. */
    images: z
      .array(z.object({ alt: z.string(), caption: z.string().optional() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Screenshots from the cockpit'
    const images = props.images?.length
      ? props.images
      : [
          {
            alt: 'Boeing 787 Dreamliner on final approach into a mountain airport at sunset with snow-capped peaks',
            caption: '787 on final into a mountain airport at sunset',
          },
          {
            alt: 'bush plane on floats parked on a glassy alpine lake surrounded by pine forest in early morning fog',
            caption: 'Floatplane moored on a glassy alpine lake',
          },
          {
            alt: 'airliner cockpit panel glowing at night with city lights twinkling far below through the windscreen',
            caption: 'Night cruise over a glittering coastal city',
          },
          {
            alt: 'fighter jet banking hard over a desert canyon kicking up vapor from the wingtips',
            caption: 'Low-level pass through a desert canyon',
          },
          {
            alt: 'wide ramp shot of a busy international airport with dozens of parked airliners under a dramatic cloudy sky',
            caption: 'Busy international ramp under storm clouds',
          },
          {
            alt: 'single-engine prop plane on short final over a grass runway in rolling green countryside at golden hour',
            caption: 'Short final to a grass strip at golden hour',
          },
        ]

    return (
      <GalleryGrid
        heading={heading}
        subheading={props.subheading}
        images={images}
        columns={3}
        className={props.className}
      />
    )
  },
})
