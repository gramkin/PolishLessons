import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import type { RankedLemma } from '../lib/rank'
import { stableJson } from '../lib/build'
import { buildDraft, renderBatchReport } from '../lib/draft'
import { DATA, SOURCES } from '../lib/paths'
import { readAllRegistries } from '../lib/registry'
import { readPolimorf } from '../lib/polimorf'
import { buildTokenIndex, readTatoeba } from '../lib/tatoeba'
import { readWiktionary } from '../lib/wiktionary'

const BATCH_SIZE = 200
const args = process.argv.slice(2)
const argValue = (name: string) => {
  const i = args.indexOf(name)
  return i >= 0 ? args[i + 1] : undefined
}

const ranked = readAllRegistries()
const batch = argValue('--batch')
const ids = argValue('--ids')

let selected: RankedLemma[]
let label: string
if (ids) {
  const wanted = new Set(ids.split(','))
  selected = ranked.filter((r) => wanted.has(r.id))
  const missing = [...wanted].filter((id) => !selected.some((r) => r.id === id))
  if (missing.length > 0) throw new Error(`ids not in data/ranked.json: ${missing.join(', ')}`)
  label = 'pilot'
} else if (batch) {
  const n = Number(batch)
  selected = ranked.filter((r) => r.rank > (n - 1) * BATCH_SIZE && r.rank <= n * BATCH_SIZE)
  label = `batch-${String(n).padStart(2, '0')}`
} else {
  throw new Error('usage: pnpm dict:draft --batch N | --ids a,b,c')
}

const lemmas = new Set(selected.map((r) => r.lemma))
console.log(`… ${label}: ${selected.length} lemmas`)
const rows = await readPolimorf(SOURCES.polimorf, (row) => lemmas.has(row.lemma))
const wiki = await readWiktionary(SOURCES.wiktionary, lemmas)
const sentences = await readTatoeba({
  pol: SOURCES.tatoebaPol,
  links: SOURCES.tatoebaLinks,
  rus: SOURCES.tatoebaRus,
})
const tokenIndex = buildTokenIndex(sentences)

mkdirSync(DATA.drafts, { recursive: true })
mkdirSync(DATA.batches, { recursive: true })
const drafts = selected.map((entry) => {
  const draft = buildDraft(entry, rows, wiki.get(entry.lemma) ?? [], sentences, tokenIndex)
  writeFileSync(join(DATA.drafts, `${entry.id}.json`), stableJson(draft))
  return draft
})
writeFileSync(join(DATA.batches, `${label}.md`), renderBatchReport(label, drafts))
console.log(`✓ ${drafts.length} drafts in ${DATA.drafts}, report ${DATA.batches}/${label}.md`)
