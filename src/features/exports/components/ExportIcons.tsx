import type { SVGProps } from 'react'

export const HtmlIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M1.5 0H22.5L20.5 21.5L12 24L3.5 21.5L1.5 0Z" fill="#E34F26" />
    <path d="M12 2.5V21.5L18.5 19.5L20 2.5H12Z" fill="#EF652A" />
    <path
      d="M12 5H16.5L16 8H12L12 10.5H15.5L15 15.5L12 16.5L9 15.5L8.5 12.5H11L11.5 13.5L12 14L12.5 13.5L12.5 10.5H7.5L8 5H12Z"
      fill="white"
    />
  </svg>
)

export const ReactIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <ellipse
      cx="12"
      cy="12"
      rx="9.5"
      ry="3.5"
      stroke="#61DAFB"
      strokeWidth="1.5"
      fill="none"
    />
    <ellipse
      cx="12"
      cy="12"
      rx="9.5"
      ry="3.5"
      stroke="#61DAFB"
      strokeWidth="1.5"
      fill="none"
      transform="rotate(60 12 12)"
    />
    <ellipse
      cx="12"
      cy="12"
      rx="9.5"
      ry="3.5"
      stroke="#61DAFB"
      strokeWidth="1.5"
      fill="none"
      transform="rotate(120 12 12)"
    />
    <circle cx="12" cy="12" r="2.5" fill="#61DAFB" />
  </svg>
)

export const NextIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 180 180"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <mask
      height="180"
      id="nextjs-mask"
      maskUnits="userSpaceOnUse"
      width="180"
      x="0"
      y="0"
      style={{ maskType: 'alpha' }}
    >
      <circle cx="90" cy="90" fill="black" r="90"></circle>
    </mask>
    <g mask="url(#nextjs-mask)">
      <circle cx="90" cy="90" data-circle="true" fill="black" r="90"></circle>
      <path
        d="M149.508 157.52L69.142 54H54V125.97H66.1136V69.3836L139.999 164.845C143.333 162.614 146.509 160.165 149.508 157.52Z"
        fill="url(#nextjs-gradient1)"
      ></path>
      <rect
        fill="url(#nextjs-gradient2)"
        height="72"
        width="12"
        x="115"
        y="54"
      ></rect>
    </g>
    <defs>
      <linearGradient
        gradientUnits="userSpaceOnUse"
        id="nextjs-gradient1"
        x1="109"
        x2="144.5"
        y1="116.5"
        y2="160.5"
      >
        <stop stopColor="white"></stop>
        <stop offset="1" stopColor="white" stopOpacity="0"></stop>
      </linearGradient>
      <linearGradient
        gradientUnits="userSpaceOnUse"
        id="nextjs-gradient2"
        x1="121"
        x2="120.799"
        y1="54"
        y2="106.875"
      >
        <stop stopColor="white"></stop>
        <stop offset="1" stopColor="white" stopOpacity="0"></stop>
      </linearGradient>
    </defs>
  </svg>
)

export const LakebedIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <rect
      x="3"
      y="3"
      width="18"
      height="18"
      rx="2"
      stroke="#8B5CF6"
      strokeWidth="2"
      fill="none"
    />
    <path
      d="M7 7H10M7 10H10M7 13H10"
      stroke="#8B5CF6"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M14 7H17M14 10H17M14 13H17"
      stroke="#8B5CF6"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path d="M7 16H17" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" />
  </svg>
)
