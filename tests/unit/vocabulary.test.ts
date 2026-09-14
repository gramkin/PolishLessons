import { describe, expect, it } from 'vitest'
import type { IndexEntry } from '../../shared/dictionary'
import type { Word } from '../../shared/schemas'
import {
  bandStarts,
  filterVocabulary,
  listChapters,
  listTopics,
  mergeVocabulary,
} from '../../app/utils/vocabulary'

const words: Word[] = [
  { id: 'rzeka', pl: 'rzeka', ru: 'река', pos: 'noun', pron: 'жэ́ка', topic: 'природа', chapter: 2 },
  { id: 'dom', pl: 'dom', ru: 'дом', pos: 'noun', pron: 'дом', topic: 'дом', chapter: 1 },
  {
    id: 'dzien-dobry',
    pl: 'dzień dobry',
    ru: 'добрый день',
    pos: 'phrase',
    pron: 'дзьень до́бры',
    topic: 'приветствия',
    chapter: 3,
  },
]

const index: IndexEntry[] = [
  { id: 'dom', lemma: 'dom', rank: 120, pos: 'noun', gloss: 'дом, здание' },
  { id: 'miec', lemma: 'mieć', rank: 13, pos: 'verb', gloss: 'иметь' },
  { id: 'kolega', lemma: 'kolega', rank: 250, pos: 'noun', gloss: 'коллега, приятель' },
]

const all = { query: '', pos: null, band: null, inLessonsOnly: false }

describe('mergeVocabulary', () => {
  const merged = mergeVocabulary(index, words)

  it('lists cards by rank, then lesson words without cards', () => {
    expect(merged.map((e) => e.id)).toEqual(['miec', 'dom', 'kolega', 'dzien-dobry', 'rzeka'])
    expect(merged.find((e) => e.id === 'dom')).toEqual({
      id: 'dom',
      lemma: 'dom',
      gloss: 'дом, здание',
      pos: 'noun',
      rank: 120,
      inLessons: true,
      hasCard: true,
    })
    expect(merged.find((e) => e.id === 'dzien-dobry')).toMatchObject({
      pos: null,
      rank: null,
      inLessons: true,
      hasCard: false,
    })
  })

  it('filters by query, part of speech, band and lessons', () => {
    expect(filterVocabulary(merged, { ...all, query: 'miec' }).map((e) => e.id)).toEqual(['miec'])
    expect(filterVocabulary(merged, { ...all, query: 'ПРИЯТ' }).map((e) => e.id)).toEqual([
      'kolega',
    ])
    expect(filterVocabulary(merged, { ...all, pos: 'noun' }).map((e) => e.id)).toEqual([
      'dom',
      'kolega',
      'rzeka',
    ])
    expect(filterVocabulary(merged, { ...all, band: 1 }).map((e) => e.id)).toEqual(['miec', 'dom'])
    expect(filterVocabulary(merged, { ...all, inLessonsOnly: true }).map((e) => e.id)).toEqual([
      'dom',
      'dzien-dobry',
      'rzeka',
    ])
  })

  it('lists band starts present in the data', () => {
    expect(bandStarts(merged)).toEqual([1, 201])
  })
})

describe('lesson word helpers', () => {
  it('still lists topics and chapters', () => {
    expect(listTopics(words)).toEqual(['дом', 'приветствия', 'природа'])
    expect(listChapters(words)).toEqual([1, 2, 3])
  })
})
