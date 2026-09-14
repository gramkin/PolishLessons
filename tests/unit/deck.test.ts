import { describe, expect, it } from 'vitest'
import type { Word } from '../../shared/schemas'
import { learnedWordIds, resolveDirection, selectWords } from '../../app/utils/deck'

const words: Word[] = [
  { id: 'rzeka', pl: 'rzeka', ru: 'река', pos: 'noun', pron: 'жэ́ка', topic: 'природа', chapter: 2 },
  {
    id: 'uroda',
    pl: 'uroda',
    ru: 'красота',
    pos: 'noun',
    pron: 'уро́да',
    falseFriend: { ru: 'урод', meaning: 'красота' },
    topic: 'люди',
    chapter: 2,
  },
  { id: 'dom', pl: 'dom', ru: 'дом', pos: 'noun', pron: 'дом', topic: 'дом', chapter: 3 },
]

describe('learnedWordIds', () => {
  it('collects words of completed lessons only', () => {
    const lessons = [
      { path: '/a', words: ['rzeka', 'uroda'] },
      { path: '/b', words: ['dom'] },
      { path: '/c' },
    ]
    expect([...learnedWordIds(lessons, (p) => p !== '/b')]).toEqual(['rzeka', 'uroda'])
  })
})

describe('selectWords', () => {
  const learned = new Set(['dom'])

  it('selects by chapter, topic, learned and false friends', () => {
    expect(selectWords(words, { kind: 'chapter', chapter: 2 }, learned).map((w) => w.id)).toEqual([
      'rzeka',
      'uroda',
    ])
    expect(selectWords(words, { kind: 'topic', topic: 'дом' }, learned).map((w) => w.id)).toEqual([
      'dom',
    ])
    expect(selectWords(words, { kind: 'learned' }, learned).map((w) => w.id)).toEqual(['dom'])
    expect(selectWords(words, { kind: 'false-friends' }, learned).map((w) => w.id)).toEqual([
      'uroda',
    ])
  })
})

describe('resolveDirection', () => {
  it('keeps fixed directions and randomizes mixed', () => {
    expect(resolveDirection('ru-pl')).toBe('ru-pl')
    expect(resolveDirection('mixed', () => 0.2)).toBe('pl-ru')
    expect(resolveDirection('mixed', () => 0.7)).toBe('ru-pl')
  })
})
