export const GALLERY_PAGE_DEFAULT = 12
export const GALLERY_PAGE_MAX = 24

export const parseGalleryPagination = (query = {}) => {
  const limitRaw = parseInt(String(query.limit ?? ''), 10)
  const pageRaw = parseInt(String(query.page ?? ''), 10)
  const limit = Math.min(
    Math.max(Number.isFinite(limitRaw) ? limitRaw : GALLERY_PAGE_DEFAULT, 1),
    GALLERY_PAGE_MAX,
  )
  const page = Math.max(Number.isFinite(pageRaw) ? pageRaw : 1, 1)
  return { limit, page }
}

export const paginateGalleryList = (items, page, limit) => {
  const total = items.length
  const totalPages = Math.max(1, Math.ceil(total / limit) || 1)
  const safePage = Math.min(page, totalPages)
  const slice = items.slice((safePage - 1) * limit, safePage * limit)
  return {
    items: slice,
    page: safePage,
    limit,
    total,
    totalPages,
    hasNext: safePage < totalPages,
    hasPrev: safePage > 1,
  }
}
