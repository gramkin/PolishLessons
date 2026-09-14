import { describe, expect, it } from 'vitest'
import { storySlug, tokenizeSentence } from '../../app/utils/story'

function joined(tokens: { text: string }[]): string {
  return tokens.map((t) => t.text).join('')
}

describe('tokenizeSentence', () => {
  it('returns one plain token without forms', () => {
    expect(tokenizeSentence('Kot śpi.')).toEqual([{ text: 'Kot śpi.', wordId: null }])
  })

  it('marks mapped forms and keeps punctuation', () => {
    const tokens = tokenizeSentence('Kot mieszka nad rzeką.', { rzeką: 'rzeka', Kot: 'kot' })
    expect(tokens).toEqual([
      { text: 'Kot', wordId: 'kot' },
      { text: ' mieszka nad ', wordId: null },
      { text: 'rzeką', wordId: 'rzeka' },
      { text: '.', wordId: null },
    ])
  })

  it('only matches whole words', () => {
    const tokens = tokenizeSentence('Kotek i kot.', { kot: 'kot' })
    expect(tokens.filter((t) => t.wordId)).toEqual([{ text: 'kot', wordId: 'kot' }])
    expect(joined(tokens)).toBe('Kotek i kot.')
  })

  it('marks every occurrence', () => {
    const tokens = tokenizeSentence('dom i dom', { dom: 'dom' })
    expect(tokens.filter((t) => t.wordId)).toHaveLength(2)
  })

  it('prefers longer multi-word forms on overlap', () => {
    const tokens = tokenizeSentence('Dzień dobry, pani!', {
      'Dzień dobry': 'dzien-dobry',
      dobry: 'dobry',
    })
    expect(tokens.filter((t) => t.wordId)).toEqual([{ text: 'Dzień dobry', wordId: 'dzien-dobry' }])
    expect(joined(tokens)).toBe('Dzień dobry, pani!')
  })
})

describe('storySlug', () => {
  it('returns the last path segment', () => {
    expect(storySlug('stories/kot-i-mysz')).toBe('kot-i-mysz')
  })
})
