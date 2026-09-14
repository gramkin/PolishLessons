import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  expandTag,
  parsePolimorfLine,
  parsePolimorfText,
  readPolimorf,
  tagHead,
} from '../../scripts/dictionary/lib/polimorf'
import { posForHeads, posOfHead } from '../../scripts/dictionary/lib/pos'

const FIXTURE = 'tests/fixtures/dictionary/polimorf-sample.tab'

describe('PoliMorf parsing', () => {
  it('parses a line', () => {
    expect(parsePolimorfLine('domu\tdom\tsubst:sg:gen:m3\tpospolita')).toEqual({
      form: 'domu',
      lemma: 'dom',
      tag: 'subst:sg:gen:m3',
    })
    expect(parsePolimorfLine('broken')).toBeNull()
  })

  it('expands merged tag slots', () => {
    expect(expandTag('subst:pl:acc.inst:m3')).toEqual([
      ['subst', 'pl', 'acc', 'm3'],
      ['subst', 'pl', 'inst', 'm3'],
    ])
    expect(expandTag('praet:sg:m1.m2.m3:imperf')).toHaveLength(3)
    expect(tagHead('fin:sg:pri:imperf')).toBe('fin')
  })

  it('reads and filters the fixture', async () => {
    const rows = await readPolimorf(FIXTURE, (row) => row.lemma === 'dom')
    expect(rows).toHaveLength(14)
    expect(
      parsePolimorfText(readFileSync(FIXTURE, 'utf8')).filter((r) => r.lemma === 'w'),
    ).toHaveLength(4)
  })
})

describe('part of speech', () => {
  it('maps tag heads', () => {
    expect(posOfHead('subst')).toBe('noun')
    expect(posOfHead('praet')).toBe('verb')
    expect(posOfHead('ppron3')).toBe('pron')
    expect(posOfHead('qub')).toBe('part')
    expect(posOfHead('xyz')).toBeNull()
  })

  it('picks the heaviest part of speech', () => {
    expect(
      posForHeads(
        new Map([
          ['subst', 28],
          ['adj', 69],
          ['adja', 1],
        ]),
      ),
    ).toBe('adj')
    expect(
      posForHeads(
        new Map([
          ['ppron3', 46],
          ['adj', 23],
        ]),
      ),
    ).toBe('pron')
    expect(posForHeads(new Map())).toBe('part')
  })
})
