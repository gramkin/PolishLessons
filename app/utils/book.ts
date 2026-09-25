/** Content stems look like `books/<slug>`; the route only wants the last segment. */
export function bookSlug(stem: string): string {
  return stem.split('/').pop() ?? stem
}
