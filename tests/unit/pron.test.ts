import { describe, expect, it } from 'vitest'
import { shouldShowPron } from '../../app/utils/pron'

describe('shouldShowPron', () => {
  it('always and never override the chapter', () => {
    expect(shouldShowPron('always', 9)).toBe(true)
    expect(shouldShowPron('never', 1)).toBe(false)
  })

  it('auto shows in chapters 1–3 and outside lessons', () => {
    expect(shouldShowPron('auto', 3)).toBe(true)
    expect(shouldShowPron('auto', 4)).toBe(false)
    expect(shouldShowPron('auto', null)).toBe(true)
  })
})
