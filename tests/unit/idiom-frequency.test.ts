import { describe, expect, it } from 'vitest'
import {
  acceptedForms,
  compile,
  IdiomCounter,
  idiomTokens,
  type Lexicon,
} from '../../scripts/lib/idiom-frequency'

const LEMMAS: Record<string, { forms: string[]; head: string }> = {
  trzymać: { forms: ['trzymać', 'trzymam', 'trzymaj', 'trzymał'], head: 'inf' },
  kciuk: { forms: ['kciuk', 'kciuki', 'kciuków'], head: 'subst' },
  ja: { forms: ['ja', 'mi', 'mnie'], head: 'ppron12' },
  on: { forms: ['on', 'ona', 'one', 'oni'], head: 'ppron3' },
  przyjaciel: { forms: ['przyjaciel', 'przyjaciela'], head: 'subst' },
}
const lexicon: Lexicon = {
  readings: (form) =>
    Object.entries(LEMMAS)
      .filter(([, l]) => l.forms.includes(form))
      .map(([lemma, l]) => ({ lemma, head: l.head })),
  forms: (lemma) => LEMMAS[lemma]?.forms ?? [],
}

describe('idiomTokens', () => {
  it('drops punctuation and a trailing gap, and keeps an inner one', () => {
    expect(idiomTokens('z tą różnicą, że...')).toEqual(['z', 'tą', 'różnicą', 'że'])
    expect(idiomTokens('równie … jak')).toEqual(['równie', null, 'jak'])
    expect(idiomTokens('Przestań!')).toEqual(['przestań'])
  })
})

describe('acceptedForms', () => {
  it('inflects content words and keeps pronouns exact', () => {
    expect(acceptedForms('kciuki', lexicon)).toEqual(new Set(['kciuki', 'kciuk', 'kciuków']))
    expect(acceptedForms('mi', lexicon)).toEqual(new Set(['mi']))
    expect(acceptedForms('oni', lexicon)).toEqual(new Set(['oni']))
  })

  it('keeps a one-word entry exact', () => {
    expect(compile('przyjaciel', lexicon)).toEqual([new Set(['przyjaciel'])])
  })
})

describe('IdiomCounter', () => {
  it('counts lines that contain an idiom in any form, once per line', () => {
    const counter = new IdiomCounter([
      compile('trzymać kciuki', lexicon)!,
      compile('równie … jak', lexicon)!,
    ])
    counter.add('Trzymam kciuki, naprawdę trzymam kciuki!')
    counter.add('Trzymaj za mnie kciuki.')
    counter.add('Jest równie mądry jak brat.')
    expect(counter.counts).toEqual([1, 1])
    expect(counter.lines).toBe(3)
    expect(counter.tokens).toBe(14)
  })
})
