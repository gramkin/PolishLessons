import { describe, expect, it } from 'vitest'
import { buildIdiomExamples, buildIdiomList } from '../../scripts/lib/idioms'
import { idiomTokens } from '../../scripts/lib/idiom-frequency'
import { idiomKey, type FrequencyFile } from '../../shared/idioms'

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

describe('idiomKey', () => {
  it('matches the counter tokens, so cards, counts and examples join', () => {
    for (const pl of ['Na litość boską!', 'z tą różnicą, że...', 'równie … jak', 'bądź…, bądź…'])
      expect(idiomKey(pl)).toBe(
        idiomTokens(pl)
          .map((t) => t ?? '…')
          .join(' '),
      )
    expect(idiomKey('na litość boską')).toBe(idiomKey('Na litość boską!'))
  })
})

describe('buildIdiomExamples', () => {
  const example = {
    pl: 'Wszystko w porządku?',
    ru: 'Всё в порядке?',
    source: { kind: 'authored' as const },
  }
  it('keys examples of published idioms and reports the rest', () => {
    const { idioms } = buildIdiomList(frequency, [{ pl: 'w porządku', kind: 'phrase' }])
    const { examples, errors } = buildIdiomExamples(idioms, frequency, [
      { key: 'w porządku', examples: [example, example, example] },
      { key: 'przyjaciel', examples: [example, example, example] },
      { key: 'nie ma', examples: [example, example, example] },
    ])
    expect(Object.keys(examples)).toEqual(['w porządku'])
    expect(errors).toEqual([
      'data/idiom-examples.yml: "przyjaciel" is not a published idiom',
      'data/idiom-examples.yml: unknown idiom "nie ma"',
    ])
  })
})
