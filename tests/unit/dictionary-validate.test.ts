import { describe, expect, it } from 'vitest'
import {
  exampleHasForm,
  validateDictionary,
  type DictionaryBundle,
} from '../../scripts/lib/validate-dictionary'

function examples(n: number) {
  return Array.from({ length: n }, (_, i) => ({
    pl: i === 0 ? 'Mój dom jest duży.' : `To jest dom numer ${i}.`,
    ru: i === 0 ? 'Мой дом большой.' : `Это дом номер ${i}.`,
    source: i === 0 ? { kind: 'tatoeba', id: 348760 } : { kind: 'authored' },
  }))
}

function bundle(): DictionaryBundle {
  return {
    cards: [
      {
        path: 'dictionary/dom.yml',
        data: {
          id: 'dom',
          lemma: 'dom',
          rank: 120,
          pos: 'noun',
          pron: { cyr: 'дом' },
          senses: [{ id: 'house', ru: 'дом', examples: examples(5) }],
        },
      },
    ],
    forms: [
      {
        path: 'forms/dom.json',
        data: {
          generated: true,
          sources: { polimorf: '0.6.7', wiktionary: 'w', tatoeba: 't' },
          id: 'dom',
          lemma: 'dom',
          pos: 'noun',
          grammarLabel: null,
          ipa: null,
          audio: null,
          allForms: ['dom', 'domu'],
          tables: [],
          tatoeba: { '348760': { pl: 'Mój dom jest duży.', ru: 'Мой дом большой.' } },
        },
      },
    ],
    ranked: [{ id: 'dom', lemma: 'dom', rank: 120 }],
    lessonWordIds: ['dom'],
  }
}

interface CardData {
  rank: number
  aspectPair?: string
  senses: { examples: { pl: string; ru: string; source: unknown }[] }[]
}
const card = (b: DictionaryBundle) => b.cards[0]!.data as CardData

describe('exampleHasForm', () => {
  it('matches whole words case-insensitively, including agglutinated endings', () => {
    expect(exampleHasForm('Wracam do DOMU.', new Set(['domu']))).toBe(true)
    expect(exampleHasForm('Miałem psa.', new Set(['miał']))).toBe(true)
    expect(exampleHasForm('Domowy obiad.', new Set(['dom']))).toBe(false)
  })
})

describe('validateDictionary', () => {
  it('accepts a valid card', () => {
    expect(validateDictionary(bundle(), { requireLessonCards: false })).toEqual({
      errors: [],
      warnings: [],
    })
  })

  it('checks example counts and forms', () => {
    const b = bundle()
    card(b).senses[0]!.examples = examples(4)
    card(b).senses[0]!.examples[1]!.pl = 'Zupełnie inne zdanie.'
    const { errors } = validateDictionary(b, { requireLessonCards: false })
    expect(errors).toContain('dictionary/dom.yml: 4 examples (expected 5–8)')
    expect(errors).toContain(
      'dictionary/dom.yml: example "Zupełnie inne zdanie." contains no form of "dom"',
    )
  })

  it('protects human Tatoeba translations', () => {
    const b = bundle()
    card(b).senses[0]!.examples[0]!.ru = 'Мой дом огромный.'
    expect(validateDictionary(b, { requireLessonCards: false }).errors).toContain(
      'dictionary/dom.yml: example tatoeba #348760 differs from the Tatoeba text; use source kind "translated" for edited translations',
    )
  })

  it('reports missing and orphan forms files', () => {
    const noForms = { ...bundle(), forms: [] }
    expect(validateDictionary(noForms, { requireLessonCards: false }).errors).toContain(
      'dictionary/dom.yml: missing forms/dom.json (run pnpm dict:build)',
    )
    const orphan = bundle()
    orphan.forms.push({
      path: 'forms/mama.json',
      data: { ...(orphan.forms[0]!.data as object), id: 'mama', lemma: 'mama' },
    })
    expect(validateDictionary(orphan, { requireLessonCards: false }).errors).toContain(
      'forms/mama.json: no matching dictionary/mama.yml',
    )
  })

  it('checks ranks, references and file names', () => {
    const b = bundle()
    card(b).rank = 7
    card(b).aspectPair = 'ghost'
    b.cards[0]!.path = 'dictionary/house.yml'
    const { errors } = validateDictionary(b, { requireLessonCards: false })
    expect(errors).toContain('dictionary/house.yml: rank 7 does not match data/ranked.json (120)')
    expect(errors).toContain('dictionary/house.yml: aspectPair "ghost" is not a card')
    expect(errors).toContain('dictionary/house.yml: file name must be dom.yml')
  })

  it('warns about lesson words without cards, or errors when required', () => {
    const b = { ...bundle(), lessonWordIds: ['dom', 'mama'] }
    expect(validateDictionary(b, { requireLessonCards: false }).warnings).toEqual([
      'words: lesson word "mama" has no dictionary card',
    ])
    expect(validateDictionary(b, { requireLessonCards: true }).errors).toContain(
      'words: lesson word "mama" has no dictionary card',
    )
  })
})

