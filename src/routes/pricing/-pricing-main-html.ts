import { glassPillButtonHtml } from '@/lib/glass-pill-html'

const goHome = ' onclick="location.href=\'/\'"'

const lockIcon15 = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`

const lockIcon16 = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`

export const PRICING_PAGE_MAIN_HTML = `<div class="relative z-[1] mx-auto w-[min(1180px,calc(100%-48px))] pt-[150px] pb-[96px] text-[var(--text-primary,#f0f0f5)] max-[720px]:w-[min(100%,calc(100%-32px))] max-[720px]:pt-[124px]">

      <section class="mb-[84px] grid justify-items-center text-center" aria-labelledby="pricing-heading">
        <span class="mb-4 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200/75">Pricing</span>
        <h1 class="m-0 font-[var(--font-display)] text-[clamp(3.5rem,8vw,7.5rem)] leading-[0.86] tracking-[-0.07em] text-white" id="pricing-heading">Simple pricing.<br>No surprises.</h1>
        <p class="mt-6 mb-0 max-w-[620px] text-lg leading-8 text-white/62">Start free. Upgrade when you're ready. Lock the early adopter rate before it's gone&nbsp;forever.</p>
        <div class="mt-8 flex flex-wrap justify-center gap-3">
          <span class="inline-flex min-h-10 items-center gap-3 rounded-full border border-white/10 bg-white/[0.055] px-4 text-sm text-white/72 backdrop-blur-[14px]" aria-label="347 of 500 early adopter slots taken">
            <div class="h-2 w-24 overflow-hidden rounded-full bg-white/10" aria-hidden="true"><div class="h-full w-[69.4%] rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(103,232,249,0.45)]"></div></div>
            347 / 500 slots taken
          </span>
          <span class="inline-flex min-h-10 items-center gap-2 rounded-full border border-cyan-300/18 bg-cyan-300/8 px-4 text-sm text-cyan-100/80 backdrop-blur-[14px]" id="countdown-badge" aria-live="polite">
            <span class="size-2 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,0.9)]" aria-hidden="true"></span>
            <span id="countdown-text">Early adopter slots still open</span>
          </span>
        </div>
      </section>

      <section class="mb-[84px]" aria-labelledby="plans-heading">
        <h2 id="plans-heading" class="sr-only">Plans</h2>
        <div class="grid grid-cols-3 items-stretch gap-5 max-[980px]:grid-cols-1">

          <div class="relative grid gap-5 rounded-[28px] border border-white/10 bg-white/[0.045] p-6 shadow-[0_18px_60px_rgba(0,0,0,0.3)] backdrop-blur-[18px]">
            <p class="m-0 font-mono text-xs font-bold uppercase tracking-[0.16em] text-white/48">Free</p>
            <div class="flex items-end gap-2">
              <span class="font-sans text-5xl font-extrabold tracking-[-0.06em] text-white">₹0</span>
            </div>
            <p class="m-0 min-h-12 text-sm leading-6 text-white/58">Preview the magic — no card needed.</p>
            <div class="h-px bg-white/10"></div>
            <ul class="grid gap-3 p-0 m-0 list-none text-sm text-white/72">
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
            ${glassPillButtonHtml({ className: 'mt-auto min-h-11 w-full px-5 py-0 text-sm text-white/82', extraAttrs: goHome, text: 'Start free' })}
          </div>

          <div class="relative grid scale-[1.035] gap-5 rounded-[28px] border border-cyan-300/35 bg-cyan-300/[0.075] p-6 shadow-[0_22px_80px_rgba(34,211,238,0.14),0_24px_70px_rgba(0,0,0,0.36)] backdrop-blur-[20px] max-[980px]:scale-100">
            <div class="absolute right-5 top-5 rounded-full border border-cyan-300/30 bg-cyan-300/14 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-cyan-100" aria-label="Most popular plan">Most Popular</div>
            <p class="m-0 font-mono text-xs font-bold uppercase tracking-[0.16em] text-cyan-100">Pro</p>
            <div class="inline-flex w-fit items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-100" aria-label="Early adopter offer">
              <span class="size-1.5 rounded-full bg-cyan-300" aria-hidden="true"></span>
              Early Adopter — Limited slots
            </div>
            <div class="flex items-end gap-2">
              <span class="font-sans text-5xl font-extrabold tracking-[-0.06em] text-white">₹199</span>
              <span class="pb-2 text-sm text-white/48">/month</span>
            </div>
            <p class="m-0 text-sm text-white/38 line-through">₹399/month after slots fill</p>
            <span class="w-fit rounded-full bg-cyan-300 px-3 py-1 font-mono text-[11px] font-extrabold tracking-[0.08em] text-slate-950">50% OFF — locked forever</span>
            <p class="m-0 min-h-12 text-sm leading-6 text-white/68">Discount stays as long as your subscription is active. Cancel&nbsp;→&nbsp;lose&nbsp;it.</p>
            <div class="h-px bg-cyan-300/18"></div>
            <ul class="grid gap-3 p-0 m-0 list-none text-sm text-white/82">
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
              className: 'mt-auto min-h-11 w-full px-5 py-0 text-sm text-white',
              extraAttrs: goHome,
              html: `${lockIcon15}
              Lock lifetime discount`,
            })}
            <p class="m-0 text-center text-xs text-white/45">First 500 users only · cancel anytime</p>
          </div>

          <div class="relative grid gap-5 rounded-[28px] border border-white/8 bg-white/[0.025] p-6 opacity-70 shadow-[0_18px_60px_rgba(0,0,0,0.24)] backdrop-blur-[18px]" aria-label="Future full price plan">
            <p class="m-0 font-mono text-xs font-bold uppercase tracking-[0.16em] text-white/48">Pro</p>
            <div class="flex items-end gap-2">
              <span class="font-sans text-5xl font-extrabold tracking-[-0.06em] text-white">₹399</span>
              <span class="pb-2 text-sm text-white/48">/month</span>
            </div>
            <p class="m-0 min-h-12 text-sm leading-6 text-white/58">Full price once early adopter slots are gone.</p>
            <div class="h-px bg-white/10"></div>
            <ul class="grid gap-3 p-0 m-0 list-none text-sm text-white/72">
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
              className: 'mt-auto min-h-11 w-full px-5 py-0 text-sm text-white/40 opacity-60',
              disabled: true,
              extraAttrs: ' aria-disabled="true"',
              text: 'Available when slots fill',
            })}
          </div>

        </div>
        <p class="mt-6 text-center text-sm text-white/45 [&_a]:text-cyan-200 [&_a]:underline-offset-4 hover:[&_a]:underline">Need more than 30 generations/month? <a href="https://x.com/LivioGama" target="_blank" rel="noopener">Contact us</a></p>
      </section>

      <section class="mb-[84px]" aria-labelledby="packs-heading">
        <div class="mb-8 text-center">
          <span class="mb-3 block font-mono text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200/75">Pay-as-you-go</span>
          <h2 class="m-0 font-[var(--font-display)] text-[clamp(2.4rem,5vw,4.8rem)] leading-[0.92] tracking-[-0.06em] text-white" id="packs-heading">No subscription?<br>No problem.</h2>
          <p class="mx-auto mt-4 mb-0 max-w-[560px] text-base leading-7 text-white/56">Buy a credit pack and download only when you need it.</p>
        </div>
        <div class="mx-auto grid max-w-[820px] grid-cols-2 gap-5 max-[760px]:grid-cols-1">

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

      <section class="mb-[84px]" aria-labelledby="compare-heading">
        <div class="mb-8 text-center">
          <span class="mb-3 block font-mono text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200/75">Compare</span>
          <h2 class="m-0 font-[var(--font-display)] text-[clamp(2.4rem,5vw,4.8rem)] leading-[0.92] tracking-[-0.06em] text-white" id="compare-heading">Everything, side by side.</h2>
        </div>
        <div class="overflow-x-auto rounded-[24px] border border-white/10 bg-white/[0.035] shadow-[0_16px_60px_rgba(0,0,0,0.24)] backdrop-blur-[16px]">
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

      <section class="mb-[84px]" aria-labelledby="faq-heading">
        <div class="mb-8 text-center">
          <span class="mb-3 block font-mono text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200/75">FAQ</span>
          <h2 class="m-0 font-[var(--font-display)] text-[clamp(2.4rem,5vw,4.8rem)] leading-[0.92] tracking-[-0.06em] text-white" id="faq-heading">Questions answered.</h2>
        </div>
        <div class="mx-auto grid max-w-[820px] gap-3">

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

      <section class="mx-auto grid max-w-[860px] justify-items-center rounded-[32px] border border-cyan-300/18 bg-cyan-300/[0.055] px-8 py-12 text-center shadow-[0_24px_80px_rgba(34,211,238,0.11),0_24px_70px_rgba(0,0,0,0.28)] backdrop-blur-[20px]" aria-labelledby="cta-heading">
        <span class="mb-4 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200/75">Ready to ship?</span>
        <h2 class="m-0 font-[var(--font-display)] text-[clamp(2.6rem,6vw,5.4rem)] leading-[0.9] tracking-[-0.065em] text-white" id="cta-heading">Build your SaaS in seconds.<br>Lock the rate forever.</h2>
        <p class="mx-auto mt-5 mb-7 max-w-[560px] text-base leading-7 text-white/60">153 slots remaining. Once they're gone, the price goes up — and it won't come back.</p>
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
