import { describe, expect, it } from 'vitest'
import {
  BLANK,
  drillItems,
  formCells,
  isCoarse,
  personHint,
  sampleItems,
} from '../../app/utils/drill'
import { drillSchema } from '../../shared/schemas'
import type { Card } from '../../shared/dictionary'

const nounTables = [
  {
    title: 'Склонение',
    columns: ['Ед. ч.', 'Мн. ч.'],
    extra: false,
    rows: [
      { label: 'Именительный', cells: [['książka'], ['książki']] },
      { label: 'Родительный', cells: [['książki'], ['książek']] },
      { label: 'Винительный', cells: [['książkę'], ['książki']] },
    ],
  },
]

const example = (form: string, pl: string, kind: 'authored' | 'tatoeba' = 'authored') => ({
  form,
  pl,
  ru: `ru: ${pl}`,
  source: kind === 'authored' ? { kind } : { kind, id: 1 },
})

function card(overrides: Partial<Card> = {}): Card {
  return {
    id: 'ksiazka',
    lemma: 'książka',
    rank: 100,
    pos: 'noun',
    notes: [],
    formExamples: [
      example('książkę', 'Czytam książkę.'),
      example('książkę', 'Książkę kupiłem wczoraj.'),
      example('książki', 'Nie mam książki.'),
      example('książek', 'Mam pięć książek.'),
      example('książkę', 'Książkę za książkę.'),
    ],
    ...overrides,
  } as Card
}

const accusative = drillSchema.parse({
  id: 'noun-acc-sg',
  title: 'Винительный',
  instruction: 'В винительный.',
  pos: 'noun',
  cells: [{ table: 'Склонение', row: 'Винительный', column: 'Ед. ч.' }],
})

describe('formCells', () => {
  it('lists every cell a spelling fills', () => {
    const cells = formCells({ tables: nounTables })
    expect(cells.get('książkę')).toHaveLength(1)
    expect(cells.get('książki')).toHaveLength(3)
  })
})

describe('drillItems', () => {
  it('blanks a form that fills exactly one requested cell, keeping its capital', () => {
    const items = drillItems(accusative, [{ card: card(), forms: { tables: nounTables } }])
    expect(items).toEqual([
      {
        pl: `Czytam ${BLANK}.`,
        answer: 'książkę',
        hint: 'książka',
        ru: 'ru: Czytam książkę.',
        card: 'ksiazka',
      },
      {
        pl: `${BLANK} kupiłem wczoraj.`,
        answer: 'Książkę',
        hint: 'książka',
        ru: 'ru: Książkę kupiłem wczoraj.',
        card: 'ksiazka',
      },
    ])
  })

  it('skips ambiguous spellings, repeated forms and other cells', () => {
    const genitive = drillSchema.parse({
      ...accusative,
      cells: [{ table: 'Склонение', row: 'Родительный' }],
    })
    const items = drillItems(genitive, [{ card: card(), forms: { tables: nounTables } }])
    // książki fills three cells, so «Nie mam książki» says nothing certain; książek fills one.
    expect(items.map((i) => i.answer)).toEqual(['książek'])
  })

  it('tests require on the text before the gap', () => {
    const negated = drillSchema.parse({ ...accusative, require: '(?<!\\p{L})czytam(?!\\p{L})' })
    const items = drillItems(negated, [
      {
        card: card({
          formExamples: [
            example('książkę', 'Czytam książkę.'),
            example('książkę', 'Książkę czytam.'),
          ],
        }),
        forms: { tables: nounTables },
      },
    ])
    expect(items.map((i) => i.pl)).toEqual([`Czytam ${BLANK}.`])
  })

  it('leaves out coarse cards, rare words, long sentences and authored rows when asked', () => {
    const forms = { tables: nounTables }
    const coarse = card({ notes: [{ kind: 'register', text: 'В этом значении — грубое слово.' }] })
    expect(isCoarse(coarse)).toBe(true)
    expect(drillItems(accusative, [{ card: coarse, forms }])).toEqual([])
    expect(drillItems(accusative, [{ card: card({ rank: 4000 }), forms }])).toEqual([])
    const long = card({
      formExamples: [
        example(
          'książkę',
          'Raz dwa trzy cztery pięć sześć siedem osiem dziewięć dziesięć książkę.',
        ),
      ],
    })
    expect(drillItems(accusative, [{ card: long, forms }])).toEqual([])
    const bare = card({ formExamples: [example('książkę', 'Książkę!')] })
    expect(drillItems(accusative, [{ card: bare, forms }])).toEqual([])
    const sourced = drillSchema.parse({ ...accusative, sourcedOnly: true })
    const mixed = card({
      formExamples: [
        example('książkę', 'Czytam książkę.'),
        example('książkę', 'Mam książkę.', 'tatoeba'),
      ],
    })
    expect(drillItems(sourced, [{ card: mixed, forms }]).map((i) => i.pl)).toEqual([
      `Mam ${BLANK}.`,
    ])
  })

  it('takes at most three items a word, from different cells first', () => {
    const tables = [
      {
        title: 'Прошедшее время (ед. ч.)',
        columns: ['м. р.', 'ж. р.', 'ср. р.'],
        extra: false,
        rows: [{ label: '1-е лицо', cells: [['czytałem'], ['czytałam'], []] }],
      },
    ]
    const past = drillSchema.parse({
      ...accusative,
      pos: 'verb',
      cells: [{ table: 'Прошедшее время' }],
      hint: 'person',
    })
    const verb = card({
      id: 'czytac',
      lemma: 'czytać',
      pos: 'verb',
      rank: 2,
      formExamples: [
        example('czytałam', 'Czytałam rano.'),
        example('czytałam', 'Długo czytałam.'),
        example('czytałam', 'Czytałam wiersz.'),
        example('czytałem', 'Czytałem gazetę.'),
      ],
    })
    const items = drillItems(past, [{ card: verb, forms: { tables } }])
    expect(items).toHaveLength(3)
    expect(new Set(items.map((i) => i.hint))).toEqual(new Set(['czytać — я, ж.', 'czytać — я, м.']))
  })
})

describe('personHint', () => {
  it('names the person the way a learner thinks of it', () => {
    expect(
      personHint({ table: 'Прошедшее время (ед. ч.)', row: '1-е лицо', column: 'ж. р.' }),
    ).toBe('я, ж.')
    expect(
      personHint({ table: 'Прошедшее время (ед. ч.)', row: '3-е лицо', column: 'ср. р.' }),
    ).toBe('оно')
    expect(
      personHint({ table: 'Прошедшее время (мн. ч.)', row: '3-е лицо', column: 'прочие' }),
    ).toBe('они, без мужчин')
    expect(personHint({ table: 'Настоящее время', row: '3-е лицо', column: 'Ед. ч.' })).toBe(
      'он/она',
    )
    expect(personHint({ table: 'Простое будущее время', row: '2-е лицо', column: 'Мн. ч.' })).toBe(
      'вы',
    )
    expect(
      personHint({ table: 'Повелительное наклонение', row: '1-е л. мн. ч.', column: 'Форма' }),
    ).toBe('мы')
  })
})

describe('sampleItems', () => {
  it('returns n distinct items', () => {
    const picked = sampleItems([1, 2, 3, 4, 5], 3, () => 0.5)
    expect(picked).toHaveLength(3)
    expect(new Set(picked).size).toBe(3)
  })
})
