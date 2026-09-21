import { describe, expect, it } from 'vitest'
import { applyStatuses, summarize, type CardStatus } from '../../scripts/dictionary/lib/status'
import type { RankedLemma } from '../../scripts/dictionary/lib/rank'
import { CARD_FORMAT } from '../../shared/dictionary'

const ranked = [
  { rank: 1, id: 'on', lemma: 'on', pos: 'pron', estimatedCount: 10, override: false },
  { rank: 2, id: 'byc', lemma: 'być', pos: 'verb', estimatedCount: 9, override: false },
  { rank: 3, id: 'dom', lemma: 'dom', pos: 'noun', estimatedCount: 8, override: false },
] satisfies RankedLemma[]

const card = (format: number, depth: CardStatus['depth'] = 'standard'): CardStatus => ({
  format,
  depth,
})

describe('dictionary status', () => {
  it('stamps every lemma with its card format and depth, or null without a card', () => {
    const stamped = applyStatuses(ranked, new Map([['on', card(CARD_FORMAT, 'deep')]]))
    expect(stamped.map((e) => e.format)).toEqual([CARD_FORMAT, null, null])
    expect(stamped.map((e) => e.depth)).toEqual(['deep', null, null])
    expect(stamped[0]!.lemma).toBe('on')
  })

  it('separates current cards from ones that need an upgrade and lists the deep ones', () => {
    const statuses = new Map([
      ['on', card(CARD_FORMAT, 'deep')],
      ['dom', card(1)],
      ['zrobic', card(CARD_FORMAT)],
    ])
    const s = summarize(applyStatuses(ranked, statuses), statuses)
    expect(s).toEqual({
      total: 3,
      withCards: 2,
      current: 1,
      deep: ['on'],
      stale: [{ id: 'dom', format: 1 }],
      missing: ['byc'],
      orphans: ['zrobic'],
    })
  })
})
