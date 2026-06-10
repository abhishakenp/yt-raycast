export function IntroPreviewFrame() {
  return (
    <div className="pointer-events-none absolute left-1/2 bottom-[clamp(-160px,-12vh,-80px)] z-[1] w-[min(980px,calc(100vw-64px))] origin-bottom -translate-x-1/2 translate-y-[var(--intro-frame-y,58vh)] scale-[var(--intro-frame-scale,0.9)] opacity-[var(--intro-frame-opacity,0)] drop-shadow-[0_28px_70px_rgba(0,0,0,0.5)] transition-[transform,opacity,filter] duration-1000 ease-[cubic-bezier(0.18,0.92,0.18,1)]">
      <div className="h-[clamp(310px,45vh,520px)] overflow-hidden rounded-[26px] border border-[rgba(115,150,255,0.22)] bg-[linear-gradient(180deg,rgba(22,27,50,0.68),rgba(11,15,31,0.84)),radial-gradient(circle_at_48%_0%,rgba(38,222,255,0.16),transparent_42%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_0_90px_rgba(110,68,255,0.08),0_0_80px_rgba(37,207,255,0.11)] backdrop-blur-[20px]">
        <div className="flex h-[62px] items-center gap-[18px] border-b border-[rgba(131,150,210,0.12)] px-[26%] before:block before:h-2.5 before:flex-1 before:rounded-full before:bg-[linear-gradient(90deg,rgba(255,255,255,0.1),rgba(45,225,255,0.22),rgba(255,255,255,0.08))]" />
        <div className="grid h-[calc(100%-62px)] grid-cols-[190px_1fr]">
          <div className="border-r border-[rgba(131,150,210,0.12)] px-[30px] py-7 before:mb-7 before:block before:size-[38px] before:rounded-full before:bg-[radial-gradient(circle_at_35%_30%,rgba(255,255,255,0.28),rgba(93,106,145,0.44))] [&_span]:my-3.5 [&_span]:block [&_span]:h-2.5 [&_span]:w-[86%] [&_span]:rounded-full [&_span]:bg-[linear-gradient(90deg,rgba(255,255,255,0.1),rgba(45,225,255,0.22),rgba(255,255,255,0.08))] [&_span:nth-child(3)]:w-[64%]">
            <span />
            <span />
            <span />
          </div>
          <div className="px-[34px] py-[30px]">
            <div className="grid min-h-[132px] grid-cols-[180px_1fr] gap-7 rounded-xl bg-[linear-gradient(90deg,rgba(255,255,255,0.14),rgba(255,255,255,0.05))] p-6 before:row-span-3 before:rounded-[10px] before:bg-[linear-gradient(135deg,rgba(46,230,255,0.18),rgba(232,71,255,0.13))] [&_span]:block [&_span]:h-2.5 [&_span]:rounded-full [&_span]:bg-[linear-gradient(90deg,rgba(255,255,255,0.1),rgba(45,225,255,0.22),rgba(255,255,255,0.08))] [&_span:nth-child(2)]:w-[46%] [&_span:nth-child(3)]:w-[72%] [&_span:nth-child(4)]:w-[58%]">
              <span />
              <span />
              <span />
            </div>
            <div className="mt-6 grid grid-cols-4 gap-[18px] [&_i]:block [&_i]:min-h-[132px] [&_i]:rounded-xl [&_i]:bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0.045))] [&_i]:p-4 [&_i]:before:mb-[18px] [&_i]:before:block [&_i]:before:size-12 [&_i]:before:rounded-lg [&_i]:before:bg-[linear-gradient(135deg,rgba(255,255,255,0.14),rgba(73,91,140,0.34))] [&_i]:after:block [&_i]:after:h-2.5 [&_i]:after:w-4/5 [&_i]:after:rounded-full [&_i]:after:bg-[linear-gradient(90deg,rgba(255,255,255,0.1),rgba(45,225,255,0.22),rgba(255,255,255,0.08))]">
              <i />
              <i />
              <i />
              <i />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
