'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchPublicGalleryPage, publicGalleryQueryKey } from '@/lib/home/public-gallery-query'

export const HomePublicGalleryWarmup = () => {
  useQuery({
    queryKey: publicGalleryQueryKey(1),
    queryFn: () => fetchPublicGalleryPage(1),
    staleTime: 90_000,
  })
  return null
}
