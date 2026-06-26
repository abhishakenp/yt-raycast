export type CmsPreviewBlogPost = {
  itemId?: string
  title: string
  slug: string
  excerpt: string
  author: string
  category: string
  coverImageUrl?: string
  body: string
  status: 'draft' | 'published'
  updatedAt?: number
}

const cmsPostsSelector = '[data-ship-fast-cms-blog-posts]'

const normalizeText = (value: string | undefined): string =>
  value?.trim().replace(/\s+/g, ' ') ?? ''

const postSignature = (posts: Array<CmsPreviewBlogPost>): string =>
  posts
    .map((post) =>
      [
        post.itemId ?? post.slug,
        post.updatedAt ?? '',
        post.title,
        post.excerpt,
        post.author,
        post.category,
        post.coverImageUrl ?? '',
      ].join(':'),
    )
    .join('|')

const publicationPattern =
  /\b(latest\s+(articles|posts|stories)|from\s+the\s+blog|blog|articles|stories|journal|insights)\b/i

const findPublicationAnchor = (root: HTMLElement): HTMLElement => {
  const candidates = Array.from(
    root.querySelectorAll<HTMLElement>('section, [aria-label]'),
  )

  for (const candidate of candidates) {
    const label = candidate.getAttribute('aria-label') ?? ''
    const headings = Array.from(
      candidate.querySelectorAll<HTMLHeadingElement>('h1,h2,h3'),
    )
      .map((heading) => heading.textContent ?? '')
      .join(' ')
    if (publicationPattern.test(`${label} ${headings}`)) return candidate
  }

  return root.querySelector<HTMLElement>('main') ?? root
}

const appendText = (
  parent: HTMLElement,
  tagName: string,
  className: string,
  text: string,
): HTMLElement => {
  const node = document.createElement(tagName)
  node.className = className
  node.textContent = text
  parent.appendChild(node)
  return node
}

const createPostCard = (post: CmsPreviewBlogPost): HTMLElement => {
  const article = document.createElement('article')
  article.id = `cms-post-${post.slug}`
  article.className =
    'group flex min-h-[320px] flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg'

  if (post.coverImageUrl) {
    const image = document.createElement('img')
    image.className = 'h-44 w-full object-cover'
    image.src = post.coverImageUrl
    image.alt = post.title
    article.appendChild(image)
  } else {
    const cover = document.createElement('div')
    cover.className =
      'grid h-44 place-items-center bg-muted px-6 text-center text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground'
    cover.textContent = normalizeText(post.category) || 'Article'
    article.appendChild(cover)
  }

  const body = document.createElement('div')
  body.className = 'flex flex-1 flex-col gap-3 p-5'
  article.appendChild(body)

  const meta = document.createElement('div')
  meta.className =
    'flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground'
  body.appendChild(meta)

  appendText(
    meta,
    'span',
    'rounded-full bg-primary/10 px-2.5 py-1 font-bold text-primary',
    normalizeText(post.category) || 'Article',
  )
  appendText(
    meta,
    'span',
    '',
    `By ${normalizeText(post.author) || 'Editorial'}`,
  )

  appendText(
    body,
    'h3',
    'text-xl font-bold leading-tight tracking-normal text-foreground',
    normalizeText(post.title) || 'Untitled post',
  )
  appendText(
    body,
    'p',
    'text-sm leading-6 text-muted-foreground',
    normalizeText(post.excerpt) || normalizeText(post.body).slice(0, 160),
  )

  appendText(
    body,
    'span',
    'mt-auto pt-2 text-sm font-bold text-primary',
    'Read article',
  )

  return article
}

const createCmsBlogPostsSection = (
  posts: Array<CmsPreviewBlogPost>,
): HTMLElement => {
  const section = document.createElement('section')
  section.dataset.shipFastCmsBlogPosts = 'true'
  section.dataset.cmsSignature = postSignature(posts)
  section.className = 'mx-auto w-full max-w-6xl px-6 py-14'

  const header = document.createElement('div')
  header.className =
    'mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between'
  section.appendChild(header)

  const headingGroup = document.createElement('div')
  headingGroup.className = 'grid gap-2'
  header.appendChild(headingGroup)

  appendText(
    headingGroup,
    'p',
    'text-xs font-bold uppercase tracking-[0.14em] text-primary',
    'Latest posts',
  )
  appendText(
    headingGroup,
    'h2',
    'text-3xl font-bold leading-tight tracking-normal text-foreground',
    'From the blog',
  )

  const count = document.createElement('p')
  count.className = 'text-sm font-medium text-muted-foreground'
  count.textContent = `${posts.length} published ${posts.length === 1 ? 'post' : 'posts'}`
  header.appendChild(count)

  const grid = document.createElement('div')
  grid.className = 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3'
  section.appendChild(grid)

  for (const post of posts) {
    grid.appendChild(createPostCard(post))
  }

  return section
}

export const applyCmsBlogPostsToPreviewDom = (
  root: HTMLElement,
  posts: Array<CmsPreviewBlogPost>,
): void => {
  const publishedPosts = posts.filter((post) => post.status === 'published')
  const existing = root.querySelector<HTMLElement>(cmsPostsSelector)

  if (publishedPosts.length === 0) {
    existing?.remove()
    return
  }

  const signature = postSignature(publishedPosts)
  if (existing?.dataset.cmsSignature === signature) return

  existing?.remove()

  const section = createCmsBlogPostsSection(publishedPosts)
  const anchor = findPublicationAnchor(root)

  if (anchor === root || anchor.tagName.toLowerCase() === 'main') {
    anchor.appendChild(section)
    return
  }

  anchor.after(section)
}
