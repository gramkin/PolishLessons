import { describe, expect, it } from 'vitest'
import { buildIdiomList } from '../../scripts/lib/idioms'
import type { FrequencyFile } from '../../shared/idioms'

const frequency: FrequencyFile = {
  source: 'test',
  lines: 10,
  tokens: 100,
  idioms: [
    { pl: 'w porządku', ru: 'ладно', cards: ['porzadek'], count: 50, perMillion: 5 },
    { pl: 'przyjaciel', ru: 'друг', cards: ['przyjaciel'], count: 40, perMillion: 4 },
    {
      pl: 'trzymać kciuki',
      ru: 'держать кулаки',
      cards: ['kciuk', 'trzymac'],
      count: 9,
      perMillion: 0.9,
    },
    { pl: 'Natychmiast!', ru: 'Немедленно!', cards: ['natychmiast'], count: 20, perMillion: 2 },
  ],
}

describe('buildIdiomList', () => {
  it('publishes classified entries by frequency, drops skips, applies fixes', () => {
    const { idioms, errors } = buildIdiomList(frequency, [
      { pl: 'trzymać kciuki', kind: 'idiom' },
      { pl: 'przyjaciel', kind: 'skip' },
      { pl: 'w porządku', kind: 'phrase', ru: 'в порядке, ладно' },
      { pl: 'Natychmiast!', kind: 'phrase', fix: 'natychmiast!' },
    ])
    expect(errors).toEqual([])
    expect(idioms.map((i) => [i.rank, i.pl, i.kind])).toEqual([
      [1, 'w porządku', 'phrase'],
      [2, 'natychmiast!', 'phrase'],
      [3, 'trzymać kciuki', 'idiom'],
    ])
    expect(idioms[0]!.ru).toBe('в порядке, ладно')
    expect(idioms[2]!.cards).toEqual(['kciuk', 'trzymac'])
    expect(idioms[2]!.register).toBe('neutral')
  })

  it('reports unknown and duplicate entries', () => {
    const { errors } = buildIdiomList(frequency, [
      { pl: 'nie ma', kind: 'phrase' },
      { pl: 'przyjaciel', kind: 'skip' },
      { pl: 'przyjaciel', kind: 'skip' },
    ])
    expect(errors).toEqual([
      'data/idioms.yml: "nie ma" is not in data/idiom-frequency.json',
      'data/idioms.yml: "przyjaciel" is classified twice',
    ])
  })
})
