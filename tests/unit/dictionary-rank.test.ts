import { describe, expect, it } from 'vitest'
import type { MorphRow } from '../../scripts/dictionary/lib/polimorf'
import {
  buildFormIndex,
  lemmaCandidates,
  parseFrequencyList,
  parseOverrides,
  rankLemmas,
} from '../../scripts/dictionary/lib/rank'

const rows: MorphRow[] = [
  { form: 'ma', lemma: 'mieć', tag: 'fin:sg:ter:imperf' },
  { form: 'mam', lemma: 'mieć', tag: 'fin:sg:pri:imperf' },
  { form: 'mieć', lemma: 'mieć', tag: 'inf:imperf' },
  { form: 'mam', lemma: 'mama', tag: 'subst:pl:gen:f' },
  { form: 'mama', lemma: 'mama', tag: 'subst:sg:nom:f' },
  { form: 'mam', lemma: 'mamić', tag: 'impt:sg:sec:imperf' },
  { form: 'był', lemma: 'być', tag: 'praet:sg:m1.m2.m3:imperf' },
  { form: 'taka', lemma: 'taka', tag: 'subst:sg:nom:f' },
  { form: 'taka', lemma: 'taki', tag: 'adj:sg:nom.voc:f:pos' },
  { form: 'taki', lemma: 'taki', tag: 'adj:sg:nom.voc:m1.m2.m3:pos' },
  { form: 'ale', lemma: 'ale', tag: 'conj' },
  { form: 'ale', lemma: 'Ala', tag: 'subst:pl:nom:f' },
]

const freqText = [
  'ma 1000',
  'mam 800',
  'ale 500',
  'taka 300',
  'taki 200',
  'mama 100',
  'byłem 50',
  'sobie 40',
].join('\n')

const overrides = parseOverrides(`
forms:
  taka: taki
add:
  - { lemma: siebie, pos: pron, forms: [sobie] }
exclude: [mamić]
excludeNotes:
  mamić: { why: not-a-lemma }
pos: {}
`)

describe('parseOverrides', () => {
  it('reads exclusion notes, defaulting to an empty map', () => {
    expect(overrides.excludeNotes).toEqual({ mamić: { why: 'not-a-lemma' } })
    expect(parseOverrides('exclude: [x]').excludeNotes).toEqual({})
  })
})

describe('form index', () => {
  const index = buildFormIndex(rows)

  it('finds candidates, stripping agglutinated endings', () => {
    expect([...lemmaCandidates(index, 'mam')].sort()).toEqual(['mama', 'mamić', 'mieć'])
    expect([...lemmaCandidates(index, 'byłem')]).toEqual(['być'])
    expect(lemmaCandidates(index, 'xyz').size).toBe(0)
  })

  it('counts tag heads per lemma', () => {
    expect(index.lemmaHeads.get('taki')?.get('adj')).toBe(2)
  })
})

describe('rankLemmas', () => {
  const ranked = rankLemmas(parseFrequencyList(freqText, 100), buildFormIndex(rows), overrides, {
    iterations: 5,
    limit: 10,
    reserved: new Map([['mieć', 'miec']]),
  })
  const lemmas = ranked.map((r) => r.lemma)

  it('ranks by estimated count and assigns ids and pos', () => {
    expect(ranked[0]).toMatchObject({
      rank: 1,
      lemma: 'mieć',
      id: 'miec',
      pos: 'verb',
      override: false,
    })
    expect(ranked.find((r) => r.lemma === 'taki')).toMatchObject({ pos: 'adj', override: true })
  })

  it('applies overrides, exclusions and lowercase preference', () => {
    expect(lemmas).toContain('siebie')
    expect(lemmas).toContain('być')
    expect(lemmas).not.toContain('mamić')
    expect(lemmas).not.toContain('taka')
    expect(lemmas).not.toContain('Ala')
  })

  it('gives most of an ambiguous form to the more frequent lemma', () => {
    const mieć = ranked.find((r) => r.lemma === 'mieć')!
    const mama = ranked.find((r) => r.lemma === 'mama')!
    expect(mieć.estimatedCount).toBeGreaterThan(1500)
    expect(mama.estimatedCount).toBeLessThan(400)
  })
})
