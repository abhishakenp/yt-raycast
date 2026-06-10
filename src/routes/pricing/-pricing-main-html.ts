import { glassPillButtonHtml } from '@/lib/glass-pill-html'

const goHome = ' onclick="location.href=\'/\'"'

const lockIcon15 = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`

const lockIcon16 = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`

export const PRICING_PAGE_MAIN_HTML = `<div class="relative z-[1] mx-auto w-[min(1160px,calc(100%_-_48px))] pt-[88px] pb-20 text-[var(--text-primary,#f0f0f5)] max-[720px]:w-[min(100%,calc(100%_-_32px))] max-[720px]:pt-20">

      <section class="mb-[72px] flex flex-col items-center gap-[18px] py-12 pb-14 text-center" aria-labelledby="pricing-heading">
        <span class="font-mono text-[11px] uppercase tracking-[0.2em] text-[#c4c9d4]">Pricing</span>
        <h1 class="m-0 max-w-[14ch] text-balance font-[var(--font-display)] text-[clamp(2.4rem,5vw,4rem)] uppercase leading-[1.05] tracking-[-0.04em] text-[#fffdf6]" id="pricing-heading">Simple pricing.<br>No surprises.</h1>
        <p class="m-0 max-w-[52ch] text-lg leading-[1.6] text-[#c4c9d4]">Start free. Upgrade when you're ready. Lock the early adopter rate before it's gone&nbsp;forever.</p>
        <div class="mt-1 flex flex-wrap justify-center gap-3.5">
          <span class="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/8 px-4 py-2 font-mono text-xs text-emerald-300" aria-label="347 of 500 early adopter slots taken">
            <div class="h-1 w-20 overflow-hidden rounded-full bg-emerald-500/20" aria-hidden="true"><div class="h-full w-[69%] rounded-full bg-gradient-to-r from-emerald-500 to-emerald-300"></div></div>
            347 / 500 slots taken
          </span>
          <span class="inline-flex items-center gap-2 rounded-full border border-red-500/50 bg-red-500/8 px-4 py-2 font-mono text-xs tracking-[0.05em] text-red-300" id="countdown-badge" aria-live="polite">
            <span class="size-[7px] rounded-full bg-red-500" aria-hidden="true"></span>
            <span id="countdown-text">Early adopter slots still open</span>
          </span>
        </div>
      </section>

      <section class="mb-[72px]" aria-labelledby="plans-heading">
        <h2 id="plans-heading" class="sr-only">Plans</h2>
        <div class="mb-12 grid grid-cols-3 items-stretch gap-[22px] max-[1024px]:grid-cols-2 max-[720px]:grid-cols-1">

          <div class="relative flex flex-col rounded-[26px] border border-[var(--glass-border)] bg-[var(--glass-bg)] p-[32px_28px_28px] shadow-[var(--glass-shadow),0_0_60px_rgba(100,80,200,0.04)] backdrop-blur-[20px]">
            <p class="mb-3.5 font-mono text-xs uppercase tracking-[0.18em] text-[#97a0b0]">Free</p>
            <div class="flex items-end gap-2">
              <span class="font-[var(--font-display)] text-5xl font-normal leading-none tracking-[-0.04em] text-[#EDEDEF]">₹0</span>
            </div>
            <p class="mb-6 mt-1.5 text-sm leading-[1.55] text-[#c4c9d4]">Preview the magic — no card needed.</p>
            <div class="mb-5 h-px bg-white/[0.06]"></div>
            <ul class="mb-7 flex flex-1 list-none flex-col gap-2.5 p-0 text-sm text-[#cdd1d8]">
              <li class="flex items-start gap-3">
                <svg class="mt-0.5 size-[17px] shrink-0 text-cyan-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                Generate website preview
              </li>
              <li class="flex items-start gap-3">
                <svg class="mt-0.5 size-[17px] shrink-0 text-cyan-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                Limited templates
              </li>
              <li class="flex items-start gap-3">
                <svg class="mt-0.5 size-[17px] shrink-0 text-cyan-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                10 generations/month
              </li>
              <li class="flex items-start gap-3 text-white/30">
                <svg class="mt-0.5 size-[17px] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                ZIP export
              </li>
              <li class="flex items-start gap-3 text-white/30">
                <svg class="mt-0.5 size-[17px] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                AI iteration
              </li>
              <li class="flex items-start gap-3 text-white/30">
                <svg class="mt-0.5 size-[17px] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                Community &amp; monthly drops
              </li>
            </ul>
            ${glassPillButtonHtml({ className: 'mt-auto min-h-11 w-full px-5 py-0 font-mono text-[13px] font-semibold uppercase tracking-[0.1em] text-[var(--text-secondary)]', extraAttrs: goHome, text: 'Start free' })}
          </div>

          <div class="relative flex scale-[1.03] flex-col rounded-[26px] border border-[rgba(138,180,255,0.22)] bg-[linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] p-[32px_28px_28px] shadow-[var(--glass-shadow),0_0_0_1px_rgba(138,180,255,0.12),0_0_48px_rgba(28,171,255,0.1),0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-[20px] max-[1024px]:scale-100">
            <div class="absolute left-1/2 top-[-13px] -translate-x-1/2 rounded-full bg-[linear-gradient(135deg,rgba(109,251,255,0.95),rgba(56,168,255,0.95))] px-3.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#00121a] shadow-[0_4px_18px_rgba(38,231,255,0.25)]" aria-label="Most popular plan">Most Popular</div>
            <p class="mb-3.5 font-mono text-xs uppercase tracking-[0.18em] text-[#c4c9d4]">Pro</p>
            <div class="mb-2.5 inline-flex w-fit items-center gap-1.5 rounded-md border border-white/12 bg-white/[0.06] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[#cdd1d8]" aria-label="Early adopter offer">
              <span class="size-[5px] rounded-full bg-[#c4c9d4]" aria-hidden="true"></span>
              Early Adopter — Limited slots
            </div>
            <div class="flex items-end gap-2">
              <span class="font-[var(--font-display)] text-5xl font-normal leading-none tracking-[-0.04em] text-[#EDEDEF]">₹199</span>
              <span class="pb-1 text-[15px] text-[#97a0b0]">/month</span>
            </div>
            <p class="mb-1 font-mono text-xs text-[#97a0b0] line-through">₹399/month after slots fill</p>
            <span class="mb-4 inline-block w-fit rounded-[5px] border border-emerald-500/35 bg-emerald-500/15 px-2.5 py-[3px] font-mono text-[11px] font-semibold tracking-[0.05em] text-emerald-300">50% OFF — locked forever</span>
            <p class="mb-6 text-sm leading-[1.55] text-[#c4c9d4]">Discount stays as long as your subscription is active. Cancel&nbsp;→&nbsp;lose&nbsp;it.</p>
            <div class="mb-5 h-px bg-white/[0.06]"></div>
            <ul class="mb-7 flex flex-1 list-none flex-col gap-2.5 p-0 text-sm text-[#cdd1d8]">
              <li class="flex items-start gap-3">
                <svg class="mt-0.5 size-[17px] shrink-0 text-cyan-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                30 generations/month
              </li>
              <li class="flex items-start gap-3">
                <svg class="mt-0.5 size-[17px] shrink-0 text-cyan-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                Unlimited ZIP download
              </li>
              <li class="flex items-start gap-3">
                <svg class="mt-0.5 size-[17px] shrink-0 text-cyan-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                Full template library
              </li>
              <li class="flex items-start gap-3">
                <svg class="mt-0.5 size-[17px] shrink-0 text-cyan-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                AI iteration &amp; refinement
              </li>
              <li class="flex items-start gap-3">
                <svg class="mt-0.5 size-[17px] shrink-0 text-cyan-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                Community access
              </li>
              <li class="flex items-start gap-3">
                <svg class="mt-0.5 size-[17px] shrink-0 text-cyan-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                Monthly template drops
              </li>
            </ul>
            ${glassPillButtonHtml({
              className: 'mt-auto min-h-11 w-full px-5 py-0 font-mono text-[13px] font-bold uppercase tracking-[0.1em] text-[#e8f8ff]',
              extraAttrs: goHome,
              html: `${lockIcon15}
              Lock lifetime discount`,
            })}
            <p class="mt-2.5 text-center font-mono text-[11px] tracking-[0.06em] text-[#97a0b0]">First 500 users only · cancel anytime</p>
          </div>

          <div class="relative flex flex-col rounded-[26px] border border-[var(--glass-border)] bg-[var(--glass-bg)] p-[32px_28px_28px] opacity-60 shadow-[var(--glass-shadow),0_0_60px_rgba(100,80,200,0.04)] backdrop-blur-[20px] max-[1024px]:hidden max-[720px]:flex" aria-label="Future full price plan">
            <p class="mb-3.5 font-mono text-xs uppercase tracking-[0.18em] text-[#97a0b0]">Pro</p>
            <div class="flex items-end gap-2">
              <span class="font-[var(--font-display)] text-5xl font-normal leading-none tracking-[-0.04em] text-[#EDEDEF]">₹399</span>
              <span class="pb-1 text-[15px] text-[#97a0b0]">/month</span>
            </div>
            <p class="mb-6 mt-1.5 text-sm leading-[1.55] text-[#c4c9d4]">Full price once early adopter slots are gone.</p>
            <div class="mb-5 h-px bg-white/[0.06]"></div>
            <ul class="mb-7 flex flex-1 list-none flex-col gap-2.5 p-0 text-sm text-[#cdd1d8]">
              <li class="flex items-start gap-3">
                <svg class="mt-0.5 size-[17px] shrink-0 text-cyan-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                Everything in Early Adopter Pro
              </li>
              <li class="flex items-start gap-3">
                <svg class="mt-0.5 size-[17px] shrink-0 text-cyan-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                New features as they ship
              </li>
              <li class="flex items-start gap-3">
                <svg class="mt-0.5 size-[17px] shrink-0 text-cyan-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                Priority support
              </li>
            </ul>
            ${glassPillButtonHtml({
              className: 'mt-auto min-h-11 w-full px-5 py-0 font-mono text-[13px] font-semibold uppercase tracking-[0.1em] text-[var(--text-secondary)] opacity-35',
              disabled: true,
              extraAttrs: ' aria-disabled="true"',
              text: 'Available when slots fill',
            })}
          </div>

        </div>
        <p class="mt-6 text-center text-sm text-white/45 [&_a]:text-cyan-200 [&_a]:underline-offset-4 hover:[&_a]:underline">Need more than 30 generations/month? <a href="https://x.com/LivioGama" target="_blank" rel="noopener">Contact us</a></p>
      </section>

      <section class="mb-14" aria-labelledby="packs-heading">
        <div class="mb-2.5 text-center">
          <span class="mb-2.5 block font-mono text-[11px] uppercase tracking-[0.2em] text-[#c4c9d4]">Pay-as-you-go</span>
          <h2 class="m-0 text-balance font-[var(--font-display)] text-[clamp(1.6rem,3vw,2.4rem)] uppercase leading-[1.1] tracking-[-0.03em] text-[#fffdf6]" id="packs-heading">No subscription?<br>No problem.</h2>
          <p class="mx-auto mt-2.5 mb-0 max-w-[560px] text-[15px] leading-7 text-[#c4c9d4]">Buy a credit pack and download only when you need it.</p>
        </div>
        <div class="mx-auto mt-7 grid grid-cols-[repeat(2,minmax(0,420px))] justify-center gap-[18px] max-[760px]:grid-cols-1">

          <div class="grid gap-5 rounded-[24px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_16px_50px_rgba(0,0,0,0.26)] backdrop-blur-[16px]">
            <div class="flex items-center justify-between gap-3">
              <span class="font-sans text-lg font-bold text-white">Starter Pack</span>
              <span class="rounded-full border border-white/10 bg-white/[0.055] px-3 py-1 text-xs text-white/55">3 downloads</span>
            </div>
            <div class="flex items-end gap-1">
              <span class="font-sans text-4xl font-extrabold tracking-[-0.05em] text-white">₹199</span>
              <span class="pb-1 text-sm text-white/45">&nbsp;one-time</span>
            </div>
            <ul class="grid gap-3 p-0 m-0 list-none text-sm text-white/68">
              <li class="flex items-start gap-3">
                <svg class="mt-0.5 size-[15px] shrink-0 text-cyan-200" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                3 ZIP exports
              </li>
              <li class="flex items-start gap-3">
                <svg class="mt-0.5 size-[15px] shrink-0 text-cyan-200" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                All frameworks included
              </li>
              <li class="flex items-start gap-3">
                <svg class="mt-0.5 size-[15px] shrink-0 text-cyan-200" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                Never expires
              </li>
            </ul>
            ${glassPillButtonHtml({ className: 'mt-auto min-h-11 w-full px-5 py-0 text-sm text-white/82', extraAttrs: goHome, text: 'Buy pack' })}
          </div>

          <div class="relative grid gap-5 rounded-[24px] border border-cyan-300/24 bg-cyan-300/[0.06] p-6 shadow-[0_16px_60px_rgba(34,211,238,0.1),0_16px_50px_rgba(0,0,0,0.28)] backdrop-blur-[16px]">
            <div class="absolute right-5 top-5 rounded-full border border-cyan-300/25 bg-cyan-300/12 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-cyan-100" aria-label="Best value">Best Value</div>
            <div class="flex items-center justify-between gap-3 pr-24">
              <span class="font-sans text-lg font-bold text-white">Growth Pack</span>
              <span class="rounded-full border border-white/10 bg-white/[0.055] px-3 py-1 text-xs text-white/55">10 downloads</span>
            </div>
            <div class="flex items-end gap-1">
              <span class="font-sans text-4xl font-extrabold tracking-[-0.05em] text-white">₹399</span>
              <span class="pb-1 text-sm text-white/45">&nbsp;one-time</span>
            </div>
            <ul class="grid gap-3 p-0 m-0 list-none text-sm text-white/72">
              <li class="flex items-start gap-3">
                <svg class="mt-0.5 size-[15px] shrink-0 text-cyan-200" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                10 ZIP exports
              </li>
              <li class="flex items-start gap-3">
                <svg class="mt-0.5 size-[15px] shrink-0 text-cyan-200" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                All frameworks included
              </li>
              <li class="flex items-start gap-3">
                <svg class="mt-0.5 size-[15px] shrink-0 text-cyan-200" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                Never expires
              </li>
              <li class="flex items-start gap-3">
                <svg class="mt-0.5 size-[15px] shrink-0 text-cyan-200" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                ₹39.90/download — 66% cheaper
              </li>
            </ul>
            ${glassPillButtonHtml({ className: 'mt-auto min-h-11 w-full px-5 py-0 text-sm text-white', extraAttrs: goHome, text: 'Buy pack' })}
          </div>

        </div>
      </section>

      <section class="mb-14" aria-labelledby="compare-heading">
        <div class="mb-2.5 text-center">
          <span class="mb-2.5 block font-mono text-[11px] uppercase tracking-[0.2em] text-[#c4c9d4]">Compare</span>
          <h2 class="m-0 text-balance font-[var(--font-display)] text-[clamp(1.6rem,3vw,2.4rem)] uppercase leading-[1.1] tracking-[-0.03em] text-[#fffdf6]" id="compare-heading">Everything, side by side.</h2>
        </div>
        <div class="mt-7 overflow-x-auto rounded-[18px] border border-[var(--glass-border)] bg-[var(--glass-bg)] shadow-[var(--glass-shadow),0_0_60px_rgba(100,80,200,0.04)] backdrop-blur-[20px]">
          <table class="w-full min-w-[720px] border-collapse text-left text-sm text-white/58 [&_td]:border-t [&_td]:border-white/8 [&_td]:px-5 [&_td]:py-4 [&_th]:px-5 [&_th]:py-4 [&_th]:font-mono [&_th]:text-xs [&_th]:font-bold [&_th]:uppercase [&_th]:tracking-[0.12em] [&_th]:text-white/45" aria-label="Feature comparison between plans">
            <thead>
              <tr>
                <th scope="col" style="width:40%">Feature</th>
                <th scope="col">Free</th>
                <th scope="col" class="bg-cyan-300/[0.06] text-cyan-100">Pro ₹199</th>
                <th scope="col">Credit Pack</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Website generation</td>
                <td><span class="inline-grid size-6 place-items-center" aria-label="Included"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8A8F98" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span></td>
                <td class="bg-cyan-300/[0.06]"><span class="inline-grid size-6 place-items-center" aria-label="Included"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EDEDEF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span></td>
                <td><span class="inline-grid size-6 place-items-center" aria-label="Included"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8A8F98" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span></td>
              </tr>
              <tr>
                <td>Generation limit</td>
                <td>10/month</td>
                <td class="bg-cyan-300/[0.06] font-semibold text-white">30/month</td>
                <td>10/month previews</td>
              </tr>
              <tr>
                <td>ZIP download</td>
                <td><span class="inline-grid size-6 place-items-center opacity-55" aria-label="Not included"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#333333" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></span></td>
                <td class="bg-cyan-300/[0.06]"><span class="inline-grid size-6 place-items-center" aria-label="Included"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EDEDEF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span></td>
                <td>Per credit</td>
              </tr>
              <tr>
                <td>Template library</td>
                <td>Limited</td>
                <td class="bg-cyan-300/[0.06]"><span class="inline-grid size-6 place-items-center" aria-label="Full access"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EDEDEF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span></td>
                <td><span class="inline-grid size-6 place-items-center opacity-55" aria-label="Not included"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#333333" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></span></td>
              </tr>
              <tr>
                <td>AI iteration</td>
                <td><span class="inline-grid size-6 place-items-center opacity-55" aria-label="Not included"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#333333" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></span></td>
                <td class="bg-cyan-300/[0.06]"><span class="inline-grid size-6 place-items-center" aria-label="Included"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EDEDEF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span></td>
                <td><span class="inline-grid size-6 place-items-center opacity-55" aria-label="Not included"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#333333" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></span></td>
              </tr>
              <tr>
                <td>Community &amp; monthly drops</td>
                <td><span class="inline-grid size-6 place-items-center opacity-55" aria-label="Not included"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#333333" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></span></td>
                <td class="bg-cyan-300/[0.06]"><span class="inline-grid size-6 place-items-center" aria-label="Included"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EDEDEF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span></td>
                <td><span class="inline-grid size-6 place-items-center opacity-55" aria-label="Not included"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#333333" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></span></td>
              </tr>
              <tr>
                <td>UPI payment (India)</td>
                <td><span class="inline-grid size-6 place-items-center" aria-label="Included"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8A8F98" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span></td>
                <td class="bg-cyan-300/[0.06]"><span class="inline-grid size-6 place-items-center" aria-label="Included"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EDEDEF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span></td>
                <td><span class="inline-grid size-6 place-items-center" aria-label="Included"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8A8F98" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="mb-14" aria-labelledby="faq-heading">
        <div class="mb-2.5 text-center">
          <span class="mb-2.5 block font-mono text-[11px] uppercase tracking-[0.2em] text-[#c4c9d4]">FAQ</span>
          <h2 class="m-0 text-balance font-[var(--font-display)] text-[clamp(1.6rem,3vw,2.4rem)] uppercase leading-[1.1] tracking-[-0.03em] text-[#fffdf6]" id="faq-heading">Questions answered.</h2>
        </div>
        <div class="mx-auto mt-7 grid max-w-none gap-3">

          <details class="group rounded-[20px] border border-white/10 bg-white/[0.035] p-5 text-white/68 shadow-[0_12px_42px_rgba(0,0,0,0.22)] backdrop-blur-[16px] [&_p]:mt-4 [&_p]:mb-0 [&_p]:text-sm [&_p]:leading-7 [&_p]:text-white/55">
            <summary class="flex cursor-pointer list-none items-center justify-between gap-4 text-left font-sans text-base font-semibold text-white marker:hidden [&::-webkit-details-marker]:hidden">
              What happens when the 500 early adopter slots fill up?
              <svg class="size-5 shrink-0 text-white/45 transition-transform group-open:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
            </summary>
            <p>Once all 500 slots are gone, the price moves to ₹399/month permanently. Users who locked in at ₹199 keep their rate forever — but only as long as their subscription stays active. If you cancel, the slot is released and you'd rejoin at the full price.</p>
          </details>

          <details class="group rounded-[20px] border border-white/10 bg-white/[0.035] p-5 text-white/68 shadow-[0_12px_42px_rgba(0,0,0,0.22)] backdrop-blur-[16px] [&_p]:mt-4 [&_p]:mb-0 [&_p]:text-sm [&_p]:leading-7 [&_p]:text-white/55">
            <summary class="flex cursor-pointer list-none items-center justify-between gap-4 text-left font-sans text-base font-semibold text-white marker:hidden [&::-webkit-details-marker]:hidden">
              Is there a free trial for Pro?
              <svg class="size-5 shrink-0 text-white/45 transition-transform group-open:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
            </summary>
            <p>Yes — the Free plan lets you generate previews and explore templates without a card. When you're ready to export a full project as a ZIP or need a higher monthly generation limit, upgrade to Pro or grab a credit pack.</p>
          </details>

          <details class="group rounded-[20px] border border-white/10 bg-white/[0.035] p-5 text-white/68 shadow-[0_12px_42px_rgba(0,0,0,0.22)] backdrop-blur-[16px] [&_p]:mt-4 [&_p]:mb-0 [&_p]:text-sm [&_p]:leading-7 [&_p]:text-white/55">
            <summary class="flex cursor-pointer list-none items-center justify-between gap-4 text-left font-sans text-base font-semibold text-white marker:hidden [&::-webkit-details-marker]:hidden">
              What payment methods are accepted?
              <svg class="size-5 shrink-0 text-white/45 transition-transform group-open:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
            </summary>
            <p>Pay via UPI (including UPI Autopay for subscriptions), cards, and net banking through Razorpay.</p>
          </details>

          <details class="group rounded-[20px] border border-white/10 bg-white/[0.035] p-5 text-white/68 shadow-[0_12px_42px_rgba(0,0,0,0.22)] backdrop-blur-[16px] [&_p]:mt-4 [&_p]:mb-0 [&_p]:text-sm [&_p]:leading-7 [&_p]:text-white/55">
            <summary class="flex cursor-pointer list-none items-center justify-between gap-4 text-left font-sans text-base font-semibold text-white marker:hidden [&::-webkit-details-marker]:hidden">
              What is a "credit" in the credit packs?
              <svg class="size-5 shrink-0 text-white/45 transition-transform group-open:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
            </summary>
            <p>One credit equals one ZIP export of a generated project. Credits never expire and can be used across any generated session. Generating previews does not consume credits and stays subject to your plan's generation quota.</p>
          </details>

          <details class="group rounded-[20px] border border-white/10 bg-white/[0.035] p-5 text-white/68 shadow-[0_12px_42px_rgba(0,0,0,0.22)] backdrop-blur-[16px] [&_p]:mt-4 [&_p]:mb-0 [&_p]:text-sm [&_p]:leading-7 [&_p]:text-white/55">
            <summary class="flex cursor-pointer list-none items-center justify-between gap-4 text-left font-sans text-base font-semibold text-white marker:hidden [&::-webkit-details-marker]:hidden">
              Can I cancel my subscription anytime?
              <svg class="size-5 shrink-0 text-white/45 transition-transform group-open:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
            </summary>
            <p>Yes, cancel anytime from your account settings. No cancellation fees. Note that cancelling as an early adopter means you lose the ₹199 rate — if you resubscribe later, you'll pay the then-current price.</p>
          </details>

          <details class="group rounded-[20px] border border-white/10 bg-white/[0.035] p-5 text-white/68 shadow-[0_12px_42px_rgba(0,0,0,0.22)] backdrop-blur-[16px] [&_p]:mt-4 [&_p]:mb-0 [&_p]:text-sm [&_p]:leading-7 [&_p]:text-white/55">
            <summary class="flex cursor-pointer list-none items-center justify-between gap-4 text-left font-sans text-base font-semibold text-white marker:hidden [&::-webkit-details-marker]:hidden">
              What frameworks does the generator support?
              <svg class="size-5 shrink-0 text-white/45 transition-transform group-open:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
            </summary>
            <p>Ship Fast generates clean HTML/CSS/JS by default. Pro users gain access to React, Next.js, and additional framework renderers as they are added. Each new framework ships as part of the monthly drops.</p>
          </details>

        </div>
      </section>

      <section class="mb-8 flex flex-col items-center gap-5 rounded-[26px] border border-[var(--glass-border)] bg-[var(--glass-bg)] px-10 py-[52px] text-center shadow-[var(--glass-shadow),0_0_60px_rgba(100,80,200,0.04)] backdrop-blur-[20px] max-[720px]:px-6 max-[720px]:py-9" aria-labelledby="cta-heading">
        <span class="font-mono text-[11px] uppercase tracking-[0.2em] text-[#c4c9d4]">Ready to ship?</span>
        <h2 class="m-0 max-w-[18ch] text-balance font-[var(--font-display)] text-[clamp(1.8rem,4vw,2.8rem)] uppercase leading-[1.1] tracking-[-0.03em] text-[#fffdf6]" id="cta-heading">Build your SaaS in seconds.<br>Lock the rate forever.</h2>
        <p class="m-0 max-w-[46ch] text-base leading-[1.65] text-[#c4c9d4]">153 slots remaining. Once they're gone, the price goes up — and it won't come back.</p>
        ${glassPillButtonHtml({
          className: 'min-h-12 px-6 py-0 text-sm text-white',
          extraAttrs: goHome,
          html: `${lockIcon16}
          Lock lifetime discount`,
        })}
        <p class="mt-5 mb-0 text-xs text-white/45">Free to start · ₹199/month early adopter · cancel anytime</p>
      </section>

    </div>

    <script>
      function tick() {
        document.getElementById('countdown-text').textContent = 'Early adopter slots still open'
      }

      tick()
      setInterval(tick, 30000)
    </script>` as const
