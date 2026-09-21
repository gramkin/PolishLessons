import { describe, expect, it } from 'vitest'
import { cardSchema, formsFileSchema, indexEntrySchema } from '../../shared/dictionary'

const card = {
  id: 'dom',
  format: 1,
  lemma: 'dom',
  rank: 120,
  pos: 'noun',
  pron: { cyr: 'дом' },
  senses: [
    {
      id: 'house',
      ru: 'дом, здание',
      examples: [
        {
          pl: 'Mój dom jest duży.',
          ru: 'Мой дом большой.',
          source: { kind: 'tatoeba', id: 348760 },
        },
      ],
    },
  ],
}

describe('cardSchema', () => {
  it('accepts a minimal card and fills defaults', () => {
    const parsed = cardSchema.parse(card)
    expect(parsed.notes).toEqual([])
    expect(parsed.collocations).toEqual([])
    expect(parsed.family).toEqual([])
  })

  it('requires an id for tatoeba and translated sources but not for authored', () => {
    const withSource = (source: unknown) => ({
      ...card,
      senses: [{ ...card.senses[0], examples: [{ pl: 'a', ru: 'б', source }] }],
    })
    expect(cardSchema.safeParse(withSource({ kind: 'tatoeba' })).success).toBe(false)
    expect(cardSchema.safeParse(withSource({ kind: 'translated', id: 1 })).success).toBe(true)
    expect(cardSchema.safeParse(withSource({ kind: 'authored' })).success).toBe(true)
  })

  it('rejects senses without examples, non-integer ranks and unknown note kinds', () => {
    expect(
      cardSchema.safeParse({ ...card, senses: [{ id: 'x', ru: 'y', examples: [] }] }).success,
    ).toBe(false)
    expect(cardSchema.safeParse({ ...card, rank: 1.5 }).success).toBe(false)
    expect(cardSchema.safeParse({ ...card, format: undefined }).success).toBe(false)
    expect(cardSchema.safeParse({ ...card, notes: [{ kind: 'gossip', text: 't' }] }).success).toBe(
      false,
    )
  })

  it('accepts verb aspect data', () => {
    const verb = {
      ...card,
      id: 'robic',
      lemma: 'robić',
      pos: 'verb',
      aspect: 'imperf',
      aspectPair: 'zrobic',
    }
    expect(cardSchema.safeParse(verb).success).toBe(true)
  })
})

describe('formsFileSchema', () => {
  it('accepts a generated forms file', () => {
    const forms = {
      generated: true,
      sources: { polimorf: '0.6.7', wiktionary: 'x', tatoeba: 'y' },
      id: 'dom',
      lemma: 'dom',
      pos: 'noun',
      grammarLabel: 'мужской род, неодушевлённый',
      ipa: 'dɔm',
      audio: {
        file: 'Pl-dom.ogg',
        url: 'https://upload.wikimedia.org/x.ogg',
        license: 'Public domain',
        author: 'tsca',
      },
      allForms: ['dom', 'domu'],
      tables: [
        {
          title: 'Склонение',
          columns: ['Ед. ч.', 'Мн. ч.'],
          rows: [{ label: 'Родительный', cells: [['domu'], ['domów']] }],
          extra: false,
        },
      ],
      tatoeba: { '348760': { pl: 'Mój dom jest duży.', ru: 'Мой дом большой.' } },
    }
    expect(formsFileSchema.safeParse(forms).success).toBe(true)
    expect(formsFileSchema.safeParse({ ...forms, generated: false }).success).toBe(false)
  })
})

describe('indexEntrySchema', () => {
  it('accepts an index entry', () => {
    expect(
      indexEntrySchema.safeParse({ id: 'dom', lemma: 'dom', rank: 120, pos: 'noun', gloss: 'дом' })
        .success,
    ).toBe(true)
  })
})
