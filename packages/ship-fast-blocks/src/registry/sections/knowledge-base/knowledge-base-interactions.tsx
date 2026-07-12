import type { FormEvent } from 'react'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import type { LakebedClientRuntime } from '@ship-fast/lakebed/react'

import type {
  knowledgeBaseLakebed,
  KnowledgeBaseArticleInput,
  KnowledgeBaseSearchInput,
} from './knowledge-base-lakebed.ts'

export type KnowledgeBaseLakebed = LakebedClientRuntime<
  typeof knowledgeBaseLakebed
>

export function kbArticleItem({
  category,
  content,
  slug,
  title,
}: KnowledgeBaseArticleInput): KnowledgeBaseArticleInput {
  return {
    category: category ?? '',
    content: content ?? '',
    slug,
    title,
  }
}

export function useSyncKbCatalog(
  lakebed: KnowledgeBaseLakebed,
  items: KnowledgeBaseArticleInput[],
) {
  const syncKbArticles = lakebed.useMutation('syncKbArticles')
  const syncKbArticlesRef = useRef(syncKbArticles)
  const itemKey = useMemo(() => JSON.stringify(items), [items])
  const stableItems = useMemo(
    () => items.map((item) => kbArticleItem(item)),
    [itemKey],
  )

  useEffect(() => {
    syncKbArticlesRef.current = syncKbArticles
  }, [syncKbArticles])

  useEffect(() => {
    if (!stableItems.length) return
    void syncKbArticlesRef.current({ items: stableItems })
  }, [stableItems])
}

export function useKbSearch(lakebed: KnowledgeBaseLakebed) {
  const state = lakebed.useQuery('kbSearch')
  const setKbSearch = lakebed.useMutation('setKbSearch')

  const submitSearch = useCallback(
    (event) => {
      event.preventDefault()
      if (setKbSearch.isPending) return

      const form = event.currentTarget
      const formData = new FormData(form)
      const input: KnowledgeBaseSearchInput = {
        query: String(formData.get('query') ?? ''),
      }

      void setKbSearch(input)
    },
    [setKbSearch],
  )

  const chooseSearch = useCallback(
    (input) => {
      if (setKbSearch.isPending) return
      void setKbSearch(input)
    },
    [setKbSearch],
  )

  return {
    chooseSearch,
    isPending: setKbSearch.isPending,
    state,
    submitSearch,
  }
}
