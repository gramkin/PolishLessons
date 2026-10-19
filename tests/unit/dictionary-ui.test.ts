import { describe, expect, it } from 'vitest'
import type { FormsTable } from '../../shared/dictionary'
import {
  cardNav,
  conjugationLabel,
  conjugations,
  highlightForms,
  examplesForCell,
  rowAliases,
  rowsHoldingForm,
  rankBand,
  tatoebaUrl,
} from '../../app/utils/dictionary'

describe('highlightForms', () => {
  it('bolds whole-word forms case-insensitively', () => {
    expect(highlightForms('Nie mamy czasu.', ['mamy'])).toEqual([
      { text: 'Nie ', hl: false },
      { text: 'mamy', hl: true },
      { text: ' czasu.', hl: false },
    ])
    expect(highlightForms('Mam brata.', ['mam'])).toEqual([
      { text: 'Mam', hl: true },
      { text: ' brata.', hl: false },
    ])
  })

  it('bolds an analytic form as a single span', () => {
    expect(highlightForms('Będziemy zwiększać produkcję.', ['będziemy zwiększać'])).toEqual([
      { text: 'Będziemy zwiększać', hl: true },
      { text: ' produkcję.', hl: false },
    ])
  })

  it('leaves an analytic form alone when its words are not adjacent', () => {
    expect(highlightForms('Będziemy dużo zwiększać.', ['będziemy zwiększać'])).toEqual([
      { text: 'Będziemy dużo zwiększać.', hl: false },
    ])
  })

  it('handles agglutinated endings and leaves partial matches alone', () => {
    expect(highlightForms('Miałem psa.', ['miał'])[0]).toEqual({ text: 'Miałem', hl: true })
    expect(highlightForms('Domowy obiad.', ['dom'])).toEqual([{ text: 'Domowy obiad.', hl: false }])
  })
})

describe('rank helpers', () => {
  it('computes bands', () => {
    expect(rankBand(1)).toEqual({ start: 1, end: 200, label: '1–200' })
    expect(rankBand(201)).toEqual({ start: 201, end: 400, label: '201–400' })
    expect(rankBand(400)).toEqual({ start: 201, end: 400, label: '201–400' })
  })

  it('turns a published neighbour into a nav link', () => {
    // Neighbours arrive already resolved on the card, so nothing here reads the
    // index: scanning it on the page is what bloated every prerendered payload.
    expect(cardNav({ id: 'dom', lemma: 'dom', rank: 120 })).toEqual({
      path: '/slovo/dom',
      title: 'dom',
      label: '№120',
    })
    expect(cardNav(null)).toBeNull()
    expect(cardNav(undefined)).toBeNull()
  })

  it('links Tatoeba sentences', () => {
    expect(tatoebaUrl(348760)).toBe('https://tatoeba.org/ru/sentences/show/348760')
  })
})

describe('conjugations', () => {
  const table = (title: string, ja: string[], on: string[]): FormsTable => ({
    title,
    columns: ['Ед. ч.', 'Мн. ч.'],
    rows: [
      { label: '1-е лицо', cells: [ja, []] },
      { label: '2-е лицо', cells: [[], []] },
      { label: '3-е лицо', cells: [on, []] },
    ],
    extra: false,
  })
  const of = (ja: string, on: string, title = 'Настоящее время', skip: string[] = []) =>
    conjugations([table(title, [ja], [on])], skip).map((c) => c.number)

  it('reads the four conjugations of lesson 5.1 off «он», and IV off «я» on -em', () => {
    expect(conjugations([table('Настоящее время', ['piszę'], ['pisze'])])).toEqual([
      { number: 1, endings: '-ę, -esz' },
    ])
    expect(of('robię', 'robi')).toEqual([2])
    expect(of('tańczę', 'tańczy')).toEqual([2])
    expect(of('czytam', 'czyta')).toEqual([3])
    expect(of('wiem', 'wie')).toEqual([4])
    expect(of('jem', 'je')).toEqual([4])
  })

  it('takes a perfective or a two-aspect verb from its future table', () => {
    expect(of('powiodę', 'powiedzie', 'Простое будущее время')).toEqual([1])
    expect(of('kupię', 'kupi', 'Настоящее и будущее время')).toEqual([2])
  })

  it('reads a verb whose «я» the card skips or lacks', () => {
    expect(of('bolę', 'boli', 'Настоящее время', ['bolę'])).toEqual([2])
    expect(of('', 'brakuje')).toEqual([1])
    expect(of('', 'wynika')).toEqual([3])
  })

  it('gives every conjugation a cell of two verbs holds, minus the skipped variants', () => {
    const stac = [table('Настоящее и будущее время', ['stanę', 'stoję'], ['stanie', 'stoi'])]
    expect(conjugations(stac).map((c) => c.number)).toEqual([1, 2])
    const wykonywac = [
      table('Настоящее время', ['wykonuję', 'wykonywam'], ['wykonuje', 'wykonywa']),
    ]
    expect(conjugations(wykonywac, ['wykonywam', 'wykonywa']).map((c) => c.number)).toEqual([1])
    expect(of('pierdolę', 'pierdoli', 'Настоящее время', ['pierdoli'])).toEqual([2])
  })

  it('gives nothing for być, no present table, or a present the card skips whole', () => {
    expect(of('jestem', 'jest')).toEqual([])
    expect(of('słycham', 'słycha', 'Настоящее время', ['słycham', 'słycha'])).toEqual([])
    expect(conjugations([])).toEqual([])
    expect(of('piszę', 'pisze', 'Прошедшее время (ед. ч.)')).toEqual([])
  })

  it('labels one conjugation or several', () => {
    expect(conjugationLabel([{ number: 2, endings: '-ę, -isz/-ysz' }])).toBe(
      'II спряжение (-ę, -isz/-ysz)',
    )
    expect(
      conjugationLabel([
        { number: 1, endings: '-ę, -esz' },
        { number: 3, endings: '-am, -asz' },
      ]),
    ).toBe('I или III спряжение (-ę, -esz; -am, -asz)')
    expect(conjugationLabel([])).toBeNull()
  })
})

