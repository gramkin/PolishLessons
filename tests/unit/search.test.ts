import { describe, expect, it } from 'vitest'
import type { SearchDoc } from '../../shared/search'
import { createSearchIndex, highlightQuery, searchGrouped, snippet } from '../../app/utils/search'

const docs: SearchDoc[] = [
  {
    id: 'lesson:a:0',
    type: 'lesson',
    title: '2.1 rz и р',
    text: 'Сравните rzeka и река',
    url: '/lessons/a',
  },
  { id: 'word:zab', type: 'word', title: 'ząb — зуб', text: 'ząb зуб', url: '/vocabulary#zab' },
  {
    id: 'word:rzeka',
    type: 'word',
    title: 'rzeka — река',
    text: 'rzeka река',
    url: '/vocabulary#rzeka',
  },
  {
    id: 'story:kot:0',
    type: 'story',
    title: 'Kot i mysz',
    text: 'Kot mieszka nad rzeką. Кот живёт у реки.',
    url: '/stories/kot',
  },
]

const index = createSearchIndex(docs)

// The bug this guards against: word documents carry the whole inflection table,
// and prefix matching scored a document once per matching form. A verb with
// dozens of forms beginning "zab" outranked ząb, which matches exactly, and
// mama outranked mieć for "mam". Both then fell outside the eight shown.
const zabijac = ['zabijam', 'zabijasz', 'zabija', 'zabijamy', 'zabijacie', 'zabijaja']
const mamaForms = ['mama', 'mamy', 'mamie', 'mame', 'mamo', 'mamom', 'mamami', 'mam']
const inflected: SearchDoc[] = [
  {
    id: 'card:zab',
    type: 'word',
    title: 'ząb — зуб',
    text: 'ząb зуб',
    forms: 'ząb zęba zęby zębami',
    url: '/slovo/zab',
  },
  {
    id: 'card:zabijac',
    type: 'word',
    title: 'zabijać — убивать',
    text: 'zabijać убивать',
    forms: `zabijać ${zabijac.join(' ')}`,
    url: '/slovo/zabijac',
  },
  {
    id: 'card:miec',
    type: 'word',
    title: 'mieć — иметь',
    text: 'mieć иметь',
    forms: 'mieć mam masz ma mamy macie maja',
    url: '/slovo/miec',
  },
  {
    id: 'card:mama',
    type: 'word',
    title: 'mama — мама',
    text: 'mama мама',
    forms: `mama ${mamaForms.join(' ')}`,
    url: '/slovo/mama',
  },
]
const inflectedIndex = createSearchIndex(inflected)

describe('ranking against inflection tables', () => {
  it('puts the exact word above a verb whose many forms share the prefix', () => {
    const hits = searchGrouped(inflectedIndex, 'zab')[0]!.hits
    expect(hits[0]!.url).toBe('/slovo/zab')
  })

  it('finds a verb by an inflected form, above a noun that merely starts with it', () => {
    const hits = searchGrouped(inflectedIndex, 'mam')[0]!.hits
    expect(hits.map((h) => h.url)).toContain('/slovo/miec')
  })

  it('does not let the length penalty bury a verb with a long inflection table', () => {
    // The real failure needed both halves: mieć carries dozens of forms, while
    // przyjemność has "mam" sitting in a short title (Z kim mam przyjemność?).
    // BM25 normalises by field length, so one exact match inside a long table
    // scored below the short title, and mieć fell to twelfth of twenty-two.
    const padding = Array.from({ length: 60 }, (_, i) => `forma${i}`).join(' ')
    const withTable = createSearchIndex([
      {
        id: 'card:miec',
        type: 'word',
        title: 'mieć — иметь',
        text: 'mieć иметь',
        forms: `mieć mam masz ma mamy macie ${padding}`,
        url: '/slovo/miec',
      },
      {
        id: 'card:przyjemnosc',
        type: 'word',
        title: 'przyjemność — удовольствие; Z kim mam przyjemność?',
        text: 'przyjemność удовольствие',
        url: '/slovo/przyjemnosc',
      },
      {
        id: 'card:tam',
        type: 'word',
        title: 'tam — там',
        text: 'tam там',
        forms: 'tam',
        url: '/slovo/tam',
      },
    ])
    const urls = searchGrouped(withTable, 'mam')[0]!.hits.map((h) => h.url)
    expect(urls).toContain('/slovo/miec')
    expect(urls.indexOf('/slovo/miec')).toBeLessThan(urls.indexOf('/slovo/przyjemnosc'))
  })

  it('still completes a headword typed only partly', () => {
    const hits = searchGrouped(inflectedIndex, 'zabij')[0]!.hits
    expect(hits[0]!.url).toBe('/slovo/zabijac')
  })

  it('does not match a fragment of an inflected form', () => {
    // "zeb" is only part of zęba; prefixes over the table are what broke ranking.
    const groups = searchGrouped(inflectedIndex, 'zeba')
    expect(groups[0]!.hits.map((h) => h.url)).toContain('/slovo/zab')
  })
})

describe('searchGrouped', () => {
  it('finds Polish words typed without diacritics', () => {
    const groups = searchGrouped(index, 'zab')
    expect(groups.map((g) => g.label)).toEqual(['Словарь'])
    expect(groups[0]!.hits[0]).toMatchObject({ title: 'ząb — зуб', url: '/vocabulary#zab' })
  })

  it('groups results in lesson, word, story order', () => {
    const groups = searchGrouped(index, 'река')
    expect(groups.map((g) => g.type).slice(0, 2)).toEqual(['lesson', 'word'])
  })

  it('matches ё and е interchangeably and supports prefixes', () => {
    expect(searchGrouped(index, 'живе').map((g) => g.type)).toEqual(['story'])
  })

  it('returns nothing for a blank query', () => {
    expect(searchGrouped(index, '   ')).toEqual([])
  })
})

describe('highlightQuery', () => {
  it('marks matches regardless of case and diacritics', () => {
    expect(highlightQuery('Ząb i zęby', 'zab')).toEqual([
      { text: 'Ząb', hl: true },
      { text: ' i zęby', hl: false },
    ])
  })

  it('returns plain text for an empty query', () => {
    expect(highlightQuery('dom', '')).toEqual([{ text: 'dom', hl: false }])
  })
})

describe('snippet', () => {
  it('keeps short texts intact', () => {
    expect(snippet('krótki tekst', 'tekst')).toBe('krótki tekst')
  })

  it('cuts long texts around the first match', () => {
    const text = `${'a '.repeat(100)}rzeka${' b'.repeat(100)}`
    const result = snippet(text, 'rzeka', 10)
    expect(result.startsWith('…')).toBe(true)
    expect(result.endsWith('…')).toBe(true)
    expect(result).toContain('rzeka')
  })
})
