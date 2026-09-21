import { describe, expect, it } from 'vitest'
import { applyFormats, summarize } from '../../scripts/dictionary/lib/status'
import type { RankedLemma } from '../../scripts/dictionary/lib/rank'
import { CARD_FORMAT } from '../../shared/dictionary'

const ranked = [
  { rank: 1, id: 'on', lemma: 'on', pos: 'pron', estimatedCount: 10, override: false },
  { rank: 2, id: 'byc', lemma: 'być', pos: 'verb', estimatedCount: 9, override: false },
  { rank: 3, id: 'dom', lemma: 'dom', pos: 'noun', estimatedCount: 8, override: false },
] satisfies RankedLemma[]

describe('dictionary status', () => {
  it('stamps every lemma with its card format, or null without a card', () => {
    const stamped = applyFormats(ranked, new Map([['on', CARD_FORMAT]]))
    expect(stamped.map((e) => e.format)).toEqual([CARD_FORMAT, null, null])
    expect(stamped[0]!.lemma).toBe('on')
  })

  it('separates current cards from ones that need an upgrade', () => {
    const formats = new Map([
      ['on', CARD_FORMAT],
      ['dom', 1],
      ['zrobic', CARD_FORMAT],
    ])
    const s = summarize(applyFormats(ranked, formats), formats)
    expect(s).toEqual({
      total: 3,
      withCards: 2,
      current: 1,
      stale: [{ id: 'dom', format: 1 }],
      missing: ['byc'],
      orphans: ['zrobic'],
    })
  })
})
