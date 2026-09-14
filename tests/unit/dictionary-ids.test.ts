import { describe, expect, it } from 'vitest'
import { assignId, transliterateId } from '../../scripts/dictionary/lib/ids'

describe('ids', () => {
  it('transliterates Polish letters', () => {
    expect(transliterateId('mieć')).toBe('miec')
    expect(transliterateId('Żółw')).toBe('zolw')
    expect(transliterateId('dzień dobry')).toBe('dzien-dobry')
  })

  it('reuses lesson ids and deduplicates', () => {
    const reserved = new Map([['część', 'czesc-noun']])
    const taken = new Set<string>()
    expect(assignId('część', reserved, taken)).toBe('czesc-noun')
    expect(assignId('mama', reserved, taken)).toBe('mama')
    expect(assignId('mama', reserved, taken)).toBe('mama-2')
  })
})
