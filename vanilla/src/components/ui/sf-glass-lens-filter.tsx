export const SfGlassLensFilter = () => (
  <svg className="sf-glass-sr-only" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter
        id="sf-glass-lens"
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
