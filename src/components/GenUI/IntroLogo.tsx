import { cn } from '@/lib/utils'

export function IntroLogo({
  logoClass,
}: {
  logoClass: 'hidden' | 'visible' | 'shaking' | 'settled'
}) {
  return (
    <div
      className={cn(
        'relative z-[2] flex max-w-[calc(100vw-40px)] scale-[1.05] items-center justify-center gap-[clamp(10px,3vw,16px)] opacity-0 transition-[transform,opacity,margin-top,filter] duration-1000 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] motion-reduce:animate-none sm:scale-[1.8] lg:scale-[2.8]',
        logoClass !== 'hidden' && 'opacity-100',
        logoClass === 'shaking' && 'animate-pulse',
        logoClass === 'settled' && '-mt-[6vh] scale-[0.92] sm:scale-[1.1]',
      )}
    >
      <div className="relative size-[clamp(34px,9vw,52px)] shrink-0">
        <img
          src="/assets/logo-transparent.png"
          alt="Ship Fast Logo"
          className="h-full w-full object-contain"
          aria-hidden="true"
        />
      </div>
      <span className="whitespace-nowrap font-mono text-[clamp(34px,12vw,64px)] font-bold tracking-[clamp(1px,1.15vw,6px)] text-[#ededef] [-webkit-text-fill-color:#ededef]">
        SHIP FAST
      </span>
    </div>
  )
}
