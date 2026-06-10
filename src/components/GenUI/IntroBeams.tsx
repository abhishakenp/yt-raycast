export function IntroBeams() {
  return (
    <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden">
      <span className="absolute left-[-18vw] top-[24%] h-0.5 w-[42vw] translate-x-[-120%] -rotate-[9deg] animate-pulse rounded-full bg-[linear-gradient(90deg,transparent,rgba(27,229,255,0.96),rgba(236,68,255,0.76),transparent)] shadow-[0_0_22px_rgba(28,225,255,0.55)]" />
      <span className="absolute left-[-18vw] top-[48%] h-0.5 w-[42vw] translate-x-[-120%] rotate-[7deg] animate-pulse rounded-full bg-[linear-gradient(90deg,transparent,rgba(27,229,255,0.96),rgba(236,68,255,0.76),transparent)] opacity-70 shadow-[0_0_22px_rgba(28,225,255,0.55)] [animation-delay:1.4s]" />
      <span className="absolute left-[-18vw] top-[70%] h-0.5 w-[42vw] translate-x-[-120%] -rotate-[15deg] animate-pulse rounded-full bg-[linear-gradient(90deg,transparent,rgba(27,229,255,0.96),rgba(236,68,255,0.76),transparent)] opacity-50 shadow-[0_0_22px_rgba(28,225,255,0.55)] [animation-delay:2.9s]" />
    </div>
  )
}