describe('examplesForCell', () => {
  const table = {
    title: 'Склонение',
    columns: ['Ед. ч.', 'Мн. ч.'],
    rows: [
      { label: 'Именительный', cells: [['tchórz'], ['tchórze']] },
      { label: 'Предложный', cells: [['tchórzu'], ['tchórzach']] },
      { label: 'Звательный', cells: [['tchórzu'], ['tchórze']] },
    ],
    extra: false,
  }
  const ex = (pl: string, cell?: string) => ({
    form: 'tchórzu',
    pl,
    ru: 'перевод',
    source: { kind: 'authored' as const },
    ...(cell ? { cell } : {}),
  })
  const loc = ex('O tym tchórzu mówiono.', 'Предложный')
  const voc = ex('Tchórzu, wróć!', 'Звательный')
  const loose = ex('W tym tchórzu obudziła się odwaga.')

  it('lists the rows a form fills', () => {
    expect(rowsHoldingForm(table, 'tchórzu')).toEqual(['Предложный', 'Звательный'])
    expect(rowsHoldingForm(table, 'tchórz')).toEqual(['Именительный'])
  })

  it('keeps examples tagged for another row out of the clicked cell', () => {
    expect(examplesForCell([loc, voc, loose], 'Предложный', 2)).toEqual({
      own: [loc],
      shared: [loose],
    })
    expect(examplesForCell([loc, voc, loose], 'Звательный', 2)).toEqual({
      own: [voc],
      shared: [loose],
    })
  })

  it("treats every example as the cell's own when the form fills one row", () => {
    expect(examplesForCell([loose], 'Предложный', 1)).toEqual({ own: [loose], shared: [] })
  })
})

describe('rowAliases', () => {
  const declension = (nom: string[][], voc: string[][]): FormsTable => ({
    title: 'Склонение',
    columns: ['м. р.', 'ж. р.'],
    rows: [
      { label: 'Именительный', cells: nom },
      { label: 'Родительный', cells: [['nowego'], ['nowej']] },
      { label: 'Звательный', cells: voc },
    ],
    extra: false,
  })

  it("makes an adjective's vocative an alias of its nominative", () => {
    const table = declension([['nowy'], ['nowa']], [['nowy'], ['nowa']])
    expect(rowAliases(table, 'adj')).toEqual(new Map([['Звательный', 'Именительный']]))
  })

  it('accepts a vocative that lacks the short nominative', () => {
    const table = declension([['pełen', 'pełny'], ['pełna']], [['pełny'], ['pełna']])
    expect(rowAliases(table, 'adj').get('Звательный')).toBe('Именительный')
  })

  it('leaves nouns and a vocative with forms of its own alone', () => {
    const same = declension([['okno'], ['okna']], [['okno'], ['okna']])
    expect(rowAliases(same, 'noun').size).toBe(0)
    const own = declension([['nowy'], ['nowa']], [['nowy'], ['nowo']])
    expect(rowAliases(own, 'adj').size).toBe(0)
  })
})
