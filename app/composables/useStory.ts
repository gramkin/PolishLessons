export function useStory(slug: string) {
  return useAsyncData(`story:${slug}`, () =>
    queryCollection('stories').where('stem', '=', `stories/${slug}`).first(),
  )
}
