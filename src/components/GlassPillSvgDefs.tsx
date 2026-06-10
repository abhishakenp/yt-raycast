export const GLASS_LENS_FILTER_ID = 'sf-glass-lens'

export const GlassPillSvgDefs = () => (
  <svg
    className="absolute -m-px size-px overflow-hidden whitespace-nowrap border-0 p-0 [clip:rect(0,0,0,0)]"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <defs>
      <filter
        id={GLASS_LENS_FILTER_ID}
        x="-50%"
        y="-50%"
        width="200%"
        height="200%"
        colorInterpolationFilters="sRGB"
      >
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.0082 0.0058"
          numOctaves="3"
          seed="41"
          result="noise"
        />
        <feGaussianBlur in="noise" stdDeviation="2" result="smooth" />
        <feDisplacementMap
          in="SourceGraphic"
          in2="smooth"
          scale="24"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </defs>
  </svg>
)
