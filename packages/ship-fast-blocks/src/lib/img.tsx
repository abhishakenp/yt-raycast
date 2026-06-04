import { useQuery } from "@tanstack/react-query"
import { useEffect, useRef, useState } from "react"
import type { ImgHTMLAttributes } from "react"

function slugify(alt: string | undefined): string {
  return (
    (alt ?? "image")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "image"
  )
}

/** Legacy fallback — deterministic placeholder from alt text. */
export function picsum(alt: string | undefined, w = 800, h = 600): string {
  const seed = slugify(alt)
  return `https://picsum.photos/seed/${seed}/${w}/${h}`
}

/** Fetches a relevant Pexels image based on alt text and caches it via React Query. */
export function usePexelsImage(alt: string | undefined, w = 800, h = 600, enabled = true) {
  const seed = slugify(alt)

  return useQuery({
    queryKey: ["pexels", seed, w, h],
    queryFn: async () => {
      const res = await fetch(
        `/api/pexels?query=${encodeURIComponent(seed)}&w=${w}&h=${h}`
      )
      if (!res.ok) throw new Error("pexels fetch failed")
      const data = await res.json()
      return data.url as string
    },
    staleTime: Infinity,
    enabled: !!alt && enabled,
  })
}

/** Drop-in replacement for `<img>` that resolves a relevant Pexels image from `alt` text.
 *  Falls back to picsum while loading. Cached via React Query so identical alt text reuses the same URL. */
export function Image({
  alt,
  w = 800,
  h = 600,
  className,
  loading,
  ...rest
}: {
  alt?: string
  w?: number
  h?: number
} & Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "alt" | "width" | "height">) {
  if (typeof window === "undefined") {
    return (
      <img
        src={picsum(alt, w, h)}
        alt={alt}
        width={w}
        height={h}
        className={className}
        loading={loading}
        {...rest}
      />
    )
  }
  const imgRef = useRef<HTMLImageElement | null>(null)
  const isLazy = loading === "lazy"
  const [shouldResolvePexels, setShouldResolvePexels] = useState(!isLazy)

  useEffect(() => {
    if (!isLazy || shouldResolvePexels) return
    const img = imgRef.current
    if (!img || typeof IntersectionObserver === "undefined") {
      setShouldResolvePexels(true)
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        setShouldResolvePexels(true)
        observer.disconnect()
      },
      { rootMargin: "600px 0px" },
    )
    observer.observe(img)
    return () => observer.disconnect()
  }, [isLazy, shouldResolvePexels])

  const { data: src } = usePexelsImage(alt, w, h, shouldResolvePexels)
  return (
    <img
      ref={imgRef}
      src={src ?? picsum(alt, w, h)}
      alt={alt}
      width={w}
      height={h}
      className={className}
      loading={loading}
      {...rest}
    />
  )
}
