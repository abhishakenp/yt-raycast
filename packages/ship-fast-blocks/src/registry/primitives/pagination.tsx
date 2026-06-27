import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import {
  Pagination as UIPagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '#/components/ui/pagination.tsx'

// Compound primitive: flatten Pagination/PaginationContent/PaginationItem/...
// into a single node. `pages` is the list of page numbers to show; `activePage`
// highlights the current one; `ellipsis` appends a "more pages" gap.
export const Pagination = defineCapsule({
  name: 'Pagination',
  description:
    'Page navigation control with previous/next, numbered page links and an optional trailing ellipsis.',
  props: z.object({
    pages: z.array(z.string()).optional(),
    activePage: z.string().optional(),
    ellipsis: z.boolean().optional(),
    showPrevious: z.boolean().optional(),
    showNext: z.boolean().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const pages = props.pages?.length ? props.pages : ['1', '2', '3']
    const active = props.activePage ?? pages[0]
    return (
      <UIPagination className={props.className}>
        <PaginationContent>
          {props.showPrevious !== false && (
            <PaginationItem>
              <PaginationPrevious href="#" />
            </PaginationItem>
          )}
          {pages.map((page) => (
            <PaginationItem key={page}>
              <PaginationLink href="#" isActive={page === active}>
                {page}
              </PaginationLink>
            </PaginationItem>
          ))}
          {props.ellipsis && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}
          {props.showNext !== false && (
            <PaginationItem>
              <PaginationNext href="#" />
            </PaginationItem>
          )}
        </PaginationContent>
      </UIPagination>
    )
  },
})
