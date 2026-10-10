import { IDIOM_BANDS, type PublishedIdiom } from '#shared/idioms'
import { normalizeLoose } from './normalize'

export interface IdiomFilter {
  query: string
  kind: PublishedIdiom['kind'] | null
  /** index into IDIOM_BANDS */
  band: number | null
  /** swearing stays out unless asked for: the page is a study list, not a slang dictionary */
  vulgar: boolean
}

export function filterIdioms(idioms: PublishedIdiom[], filter: IdiomFilter): PublishedIdiom[] {
  const query = normalizeLoose(filter.query.trim())
  const band = filter.band === null ? null : IDIOM_BANDS[filter.band]
  return idioms.filter(
    (i) =>
      (filter.vulgar || i.register !== 'vulgar') &&
      (!filter.kind || i.kind === filter.kind) &&
      (!band || (i.rank >= band.start && i.rank <= band.end)) &&
      (!query || normalizeLoose(i.pl).includes(query) || normalizeLoose(i.ru).includes(query)),
  )
}
