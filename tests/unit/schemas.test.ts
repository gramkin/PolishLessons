import { describe, expect, it } from 'vitest'
import {
  lessonMetaSchema,
  quizSchema,
  storySchema,
  wordFileSchema,
  wordSchema,
} from '../../shared/schemas'

const word = {
  id: 'rzeka',
  pl: 'rzeka',
  ru: 'река',
  pos: 'noun',
  gender: 'f',
  pron: 'жэ́ка',
  pattern: 'rz-р',
  topic: 'природа',
  chapter: 2,
}

describe('wordSchema', () => {
  it('accepts a complete word', () => {
    expect(wordSchema.parse(word)).toEqual(word)
  })

  it('accepts a false friend without pattern', () => {
    const uroda = {
      id: 'uroda',
      pl: 'uroda',
      ru: 'красота',
      pos: 'noun',
      gender: 'f',
      pron: 'уро́да',
      falseFriend: { ru: 'урод', meaning: 'красота' },
      topic: 'люди',
      chapter: 2,
    }
    expect(wordSchema.safeParse(uroda).success).toBe(true)
  })

  it('rejects non-ASCII ids', () => {
    expect(wordSchema.safeParse({ ...word, id: 'ząb' }).success).toBe(false)
  })

  it('rejects a non-integer chapter', () => {
    expect(wordSchema.safeParse({ ...word, chapter: 1.5 }).success).toBe(false)
  })

  it('rejects unknown part of speech', () => {
    expect(wordSchema.safeParse({ ...word, pos: 'thing' }).success).toBe(false)
  })

  it('requires at least one word per file', () => {
    expect(wordFileSchema.safeParse({ words: [] }).success).toBe(false)
  })
})

describe('storySchema', () => {
  it('accepts sentences with word form mapping', () => {
    const story = {
      title: 'Kot i mysz',
      titleRu: 'Кот и мышь',
      level: 'A1',
      chapter: 3,
      sentences: [{ pl: 'Kot widzi rzekę.', ru: 'Кот видит реку.', words: { rzekę: 'rzeka' } }],
    }
    expect(storySchema.safeParse(story).success).toBe(true)
  })

  it('rejects a level outside the enum (B1/B2 are legal since books)', () => {
    const story = { title: 'X', titleRu: 'Х', level: 'C1', sentences: [{ pl: 'a', ru: 'а' }] }
    expect(storySchema.safeParse(story).success).toBe(false)
  })
})

describe('lessonMetaSchema', () => {
  it('defaults words to an empty array', () => {
    expect(lessonMetaSchema.parse({ chapter: 1, order: 1, level: 'A1' }).words).toEqual([])
  })

  it('rejects a non-integer order', () => {
    expect(lessonMetaSchema.safeParse({ chapter: 1, order: 2.5, level: 'A1' }).success).toBe(false)
  })
})

describe('quizSchema', () => {
  it('accepts all four question types', () => {
    const quiz = [
      { type: 'choice', q: 'Как по-польски «река»?', options: ['rzeka', 'reka'], answer: 0 },
      { type: 'input', q: '«зуб»', answer: 'ząb' },
      { type: 'pattern', q: 'mleko → ?', pattern: 'le-оло', answer: ['молоко'] },
      {
        type: 'match',
        q: 'Соедините',
        pairs: [
          ['rzeka', 'река'],
          ['ząb', 'зуб'],
        ],
      },
    ]
    expect(quizSchema.safeParse(quiz).success).toBe(true)
  })

  it('rejects a choice answer index outside options', () => {
    const quiz = [{ type: 'choice', q: '?', options: ['a', 'b'], answer: 2 }]
    const result = quizSchema.safeParse(quiz)
    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.path).toEqual([0, 'answer'])
  })

  it('rejects match with fewer than two pairs', () => {
    const quiz = [{ type: 'match', q: '?', pairs: [['a', 'а']] }]
    expect(quizSchema.safeParse(quiz).success).toBe(false)
  })
})
