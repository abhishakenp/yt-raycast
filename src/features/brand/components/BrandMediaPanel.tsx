import { useAction, useMutation, useQuery } from 'convex/react'
import { Building2, Check, Loader2, Upload } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { api } from '../../../../convex/_generated/api'
import type { Id } from '../../../../convex/_generated/dataModel'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { readAnonymousOwnerSecret } from '@/features/session/services/anonymous-owner-secret'
import { readJsonOrThrow } from '@/lib/safe-fetch'
import { cn } from '@/lib/utils'

type BrandMediaPanelProps = {
  sessionId?: string
  prompt?: string
  cloneUrl?: string
  designReferenceNotes?: string
  designReferenceUrls?: string[]
  onSelectBrand?: (brand: {
    name: string
    domain: string | null
    brandId: string | null
    icon: string | null
    logo: string | null
  }) => void | Promise<void>
}

type BrandLogoResult = {
  id: string
  name: string
  domain: string | null
  brandId: string | null
  icon: string | null
  logo: string | null
  verified: boolean
}

type BrandSearchPage = {
  results: BrandLogoResult[]
  continueCursor: string | null
  isDone: boolean
}

type UploadedImage = {
  url: string | null
  filename?: string | null
}

const MAX_FILE_SIZE = 8 * 1024 * 1024
const ACCEPTED_TYPES = [
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'image/svg+xml',
]
const PAGE_SIZE = 5

const domainFromUrl = (value: string | undefined): string => {
  if (!value) return ''
  try {
    return new URL(value).hostname.replace(/^www\./, '')
  } catch {
    return value.replace(/^https?:\/\//i, '').replace(/\/.*$/, '')
  }
}

const validateImageFile = (file: {
  type: string
  size: number
}): string | null => {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return `Unsupported file type: ${file.type}`
  }
  if (file.size > MAX_FILE_SIZE) {
    return `File too large (max ${MAX_FILE_SIZE / 1024 / 1024}MB)`
  }
  return null
}

