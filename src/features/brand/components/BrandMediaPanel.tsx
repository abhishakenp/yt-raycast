import { Building2, Image as ImageIcon, RefreshCw, Search } from 'lucide-react'
import { useMemo, useState } from 'react'

type BrandMediaPanelProps = {
  prompt?: string
  cloneUrl?: string
  designReferenceNotes?: string
  designReferenceUrls?: string[]
}

type BrandProfile = {
  ok?: boolean
  error?: string
  query?: string
  match?: {
    name?: string
    domain?: string
    brandId?: string
  } | null
  logo?: {
    src?: string
    url?: string
  } | null
  palette?: {
    colors?: string[]
    dominant?: string
  } | string[] | null
  confidence?: number | null
}

const domainFromUrl = (value: string | undefined): string => {
  if (!value) return ''
  try {
    return new URL(value).hostname.replace(/^www\./, '')
  } catch {
    return value.replace(/^https?:\/\//i, '').replace(/\/.*$/, '')
  }
}

const paletteColors = (palette: BrandProfile['palette']): string[] => {
  if (Array.isArray(palette)) return palette.filter((color): color is string => typeof color === 'string')
  const colors = palette?.colors ?? []
  const dominant = palette?.dominant
  return [...(typeof dominant === 'string' ? [dominant] : []), ...colors].filter(Boolean).slice(0, 8)
}

export const BrandMediaPanel = ({
  prompt = '',
  cloneUrl,
  designReferenceNotes = '',
  designReferenceUrls = [],
}: BrandMediaPanelProps) => {
  const initialQuery = useMemo(
    () => domainFromUrl(cloneUrl || designReferenceUrls[0]) || prompt.split(/\s+/).slice(0, 3).join(' '),
    [cloneUrl, designReferenceUrls, prompt],
  )
  const [brandQuery, setBrandQuery] = useState(initialQuery)
  const [imageQuery, setImageQuery] = useState(prompt || initialQuery || 'modern website')
  const [profile, setProfile] = useState<BrandProfile | null>(null)
  const [imageUrl, setImageUrl] = useState<string>()
  const [error, setError] = useState<string>()
  const [isLoading, setIsLoading] = useState(false)

  const lookupBrand = async () => {
    setError(undefined)
    setIsLoading(true)

    try {
      const response = await fetch(`/api/brand-profile?query=${encodeURIComponent(brandQuery)}`)
      const data = (await response.json()) as BrandProfile
      if (!response.ok || data.ok !== true) throw new Error(data.error ?? 'Brand lookup failed')
      setProfile(data)
    } catch (lookupError) {
      setProfile(null)
      setError(lookupError instanceof Error ? lookupError.message : 'Brand lookup failed')
    } finally {
      setIsLoading(false)
    }
  }

  const loadImage = () => {
    const query = imageQuery.trim() || brandQuery.trim() || 'website'
    setImageUrl(`/api/pexels?query=${encodeURIComponent(query)}&w=960&h=540&seed=${Date.now()}`)
  }

  const logoUrl = profile?.logo?.src ?? profile?.logo?.url
  const colors = paletteColors(profile?.palette)

  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        <Building2 className="size-4 text-cyan-200" />
        <div>
          <h2 className="m-0 text-sm font-semibold uppercase tracking-[0.1em] text-white">Brand and media</h2>
          <p className="m-0 mt-1 text-xs leading-5 text-white/48">Inspect brand profile and stock media helpers for this session.</p>
        </div>
      </div>

      <section className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-3">
        <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-white/45">
          Brand or domain
          <input
            className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm normal-case tracking-normal text-white outline-none"
            disabled={isLoading}
            onChange={(event) => setBrandQuery(event.target.value)}
            value={brandQuery}
          />
        </label>
        <button
          className="inline-flex min-h-9 items-center justify-center gap-2 rounded-full bg-cyan-300 px-3 py-2 text-sm font-bold text-slate-950 transition-transform hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-45"
          disabled={isLoading || !brandQuery.trim()}
          onClick={() => void lookupBrand()}
          type="button"
        >
          {isLoading ? <RefreshCw className="size-4" /> : <Search className="size-4" />}
          {isLoading ? 'Looking up...' : 'Lookup brand'}
        </button>
        {profile && (
          <div className="grid gap-3 rounded-xl border border-white/10 bg-black/20 p-3">
            <div className="flex items-center gap-3">
              {logoUrl && <img alt="" className="size-10 rounded-xl bg-white object-contain p-1" src={logoUrl} />}
              <div className="min-w-0">
                <p className="m-0 truncate text-sm font-semibold text-white">{profile.match?.name ?? profile.query ?? brandQuery}</p>
                <p className="m-0 mt-1 truncate font-mono text-[0.68rem] uppercase tracking-[0.08em] text-white/38">{profile.match?.domain ?? profile.match?.brandId ?? 'brand profile'}</p>
              </div>
            </div>
            {colors.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {colors.map((color) => (
                  <span className="size-6 rounded-lg border border-white/10" key={color} style={{ background: color }} title={color} />
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      <section className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-3">
        <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-white/45">
          Image search
          <input
            className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm normal-case tracking-normal text-white outline-none"
            onChange={(event) => setImageQuery(event.target.value)}
            value={imageQuery}
          />
        </label>
        <button
          className="inline-flex min-h-9 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-bold text-white/72 transition-colors hover:bg-white/[0.08]"
          onClick={loadImage}
          type="button"
        >
          <ImageIcon className="size-4" />
          Preview image
        </button>
        {imageUrl && <img alt="" className="aspect-video w-full rounded-xl border border-white/10 object-cover" src={imageUrl} />}
      </section>

      {(cloneUrl || designReferenceUrls.length > 0 || designReferenceNotes) && (
        <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
          <p className="m-0 text-[0.7rem] font-bold uppercase tracking-[0.1em] text-white/42">Design references</p>
          {cloneUrl && <p className="m-0 mt-2 truncate text-xs text-white/62">Clone: {cloneUrl}</p>}
          {designReferenceUrls.map((url) => (
            <p className="m-0 mt-1 truncate text-xs text-white/62" key={url}>Reference: {url}</p>
          ))}
          {designReferenceNotes && <p className="m-0 mt-2 text-xs leading-5 text-white/48">{designReferenceNotes}</p>}
        </section>
      )}

      {error && (
        <p className="m-0 rounded-xl border border-rose-500/30 bg-rose-500/12 p-3 text-sm text-rose-200">
          {error}
        </p>
      )}
    </div>
  )
}
