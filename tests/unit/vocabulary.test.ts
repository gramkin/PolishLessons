import { describe, expect, it } from 'vitest'
import type { Word } from '../../shared/schemas'
import { filterWords, listChapters, listTopics } from '../../app/utils/vocabulary'

const words: Word[] = [
  {
    id: 'rzeka',
    pl: 'rzeka',
    ru: 'река',
    pos: 'noun',
    pron: 'жэ́ка',
    pattern: 'rz-р',
    topic: 'природа',
    chapter: 2,
  },
  { id: 'zab', pl: 'ząb', ru: 'зуб', pos: 'noun', pron: 'зомп', topic: 'тело', chapter: 2 },
  {
    id: 'uroda',
    pl: 'uroda',
    ru: 'красота',
    pos: 'noun',
    pron: 'уро́да',
    falseFriend: { ru: 'урод', meaning: 'красота' },
    topic: 'люди',
    chapter: 3,
  },
  {
    id: 'cmentarz',
    pl: 'cmentarz',
    ru: 'кладбище',
    pos: 'noun',
    pron: 'цмэ́нташ',
    topic: 'город',
    chapter: 1,
  },
]

const all = { query: '', chapter: null, topic: null, falseFriendsOnly: false }

describe('filterWords', () => {
  it('returns all words sorted by Polish collation', () => {
    expect(filterWords(words, all).map((w) => w.pl)).toEqual(['cmentarz', 'rzeka', 'uroda', 'ząb'])
  })

  it('searches Polish without diacritics and Russian', () => {
    expect(filterWords(words, { ...all, query: 'zab' }).map((w) => w.id)).toEqual(['zab'])
    expect(filterWords(words, { ...all, query: 'КРАС' }).map((w) => w.id)).toEqual(['uroda'])
  })

  it('filters by chapter, topic and false friends', () => {
    expect(filterWords(words, { ...all, chapter: 2 }).map((w) => w.id)).toEqual(['rzeka', 'zab'])
    expect(filterWords(words, { ...all, topic: 'тело' }).map((w) => w.id)).toEqual(['zab'])
    expect(filterWords(words, { ...all, falseFriendsOnly: true }).map((w) => w.id)).toEqual([
      'uroda',
    ])
  })
})

describe('listTopics / listChapters', () => {
  it('returns unique sorted values', () => {
    expect(listTopics(words)).toEqual(['город', 'люди', 'природа', 'тело'])
    expect(listChapters(words)).toEqual([1, 2, 3])
  })
})
