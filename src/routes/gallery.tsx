import { createFileRoute } from '@tanstack/react-router'

import { GalleryPage } from '@/features/gallery/components/GalleryPage'

export const Route = createFileRoute('/gallery')({
  component: GalleryPage,
})
