import type { CuratedIdiom, FrequencyFile, PublishedIdiom } from '../../shared/idioms'

/**
 * Join the counts with the hand-checked classification. Only classified entries are
 * published — the long tail stays on the cards until someone checks it — and `skip` ones never
 * are. Ranks are counted among the published entries, most frequent first.
 */
export function buildIdiomList(
  frequency: FrequencyFile,
  curated: CuratedIdiom[],
): { idioms: PublishedIdiom[]; errors: string[] } {
  const byPl = new Map(frequency.idioms.map((e) => [e.pl, e]))
  const errors: string[] = []
  const seen = new Set<string>()
  const kept: (Omit<PublishedIdiom, 'rank'> & { count: number })[] = []
  for (const entry of curated) {
    if (seen.has(entry.pl)) errors.push(`data/idioms.yml: "${entry.pl}" is classified twice`)
    seen.add(entry.pl)
    const counted = byPl.get(entry.pl)
    if (!counted) {
      errors.push(`data/idioms.yml: "${entry.pl}" is not in data/idiom-frequency.json`)
      continue
    }
    if (entry.kind === 'skip') continue
    kept.push({
      pl: entry.fix ?? counted.pl,
      ru: entry.ru ?? counted.ru,
      kind: entry.kind,
      register: entry.register ?? 'neutral',
      perMillion: counted.perMillion,
      cards: counted.cards,
      count: counted.count,
    })
  }
  kept.sort((a, b) => b.count - a.count || a.pl.localeCompare(b.pl, 'pl'))
  return { idioms: kept.map(({ count: _count, ...e }, i) => ({ ...e, rank: i + 1 })), errors }
}
