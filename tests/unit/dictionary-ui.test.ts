import { describe, expect, it } from 'vitest'
import { cardNav, highlightForms, rankBand, tatoebaUrl } from '../../app/utils/dictionary'

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
