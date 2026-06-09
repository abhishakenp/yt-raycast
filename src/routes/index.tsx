import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { createServerFn, useServerFn } from '@tanstack/react-start'
import { useEffect, useRef, useState } from 'react'
import { ZapIcon } from 'lucide-react'
import { LaunchBackdrop } from '../components/launch-backdrop'
import HeaderUser from '../integrations/clerk/header-user'

const getRecentSessions = createServerFn({ method: 'GET' }).handler(async () => {
  const { createFilesystemSessionRepository } = await import(
    '../session-domain/filesystem-session-repository.js'
  )
  return createFilesystemSessionRepository().list().slice(0, 6)
})

const createStartGeneration = createServerFn({ method: 'POST' })
  .validator((data: { prompt?: string; preferredLanguage?: string; preferredExportTarget?: string; authToken?: string }) => ({
    prompt: data?.prompt || '',
    preferredLanguage: data?.preferredLanguage || 'en',
    preferredExportTarget: data?.preferredExportTarget || 'html',
    authToken: data?.authToken || '',
  }))
  .handler(async ({ data }) => {
    const { createShipfastGeneration } = await import('../start/create-session-request.js')
    const { resolveStartClerkUser } = await import('../session-domain/start-auth.js')
    return createShipfastGeneration(data, {
      resolveAuthUser: resolveStartClerkUser,
    })
  })

const SAMPLE_PROMPTS = [
  'A cinematic travel landing page for curated weekend escapes with reviews and fast booking.',
  'A polished SaaS homepage for an AI sales copilot with pipeline analytics and clear pricing.',
  'A premium architecture studio site with immersive case studies, awards, and inquiry scheduling.',
  'A bold ecommerce homepage for handcrafted coffee gear with bundles and subscriptions.',
  'A sleek fintech landing page for founders tracking runway, burn, and investor updates.',
  'A modern fitness club website with class schedules, trainer profiles, and membership plans.',
]

const EXAMPLE_CHIPS = [
  { label: 'Image studio', text: 'This app is going to be an image generation studio using various AI models to turn a prompt into images. Design a mocked version (no backend). It should be dark mode. Focus on making it beautiful.' },
  { label: 'Pet wellness', text: 'Build a bold landing page for a premium pet wellness app with a booking section and customer testimonials.' },
  { label: 'SaaS dashboard', text: 'Create a clean SaaS marketing dashboard for a remote team productivity platform with charts and responsive cards.' },
  { label: 'Hindi gym site', text: 'Mere local gym ke liye ek powerful modern website banao with membership plans' },
]

export const Route = createFileRoute('/')({
  loader: () => getRecentSessions(),
  component: StartHome,
})

