import { describe, expect, it } from 'vitest'
import { findGroup, highlightGroup } from '../../app/utils/pattern'

describe('findGroup', () => {
  it('finds a group case-insensitively', () => {
    expect(findGroup('Rzeka', 'rz')).toBe(0)
    expect(findGroup('голова', 'оло')).toBe(1)
  })

  it('returns -1 when absent', () => {
    expect(findGroup('reka', 'rz')).toBe(-1)
  })
})

describe('highlightGroup', () => {
  it('highlights a leading group', () => {
    expect(highlightGroup('rzeka', 'rz')).toEqual([
      { text: 'rz', hl: true },
      { text: 'eka', hl: false },
    ])
  })

  it('highlights a middle group and preserves casing', () => {
    expect(highlightGroup('GŁOWA', 'ło')).toEqual([
      { text: 'G', hl: false },
      { text: 'ŁO', hl: true },
      { text: 'WA', hl: false },
    ])
  })

  it('highlights a trailing group', () => {
    expect(highlightGroup('radość', 'ść')).toEqual([
      { text: 'rado', hl: false },
      { text: 'ść', hl: true },
    ])
  })

  it('returns the whole word unhighlighted when the group is absent', () => {
    expect(highlightGroup('dom', 'rz')).toEqual([{ text: 'dom', hl: false }])
  })
})
