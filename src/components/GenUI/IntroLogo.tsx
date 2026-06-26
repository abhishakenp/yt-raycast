import { cn } from '@/lib/utils'

export function IntroLogo({
  logoClass,
}: {
  logoClass: 'hidden' | 'visible' | 'shaking' | 'settled'
}) {
  return (
    <div
      className={cn(
        'relative z-[2] flex scale-[2.8] items-center gap-4 opacity-0 transition-[transform,opacity,margin-top,filter] duration-1000 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] motion-reduce:animate-none',
        logoClass !== 'hidden' && 'opacity-100',
        logoClass === 'shaking' && 'animate-pulse',
        logoClass === 'settled' && '-mt-[6vh] scale-[1.1]',
      )}
    >
      <div className="relative size-[52px]">
        <img
          src="/assets/logo-transparent.png"
          alt="Ship Fast Logo"
          className="w-full h-full object-contain"
          aria-hidden="true"
        />
      </div>
      <span className="font-mono text-[64px] font-bold tracking-[6px] text-[#ededef] [-webkit-text-fill-color:#ededef]">
        SHIP FAST
      </span>
    </div>
  )
}
