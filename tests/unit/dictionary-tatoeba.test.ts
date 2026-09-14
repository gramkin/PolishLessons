import { describe, expect, it } from 'vitest'
import {
  buildTokenIndex,
  matchedForms,
  pickCandidates,
  readTatoeba,
  tokenize,
} from '../../scripts/dictionary/lib/tatoeba'

const F = 'tests/fixtures/dictionary'
const sentences = await readTatoeba({
  pol: `${F}/pol_sentences.tsv`,
  links: `${F}/pol-rus_links.tsv`,
  rus: `${F}/rus_sentences.tsv`,
})
const DOM_FORMS = ['dom', 'domach', 'domami', 'domem', 'domom', 'domowi', 'domów', 'domu', 'domy']

describe('readTatoeba', () => {
  it('joins Polish sentences with their first Russian translation', () => {
    expect(sentences).toHaveLength(15)
    expect(sentences.find((s) => s.id === 348760)).toEqual({
      id: 348760,
      pl: 'Mój dom jest duży.',
      ru: 'Мой дом большой.',
    })
    expect(sentences.find((s) => s.id === 348626)?.ru).toBeNull()
  })
})

describe('tokens and matching', () => {
  it('tokenizes letters only, lowercased', () => {
    expect(tokenize('W tym domu jest 6 pokoi.')).toEqual(['w', 'tym', 'domu', 'jest', 'pokoi'])
  })

  it('matches forms including agglutinated endings', () => {
    expect(matchedForms(['miałem', 'dom'], new Set(['miał', 'dom']))).toEqual(['miał', 'dom'])
  })
})

describe('pickCandidates', () => {
  const index = buildTokenIndex(sentences)

  it('prefers translated, short sentences that cover new forms', () => {
    expect(pickCandidates(sentences, index, DOM_FORMS, 5).map((s) => s.id)).toEqual([
      353931, 352381, 348760, 348629, 355239,
    ])
  })

  it('falls back to Polish-only sentences', () => {
    const picked = pickCandidates(sentences, index, DOM_FORMS, 30)
    expect(picked).toHaveLength(8)
    expect(picked.slice(-3).every((s) => s.ru === null)).toBe(true)
  })
})
