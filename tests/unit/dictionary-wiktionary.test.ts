import { describe, expect, it } from 'vitest'
import {
  aspectOf,
  chooseAudio,
  mergeEntries,
  readWiktionary,
  selectEntries,
} from '../../scripts/dictionary/lib/wiktionary'

const FIXTURE = 'tests/fixtures/dictionary/wiktionary-sample.jsonl'
const entries = await readWiktionary(
  FIXTURE,
  new Set(['dom', 'mieć', 'robić', 'zrobić', 'dobry', 'w', 'dwa']),
)

describe('readWiktionary', () => {
  it('reads Polish entries for the requested words only', () => {
    expect([...entries.keys()].sort()).toEqual([
      'dobry',
      'dom',
      'dwa',
      'mieć',
      'robić',
      'w',
      'zrobić',
    ])
    expect(entries.get('dom')).toHaveLength(1)
  })

  it('parses senses, examples, Russian translations and forms', () => {
    const dom = mergeEntries(selectEntries(entries.get('dom')!, 'noun'))
    expect(dom.senses).toHaveLength(4)
    expect(dom.senses[0]).toMatchObject({ index: '1.1', glosses: ['oddzielny budynek mieszkalny'] })
    expect(dom.senses[0]!.examples).toContain('W mieście wyrosło wiele nowych domów.')
    expect(dom.translationsRu).toContainEqual({ word: 'дом', senseIndex: '1.1' })
    expect(dom.forms.find((f) => f.form === 'domów')?.tags).toEqual(['genitive', 'plural'])
    expect(dom.ipa).not.toBeNull()
  })
})

describe('entry selection', () => {
  it('filters by part of speech with fallbacks', () => {
    expect(selectEntries(entries.get('dobry')!, 'adj').map((e) => e.pos)).toEqual(['adj'])
    expect(selectEntries(entries.get('dwa')!, 'num').length).toBeGreaterThan(0)
    expect(selectEntries(entries.get('w')!, 'prep').map((e) => e.pos)).toEqual(['prep'])
  })

  it('merges several entries with prefixed sense indexes', () => {
    const robić = mergeEntries(selectEntries(entries.get('robić')!, 'verb'))
    expect(robić.senses.length).toBeGreaterThan(4)
    expect(robić.senses[0]!.index.startsWith('1:')).toBe(true)
  })

  it('detects aspect and chooses the matching audio file', () => {
    expect(aspectOf(selectEntries(entries.get('robić')!, 'verb'))).toBe('imperf')
    expect(aspectOf(selectEntries(entries.get('zrobić')!, 'verb'))).toBe('perf')
    expect(aspectOf(selectEntries(entries.get('dom')!, 'noun'))).toBeNull()
    expect(chooseAudio(entries.get('mieć')!, 'mieć')).toBe('Pl-mieć.ogg')
    expect(chooseAudio(entries.get('dom')!, 'dom')).toBe('Pl-dom.ogg')
  })
})
