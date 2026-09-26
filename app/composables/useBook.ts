/**
 * Every chapter's metadata, for the contents list and the neighbouring-chapter
 * links. The paragraphs are deliberately left out: a chapter carries the whole
 * translated text, so selecting them here would put the entire book into the
 * payload of every page that needs nothing but a title.
 */
export function useBookChapters() {
  return useAsyncData('content:book-chapters', () =>
    queryCollection('books')
      .select('stem', 'title', 'titleRu', 'chapter', 'chapterTitle', 'chapterTitleRu', 'level')
      .all(),
  )
}

export function useBook(slug: string) {
  return useAsyncData(`book:${slug}`, () =>
    queryCollection('books').where('stem', '=', `books/${slug}`).first(),
  )
}
