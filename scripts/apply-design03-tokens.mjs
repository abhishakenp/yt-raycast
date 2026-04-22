import { readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const p = join(dirname(fileURLToPath(import.meta.url)), '../public/designs/design-03-saas-homepage.html')
const cfg = String.raw`    <script>
      tailwind.config = {
        theme: {
          extend: {
            colors: {
              ink: '#0a0e1f',
              surface: '#0f1428',
              elev: '#141a2e',
              inset: '#070a17',
            },
            fontFamily: {
              sans: ['Inter', 'system-ui', 'sans-serif'],
              mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
            },
            boxShadow: {
              btnP: '0 14px 40px rgba(124,92,245,0.22), 0 8px 24px -10px rgba(124,92,245,0.4)',
              pop: '0 26px 80px rgba(0,0,0,0.45)',
            },
            transitionTimingFunction: { nova: 'cubic-bezier(0.22, 1, 0.36, 1)' },
            keyframes: {
              liquid: {
                '0%': { transform: 'translate(-5%, -4%) scale(1) rotate(-1.2deg)' },
                '100%': { transform: 'translate(6%, 5%) scale(1.12) rotate(2.2deg)' },
              },
            },
            animation: { liquid: 'liquid 26s ease-in-out infinite alternate' },
          },
        },
      }
    </script>`

let s = readFileSync(p, 'utf8')
s = s.replace(
  /\n\s*<script>\s*tailwind\.config = \{[\s\S]*?\}\s*<\/script>/,
  `\n${cfg}`,
)
s = s.replace('<html lang="en">', '<html lang="en" class="scroll-smooth">')
s = s.replace('<body>', '<body class="min-h-full bg-ink text-slate-200 font-sans antialiased">')
s = s.replace(
  '<header class="sticky top-0 z-40 backdrop-blur-md" style="background: color-mix(in srgb, var(--surface) 84%, transparent); border-bottom: 1px solid var(--hair)">',
  '<header class="sticky top-0 z-40 border-b border-white/10 bg-surface/90 backdrop-blur-md">',
)
s = s.replace(
  'style="background: rgba(124,92,245,0.16); border: 1px solid rgba(124,92,245,0.24)"',
  'class="border border-violet-500/25 bg-violet-500/15"',
)
s = s.split('class="mono ').join('class="font-mono ')
s = s.split(' <div class="mono ').join(' <div class="font-mono ')
s = s.split('<span class="mono ').join('<span class="font-mono ')
s = s.split('</span> <span class="mono').join('</span> <span class="font-mono')
s = s.split('class="head ').join('class="text-white ')
s = s.split('class="text-sm muted ').join('class="text-sm text-slate-400 ')
s = s.split('class="mt-1 muted ').join('class="mt-1 text-slate-400 ')
s = s.split('class="text-lg muted"').join('class="text-lg text-slate-400"')
s = s.split('>muted<').join('>text-slate-400<')
s = s.split('<p class="mt-1 muted ').join('<p class="mt-1 text-slate-400 ')
s = s.split('<p class="text-sm text-slate-400 text-slate-400').join('<p class="text-sm text-slate-400')
s = s.split(' <span class="muted">').join(' <span class="text-slate-500">')
s = s.split('<span class="muted">').join('<span class="text-slate-500">')
s = s.split('class="mt-1 text-slate-500 text-slate-400"').join('class="mt-1 text-slate-400"')

s = s.split('class="btnP ').join(
  'class="inline-flex items-center justify-center bg-violet-600 text-white shadow-btnP [transition:transform_180ms_cubic-bezier(0.22,1,0.36,1),filter_180ms_cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-px hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/50 ',
)
s = s.split('class="btnG ').join(
  'class="inline-flex items-center justify-center border border-white/15 bg-white/[0.02] text-white [transition:transform_180ms_cubic-bezier(0.22,1,0.36,1),border-color_180ms_cubic-bezier(0.22,1,0.36,1),background_180ms_cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-px hover:border-white/30 hover:bg-white/[0.04] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 ',
)
s = s.split(' ringFocus"').join(
  ' focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50"',
)
s = s.split('class="reveal"').join(
  'class="reveal transition duration-500 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] data-[in=0]:translate-y-2.5 data-[in=0]:opacity-0 data-[in=1]:translate-y-0 data-[in=1]:opacity-100"',
)
s = s.split('border hair8').join('border border-white/10')
s = s.split('border-b hair"').join('border-b border-white/10"')
s = s.split(' border hair8').join(' border border-white/10')
s = s.split('border hair"').join('border border-white/[0.06]"')
s = s.split(' border hair ').join(' border border-white/[0.06] ')
s = s.split('border-t hair8').join('border-t border-white/10')
s = s.split('hair8').join('border-white/10')
s = s.split('class="surface ').join('class="bg-surface ')
s = s.split(' class="inset ').join(' class="bg-inset ')
s = s.split('class="popover"').join(
  'class="absolute right-0 top-[calc(100%+10px)] z-[60] min-w-[260px] overflow-hidden rounded-[18px] border border-white/10 bg-gradient-to-b from-[rgba(15,20,40,0.92)] to-[rgba(15,20,40,0.72)] shadow-pop opacity-0 pointer-events-none translate-y-1.5 [transition:transform_200ms_cubic-bezier(0.22,1,0.36,1),opacity_200ms_cubic-bezier(0.22,1,0.36,1)] data-[open=1]:translate-y-0 data-[open=1]:opacity-100 data-[open=1]:pointer-events-auto"',
)
s = s.split('class="popItem ').join(
  'class="flex w-full items-center justify-between gap-3 rounded-2xl border border-transparent p-2.5 [transition:background_160ms, border-color_160ms] hover:border-white/10 hover:bg-white/[0.03] focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/30 ',
)
s = s.split('id="hero" class="').join(
  'id="hero" class="[--halo:0] [--mx:50%] [--my:50%] [isolation:isolate] ',
)
s = s.split('class="aurora-liquid"').join(
  'class="absolute -inset-[28%] -z-[5] pointer-events-none [background:radial-gradient(ellipse_72%_58%_at_16%_26%,rgba(124,92,245,0.32),transparent_58%),radial-gradient(ellipse_68%_52%_at_84%_74%,rgba(192,38,211,0.16),transparent_54%),radial-gradient(ellipse_88%_48%_at_46%_92%,rgba(20,184,166,0.18),transparent_56%),radial-gradient(ellipse_55%_42%_at_58%_12%,rgba(250,204,21,0.09),transparent_52%)] opacity-90 blur-[80px] [animation:liquid_26s_ease-in-out_infinite_alternate] motion-reduce:hidden motion-reduce:animate-none [animation:liquid_26s_ease-in-out_infinite_alternate]"\n    style="--tw-animation-liquid:liquid 26s ease-in-out infinite alternate" aria-hidden="true"',
)
s = s.split('class="aurora-halo"').join(
  'class="pointer-events-none absolute inset-0 z-0 [opacity:var(--halo,0)] mix-blend-screen [background:radial-gradient(circle_240px_at_var(--mx)_var(--my),rgba(124,92,245,0.18),rgba(124,92,245,0.06)_60%,transparent_100%)] [transition:opacity_420ms] motion-reduce:opacity-0" aria-hidden="true"',
)

s = s.split('class="band-pricing ').join(
  'class="border-t border-white/10 bg-[linear-gradient(168deg,#06080f_0%,#06080f_18%,#0c1222_18%,#0c1222_100%)] ',
)
s = s.split('class="band-faq ').join('class="border-t border-white/10 bg-gradient-to-b from-[#080c18] to-ink ')

s = s.split('class="band-cta ').join('class="relative z-10 ')

s = s.split('class="band-cta-inner ').join('class="')
s = s.split('class="toggle ').join('class="inline-flex rounded-lg border border-white/10 bg-white/[0.02] p-0.5 ')
s = s.split('class="toggleBtn ').join(
  'class="rounded-md border-0 bg-transparent px-3 py-1.5 text-sm font-medium text-slate-400 [transition:background_160ms,color_160ms] data-[on=1]:bg-[rgba(124,92,245,0.24)] data-[on=1]:text-white ',
)

s = s.split('class="acc accFaq').join('class="acc group border-0 bg-transparent p-0')
s = s.split('class="accBody ').join('class="max-h-0 overflow-hidden pl-0 pr-8 text-sm leading-relaxed text-slate-400 opacity-0 [transition:max-height_0.25s,opacity_0.22s,transform_0.22s] ')

s = s.split('class="accBtn ').join('class="accBtn flex w-full items-start justify-between gap-6 text-left ')

s = s.split('class="acc ').join('class="group border-0 border-white/10 border-b border-b-white/10 [transition:background] hover:bg-white/[0.02] ')

s = s.replace(
  'class="group border-0 border-white/10 border-b border-b-white/10 [transition:background] hover:bg-white/[0.02] accFaq',
  'class="group border-0 accFaq border-b-0',
)

s = s.replace(/class="group border-0 accFaq border-0 p-0"/g, 'class="accFaq border-0 p-0"')

s = s.replace(
  'class="group border-0 accFaq border-0 p-0',
  'class="group acc border-0 p-0',
  20,
)
writeFileSync(p, s, 'utf8')
console.log('ok', p, s.length)
