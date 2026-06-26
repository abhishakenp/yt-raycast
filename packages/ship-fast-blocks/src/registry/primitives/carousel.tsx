import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { Card, CardContent } from '#/components/ui/card.tsx'
import {
  Carousel as UICarousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '#/components/ui/carousel.tsx'

// Compound primitive: flatten Carousel/CarouselContent/CarouselItem + prev/next
// buttons into one node. Each `slides` entry holds child content; if omitted a
// numbered placeholder set renders so it shows standalone. orientation mirrors
// the embla axis prop. basis sets how many slides are visible at once.
const basisMap = {
  full: 'basis-full',
  half: 'md:basis-1/2',
  third: 'md:basis-1/3',
} as const

export const Carousel = defineComponent({
  name: 'Carousel',
  description:
    "Sliding carousel with previous/next arrows. Each `slides` entry is one slide's content. `basis` controls slides-per-view.",
  props: z.object({
    slides: z.array(z.array(z.any())).optional(),
    orientation: z.enum(['horizontal', 'vertical']).optional(),
    basis: z.enum(['full', 'half', 'third']).optional(),
    className: z.string().optional(),
  }),
  component: ({ props, renderNode }) => {
    const slides = props.slides?.length ? props.slides : null
    const count = slides ? slides.length : 5
    return (
      <UICarousel
        orientation={props.orientation ?? 'horizontal'}
        className={props.className ?? 'w-full max-w-xs'}
      >
        <CarouselContent>
          {Array.from({ length: count }, (_, i) => (
            <CarouselItem key={i} className={basisMap[props.basis ?? 'full']}>
              {slides ? (
                renderNode(slides[i])
              ) : (
                <Card>
                  <CardContent className="flex aspect-square items-center justify-center p-6">
                    <span className="text-3xl font-semibold">{i + 1}</span>
                  </CardContent>
                </Card>
              )}
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </UICarousel>
    )
  },
})