export const BrandMediaPanel = ({
  sessionId,
  prompt = '',
  cloneUrl,
  designReferenceNotes = '',
  designReferenceUrls = [],
  onSelectBrand,
}: BrandMediaPanelProps) => {
  const initialQuery = useMemo(
    () =>
      domainFromUrl(cloneUrl || designReferenceUrls[0]) ||
      prompt.split(/\s+/).slice(0, 3).join(' '),
    [cloneUrl, designReferenceUrls, prompt],
  )
  const [brandQuery, setBrandQuery] = useState(initialQuery)
  const [results, setResults] = useState<BrandLogoResult[]>([])
  const [selectedLogo, setSelectedLogo] = useState<BrandLogoResult | null>(null)
  const [continueCursor, setContinueCursor] = useState<string | null>(null)
  const [isDone, setIsDone] = useState(true)
  const [error, setError] = useState<string>()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string>()
  const listRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const requestIdRef = useRef(0)
  const pageCacheRef = useRef<Map<string, BrandSearchPage>>(new Map())

  const searchBrands = useAction(api.brandfetch.search)
  const generateUploadUrl = useMutation(api.sessions.generateImageUploadUrl)
  const saveUserImage = useMutation(api.sessions.saveUserImage)
  const userImages = useQuery(
    api.sessions.listUserImages,
    sessionId ? { sessionId: sessionId as Id<'sessions'> } : 'skip',
  ) as UploadedImage[] | undefined

  const loadBrands = useCallback(
    async (cursor: string | null, mode: 'replace' | 'append') => {
      const query = brandQuery.trim()
      if (query.length < 2) {
        setResults([])
        setContinueCursor(null)
        setIsDone(true)
        setError(undefined)
        return
      }

      const cacheKey = `${query}:${cursor ?? 'start'}`
      const cached = pageCacheRef.current.get(cacheKey)
      if (cached) {
        setResults((current) =>
          mode === 'append' ? [...current, ...cached.results] : cached.results,
        )
        setContinueCursor(cached.continueCursor)
        setIsDone(cached.isDone)
        setError(undefined)
        return
      }

      const requestId = ++requestIdRef.current
      if (mode === 'append') setIsLoadingMore(true)
      else setIsLoading(true)

      try {
        const page = (await searchBrands({
          query,
          cursor,
          pageSize: PAGE_SIZE,
        })) as BrandSearchPage
        if (requestId !== requestIdRef.current) return
        pageCacheRef.current.set(cacheKey, page)
        setResults((current) =>
          mode === 'append' ? [...current, ...page.results] : page.results,
        )
        setContinueCursor(page.continueCursor)
        setIsDone(page.isDone)
        setError(undefined)
      } catch (lookupError) {
        if (requestId !== requestIdRef.current) return
        if (mode !== 'append') setResults([])
        setError(
          lookupError instanceof Error
            ? lookupError.message
            : 'Brand lookup failed',
        )
      } finally {
        if (requestId === requestIdRef.current) {
          setIsLoading(false)
          setIsLoadingMore(false)
        }
      }
    },
    [brandQuery, searchBrands],
  )

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadBrands(null, 'replace')
    }, 300)
    return () => window.clearTimeout(timer)
  }, [loadBrands])

  const loadMore = useCallback(() => {
    if (isLoading || isLoadingMore || isDone || !continueCursor) return
    void loadBrands(continueCursor, 'append')
  }, [continueCursor, isDone, isLoading, isLoadingMore, loadBrands])

  const handleListScroll = useCallback(() => {
    const el = listRef.current
    if (!el) return
    const remaining = el.scrollHeight - el.scrollTop - el.clientHeight
    if (remaining < 80) loadMore()
  }, [loadMore])

  const uploadFile = useCallback(
    async (file: File) => {
      if (!sessionId) {
        setUploadError('Open a session before uploading images.')
        return
      }
      const validationError = validateImageFile(file)
      if (validationError) {
        setUploadError(validationError)
        return
      }

      setIsUploading(true)
      setUploadError(undefined)
      try {
        const anonymousOwnerSecret =
          typeof window === 'undefined'
            ? undefined
            : readAnonymousOwnerSecret(window.localStorage, sessionId)
        const uploadUrl = await generateUploadUrl({
          sessionId: sessionId as Id<'sessions'>,
          anonymousOwnerSecret,
        })
        const response = await fetch(uploadUrl, {
          method: 'POST',
          headers: { 'Content-Type': file.type },
          body: file,
        })
        if (!response.ok) throw new Error(`Upload failed: ${response.status}`)
        const { storageId } = await readJsonOrThrow<{
          storageId: Id<'_storage'>
        }>(response, 'Upload failed')
        await saveUserImage({
          sessionId: sessionId as Id<'sessions'>,
          anonymousOwnerSecret,
          storageId,
          filename: file.name,
          contentType: file.type,
          size: file.size,
        })
      } catch (uploadFailure) {
        setUploadError(
          uploadFailure instanceof Error
            ? uploadFailure.message
            : 'Upload failed',
        )
      } finally {
        setIsUploading(false)
      }
    },
    [generateUploadUrl, saveUserImage, sessionId],
  )

  const uploadedImages =
    userImages
      ?.filter((image): image is UploadedImage & { url: string } =>
        Boolean(image.url),
      )
      .slice(0, 6) ?? []

  void cloneUrl
  void designReferenceUrls
  void designReferenceNotes

  return (
    <div className="w-full overflow-hidden">
      <Command shouldFilter={false}>
        <div className="flex items-center gap-1 border-b pr-1">
          <CommandInput
            value={brandQuery}
            onValueChange={setBrandQuery}
            placeholder="Search brands or domains..."
          />
          <button
            type="button"
            aria-label="Upload custom image"
            title="Upload custom image"
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-md border border-input bg-background text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-50"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {isUploading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Upload className="size-4" />
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(',')}
            multiple
            className="hidden"
            onChange={(event) => {
              const files = Array.from(event.currentTarget.files ?? [])
              for (const file of files) void uploadFile(file)
              event.currentTarget.value = ''
            }}
          />
        </div>

        {uploadError && (
          <p className="m-0 border-b px-3 py-2 text-xs text-destructive">
            {uploadError}
          </p>
        )}
        {error && (
          <p className="m-0 border-b px-3 py-2 text-xs text-destructive">
            {error}
          </p>
        )}

        <CommandList
          ref={listRef}
          onScroll={handleListScroll}
          className="max-h-[360px] overflow-y-auto"
        >
          <CommandEmpty>
            {isLoading ? 'Searching Brandfetch...' : 'No brand logos found.'}
          </CommandEmpty>
          <CommandGroup>
            {isLoading && results.length === 0
              ? [...Array(6)].map((_, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-2 py-1.5"
                  >
                    <div className="size-8 animate-pulse rounded-md bg-muted" />
                    <div className="grid flex-1 gap-1.5">
                      <div className="h-3 w-28 animate-pulse rounded bg-muted" />
                      <div className="h-2.5 w-20 animate-pulse rounded bg-muted" />
                    </div>
                  </div>
                ))
              : results.map((result) => (
                  <CommandItem
                    key={`${result.id}-${result.logo ?? result.icon ?? ''}`}
                    value={[result.name, result.domain, result.brandId]
                      .filter(Boolean)
                      .join(' ')}
                    onSelect={() => {
                      setSelectedLogo(result)
                      onSelectBrand?.({
                        name: result.name,
                        domain: result.domain,
                        brandId: result.brandId,
                        icon: result.icon,
                        logo: result.logo,
                      })
                    }}
                    className="items-center gap-2"
                  >
                    <span className="grid size-8 shrink-0 place-items-center overflow-hidden rounded-md border bg-white">
                      {result.logo || result.icon ? (
                        <img
                          src={result.logo ?? result.icon ?? ''}
                          alt=""
                          className="max-h-6 max-w-6 object-contain"
                          loading="lazy"
                        />
                      ) : (
                        <Building2 className="size-4 text-slate-500" />
                      )}
                    </span>
                    <span className="grid min-w-0 flex-1 gap-0.5">
                      <span className="truncate text-sm font-medium">
                        {result.name}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {result.domain ?? result.brandId ?? 'Brandfetch'}
                      </span>
                    </span>
                    <Check
                      className={cn(
                        'ml-auto size-4',
                        selectedLogo?.id === result.id
                          ? 'opacity-100'
                          : 'opacity-0',
                      )}
                    />
                  </CommandItem>
                ))}
          </CommandGroup>
          {isLoadingMore && (
            <div className="flex items-center justify-center gap-2 py-3">
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                Loading more...
              </span>
            </div>
          )}
          {!isLoading && !isLoadingMore && results.length > 0 && isDone && (
            <p className="m-0 py-3 text-center text-xs text-muted-foreground">
              No more logos
            </p>
          )}
        </CommandList>
      </Command>

      {uploadedImages.length > 0 && (
        <div className="grid gap-2 border-t p-2">
          <div className="grid grid-cols-6 gap-1.5">
            {uploadedImages.map((image, index) => (
              <span
                key={`${image.url}-${index}`}
                className="aspect-square overflow-hidden rounded-md border bg-muted"
                title={image.filename ?? `Uploaded image ${index + 1}`}
              >
                <img
                  src={image.url}
                  alt=""
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
