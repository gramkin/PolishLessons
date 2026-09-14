import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { buildDraft, draftFlags, renderBatchReport } from '../../scripts/dictionary/lib/draft'
import { parsePolimorfText } from '../../scripts/dictionary/lib/polimorf'
import { buildTokenIndex, readTatoeba } from '../../scripts/dictionary/lib/tatoeba'
import { readWiktionary } from '../../scripts/dictionary/lib/wiktionary'

const F = 'tests/fixtures/dictionary'
const rows = parsePolimorfText(readFileSync(`${F}/polimorf-sample.tab`, 'utf8'))
const wiki = await readWiktionary(`${F}/wiktionary-sample.jsonl`, new Set(['dom', 'mieć']))
const sentences = await readTatoeba({
  pol: `${F}/pol_sentences.tsv`,
  links: `${F}/pol-rus_links.tsv`,
  rus: `${F}/rus_sentences.tsv`,
})
const tokenIndex = buildTokenIndex(sentences)

const domEntry = {
  rank: 120,
  id: 'dom',
  lemma: 'dom',
  pos: 'noun' as const,
  estimatedCount: 1000,
  override: false,
}
const miecEntry = {
  rank: 13,
  id: 'miec',
  lemma: 'mieć',
  pos: 'verb' as const,
  estimatedCount: 90000,
  override: true,
}

describe('buildDraft', () => {
  const dom = buildDraft(domEntry, rows, wiki.get('dom') ?? [], sentences, tokenIndex)

  it('combines paradigm, Wiktionary and Tatoeba data', () => {
    expect(dom).toMatchObject({
      id: 'dom',
      lemma: 'dom',
      rank: 120,
      pos: 'noun',
      aspect: null,
      audioFile: 'Pl-dom.ogg',
    })
    expect(dom.grammarLabel).toBe('мужской род, неодушевлённый')
    expect(dom.tables[0]?.title).toBe('Склонение')
    expect(dom.wiktionary.found).toBe(true)
    expect(dom.wiktionary.senses).toHaveLength(4)
    expect(dom.candidates.map((c) => c.id).slice(0, 2)).toEqual([353931, 352381])
  })

  it('detects verb aspect from Wiktionary', () => {
    const miec = buildDraft(miecEntry, rows, wiki.get('mieć') ?? [], sentences, tokenIndex)
    expect(miec.aspect).toBe('imperf')
    expect(miec.allForms).toContain('miałem')
  })
})

describe('flags and report', () => {
  const bare = buildDraft(
    { ...domEntry, id: 'xyz', lemma: 'xyz', override: true },
    rows,
    [],
    [],
    new Map(),
  )

  it('flags missing data', () => {
    expect(draftFlags(bare)).toEqual([
      'нет Wiktionary',
      'нет русского перевода',
      'мало примеров (0)',
      'ручная правка',
    ])
  })

  it('renders a markdown report with a row per word and an owner checklist', () => {
    const dom = buildDraft(domEntry, rows, wiki.get('dom') ?? [], sentences, tokenIndex)
    const report = renderBatchReport('pilot', [dom, bare])
    expect(report).toContain('# Батч pilot')
    expect(report).toContain('| 120 | dom | noun | 8 (5) | — |')
    expect(report).toContain(
      '| 120 | xyz | noun | 0 (0) | нет Wiktionary; нет русского перевода; мало примеров (0); ручная правка |',
    )
    expect(report).toContain('- [ ] Список слов проверен')
  })
})
