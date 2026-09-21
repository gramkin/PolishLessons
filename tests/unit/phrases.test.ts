import { describe, expect, it } from 'vitest'
import { phraseId, toPhrase } from '../../app/utils/phrases'

const tatoeba = {
  pl: 'Zrobię to.',
  ru: 'Я сделаю это.',
  source: { kind: 'tatoeba' as const, id: 544544 },
}
const authored = {
  pl: 'Robi się zimno.',
  ru: 'Становится холодно.',
  source: { kind: 'authored' as const },
}

describe('phraseId', () => {
  it('uses the Tatoeba id when there is one', () => {
    expect(phraseId(tatoeba)).toBe('t544544')
    expect(phraseId({ ...tatoeba, source: { kind: 'translated', id: 7610584 } })).toBe('t7610584')
  })

  it('hashes the Polish text for authored sentences, stably', () => {
    const id = phraseId(authored)
    expect(id).toMatch(/^a[0-9a-f]{8}$/)
    expect(phraseId({ ...authored, ru: 'другой перевод' })).toBe(id)
    expect(phraseId({ ...authored, pl: 'Robi się ciepło.' })).not.toBe(id)
  })
})

describe('toPhrase', () => {
  it('builds a phrase due today in box 1', () => {
    const now = new Date(2026, 8, 21, 12, 0)
    expect(toPhrase(tatoeba, { from: 'zrobic', form: 'zrobię', now })).toEqual({
      id: 't544544',
      pl: 'Zrobię to.',
      ru: 'Я сделаю это.',
      from: 'zrobic',
      form: 'zrobię',
      box: 1,
      due: '2026-09-21',
      added: '2026-09-21',
    })
  })

  it('keeps form null when the sentence comes from a meaning', () => {
    expect(
      toPhrase(authored, { from: 'robic', form: null, now: new Date(2026, 8, 21) }).form,
    ).toBeNull()
  })
})
