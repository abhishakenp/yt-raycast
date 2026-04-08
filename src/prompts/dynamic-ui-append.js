export const DYNAMIC_UI_LIBRARY_APPEND = String.raw`
── DYNAMIC INTERACTIONS (see https://github.com/themeselection/Awesome-JavaScript-Libraries#carousels — Swiper, Splide, Glide, Keen, Tiny Slider, etc.; emulate with shipped runtimes below) ──
Marketing sites must feel alive: combine multiple behaviors (not one lonely carousel). Minimum for storefront/landing pages:
(1) Product or collection strip: class "swiper" + .swiper-wrapper / .swiper-slide + data-sf-swiper (3+ slides).
(2) A second motion surface: EITHER Splide section OR data-carousel OR horizontal scroll-snap strip with visible overflow.
(3) Mobile nav data-mobile-nav + data-mobile-nav-toggle.
(4) At least one of: data-tab-group OR data-pricing-billing OR data-accordion FAQ.
(5) data-reveal on 2+ sections AND [data-counter] on stats OR logo/testimonial data-carousel with working prev/next.
(6) Optional: button data-theme-toggle for dark/light class on documentElement; subtle CSS @keyframes on hero; hover:scale on primary CTAs.
Splide (secondary carousels — testimonials, logos, press): wrap in <section class="splide" data-sf-splide aria-label="…"><div class="splide__track"><ul class="splide__list"><li class="splide__slide">…</li> (3+ slides)</ul></div></section>. Do not nest Splide inside Swiper roots.
`
