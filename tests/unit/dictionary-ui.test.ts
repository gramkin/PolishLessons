import { describe, expect, it } from 'vitest'
import { highlightForms, rankBand, rankNeighbours, tatoebaUrl } from '../../app/utils/dictionary'

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

  it('finds neighbours among existing cards', () => {
    const index = [
      { id: 'w', lemma: 'w', rank: 5, pos: 'prep' as const, gloss: 'в' },
      { id: 'miec', lemma: 'mieć', rank: 13, pos: 'verb' as const, gloss: 'иметь' },
      { id: 'dom', lemma: 'dom', rank: 120, pos: 'noun' as const, gloss: 'дом' },
    ]
    expect(rankNeighbours(index, 13)).toEqual({
      prev: { path: '/slovo/w', title: 'w', label: '№5' },
      next: { path: '/slovo/dom', title: 'dom', label: '№120' },
    })
    expect(rankNeighbours(index, 5).prev).toBeNull()
    expect(rankNeighbours(index, 120).next).toBeNull()
  })

  it('links Tatoeba sentences', () => {
    expect(tatoebaUrl(348760)).toBe('https://tatoeba.org/ru/sentences/show/348760')
  })
})
