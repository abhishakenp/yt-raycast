export const DYNAMIC_UI_LIBRARY_APPEND = String.raw`
── DYNAMIC INTERACTIONS (Swiper and Splide ship with exports; see https://github.com/themeselection/Awesome-JavaScript-Libraries#carousels for general patterns) ──
Marketing sites should combine several working surfaces, not a single carousel in isolation. For storefront or landing pages aim for all of the following:
- One product or collection strip implemented as a Swiper root (class swiper, swiper-wrapper and swiper-slide children, attribute data-sf-swiper) with at least three slides.
- A second motion surface: a Splide block, the generic carousel pattern from the main instructions, or a horizontal scroll-snap rail with obvious overflow.
- A working mobile navigation pattern using the data-mobile-nav and data-mobile-nav-toggle hooks from the main instructions.
- At least one of tabbed content, pricing period toggle, or FAQ accordion using the data attribute patterns from the main instructions.
- Optional scroll reveals, stat counters, or theme toggle; keep motion subtle and respect reduced motion.
For Splide-only strips such as testimonials or logos, use a section with class splide, attribute data-sf-splide, a splide__track wrapping a splide__list of at least three splide__slide items. Do not nest Splide markup inside Swiper roots.
`