describe('formExamples', () => {
  function withForms(entries: unknown[]) {
    const b = bundle()
    ;(b.forms[0]!.data as { allForms: string[] }).allForms = ['dom', 'domu', 'niedomu']
    ;(b.cards[0]!.data as { formExamples?: unknown[] }).formExamples = entries
    return b
  }

  const entry = (form: string, pl: string) => ({
    form,
    pl,
    ru: 'перевод',
    source: { kind: 'authored' },
  })

  const three = (form: string, sentences: [string, string, string]) =>
    sentences.map((pl) => entry(form, pl))

  const complete = () => [
    ...three('dom', ['To jest dom.', 'Mój dom jest duży.', 'Tam stoi dom.']),
    ...three('domu', ['Wracam do domu.', 'Nie ma go w domu.', 'Idę do domu.']),
  ]

  it('accepts three examples per affirmative form', () => {
    expect(validateDictionary(withForms(complete()), { requireLessonCards: false }).errors).toEqual(
      [],
    )
  })

  it('requires at least three examples for every form', () => {
    const thin = validateDictionary(
      withForms([...complete().slice(0, 2), ...three('domu', ['Do domu.', 'W domu.', 'Z domu.'])]),
      { requireLessonCards: false },
    ).errors
    expect(thin).toContain('dictionary/dom.yml: formExamples has 2 example(s) for "dom", need 3')
  })

  it('rejects the same sentence twice for one form', () => {
    const repeated = validateDictionary(
      withForms([
        ...three('dom', ['To jest dom.', 'To jest dom.', 'Tam stoi dom.']),
        ...three('domu', ['Wracam do domu.', 'Nie ma go w domu.', 'Idę do domu.']),
      ]),
      { requireLessonCards: false },
    ).errors
    expect(repeated).toContain('dictionary/dom.yml: formExamples repeats "To jest dom." for "dom"')
  })

  it('reports missing forms, unknown forms and sentences without the form', () => {
    const missing = validateDictionary(
      withForms(three('dom', ['To jest dom.', 'Mój dom jest duży.', 'Tam stoi dom.'])),
      { requireLessonCards: false },
    ).errors
    expect(missing).toContain('dictionary/dom.yml: formExamples missing 1 form(s): domu')

    const unknown = validateDictionary(
      withForms([
        ...complete(),
        ...three('niedomu', ['Nie ma niedomu.', 'To niedomu.', 'Tu niedomu.']),
      ]),
      { requireLessonCards: false },
    ).errors
    expect(unknown).toContain(
      'dictionary/dom.yml: formExamples has "niedomu", which is not an affirmative form',
    )

    const wrong = validateDictionary(
      withForms([
        ...three('dom', ['To jest dom.', 'Mój dom jest duży.', 'Tam stoi dom.']),
        ...three('domu', ['Wracam do domu.', 'Nie ma go w domu.', 'Zupełnie inne zdanie.']),
      ]),
      { requireLessonCards: false },
    ).errors
    expect(wrong).toContain(
      'dictionary/dom.yml: form example for "domu" does not contain that form: "Zupełnie inne zdanie."',
    )
  })
})
