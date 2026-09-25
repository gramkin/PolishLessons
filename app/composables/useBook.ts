export function useBook(slug: string) {
  return useAsyncData(`book:${slug}`, () =>
    queryCollection('books').where('stem', '=', `books/${slug}`).first(),
  )
}
