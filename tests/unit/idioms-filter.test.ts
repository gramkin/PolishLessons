import { describe, expect, it } from 'vitest'
import { filterIdioms } from '../../app/utils/idioms'
import type { PublishedIdiom } from '../../shared/idioms'

const idiom = (rank: number, pl: string, ru: string, extra: Partial<PublishedIdiom> = {}) =>
  ({
    rank,
    pl,
    ru,
    kind: 'phrase',
    register: 'neutral',
    perMillion: 1,
    cards: [],
    ...extra,
  }) as PublishedIdiom

const list = [
  idiom(1, 'w porządku', 'ладно'),
  idiom(150, 'trzymać kciuki', 'держать кулаки', { kind: 'idiom' }),
  idiom(200, 'do cholery', 'чёрт возьми', { register: 'vulgar' }),
]
const none = { query: '', kind: null, band: null, vulgar: false }

describe('filterIdioms', () => {
  it('hides vulgar entries unless asked', () => {
    expect(filterIdioms(list, none).map((i) => i.rank)).toEqual([1, 150])
    expect(filterIdioms(list, { ...none, vulgar: true })).toHaveLength(3)
  })

  it('filters by kind, band and a loose query in either language', () => {
    expect(filterIdioms(list, { ...none, kind: 'idiom' }).map((i) => i.rank)).toEqual([150])
    expect(filterIdioms(list, { ...none, band: 1 }).map((i) => i.rank)).toEqual([150])
    expect(filterIdioms(list, { ...none, query: 'porzadku' }).map((i) => i.rank)).toEqual([1])
    expect(filterIdioms(list, { ...none, query: 'кулаки' }).map((i) => i.rank)).toEqual([150])
  })
})
