import { describe, expect, it } from 'vitest'
import { CARD_FORMAT } from '../../shared/dictionary'
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
          format: 1,
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
    exclusions: { exclude: ['mial'], notes: { mial: { why: 'form-of', see: 'dom' } } },
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
      warnings: [`dictionary/dom.yml: card format 1, current is ${CARD_FORMAT} — needs an upgrade`],
    })
  })

  it('requires a note for every exclusion, with a known reason and a real see target', () => {
    const missing = bundle()
    missing.exclusions = {
      exclude: ['mial', 'ben'],
      notes: { mial: { why: 'form-of', see: 'dom' } },
    }
    expect(validateDictionary(missing, { requireLessonCards: false }).errors).toContain(
      'overrides: excluded "ben" has no entry in excludeNotes',
    )

    const badWhy = bundle()
    badWhy.exclusions = { exclude: ['mial'], notes: { mial: { why: 'nonsense' } } }
    expect(validateDictionary(badWhy, { requireLessonCards: false }).errors[0]).toMatch(
      /excludeNotes "mial": unknown why "nonsense"/,
    )

    const badSee = bundle()
    badSee.exclusions = {
      exclude: ['mial'],
      notes: { mial: { why: 'form-of', see: 'nieistnieje' } },
    }
    expect(validateDictionary(badSee, { requireLessonCards: false }).errors).toContain(
      'overrides: excludeNotes "mial": see "nieistnieje" is not a card',
    )

    const stray = bundle()
    stray.exclusions = { exclude: [], notes: { mial: { why: 'form-of' } } }
    expect(validateDictionary(stray, { requireLessonCards: false }).errors).toContain(
      'overrides: excludeNotes has "mial", which is not excluded',
    )
  })

  it('requires see on form-of and variant-of, and rejects it elsewhere', () => {
    const noSee = bundle()
    noSee.exclusions = { exclude: ['mial'], notes: { mial: { why: 'form-of' } } }
    expect(validateDictionary(noSee, { requireLessonCards: false }).errors).toContain(
      'overrides: excludeNotes "mial": why "form-of" requires a see target',
    )

    const extraSee = bundle()
    extraSee.exclusions = { exclude: ['mial'], notes: { mial: { why: 'no-corpus', see: 'dom' } } }
    expect(validateDictionary(extraSee, { requireLessonCards: false }).errors).toContain(
      'overrides: excludeNotes "mial": why "no-corpus" must not have a see target',
    )
  })

  it('checks example counts and forms', () => {
    const b = bundle()
    card(b).senses[0]!.examples = examples(4)
    card(b).senses[0]!.examples[1]!.pl = 'Zupełnie inne zdanie.'
    const { errors } = validateDictionary(b, { requireLessonCards: false })
    expect(errors).toContain('dictionary/dom.yml: 4 sense examples (need at least 5)')
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
    expect(validateDictionary(b, { requireLessonCards: false }).warnings).toContain(
      'words: lesson word "mama" has no dictionary card',
    )
    expect(validateDictionary(b, { requireLessonCards: true }).errors).toContain(
      'words: lesson word "mama" has no dictionary card',
    )
  })
})

