const INTRO_MEDIA_LAYOUT = [
  ['20%', '35%', '-12deg', '0.2s', '50%', '50%'],
  ['75%', '25%', '8deg', '0.4s', '50%', '50%'],
  ['30%', '70%', '-5deg', '0.6s', '50%', '50%'],
  ['80%', '65%', '15deg', '0.8s', '50%', '50%'],
] as const

const INTRO_PLACEHOLDER_BACKGROUNDS = [
  'linear-gradient(135deg, rgba(46, 230, 255, 0.3), rgba(232, 71, 255, 0.2))',
  'linear-gradient(135deg, rgba(45, 212, 191, 0.3), rgba(59, 130, 246, 0.2))',
  'linear-gradient(135deg, rgba(251, 146, 60, 0.3), rgba(236, 72, 153, 0.2))',
  'linear-gradient(135deg, rgba(34, 197, 94, 0.3), rgba(168, 85, 247, 0.2))',
] as const

export function IntroMediaChips() {
  return (
    <div className="pointer-events-none absolute inset-0 z-[2]">
      {INTRO_MEDIA_LAYOUT.map(([x, y, rot, delay, dockX, dockY], i) => (
        <div
          key={i}
          className="absolute left-[var(--chip-x)] top-[var(--chip-y)] flex aspect-[4/3] w-[clamp(72px,8vw,128px)] -translate-x-1/2 -translate-y-1/2 rotate-[var(--chip-rot)] scale-100 animate-pulse flex-col items-center justify-center rounded-[18px] border border-cyan-300/35 bg-[image:var(--chip-bg)] bg-cover bg-center opacity-90 shadow-[0_0_34px_rgba(32,226,255,0.22),inset_0_1px_0_rgba(255,255,255,0.16)] backdrop-blur-[12px] transition-all duration-700 ease-out after:absolute after:inset-[-1px] after:rounded-[inherit] after:bg-[linear-gradient(120deg,transparent_0_35%,rgba(255,255,255,0.32),transparent_62%)] after:mix-blend-screen after:opacity-50 group-[.is-exiting]:left-[var(--dock-x)] group-[.is-exiting]:top-[var(--dock-y)] group-[.is-exiting]:scale-30 group-[.is-exiting]:opacity-0"
          style={{
            '--chip-x': x,
            '--chip-y': y,
            '--chip-rot': rot,
            '--chip-delay': delay,
            '--dock-x': dockX,
            '--dock-y': dockY,
            '--chip-bg': INTRO_PLACEHOLDER_BACKGROUNDS[i % INTRO_PLACEHOLDER_BACKGROUNDS.length],
            animationDelay: delay,
          } as React.CSSProperties}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: '22px', height: '22px', color: '#69f8ff', filter: 'drop-shadow(0 0 6px rgba(26, 184, 255, 0.8))', marginBottom: '2px' }}>
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
          <span style={{ fontSize: '8px', fontFamily: 'ui-monospace, monospace', color: 'rgba(255, 255, 255, 0.7)', textTransform: 'uppercase', letterSpacing: '0.5px', textShadow: '0 0 4px rgba(105, 248, 255, 0.4)' }}>
            Pexels
          </span>
        </div>
      ))}
    </div>
  )
}
