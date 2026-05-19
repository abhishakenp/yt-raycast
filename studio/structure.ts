import type { StructureResolver } from 'sanity/structure'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Blog')
        .child(
          S.list()
            .title('Blog')
            .items([
              S.documentTypeListItem('post').title('Posts'),
              S.documentTypeListItem('author').title('Authors'),
              S.documentTypeListItem('category').title('Categories'),
            ]),
        ),
      S.divider(),
      S.listItem()
        .title('Institutional')
        .child(
          S.list()
            .title('Institutional')
            .items([
              S.documentTypeListItem('officialNotice').title('Notices and tenders'),
              S.documentTypeListItem('jobOpening').title('Job openings'),
              S.documentTypeListItem('documentCategory').title('Document categories'),
            ]),
        ),
      S.divider(),
      S.documentTypeListItem('siteSettings').title('Site settings'),
      S.documentTypeListItem('sessionChat').title('Session chats'),
    ])