describe('sense examples', () => {
  const ex = (pl: string) => ({ pl, ru: 'перевод', source: { kind: 'authored' } })

  it('allows a card to carry many senses', () => {
    const b = bundle()
    const card = b.cards[0]!.data as { senses: unknown[] }
    card.senses = ['a', 'b', 'c', 'd'].map((id) => ({
      id,
      ru: 'значение',
      examples: [ex('To jest dom.'), ex('Mój dom jest duży.'), ex('Tam stoi dom.')],
    }))
    expect(validateDictionary(b, { requireLessonCards: false }).errors).toEqual([])
  })

  it('caps one sense at six examples', () => {
    const b = bundle()
    const card = b.cards[0]!.data as { senses: unknown[] }
    card.senses = [
      {
        id: 'house',
        ru: 'дом',
        examples: [
          ex('To jest dom.'),
          ex('Mój dom jest duży.'),
          ex('Tam stoi dom.'),
          ex('Widzę dom.'),
          ex('Kupili dom.'),
          ex('Sprzedali dom.'),
          ex('Zbudowali dom.'),
        ],
      },
    ]
    expect(validateDictionary(b, { requireLessonCards: false }).errors).toContain(
      'dictionary/dom.yml: sense "house" has 7 examples (max 6)',
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

describe('card format', () => {
  function withCard(patch: Record<string, unknown>) {
    const b = bundle()
    Object.assign(b.cards[0]!.data as Record<string, unknown>, patch)
    return b
  }

  const complete = {
    format: CARD_FORMAT,
    etymology: 'От праславянского.',
    memory: 'Приставка z- как русское с-.',
    idioms: [{ pl: 'zrobić wielkie oczy', ru: 'сделать большие глаза' }],
    formExamples: [
      { form: 'dom', pl: 'To jest dom.', ru: 'Это дом.', source: { kind: 'authored' } },
      {
        form: 'dom',
        pl: 'Mój dom jest duży.',
        ru: 'Мой дом большой.',
        source: { kind: 'authored' },
      },
      { form: 'dom', pl: 'Tam stoi dom.', ru: 'Там стоит дом.', source: { kind: 'authored' } },
      { form: 'domu', pl: 'Wracam do domu.', ru: 'Я иду домой.', source: { kind: 'authored' } },
      { form: 'domu', pl: 'Nie ma go w domu.', ru: 'Его нет дома.', source: { kind: 'authored' } },
      {
        form: 'domu',
        pl: 'Blisko domu jest park.',
        ru: 'Рядом с домом парк.',
        source: { kind: 'authored' },
      },
    ],
  }

  it('accepts a card that meets the current format', () => {
    const b = withCard(complete)
    ;(b.forms[0]!.data as { allForms: string[] }).allForms = ['dom', 'domu']
    expect(validateDictionary(b, { requireLessonCards: false }).errors).toEqual([])
  })

  it('warns that an older card needs an upgrade', () => {
    const { errors, warnings } = validateDictionary(withCard({ format: 1 }), {
      requireLessonCards: false,
    })
    expect(errors).toEqual([])
    expect(warnings).toContain(
      `dictionary/dom.yml: card format 1, current is ${CARD_FORMAT} — needs an upgrade`,
    )
  })

  it('lists what the current format requires', () => {
    const errors = validateDictionary(withCard({ format: CARD_FORMAT }), {
      requireLessonCards: false,
    }).errors
    expect(errors).toContain(
      `dictionary/dom.yml: format ${CARD_FORMAT} requires examples for every form`,
    )
    expect(errors).toContain(`dictionary/dom.yml: format ${CARD_FORMAT} requires an etymology`)
    expect(errors).toContain(`dictionary/dom.yml: format ${CARD_FORMAT} requires a memory hook`)
    expect(errors).toContain(
      `dictionary/dom.yml: format ${CARD_FORMAT} requires at least one idiom`,
    )
  })

  it('rejects a format newer than this checkout knows', () => {
    const errors = validateDictionary(withCard({ format: CARD_FORMAT + 1 }), {
      requireLessonCards: false,
    }).errors
    expect(errors).toContain(
      `dictionary/dom.yml: format ${CARD_FORMAT + 1} is newer than the current card format ${CARD_FORMAT}`,
    )
  })
})

describe('formExamplesSkip', () => {
  const entry = (form: string, pl: string) => ({
    form,
    pl,
    ru: 'перевод',
    source: { kind: 'authored' },
  })

  function withSkip(skip: unknown[], entries: unknown[]) {
    const b = bundle()
    ;(b.forms[0]!.data as { allForms: string[] }).allForms = ['dom', 'domu']
    const card = b.cards[0]!.data as Record<string, unknown>
    card.formExamples = entries
    card.formExamplesSkip = skip
    return b
  }

  const domThree = [
    entry('dom', 'To jest dom.'),
    entry('dom', 'Mój dom jest duży.'),
    entry('dom', 'Tam stoi dom.'),
  ]

  it('accepts a form that is documented as impossible to exemplify', () => {
    const errors = validateDictionary(
      withSkip([{ form: 'domu', reason: 'не встречается отдельно' }], domThree),
      { requireLessonCards: false },
    ).errors
    expect(errors).toEqual([])
  })

  it('rejects skipping a form that also has examples, or one that is not a form', () => {
    const both = validateDictionary(
      withSkip(
        [{ form: 'dom', reason: 'x' }],
        [...domThree, ...[1, 2, 3].map(() => entry('domu', 'Do domu.'))],
      ),
      { requireLessonCards: false },
    ).errors
    expect(both).toContain('dictionary/dom.yml: "dom" is both skipped and exemplified')

    const unknown = validateDictionary(
      withSkip(
        [
          { form: 'zamek', reason: 'x' },
          { form: 'domu', reason: 'y' },
        ],
        domThree,
      ),
      { requireLessonCards: false },
    ).errors
    expect(unknown).toContain(
      'dictionary/dom.yml: formExamplesSkip has "zamek", which is not an affirmative form',
    )
  })
})

describe('deep cards', () => {
  function deepBundle(overrides: Record<string, unknown>) {
    const b = bundle()
    Object.assign(b.cards[0]!.data as object, { depth: 'deep', ...overrides })
    return b
  }

  it('says nothing about depth for a standard card', () => {
    const { warnings } = validateDictionary(bundle(), { requireLessonCards: true })
    expect(warnings.some((w) => w.includes('depth bar'))).toBe(false)
  })

  it('fails when a deep card is below the bar', () => {
    const { errors, warnings } = validateDictionary(deepBundle({}), { requireLessonCards: true })
    const error = errors.find((e) => e.includes('depth bar'))
    expect(error).toContain('1 senses (need 3)')
    expect(error).toContain('0 notes (need 4)')
    expect(error).toContain('5 example sentences (need 12)')
    expect(error).toContain('0 idioms (need 3)')
    expect(warnings.some((w) => w.includes('depth bar'))).toBe(false)
  })

  it('accepts a deep card that clears the bar', () => {
    const b = deepBundle({
      senses: [
        { id: 'house', ru: 'дом', examples: examples(4) },
        { id: 'home', ru: 'родной дом', examples: examples(4) },
        { id: 'building', ru: 'здание', examples: examples(4) },
      ],
      notes: Array.from({ length: 4 }, (_, i) => ({ kind: 'usage', text: `Заметка ${i}.` })),
      idioms: Array.from({ length: 3 }, (_, i) => ({ pl: `dom ${i}`, ru: `дом ${i}` })),
    })
    const { errors, warnings } = validateDictionary(b, { requireLessonCards: true })
    expect(errors).toEqual([])
    expect(warnings.some((w) => w.includes('depth bar'))).toBe(false)
  })
})
