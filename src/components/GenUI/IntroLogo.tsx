import { cn } from '@/lib/utils'

export function IntroLogo({ logoClass }: { logoClass: 'hidden' | 'visible' | 'shaking' | 'settled' }) {
  return (
    <div
      className={cn(
        'relative z-[2] flex scale-[2.8] items-center gap-4 opacity-0 transition-[transform,opacity,margin-top,filter] duration-1000 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] motion-reduce:animate-none',
        logoClass !== 'hidden' && 'opacity-100',
        logoClass === 'shaking' && 'animate-pulse',
        logoClass === 'settled' && '-mt-[6vh] scale-[1.1]',
      )}
    >
      <div className="relative size-[52px] [&_svg]:size-full [&_svg]:brightness-200 [&_svg]:grayscale">
        <svg viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <path d="M26 4L8 20L14 22L26 10L38 22L44 20L26 4Z" fill="url(#sfLaunchG1)" opacity="0.9" />
          <path d="M14 22L14 40L22 36V24L14 22Z" fill="url(#sfLaunchG2)" opacity="0.8" />
          <path d="M38 22L38 40L30 36V24L38 22Z" fill="url(#sfLaunchG2)" opacity="0.8" />
          <path d="M22 24V36L26 38L30 36V24L26 20L22 24Z" fill="url(#sfLaunchG1)" />
          <path d="M22 38L26 48L30 38L26 40L22 38Z" fill="#888888" opacity="0.7" />
          <circle cx="26" cy="16" r="2" fill="#ededed" />
          <defs>
            <linearGradient id="sfLaunchG1" x1="8" y1="4" x2="44" y2="48" gradientUnits="userSpaceOnUse">
              <stop stopColor="#ffffff" />
              <stop offset="1" stopColor="#ededed" />
            </linearGradient>
            <linearGradient id="sfLaunchG2" x1="14" y1="22" x2="38" y2="40" gradientUnits="userSpaceOnUse">
              <stop stopColor="#888888" />
              <stop offset="1" stopColor="#555555" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <span className="font-mono text-[64px] font-bold tracking-[6px] text-[#ededef] [-webkit-text-fill-color:#ededef]">SHIP FAST</span>
    </div>
  )
}
