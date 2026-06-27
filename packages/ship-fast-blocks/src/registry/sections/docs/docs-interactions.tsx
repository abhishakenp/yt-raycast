import type { FormEvent } from 'react'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import type { LakebedClientRuntime } from '@ship-fast/lakebed/react'

import type {
  docsLakebed,
  DocsCatalogInput,
  DocsSearchInput,
} from './docs-lakebed.ts'

export type DocsLakebed = LakebedClientRuntime<typeof docsLakebed>

type DocsCatalogItem = NonNullable<
  ReturnType<typeof docsLakebed.queries.docsCatalog>
>[number]

export const docsCatalogItem = ({
  category,
  content,
  slug,
  title,
}: DocsCatalogInput): DocsCatalogInput => ({
  category: category ?? '',
  content: content ?? '',
  slug,
  title: title ?? '',
})

export function useSyncDocsCatalog(
  lakebed: DocsLakebed,
  articles: DocsCatalogInput[],
) {
  const syncDocsArticles = lakebed.useMutation('syncDocsArticles')
  const syncDocsArticlesRef = useRef(syncDocsArticles)
  const articleKey = useMemo(() => JSON.stringify(articles), [articles])
  const stableArticles = useMemo(
    () => articles.map((article) => docsCatalogItem(article)),
    [articleKey],
  )

  useEffect(() => {
    syncDocsArticlesRef.current = syncDocsArticles
  }, [syncDocsArticles])

  useEffect(() => {
    if (!stableArticles.length) return
    void syncDocsArticlesRef.current({ articles: stableArticles })
  }, [stableArticles])
}

export function useDocsSearch(lakebed: DocsLakebed) {
  const state = lakebed.useQuery('docsState')
  const setDocsSearch = lakebed.useMutation('setDocsSearch')

  const submitSearch = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      if (setDocsSearch.isPending) return

      const formData = new FormData(event.currentTarget)
      const input: DocsSearchInput = {
        query: String(formData.get('query') ?? ''),
      }

      void setDocsSearch(input)
    },
    [setDocsSearch],
  )

  const chooseSearch = useCallback(
    (input: DocsSearchInput) => {
      if (setDocsSearch.isPending) return
      void setDocsSearch(input)
    },
    [setDocsSearch],
  )

  return {
    chooseSearch,
    isPending: setDocsSearch.isPending,
    state,
    submitSearch,
  }
}

export type { DocsCatalogItem }