function StartHome() {
  const sessions = Route.useLoaderData()
  const navigate = useNavigate()
  const createGeneration = useServerFn(createStartGeneration)
  const [inputValue, setInputValue] = useState('')
  const [placeholderText, setPlaceholderText] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const animRef = useRef<{ index: number; length: number; mode: 'typing' | 'holding' | 'deleting'; timer: number | null }>({ index: 0, length: 0, mode: 'typing', timer: null })

  async function go(prompt: string) {
    const value = prompt.trim()
    if (!value) return

    setIsGenerating(true)
    try {
      const authToken = await getStartClerkToken()
      const result = await createGeneration({
        data: {
          prompt: value,
          preferredLanguage: 'en',
          preferredExportTarget: 'html',
          authToken,
        },
      })
      if (result.anonOwnerSecret && typeof window !== 'undefined') {
        window.localStorage.setItem(
          `ship-fast:anon-owner:${result.sessionId}`,
          result.anonOwnerSecret,
        )
      }
      await navigate({
        to: '/generate/$sessionId',
        params: { sessionId: result.sessionId },
      })
    } catch (err) {
      console.error('Generation failed:', err)
    } finally {
      setIsGenerating(false)
    }
  }

  useEffect(() => {
    function randomDelay(min: number, max: number) {
      return Math.floor(Math.random() * (max - min + 1)) + min
    }
    function render() {
      const current = SAMPLE_PROMPTS[animRef.current.index]
      setPlaceholderText(current.slice(0, animRef.current.length))
    }
    function step() {
      animRef.current.timer = null
      if (inputValue.length > 0) return
      const current = SAMPLE_PROMPTS[animRef.current.index]
      if (animRef.current.mode === 'typing') {
        animRef.current.length += 1
        render()
        if (animRef.current.length < current.length) {
          animRef.current.timer = window.setTimeout(step, randomDelay(16, 30))
          return
        }
        animRef.current.mode = 'holding'
        animRef.current.timer = window.setTimeout(step, 1800)
        return
      }
      if (animRef.current.mode === 'holding') {
        animRef.current.mode = 'deleting'
        animRef.current.timer = window.setTimeout(step, 640)
        return
      }
      animRef.current.length = Math.max(0, animRef.current.length - 1)
      render()
      if (animRef.current.length > 0) {
        animRef.current.timer = window.setTimeout(step, randomDelay(10, 18))
        return
      }
      animRef.current.index = (animRef.current.index + 1) % SAMPLE_PROMPTS.length
      animRef.current.mode = 'typing'
      animRef.current.timer = window.setTimeout(step, 260)
    }
    animRef.current.timer = window.setTimeout(step, 320)
    return () => {
      if (animRef.current.timer) clearTimeout(animRef.current.timer)
    }
  }, [inputValue])

  const hasValue = inputValue.length > 0
  const placeholderLabel = hasValue ? 'Your prompt' : 'Try a prompt like'

  return (
    <>
      <LaunchBackdrop />
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-end px-6 py-4">
        <HeaderUser />
      </nav>

      <div className="relative z-10 w-full max-w-[1200px] mx-auto px-0 py-0 min-h-screen grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-[clamp(28px,2.6vw,44px)] items-start pt-[clamp(82px,7vw,102px)] pr-0 pb-[clamp(32px,5vw,62px)] pl-[clamp(42px,3.4vw,58px)] max-[1100px]:max-w-[760px] max-[1100px]:grid-cols-[1fr] max-[1100px]:min-h-auto max-[1100px]:pt-[96px] max-[760px]:w-[calc(100%-24px)] max-[760px]:pt-[22px] max-[760px]:rounded-[22px] max-[760px]:px-[22px]">
        <div className="absolute top-[34px] left-0 z-14 flex items-start gap-3 max-[760px]:top-[34px] max-[760px]:left-0 max-[760px]:w-auto">
          <div className="flex items-center gap-[13px] max-[760px]:gap-[8px]">
            <div className="w-[clamp(44px,4vw,52px)] h-[clamp(44px,4vw,52px)] drop-shadow-[0_0_18px_rgba(38,231,255,0.58)] max-[760px]:w-[32px] max-[760px]:h-[32px]">
              <LogoBolt />
            </div>
            <span className="text-[clamp(42px,4.2vw,56px)] font-extrabold tracking-[-0.055em] bg-gradient-to-br from-white via-[#dffbff] to-[#23e5ff] bg-[length:180%_180%] bg-clip-text text-transparent font-sans max-[760px]:text-[clamp(32px,9vw,40px)] max-[760px]:tracking-[-0.035em]">SHIP FAST</span>
          </div>
        </div>

        <div className="relative z-4 flex flex-col items-start justify-start text-left pt-[clamp(34px,3vw,44px)] w-full max-[1100px]:p-0 max-[1100px]:items-center max-[1100px]:text-center max-[760px]:pt-[92px]">
          <p className="mb-[18px] font-mono text-[12px] font-bold tracking-[0.16em] uppercase text-[#26e7ff] drop-shadow-[0_0_18px_rgba(38,231,255,0.48)]" style={{ fontFamily: 'JetBrains Mono, ui-monospace, monospace' }}>Prompt. Generate. Launch.</p>
          <h1 className="max-w-[640px] m-0 font-sans text-[clamp(22px,2.4vw,34px)] font-semibold leading-[1.12] tracking-[-0.02em] text-[rgba(221,236,255,0.92)] text-wrap-balance drop-shadow-[0_1px_0_rgba(255,255,255,0.35),0_0_24px_rgba(255,255,255,0.1),0_12px_32px_rgba(0,0,0,0.38)] max-[760px]:text-[clamp(20px,5.5vw,28px)]" style={{ fontFamily: 'Manrope, ui-sans-serif, system-ui, sans-serif' }}>
            Print your mind<br />in seconds
          </h1>
        </div>

        <div className="relative z-1 flex flex-col items-stretch justify-start w-full min-h-[clamp(360px,34vw,420px)] max-[1100px]:relative max-[1100px]:min-h-[720px] max-[760px]:min-h-[760px]">
          <div className="flex flex-col gap-0 relative z-8 w-full max-w-none mx-0 pointer-events-auto max-[1100px]:w-[min(100%,680px)] max-[1100px]:mx-auto">
            <div className="w-full rounded-[22px] bg-[linear-gradient(145deg,rgba(255,255,255,0.06),rgba(255,255,255,0.015))] shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.08),0_0_0_1px_rgba(255,255,255,0.08),0_0_60px_rgba(100,80,200,0.04)] p-[1px] overflow-hidden isolate">
              <div className="relative z-2 bg-transparent rounded-[21px] p-[clamp(22px,2.1vw,30px)] min-w-0 overflow-hidden max-[760px]:p-[20px]">
                <form
                  className="flex flex-col"
                  onSubmit={(e) => {
                    e.preventDefault()
                    const text = inputValue.trim()
                    if (text) go(text)
                  }}
                >
                  <div className="relative">
                    <textarea
                      autoFocus
                      placeholder=""
                      className="w-full min-h-[105px] p-[14px] bg-[rgba(0,0,0,0.35)] border border-[rgba(255,255,255,0.08)] rounded-[16px] text-[#f0f0f5] resize-none outline-none transition-all duration-[320ms] ease-out hover:border-[rgba(255,255,255,0.18)] focus:border-[rgba(138,180,255,0.4)] focus:shadow-[0_0_0_3px_rgba(138,180,255,0.08),0_0_30px_rgba(138,180,255,0.06)]"
                      style={{ fontFamily: 'Manrope, ui-sans-serif, system-ui, sans-serif', fontSize: '15px', lineHeight: '1.6', caretColor: 'rgba(138,180,255,0.9)' }}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      rows={3}
                    />
                    <div className={`absolute top-[14px] left-[14px] right-[14px] bottom-[14px] flex flex-col items-start gap-[6px] pointer-events-none opacity-1 transition-opacity duration-[200ms] ease ${hasValue ? 'opacity-0' : ''}`} aria-hidden="true">
                      <span className="text-[11px] font-semibold tracking-[0.1em] uppercase text-[rgba(180,140,255,0.8)]" style={{ fontFamily: 'Manrope, ui-sans-serif, system-ui, sans-serif' }}>{placeholderLabel}</span>
                      <span className="block max-w-full max-h-[calc(1.6em*3)] overflow-hidden text-[rgba(255,255,255,0.32)] text-[15px] leading-[1.6]" style={{ WebkitMaskImage: 'linear-gradient(180deg, #000 70%, transparent)', maskImage: 'linear-gradient(180deg, #000 70%, transparent)' }}>
                        {!hasValue ? placeholderText : ''}
                        {!hasValue && <span className="inline-block w-[2px] h-[1.6em] ml-[1px] bg-[rgba(138,180,255,0.9)] align-[-0.2em] animate-[caretBlink_1s_step-end_infinite]" />}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-[12px] w-full mt-[6px] max-[760px]:gap-[8px] max-[760px]:flex-wrap">
                    <button
                      type="submit"
                      className="relative self-end px-[28px] py-[12px] bg-[rgba(255,255,255,0.045)] text-[#f0f0f5] border-none rounded-[9999px] font-semibold cursor-pointer whitespace-nowrap inline-flex items-center justify-center gap-[8px] isolate transition-all duration-[320ms] ease-out shadow-[0_0_0_1px_rgba(255,255,255,0.15),0_0_0_0_transparent,0_12px_28px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.12)] hover:not(:disabled):translate-y-[-1px] hover:not(:disabled):shadow-[0_0_0_1px_rgba(255,255,255,0.4),0_0_28px_rgba(138,180,255,0.2),0_16px_36px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.22)] active:not(:disabled):translate-y-[0px] active:not(:disabled):duration-[120ms] disabled:opacity-[0.3] disabled:cursor-not-allowed max-[760px]:w-[52px] max-[760px]:min-w-[52px] max-[760px]:p-0"
                      style={{ fontFamily: 'Manrope, ui-sans-serif, system-ui, sans-serif', fontSize: '14px', minHeight: '44px' }}
                      disabled={inputValue.trim().length === 0 || isGenerating}
                    >
                      <ZapIcon className="w-4 h-4 flex-shrink-0" />
                      <span className="max-[760px]:hidden">{isGenerating ? 'Generating...' : 'Generate'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <div className="flex flex-wrap gap-[8px] mt-[14px] mx-auto p-[10px_12px] rounded-[14px] max-w-fit justify-center bg-[rgba(20,20,24,0.35)] border border-[rgba(255,255,255,0.08)] backdrop-blur-[14px] saturate-[150%] shadow-[0_1px_0_rgba(255,255,255,0.04)_inset,0_8px_32px_rgba(0,0,0,0.35)] max-[760px]:justify-start max-[760px]:flex-wrap">
              {EXAMPLE_CHIPS.map((chip, idx) => (
                <button
                  key={chip.label}
                  type="button"
                  className="inline-flex items-center gap-[6px] px-[11px] py-[5px] rounded-[999px] border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.05)] backdrop-blur-[8px] text-[rgba(237,237,239,0.88)] font-mono text-[11px] tracking-[0.02em] cursor-pointer transition-all duration-[150ms] ease-out hover:bg-[rgba(124,58,237,0.22)] hover:border-[rgba(124,58,237,0.55)] hover:text-white hover:translate-y-[-1px] active:translate-y-[0px]"
                  style={{ fontFamily: 'JetBrains Mono, ui-monospace, monospace' }}
                  title={chip.text}
                  onClick={() => go(chip.text)}
                >
                  <span className="inline-flex items-center justify-center min-w-[14px] h-[14px] px-[4px] rounded-[4px] bg-[rgba(124,58,237,0.55)] text-white text-[10px] font-bold">{idx + 1}</span>
                  <span className="whitespace-nowrap">{chip.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <footer className="relative z-4 w-full max-w-[1200px] mx-auto mb-6 px-[28px] py-[22px] rounded-[20px] flex items-center justify-between gap-5 flex-wrap bg-[linear-gradient(145deg,rgba(255,255,255,0.06),rgba(255,255,255,0.015))] border border-[rgba(255,255,255,0.08)] backdrop-blur-[20px] shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.08),0_0_60px_rgba(100,80,200,0.04)]">
        <span className="font-mono text-[13px] text-[rgba(255,255,255,0.62)] tracking-[0.12em]" style={{ fontFamily: 'JetBrains Mono, ui-monospace, monospace' }}>SHIP FAST © 2026</span>
        <nav className="flex items-center gap-5 flex-wrap" aria-label="Footer links">
          <Link to="/" className="text-[13px] text-[rgba(255,255,255,0.62)] no-underline transition-colors duration-[200ms] ease hover:text-[#f0f0f5]">Home</Link>
          {sessions[0] ? (
            <Link
              className="text-[13px] text-[rgba(255,255,255,0.62)] no-underline transition-colors duration-[200ms] ease hover:text-[#f0f0f5]"
              to="/generate/$sessionId"
              params={{ sessionId: sessions[0].id }}
            >
              Latest session
            </Link>
          ) : null}
        </nav>
      </footer>
    </>
  )
}

function LogoBolt() {
  return (
    <svg viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M30.9 3.5 9.8 28.6h14.3l-4.2 19.9 22.3-27H27.7L30.9 3.5Z"
        fill="url(#homepageBoltG1)"
      />
      <path
        d="M30.9 3.5 9.8 28.6h14.3l-4.2 19.9 22.3-27H27.7L30.9 3.5Z"
        stroke="url(#homepageBoltG2)"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient
          id="homepageBoltG1"
          x1="11"
          y1="5"
          x2="42"
          y2="47"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#69f8ff" />
          <stop offset="0.54" stopColor="#1ab8ff" />
          <stop offset="1" stopColor="#6b3cff" />
        </linearGradient>
        <linearGradient
          id="homepageBoltG2"
          x1="8"
          y1="3"
          x2="44"
          y2="49"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#dffcff" />
          <stop offset="1" stopColor="#31dfff" stopOpacity="0.15" />
        </linearGradient>
      </defs>
    </svg>
  )
}

async function getStartClerkToken() {
  const clerk = typeof window !== 'undefined' ? (window as any).Clerk : null
  if (!clerk?.session) return ''
  try {
    return (await clerk.session.getToken()) || ''
  } catch {
    return ''
  }
}
