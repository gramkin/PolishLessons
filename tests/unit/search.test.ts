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
