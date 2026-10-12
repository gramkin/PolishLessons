import { describe, expect, it } from 'vitest'
import type { FormsTable } from '../../shared/dictionary'
import {
  cardNav,
  conjugationLabel,
  conjugations,
  highlightForms,
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
  const table = (title: string, ja: string[], ty: string[]): FormsTable => ({
    title,
    columns: ['Ед. ч.', 'Мн. ч.'],
    rows: [
      { label: '1-е лицо', cells: [ja, []] },
      { label: '2-е лицо', cells: [ty, []] },
    ],
    extra: false,
  })
  const of = (ja: string, ty: string, title = 'Настоящее время') =>
    conjugations([table(title, [ja], [ty])]).map((c) => c.number)

  it('reads the four conjugations of lesson 5.1 off «я» and «ты»', () => {
    expect(conjugations([table('Настоящее время', ['piszę'], ['piszesz'])])).toEqual([
      { number: 1, endings: '-ę, -esz' },
    ])
    expect(of('robię', 'robisz')).toEqual([2])
    expect(of('tańczę', 'tańczysz')).toEqual([2])
    expect(of('czytam', 'czytasz')).toEqual([3])
    expect(of('wiem', 'wiesz')).toEqual([4])
    expect(of('jem', 'jesz')).toEqual([4])
  })

  it('takes a perfective or a two-aspect verb from its future table', () => {
    expect(of('powiodę', 'powiedziesz', 'Простое будущее время')).toEqual([1])
    expect(of('kupię', 'kupisz', 'Настоящее и будущее время')).toEqual([2])
  })

  it('gives every conjugation a cell of two verbs holds, minus the skipped forms', () => {
    const stac = [table('Настоящее и будущее время', ['stanę', 'stoję'], ['staniesz', 'stoisz'])]
    expect(conjugations(stac).map((c) => c.number)).toEqual([1, 2])
    const bolec = [table('Настоящее время', ['boleję', 'bolę'], ['bolejesz', 'bolisz'])]
    expect(conjugations(bolec, ['bolę', 'bolisz']).map((c) => c.number)).toEqual([1])
    const smakowac = [table('Настоящее время', ['smakuję'], ['smakujesz'])]
    expect(conjugations(smakowac, ['smakuję']).map((c) => c.number)).toEqual([1])
  })

  it('reads a verb used only in the third person off «он»', () => {
    const third = (on: string): FormsTable[] => [
      {
        title: 'Настоящее время',
        columns: ['Ед. ч.', 'Мн. ч.'],
        rows: [
          { label: '1-е лицо', cells: [[], []] },
          { label: '2-е лицо', cells: [[], []] },
          { label: '3-е лицо', cells: [[on], []] },
        ],
        extra: false,
      },
    ]
    expect(conjugations(third('brakuje')).map((c) => c.number)).toEqual([1])
    expect(conjugations(third('dotyczy')).map((c) => c.number)).toEqual([2])
    expect(conjugations(third('wynika')).map((c) => c.number)).toEqual([3])
    expect(conjugations(third('jest'))).toEqual([])
  })

  it('gives nothing for być, no present table, or a present the card skips whole', () => {
    expect(of('jestem', 'jesteś')).toEqual([])
    const slychac = [table('Настоящее время', ['słycham'], ['słychasz'])]
    expect(conjugations(slychac, ['słycham', 'słychasz'])).toEqual([])
    expect(conjugations([])).toEqual([])
    expect(of('piszę', 'piszesz', 'Прошедшее время (ед. ч.)')).toEqual([])
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
